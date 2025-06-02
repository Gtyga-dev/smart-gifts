import prisma from "@/app/lib/db";
import { clearCart } from "@/app/lib/cart";
import { redis } from "@/app/lib/redis";
import { Cart } from "@/app/lib/interfaces";

interface CreateOrderParams {
  userId: string;
  amount: number; // We'll keep this but use cart amount instead
  paymentReference: string;
  email: string;
  requestId: string;
}

export class OrderService {
  private static async getCart(userId: string): Promise<Cart | null> {
    try {
      return await redis.get(`cart-${userId}`);
    } catch (error) {
      console.error(`Failed to get cart for user ${userId}:`, error);
      return null;
    }
  }

  private static calculateCartTotal(cart: Cart): number {
    return cart.items.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
  }

  private static async saveOrderItems(orderId: string, cart: Cart) {
    const orderItems = cart.items.map((item) => ({
      orderId,
      productId: item.id.toString(),
      quantity: item.quantity,
      priceAtTime: item.price,
      name: item.name,
      imageUrl: item.imageString,
    }));

    await prisma.orderItem.createMany({
      data: orderItems,
    });
  }

  public static async createOrder({
    userId,
    paymentReference,
    requestId,
  }: CreateOrderParams) {
    console.log(`[${requestId}] Starting order creation process for ${userId}`);

    // Get cart before any operations
    const cart = await this.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      console.error(`[${requestId}] No cart found or empty cart for user ${userId}`);
      throw new Error("Cart not found or empty");
    }

    // Calculate total from cart
    const cartTotal = this.calculateCartTotal(cart);
    console.log(`[${requestId}] Cart total calculated: ${cartTotal}`);

    try {
      // Use a transaction to ensure data consistency
      const result = await prisma.$transaction(async (tx) => {
        // Check for existing order first
        const existingOrder = await tx.order.findFirst({
          where: {
            OR: [
              { paymentReference },
              { transactionId: paymentReference },
            ],
          },
          include: {
            items: true,
          },
        });

        if (existingOrder) {
          console.log(`[${requestId}] Order already exists:`, existingOrder.id);
          return { order: existingOrder, isNew: false };
        }

        // Create new order with cart amount
        const order = await tx.order.create({
          data: {
            userId,
            amount: cartTotal, // Using cart amount instead of payment amount
            status: "completed",
            paymentMethod: "paychangu",
            paymentReference,
            transactionId: paymentReference,
            productType: "default", // Add a valid value for productType
          },
        });

        // Save order items
        await this.saveOrderItems(order.id, cart);

        console.log(`[${requestId}] Created order:`, order.id);
        return { order, isNew: true };
      });

      // After successful transaction, attempt to clear cart
      if (result.isNew) {
        const cartCleared = await clearCart(userId);
        console.log(
          `[${requestId}] Cart clearing ${cartCleared ? "successful" : "failed"}`
        );
      }

      return {
        success: true,
        orderId: result.order.id,
        isNew: result.isNew,
      };
    } catch (error) {
      console.error(`[${requestId}] Order creation failed:`, error);
      throw error;
    }
  }
}

