import { NextResponse } from "next/server"
import { redis } from "@/app/lib/redis-client"
import { reloadlyEnv } from "@/app/lib/reloadly"
import { handleApiError } from "@/app/lib/api-error"

const RELOADLY_TOKEN_KEY = "reloadly:token"
const TOKEN_EXPIRY = 5184000 // 60 days in seconds

export async function GET() {
  try {
    // Check if we have a cached token
    const cachedToken = await redis.get(RELOADLY_TOKEN_KEY)
    if (cachedToken) {
      return NextResponse.json({ token: cachedToken })
    }

    // If no cached token, get a new one
    const clientId = process.env.RELOADLY_CLIENT_ID
    const clientSecret = process.env.RELOADLY_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "Missing Reloadly API credentials" }, { status: 500 })
    }

    // Determine the correct audience based on environment
    const audience = reloadlyEnv.isSandbox ? "https://giftcards-sandbox.reloadly.com" : "https://giftcards.reloadly.com"

    const response = await fetch("https://auth.reloadly.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        audience: audience,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Reloadly token error:", errorData)
      return NextResponse.json({ error: "Failed to obtain Reloadly token" }, { status: 500 })
    }

    const data = await response.json()
    const token = data.access_token

    // Cache the token
    await redis.set(RELOADLY_TOKEN_KEY, token, { ex: TOKEN_EXPIRY })

    return NextResponse.json({ token })
  } catch (error) {
    return handleApiError(error, "Error fetching Reloadly token")
  }
}
