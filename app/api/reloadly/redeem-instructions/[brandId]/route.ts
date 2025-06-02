import { NextResponse } from "next/server"
import { getReloadlyToken } from "@/app/lib/reloadly"

export async function GET(request: Request, context: { params: Promise<{ brandId: string }> }) {
  try {
    const { brandId } = await context.params

    if (!brandId) {
      return NextResponse.json({ error: "Brand ID is required" }, { status: 400 })
    }

    const token = await getReloadlyToken()

    const response = await fetch(`https://giftcards-sandbox.reloadly.com/redeem-instructions/${brandId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Reloadly redeem instructions error:", errorData)
      return NextResponse.json({ error: "Failed to fetch redeem instructions" }, { status: response.status })
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching Reloadly redeem instructions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
