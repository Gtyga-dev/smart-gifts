"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  CheckCircle,
  Clock,
  MessageCircle,
  Shield,
  ThumbsUp,
  Info,
  AlertCircle,
  Bitcoin,
  CreditCard,
  Banknote,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  firstName: string
  lastName: string
  profileImage?: string
}

interface Offer {
  id: string
  amount: number
  message?: string
  paymentMethod?: string
  createdAt: string | Date
  user: User
}

interface P2PListingDetailsProps {
  listing: {
    id: string
    type: string
    assetType: string
    assetName: string
    quantity: string | number // Updated to accept both string and number
    price: number
    priceType: string
    paymentMethod: string
    description: string
    terms?: string
    paymentDetails?: string
    createdAt: string | Date
    metadata?: {
      cryptoNetwork?: string
      location?: string
      cardRegion?: string
    }
    user: User
    offers?: Offer[]
  }
}

export function P2PListingDetails({ listing }: P2PListingDetailsProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [offerAmount, setOfferAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [paymentDetails, setPaymentDetails] = useState("")
  const { user } = useKindeBrowserClient()
  const { toast } = useToast()

  const handleSubmitOffer = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to make an offer",
        variant: "destructive",
      })
      return
    }

    if (!offerAmount) {
      toast({
        title: "Error",
        description: "Please enter an offer amount",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/p2p/listings/${listing.id}/offers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: Math.round(Number.parseFloat(offerAmount) * 100),
          message,
          paymentMethod,
          paymentDetails,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit offer")
      }

      toast({
        title: "Offer submitted",
        description: "Your offer has been sent to the seller.",
      })

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error submitting offer:", error)
      toast({
        title: "Error",
        description: "Failed to submit offer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isSelling = listing.type === "sell"
  const actionText = isSelling ? "Buy" : "Sell"

  // Format asset information based on type
  const formatAssetInfo = () => {
    // Convert quantity to string if it's a number
    const quantityStr = typeof listing.quantity === "number" ? String(listing.quantity) : listing.quantity

    if (listing.assetType === "crypto") {
      return {
        icon: <Bitcoin className="h-5 w-5" />,
        title: `${quantityStr} ${listing.assetName}`,
        subtitle: "Cryptocurrency",
        priceLabel: "Price (MWK)",
        priceValue: `${new Intl.NumberFormat("en-US").format(listing.price / 100)} MWK`,
      }
    } else if (listing.assetType === "forex") {
      return {
        icon: <Banknote className="h-5 w-5" />,
        title: `${quantityStr} ${listing.assetName}`,
        subtitle: "Foreign Currency",
        priceLabel: "Exchange Rate (MWK)",
        priceValue: `${new Intl.NumberFormat("en-US").format(listing.price / 100)} MWK`,
      }
    } else {
      // Gift cards
      return {
        icon: <CreditCard className="h-5 w-5" />,
        title: listing.assetName,
        subtitle: `${quantityStr} Gift Card`,
        priceLabel: "Price (MWK)",
        priceValue: `${new Intl.NumberFormat("en-US").format(listing.price / 100)} MWK`,
      }
    }
  }

  const assetInfo = formatAssetInfo()

  // Format date to string if it's a Date object
  const formatDate = (date: string | Date) => {
    if (date instanceof Date) {
      return date.toLocaleDateString()
    }
    return new Date(date).toLocaleDateString()
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    {listing.assetType}
                  </Badge>
                  <Badge variant={listing.paymentMethod === "bank_transfer" ? "outline" : "secondary"}>
                    {listing.paymentMethod.replace("_", " ")}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">
                  {isSelling ? "Sell" : "Buy"} {assetInfo.title}
                </CardTitle>
                <CardDescription className="mt-1">{assetInfo.subtitle}</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{assetInfo.priceLabel}</p>
                <p className="text-3xl font-bold">{assetInfo.priceValue}</p>
                <span className="text-sm font-normal text-muted-foreground">
                  {listing.priceType === "fixed" ? "Fixed" : "Negotiable"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {listing.assetType === "crypto" && listing.metadata?.cryptoNetwork && (
              <Alert className="bg-blue-500/10 border-blue-500/20">
                <Info className="h-4 w-4 text-blue-500" />
                <AlertTitle>Network Information</AlertTitle>
                <AlertDescription>
                  This cryptocurrency is on the {listing.metadata.cryptoNetwork} network. Make sure you use the correct
                  network for the transaction.
                </AlertDescription>
              </Alert>
            )}

            {listing.assetType === "forex" && listing.metadata?.location && (
              <Alert className="bg-green-500/10 border-green-500/20">
                <Info className="h-4 w-4 text-green-500" />
                <AlertTitle>Preferred Location</AlertTitle>
                <AlertDescription>
                  The seller prefers to meet in {listing.metadata.location} for this currency exchange.
                </AlertDescription>
              </Alert>
            )}

            {listing.assetType === "giftcard" && listing.metadata?.cardRegion && (
              <Alert className="bg-purple-500/10 border-purple-500/20">
                <Info className="h-4 w-4 text-purple-500" />
                <AlertTitle>Card Region</AlertTitle>
                <AlertDescription>
                  This gift card is valid in the {listing.metadata.cardRegion} region. Please ensure this works for your
                  needs before making an offer.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-muted-foreground">{listing.description}</p>
            </div>

            {listing.terms && (
              <div>
                <h3 className="font-medium mb-2">Terms & Conditions</h3>
                <p className="text-muted-foreground">{listing.terms}</p>
              </div>
            )}

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Trading Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Asset Type</p>
                  <p className="font-medium">{listing.assetType}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <p className="font-medium">{listing.paymentMethod.replace("_", " ")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Quantity</p>
                  <p className="font-medium">
                    {typeof listing.quantity === "number" ? String(listing.quantity) : listing.quantity}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Listed On</p>
                  <p className="font-medium">{formatDate(listing.createdAt)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Offers</CardTitle>
            <CardDescription>Recent offers for this listing</CardDescription>
          </CardHeader>
          <CardContent>
            {listing.offers && listing.offers.length > 0 ? (
              <div className="space-y-4">
                {listing.offers.map((offer) => (
                  <div key={offer.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={offer.user.profileImage || "/placeholder.svg"}
                            alt={`${offer.user.firstName} ${offer.user.lastName}`}
                          />
                          <AvatarFallback>
                            {offer.user.firstName.charAt(0)}
                            {offer.user.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {offer.user.firstName} {offer.user.lastName}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {typeof offer.createdAt === "string"
                              ? new Date(offer.createdAt).toLocaleString()
                              : offer.createdAt.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-lg font-bold">
                        {listing.assetType === "forex" ? "Rate: " : ""}
                        {new Intl.NumberFormat("en-US").format(offer.amount / 100)} MWK
                      </div>
                    </div>
                    {offer.message && (
                      <div className="bg-muted/30 p-3 rounded-md mt-2">
                        <p className="text-sm">{offer.message}</p>
                      </div>
                    )}
                    {offer.paymentMethod && (
                      <div className="mt-2 flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {offer.paymentMethod.replace("_", " ")}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Preferred payment method</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-1">No offers yet</h3>
                <p className="text-muted-foreground">Be the first to make an offer on this listing</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{isSelling ? "Seller" : "Buyer"} Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={listing.user.profileImage || "/placeholder.svg"}
                  alt={`${listing.user.firstName} ${listing.user.lastName}`}
                />
                <AvatarFallback>
                  {listing.user.firstName.charAt(0)}
                  {listing.user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {listing.user.firstName} {listing.user.lastName}
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                  Verified User
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/30 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-xs text-muted-foreground">Completion Rate</p>
              </div>
              <div className="bg-muted/30 p-3 rounded-md text-center">
                <p className="text-2xl font-bold">4.9</p>
                <div className="flex items-center justify-center text-xs text-muted-foreground">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Rating
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Shield className="h-4 w-4 text-green-500" />
              <p>Trusted trader with 50+ completed trades</p>
            </div>

            <Separator className="my-4" />

            <div className="bg-muted/30 p-3 rounded-md mt-4">
              <h3 className="text-sm font-medium mb-2">Payment Information</h3>
              {listing.paymentDetails ? (
                <p className="text-sm">{listing.paymentDetails}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Payment details will be provided after your offer is accepted
                </p>
              )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full mt-4">{actionText} Now</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Make an Offer</DialogTitle>
                  <DialogDescription>
                    Submit your offer for this {listing.assetType === "crypto" ? "cryptocurrency" : listing.assetType}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="offer" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="offer">Offer Details</TabsTrigger>
                    <TabsTrigger value="payment">Payment Method</TabsTrigger>
                  </TabsList>
                  <TabsContent value="offer" className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {listing.assetType === "forex" ? "Exchange Rate (MWK)" : "Your Offer (MWK)"}
                      </label>
                      <Input
                        type="number"
                        placeholder="Enter amount in MWK"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        {listing.assetType === "forex"
                          ? "Enter your proposed exchange rate in Malawian Kwacha"
                          : "Enter your offer amount in Malawian Kwacha"}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message (Optional)</label>
                      <Textarea
                        placeholder="Add a message to the seller..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="payment" className="space-y-4 py-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Payment Method</label>
                      <Select defaultValue={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="mobile_money">Mobile Money</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Payment Details (Optional)</label>
                      <Textarea
                        placeholder="Add your payment details (account number, mobile money, etc.)"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">
                        These details will be shared with the {isSelling ? "seller" : "buyer"} if your offer is accepted
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>

                <Alert className="mt-2 bg-yellow-500/10 border-yellow-500/20">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-xs text-yellow-700">
                    After your offer is accepted, you&apos;ll be able to communicate directly with the{" "}
                    {isSelling ? "seller" : "buyer"} to complete the transaction.
                  </AlertDescription>
                </Alert>

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSubmitOffer} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Offer"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Safety Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Always verify the trader&apos;s reputation before proceeding</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Use secure payment methods and keep transaction records</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>For crypto, verify the network and wallet address carefully</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>For forex, consider meeting in public places for safety</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Report suspicious activity to our support team</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
