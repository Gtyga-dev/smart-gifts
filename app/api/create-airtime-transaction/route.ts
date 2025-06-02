import { type NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"

// Database connection checker
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("Database connection check failed:", error)
    return false
  }
}

// Get the base URL from request or environment variable
function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  const host = request.headers.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}

export async function POST(request: NextRequest) {
  try {
    // Check required environment variables
    const secretKey = process.env.PAYCHANGU_SECRET_KEY
    if (!secretKey) {
      console.error("Missing PAYCHANGU_SECRET_KEY environment variable")
      return NextResponse.json(
        { error: "Server configuration error: Missing payment provider credentials" },
        { status: 500 }
      )
    }

    // Base URL
    const baseUrl = getBaseUrl(request)
    console.log("Using base URL:", baseUrl)

    // Authenticate user
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any
    try {
      body = await request.json()
    } catch (error) {
      console.error("Failed to parse request body:", error)
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { operatorId, operatorName, amount, recipientPhone, useLocalAmount, currency } = body
    if (!operatorId || !amount || !recipientPhone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Database checks
    if (!process.env.DATABASE_URL) {
      console.error("Database configuration error: DATABASE_URL missing")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }
    if (!(await checkDatabaseConnection())) {
      console.error("Database connection unavailable")
      return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 })
    }

    // Upsert user record
    try {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email!,
          firstName: user.given_name || "Unknown",
          lastName: user.family_name || "User",
          profileImage: user.picture || "",
        },
        update: {},
      })
    } catch (dbError) {
      console.error("User record management failed:", dbError)
      return NextResponse.json({ error: "Account processing failed" }, { status: 500 })
    }

    // Create order
    const txRef = `AIRTIME-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    let order
    try {
      order = await prisma.order.create({
        data: {
          id: txRef,
          status: "pending",
          amount: Math.round(amount * 100),
          userId: user.id,
          paymentMethod: "paychangu",
          paymentReference: txRef,
          productType: "airtime",
          currency: currency || "MWK",
          metadata: { operatorId, operatorName, recipientPhone, useLocalAmount },
          items: {
            create: {
              productId: operatorId.toString(),
              quantity: 1,
              priceAtTime: Math.round(amount * 100),
              name: `${operatorName || "Airtime"} Topup`,
              imageUrl: "/images/airtime-icon.png",
            },
          },
        },
      })
    } catch (orderError) {
      console.error("Order creation failed:", orderError)
      return NextResponse.json({ error: "Failed to create order record" }, { status: 500 })
    }

    // Initialize PayChangu payment
    try {
      const paychanguApiUrl = "https://api.paychangu.com/payment"

      console.log("Initiating Paychangu request with txRef:", txRef)
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000)

      const response = await fetch(paychanguApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${secretKey}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          amount: amount.toString(),
          currency: currency || "MWK",
          email: user.email,
          first_name: user.given_name || "Customer",
          last_name: user.family_name || "",
          callback_url: `${baseUrl}/airtime/success`,
          return_url: `${baseUrl}/airtime/failed`,
          tx_ref: txRef,
          customization: { title: "Airtime Purchase", description: `${operatorName || "Airtime"} for ${recipientPhone}` },
          meta: { operatorId, operatorName, recipientPhone, useLocalAmount: useLocalAmount?.toString() || "false", service: "airtime", orderId: order.id },
        }),
      })
      clearTimeout(timeout)

      const contentType = response.headers.get("content-type") || ""
      const raw = await response.text()

      if (!contentType.includes("application/json")) {
        console.error("Non-JSON response from PayChangu:", raw)
        await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } })
        return NextResponse.json({ error: "Invalid response format from payment provider", details: raw.substring(0, 200) }, { status: 502 })
      }

      const data = JSON.parse(raw)
      if (!response.ok || data.status !== "success") {
        console.error("PayChangu API error:", data)
        await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } })
        return NextResponse.json({ error: data.message || "Payment provider error" }, { status: 502 })
      }

      return NextResponse.json({ success: true, txRef, orderId: order.id, checkoutUrl: data.data.checkout_url })
    } catch (apiError) {
      console.error("PayChangu API call failed:", apiError)
      if (order) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "failed" } }).catch(console.error)
      }
      return NextResponse.json({ error: "Payment provider communication failed", details: apiError instanceof Error ? apiError.message : String(apiError) }, { status: 502 })
    }
  } catch (error) {
    console.error("Unhandled error in create-airtime-transaction:", error)
    return NextResponse.json({ error: "Internal server error", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
