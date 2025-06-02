import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/app/lib/db"
import { redis } from "@/app/lib/redis"

interface CartItem {
  id: string
  price: number
  quantity: number
  name: string
  imageString: string
}

interface Cart {
  userId: string
  items: CartItem[]
}

interface PaychanguVerificationResponse {
  status: string
  message: string
  data: {
    status: string
    tx_ref: string
    currency: string
    amount: number
    reference: string
    // ... other fields
  }
}

export async function GET(req: NextRequest) {
  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] Starting payment verification`)

  try {
    const { searchParams } = new URL(req.url)
    const tx_ref = searchParams.get("tx_ref")
    const email = searchParams.get("email")

    console.log(`[${requestId}] Received params:`, { tx_ref, email })

    if (!tx_ref || !email) {
      console.error(`[${requestId}] Missing required parameters`, { tx_ref, email })
      return NextResponse.json(
        {
          success: false,
          message: "Transaction reference and email are required",
        },
        { status: 400 },
      )
    }

    if (!process.env.PAYCHANGU_SECRET_KEY) {
      console.error(`[${requestId}] PAYCHANGU_SECRET_KEY is not defined`)
      return NextResponse.json(
        {
          success: false,
          message: "Payment provider configuration error",
        },
        { status: 500 },
      )
    }

    console.log(`[${requestId}] Verifying payment with Paychangu for tx_ref: ${tx_ref}`)
    let paymentData: PaychanguVerificationResponse

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(
        `https://api.paychangu.com/verify-payment/${tx_ref}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYCHANGU_SECRET_KEY}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      ).finally(() => clearTimeout(timeoutId));

      console.log(`[${requestId}] Paychangu HTTP status:`, response.status)
      const text = await response.text()
      console.log(`[${requestId}] Paychangu raw body:`, text)

      if (!response.ok) {
        console.error(
          `[${requestId}] Paychangu API returned error`,
          { status: response.status, body: text }
        )
        return NextResponse.json(
          {
            success: false,
            message: "Payment verification API error",
            details: `Status: ${response.status}`,
          },
          { status: 502 },
        )
      }

      paymentData = JSON.parse(text) as PaychanguVerificationResponse
    } catch (apiError) {
      console.error(`[${requestId}] Error calling Paychangu API:`, apiError)
      return NextResponse.json(
        {
          success: false,
          message: "Error verifying payment with provider",
          error: apiError instanceof Error ? apiError.message : "Unknown API error",
        },
        { status: 500 },
      )
    }

    if (
      paymentData.status !== "success" ||
      paymentData.data?.status !== "success" ||
      paymentData.data?.tx_ref !== tx_ref ||
      paymentData.data?.currency !== "MWK"
    ) {
      console.error(
        `[${requestId}] Payment verification failed:`,
        {
          gatewayStatus: paymentData.status,
          transactionStatus: paymentData.data?.status,
          returnedTxRef: paymentData.data?.tx_ref,
          currency: paymentData.data?.currency,
        }
      )
      return NextResponse.json(
        {
          success: false,
          message: "Payment verification failed",
          details: "Transaction not successful or mismatch",
        },
        { status: 400 },
      )
    }

    console.log(`[${requestId}] Finding user with email: ${email}`)
    const user = await prisma.user.findFirst({
      where: { email: { equals: email.toLowerCase().trim(), mode: "insensitive" } },
      select: { id: true },
    })

    if (!user) {
      console.error(`[${requestId}] User not found for email:`, email)
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      )
    }

    console.log(`[${requestId}] Fetching cart for user ID: ${user.id}`)
    const cartKey = `cart-${user.id}`
    let cart: Cart | null
    try {
      cart = await redis.get<Cart>(cartKey)
    } catch (redisError) {
      console.error(`[${requestId}] Redis error:`, redisError)
      return NextResponse.json(
        {
          success: false,
          message: "Error retrieving cart data",
          error: redisError instanceof Error ? redisError.message : "Unknown Redis error",
        },
        { status: 500 },
      )
    }

    if (!cart?.items?.length) {
      console.error(`[${requestId}] Cart not found or empty for user:`, user.id)
      return NextResponse.json(
        { success: false, message: "Cart not found or empty" },
        { status: 404 },
      )
    }

    const cartTotal = cart.items.reduce((sum, item) => sum + item.price * 100 * item.quantity, 0)
    console.log(`[${requestId}] Cart total: ${cartTotal}`)

    console.log(`[${requestId}] Creating order`)
    let order
    try {
      order = await prisma.$transaction(async (tx) => {
        const o = await tx.order.create({
          data: {
            userId: user.id,
            amount: cartTotal,
            status: "completed",
            paymentMethod: "paychangu",
            paymentReference: tx_ref,
            transactionId: tx_ref,
            productType: "default",
          },
        })
        await tx.orderItem.createMany({
          data: cart!.items.map((i) => ({
            orderId: o.id,
            productId: i.id.toString(),
            quantity: i.quantity,
            priceAtTime: i.price,
            name: i.name,
            imageUrl: i.imageString,
          })),
        })
        return o
      })
    } catch (dbError) {
      console.error(`[${requestId}] Database error:`, dbError)
      return NextResponse.json(
        {
          success: false,
          message: "Error creating order",
          error: dbError instanceof Error ? dbError.message : "Unknown DB error",
        },
        { status: 500 },
      )
    }

    await redis.del(cartKey)
    console.log(`[${requestId}] Order ${order.id} created successfully`)

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { orderId: order.id, status: "completed" },
      },
      { status: 200 },
    )
  } catch (error) {
    console.error(`[${requestId}] Unhandled error:`, error)
    return NextResponse.json(
      {
        success: false,
        message: "Error processing payment verification",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
