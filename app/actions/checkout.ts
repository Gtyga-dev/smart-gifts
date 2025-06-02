"use server";

import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redis } from "@/app/lib/redis";
import type { Cart } from "@/app/lib/interfaces";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { completeReferral } from "./referral";
import { revalidatePath } from "next/cache";

export async function checkOut() {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return redirect("/");
    }

    const cart: Cart | null = await redis.get(`cart-${user.id}`);

    if (!cart || !cart.items || cart.items.length === 0) {
      return redirect("/products/all?error=empty-cart");
    }

    const depositId = crypto.randomUUID();

    // Calculate amount in USD
    const amountInUSD = cart.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Validate the amount
    if (amountInUSD <= 0) {
      return redirect("/products/all?error=invalid-amount");
    }

    // Convert USD to MWK
    const exchangeRate = 4000;
    const amountInMWK = Math.round(amountInUSD * exchangeRate * 100) / 100;

    // Store payment details in Redis for verification
    await redis.set(
      `payment-${depositId}`,
      {
        userId: user.id,
        amount: amountInMWK,
        cartKey: `cart-${user.id}`,
        items: cart.items,
        timestamp: new Date().toISOString(),
      },
      { ex: 3600 } // Expire in 1 hour
    );

    // After successful checkout, check if this user has a pending referral
    // and complete it if the order amount meets the requirements
    try {
      const referralResult = await completeReferral(
        user.id,
        depositId,
        amountInUSD * 100
      ); // Convert to cents

      if (referralResult) {
        console.log("Referral completed successfully:", referralResult.id);
        // Revalidate paths to update UI
        revalidatePath("/dashboard/referrals");
      } else {
        console.log("No pending referral or not eligible for completion");
      }
    } catch (referralError) {
      // Log but don't fail the checkout if referral processing fails
      console.error(
        "Error processing referral during checkout:",
        referralError
      );
    }

    // Store checkout analytics
    await redis.lpush("recent_checkouts", {
      userId: user.id,
      amount: amountInUSD,
      itemCount: cart.items.length,
      timestamp: new Date().toISOString(),
    });

    return redirect(`/payment-page?orderId=${depositId}`);
  } catch (error) {
    console.error("Error during checkout:", error);
    return redirect("/products/all?error=checkout-failed");
  }
}
