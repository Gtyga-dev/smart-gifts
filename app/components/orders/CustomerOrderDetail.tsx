"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/app/lib/currency"
import { Clipboard, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import ResendGiftCardButton from "@/app/components/giftcard/ResendGiftCardButton"

// Define the OrderItem type
interface OrderItem {
    name: string;
    quantity: number;
    priceAtTime: number;
}

interface CustomerOrderDetailProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any
}

export default function CustomerOrderDetail({ order }: CustomerOrderDetailProps) {
    const { toast } = useToast()
    const [, setCopiedCode] = useState<string | null>(null)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopiedCode(text)
        toast({
            title: "Copied to clipboard",
            description: "The redemption code has been copied to your clipboard.",
        })

        // Reset the copied state after 2 seconds
        setTimeout(() => {
            setCopiedCode(null)
        }, 2000)
    }

    const isGiftCard = order.productType === "giftcard"
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const giftCardDetails = isGiftCard ? (order.metadata as any) : null

    return (
        <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
            <CardHeader className="px-7">
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle className="neon-text">Order Details</CardTitle>
                        <CardDescription>Order #{order.id}</CardDescription>
                    </div>
                    <Badge
                        variant={order.status === "completed" ? "outline" : order.status === "pending" ? "secondary" : "default"}
                    >
                        {order.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="px-7">
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-2">Order Information</h3>
                            <p className="text-sm">Date: {new Date(order.createdAt).toLocaleString()}</p>
                            <p className="text-sm">Transaction ID: {order.transactionId || "N/A"}</p>
                            <p className="text-sm">Amount: {formatCurrency(order.amount, order.currency || "MWK")}</p>
                            {order.exchangeRate && <p className="text-sm">Exchange Rate: {order.exchangeRate} MWK/USD</p>}
                        </div>
                    </div>

                    <div>

                        <h3 className="text-sm font-medium text-muted-foreground mb-2">Items</h3>

                        <div className="space-y-3">
                            {order.items.map((item: OrderItem, index: number) => (
                                <div key={index} className="flex items-start gap-2 p-3 border border-primary/10 rounded-md">
                                    {isGiftCard && <Gift className="h-5 w-5 text-primary mt-0.5" />}
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {item.quantity} × {formatCurrency(item.priceAtTime, order.currency || "MWK")}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isGiftCard && giftCardDetails && giftCardDetails.redemptionCode && (
                        <div className="border border-primary/20 rounded-md p-4 bg-primary/5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-sm font-medium flex items-center gap-1">
                                    <Gift className="h-4 w-4" /> Gift Card Details
                                </h3>
                                <Badge variant={order.emailSent ? "default" : "outline"}>
                                    {order.emailSent ? "Email Sent" : "Email Pending"}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Redemption Code:</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <code className="bg-primary/10 px-2 py-1 rounded text-sm font-mono">
                                            {giftCardDetails.redemptionCode}
                                        </code>
                                        <Button variant="ghost" size="icon" onClick={() => copyToClipboard(giftCardDetails.redemptionCode)}>
                                            <Clipboard className="h-4 w-4" />
                                            <span className="sr-only">Copy code</span>
                                        </Button>
                                    </div>
                                </div>

                                {giftCardDetails.redemptionInstructions && (
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Redemption Instructions:</p>
                                        <div className="mt-1 text-sm whitespace-pre-wrap bg-primary/5 p-2 rounded">
                                            {giftCardDetails.redemptionInstructions}
                                        </div>
                                    </div>
                                )}

                                <ResendGiftCardButton orderId={order.id} isAdmin={false} />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
