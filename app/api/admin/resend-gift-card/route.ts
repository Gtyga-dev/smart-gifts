/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { getGiftCardOrder, getRedeemInstructions } from "@/app/lib/reloadly-giftcards"
import { Resend } from "resend"
import GiftCardDeliveryEmail from "@/emails/GiftCardDeliveryEmail"
import { unstable_rethrow } from "next/navigation"

const resend = new Resend(process.env.RESEND_API_KEY)

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getDefaultRedemptionInstructions(productName: string): string {
  return (
    "1. Visit the official website of the gift card provider\n" +
    "2. Select 'Redeem Gift Card' option\n" +
    "3. Enter the redemption code\n" +
    "4. Follow the on-screen instructions to complete the redemption process"
  )
}

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true }, // Add role field if you have it
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await request.json()

    if (!orderId) {
      return NextResponse.json({ success: false, message: "Missing order ID" }, { status: 400 })
    }

    // Get the order with all necessary details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        User: true,
        ReloadlyTransaction: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Get the transaction ID from various possible sources
    const transactionId =
      order.transactionId ||
      (order.ReloadlyTransaction && order.ReloadlyTransaction.length > 0
        ? order.ReloadlyTransaction[0].externalId
        : null)

    if (!transactionId) {
      return NextResponse.json({ success: false, message: "Transaction ID not found" }, { status: 404 })
    }

    // Get product details
    const productName = order.items[0]?.name || "Gift Card"
    const productId = order.items[0]?.productId

    // Try to get gift card details - with improved error handling
    let giftCardDetails
    try {
      // Get the gift card redemption details from Reloadly
      const giftCardDetails = await getGiftCardOrder(transactionId)

      if (!giftCardDetails || !giftCardDetails.redemptionCode) {
        return NextResponse.json(
          { success: false, message: "Gift card redemption code not available" },
          { status: 404 },
        )
      }

      // Get the product name and ID from order items
      const productName = order.items[0]?.name || "Gift Card"
      const productId = order.items[0]?.productId

      // Get redemption instructions for this specific brand/product
      let redemptionInstructions = (giftCardDetails as any).redemptionInstructions || ""

      // If we have a product ID and no instructions, try to fetch them
      if (productId && !redemptionInstructions) {
        try {
          const instructions = await getRedeemInstructions(productId.toString())
          if (instructions) {
            redemptionInstructions = instructions
          }
        } catch (error) {
          console.error("Error fetching redemption instructions:", error)
        }
      }

      // If we still don't have instructions, use a default template
      if (!redemptionInstructions) {
        redemptionInstructions = getDefaultRedemptionInstructions(productName)
      }
    } catch (error) {
      console.error("Error fetching gift card details:", error)

      // Check if we have metadata in the order that we can use as fallback
      if (order.metadata && typeof order.metadata === "object") {
        const metadata = order.metadata as any
        if (metadata.redemptionCode) {
          giftCardDetails = {
            redemptionCode: metadata.redemptionCode,
            redemptionInstructions:
              metadata.redemptionInstructions || getDefaultRedemptionInstructions(order.items[0]?.name || "Gift Card"),
          }
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Gift card details not available",
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }
      } else if (
        order.ReloadlyTransaction &&
        order.ReloadlyTransaction.length > 0 &&
        order.ReloadlyTransaction[0].metadata &&
        typeof order.ReloadlyTransaction[0].metadata === "object"
      ) {
        // Try to get from transaction metadata as a last resort
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const metadata = order.ReloadlyTransaction[0].metadata as any
        if (metadata.redemptionCode) {
          giftCardDetails = {
            redemptionCode: metadata.redemptionCode,
            redemptionInstructions:
              metadata.redemptionInstructions || getDefaultRedemptionInstructions(order.items[0]?.name || "Gift Card"),
          }
        } else {
          return NextResponse.json(
            {
              success: false,
              message: "Gift card details not available",
              error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
          )
        }
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Gift card details not available",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 500 },
        )
      }
    }

    if (!giftCardDetails || !giftCardDetails.redemptionCode) {
      return NextResponse.json({ success: false, message: "Gift card redemption code not available" }, { status: 404 })
    }

    // Get redemption instructions - with fallbacks
    let redemptionInstructions = giftCardDetails.redemptionInstructions || ""

    // If we have a product ID and no instructions, try to fetch them
    if (productId && !redemptionInstructions) {
      const instructions = await getRedeemInstructions(productId.toString())
      if (instructions) {
        redemptionInstructions = instructions
      }
    }

    // If we still don't have instructions, use a default template
    if (!redemptionInstructions) {
      redemptionInstructions =
        "1. Visit the official website of the gift card provider\n" +
        "2. Select 'Redeem Gift Card' option\n" +
        "3. Enter the redemption code\n" +
        "4. Follow the on-screen instructions to complete the redemption process"
    }

    // Format amount based on currency
    const amount = order.amount / 100 // Convert from cents to whole units
    const currency = order.currency || "USD" // Use the currency from the order or default to USD

    // Send the email with gift card details
    try {
      const { error } = await resend.emails.send({
        from: "orders@smartcards.store",
        to: order.User?.email || "",
        subject: `Your ${productName} Gift Card is Ready!`,
        react: GiftCardDeliveryEmail({
          orderId: order.id,
          productName,
          firstName: order.User?.firstName || "Valued Customer",
          amount,
          currency,
          redemptionCode: giftCardDetails.redemptionCode,
          redemptionInstructions,
        }),
      })

      if (error) {
        console.error("Email sending error:", error)
        return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
      }
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send email",
          error: emailError instanceof Error ? emailError.message : "Unknown error",
        },
        { status: 500 },
      )
    }

    // Update order to mark that the gift card email was sent
    await prisma.order.update({
      where: { id: order.id },
      data: { emailSent: true },
    })

    // Create or update the metadata for future reference
    const metadata = {
      redemptionCode: giftCardDetails.redemptionCode,
      redemptionInstructions,
      sentAt: new Date().toISOString(),
      productId: productId || null,
      productName,
    }

    // Store the metadata in the order for future reference
    await prisma.order.update({
      where: { id: order.id },
      data: {
        metadata: metadata,
      },
    })

    // Create or update the ReloadlyTransaction record
    if (order.ReloadlyTransaction.length === 0 && transactionId) {
      // Create a new transaction record
      await prisma.reloadlyTransaction.create({
        data: {
          externalId: transactionId,
          orderId: order.id,
          status: "completed",
          amount: order.amount,
          recipientEmail: order.User?.email || "",
          metadata,
        },
      })
    } else if (order.ReloadlyTransaction.length > 0) {
      // Update the existing transaction
      await prisma.reloadlyTransaction.update({
        where: { id: order.ReloadlyTransaction[0].id },
        data: {
          status: "completed",
          metadata: {
            ...(typeof order.ReloadlyTransaction[0].metadata === "object" &&
            order.ReloadlyTransaction[0].metadata !== null
              ? order.ReloadlyTransaction[0].metadata
              : {}),
            ...metadata,
          },
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Gift card email resent successfully",
    })
  } catch (error) {
    console.error("Error resending gift card email:", error)

    // Use unstable_rethrow for Next.js internal errors
    if (error instanceof Error && (error.name === "NextNotFoundError" || error.name === "NextRedirectError")) {
      unstable_rethrow(error)
    }

    return NextResponse.json(
      {
        success: false,
        message: "Error resending gift card email",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
