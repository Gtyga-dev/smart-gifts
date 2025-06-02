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

export default async function BagRoute() {
  noStore()
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const cart: Cart | null = await redis.get(`cart-${user.id}`)

  let totalPrice = 0
  let totalItems = 0

  cart?.items.forEach((item) => {
    totalPrice += item.price * item.quantity
    totalItems += item.quantity
  })

  // Convert USD to MWK
  const exchangeRate = 4000;
  const totalPriceInMWK = Math.round(totalPrice * exchangeRate * 100) / 100;

  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8">
      {!cart || !cart.items || cart.items.length === 0 ? (
        <Card className="p-8 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-900 dark:to-gray-800 shadow-lg">
          <div className="flex flex-col items-center justify-center text-center">
            <ShoppingBag className="w-16 h-16 text-primary mb-4" />
            <h2 className="text-2xl font-semibold mb-2 text-center">You don&apos;t have any products in your cart</h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Looks like you haven&apos;t added any gift cards to your cart yet. Start shopping to find the perfect
              gift!
            </p>
            <Button asChild className="bg-primary hover:bg-primary/90 text-white">
              <Link href="/">Explore Gift Cards</Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card className="overflow-hidden bg-gradient-to-br from-gray-600 to-gray-500 dark:from-gray-900 dark:to-gray-800 shadow-lg">
            <CardContent className="p-6">
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 py-4 first:pt-0 last:pb-0">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        className="object-cover"
                        fill
                        src={item.imageString || "/placeholder.svg"}
                        alt={item.name}
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-white">${item.price.toFixed(2)} each</p>
                      <div className="flex items-center mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 "
                          onClick={async () => {
                            "use server"
                            await updateQuantity(item.id, item.quantity - 1, user.id)
                          }}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="mx-3 font-medium">{item.quantity}</span>
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
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                      <form action={delItem} className="mt-2">
                        <input type="hidden" name="productId" value={item.id} />
                        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8">
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/20 dark:to-primary/30 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Order Summary</h2>
                <span className="text-sm text-muted-foreground">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </span>
              </div>
              <Separator className="my-4" />
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal (USD)</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Subtotal (MWK)</span>
                  <span>MK{totalPriceInMWK.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total (USD):</span>
                  <div className="text-right">
                    <div>${totalPrice.toFixed(2)}</div>
                  </div>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold">
                  <span>Total (MWK):</span>
                  <div className="text-right">
                    <div>MWK{totalPriceInMWK.toFixed(2)}</div>
                  </div>
                </div>
              </div>
              <form action={checkOut} className="mt-6">
                <CheckoutButton />
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}