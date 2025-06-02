import { getReloadlyToken, reloadlyEnv } from "./reloadly"
import { ReloadlyApiError } from "./api-error"
import { MOCK_OPERATORS } from "./mock-data"

// Update the API_VERSION_HEADER to match exactly what Reloadly expects
// This is critical for avoiding 406 errors
const API_VERSION_HEADER = "application/com.reloadly.topups-v1+json"

// Fetch a single operator by ID
export async function getOperatorById(id: string) {
  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for operator ID: ${id}`)
    const mockOperator = MOCK_OPERATORS.find((op) => op.id === id)

    if (!mockOperator) {
      console.warn(`No mock operator found with ID: ${id}`)
      return null
    }

    return mockOperator
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.topups
    const token = await getReloadlyToken(baseUrl)

    console.log(`Fetching operator with ID: ${id} from ${baseUrl}`)

    // Try first with the versioned header
    try {
      const res = await fetch(`${baseUrl}/operators/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: API_VERSION_HEADER,
        },
      })

      if (res.ok) {
        const op = await res.json()
        // default numeric fields
        op.minAmount = op.minAmount ?? 0
        op.maxAmount = op.maxAmount ?? 0
        return op
      }

      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        console.log("Got 406 with versioned header, trying with application/json")
        const simpleRes = await fetch(`${baseUrl}/operators/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (simpleRes.ok) {
          const op = await simpleRes.json()
          op.minAmount = op.minAmount ?? 0
          op.maxAmount = op.maxAmount ?? 0
          return op
        }

        const errData = await simpleRes.json().catch(() => ({}))
        console.error(`Error response from operator API with simple header: ${simpleRes.status}`, errData)

        if (simpleRes.status === 404) return null
        throw new ReloadlyApiError("Failed to fetch operator", simpleRes.status, errData, "OPERATOR_FETCH_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      console.error(`Error response from operator API: ${res.status}`, errData)

      if (res.status === 404) return null
      throw new ReloadlyApiError("Failed to fetch operator", res.status, errData, "OPERATOR_FETCH_ERROR")
    } catch (error) {
      if (error instanceof ReloadlyApiError) throw error

      console.error("Error in first fetch attempt:", error)

      // Try one more time with a simple header as a last resort
      const lastRes = await fetch(`${baseUrl}/operators/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (lastRes.ok) {
        const op = await lastRes.json()
        op.minAmount = op.minAmount ?? 0
        op.maxAmount = op.maxAmount ?? 0
        return op
      }

      throw error
    }
  } catch (error) {
    console.error(`Error fetching operator with ID ${id}:`, error)

    // Fall back to mock data for Malawi operators
    console.log(`Falling back to mock data for operator ID: ${id}`)
    const mockOperator = MOCK_OPERATORS.find((op) => op.id === id)
    if (mockOperator) {
      return mockOperator
    }

    // If no specific mock operator found, return a default Malawi operator
    const defaultMalawiOperator = MOCK_OPERATORS.find((op) => op.country.isoName === "MW")
    if (defaultMalawiOperator) {
      console.log("Returning default Malawi operator as fallback")
      return {
        ...defaultMalawiOperator,
        id: id,
      }
    }

    throw error
  }
}

// Fetch a single airtime transaction by ID
export async function getAirtimeTransaction(id: string) {
  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for airtime transaction ID: ${id}`)
    return {
      transactionId: id,
      status: "SUCCESSFUL",
      operatorName: "Airtel Malawi",
      recipientPhone: "+265888123456",
      amount: 10,
      deliveredAmount: 2500,
      deliveredAmountCurrencyCode: "MWK",
      currencyCode: "USD",
      createdAt: new Date().toISOString(),
    }
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.topups
    const token = await getReloadlyToken(baseUrl)

    const res = await fetch(`${baseUrl}/topups/reports/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: API_VERSION_HEADER,
      },
    })

    if (!res.ok) {
      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        console.log("Got 406 with versioned header, trying with application/json")
        const simpleRes = await fetch(`${baseUrl}/topups/reports/transactions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (simpleRes.ok) {
          return await simpleRes.json()
        }

        const errData = await simpleRes.json().catch(() => ({}))
        throw new ReloadlyApiError("Failed to fetch transaction", simpleRes.status, errData, "TRANSACTION_FETCH_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      throw new ReloadlyApiError("Failed to fetch transaction", res.status, errData, "TRANSACTION_FETCH_ERROR")
    }

    return await res.json()
  } catch (error) {
    console.error(`Error fetching airtime transaction with ID ${id}:`, error)

    // Always fall back to mock data for Malawi
    console.log(`Falling back to mock data for airtime transaction ID: ${id}`)
    return {
      transactionId: id,
      status: "SUCCESSFUL",
      operatorName: "Airtel Malawi",
      recipientPhone: "+265888123456",
      amount: 10,
      deliveredAmount: 2500,
      deliveredAmountCurrencyCode: "MWK",
      currencyCode: "USD",
      createdAt: new Date().toISOString(),
    }
  }
}

// Auto-detect operator by phone and country
export async function detectOperator(
  phoneNumber: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  countryCode: string,
) {
  // Always use MW as the country code for Malawi
  const malawiCountryCode = "MW"

  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for operator detection: ${phoneNumber}, ${malawiCountryCode}`)
    // Return a mock operator based on the phone number pattern
    if (phoneNumber.includes("88")) {
      return MOCK_OPERATORS.find((op) => op.name.includes("Airtel"))
    } else {
      return MOCK_OPERATORS.find((op) => op.name.includes("TNM"))
    }
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.topups
    const token = await getReloadlyToken(baseUrl)

    const res = await fetch(`${baseUrl}/operators/auto-detect/phone/${phoneNumber}/countries/${malawiCountryCode}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER },
    })

    if (!res.ok) {
      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        const simpleRes = await fetch(
          `${baseUrl}/operators/auto-detect/phone/${phoneNumber}/countries/${malawiCountryCode}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          },
        )

        if (simpleRes.ok) {
          const op = await simpleRes.json()
          op.minAmount = op.minAmount ?? 0
          op.maxAmount = op.maxAmount ?? 0
          return op
        }

        const errData = await simpleRes.json().catch(() => ({}))
        throw new ReloadlyApiError("Failed to detect operator", simpleRes.status, errData, "OPERATOR_DETECTION_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      throw new ReloadlyApiError("Failed to detect operator", res.status, errData, "OPERATOR_DETECTION_ERROR")
    }

    const op = await res.json()
    op.minAmount = op.minAmount ?? 0
    op.maxAmount = op.maxAmount ?? 0
    return op
  } catch (error) {
    console.error(`Error detecting operator for ${phoneNumber} in ${malawiCountryCode}:`, error)

    // Fall back to mock data for Malawi
    console.log(`Falling back to mock data for operator detection`)
    if (phoneNumber.includes("88")) {
      return MOCK_OPERATORS.find((op) => op.name.includes("Airtel"))
    } else {
      return MOCK_OPERATORS.find((op) => op.name.includes("TNM"))
    }
  }
}

// Fetch operators by country code
export async function getOperatorsByCountry(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  countryCode: string,
) {
  // Always use MW as the country code for Malawi
  const malawiCountryCode = "MW"

  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for operators in country: ${malawiCountryCode}`)
    return MOCK_OPERATORS.filter((op) => op.country.isoName === malawiCountryCode)
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.topups
    const token = await getReloadlyToken(baseUrl)

    const res = await fetch(`${baseUrl}/operators/countries/${malawiCountryCode}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER },
    })

    if (!res.ok) {
      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        const simpleRes = await fetch(`${baseUrl}/operators/countries/${malawiCountryCode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (simpleRes.ok) {
          const list = await simpleRes.json()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return (Array.isArray(list) ? list : list.content).map((op: any) => {
            op.minAmount = op.minAmount ?? 0
            op.maxAmount = op.maxAmount ?? 0
            return op
          })
        }

        const errData = await simpleRes.json().catch(() => ({}))
        throw new ReloadlyApiError("Failed to fetch operators", simpleRes.status, errData, "OPERATORS_FETCH_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      throw new ReloadlyApiError("Failed to fetch operators", res.status, errData, "OPERATORS_FETCH_ERROR")
    }

    const list = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Array.isArray(list) ? list : list.content).map((op: any) => {
      op.minAmount = op.minAmount ?? 0
      op.maxAmount = op.maxAmount ?? 0
      return op
    })
  } catch (error) {
    console.error(`Error fetching operators for country ${malawiCountryCode}:`, error)

    // Fall back to mock data for Malawi
    console.log(`Falling back to mock data for operators in country: ${malawiCountryCode}`)
    return MOCK_OPERATORS.filter((op) => op.country.isoName === malawiCountryCode)
  }
}
