"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MwkCurrencyInput } from "@/components/MwkCurrencyInput"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Phone } from "lucide-react"
import Image from "next/image"
import { PhoneInput } from "../PhoneInput"


interface Operator {
  id: string
  name: string
  logoUrls: string[]
  country: {
    isoName: string
    name: string
    flagUrl: string
  }
  minAmount: number
  maxAmount: number
  senderCurrencyCode: string
  destinationCurrencyCode: string
}

interface AirtimeTopupFormProps {
  operator: Operator
}

export function AirtimeTopupForm({ operator }: AirtimeTopupFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")
  const [amount, setAmount] = useState(operator.minAmount)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const validatePhone = (phone: string): boolean => {
    if (!phone) {
      setPhoneError("Phone number is required")
      return false
    }

    // For Malawi numbers, ensure they have the correct format
    if (operator.country.isoName === "MW" && phone.startsWith("+265")) {
      // Should be +265 followed by 9 digits
      const digits = phone.replace("+265", "")
      if (!/^\d{9}$/.test(digits)) {
        setPhoneError("Malawi numbers should have 9 digits after the country code")
        return false
      }
    }

    setPhoneError("")
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePhone(phoneNumber)) {
      return
    }

    if (amount < operator.minAmount || amount > operator.maxAmount) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: `Amount must be between ${operator.senderCurrencyCode} ${operator.minAmount} and ${operator.senderCurrencyCode} ${operator.maxAmount}`,
      })
      return
    }

    try {
      setLoading(true)

      // Create a pending transaction and get checkout URL
      const response = await fetch("/api/create-airtime-transaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operatorId: operator.id,
          operatorName: operator.name,
          amount,
          recipientPhone: phoneNumber,
          useLocalAmount: operator.country.isoName === "MW", // Use local amount for Malawi
          currency: operator.senderCurrencyCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error("API error response:", data)
        throw new Error(data.error || data.message || "Failed to create transaction")
      }

      // Redirect to Paychangu checkout page
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      } else {
        throw new Error("Checkout URL not provided")
      }
    } catch (error) {
      console.error("Transaction creation error:", error)
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
      setLoading(false)
    }
  }

  return (
    <Card className="glass-effect animate-float">
      <CardHeader>
        <div className="flex items-center gap-4">
          {operator.logoUrls && operator.logoUrls.length > 0 ? (
            <Image
              src={operator.logoUrls[0] || "/placeholder.svg"}
              alt={operator.name}
              width={48}
              height={48}
              className="object-contain"
            />
          ) : (
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center animate-pulse-border">
              <Phone className="h-6 w-6 text-primary" />
            </div>
          )}
          <div>
            <CardTitle className="neon-text">{operator.name}</CardTitle>
            <CardDescription>
              {operator.country.name} ({operator.country.isoName})
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phone">Recipient Phone Number</Label>
            <PhoneInput
              id="phone"
              value={phoneNumber}
              onChange={setPhoneNumber}
              defaultCountry={operator.country.isoName}
              placeholder="Enter phone number"
              error={phoneError}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ({operator.senderCurrencyCode})</Label>
            <MwkCurrencyInput value={amount} onChange={setAmount} min={operator.minAmount} max={operator.maxAmount} />
            <p className="text-xs text-muted-foreground">
              Min: {operator.senderCurrencyCode} {operator.minAmount.toFixed(2)} | Max: {operator.senderCurrencyCode}{" "}
              {operator.maxAmount.toFixed(2)}
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
              "Send Airtime"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
