import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import { unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { PendingP2PListings } from "@/app/components/dashboard/p2p/PendingP2pListings"

const allowedEmails = [
    "geofreypaul40@gmail.com",
    "thalapatrick2003@gmail.com",
    "makungwafortune78@gmail.com",
    "msosadaina@gmail.com",
    "mikefchimwaza03@gmail.com",
    "brendaallie577@gmail.com",
]

function PendingListingsLoading() {
    return (
        <>
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-96 w-full" />
        </>
    )
}

export default async function PendingP2PListingsPage() {
    noStore()

    const { getUser } = getKindeServerSession()
    const user = await getUser()

    if (!user || !user.email || !allowedEmails.includes(user.email)) {
        return redirect("/")
    }

    return (
        <>
            <h1 className="text-3xl font-bold mb-6">Pending P2P Listings</h1>
            <Suspense fallback={<PendingListingsLoading />}>
                <PendingP2PListings />
            </Suspense>
        </>
    )
}
