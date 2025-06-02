import prisma from "@/app/lib/db"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Gift, ExternalLink } from "lucide-react"
import { formatCurrency } from "@/app/lib/currency"

export const dynamic = 'force-dynamic';


// Fetch orders for the authenticated user
async function getData(userId: string) {
  const data = await prisma.order.findMany({
    where: {
      userId: userId,
    },
    select: {
      amount: true,
      createdAt: true,
      status: true,
      id: true,
      transactionId: true,
      paymentMethod: true,
      currency: true,
      exchangeRate: true,
      User: {
        select: {
          firstName: true,
          email: true,
        },
      },
      items: {
        select: {
          name: true,
          quantity: true,
          priceAtTime: true,
          id: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return data
}

export default async function OrdersPage() {
  noStore()

  // Get the user session from Kinde
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect("/") // Redirect to home if not authenticated
  }

  // Fetch the authenticated user's orders
  const data = await getData(user.id)

  // If there are no orders, show a fallback message
  if (!data.length) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
        <CardHeader className="px-7">
          <div className="flex items-center gap-2">
            <CardTitle className="neon-text">No Orders Found</CardTitle>
          </div>
          <CardDescription>You have no recent orders.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
      <CardHeader className="px-7">
        <div className="flex items-center gap-2">
          <CardTitle className="neon-text">Orders</CardTitle>
        </div>
        <CardDescription>Your recent orders</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="border-primary/20">
              <TableHead className="text-primary">Order ID</TableHead>
              <TableHead className="text-primary">Product(s)</TableHead>
              <TableHead className="text-primary">Status</TableHead>
              <TableHead className="text-primary">Date</TableHead>
              <TableHead className="text-right text-primary">Amount</TableHead>
              <TableHead className="text-right text-primary">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => {
              // Check if this is a gift card order
              const isGiftCard = order.items.some(
                (item) => item.name.toLowerCase().includes("gift") || item.name.toLowerCase().includes("card"),
              )

              return (
                <TableRow key={order.id} className="border-primary/10 hover:bg-primary/5">
                  <TableCell>
                    <p className="text-sm font-medium">{order.id.slice(0, 8)}</p>
                  </TableCell>
                  <TableCell>
                    {order.items.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        {isGiftCard && <Gift className="h-4 w-4 text-primary" />}
                        <p className="font-medium text-primary-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "completed" ? "default" : order.status === "pending" ? "outline" : "secondary"
                      }
                      className={
                        order.status === "completed"
                          ? "bg-green-500/20 text-green-400"
                          : order.status === "pending"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-blue-500/20 text-blue-400"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }).format(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right text-primary">
                    {order.currency
                      ? formatCurrency(order.amount / 100, order.currency)
                      : `$${(order.amount / 100).toFixed(2)}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/my-orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
