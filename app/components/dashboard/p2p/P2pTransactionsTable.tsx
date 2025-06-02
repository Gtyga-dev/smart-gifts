import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal } from "lucide-react"
import prisma from "@/app/lib/db"
import { unstable_noStore as noStore } from "next/cache"

async function getP2PTransactions() {
    noStore()
    try {
        const transactions = await prisma.p2PTransaction.findMany({
            include: {
                buyer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                listing: {
                    select: {
                        id: true,
                        assetName: true,
                        assetType: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 10,
        })

        return transactions
    } catch (error) {
        console.error("Failed to fetch P2P transactions:", error)
        return []
    }
}

export async function P2PTransactionsTable() {
    const transactions = await getP2PTransactions()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent P2P Transactions</CardTitle>
                <CardDescription>Monitor and manage P2P transactions between users</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Transaction ID</TableHead>
                            <TableHead>Buyer</TableHead>
                            <TableHead>Seller</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell className="font-mono text-xs">{transaction.id.substring(0, 8)}...</TableCell>
                                <TableCell>
                                    {transaction.buyer.firstName} {transaction.buyer.lastName}
                                </TableCell>
                                <TableCell>
                                    {transaction.seller.firstName} {transaction.seller.lastName}
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{transaction.listing.assetName}</div>
                                    <div className="text-xs text-muted-foreground">{transaction.listing.assetType}</div>
                                </TableCell>
                                <TableCell>${new Intl.NumberFormat("en-US").format(transaction.amount / 100)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            transaction.status === "completed"
                                                ? "default"
                                                : transaction.status === "pending"
                                                    ? "outline"
                                                    : "secondary"
                                        }
                                        className={
                                            transaction.status === "completed"
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : transaction.status === "pending"
                                                    ? "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                        }
                                    >
                                        {transaction.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon">
                                                <MoreHorizontal className="h-4 w-4" />
                                                <span className="sr-only">Open menu</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem>View Details</DropdownMenuItem>
                                            <DropdownMenuItem>Update Status</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Cancel Transaction</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
