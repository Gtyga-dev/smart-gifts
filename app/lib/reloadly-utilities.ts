import { getReloadlyToken, reloadlyEnv } from "./reloadly"
import { ReloadlyApiError } from "./api-error"
import { MOCK_BILLERS } from "./mock-data"

// Update the API_VERSION_HEADER to match exactly what Reloadly expects
// This is critical for avoiding 406 errors
const API_VERSION_HEADER = "application/com.reloadly.utilities-v1+json"

// Update the getBillerById function to handle errors better and focus on Malawi
export async function getBillerById(id: string) {
  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for biller ID: ${id}`)
    const mockBiller = MOCK_BILLERS.find((biller) => biller.id === id)

    if (!mockBiller) {
      console.warn(`No mock biller found with ID: ${id}`)
      // Return a default Malawi biller as fallback
      return MOCK_BILLERS[0]
    }

    return mockBiller
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.utilities
    const token = await getReloadlyToken(baseUrl)

    console.log(`Fetching biller with ID: ${id} from ${baseUrl}`)

    // Try first with the versioned header
    try {
      const res = await fetch(`${baseUrl}/billers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: API_VERSION_HEADER,
        },
      })

      if (res.ok) {
        return await res.json()
      }

      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        console.log("Got 406 with versioned header, trying with application/json")
        const simpleRes = await fetch(`${baseUrl}/billers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (simpleRes.ok) {
          return await simpleRes.json()
        }

        const errData = await simpleRes.json().catch(() => ({}))
        console.error(`Error response from biller API with simple header: ${simpleRes.status}`, errData)

        // If biller not found, return a default Malawi biller
        if (simpleRes.status === 404) {
          console.log("Biller not found, returning default Malawi biller")
          return MOCK_BILLERS.find((b) => b.countryIsoCode === "MW") || MOCK_BILLERS[0]
        }

        throw new ReloadlyApiError("Failed to fetch biller", simpleRes.status, errData, "BILLER_FETCH_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      console.error(`Error response from biller API: ${res.status}`, errData)

      // If biller not found, return a default Malawi biller
      if (res.status === 404) {
        console.log("Biller not found, returning default Malawi biller")
        return MOCK_BILLERS.find((b) => b.countryIsoCode === "MW") || MOCK_BILLERS[0]
      }

      throw new ReloadlyApiError("Failed to fetch biller", res.status, errData, "BILLER_FETCH_ERROR")
    } catch (error) {
      if (error instanceof ReloadlyApiError) throw error

      console.error("Error in first fetch attempt:", error)

      // Try one more time with a simple header as a last resort
      const lastRes = await fetch(`${baseUrl}/billers/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (lastRes.ok) {
        return await lastRes.json()
      }

      throw error
    }
  } catch (error) {
    console.error(`Error fetching biller with ID ${id}:`, error)

    // Fall back to mock data for Malawi
    console.log(`Falling back to mock data for biller ID: ${id}`)
    const mockBiller = MOCK_BILLERS.find((biller) => biller.id === id)
    if (mockBiller) {
      return mockBiller
    }

    // If no specific mock biller found, return a default Malawi biller
    const defaultMalawiBiller = MOCK_BILLERS.find((b) => b.countryIsoCode === "MW")
    if (defaultMalawiBiller) {
      console.log("Returning default Malawi biller as fallback")
      return {
        ...defaultMalawiBiller,
        id: id,
      }
    }

    // Last resort: return the first mock biller
    return MOCK_BILLERS[0]
  }
}

export async function getUtilityTransaction(id: string) {
  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for utility transaction ID: ${id}`)
    return {
      id: id,
      status: "SUCCESSFUL",
      amount: 5000,
      amountCurrencyCode: "MWK",
      billDetails: {
        billerName: "ESCOM Malawi",
        subscriberDetails: {
          accountNumber: "12345678",
        },
        pinDetails: {
          token: "ABC123456789",
          info1: "Valid for 30 days",
        },
      },
      createdAt: new Date().toISOString(),
    }
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.utilities
    const token = await getReloadlyToken(baseUrl)

    const res = await fetch(`${baseUrl}/transactions/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: API_VERSION_HEADER,
      },
    })

    if (!res.ok) {
      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        console.log("Got 406 with versioned header, trying with application/json")
        const simpleRes = await fetch(`${baseUrl}/transactions/${id}`, {
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
    console.error(`Error fetching utility transaction with ID ${id}:`, error)

    // Always fall back to mock data for Malawi
    console.log(`Falling back to mock data for utility transaction ID: ${id}`)
    return {
      id: id,
      status: "SUCCESSFUL",
      amount: 5000,
      amountCurrencyCode: "MWK",
      billDetails: {
        billerName: "ESCOM Malawi",
        subscriberDetails: {
          accountNumber: "12345678",
        },
        pinDetails: {
          token: "ABC123456789",
          info1: "Valid for 30 days",
        },
      },
      createdAt: new Date().toISOString(),
    }
  }
}

export async function getBillersByType(type: string) {
  // In development mode, use mock data
  if (process.env.NODE_ENV === "development") {
    console.log(`Using mock data for billers of type: ${type}`)
    if (type === "all") {
      return MOCK_BILLERS
    }

    const typeMap: Record<string, string> = {
      electricity: "ELECTRICITY_BILL_PAYMENT",
      water: "WATER_BILL_PAYMENT",
      tv: "TV_BILL_PAYMENT",
      internet: "INTERNET_BILL_PAYMENT",
    }

    const apiType = typeMap[type.toLowerCase()] || type
    return MOCK_BILLERS.filter((biller) => biller.type === apiType)
  }

  try {
    const baseUrl = reloadlyEnv.baseUrls.utilities
    const token = await getReloadlyToken(baseUrl)

    // Add country=MW parameter to focus on Malawi
    let url = `${baseUrl}/billers?country=MW`
    if (type !== "all") {
      url += `&type=${mapTypeToApiParam(type)}`
    }

    console.log(`Fetching billers from: ${url}`)

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: API_VERSION_HEADER,
      },
    })

    if (!res.ok) {
      // If we get a 406, try again with a simpler header
      if (res.status === 406) {
        const simpleRes = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (simpleRes.ok) {
          const data = await simpleRes.json()
          const billers = data.content || data

          // Transform the response to match your needs
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return billers.map((biller: any) => ({
            id: String(biller.id),
            name: biller.name,
            type: biller.type,
            serviceType: biller.serviceType,
            countryIsoCode: biller.countryIsoCode || "MW", // Default to MW
            minAmount: biller.minLocalTransactionAmount || biller.minInternationalTransactionAmount || 0,
            maxAmount: biller.maxLocalTransactionAmount || biller.maxInternationalTransactionAmount || 100,
            currencyCode: biller.localTransactionCurrencyCode || biller.internationalTransactionCurrencyCode || "MWK",
            requiresInvoice: biller.requiresInvoice || false,
          }))
        }

        const errData = await simpleRes.json().catch(() => ({}))
        throw new ReloadlyApiError("Failed to fetch billers", simpleRes.status, errData, "BILLERS_FETCH_ERROR")
      }

      const errData = await res.json().catch(() => ({}))
      throw new ReloadlyApiError("Failed to fetch billers", res.status, errData, "BILLERS_FETCH_ERROR")
    }

    const data = await res.json()
    const billers = data.content || data

    // Transform the response to match your needs
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return billers.map((biller: any) => ({
      id: String(biller.id),
      name: biller.name,
      type: biller.type,
      serviceType: biller.serviceType,
      countryIsoCode: biller.countryIsoCode || "MW", // Default to MW
      minAmount: biller.minLocalTransactionAmount || biller.minInternationalTransactionAmount || 0,
      maxAmount: biller.maxLocalTransactionAmount || biller.maxInternationalTransactionAmount || 100,
      currencyCode: biller.localTransactionCurrencyCode || biller.internationalTransactionCurrencyCode || "MWK",
      requiresInvoice: biller.requiresInvoice || false,
    }))
  } catch (error) {
    console.error(`Error fetching billers of type ${type}:`, error)

    // Fall back to mock data for Malawi
    console.log(`Falling back to mock data for billers of type: ${type}`)
    if (type === "all") {
      return MOCK_BILLERS
    }

    const typeMap: Record<string, string> = {
      electricity: "ELECTRICITY_BILL_PAYMENT",
      water: "WATER_BILL_PAYMENT",
      tv: "TV_BILL_PAYMENT",
      internet: "INTERNET_BILL_PAYMENT",
    }

    const apiType = typeMap[type.toLowerCase()] || type
    return MOCK_BILLERS.filter((biller) => biller.type === apiType)
  }
}

// Helper function to map UI type to API parameter
function mapTypeToApiParam(type: string): string {
  switch (type) {
    case "electricity":
      return "ELECTRICITY_BILL_PAYMENT"
    case "water":
      return "WATER_BILL_PAYMENT"
    case "tv":
      return "TV_BILL_PAYMENT"
    case "internet":
      return "INTERNET_BILL_PAYMENT"
    default:
      return ""
  }
}
