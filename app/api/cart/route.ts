import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redis } from "@/app/lib/redis"
import { NextResponse } from "next/server"
import type { Cart } from "@/app/lib/interfaces"

export async function GET() {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cart: Cart | null = await redis.get(`cart-${user.id}`)

    return NextResponse.json({
        cart: cart || { items: [] },
        user: {
            id: user.id,
            email: user.email,
            given_name: user.given_name,
        },
    })
}
