import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"

export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const {
            transactionId,
            offerId,
            paymentMethod,
            provider,
            accountNumber,
            transactionId: paymentTransactionId,
            screenshot,
        } = await req.json()

        // Validate required fields
        if (!transactionId || !paymentMethod || !provider || !accountNumber || (!paymentTransactionId && !screenshot)) {
            return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
        }

        // Get transaction
        const transaction = await prisma.p2PTransaction.findUnique({
            where: { id: transactionId },
            include: {
                buyer: { select: { id: true } },
                seller: { select: { id: true, email: true } },
            },
        })

        if (!transaction) {
            return NextResponse.json({ success: false, message: "Transaction not found" }, { status: 404 })
        }

        // Verify the buyer is the current user
        if (transaction.buyerId !== user.id) {
            return NextResponse.json(
                { success: false, message: "You are not authorized to make this payment" },
                { status: 403 },
            )
        }

        // Update transaction with payment details
        const updatedTransaction = await prisma.p2PTransaction.update({
            where: { id: transactionId },
            data: {
                paymentMethod: `${paymentMethod}-${provider}`,
                paymentReference: `${accountNumber}-${paymentTransactionId || ""}`,
                paymentProof: screenshot || null,
                status: "pending", // Payment submitted, waiting for seller confirmation
            },
        })

        // If there's an offer ID, update the offer status
        if (offerId) {
            await prisma.p2POffer.update({
                where: { id: offerId },
                data: { status: "accepted" },
            })
        }

        // TODO: Send email notification to seller about payment

        return NextResponse.json({
            success: true,
            message: "Payment submitted for confirmation",
            data: { transactionId: updatedTransaction.id },
        })
    } catch (error) {
        console.error("P2P payment error:", error)
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
    }
}
