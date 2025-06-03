import { delItem, updateQuantity } from "@/app/actions"
import type { Cart } from "@/app/lib/interfaces"
import { redis } from "@/app/lib/redis"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { Minus, Plus, ShoppingBag, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { unstable_noStore as noStore } from "next/cache"
import { redirect } from "next/navigation"
import { CheckoutButton } from "@/app/components/SubmitButtons"
import crypto from "crypto"

export const dynamic = 'force-dynamic';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function checkOut(formData: FormData) {
  "use server"

  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    return redirect("/")
  }

  const cart: Cart | null = await redis.get(`cart-${user.id}`)

  if (cart && cart.items) {
    const depositId = crypto.randomUUID()

    // Calculate amount in USD
    const amountInUSD = cart.items.reduce((total, item) => total + item.price * item.quantity, 0)

    // Store payment details in Redis for verification (amount in cents)
    await redis.set(
      `payment-${depositId}`,
      {
        userId: user.id,
        amount: Math.round(amountInUSD * 100), // Store in cents
        cartKey: `cart-${user.id}`,
      },
      { ex: 3600 },
    ) // Expire in 1 hour

    return redirect(`/payment?depositId=${depositId}`)
  }

  return redirect("/")
}


// (imports and other logic unchanged...)

export default async function BagRoute() {
  noStore()
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) redirect("/")

  const cart: Cart | null = await redis.get(`cart-${user.id}`)

  let totalPrice = 0
  let totalItems = 0

  cart?.items.forEach((item) => {
    totalPrice += item.price * item.quantity
    totalItems += item.quantity
  })

  const exchangeRate = 4300
  const totalPriceInMWK = Math.round(totalPrice * exchangeRate * 100) / 100

  return (
    <div className="max-w-5xl mx-auto mt-16 px-4 sm:px-6 lg:px-8 space-y-10">
      {!cart || !cart.items || cart.items.length === 0 ? (
        <Card className="p-10 bg-muted/20 backdrop-blur-md rounded-2xl shadow-xl text-center">
          <div className="flex flex-col items-center gap-5">
            <ShoppingBag className="w-16 h-16 text-primary animate-bounce" />
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              Browse our gift cards and find something special just for you.
            </p>
            <Button asChild className="rounded-full px-6 py-2 bg-primary hover:bg-primary/90 text-white">
              <Link href="/">Explore Gift Cards</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-10">
          {/* Cart Items */}
          <Card className="p-6 bg-background/70 backdrop-blur-md rounded-2xl shadow-md border border-muted/30">
            <CardContent className="space-y-6">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-center justify-between gap-6 border-b pb-4 last:border-none"
                >
                  <div className="flex items-center gap-4 w-full sm:w-1/2">
                    <div className="relative w-24 h-24 overflow-hidden rounded-xl border shadow-sm">
                      <Image
                        fill
                        className="object-cover"
                        src={item.imageString || "/placeholder.svg"}
                        alt={item.name}
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        "use server"
                        await updateQuantity(item.id, item.quantity - 1, user.id)
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-base font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={async () => {
                        "use server"
                        await updateQuantity(item.id, item.quantity + 1, user.id)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                    <form action={delItem}>
                      <input type="hidden" name="productId" value={item.id} />
                      <Button
                        type="submit"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="p-6 bg-background/70 backdrop-blur-md rounded-2xl shadow-md border border-muted/30">
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <span className="text-sm text-muted-foreground">
                  {totalItems} item{totalItems !== 1 && "s"}
                </span>
              </div>

              <Separator />

              <div className="grid gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (USD)</span>
                  <span className="font-medium">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal (MWK)</span>
                  <span className="font-medium">MK{totalPriceInMWK.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-base font-semibold">
                  <span>Total (USD)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total (MWK)</span>
                  <span>MWK{totalPriceInMWK.toFixed(2)}</span>
                </div>
              </div>

              <form action={checkOut} className="pt-4">
                <CheckoutButton />
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
