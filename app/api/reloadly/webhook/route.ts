import { NextResponse } from "next/server"
import crypto from "crypto"
import prisma from "@/app/lib/db"

// Define webhook data types
interface WebhookData {
  transactionId: string
  customIdentifier?: string
  referenceId?: string
  status: string
}

export async function POST(request: Request) {
  try {
    // Get the raw request body for signature verification
    const rawBody = await request.text()
    const body = JSON.parse(rawBody)

    // Get the signature from headers
    const signature = request.headers.get("x-reloadly-signature")

    if (!signature) {
      console.error("Missing Reloadly signature header")
      return NextResponse.json({ error: "Missing signature" }, { status: 401 })
    }

    // Verify the signature
    const isValid = verifySignature(rawBody, signature, process.env.RELOADLY_WEBHOOK_SECRET || "")

    if (!isValid) {
      console.error("Invalid Reloadly webhook signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Process the webhook event
    const { event, data } = body

    console.log(`Processing Reloadly webhook event: ${event}`, data)

    switch (event) {
      case "topup.successful":
      case "order.successful":
      case "utility.successful":
        await handleSuccessfulTransaction(data)
        break
      case "topup.failed":
      case "order.failed":
      case "utility.failed":
        await handleFailedTransaction(data)
        break
      // Add more event handlers as needed
      default:
        console.log(`Unhandled Reloadly webhook event: ${event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Reloadly webhook:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Verify the webhook signature
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac("sha512", secret)
    const expectedSignature = hmac.update(payload).digest("hex")

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  } catch (error) {
    console.error("Error verifying webhook signature:", error)
    return false
  }
}

// Handle successful transaction webhook
async function handleSuccessfulTransaction(data: WebhookData) {
  const { transactionId, customIdentifier, referenceId, status } = data

  // Determine which field to use as reference based on the event type
  const reference = customIdentifier || referenceId

  if (!transactionId || !reference) {
    console.error("Missing required fields in webhook data", data)
    return
  }

  try {
    // Update the order in your database
    await prisma.order.updateMany({
      where: {
        paymentReference: reference,
      },
      data: {
        status: status.toLowerCase(),
        transactionId: transactionId.toString(),
        updatedAt: new Date(),
      },
    })

    console.log(`Successfully updated order with reference ${reference} to status ${status}`)

    // You might want to send an email notification here
  } catch (error) {
    console.error(`Failed to update order for transaction ${transactionId}:`, error)
  }
}

// Handle failed transaction webhook
async function handleFailedTransaction(data: WebhookData) {
  const { transactionId, customIdentifier, referenceId, status } = data

  // Determine which field to use as reference based on the event type
  const reference = customIdentifier || referenceId

  if (!transactionId || !reference) {
    console.error("Missing required fields in webhook data", data)
    return
  }

  try {
    // Update the order in your database
    await prisma.order.updateMany({
      where: {
        paymentReference: reference,
      },
      data: {
        status: status.toLowerCase(),
        updatedAt: new Date(),
      },
    })

    console.log(`Updated failed order with reference ${reference} to status ${status}`)

    // You might want to send an email notification here
  } catch (error) {
    console.error(`Failed to update order for transaction ${transactionId}:`, error)
  }
}
