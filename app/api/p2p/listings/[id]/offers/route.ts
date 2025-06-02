import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"

/**
 * Create a new offer on a P2P listing
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ← params is now a Promise :contentReference[oaicite:0]{index=0}
): Promise<NextResponse> {
  try {
    const { id: listingId } = await params        // ← await before using .id
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify listing exists
    const listing = await prisma.p2PListing.findUnique({
      where: { id: listingId },
    })
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 })
    }

    // Prevent self‑offers
    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: "You cannot make an offer on your own listing" },
        { status: 400 }
      )
    }

    const { amount, message } = await req.json()
    if (!amount) {
      return NextResponse.json(
        { error: "Offer amount is required" },
        { status: 400 }
      )
    }

    const offer = await prisma.p2POffer.create({
      data: {
        amount,
        message: message || "",
        status: "pending",
        listingId,
        userId: user.id,
      },
    })

    return NextResponse.json(offer, { status: 201 })
  } catch (error) {
    console.error("Error creating P2P offer:", error)
    return NextResponse.json(
      { error: "Failed to create offer" },
      { status: 500 }
    )
  }
}

/**
 * Fetch all offers for a given P2P listing
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ← same here :contentReference[oaicite:1]{index=1}
): Promise<NextResponse> {
  try {
    const { id: listingId } = await params

    const offers = await prisma.p2POffer.findMany({
      where: { listingId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profileImage: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(offers)
  } catch (error) {
    console.error("Error fetching P2P offers:", error)
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    )
  }
}
