// app/(storefront)/p2p/[id]/page.tsx

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/app/lib/db"
import { P2PListingDetails } from "@/app/components/p2p/P2pListingDetails"
import type { P2PListing } from "@/types/p2p"

interface P2PListingPageProps {
    // In Next.js 15+, `params` is now a Promise that must be awaited
    params: Promise<{ id: string }>
}

/**
 * Fetch a single P2P listing by its ID.
 * Returns `null` if not found.
 */
async function getP2PListing(id: string): Promise<P2PListing | null> {
    const listing = await prisma.p2PListing.findUnique({
        where: { id },
        include: {
            user: true,
            offers: {
                include: { user: true },
                orderBy: { createdAt: "desc" },
            },
        },
    })
    return listing ? (listing as unknown as P2PListing) : null
}

function P2PListingLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Skeleton className="h-64 w-full rounded-lg mb-6" />
                    <Skeleton className="h-8 w-full mb-4" />
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
                <div>
                    <Skeleton className="h-64 w-full rounded-lg mb-6" />
                    <Skeleton className="h-10 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    )
}

export async function generateStaticParams(): Promise<Array<{ id: string }>> {
    try {
        const listings = await prisma.p2PListing.findMany({
            select: { id: true },
            take: 10, // safety limit
        })
        return listings.map(({ id }) => ({ id }))
    } catch (error) {
        console.error("Static Generation Error:", error)
        return []
    }
}

export default async function P2PListingPage({
    params,
}: P2PListingPageProps) {
    // 🔑 Await the params promise before using `.id`
    const { id: listingId } = await params
    const listing = await getP2PListing(listingId)

    if (!listing) {
        notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Suspense fallback={<P2PListingLoading />}>
                <P2PListingDetails listing={listing} />
            </Suspense>
        </div>
    )
}
