import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, ArrowUpDown, CheckCircle, Users } from "lucide-react"
import prisma from "@/app/lib/db"
import { unstable_noStore as noStore } from "next/cache"

async function getP2PStats() {
    noStore()
    try {
        const [listings, transactions, activeUsers, totalVolume] = await Promise.all([
            prisma.p2PListing.count(),
            prisma.p2PTransaction.count(),
            prisma.p2PListing.groupBy({
                by: ["userId"],
                _count: true,
            }),
            prisma.p2PTransaction.aggregate({
                _sum: {
                    amount: true,
                },
            }),
        ])

        return {
            listings,
            transactions,
            activeUsers: activeUsers.length,
            totalVolume: totalVolume._sum.amount || 0,
        }
    } catch (error) {
        console.error("Failed to fetch P2P stats:", error)
        return {
            listings: 0,
            transactions: 0,
            activeUsers: 0,
            totalVolume: 0,
        }
    }
}

export async function P2PAdminStats() {
    const stats = await getP2PStats()

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Total Listings</CardTitle>
                    <ArrowUpDown className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.listings}</p>
                    <p className="text-xs text-muted-foreground">Active P2P listings on the platform</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Completed Trades</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.transactions}</p>
                    <p className="text-xs text-muted-foreground">Successfully completed P2P transactions</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Active Traders</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">{stats.activeUsers}</p>
                    <p className="text-xs text-muted-foreground">Users with active P2P listings</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle>Trading Volume</CardTitle>
                    <Activity className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <p className="text-2xl font-bold">${new Intl.NumberFormat("en-US").format(stats.totalVolume / 100)}</p>
                    <p className="text-xs text-muted-foreground">Total P2P trading volume</p>
                </CardContent>
            </Card>
        </div>
    )
}
