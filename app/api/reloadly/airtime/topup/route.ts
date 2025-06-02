import { NextResponse } from "next/server"
import { getReloadlyToken, reloadlyEnv } from "@/app/lib/reloadly"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

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

// Phone number utilities
function normalizePhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, '')
  return cleaned.startsWith('0') ? cleaned.substring(1) : cleaned
}

function determineCountryCode(phone: string) {
  if (phone.startsWith('265')) return 'MW'
  if (phone.startsWith('27')) return 'ZA'
  if (phone.startsWith('234')) return 'NG'
  return 'MW' // Default
}

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    // Authentication check
    if (!user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Input validation
    const { operatorId, amount, recipientPhone, useLocalAmount = false } = await request.json()
    if (!operatorId || !amount || !recipientPhone) {
      return NextResponse.json(
        { error: "Missing required fields: operatorId, amount, recipientPhone" },
        { status: 400 }
      )
    }

    // Database availability check
    if (!process.env.DATABASE_URL) {
      console.error("Database configuration error: DATABASE_URL missing")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    if (!(await checkDatabaseConnection())) {
      console.error("Database connection unavailable")
      return NextResponse.json(
        { error: "Service temporarily unavailable" },
        { status: 503 }
      )
    }

    // User record management
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
      return NextResponse.json(
        { error: "Account processing failed" },
        { status: 500 }
      )
    }

    // Phone number processing
    const normalizedPhone = normalizePhoneNumber(recipientPhone)
    const countryCode = determineCountryCode(normalizedPhone)
    const customIdentifier = `Smartcards-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

    // Reloadly API integration
    try {
      const token = await getReloadlyToken(reloadlyEnv.baseUrls.topups)
      const topupUrl = reloadlyEnv.isSandbox
        ? "https://topups-sandbox.reloadly.com/topups"
        : "https://topups.reloadly.com/topups"

      const payload = {
        operatorId: Number(operatorId),
        amount: Number(amount),
        useLocalAmount,
        customIdentifier,
        recipientPhone: {
          countryCode,
          number: normalizedPhone
        },
        senderPhone: {
          countryCode: "MW",
          number: "123456789" // Replace with actual sender number
        }
      }

      const response = await fetch(topupUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Reloadly-Client": `nextjs/${process.env.npm_package_version}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Reloadly API Error:", {
          status: response.status,
          error: errorData
        })
        return NextResponse.json(
          { error: "Topup processing failed", details: errorData },
          { status: 422 }
        )
      }

      const topupData = await response.json()
      const operatorIdNum = Number(operatorId)      // e.g. 282

      // Order creation with transaction
      const order = await prisma.$transaction(async (tx) => {
        return tx.order.create({
          data: {
            userId: user.id,
            amount: topupData.requestedAmount * 100,
            status: topupData.status.toLowerCase(),
            paymentMethod: "reloadly",
            paymentReference: customIdentifier,
            transactionId: topupData.transactionId.toString(),
            productType: "airtime", // Add the required productType field
            items: {
              create: {
                productId: operatorIdNum.toString(),
                quantity: 1,
                priceAtTime: amount,
                name: `Airtime Topup - ${countryCode}${normalizedPhone}`,
                imageUrl: "",
              }
            }
          },
          select: { id: true, status: true, transactionId: true }
        })
      })

      return NextResponse.json({
        success: true,
        orderId: order.id,
        transactionId: order.transactionId,
        status: order.status
      })

    } catch (apiError) {
      console.error("Topup processing error:", apiError)
      return NextResponse.json(
        { error: "Transaction processing failed" },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error("Unexpected server error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}