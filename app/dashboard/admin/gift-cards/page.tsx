"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, Eye, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Define the GiftCardOrder type
type GiftCardOrder = {
  id: string
  status: string
  amount: number
  transactionId: string | null
  emailSent: boolean
  createdAt: Date
  updatedAt: Date
  User: { email: string; firstName: string } | null
  items: { name: string; productId: string }[]
  ReloadlyTransaction: {
    id: string
    status: string
    externalId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata: any
  }[]
}

export default function GiftCardDashboard() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<GiftCardOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<GiftCardOrder | null>(null)

  // Fetch gift card orders
  useEffect(() => {
    const fetchGiftCardOrders = async () => {
      try {
        // Use the correct URL format with the base URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
        const response = await fetch(`${baseUrl}/api/admin/gift-cards`)

        if (!response.ok) throw new Error("Failed to fetch gift card orders")
        const data = await response.json()
        setOrders(data.orders)
      } catch (error) {
        console.error("Error fetching gift card orders:", error)
        toast({
          title: "Error",
          description: "Failed to load gift card orders",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchGiftCardOrders()
  }, [toast])

  // Handle resend gift card
  const handleResendGiftCard = async (orderId: string) => {
    try {
      setActionInProgress(orderId)

      // Use the correct URL format with the base URL
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/resend-gift-card`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to resend gift card")
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const data = await response.json()

      toast({
        title: "Success",
        description: "Gift card has been resent successfully",
      })

      // Update the order in the UI
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                emailSent: true,
                updatedAt: new Date(),
                ReloadlyTransaction: order.ReloadlyTransaction.map((tx) => ({
                  ...tx,
                  status: "completed",
                  metadata: { ...tx.metadata, sentAt: new Date().toISOString() },
                })),
              }
            : order,
        ),
      )
    } catch (error) {
      console.error("Failed to resend gift card:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to resend gift card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string, emailSent: boolean) => {
    if (status === "approved" && emailSent) {
      return <Badge className="bg-green-500">Delivered</Badge>
    } else if (status === "approved" && !emailSent) {
      return <Badge className="bg-yellow-500">Pending Delivery</Badge>
    } else if (status === "rejected") {
      return <Badge className="bg-red-500">Rejected</Badge>
    } else {
      return <Badge className="bg-blue-500">{status}</Badge>
    }
  }

  // Get redemption code from transaction
  const getRedemptionCode = (order: GiftCardOrder) => {
    if (order.ReloadlyTransaction && order.ReloadlyTransaction.length > 0) {
      const tx = order.ReloadlyTransaction[0]
      return tx.metadata?.redemptionCode || "Not available"
    }
    return "Not available"
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Gift Card Orders</CardTitle>
          <CardDescription>Loading gift card orders...</CardDescription>
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
        <CardTitle>Gift Card Orders</CardTitle>
        <CardDescription>Manage and monitor gift card deliveries</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">No gift card orders found</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <p className="font-medium">{order.User?.firstName || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{order.User?.email || "No email"}</p>
                  </TableCell>
                  <TableCell>{order.items[0]?.name || "Gift Card"}</TableCell>
                  <TableCell>${(order.amount / 100).toFixed(2)}</TableCell>
                  <TableCell>{getStatusBadge(order.status, order.emailSent)}</TableCell>
                  <TableCell>{format(new Date(order.updatedAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            disabled={!order.emailSent}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Gift Card Details</DialogTitle>
                            <DialogDescription>
                              Redemption details for order {selectedOrder?.id.substring(0, 8)}
                            </DialogDescription>
                          </DialogHeader>
                          {selectedOrder && (
                            <div className="space-y-4 mt-4">
                              <div className="grid grid-cols-2 gap-2">
                                <div className="font-medium">Product:</div>
                                <div>{selectedOrder.items[0]?.name || "Gift Card"}</div>

                                <div className="font-medium">Amount:</div>
                                <div>${(selectedOrder.amount / 100).toFixed(2)}</div>

                                <div className="font-medium">Customer:</div>
                                <div>{selectedOrder.User?.firstName || "Unknown"}</div>

                                <div className="font-medium">Email:</div>
                                <div>{selectedOrder.User?.email || "No email"}</div>

                                <div className="font-medium">Status:</div>
                                <div>{selectedOrder.status}</div>

                                <div className="font-medium">Delivered:</div>
                                <div>{selectedOrder.emailSent ? "Yes" : "No"}</div>

                                <div className="font-medium">Transaction ID:</div>
                                <div className="font-mono text-xs">{selectedOrder.transactionId || "N/A"}</div>
                              </div>

                              <div className="border rounded-md p-3 bg-muted/50">
                                <div className="font-medium mb-2">Redemption Code:</div>
                                <div className="font-mono bg-background p-2 rounded border text-center">
                                  {getRedemptionCode(selectedOrder)}
                                </div>
                              </div>

                              {selectedOrder.ReloadlyTransaction &&
                                selectedOrder.ReloadlyTransaction.length > 0 &&
                                selectedOrder.ReloadlyTransaction[0].metadata?.redemptionInstructions && (
                                  <div className="border rounded-md p-3 bg-muted/50">
                                    <div className="font-medium mb-2">Redemption Instructions:</div>
                                    <div className="whitespace-pre-line text-sm">
                                      {selectedOrder.ReloadlyTransaction[0].metadata.redemptionInstructions}
                                    </div>
                                  </div>
                                )}

                              {selectedOrder.ReloadlyTransaction &&
                                selectedOrder.ReloadlyTransaction.length > 0 &&
                                selectedOrder.ReloadlyTransaction[0].externalId && (
                                  <div className="mt-4">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="w-full"
                                      onClick={() => {
                                        window.open(
                                          `https://giftcards-sandbox.reloadly.com/orders/${selectedOrder.ReloadlyTransaction[0].externalId}`,
                                          "_blank",
                                        )
                                      }}
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      View in Reloadly Dashboard
                                    </Button>
                                  </div>
                                )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={actionInProgress === order.id || order.status !== "approved"}
                        onClick={() => handleResendGiftCard(order.id)}
                      >
                        {actionInProgress === order.id ? (
                          <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Resend
                      </Button>
                    </div>
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