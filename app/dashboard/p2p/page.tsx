import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import { unstable_noStore as noStore } from "next/cache"
import { P2PAdminStats } from "@/app/components/dashboard/p2p/P2pAdminStats"
import { P2PListingsTable } from "@/app/components/dashboard/p2p/P2pListingsTable"
import { P2PTransactionsTable } from "@/app/components/dashboard/p2p/P2pTransactionsTable"

function P2PAdminLoading() {
    return (
        <>
            <Skeleton className="h-48 w-full mb-8" />
            <Skeleton className="h-96 w-full" />
        </>
    )
}

export default function P2PAdminPage() {
    noStore()
    return (
        <>
            <h1 className="text-3xl font-bold mb-6">P2P Trading Management</h1>
            <Suspense fallback={<P2PAdminLoading />}>
                <P2PAdminStats />
                <div className="grid grid-cols-1 gap-8 mt-8">
                    <P2PListingsTable />
                    <P2PTransactionsTable />
                </div>
            </Suspense>
        </>
    )
}
