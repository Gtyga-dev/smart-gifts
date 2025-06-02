"use client"

import { useState } from "react"
import { formatDistance } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, Mail, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { formatCurrency } from "@/app/lib/currency"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface OrderDetailProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    order: any // Using any for simplicity, but you should define a proper type
}

// Define the OrderItem type
interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  priceAtTime: number;
}

export function OrderDetail({ order }: OrderDetailProps) {
    const [isResending, setIsResending] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    // Determine if this is a gift card order
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isGiftCard = order.items.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (item: any) => item.name.toLowerCase().includes("gift") || item.name.toLowerCase().includes("card"),
    )

    const handleResendGiftCard = async () => {
        if (!order.User?.email) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Customer email not found",
            })
            return
        }

        setIsResending(true)

        try {
            const response = await fetch(`/api/admin/resend-giftcard/${order.id}`, {
                method: "POST",
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Failed to resend gift card email")
            }

            toast({
                title: "Email Sent",
                description: "Gift card details have been sent to the customer",
            })
        } catch (error) {
            console.error("Error resending gift card email:", error)

            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to resend gift card email",
            })
        } finally {
            setIsResending(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                        <CardDescription>
                            Placed {formatDistance(new Date(order.createdAt), new Date(), { addSuffix: true })}
                        </CardDescription>
                    </div>
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Customer Information</h3>
                        <div className="space-y-1">
                            <p>
                                <span className="font-medium">Name:</span> {order.User?.firstName || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">Email:</span> {order.User?.email || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">User ID:</span> {order.userId || "N/A"}
                            </p>
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Order Items</h3>
                        <div className="space-y-4">

                            {order.items.map((item: OrderItem) => (
                                <div key={item.id} className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">
                                        {formatCurrency(item.priceAtTime * item.quantity, order.currency || "USD")}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center">
                        <p className="font-medium">Total</p>
                        <div className="text-right">
                            <p className="text-xl font-bold">{formatCurrency(order.amount / 100, order.currency || "USD")}</p>
                            {order.currency !== "MWK" && order.exchangeRate && (
                                <p className="text-sm text-muted-foreground">
                                    Paid: {formatCurrency((order.amount / 100) * order.exchangeRate, "MWK")}
                                    <br />
                                    (Rate: 1 {order.currency} = {order.exchangeRate} MWK)
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                        <div className="space-y-1">
                            <p>
                                <span className="font-medium">Payment Method:</span> {order.paymentMethod || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">Transaction ID:</span> {order.transactionId || "N/A"}
                            </p>
                            <p>
                                <span className="font-medium">Payment Reference:</span> {order.paymentReference || "N/A"}
                            </p>
                            {isGiftCard && (
                                <p>
                                    <span className="font-medium">Email Sent:</span>{" "}
                                    {order.emailSent ? <Badge variant="default">Yes</Badge> : <Badge variant="outline">No</Badge>}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                </Button>

                <div className="flex gap-2">
                    {isGiftCard && (
                        <Button variant="secondary" onClick={handleResendGiftCard} disabled={isResending}>
                            <Mail className="mr-2 h-4 w-4" />
                            {isResending ? "Sending..." : "Resend Gift Card"}
                        </Button>
                    )}

                    <Button variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download Receipt
                    </Button>
                </div>
            </CardFooter>
        </Card>
    )
}
