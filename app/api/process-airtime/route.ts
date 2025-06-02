import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { getReloadlyToken, reloadlyEnv } from "@/app/lib/reloadly"

// Phone number utilities
function normalizePhoneNumber(phone: string) {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.startsWith("0") ? cleaned.substring(1) : cleaned
}

function determineCountryCode(phone: string) {
  if (phone.startsWith("265")) return "MW"
  if (phone.startsWith("27")) return "ZA"
  if (phone.startsWith("234")) return "NG"
  return "MW" // Default
}

export async function POST(request: NextRequest) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { txRef, operatorId, amount, recipientPhone, useLocalAmount } = body

    if (!txRef || !operatorId || !amount || !recipientPhone) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Get the order from the database
    const order = await prisma.order.findUnique({
      where: { id: txRef },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    if (order.status !== "paid") {
      return NextResponse.json({ success: false, message: "Order not paid" }, { status: 400 })
    }

    // Phone number processing
    const normalizedPhone = normalizePhoneNumber(recipientPhone)
    const countryCode = determineCountryCode(normalizedPhone)
    const customIdentifier = `smartcards-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

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
          number: normalizedPhone,
        },
        senderPhone: {
          countryCode: "MW",
          number: "123456789", // Replace with actual sender number
        },
      }

      const response = await fetch(topupUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Reloadly-Client": `nextjs/${process.env.npm_package_version || "1.0.0"}`,
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Reloadly API Error:", {
          status: response.status,
          error: errorData,
        })

        // Update order status to failed
        await prisma.order.update({
          where: { id: order.id },
          data: { status: "failed" },
        })

        return NextResponse.json(
          { success: false, message: "Topup processing failed", details: errorData },
          { status: 422 },
        )
      }

      const topupData = await response.json()

      // Create a ReloadlyTransaction record
      const reloadlyTransaction = await prisma.reloadlyTransaction.create({
        data: {
          externalId: topupData.transactionId.toString(),
          orderId: order.id,
          status: topupData.status.toLowerCase(),
          amount: order.amount,
          recipientPhone: recipientPhone,
          metadata: {
            operatorId,
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            operatorName: (order.metadata as any)?.operatorName,
            useLocalAmount,
            reloadlyResponse: topupData,
          },
        },
      })

      // Update order status to completed
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: topupData.status.toLowerCase(),
          reloadlyTransactionId: topupData.transactionId.toString(),
        },
      })

      return NextResponse.json({
        success: true,
        message: "Airtime topup processed successfully",
        transactionId: topupData.transactionId.toString(),
        reloadlyTransactionId: reloadlyTransaction.id,
        status: topupData.status.toLowerCase(),
      })
    } catch (error) {
      console.error("Error processing airtime:", error)

      // Update order status to failed
      await prisma.order.update({
        where: { id: txRef },
        data: { status: "failed" },
      })

      return NextResponse.json({ success: false, message: "Failed to process airtime topup" }, { status: 500 })
    }
  } catch (error) {
    console.error("Unexpected server error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
