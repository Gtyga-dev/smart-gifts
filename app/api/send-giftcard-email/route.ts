import { NextResponse } from "next/server"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Resend } from "resend"
import { getGiftCardOrder } from "@/app/lib/reloadly-giftcards"
import GiftCardDeliveryEmail from "@/emails/GiftCardDeliveryEmail"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
    try {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.id) {
            return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        // Verify the order belongs to the current user
        const order = await prisma.order.findUnique({
            where: {
                id: orderId,
                userId: user.id,
            },
            include: {
                items: true,
            },
        })

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
        }

        // Get the gift card redemption details from Reloadly
        let giftCardDetails
        try {
            if (order.transactionId) {
                giftCardDetails = await getGiftCardOrder(order.transactionId)
            } else {
                return NextResponse.json({ success: false, message: "Transaction ID not found" }, { status: 404 })
            }
        } catch (error) {
            console.error("Error fetching gift card details:", error)
            return NextResponse.json({ success: false, message: "Failed to fetch gift card details" }, { status: 500 })
        }

        if (!giftCardDetails || !giftCardDetails.redemptionCode) {
            return NextResponse.json({ success: false, message: "Gift card redemption code not available" }, { status: 404 })
        }

        // Get the product name from order items
        const productName = order.items[0]?.name || "Gift Card"

        // Format amount based on currency
        const amount = order.amount / 100 // Convert from cents to whole units
        const currency = order.currency || "USD" // Use the currency from the order or default to USD

        // Send the email with gift card details
        const { data, error } = await resend.emails.send({
            from: "orders@smartcards.store",
            to: user.email || "",
            subject: `Your ${productName} Gift Card is Ready!`,
            react: GiftCardDeliveryEmail({
                orderId: order.id,
                productName,
                 // eslint-disable-next-line @typescript-eslint/no-explicit-any
                firstName: (user as any)?.customFields?.firstName || "Valued Customer",
                amount,
                currency,
                redemptionCode: giftCardDetails.redemptionCode,
                redemptionInstructions:
                    "1. Visit the official website of the gift card provider\n2. Select 'Redeem Gift Card' option\n3. Enter the redemption code\n4. Follow the on-screen instructions to complete the redemption process",
            }),
        })

        if (error) {
            console.error("Email sending error:", error)
            return NextResponse.json({ success: false, message: "Failed to send email" }, { status: 500 })
        }

        // Update order to mark that the gift card email was sent
        await prisma.order.update({
            where: { id: order.id },
            data: { emailSent: true },
        })

        return NextResponse.json({
            success: true,
            message: "Gift card email sent successfully",
            data,
        })
    } catch (error) {
        console.error("Error sending gift card email:", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error sending email",
                error: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 },
        )
    }
}

