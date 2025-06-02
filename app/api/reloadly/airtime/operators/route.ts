import { NextResponse } from "next/server"
import { getReloadlyToken, reloadlyEnv } from "@/app/lib/reloadly"
import { handleApiError } from "@/app/lib/api-error"
import { MOCK_OPERATORS, filterOperatorsByType } from "@/app/lib/mock-data"

// Operator and country types
type OperatorCountry = { isoName: string; name: string; flagUrl: string }
type Operator = {
  operatorId: number
  name: string
  logoUrls: string[]
  country?: OperatorCountry
  minAmount: number
  maxAmount: number
  senderCurrencyCode: string
  destinationCurrencyCode: string
}
type TransformedOperator = {
  id: string
  name: string
  logoUrls: string[]
  country: OperatorCountry
  minAmount: number
  maxAmount: number
  senderCurrencyCode: string
  destinationCurrencyCode: string
}

// Use the API version header from reloadlyEnv
const API_VERSION_HEADER = reloadlyEnv.apiVersionHeaders?.topups || "application/com.reloadly.topups-v1+json"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = (searchParams.get("type") || "all").toLowerCase()
    const baseUrl = reloadlyEnv.baseUrls.topups

    console.log(`Fetching operators for type: ${type}`)

    // In development mode, use mock data
    if ((process.env.NODE_ENV as string) === "development") {
      console.log("Using mock operators data for development")
      const mockData = filterOperatorsByType(MOCK_OPERATORS, type)
      return NextResponse.json(mockData)
    }

    try {
      const token = await getReloadlyToken(baseUrl)
      let operators: Operator[] = []

      if (type === "all" || type === "international") {
        const res = await fetch(`${baseUrl}/operators`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: API_VERSION_HEADER,
          },
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(`Failed to fetch operators: ${res.status} ${res.statusText} ${JSON.stringify(errorData)}`)
        }

        const data = (await res.json()) as { content: Operator[] }
        operators = data.content || []

        if (type === "international") {
          operators = operators.filter((op) => op.country?.isoName !== "MW")
        }
      } else {
        const res = await fetch(`${baseUrl}/operators/countries/MW`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: API_VERSION_HEADER,
          },
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(
            `Failed to fetch Malawi operators: ${res.status} ${res.statusText} ${JSON.stringify(errorData)}`,
          )
        }

        const countryOps = (await res.json()) as Operator[]
        operators = countryOps.filter((op) => op.name.toLowerCase().includes(type))
      }

      console.log(`Found ${operators.length} operators for type: ${type}`)

      // Ensure numeric defaults to avoid nulls in UI
      const transformed: TransformedOperator[] = operators.map((op) => {
        const minAmt = op.minAmount ?? 0
        const maxAmt = op.maxAmount ?? 0
        return {
          id: String(op.operatorId),
          name: op.name,
          logoUrls: op.logoUrls || [],
          country: op.country ?? { isoName: "", name: "", flagUrl: "" },
          minAmount: minAmt,
          maxAmount: maxAmt,
          senderCurrencyCode: op.senderCurrencyCode,
          destinationCurrencyCode: op.destinationCurrencyCode,
        }
      })

      return NextResponse.json(transformed)
    } catch (error) {
      console.error("Error fetching from Reloadly API:", error)

      // In development mode, use mock data as fallback
      if (process.env.NODE_ENV === "development") {
        console.log("Using mock operators data for development (API error)")
        const mockData = filterOperatorsByType(MOCK_OPERATORS, type)
        return NextResponse.json(mockData)
      }

      throw error
    }
  } catch (error) {
    console.error("Error in airtime operators route:", error)
    return handleApiError(error, "Failed to fetch operators")
  }
}
