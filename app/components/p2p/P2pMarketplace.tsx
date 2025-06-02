import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, CheckCircle, Clock, DollarSign } from "lucide-react"
import prisma from "@/app/lib/db"
import { unstable_noStore as noStore } from "next/cache"

async function getP2PListings() {
    noStore()
    try {
        const listings = await prisma.p2PListing.findMany({
            where: {
                status: "active", // Only show approved listings
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        profileImage: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            take: 12,
        })

        return listings
    } catch (error) {
        console.error("Failed to fetch P2P listings:", error)
        return []
    }
}

export async function P2PMarketplace() {
    const listings = await getP2PListings()

    return (
        <Tabs defaultValue="buy" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
                <TabsTrigger value="buy">Buy</TabsTrigger>
                <TabsTrigger value="sell">Sell</TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.filter((listing) => listing.type === "sell").length > 0 ? (
                        listings
                            .filter((listing) => listing.type === "sell")
                            .map((listing) => (
                                <Link href={`/p2p/${listing.id}`} key={listing.id}>
                                    <Card className="h-full hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    {listing.assetType}
                                                </Badge>
                                                <Badge variant={listing.paymentMethod === "bank_transfer" ? "outline" : "secondary"}>
                                                    {listing.paymentMethod.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl mt-2">{listing.assetName}</CardTitle>
                                            <CardDescription>
                                                {listing.assetType === "crypto"
                                                    ? `${listing.quantity} ${listing.assetName}`
                                                    : listing.assetType === "giftcard"
                                                        ? `${listing.assetName} - ${listing.quantity} units`
                                                        : `${listing.assetName} ${listing.quantity}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-2xl font-bold flex items-center">
                                                    <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
                                                    {new Intl.NumberFormat("en-US").format(listing.price / 100)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {listing.priceType === "fixed" ? "Fixed Price" : "Negotiable"}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={listing.user.profileImage || "/placeholder.svg"}
                                                        alt={`${listing.user.firstName} ${listing.user.lastName}`}
                                                    />
                                                    <AvatarFallback>
                                                        {listing.user.firstName.charAt(0)}
                                                        {listing.user.lastName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    {listing.user.firstName} {listing.user.lastName}
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                                        Verified Seller
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <div className="w-full flex justify-between items-center">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Listed {new Date(listing.createdAt).toLocaleDateString()}
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-primary" asChild>
                                                    <div className="flex items-center">
                                                        View Details
                                                        <ArrowRight className="ml-1 h-3 w-3" />
                                                    </div>
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))
                    ) : (
                        <div className="col-span-3 py-12 text-center">
                            <h3 className="text-lg font-medium mb-2">No listings found</h3>
                            <p className="text-muted-foreground mb-6">Be the first to create a listing to sell your assets</p>
                            <Button asChild>
                                <Link href="/p2p/create">Create Listing</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>
            <TabsContent value="sell" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.filter((listing) => listing.type === "buy").length > 0 ? (
                        listings
                            .filter((listing) => listing.type === "buy")
                            .map((listing) => (
                                <Link href={`/p2p/${listing.id}`} key={listing.id}>
                                    <Card className="h-full hover:shadow-md transition-shadow">
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start">
                                                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                                    {listing.assetType}
                                                </Badge>
                                                <Badge variant={listing.paymentMethod === "bank_transfer" ? "outline" : "secondary"}>
                                                    {listing.paymentMethod.replace("_", " ")}
                                                </Badge>
                                            </div>
                                            <CardTitle className="text-xl mt-2">{listing.assetName}</CardTitle>
                                            <CardDescription>
                                                {listing.assetType === "crypto"
                                                    ? `${listing.quantity} ${listing.assetName}`
                                                    : listing.assetType === "giftcard"
                                                        ? `${listing.assetName} - ${listing.quantity} units`
                                                        : `${listing.assetName} ${listing.quantity}`}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="text-2xl font-bold flex items-center">
                                                    <DollarSign className="h-5 w-5 text-muted-foreground mr-1" />
                                                    {new Intl.NumberFormat("en-US").format(listing.price / 100)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {listing.priceType === "fixed" ? "Fixed Price" : "Negotiable"}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage
                                                        src={listing.user.profileImage || "/placeholder.svg"}
                                                        alt={`${listing.user.firstName} ${listing.user.lastName}`}
                                                    />
                                                    <AvatarFallback>
                                                        {listing.user.firstName.charAt(0)}
                                                        {listing.user.lastName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="text-sm">
                                                    {listing.user.firstName} {listing.user.lastName}
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                                        Verified Buyer
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0">
                                            <div className="w-full flex justify-between items-center">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Listed {new Date(listing.createdAt).toLocaleDateString()}
                                                </div>
                                                <Button variant="ghost" size="sm" className="text-primary" asChild>
                                                    <div className="flex items-center">
                                                        View Details
                                                        <ArrowRight className="ml-1 h-3 w-3" />
                                                    </div>
                                                </Button>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                </Link>
                            ))
                    ) : (
                        <div className="col-span-3 py-12 text-center">
                            <h3 className="text-lg font-medium mb-2">No buy orders found</h3>
                            <p className="text-muted-foreground mb-6">Be the first to create a buy order for assets</p>
                            <Button asChild>
                                <Link href="/p2p/create">Create Buy Order</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </TabsContent>
        </Tabs>
    )
}
