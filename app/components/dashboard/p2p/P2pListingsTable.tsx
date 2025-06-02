import Link from "next/link"
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

async function getP2PListings() {
    noStore()
    try {
        const listings = await prisma.p2PListing.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
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
            take: 10,
        })

        return listings
    } catch (error) {
        console.error("Failed to fetch P2P listings:", error)
        return []
    }
}

export async function P2PListingsTable() {
    const listings = await getP2PListings()

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent P2P Listings</CardTitle>
                <CardDescription>Manage and monitor P2P listings on the platform</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Asset</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Offers</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {listings.map((listing) => (
                            <TableRow key={listing.id}>
                                <TableCell>
                                    {listing.user.firstName} {listing.user.lastName}
                                </TableCell>
                                <TableCell>
                                    <Badge
                                        variant={listing.type === "buy" ? "outline" : "default"}
                                        className={
                                            listing.type === "buy"
                                                ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                : "bg-green-500/10 text-green-500 border-green-500/20"
                                        }
                                    >
                                        {listing.type === "buy" ? "Buying" : "Selling"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{listing.assetName}</div>
                                    <div className="text-xs text-muted-foreground">{listing.assetType}</div>
                                </TableCell>
                                <TableCell>${new Intl.NumberFormat("en-US").format(listing.price / 100)}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            listing.status === "active" ? "default" : listing.status === "completed" ? "outline" : "secondary"
                                        }
                                        className={
                                            listing.status === "active"
                                                ? "bg-green-500/10 text-green-500 border-green-500/20"
                                                : listing.status === "completed"
                                                    ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                    : "bg-orange-500/10 text-orange-500 border-orange-500/20"
                                        }
                                    >
                                        {listing.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{listing._count.offers}</TableCell>
                                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
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
                                            <DropdownMenuItem asChild>
                                                <Link href={`/p2p/${listing.id}`}>View Details</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>Edit Status</DropdownMenuItem>
                                            <DropdownMenuItem className="text-destructive">Remove Listing</DropdownMenuItem>
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
