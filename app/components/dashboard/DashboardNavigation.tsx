"use client"

import { cn } from "@/lib/utils"
import { CreditCard, LayoutDashboard, Package, ShoppingBag, Users, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const links = [
   {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Orders",
    href: "/dashboard/orders",
    icon: ShoppingBag,
  },
  {
    name: "Products",
    href: "/dashboard/products",
    icon: Package,
  },

  {
    name: "Payments",
    href: "/dashboard/admin/orders",
    icon: CreditCard,
  },
    {
    name: "GiftCard Orders",
    href: "/dashboard/admin/gift-cards",
    icon: ShoppingBag,
  },
  {
    name: "Reloadly Sync",
    href: "/dashboard/reloadly",
    icon: Zap,
  },
  {
    name: "Referrals",
    href: "/dashboard/admin/referrals",
    icon: Users,
  },
]

export function DashboardNavigation() {
  const pathname = usePathname()
  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-2 py-2",
            link.href === pathname ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {link.icon && <link.icon className="h-4 w-4" />}
          {link.name}
        </Link>
      ))}
    </>
  )
}
