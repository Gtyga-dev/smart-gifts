/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import prisma from "@/app/lib/db"
import { Resend } from "resend"
import OrderApprovedEmail from "@/emails/OrderApproved"
import OrderRejectedEmail from "@/emails/OrderRejectedEmail"
import GiftCardDeliveryEmail from "@/emails/GiftCardDeliveryEmail"
import {
  orderGiftCard,
  getGiftCardOrder,
  getProductById
} from "@/app/lib/reloadly-giftcards"

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function getPendingOrders() {
  return prisma.order.findMany({
    where: { status: "pending" },
    select: {
      id: true,
      amount: true,
      createdAt: true,
      status: true,
      transactionId: true,
      paymentMethod: true,
      currency: true,
      productType: true,
      User: { select: { firstName: true, email: true, id: true } },
      items: { select: { name: true, quantity: true, priceAtTime: true, productId: true } },
      ReloadlyTransaction: {
        select: { externalId: true, id: true, metadata: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function approveOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "approved" },
    include: {
      User: { select: { email: true, firstName: true } },
      items: { select: { name: true, quantity: true, priceAtTime: true, productId: true } },
    },
  })

  const isGiftCard =
    order.productType?.toLowerCase().includes("giftcard") ||
    order.items.some(i => i.name.toLowerCase().includes("gift card"))

  if (isGiftCard && order.items.length > 0) {
    const customId = `${orderId}-${Date.now()}`
    
    // Get the productId from the first item
    const rawProductId = order.items[0].productId
    if (!rawProductId) {
      throw new Error("Product ID is missing for gift card order")
    }
    
    // Extract the numeric Reloadly product ID if it's in the format "reloadly-{id}"
    let reloadlyProductId = rawProductId
    if (rawProductId.startsWith('reloadly-')) {
      reloadlyProductId = rawProductId.split('-')[1]
    }
    
    // Get product details to validate price and get country code
    const productDetails = await getProductById(reloadlyProductId)
    if (!productDetails) {
      throw new Error(`Failed to fetch product details for ID: ${reloadlyProductId}`)
    }

    const payload = {
      customIdentifier: customId,
      productId: Number(reloadlyProductId),
      countryCode: productDetails.country?.isoName,
      quantity: Number(order.items[0].quantity),
      senderName: order.User?.firstName || "Sender",
      unitPrice: productDetails.fixedRecipientDenominations?.[0] || Number(order.items[0].priceAtTime) / 100,
      recipientEmail: order.User?.email || undefined,
      preOrder: false
    }

    try {
      console.log("Submitting gift card order with payload:", JSON.stringify(payload))
      const orderResult = await orderGiftCard(payload)
      
      // Add a delay before fetching the gift card details
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const status = await getGiftCardOrder(orderResult.transactionId.toString())

      await prisma.reloadlyTransaction.create({
        data: {
          externalId: status.redemptionCode.toString(),
          orderId: order.id,
          metadata: status,
          status: "completed",
          amount: order.amount,
        },
      })

      await prisma.order.update({
        where: { id: order.id },
        data: { status: "completed" },
      })

      await sendGiftCardEmail(
        order.User!.email,
        order.id,
        order.items[0].name,
        order.amount,
        order.currency || "USD",
        status
      )
    } catch (error) {
      console.error("Error processing gift card order:", error)
      throw error
    }
  }

  if (order.User?.email && resend) {
    await resend.emails.send({
      from: "support@smartcards.store",
      to: [order.User.email],
      subject: "Order Approved",
      react: OrderApprovedEmail({ orderId: order.id, productNames: order.items.map(i => i.name).join(", ") }),
    })
  }

  return { success: true, order }
}

export async function rejectOrder(orderId: string) {
  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: "rejected" },
    include: { User: { select: { email: true } } },
  })
  if (order.User?.email && resend) {
    await resend.emails.send({
      from: "support@smartcards.store",
      to: [order.User.email],
      subject: "Order Rejected",
      react: OrderRejectedEmail({ orderId: order.id }),
    })
  }
  return { success: true, order }
}

export async function resendGiftCard(orderId: string) {
  const tx = await prisma.reloadlyTransaction.findFirst({
    where: { orderId },
    orderBy: { createdAt: "desc" },
  })
  if (!tx) throw new Error("No Reloadly transaction found")

  const details = await getGiftCardOrder(tx.externalId)

  await sendGiftCardEmail(
    (await prisma.order.findUnique({ where: { id: orderId }, include: { User: true } }))!
      .User!.email,
    orderId,
    details.redemptionCode || "Gift Card",
    (await prisma.order.findUnique({ where: { id: orderId } }))!.amount,
    (await prisma.order.findUnique({ where: { id: orderId } }))!.currency || "USD",
    details
  )

  await prisma.order.update({ where: { id: orderId }, data: { emailSent: true } })
  return { success: true }
}

async function sendGiftCardEmail(
  to: string,
  orderId: string,
  productName: string,
  amount: number,
  currency: string,
  details: any
) {
  if (!resend) throw new Error("Email service not configured")
  await resend.emails.send({
    from: "support@smartcards.store",
    to: [to],
    subject: `Your ${productName} is Ready!`,
    react: GiftCardDeliveryEmail({
      orderId,
      productName,
      firstName: "",
      amount: amount / 100,
      currency,
      redemptionCode: details.redemptionCode,
      pinCode: details.pinCode,
      redemptionInstructions: details.redemptionInstructions || undefined,
    }),
  })
}

export async function sendEmail(to: string, subject: string, content: { react: React.ReactElement }) {
  if (!resend) throw new Error("Email service not configured")
  await resend.emails.send({
    from: "support@smartcards.store",
    to: [to],
    subject,
    react: content.react,
  })
}