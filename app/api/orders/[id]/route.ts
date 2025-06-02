import { type NextRequest, NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"

// Define the params type
type Params = {
  id: string
}

// GET handler
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }, // params is now a Promise
) {
  try {
    const { id: orderId } = await params // await the promise to extract `id`

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // Fetch the order with items
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId: user.id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // For airtime orders, get the recipient phone
    let recipientPhone: string | null = null
    if (order.productType === "airtime") {
      const transaction = await prisma.reloadlyTransaction.findFirst({
        where: { orderId: order.id },
        select: { recipientPhone: true },
      })
      recipientPhone = transaction?.recipientPhone ?? null
    }

    // For utility orders, get the account number from metadata
    let accountNumber: string | null = null
    if (order.productType === "utility") {
      const metadata = order.metadata as {
        billDetails?: {
          subscriberDetails?: {
            accountNumber?: string
          }
        }
      }
      if (metadata?.billDetails?.subscriberDetails?.accountNumber) {
        accountNumber = metadata.billDetails.subscriberDetails.accountNumber
      }
    }

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentReference: order.paymentReference,
      transactionId: order.transactionId,
      currency: order.currency,
      exchangeRate: order.exchangeRate,
      productType: order.productType,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: order.items,
      recipientPhone,
      accountNumber,
      metadata: order.metadata,
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

// PUT handler
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }, // likewise, params is a Promise here
) {
  try {
    const { id: orderId } = await params

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
    }

    // TODO: Implement your update logic here
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
