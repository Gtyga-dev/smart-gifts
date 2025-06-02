import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/app/lib/db"

// Get the base URL from request or environment variable

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const txRef = searchParams.get("tx_ref")
    const email = searchParams.get("email")

    if (!txRef || !email) {
      return NextResponse.json({ success: false, message: "Missing required parameters" }, { status: 400 })
    }

    // Check if required environment variables are set
    if (!process.env.PAYCHANGU_SECRET_KEY) {
      console.error("Missing PAYCHANGU_SECRET_KEY environment variable")
      return NextResponse.json(
        { success: false, message: "Server configuration error: Missing payment provider credentials" },
        { status: 500 },
      )
    }

    // Verify the payment with Paychangu
    const verifyUrl = `https://api.paychangu.com/v1/transactions/verify/${txRef}`
    const secretKey = process.env.PAYCHANGU_SECRET_KEY

    const verifyResponse = await fetch(verifyUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!verifyResponse.ok) {
      const errorData = await verifyResponse.json()
      console.error("Payment verification error:", errorData)

      // Update order status to failed
      await prisma.order.update({
        where: { id: txRef },
        data: { status: "failed" },
      })

      throw new Error(errorData.message || "Failed to verify payment")
    }

    const verifyData = await verifyResponse.json()

    // Check if payment was successful
    if (verifyData.data.status !== "successful") {
      // Update order status based on payment status
      await prisma.order.update({
        where: { id: txRef },
        data: {
          status: verifyData.data.status === "failed" ? "failed" : "pending",
          paymentReference: verifyData.data.flw_ref || txRef,
        },
      })

      return NextResponse.json({
        success: false,
        message: "Payment was not successful",
        status: verifyData.data.status,
      })
    }

    // Retrieve order from database
    const order = await prisma.order.findUnique({
      where: { id: txRef },
    })

    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 })
    }

    // Update order status to paid
    await prisma.order.update({
      where: { id: txRef },
      data: {
        status: "paid",
        transactionId: verifyData.data.id,
        paymentReference: verifyData.data.flw_ref || txRef,
      },
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const metadata = order.metadata as any

    const transaction = {
      orderId: order.id,
      operatorId: metadata?.operatorId,
      operatorName: metadata?.operatorName,
      amount: order.amount / 100, // Convert from cents
      recipientPhone: metadata?.recipientPhone,
      useLocalAmount: metadata?.useLocalAmount === "true" || metadata?.useLocalAmount === true,
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      transaction,
      orderId: order.id,
    })
  } catch (error) {
    console.error("Error verifying payment:", error)
    return NextResponse.json({ success: false, message: "Failed to verify payment" }, { status: 500 })
  }
}
