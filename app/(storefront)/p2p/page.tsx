import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { P2PHeader } from "@/app/components/p2p/P2pHeader"
import { P2PMarketplace } from "@/app/components/p2p/P2pMarketplace"

export const dynamic = 'force-dynamic';



export const metadata = {
    title: "P2P Trading",
    description: "Buy and sell crypto, gift cards, and forex directly with other users",
}

function P2PLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-10 w-full mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array(6)
                    .fill(0)
                    .map((_, i) => (
                        <Skeleton key={i} className="h-64 w-full rounded-lg" />
                    ))}
            </div>
        </div>
    )
}

export default function P2PPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <P2PHeader />
            <Suspense fallback={<P2PLoading />}>
                <P2PMarketplace />
            </Suspense>
        </div>
    )
}
