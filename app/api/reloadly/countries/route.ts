import { NextResponse } from "next/server"
import { getReloadlyToken, reloadlyEnv } from "@/app/lib/reloadly"

// Mock countries for development fallback
const MOCK_COUNTRIES = [
  {
    isoName: "MW",
    name: "Malawi",
    flagUrl: "https://flagcdn.com/w40/mw.png",
    callingCodes: ["265"],
  },
  {
    isoName: "ZA",
    name: "South Africa",
    flagUrl: "https://flagcdn.com/w40/za.png",
    callingCodes: ["27"],
  },
  {
    isoName: "ZM",
    name: "Zambia",
    flagUrl: "https://flagcdn.com/w40/zm.png",
    callingCodes: ["260"],
  },
  {
    isoName: "TZ",
    name: "Tanzania",
    flagUrl: "https://flagcdn.com/w40/tz.png",
    callingCodes: ["255"],
  },
  {
    isoName: "MZ",
    name: "Mozambique",
    flagUrl: "https://flagcdn.com/w40/mz.png",
    callingCodes: ["258"],
  },
  {
    isoName: "GB",
    name: "United Kingdom",
    flagUrl: "https://flagcdn.com/w40/gb.png",
    callingCodes: ["44"],
  },
  {
    isoName: "US",
    name: "United States",
    flagUrl: "https://flagcdn.com/w40/us.png",
    callingCodes: ["1"],
  },
  {
    isoName: "NG",
    name: "Nigeria",
    flagUrl: "https://flagcdn.com/w40/ng.png",
    callingCodes: ["234"],
  },
  {
    isoName: "KE",
    name: "Kenya",
    flagUrl: "https://flagcdn.com/w40/ke.png",
    callingCodes: ["254"],
  },
  {
    isoName: "UG",
    name: "Uganda",
    flagUrl: "https://flagcdn.com/w40/ug.png",
    callingCodes: ["256"],
  },
]

export async function GET() {
  try {
    // In development mode, use mock data
    if (process.env.NODE_ENV === "development") {
      console.log("Using mock countries data for development")
      return NextResponse.json(MOCK_COUNTRIES)
    }

    // Make sure we're using the correct audience for topups
    const baseUrl = reloadlyEnv.baseUrls.topups
    const token = await getReloadlyToken(baseUrl)

    console.log(`Environment: ${process.env.RELOADLY_ENVIRONMENT || "not set"} (sandbox: ${reloadlyEnv.isSandbox})`)
    console.log(`Using base URL for countries: ${baseUrl}`)

    try {
      console.log("Fetching countries from Reloadly API")

      // Use the correct URL based on the environment
      const countriesUrl = reloadlyEnv.isSandbox
        ? "https://topups-sandbox.reloadly.com/countries"
        : "https://topups.reloadly.com/countries"

      console.log(`Sending request to: ${countriesUrl}`)

      const response = await fetch(countriesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json", // Simplified header for better compatibility
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error(`Countries API error: ${response.status}`, errorData)
        throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`)
      }

      const countries = await response.json()
      return NextResponse.json(countries)
    } catch (apiError) {
      console.error("Error fetching countries from Reloadly API:", apiError)

      // Always use mock data as fallback
      console.warn("Using mock countries data due to API error")
      return NextResponse.json(MOCK_COUNTRIES)
    }
  } catch (error) {
    console.error("Error fetching countries:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch countries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
