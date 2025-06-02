"use server"

import { redis } from "@/app/lib/redis"
import type { Cart } from "@/app/lib/interfaces"

/**
 * Updates the quantity of an item in the user's cart
 */
export async function updateQuantityAction(productId: string, newQuantity: number, userId: string) {
    // Get the current cart
    const cart: Cart | null = await redis.get(`cart-${userId}`)

    if (!cart) {
        throw new Error("Cart not found")
    }

    // If quantity is 0 or less, remove the item
    if (newQuantity <= 0) {
        cart.items = cart.items.filter((item) => item.id !== productId)
    } else {
        // Otherwise update the quantity
        const itemIndex = cart.items.findIndex((item) => item.id === productId)

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity = newQuantity
        }
    }

    // Save the updated cart
    await redis.set(`cart-${userId}`, cart)

    return { success: true }
}
