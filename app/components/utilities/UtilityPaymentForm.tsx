"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { MwkCurrencyInput } from "@/components/MwkCurrencyInput"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Zap } from "lucide-react"
import Image from "next/image"

interface Biller {
  id: string
  name: string
  country: {
    isoName: string
    name: string
    flagUrl: string
  }
  minAmount: number
  maxAmount: number
  localAmount?: boolean
  senderCurrencyCode: string
  destinationCurrencyCode: string
  logoUrls?: string[]
  requiresInvoice?: boolean
}

interface UtilityPaymentFormProps {
  biller: Biller
}

export function UtilityPaymentForm({ biller }: UtilityPaymentFormProps) {
  const [accountNumber, setAccountNumber] = useState("")
  const [accountError, setAccountError] = useState("")
  const [invoiceId, setInvoiceId] = useState("")
  const [invoiceError, setInvoiceError] = useState("")
  const [amount, setAmount] = useState(biller.minAmount || 500)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const validateForm = (): boolean => {
    let isValid = true

    if (!accountNumber) {
      setAccountError("Account number is required")
      isValid = false
    } else {
      setAccountError("")
    }

    if (biller.requiresInvoice && !invoiceId) {
      setInvoiceError("Invoice ID is required")
      isValid = false
    } else {
      setInvoiceError("")
    }

    if (amount < biller.minAmount || (biller.maxAmount && amount > biller.maxAmount)) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: `Amount must be between ${biller.senderCurrencyCode} ${biller.minAmount} and ${biller.senderCurrencyCode} ${biller.maxAmount || "unlimited"}`,
      })
      isValid = false
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

      // Generate a deposit ID for the payment flow
      const depositId = crypto.randomUUID()

      // Store payment details in Redis for verification
      const storeResponse = await fetch("/api/payment/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId,
          amount: amount * 100, // Convert to cents
          currency: biller.senderCurrencyCode,
        }),
      })

      if (!storeResponse.ok) {
        const error = await storeResponse.json()
        throw new Error(error.message || "Failed to initiate payment")
      }

      // Process payment through PayChangu
      const paymentResponse = await fetch("/api/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          depositId,
          productType: "utility",
          productId: biller.id,
          quantity: 1,
          recipientInfo: {
            accountNumber: accountNumber,
            invoiceId: invoiceId || undefined,
          },
        }),
      })

      if (!paymentResponse.ok) {
        const error = await paymentResponse.json()
        throw new Error(error.message || "Failed to process payment")
      }

      const paymentData = await paymentResponse.json()

      // Redirect to PayChangu checkout
      window.location.href = paymentData.payment_url
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        variant: "destructive",
        title: "Payment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      setLoading(false)
    }
  }

  return (
    <Card className="glass-effect animate-float">
      <CardHeader>
        <div className="flex items-center gap-4">
          {biller.logoUrls && biller.logoUrls.length > 0 ? (
            <Image
              src={biller.logoUrls[0] || "/placeholder.svg"}
              alt={biller.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-border">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="neon-text">{biller.name}</CardTitle>
            <CardDescription>
              {biller.country.name} ({biller.country.isoName})
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="Enter your account number"
            />
            {accountError && <p className="text-sm text-destructive">{accountError}</p>}
          </div>

          {biller.requiresInvoice && (
            <div className="space-y-2">
              <Label htmlFor="invoiceId">Invoice ID</Label>
              <Input
                id="invoiceId"
                value={invoiceId}
                onChange={(e) => setInvoiceId(e.target.value)}
                placeholder="Enter your invoice ID"
              />
              {invoiceError && <p className="text-sm text-destructive">{invoiceError}</p>}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({biller.senderCurrencyCode})</Label>
            <MwkCurrencyInput value={amount} onChange={setAmount} min={biller.minAmount} max={biller.maxAmount} />
            <p className="text-xs text-muted-foreground">
              Min: {biller.senderCurrencyCode} {biller.minAmount.toFixed(2)}
              {biller.maxAmount && (
                <>
                  {" "}
                  | Max: {biller.senderCurrencyCode} {biller.maxAmount.toFixed(2)}
                </>
              )}
            </p>
          </div>
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
