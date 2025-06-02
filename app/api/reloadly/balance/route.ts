import { NextResponse } from "next/server"
import { getReloadlyBalance } from "@/app/lib/reloadly"
import { handleApiError } from "@/app/lib/api-error"
import { MOCK_BALANCE } from "@/app/lib/mock-data"

export async function GET() {
  try {
    // In development mode, use mock data
    if ((process.env.NODE_ENV as string) === "development") {
      console.log("Using mock balance data for development")
      return NextResponse.json(MOCK_BALANCE)
    }

    // Try to get balance from all services and return the first successful one
    try {
      console.log("Attempting to fetch balance from giftcards API...")
      const balanceData = await getReloadlyBalance("https://giftcards-sandbox.reloadly.com")

      return NextResponse.json({
        balance: balanceData.balance,
        currencyCode: balanceData.currencyCode,
        currencyName: balanceData.currencyCode === "USD" ? "US Dollar" : balanceData.currencyCode,
        updatedAt: new Date().toISOString(),
      })
    } catch (giftcardsError) {
      console.warn("Failed to get balance from giftcards API, trying topups...", giftcardsError)

      try {
        console.log("Attempting to fetch balance from topups API...")
        const balanceData = await getReloadlyBalance("https://topups-sandbox.reloadly.com")

        return NextResponse.json({
          balance: balanceData.balance,
          currencyCode: balanceData.currencyCode,
          currencyName: balanceData.currencyCode === "USD" ? "US Dollar" : balanceData.currencyCode,
          updatedAt: new Date().toISOString(),
        })
      } catch (topupsError) {
        console.warn("Failed to get balance from topups API, trying utilities...", topupsError)

        try {
          console.log("Attempting to fetch balance from utilities API...")
          const balanceData = await getReloadlyBalance("https://utilities-sandbox.reloadly.com")

          return NextResponse.json({
            balance: balanceData.balance,
            currencyCode: balanceData.currencyCode,
            currencyName: balanceData.currencyCode === "USD" ? "US Dollar" : balanceData.currencyCode,
            updatedAt: new Date().toISOString(),
          })
        } catch (utilitiesError) {
          console.error("All balance fetch attempts failed", utilitiesError)

          // In development mode, use mock data as fallback
          if (process.env.NODE_ENV === "development") {
            console.log("Using mock balance data for development (API error)")
            return NextResponse.json(MOCK_BALANCE)
          }

          // In production, return mock data with a warning
          console.log("Using mock balance data in production due to API errors")
          return NextResponse.json({
            ...MOCK_BALANCE,
            warning: "Using mock data due to API errors. Please check your Reloadly configuration.",
          })
        }
      }
    }
  } catch (error) {
    return handleApiError(error, "Failed to fetch balance")
  }
}
