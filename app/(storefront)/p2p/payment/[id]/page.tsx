// app/(storefront)/p2p/payment/[id]/page.tsx

import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import prisma from "@/app/lib/db"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { P2PPaymentForm } from "@/app/components/p2p/P2pPaymentForm"
import type { P2PTransaction } from "@/types/p2p"

interface P2PPaymentPageProps {
    // Next.js 15 now passes params & searchParams as Promises :contentReference[oaicite:0]{index=0}
    params: Promise<{ id: string }>
    searchParams: Promise<{ offerId?: string }>
}

async function getP2PTransaction(
    id: string,
    userId: string
): Promise<P2PTransaction | null> {
    const tx = await prisma.p2PTransaction.findUnique({
        where: { id, buyerId: userId },
        include: {
            listing: { include: { user: true } },
            buyer: true,
            seller: true,
        },
    })
    return tx ? (tx as unknown as P2PTransaction) : null
}

function P2PPaymentLoading() {
    return (
        <div className="container mx-auto px-4 py-8">
            <Skeleton className="h-12 w-64 mb-6" />
            <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
    )
}

export default async function P2PPaymentPage({
    params,
    searchParams,
}: P2PPaymentPageProps) {
    // 🔑 Await both params & searchParams before accessing their properties :contentReference[oaicite:1]{index=1}
    const { id } = await params
    const { offerId } = await searchParams

    // Auth guard
    const { getUser } = getKindeServerSession()
    const user = await getUser()
    if (!user?.id) {
        return redirect("/")
    }

    const transaction = await getP2PTransaction(id, user.id)
    if (!transaction) {
        return notFound()
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Complete Your P2P Payment</h1>
            <Suspense fallback={<P2PPaymentLoading />}>
                <P2PPaymentForm transaction={{ ...transaction, listing: { ...transaction.listing, quantity: String(transaction.listing.quantity) } }} offerId={offerId} />
            </Suspense>
        </div>
    )
}
