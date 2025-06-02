"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { AlertCircle, CheckCircle, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// Define cryptocurrency options
const cryptoOptions = [
  { value: "BTC", label: "Bitcoin (BTC)" },
  { value: "ETH", label: "Ethereum (ETH)" },
  { value: "USDT", label: "Tether (USDT)" },
  { value: "BNB", label: "Binance Coin (BNB)" },
  { value: "XRP", label: "Ripple (XRP)" },
  { value: "ADA", label: "Cardano (ADA)" },
  { value: "SOL", label: "Solana (SOL)" },
  { value: "DOT", label: "Polkadot (DOT)" },
  { value: "DOGE", label: "Dogecoin (DOGE)" },
  { value: "SHIB", label: "Shiba Inu (SHIB)" },
]

// Define forex options
const forexOptions = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "ZAR", label: "South African Rand (ZAR)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
  { value: "CHF", label: "Swiss Franc (CHF)" },
  { value: "CNY", label: "Chinese Yuan (CNY)" },
  { value: "AED", label: "UAE Dirham (AED)" },
]

// Define gift card options
const giftCardOptions = [
  { value: "amazon", label: "Amazon Gift Card" },
  { value: "apple", label: "Apple App Store & iTunes" },
  { value: "google_play", label: "Google Play" },
  { value: "steam", label: "Steam" },
  { value: "netflix", label: "Netflix" },
  { value: "spotify", label: "Spotify" },
  { value: "xbox", label: "Xbox" },
  { value: "playstation", label: "PlayStation" },
  { value: "visa", label: "Visa Gift Card" },
  { value: "mastercard", label: "Mastercard Gift Card" },
  { value: "walmart", label: "Walmart" },
  { value: "ebay", label: "eBay" },
]

// Create dynamic form schema based on asset type
const createFormSchema = (assetType: string) => {
  const baseSchema = {
    type: z.enum(["buy", "sell"]),
    assetType: z.enum(["crypto", "giftcard", "forex"]),
    priceType: z.enum(["fixed", "negotiable"]),
    paymentMethod: z.enum(["bank_transfer", "mobile_money", "cash", "paypal", "other"]),
    description: z.string().min(10, {
      message: "Description must be at least 10 characters.",
    }),
    terms: z.string().optional(),
    paymentDetails: z.string().optional(),
  }

  // Add asset-specific fields
  if (assetType === "crypto") {
    return z.object({
      ...baseSchema,
      assetName: z.string().min(1, { message: "Please select a cryptocurrency" }),
      quantity: z.string().min(1, { message: "Quantity is required" }),
      price: z.string().min(1, { message: "Price in MWK is required" }),
      cryptoNetwork: z.string().optional(),
    })
  } else if (assetType === "forex") {
    return z.object({
      ...baseSchema,
      assetName: z.string().min(1, { message: "Please select a currency" }),
      quantity: z.string().min(1, { message: "Amount is required" }),
      price: z.string().min(1, { message: "Exchange rate in MWK is required" }),
      location: z.string().optional(),
    })
  } else {
    // Gift cards
    return z.object({
      ...baseSchema,
      assetName: z.string().min(1, { message: "Please select a gift card type" }),
      quantity: z.string().min(1, { message: "Number of cards or value is required" }),
      price: z.string().min(1, { message: "Price in MWK is required" }),
      cardRegion: z.string().optional(),
    })
  }
}

export function CreateP2PListing() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<"form" | "success" | "error">("form")
  const [selectedAssetType, setSelectedAssetType] = useState<"crypto" | "giftcard" | "forex">("crypto")
  const [listingType, setListingType] = useState<"buy" | "sell">("sell")

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<any>({
    resolver: zodResolver(createFormSchema(selectedAssetType)),
    defaultValues: {
      type: "sell",
      assetType: "crypto",
      assetName: "",
      quantity: "",
      price: "",
      priceType: "fixed",
      paymentMethod: "bank_transfer",
      description: "",
      terms: "",
      paymentDetails: "",
    },
  })

  // Update form validation schema when asset type changes
  useEffect(() => {
    form.setValue("assetType", selectedAssetType)
    form.setValue("assetName", "")
    form.setValue("quantity", "")
    form.setValue("price", "")
    form.clearErrors()
  }, [selectedAssetType, form])

  // Update form validation schema when listing type changes
  useEffect(() => {
    form.setValue("type", listingType)
  }, [listingType, form])

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function onSubmit(values: any) {
    setIsSubmitting(true)
    try {
      // Format data based on asset type
      const formattedData = { ...values }

      // Convert price to cents for storage
      const priceInCents = Math.round(Number.parseFloat(values.price) * 100)
      formattedData.price = priceInCents

      // Add asset-specific metadata
      if (selectedAssetType === "crypto") {
        formattedData.metadata = {
          cryptoNetwork: values.cryptoNetwork || "Not specified",
        }
      } else if (selectedAssetType === "forex") {
        formattedData.metadata = {
          location: values.location || "Not specified",
        }
      } else if (selectedAssetType === "giftcard") {
        formattedData.metadata = {
          cardRegion: values.cardRegion || "Global",
        }
      }

      // Log the data being sent for debugging
      console.log("Submitting listing data:", formattedData)

      const response = await fetch("/api/p2p/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create listing")
      }

      setStatus("success")
      toast({
        title: "Listing submitted",
        description: "Your P2P listing has been submitted for approval.",
      })
    } catch (error) {
      console.error("Error creating listing:", error)
      setStatus("error")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create listing. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === "success") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle className="h-12 w-12 text-green-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Listing Submitted Successfully!</h2>
            <p className="text-muted-foreground">
              Your P2P listing has been submitted and is pending admin approval. You will receive an email notification
              once it&apos;s approved.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={() => router.push("/p2p")}>View P2P Marketplace</Button>
              <Button variant="outline" onClick={() => setStatus("form")}>
                Create Another Listing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (status === "error") {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="p-3 rounded-full bg-red-500/10">
                <AlertCircle className="h-12 w-12 text-red-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Submission Failed</h2>
            <p className="text-muted-foreground">
              We couldn&apos;t process your listing submission. Please try again or contact support if the problem persists.
            </p>
            <div className="flex justify-center gap-4 pt-4">
              <Button onClick={() => setStatus("form")}>Try Again</Button>
              <Button variant="outline" onClick={() => router.push("/p2p")}>
                Return to Marketplace
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create P2P Listing</CardTitle>
        <CardDescription>Create a new listing to buy or sell crypto, gift cards, or forex</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 bg-blue-500/10 text-blue-500 border-blue-500/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Approval Required</AlertTitle>
          <AlertDescription>
            All listings require admin approval before they appear on the marketplace. You&apos;ll receive an email when your
            listing is approved.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Listing Type Selection */}
            <Tabs
              defaultValue="sell"
              onValueChange={(value) => setListingType(value as "buy" | "sell")}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="buy">I want to Buy</TabsTrigger>
                <TabsTrigger value="sell">I want to Sell</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Asset Type Selection */}
            <div className="space-y-2">
              <FormLabel>Asset Type</FormLabel>
              <RadioGroup
                defaultValue="crypto"
                className="grid grid-cols-3 gap-4"
                onValueChange={(value) => setSelectedAssetType(value as "crypto" | "giftcard" | "forex")}
              >
                <div>
                  <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                  <Label
                    htmlFor="crypto"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.5 9.5c.5-1.5 2.5-2 3.5-1 1.5 1.5 1 4-1 4" />
                      <path d="M12 12.5V16" />
                      <path d="M12 7.5V8" />
                    </svg>
                    Cryptocurrency
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="forex" id="forex" className="peer sr-only" />
                  <Label
                    htmlFor="forex"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                    Forex
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="giftcard" id="giftcard" className="peer sr-only" />
                  <Label
                    htmlFor="giftcard"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mb-3 h-6 w-6"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                    Gift Card
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Asset Name Field - changes based on asset type */}
              <FormField
                control={form.control}
                name="assetName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedAssetType === "crypto"
                        ? "Cryptocurrency"
                        : selectedAssetType === "forex"
                          ? "Currency"
                          : "Gift Card Type"}
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              selectedAssetType === "crypto"
                                ? "Select cryptocurrency"
                                : selectedAssetType === "forex"
                                  ? "Select currency"
                                  : "Select gift card type"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {selectedAssetType === "crypto"
                          ? cryptoOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))
                          : selectedAssetType === "forex"
                            ? forexOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))
                            : giftCardOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {selectedAssetType === "crypto"
                        ? "Select the cryptocurrency you want to trade"
                        : selectedAssetType === "forex"
                          ? "Select the currency you want to trade"
                          : "Select the gift card type you want to trade"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quantity Field - label changes based on asset type */}
              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedAssetType === "crypto"
                        ? "Quantity"
                        : selectedAssetType === "forex"
                          ? "Amount"
                          : "Number of Cards/Value"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={
                          selectedAssetType === "crypto"
                            ? "e.g. 0.5 BTC, 100 USDT"
                            : selectedAssetType === "forex"
                              ? "e.g. 100 USD, 500 EUR"
                              : "e.g. 2 cards, $50 value"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedAssetType === "crypto"
                        ? "Enter the amount of cryptocurrency"
                        : selectedAssetType === "forex"
                          ? "Enter the amount of currency"
                          : "Enter the number of cards or their value"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Asset-specific additional fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {selectedAssetType === "crypto" && (
                <FormField
                  control={form.control}
                  name="cryptoNetwork"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Network (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select network" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ethereum">Ethereum (ERC20)</SelectItem>
                          <SelectItem value="bsc">Binance Smart Chain (BEP20)</SelectItem>
                          <SelectItem value="tron">Tron (TRC20)</SelectItem>
                          <SelectItem value="polygon">Polygon</SelectItem>
                          <SelectItem value="solana">Solana</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Specify the blockchain network if applicable</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedAssetType === "forex" && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Location (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Lilongwe, Blantyre" {...field} />
                      </FormControl>
                      <FormDescription>Enter your preferred location for the exchange</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {selectedAssetType === "giftcard" && (
                <FormField
                  control={form.control}
                  name="cardRegion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Region (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select region" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="global">Global</SelectItem>
                          <SelectItem value="us">United States</SelectItem>
                          <SelectItem value="uk">United Kingdom</SelectItem>
                          <SelectItem value="eu">Europe</SelectItem>
                          <SelectItem value="ca">Canada</SelectItem>
                          <SelectItem value="au">Australia</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Specify the region the gift card is valid in</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Price Field - label changes based on asset type */}
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {selectedAssetType === "crypto"
                        ? "Price (MWK)"
                        : selectedAssetType === "forex"
                          ? "Exchange Rate (MWK)"
                          : "Price (MWK)"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder={
                          selectedAssetType === "crypto"
                            ? "e.g. 500000"
                            : selectedAssetType === "forex"
                              ? "e.g. 1800 MWK per USD"
                              : "e.g. 25000"
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedAssetType === "crypto"
                        ? "Enter the price in Malawian Kwacha (MWK)"
                        : selectedAssetType === "forex"
                          ? "Enter the exchange rate in Malawian Kwacha (MWK)"
                          : "Enter the price in Malawian Kwacha (MWK)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="priceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed Price</SelectItem>
                        <SelectItem value="negotiable">Negotiable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>Is your price fixed or negotiable?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        <SelectItem value="mobile_money">Mobile Money</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>How do you prefer to receive/send payment?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="paymentDetails"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide your payment details (bank account, mobile money number, etc.)"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    These details will be shared with the buyer/seller after a trade is initiated
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about your listing..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Describe your listing in detail</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terms & Conditions (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any specific terms for the trade..." className="min-h-[80px]" {...field} />
                  </FormControl>
                  <FormDescription>Add any specific terms or conditions for this trade</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
              <Info className="h-4 w-4" />
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                After your listing is approved, buyers and sellers can negotiate and choose their preferred payment
                methods. Make sure to communicate clearly and follow safe trading practices.
              </AlertDescription>
            </Alert>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Listing"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
