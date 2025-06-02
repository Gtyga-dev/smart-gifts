import { redis } from "@/app/lib/redis";

export async function clearCart(
  userId: string,
  maxRetries = 3
): Promise<boolean> {
  const cartKey = `cart-${userId}`;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await redis.del(cartKey);
      return true;
    } catch (error) {
      if (attempt === maxRetries) {
        console.error(
          `Failed to clear cart after ${maxRetries} attempts:`,
          error
        );
        return false;
      }
      // Wait before retrying (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
  }
  return false;
}
