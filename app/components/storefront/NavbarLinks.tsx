"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  ShoppingBag,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarLinksProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Shop", href: "/products/all", icon: ShoppingBag },
  { name: "My Orders", href: "/my-orders", icon: Package },
]

export function NavbarLinks({ isMobile = false, onLinkClick }: NavbarLinksProps) {
  const pathname = usePathname()

  return (
    <nav className={cn(
      "flex items-center w-full mb-4",
      isMobile ? "flex-col gap-2 py-4" : "justify-center gap-6"
    )}>
      {links.map((link) => {
        const isActive = pathname === link.href || pathname?.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-medium group",
              isActive ? "text-primary bg-muted" : "hover:text-primary hover:bg-muted/60"
            )}
          >
            <link.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
            <span className="text-sm">{link.name}</span>

            {isActive && !isMobile && (
              <motion.div
                layoutId="active-nav-indicator"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-primary"
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
