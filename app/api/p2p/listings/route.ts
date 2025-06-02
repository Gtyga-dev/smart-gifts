import { NextResponse } from "next/server"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import prisma from "@/app/lib/db"
import { notifyListingSubmission } from "@/app/components/dashboard/p2p/actions"


export async function POST(req: Request) {
    try {
        const { getUser } = getKindeServerSession()
        const user = await getUser()

        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { type, assetType, assetName, quantity, price, priceType, paymentMethod, description, terms } = body

        // Validate required fields
        if (!type || !assetType || !assetName || !quantity || !price || !paymentMethod) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        // Get user details for email notification
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { email: true, firstName: true },
        })

        if (!dbUser || !dbUser.email) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Create the P2P listing with pending status
        const listing = await prisma.p2PListing.create({
            data: {
                type,
                assetType,
                assetName,
                quantity,
                price,
                priceType,
                paymentMethod,
                description,
                terms: terms || "",
                status: "pending", // All listings start as pending
                userId: user.id,
            },
        })

        // Send email notification asynchronously
        notifyListingSubmission(listing.id, dbUser.email, dbUser.firstName, assetName).catch((error) => {
            console.error("Failed to send listing submission email:", error)
        })

        return NextResponse.json(listing, { status: 201 })
    } catch (error) {
        console.error("Error creating P2P listing:", error)
        return NextResponse.json({ error: "Failed to create listing" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get("type")
        const assetType = searchParams.get("assetType")
        const status = searchParams.get("status") || "active" // Default to active listings only

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = { status }

        if (type) {
            filter.type = type
        }

        if (assetType) {
            filter.assetType = assetType
        }

        // Get the listings
        const listings = await prisma.p2PListing.findMany({
            where: filter,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                    },
                },
                _count: {
                    select: {
                        offers: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(listings)
    } catch (error) {
        console.error("Error fetching P2P listings:", error)
        return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 })
    }
}
