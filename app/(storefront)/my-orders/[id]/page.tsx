import prisma from "@/app/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Gift, Package } from "lucide-react"
import { formatCurrency } from "@/app/lib/currency"
import DownloadReceiptButton from "./download-receipt-button"
import GiftCardRedemption from "./gift-card-redemption"



// Define the types based on your Prisma schema
type OrderWithDetails = {
  id: string
  status: string
  amount: number
  createdAt: Date
  transactionId: string | null
  paymentMethod: string | null
  currency: string | null
  exchangeRate: number | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any
  emailSent: boolean
  User: {
    firstName: string | null
    lastName: string | null
    email: string | null
  } | null
  items: {
    id: string
    name: string
    quantity: number
    priceAtTime: number
    imageUrl: string
  }[]
  ReloadlyTransaction: {
    id: string
    externalId: string
    status: string
    recipientEmail: string | null
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any
  }[]
}

// Adapted to Next.js’s async-params API:
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function OrderDetailsPage({ params }: PageProps) {
  noStore()

  // Extract the order ID
  const { id: orderId } = await params

  // Get the user session
  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect("/")

  // Fetch the order with all necessary details
  const order = await prisma.order.findUnique({
    where: { id: orderId, userId: user.id },
    include: {
      User: { select: { firstName: true, lastName: true, email: true } },
      items: {
        select: { id: true, name: true, quantity: true, priceAtTime: true, imageUrl: true },
      },
      ReloadlyTransaction: {
        select: {
          id: true,
          externalId: true,
          status: true,
          recipientEmail: true,
          metadata: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  // If order not found, show the not-found page
  if (!order) notFound()

  // Calculate totals
  const subtotal = order.items.reduce((sum, item) => sum + item.priceAtTime * item.quantity, 0)

  // Check if this is a gift card order
  const isGiftCard = order.items.some(
    (item) =>
      /gift|card/i.test(item.name) ||
      (typeof order.metadata === "object" &&
        order.metadata !== null &&
        "productType" in order.metadata &&
        typeof order.metadata.productType === "string" &&
        /gift|card/i.test(order.metadata.productType)),
  )

  // Determine if we have redemption code information
  const hasRedemptionCode = Boolean(
    (typeof order.metadata === "object" &&
      order.metadata !== null &&
      "redemptionCode" in order.metadata &&
      typeof order.metadata.redemptionCode === "string" &&
      order.metadata.redemptionCode) ||
    (order.ReloadlyTransaction?.length > 0 &&
      typeof order.ReloadlyTransaction[0]?.metadata === "object" &&
      order.ReloadlyTransaction[0]?.metadata !== null &&
      "redemptionCode" in order.ReloadlyTransaction[0].metadata &&
      typeof order.ReloadlyTransaction[0].metadata.redemptionCode === "string" &&
      order.ReloadlyTransaction[0].metadata.redemptionCode)
  )

  // Get the redemption code and instructions from either order metadata or transaction metadata
  const redemptionCode =
    typeof order.metadata === "object" &&
    order.metadata !== null &&
    "redemptionCode" in order.metadata &&
    typeof order.metadata.redemptionCode === "string"
      ? order.metadata.redemptionCode
      : order.ReloadlyTransaction?.length > 0 &&
        typeof order.ReloadlyTransaction[0]?.metadata === "object" &&
        order.ReloadlyTransaction[0]?.metadata !== null &&
        "redemptionCode" in order.ReloadlyTransaction[0].metadata &&
        typeof order.ReloadlyTransaction[0].metadata.redemptionCode === "string"
      ? order.ReloadlyTransaction[0].metadata.redemptionCode
      : null

  const redemptionInstructions =
    typeof order.metadata === "object" &&
    order.metadata !== null &&
    "redemptionInstructions" in order.metadata &&
    typeof order.metadata.redemptionInstructions === "string"
      ? order.metadata.redemptionInstructions
      : order.ReloadlyTransaction?.length > 0 &&
        typeof order.ReloadlyTransaction[0]?.metadata === "object" &&
        order.ReloadlyTransaction[0]?.metadata !== null &&
        "redemptionInstructions" in order.ReloadlyTransaction[0].metadata &&
        typeof order.ReloadlyTransaction[0].metadata.redemptionInstructions === "string"
      ? order.ReloadlyTransaction[0].metadata.redemptionInstructions
      : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/my-orders" className="flex items-center text-sm text-primary hover:text-primary/80">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
        <DownloadReceiptButton order={order as OrderWithDetails} />
      </div>

      <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
        <CardHeader className="px-7">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="neon-text">Order Details</CardTitle>
              <CardDescription>
                Order #{order.id.slice(0, 8)} • Placed on{" "}
                {new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }).format(order.createdAt)}
              </CardDescription>
            </div>
            <Badge
              variant={order.status === "completed" ? "default" : order.status === "pending" ? "outline" : "secondary"}
              className={
                order.status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : order.status === "pending"
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-blue-500/20 text-blue-400"
              }
            >
              {order.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-7">
          {/* Gift Card Redemption - Show at the top for approved gift card orders */}
          {isGiftCard && (order.status === "approved" || order.status === "completed") && hasRedemptionCode && (
            <>
              <GiftCardRedemption
                code={redemptionCode ?? ""}
                instructions={redemptionInstructions ?? undefined}
                productName={order.items[0]?.name || "Gift Card"}
              />
              <Separator className="border-primary/10" />
            </>
          )}

          {/* Customer & Payment Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Customer Information</h3>
              <p>
                {order.User?.firstName} {order.User?.lastName}
              </p>
              <p className="text-muted-foreground">{order.User?.email}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Payment Information</h3>
              <p>Method: {order.paymentMethod || "Not specified"}</p>
              {order.transactionId && <p className="text-muted-foreground">Transaction ID: {order.transactionId}</p>}
              {order.currency && (
                <p className="text-muted-foreground">
                  Currency: {order.currency} {order.exchangeRate && `(Rate: ${order.exchangeRate})`}
                </p>
              )}
            </div>
          </div>

          <Separator className="border-primary/10" />

          {/* Order Items */}
          <div>
            <h3 className="text-lg font-medium text-primary mb-4">Order Items</h3>
            <Table>
              <TableHeader>
                <TableRow className="border-primary/20">
                  <TableHead className="text-primary">Product</TableHead>
                  <TableHead className="text-primary">Quantity</TableHead>
                  <TableHead className="text-primary text-right">Price</TableHead>
                  <TableHead className="text-primary text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id} className="border-primary/10">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-muted relative">
                          {item.imageUrl ? (
                            <Image
                              src={item.imageUrl || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              {isGiftCard ? (
                                <Gift className="h-6 w-6 text-muted-foreground" />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                          )}
                        </div>
                        <p className="font-medium text-primary-foreground">{item.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {order.currency
                        ? formatCurrency(item.priceAtTime / 100, order.currency)
                        : `$${(item.priceAtTime / 100).toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.currency
                        ? formatCurrency((item.priceAtTime * item.quantity) / 100, order.currency)
                        : `$${((item.priceAtTime * item.quantity) / 100).toFixed(2)}`}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator className="border-primary/10" />

          {/* Totals */}
          <div className="flex flex-col items-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>
                  {order.currency ? formatCurrency(subtotal / 100, order.currency) : `$${(subtotal / 100).toFixed(2)}`}
                </span>
              </div>
              <Separator className="border-primary/10" />
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span className="text-primary">
                  {order.currency
                    ? formatCurrency(order.amount / 100, order.currency)
                    : `$${(order.amount / 100).toFixed(2)}`}
                </span>
              </div>
            </div>
          </div>

          {/* Gift Card Details - Only show if it's a gift card but no redemption code yet */}
          {isGiftCard && !hasRedemptionCode && order.ReloadlyTransaction && order.ReloadlyTransaction.length > 0 && (
            <>
              <Separator className="border-primary/10" />
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Gift Card Status</h3>
                {order.ReloadlyTransaction.map((tx) => (
                  <div key={tx.id} className="space-y-1">
                    <p>Transaction ID: {tx.externalId}</p>
                    {tx.status && (
                      <Badge
                        variant={tx.status === "completed" ? "default" : "outline"}
                        className={
                          tx.status === "completed"
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }
                      >
                        {tx.status}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      {order.status === "pending"
                        ? "Your gift card is awaiting approval. The redemption code will appear here once approved."
                        : "Your gift card is being processed. The redemption code will appear here once ready."}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Transaction Details - Only show for non-gift cards */}
          {!isGiftCard && order.ReloadlyTransaction && order.ReloadlyTransaction.length > 0 && (
            <>
              <Separator className="border-primary/10" />
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Transaction Details</h3>
                {order.ReloadlyTransaction.map((tx) => (
                  <div key={tx.id} className="space-y-1">
                    <p>Transaction ID: {tx.externalId}</p>
                    {tx.recipientEmail && <p className="text-muted-foreground">Sent to: {tx.recipientEmail}</p>}
                    {tx.status && <p className="text-muted-foreground">Status: {tx.status}</p>}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Debug Information - Only in development */}
          {process.env.NODE_ENV === "development" && (
            <>
              <Separator className="border-primary/10" />
              <div>
                <h3 className="text-lg font-medium text-primary mb-2">Debug Information</h3>
                <details>
                  <summary className="cursor-pointer text-sm text-muted-foreground">View Order Metadata</summary>
                  <pre className="mt-2 text-xs bg-muted/50 p-4 rounded-md overflow-auto">
                    {JSON.stringify(order.metadata, null, 2)}
                  </pre>
                </details>
                {order.ReloadlyTransaction && order.ReloadlyTransaction.length > 0 && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm text-muted-foreground">
                      View Transaction Metadata
                    </summary>
                    <pre className="mt-2 text-xs bg-muted/50 p-4 rounded-md overflow-auto">
                      {JSON.stringify(order.ReloadlyTransaction[0].metadata, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
