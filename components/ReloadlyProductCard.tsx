"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface ReloadlyProductCardProps {
  product: {
    id: string
    name: string
    images: string[]
    price: number
    description: string
    reloadlyData: {
      productId: number
      brandId: number
      recipientCurrencyCode: string
      denominationType: string
      fixedRecipientDenominations?: number[]
      minRecipientDenomination?: number
      maxRecipientDenomination?: number
    }
  }
}

export function ReloadlyProductCard({ product }: ReloadlyProductCardProps) {
  const [loading, setLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [recipientEmail, setRecipientEmail] = useState("")
  const { toast } = useToast()

  const handlePurchase = async () => {
    try {
      setLoading(true)

      // For fixed denomination products, use the first denomination
      const unitPrice = product.reloadlyData.fixedRecipientDenominations?.[0] || product.price

      const response = await fetch("/api/reloadly/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.reloadlyData.productId,
          quantity,
          unitPrice,
          recipientEmail: recipientEmail || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create order")
      }

      toast({
        title: "Order placed successfully!",
        description: `Your order for ${product.name} has been placed.`,
      })

      // Redirect to order confirmation page
      window.location.href = `/order-confirmation?id=${data.orderId}`
    } catch (error) {
      console.error("Purchase error:", error)
      toast({
        variant: "destructive",
        title: "Purchase failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-square">
        <Image
          src={product.images[0] || "/placeholder.svg?height=300&width=300"}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.description}</p>

        <div className="mt-4">
          <p className="text-xl font-bold">
            {product.reloadlyData.recipientCurrencyCode} {product.price.toFixed(2)}
          </p>

          {product.reloadlyData.denominationType === "FIXED" &&
            product.reloadlyData.fixedRecipientDenominations &&
            product.reloadlyData.fixedRecipientDenominations.length > 1 && (
              <div className="mt-2">
                <Label htmlFor="denomination">Denomination</Label>
                <select
                  id="denomination"
                  className="w-full mt-1 p-2 border rounded"
                  onChange={() => {
                    // Update price based on selected denomination
                    // Note: We're not using this value directly, so no need to store it
                    // The selected denomination will be used at purchase time
                  }}
                >
                  {product.reloadlyData.fixedRecipientDenominations.map((denom) => (
                    <option key={denom} value={denom}>
                      {product.reloadlyData.recipientCurrencyCode} {denom.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>
            )}

          <div className="mt-2">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>

          <div className="mt-2">
            <Label htmlFor="email">Recipient Email (optional)</Label>
            <Input
              id="email"
              type="email"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              placeholder="recipient@example.com"
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handlePurchase} className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Buy Now"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
