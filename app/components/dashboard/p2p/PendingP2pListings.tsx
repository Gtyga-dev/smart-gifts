"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { approveListing, getPendingListings, rejectListing } from "./actions"

// Define the P2PListing type
type P2PListing = {
    id: string
    type: string
    assetType: string
    assetName: string
    price: number
    status: string
    createdAt: Date
    user: { email: string; firstName: string; lastName: string }
}

export function PendingP2PListings() {
    const { toast } = useToast()
    const [listings, setListings] = useState<P2PListing[]>([])
    const [loading, setLoading] = useState(true)
    const [actionInProgress, setActionInProgress] = useState<string | null>(null)

    // Fetch listings on mount
    useEffect(() => {
        const fetchListings = async () => {
            try {
                const data = await getPendingListings()
                setListings(data)
            } catch (error) {
                console.error("Failed to fetch listings:", error)
                toast({
                    title: "Error",
                    description: "Failed to load pending listings",
                    variant: "destructive",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchListings()
    }, [toast])

    const handleAction = async (listingId: string, action: "approve" | "reject") => {
        try {
            setActionInProgress(listingId)

            let result
            if (action === "approve") {
                result = await approveListing(listingId)
            } else {
                result = await rejectListing(listingId)
            }

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Listing has been ${action === "approve" ? "approved" : "rejected"}`,
                })

                // Remove listing from UI
                setListings((prev) => prev.filter((listing) => listing.id !== listingId))
            } else {
                throw new Error(result.error || `Failed to ${action} listing`)
            }
        } catch (error) {
            console.error(`Failed to ${action} listing:`, error)
            toast({
                title: "Error",
                description: `Failed to ${action} listing. Please try again.`,
                variant: "destructive",
            })
        } finally {
            setActionInProgress(null)
        }
    }

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Pending Listings</CardTitle>
                    <CardDescription>Loading listings...</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pending P2P Listings</CardTitle>
                <CardDescription>Review and approve pending P2P listings</CardDescription>
            </CardHeader>
            <CardContent>
                {listings.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No pending listings to review</div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Asset</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listings.map((listing) => (
                                <TableRow key={listing.id}>
                                    <TableCell>
                                        <p className="font-medium">
                                            {listing.user.firstName} {listing.user.lastName}
                                        </p>
                                        <p className="hidden md:flex text-sm text-muted-foreground">{listing.user.email}</p>
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
                                    <TableCell>${(listing.price / 100).toFixed(2)}</TableCell>
                                    <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Button
                                            onClick={() => handleAction(listing.id, "approve")}
                                            className="mr-2"
                                            disabled={actionInProgress === listing.id}
                                        >
                                            {actionInProgress === listing.id ? (
                                                <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                                            ) : (
                                                <CheckCircle className="mr-1 h-4 w-4" />
                                            )}
                                            Approve
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleAction(listing.id, "reject")}
                                            disabled={actionInProgress === listing.id}
                                        >
                                            {actionInProgress === listing.id ? (
                                                <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                                            ) : (
                                                <XCircle className="mr-1 h-4 w-4" />
                                            )}
                                            Reject
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>
        </Card>
    )
}
