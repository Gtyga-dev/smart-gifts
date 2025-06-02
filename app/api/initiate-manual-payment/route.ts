// app/api/initiate-manual-payment/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { redis } from "@/app/lib/redis";
import type { Cart } from "@/app/lib/interfaces";

interface PaymentDetails {
  userId: string;
  amount: number;
  cartKey: string;
}

export async function POST(req: NextRequest) {
  // 0) Parse JSON payload
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    console.error("Invalid JSON:", err);
    return NextResponse.json(
      { success: false, message: "Invalid JSON payload" },
      { status: 400 }
    );
  }

  const { depositId, paymentMethod, provider, accountNumber, transactionId, screenshot } = body;

  // 1) Validate required fields
  if (
    !depositId ||
    !paymentMethod ||
    !provider ||
    !accountNumber ||
    (!transactionId && !screenshot)
  ) {
    return NextResponse.json(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  // 2) Get payment session
  let pd: PaymentDetails | null;
  try {
    pd = await redis.get<PaymentDetails>(`payment-${depositId}`);
  } catch (err) {
    console.error("Redis GET paymentDetails error:", err);
    return NextResponse.json(
      { success: false, message: "Payment service unavailable" },
      { status: 503 }
    );
  }
  if (!pd) {
    return NextResponse.json(
      { success: false, message: "Invalid or expired payment session" },
      { status: 400 }
    );
  }

  // 3) Fetch cart
  let cart: Cart | null;
  try {
    cart = await redis.get<Cart>(pd.cartKey);
  } catch (err) {
    console.error("Redis GET cart error:", err);
    return NextResponse.json(
      { success: false, message: "Payment service unavailable" },
      { status: 503 }
    );
  }
  if (!cart?.items?.length) {
    return NextResponse.json(
      { success: false, message: "Cart not found or empty" },
      { status: 400 }
    );
  }

  // 4) Create order
  let order;
  try {
    order = await prisma.order.create({
      data: {
        userId: pd.userId,
        amount: pd.amount,
        status: "pending",
        paymentMethod,
        transactionId: transactionId ?? null,
        paymentReference: `${paymentMethod}-${provider}-${accountNumber}`,
        paymentScreenshot: screenshot ?? null,
        // Use actual cart.productType here, matching your Prisma schema
        productType: cart.productType,
      },
    });
  } catch (err) {
    console.error("Prisma order.create error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create order" },
      { status: 500 }
    );
  }

  // 5) Create order items
  const items = cart.items.map((i) => ({
    orderId: order.id,
    productId: i.id,
    quantity: i.quantity,
    priceAtTime: Math.round(i.price * 100),
    name: i.name,
    imageUrl: i.imageString,
  }));
  try {
    await prisma.orderItem.createMany({ data: items });
  } catch (err) {
    console.error("Prisma orderItem.createMany error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to create order items" },
      { status: 500 }
    );
  }

  // 6) Cleanup Redis
  try {
    await redis.del(pd.cartKey);
    await redis.del(`payment-${depositId}`);
  } catch (err) {
    console.warn("Redis cleanup warning:", err);
  }

  // 7) Return success
  return NextResponse.json({
    success: true,
    message: "Payment submitted for approval",
    data: { orderId: order.id },
  });
}
