"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function AirtimeSuccessPage() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactionDetails, setTransactionDetails] = useState<any>(null)

  useEffect(() => {
    const orderId = searchParams.get("id")

    if (!orderId) {
      setError("Missing order ID")
      setLoading(false)
      return
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch order details: ${response.status}`)
        }

        const data = await response.json()
        setTransactionDetails({
          ...data,
          // Ensure we have a recipientPhone property for the UI
          recipientPhone: data.recipientPhone || data.metadata?.recipientPhone || "Not available",
        })
      } catch (error) {
        console.error("Error fetching order details:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderDetails()
  }, [searchParams])

  // If we have a transaction reference but the API call failed,
  // we can still show a generic success message
  const showGenericSuccess = error && searchParams.get("reference")

  if (loading) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Processing Airtime Topup</CardTitle>
            <CardDescription className="text-center">
              Please wait while we process your airtime topup...
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-16 w-16 text-primary animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show generic success if we have a reference but API call failed
  if (showGenericSuccess) {
    const reference = searchParams.get("reference")
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Airtime Topup Successful</CardTitle>
            <CardDescription className="text-center">
              Your airtime topup has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Transaction Reference</span>
                <span className="font-mono text-xs">{reference}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button asChild>
              <Link href="/my-orders">View My Orders</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/airtime">New Topup</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-md py-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
            <CardDescription className="text-center">
              We encountered an error while processing your airtime topup.
            </CardDescription>
          </CardHeader>
          <CardContent className="py-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/airtime">Return to Airtime</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Airtime Topup Successful</CardTitle>
          <CardDescription className="text-center">Your airtime topup has been processed successfully.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center py-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>

          {transactionDetails && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-medium">{transactionDetails.recipientPhone || "Not available"}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {transactionDetails.currency} {(transactionDetails.amount / 100).toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-xs">{transactionDetails.transactionId || transactionDetails.id}</span>
              </div>

              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground">Status</span>
                <span className="font-medium capitalize">{transactionDetails.status}</span>
              </div>

              {transactionDetails.paymentReference && (
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Payment Reference</span>
                  <span className="font-mono text-xs">{transactionDetails.paymentReference}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button asChild>
            <Link href="/my-orders">View My Orders</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/airtime">New Topup</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
