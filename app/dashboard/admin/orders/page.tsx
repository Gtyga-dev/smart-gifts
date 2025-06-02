/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, XCircle, Gift, RefreshCw } from "lucide-react"
import { approveOrder, getPendingOrders, rejectOrder, resendGiftCard } from "./actions"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Define the Order type explicitly
type Order = {
  id: string
  status: string
  amount: number
  transactionId: string | null
  paymentMethod: string | null
  productType?: string | null
  currency: string | null
  createdAt: Date
  User: { email: string; firstName: string; id: string } | null
  items: { quantity: number; priceAtTime: number; name: string; productId?: string }[]
  ReloadlyTransaction?: { 
    externalId: string; 
    id: string; 
    metadata?: any;
  }[]
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [completedOrders, setCompletedOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending")

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const pendingData = await getPendingOrders()
      setOrders(pendingData)
      
      // For completed orders with gift card details, we would need another endpoint
      // This is just a placeholder - in a real implementation you'd fetch completed orders
      setCompletedOrders([])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    try {
      setActionInProgress(orderId)

      let result
      if (action === "approve") {
        result = await approveOrder(orderId)
      } else {
        result = await rejectOrder(orderId)
      }

      if (result.success) {
        toast({
          title: "Success",
          description: `Order has been ${action === "approve" ? "approved" : "rejected"}`,
        })

        // Remove order from UI
        setOrders((prev) => prev.filter((order) => order.id !== orderId))
        
        // If it was approved, add it to completed orders
        if (action === "approve" && result.order) {
          const approvedOrder = result.order as unknown as Order
          setCompletedOrders(prev => [...prev, approvedOrder])
        }
      } else {
        throw new Error(`Failed to ${action} order`)
      }
    } catch (error) {
      console.error(`Failed to ${action} order:`, error)
      toast({
        title: "Error",
        description: `Failed to ${action} order. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const handleResendGiftCard = async (orderId: string) => {
    try {
      setActionInProgress(orderId)
      const result = await resendGiftCard(orderId)
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Gift card has been resent to the customer",
        })
      } else {
        throw new Error("Failed to resend gift card")
      }
    } catch (error) {
      console.error("Failed to resend gift card:", error)
      toast({
        title: "Error",
        description: `Failed to resend gift card: ${error instanceof Error ? error.message : "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setActionInProgress(null)
    }
  }

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order)
    setShowDetailsDialog(true)
  }

  // Helper function to check if an order is a gift card
  const isGiftCard = (order: Order) => {
    return (
      order.productType?.toLowerCase() === "giftcard" ||
      order.productType?.toLowerCase() === "gift_card" ||
      order.items?.some((item) => item.name.toLowerCase().includes("gift card"))
    )
  }

  const formatCurrency = (amount: number, currency: string | null) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 2
    }).format(amount / 100)
  }

  const renderOrderDetails = () => {
    if (!selectedOrder) return null
    
    const giftCardInfo = selectedOrder.ReloadlyTransaction?.[0]?.metadata || {}
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Customer</h4>
            <p>{selectedOrder.User?.firstName || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">{selectedOrder.User?.email || "No email"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
            <p>{formatCurrency(selectedOrder.amount, selectedOrder.currency)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
            <p>{selectedOrder.paymentMethod || "N/A"}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
            <p>{new Date(selectedOrder.createdAt).toLocaleString()}</p>
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Products</h4>
          <ul className="space-y-1">
            {selectedOrder.items.map((item, index) => (
              <li key={index} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.quantity} × {formatCurrency(item.priceAtTime, selectedOrder.currency)}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {isGiftCard(selectedOrder) && giftCardInfo.redemptionCode && (
          <div className="mt-6 space-y-4">
            <h4 className="text-md font-semibold">Gift Card Redemption Details</h4>
            
            <div className="bg-muted p-3 rounded-md">
              <h5 className="text-sm font-medium mb-1">Redemption Code</h5>
              <p className="font-mono bg-background p-2 rounded text-sm">{giftCardInfo.redemptionCode}</p>
            </div>
            
            {giftCardInfo.pinCode && (
              <div className="bg-muted p-3 rounded-md">
                <h5 className="text-sm font-medium mb-1">PIN Code</h5>
                <p className="font-mono bg-background p-2 rounded text-sm">{giftCardInfo.pinCode}</p>
              </div>
            )}
            
            {giftCardInfo.redemptionInstructions && (
              <div className="bg-muted p-3 rounded-md">
                <h5 className="text-sm font-medium mb-1">Redemption Instructions</h5>
                <p className="text-sm whitespace-pre-line">{giftCardInfo.redemptionInstructions}</p>
              </div>
            )}
            
            <Button 
              onClick={() => handleResendGiftCard(selectedOrder.id)}
              disabled={actionInProgress === selectedOrder.id}
              className="w-full"
            >
              {actionInProgress === selectedOrder.id ? (
                <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
              ) : (
                <RefreshCw className="mr-1 h-4 w-4" />
              )}
              Resend to Customer
            </Button>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Loading orders...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center p-6">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Manage customer orders and gift cards</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" onValueChange={(value) => setActiveTab(value as "pending" | "completed")}>
            <TabsList className="mb-4">
              <TabsTrigger value="pending">Pending Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed Orders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {orders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No pending orders to review</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Payment Method</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openOrderDetails(order)}>
                        <TableCell>
                          <p className="font-medium">{order.User?.firstName || "Unknown"}</p>
                          <p className="hidden md:flex text-sm text-muted-foreground">{order.User?.email || "No email"}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          {formatCurrency(order.amount, order.currency)}
                        </TableCell>
                        <TableCell>
                          {isGiftCard(order) ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Gift Card
                            </Badge>
                          ) : (
                            order.productType || "Product"
                          )}
                        </TableCell>
                        <TableCell>{order.paymentMethod || "N/A"}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Button
                            onClick={() => handleAction(order.id, "approve")}
                            className="mr-2"
                            disabled={actionInProgress === order.id}
                          >
                            {actionInProgress === order.id ? (
                              <span className="h-4 w-4 mr-1 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                            ) : (
                              <CheckCircle className="mr-1 h-4 w-4" />
                            )}
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => handleAction(order.id, "reject")}
                            disabled={actionInProgress === order.id}
                          >
                            {actionInProgress === order.id ? (
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
            </TabsContent>
            
            <TabsContent value="completed">
              {completedOrders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">No completed orders to display</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedOrders.map((order) => (
                      <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openOrderDetails(order)}>
                        <TableCell>
                          <p className="font-medium">{order.User?.firstName || "Unknown"}</p>
                          <p className="hidden md:flex text-sm text-muted-foreground">{order.User?.email || "No email"}</p>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>
                          {formatCurrency(order.amount, order.currency)}
                        </TableCell>
                        <TableCell>
                          {isGiftCard(order) ? (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Gift className="h-3 w-3" />
                              Gift Card
                            </Badge>
                          ) : (
                            order.productType || "Product"
                          )}
                        </TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {isGiftCard(order) && (
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => handleResendGiftCard(order.id)}
                              disabled={actionInProgress === order.id}
                            >
                              {actionInProgress === order.id ? (
                                <span className="h-3 w-3 mr-1 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                              ) : (
                                <RefreshCw className="mr-1 h-3 w-3" />
                              )}
                              Resend
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.status === "pending" ? "Review order information before approval" : "View order information"}
            </DialogDescription>
          </DialogHeader>
          
          {renderOrderDetails()}
          
          <DialogFooter>
            {selectedOrder && selectedOrder.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleAction(selectedOrder.id, "reject");
                    setShowDetailsDialog(false);
                  }}
                  disabled={actionInProgress === selectedOrder.id}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleAction(selectedOrder.id, "approve");
                    setShowDetailsDialog(false);
                  }}
                  disabled={actionInProgress === selectedOrder.id}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}