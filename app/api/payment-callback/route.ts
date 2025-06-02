import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/db";
import { redis } from "@/app/lib/redis";
import { Cart } from "@/app/lib/interfaces";

// Define the payment details interface
interface PaymentDetails {
  userId: string;
  amount: number;
  cartKey: string;
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { depositId, status } = data;

    if (status !== "COMPLETED") {
      return NextResponse.json({
        success: false,
        message: `Payment status: ${status}`,
      });
    }

    // Get payment details from Redis with proper typing
    const paymentDetails = await redis.get<PaymentDetails>(
      `payment-${depositId}`
    );
    if (!paymentDetails) {
      return NextResponse.json({
        success: false,
        message: "Payment details not found",
      });
    }

    // Get cart
    const cart = await redis.get<Cart>(paymentDetails.cartKey);
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Cart not found or empty",
      });
    }

    // Create order and order items
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: paymentDetails.userId,
          amount: Math.round(paymentDetails.amount), // Convert to integer as per schema
          status: "completed",
          paymentMethod: "pawapay",
          transactionId: depositId,
          paymentReference: depositId, // Add payment reference
          productType: "default", // Add a valid productType value
        },
      });

      const orderItems = cart.items.map((item) => ({
        orderId: order.id,
        productId: String(item.id), // Convert productId to string
        quantity: item.quantity,
        priceAtTime: Math.round(item.price * 100), // Convert to integer (cents)
        name: item.name,
        imageUrl: item.imageString,
      }));

      await tx.orderItem.createMany({ data: orderItems });
      return order;
    });

    // Clear cart and payment details
    await Promise.all([
      redis.del(paymentDetails.cartKey),
      redis.del(`payment-${depositId}`),
    ]);

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      data: { orderId: result.id },
    });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({
      success: false,
      message: "Error processing payment callback",
    });
  }
}
