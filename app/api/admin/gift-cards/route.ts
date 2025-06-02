import { NextResponse } from "next/server"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"

export async function GET() {
  try {
    const { getUser } = getKindeServerSession()

    const user = await getUser()

    if (!user || !user.id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin (you'll need to implement this check based on your user roles)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true }, // Add role field if you have it
    })

    if (!dbUser) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Fetch gift card orders
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { productType: { in: ["giftcard", "gift_card"] } },
          { items: { some: { name: { contains: "gift card", mode: "insensitive" } } } },
        ],
      },
      include: {
        User: {
          select: {
            firstName: true,
            email: true,
          },
        },
        items: {
          select: {
            name: true,
            productId: true,
          },
        },
        ReloadlyTransaction: {
          select: {
            id: true,
            status: true,
            metadata: true,
            externalId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Error fetching gift card orders:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error fetching gift card orders",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
