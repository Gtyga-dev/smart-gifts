import { NextResponse } from "next/server"
import { getReloadlyToken } from "@/app/lib/reloadly"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const currencyCode = searchParams.get("currencyCode")
    const amount = searchParams.get("amount")

    if (!currencyCode || !amount) {
      return NextResponse.json({ error: "Currency code and amount are required" }, { status: 400 })
    }

    const token = await getReloadlyToken()

    const response = await fetch(
      `https://giftcards-sandbox.reloadly.com/fx-rate?currencyCode=${currencyCode}&amount=${amount}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Reloadly FX rate error:", errorData)
      return NextResponse.json({ error: "Failed to fetch FX rate" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json({
      senderCurrency: data.senderCurrency,
      senderAmount: data.senderAmount,
      recipientCurrency: data.recipientCurrency,
      recipientAmount: data.recipientAmount,
      rate: data.senderAmount / data.recipientAmount,
    })
  } catch (error) {
    console.error("Error fetching Reloadly FX rate:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
