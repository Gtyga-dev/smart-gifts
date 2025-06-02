"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs"
import axios from "axios"
import { UploadDropzone } from "@/app/lib/uploadthing"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Copy,
  Bitcoin,
  Banknote,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Seller {
  firstName: string
  lastName: string
  profileImage?: string
  mobileMoneyNumber?: string
  bankAccount?: string
  bankName?: string
}

interface Listing {
  id: string
  assetType: string
  assetName: string
  quantity: string
  description: string
  terms?: string
}

interface Transaction {
  id: string
  amount: number
  listing: Listing
  seller: Seller
}

interface P2PPaymentFormProps {
  transaction: Transaction
  offerId?: string
}

export function P2PPaymentForm({ transaction, offerId }: P2PPaymentFormProps) {
  const [status, setStatus] = useState<"input" | "processing" | "success" | "failed">("input")
  const [paymentMethod, setPaymentMethod] = useState<"mobile_money" | "bank" | "cash" | "other">("mobile_money")
  const [mobileMoneyProvider, setMobileMoneyProvider] = useState<"airtel" | "tnm">("airtel")
  const [bank, setBank] = useState<"national" | "fdh" | "standard" | "first_capital">("national")
  const [accountNumber, setAccountNumber] = useState("")
  const [transactionId, setTransactionId] = useState("")
  const [screenshot, setScreenshot] = useState<string | undefined>(undefined)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("payment")
  const router = useRouter()
  const { user } = useKindeBrowserClient()
  const { toast } = useToast()

  // Get seller's payment details from the transaction
  const sellerPaymentDetails = {
    mobileMoney: transaction.seller.mobileMoneyNumber || "Contact seller for mobile money details",
    bank: transaction.seller.bankAccount || "Contact seller for bank account details",
    bankName: transaction.seller.bankName || "Seller's preferred bank",
  }

  // Get asset-specific information
  const getAssetInfo = () => {
    if (transaction.listing.assetType === "crypto") {
      return {
        icon: <Bitcoin className="h-5 w-5" />,
        title: `${transaction.listing.quantity} ${transaction.listing.assetName}`,
        subtitle: "Cryptocurrency",
        priceLabel: "Price (MWK)",
      }
    } else if (transaction.listing.assetType === "forex") {
      return {
        icon: <Banknote className="h-5 w-5" />,
        title: `${transaction.listing.quantity} ${transaction.listing.assetName}`,
        subtitle: "Foreign Currency",
        priceLabel: "Exchange Rate (MWK)",
      }
    } else {
      // Gift cards
      return {
        icon: <CreditCard className="h-5 w-5" />,
        title: transaction.listing.assetName,
        subtitle: `${transaction.listing.quantity} Gift Card`,
        priceLabel: "Price (MWK)",
      }
    }
  }

  const assetInfo = getAssetInfo()

  useEffect(() => {
    // Check if user is authenticated
    if (user) {
      setLoading(false)
    } else {
      const timer = setTimeout(() => {
        setLoading(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [user])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: "Payment details copied to clipboard",
    })
  }

  const initiatePayment = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to complete this payment",
        variant: "destructive",
      })
      return
    }

    if (!accountNumber || (!transactionId && !screenshot)) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields and provide either a transaction ID or a screenshot",
        variant: "destructive",
      })
      return
    }

    try {
      setStatus("processing")
      const response = await axios.post("/api/p2p/payment", {
        transactionId: transaction.id,
        offerId,
        paymentMethod,
        provider: paymentMethod === "mobile_money" ? mobileMoneyProvider : bank,
        accountNumber,
        screenshot,
        additionalInfo,
      })

      if (response.data.success) {
        setStatus("success")
      } else {
        setStatus("failed")
        toast({
          title: "Payment Failed",
          description: response.data.message || "Something went wrong with your payment submission",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment initiation error:", error)
      setStatus("failed")
      toast({
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <AnimatePresence mode="wait">
          {status === "input" && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {transaction.listing.assetType}
                    </Badge>
                  </div>
                  <CardTitle>Complete Your Payment</CardTitle>
                  <CardDescription>
                    Pay for {assetInfo.title} ({assetInfo.subtitle})
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <Tabs defaultValue="payment" onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="payment">Payment Details</TabsTrigger>
                      <TabsTrigger value="asset">Asset Information</TabsTrigger>
                    </TabsList>

                    <TabsContent value="payment" className="space-y-6 pt-4">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage
                              src={transaction.seller.profileImage || "/placeholder.svg"}
                              alt={`${transaction.seller.firstName} ${transaction.seller.lastName}`}
                            />
                            <AvatarFallback>
                              {transaction.seller.firstName.charAt(0)}
                              {transaction.seller.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {transaction.seller.firstName} {transaction.seller.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">Seller</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            {new Intl.NumberFormat("en-US").format(transaction.amount / 100)} MWK
                          </p>
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            {transaction.listing.assetType}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentMethod" className="block text-sm font-medium">
                          Payment Method <span className="text-primary">*</span>
                        </Label>

                        <Select
                          defaultValue={paymentMethod}
                          onValueChange={(value) =>
                            setPaymentMethod(value as "mobile_money" | "bank" | "cash" | "other")
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mobile_money">Mobile Money</SelectItem>
                            <SelectItem value="bank">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Cash Payment</SelectItem>
                            <SelectItem value="other">Other Method</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {paymentMethod === "mobile_money" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="mobileMoneyProvider" className="block text-sm font-medium">
                              Mobile Money Provider <span className="text-primary">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                type="button"
                                variant={mobileMoneyProvider === "airtel" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setMobileMoneyProvider("airtel")}
                              >
                                Airtel Money
                              </Button>
                              <Button
                                type="button"
                                variant={mobileMoneyProvider === "tnm" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setMobileMoneyProvider("tnm")}
                              >
                                TNM Mpamba
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="sellerMobileNumber" className="block text-sm font-medium">
                                Seller&apos;s Mobile Money Number
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => copyToClipboard(sellerPaymentDetails.mobileMoney)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="flex items-center gap-2 bg-background p-3 rounded border">
                              <p className="font-medium">{sellerPaymentDetails.mobileMoney}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Send payment to this mobile money number
                            </p>
                          </div>
                        </>
                      )}

                      {paymentMethod === "bank" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="bank" className="block text-sm font-medium">
                              Bank <span className="text-primary">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-3">
                              <Button
                                type="button"
                                variant={bank === "national" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setBank("national")}
                              >
                                National Bank
                              </Button>
                              <Button
                                type="button"
                                variant={bank === "fdh" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setBank("fdh")}
                              >
                                FDH Bank
                              </Button>
                              <Button
                                type="button"
                                variant={bank === "standard" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setBank("standard")}
                              >
                                Standard Bank
                              </Button>
                              <Button
                                type="button"
                                variant={bank === "first_capital" ? "default" : "outline"}
                                className={`flex items-center justify-center`}
                                onClick={() => setBank("first_capital")}
                              >
                                First Capital
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                            <div className="flex justify-between items-center">
                              <Label htmlFor="sellerBankDetails" className="block text-sm font-medium">
                                Seller&apos;s Bank Details
                              </Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2"
                                onClick={() => copyToClipboard(sellerPaymentDetails.bank)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="space-y-2">
                              <div className="bg-background p-3 rounded border">
                                <p className="text-sm text-muted-foreground">Bank Name</p>
                                <p className="font-medium">{sellerPaymentDetails.bankName}</p>
                              </div>
                              <div className="bg-background p-3 rounded border">
                                <p className="text-sm text-muted-foreground">Account Number</p>
                                <p className="font-medium">{sellerPaymentDetails.bank}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Send payment to this bank account</p>
                          </div>
                        </>
                      )}

                      {paymentMethod === "cash" && (
                        <Alert className="bg-yellow-500/10 border-yellow-500/20">
                          <Info className="h-4 w-4 text-yellow-500" />
                          <AlertTitle>Cash Payment</AlertTitle>
                          <AlertDescription>
                            For cash payments, please coordinate a safe meeting location with the seller. We recommend
                            public places during daylight hours.
                          </AlertDescription>
                        </Alert>
                      )}

                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="accountNumber" className="block text-sm font-medium">
                          {paymentMethod === "mobile_money" ? (
                            <>
                              Your Phone Number <span className="text-primary">*</span>
                            </>
                          ) : paymentMethod === "bank" ? (
                            <>
                              Your Account Number <span className="text-primary">*</span>
                            </>
                          ) : (
                            <>
                              Your Contact Number <span className="text-primary">*</span>
                            </>
                          )}
                        </Label>
                        <Input
                          id="accountNumber"
                          type="text"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value)}
                          placeholder={
                            paymentMethod === "mobile_money"
                              ? "265888123456"
                              : paymentMethod === "bank"
                                ? "Enter your account number"
                                : "Enter your contact number"
                          }
                          className="mt-1 block w-full"
                        />
                        <p className="text-sm text-muted-foreground">
                          {paymentMethod === "mobile_money" || paymentMethod === "bank"
                            ? "This is the account you're sending payment from"
                            : "This is the number the seller can contact you on"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transactionId" className="block text-sm font-medium">
                          Transaction ID{" "}
                          <span className="text-muted-foreground">(Optional if providing screenshot)</span>
                        </Label>
                        <Input
                          id="transactionId"
                          type="text"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="Enter transaction ID"
                          className="mt-1 block w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="block text-sm font-medium mb-2">
                          Payment Screenshot (Optional if providing transaction ID)
                        </Label>
                        {screenshot ? (
                          <div className="mt-2">
                            <Image
                              src={screenshot || "/placeholder.svg"}
                              alt="Payment Screenshot"
                              width={200}
                              height={200}
                              className="w-full h-auto object-cover border rounded-lg"
                              onError={(e) => {
                                console.error("Image loading error")
                                e.currentTarget.src = "/placeholder.svg"
                              }}
                            />
                            <Button onClick={() => setScreenshot(undefined)} className="mt-2" variant="outline">
                              Remove Screenshot
                            </Button>
                          </div>
                        ) : (
                          <UploadDropzone
                            endpoint="paymentScreenshotRoute"
                            onClientUploadComplete={(res) => {
                              if (res && res[0] && res[0].url) {
                                setScreenshot(res[0].url)
                                toast({
                                  title: "Upload Complete",
                                  description: "Your payment screenshot has been uploaded successfully",
                                })
                              }
                            }}
                            onUploadError={(error) => {
                              console.error("Upload error:", error)
                              toast({
                                title: "Upload Failed",
                                description:
                                  "There was a problem uploading your screenshot. Please try again or use a different image.",
                                variant: "destructive",
                              })
                            }}
                            config={{
                              mode: "auto",
                              appendOnPaste: true,
                            }}
                            className="border-2 border-dashed border-primary/30 rounded-lg p-4 hover:bg-primary/5 transition-colors"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additionalInfo" className="block text-sm font-medium">
                          Additional Information (Optional)
                        </Label>
                        <Textarea
                          id="additionalInfo"
                          value={additionalInfo}
                          onChange={(e) => setAdditionalInfo(e.target.value)}
                          placeholder="Any additional details about your payment..."
                          className="mt-1 block w-full"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="asset" className="space-y-6 pt-4">
                      <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                        <div className="p-3 rounded-full bg-primary/10">{assetInfo.icon}</div>
                        <div>
                          <h3 className="font-medium text-lg">{assetInfo.title}</h3>
                          <p className="text-sm text-muted-foreground">{assetInfo.subtitle}</p>
                        </div>
                      </div>

                      {transaction.listing.assetType === "crypto" && (
                        <Alert className="bg-blue-500/10 border-blue-500/20">
                          <Info className="h-4 w-4 text-blue-500" />
                          <AlertTitle>Cryptocurrency Information</AlertTitle>
                          <AlertDescription>
                            After your payment is confirmed, the seller will transfer the cryptocurrency to your wallet.
                            Make sure you have provided the correct wallet address in your communication with the
                            seller.
                          </AlertDescription>
                        </Alert>
                      )}

                      {transaction.listing.assetType === "forex" && (
                        <Alert className="bg-green-500/10 border-green-500/20">
                          <Info className="h-4 w-4 text-green-500" />
                          <AlertTitle>Forex Exchange Information</AlertTitle>
                          <AlertDescription>
                            After your payment is confirmed, coordinate with the seller to arrange the physical exchange
                            of currency. Always meet in a safe, public location.
                          </AlertDescription>
                        </Alert>
                      )}

                      {transaction.listing.assetType === "giftcard" && (
                        <Alert className="bg-purple-500/10 border-purple-500/20">
                          <Info className="h-4 w-4 text-purple-500" />
                          <AlertTitle>Gift Card Information</AlertTitle>
                          <AlertDescription>
                            After your payment is confirmed, the seller will provide you with the gift card code or
                            physical card as agreed. Verify the card details before completing the transaction.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Transaction Type</p>
                            <p className="font-medium">Purchase</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Status</p>
                            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                              Pending Payment
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">Description</p>
                          <p className="text-sm">{transaction.listing.description}</p>
                        </div>

                        {transaction.listing.terms && (
                          <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Terms & Conditions</p>
                            <p className="text-sm">{transaction.listing.terms}</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <Button
                    onClick={initiatePayment}
                    className="w-full py-4 px-4 font-medium rounded-md group"
                    disabled={activeTab !== "payment"}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Submit Payment</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-primary/10 animate-pulse">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-4">Processing Your Payment</h2>
                  <p className="text-muted-foreground mb-6">
                    Your payment is being processed. Please wait for seller confirmation.
                  </p>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-yellow-600 text-sm">
                      You will receive an email confirmation once your payment is confirmed by the seller.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-green-500/30">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-green-500/10 animate-pulse">
                      <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-semibold mb-4 text-green-500">Payment Submitted Successfully!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your payment has been submitted for confirmation by the seller. You will receive an email
                    confirmation once it&apos;s processed.
                  </p>
                  <Button onClick={() => router.push("/p2p")} className="w-full py-4 px-4 font-medium rounded-md group">
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-5 w-5" />
                      <span>Return to P2P Marketplace</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {status === "failed" && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-500/30">
                <CardContent className="p-8 text-center">
                  <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-full bg-red-500/10 animate-pulse">
                      <AlertCircle className="h-12 w-12 text-red-500" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold mb-4 text-red-500">Payment Submission Failed</h2>
                  <p className="text-muted-foreground mb-6">
                    We couldn&apos;t process your payment submission. Please try again or contact support if the problem
                    persists.
                  </p>
                  <Button onClick={() => setStatus("input")} className="w-full py-4 px-4 font-medium rounded-md group">
                    <div className="flex items-center justify-center space-x-2">
                      <ArrowRight className="h-5 w-5" />
                      <span>Try Again</span>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Asset</p>
              <p className="font-medium">{transaction.listing.assetName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{transaction.listing.quantity}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Amount</p>
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("en-US").format(transaction.amount / 100)} MWK
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-mono text-xs">{transaction.id}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Instructions</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p>Send payment directly to the seller using their provided payment details.</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p>Enter the transaction ID or reference number from your payment.</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p>Upload a screenshot of your payment confirmation if possible.</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p>Submit your payment details for verification by the seller.</p>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p>Once verified, the seller will release the asset to you.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
