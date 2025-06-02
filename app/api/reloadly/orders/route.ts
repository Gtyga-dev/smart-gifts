import { NextResponse } from "next/server"
import { getReloadlyToken } from "@/app/lib/reloadly"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export async function POST(request: Request) {
  try {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { productId, quantity = 1, unitPrice, recipientEmail, recipientPhone } = await request.json()

    if (!productId || !unitPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Generate a unique reference for this order
    const customIdentifier = `smartcards-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

    const token = await getReloadlyToken()

    // Create the order in Reloadly
    const response = await fetch("https://giftcards-sandbox.reloadly.com/orders", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/com.reloadly.giftcards-v1+json"
      },
      body: JSON.stringify({
        productId: Number.parseInt(productId),
        countryCode: "MW", // Malawi
        quantity,
        unitPrice,
        customIdentifier,
        senderName: `${user.given_name || ""} ${user.family_name || ""}`.trim() || "Smart Cards User",
        recipientEmail: recipientEmail || user.email,
        recipientPhoneDetails: recipientPhone
          ? {
              countryCode: "MW",
              phoneNumber: recipientPhone,
            }
          : undefined,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("Reloadly order error:", errorData)
      return NextResponse.json(
        { error: errorData.message || "Failed to create order" }, 
        { status: response.status }
      )
    }

    const orderData = await response.json()

    // Create a record in your database
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        amount: orderData.amount,
        status: orderData.status.toLowerCase(),
        paymentMethod: "reloadly",
        paymentReference: customIdentifier,
        transactionId: orderData.transactionId.toString(),
        productType: "giftcard",
        items: {
          create: {
            productId: productId.toString(),
            quantity,
            priceAtTime: unitPrice,
            name: orderData.product?.productName || "Gift Card",
            imageUrl: orderData.product?.productImage || "",
          },
        },
      },
    })

    // Create initial reloadly transaction record
    await prisma.reloadlyTransaction.create({
      data: {
        externalId: orderData.transactionId.toString(),
        orderId: order.id,
        status: "pending",
        amount: orderData.amount,
        recipientEmail: recipientEmail || user.email,
        metadata: {
          customIdentifier,
          productId,
          productName: orderData.product?.productName,
          createdAt: new Date().toISOString()
        },
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      reloadlyTransactionId: orderData.transactionId,
      status: orderData.status,
    })
  } catch (error) {
    console.error("Error creating Reloadly order:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}