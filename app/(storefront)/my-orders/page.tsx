import prisma from "@/app/lib/db"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { unstable_noStore as noStore } from "next/cache"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Gift } from "lucide-react"
import { formatCurrency } from "@/app/lib/currency"
import clsx from "clsx"

export const dynamic = "force-dynamic"

async function getData(userId: string) {
  return await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      amount: true,
      status: true,
      createdAt: true,
      currency: true,
      items: {
        select: {
          name: true,
          quantity: true,
          priceAtTime: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })
}

export default async function OrdersPage() {
  noStore()

  const { getUser } = getKindeServerSession()
  const user = await getUser()
  if (!user) redirect("/")

  const data = await getData(user.id)

  if (!data.length) {
    return (
      <Card className="bg-zinc-900 border border-zinc-800 text-white shadow-lg animate-fade-in">
        <CardHeader className="px-7">
          <CardTitle className="text-xl font-semibold">No Orders Found</CardTitle>
          <CardDescription className="text-muted-foreground">
            You haven’t placed any orders yet.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="bg-zinc-900 border border-zinc-800 text-white shadow-xl animate-fade-in">
      <CardHeader className="px-7">
        <CardTitle className="text-2xl font-semibold tracking-tight">My Orders</CardTitle>
        <CardDescription className="text-muted-foreground">
          Here&lsquo;s a list of your recent purchases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="text-sm">
          <TableHeader>
            <TableRow className="border-zinc-800">
              <TableHead className="text-zinc-400">Order ID</TableHead>
              <TableHead className="text-zinc-400">Products</TableHead>
              <TableHead className="text-zinc-400">Status</TableHead>
              <TableHead className="text-zinc-400">Date</TableHead>
              <TableHead className="text-right text-zinc-400">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((order) => {
              const isGiftCard = order.items.some((item) =>
                item.name.toLowerCase().includes("gift")
              )

              return (
                <TableRow
                  key={order.id}
                  className="border-zinc-800 transition hover:bg-zinc-800/60"
                >
                  <TableCell>
                    <span className="font-mono text-zinc-300">
                      {order.id.slice(0, 8)}
                    </span>
                  </TableCell>
                  <TableCell className="space-y-1">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-2 text-zinc-200">
                        {isGiftCard && (
                          <Gift className="h-4 w-4 text-purple-400 shrink-0" />
                        )}
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-zinc-500">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={clsx(
                        "text-xs font-semibold",
                        order.status === "completed" &&
                          "bg-green-600/20 text-green-400",
                        order.status === "pending" &&
                          "bg-yellow-600/20 text-yellow-400",
                        order.status === "failed" &&
                          "bg-red-600/20 text-red-400"
                      )}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                    }).format(order.createdAt)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-zinc-100">
                    {order.currency
                      ? formatCurrency(order.amount / 100, order.currency)
                      : `$${(order.amount / 100).toFixed(2)}`}
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
