"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Bitcoin,
  Film,
  Gift,
  Home,
  Package,
  ShoppingBag,
  ShoppingBasket,
  ShoppingCart,
  Wallet,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface NavbarLinksProps {
  isMobile?: boolean
  onLinkClick?: () => void
}

export function NavbarLinks({ isMobile = false, onLinkClick }: NavbarLinksProps) {
  const pathname = usePathname()

  const links = [
    { id: 0, name: "Home", href: "/", icon: Home },
    {
      id: 1,
      name: "Gift Cards",
      href: "#",
      icon: Gift,
      isDropdown: true,
      dropdownItems: [
        { id: "gc-1", name: "All Gift Cards", href: "/products/all", icon: ShoppingBag },
        { id: "gc-2", name: "Fashion", href: "/products/fashion", icon: ShoppingCart },
        { id: "gc-3", name: "Retail & eCommerce", href: "/products/retail", icon: ShoppingBasket },
        { id: "gc-4", name: "Entertainment", href: "/products/entertainment", icon: Film },
        { id: "gc-5", name: "Crypto Currencies", href: "/products/crypto", icon: Bitcoin },
        { id: "gc-6", name: "Digital Wallets & Payments", href: "/products/wallets", icon: Wallet },
        { id: "gc-7", name: "Utilities", href: "/products/utilities", icon: Wallet },
      ],
    },
 
   

    { id: 2, name: "My Orders", href: "/my-orders", icon: Package },

  ]

  return (
    <div
      className={cn("flex items-center gap-1", isMobile ? "flex-col items-start gap-2" : "flex-row items-center gap-1")}
    >
      {links.map((link) => {
        const isActive =
          pathname === link.href ||
          (link.href !== "/" && link.href !== "#" && pathname?.startsWith(link.href)) ||
          (link.isDropdown &&
            link.dropdownItems?.some(
              (item) => pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href)),
            ))

        if (link.isDropdown && !isMobile) {
          return (
            <div key={link.id} className="hidden md:flex justify-center items-center gap-x-2 ml-8 relative">
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "group p-2 font-medium rounded-md",
                      isActive ? "bg-muted" : "hover:bg-muted hover:bg-opacity-75",
                    )}
                  >
                    <link.icon className="h-4 w-4 mr-2" />
                    <span>{link.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {link.dropdownItems?.map((item) => (
                    <DropdownMenuItem key={item.id} asChild>
                      <Link href={item.href} onClick={onLinkClick} className="flex items-center">
                        <item.icon className="h-4 w-4 mr-2" />
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        }

        // For mobile dropdown
        if (link.isDropdown && isMobile) {
          return (
            <div key={link.id} className="flex flex-col space-y-1 w-full">
              <div className="flex items-center p-2 font-medium">
                <link.icon className="h-4 w-4 mr-2" />
                <span>{link.name}</span>
              </div>
              <div className="pl-6 space-y-1">
                {link.dropdownItems?.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      "flex items-center p-2 rounded-md text-sm",
                      pathname === item.href ? "bg-muted" : "hover:bg-muted hover:bg-opacity-75",
                    )}
                  >
                    <item.icon className="h-3 w-3 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          )
        }

        return (
          <div
            key={link.id}
            className={cn(
              isMobile
                ? "flex flex-col space-y-4 w-full"
                : "hidden md:flex justify-center items-center gap-x-2 ml-8 relative",
            )}
          >
            {!isMobile && isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              />
            )}

            <Link
              href={link.href}
              onClick={onLinkClick}
              className={cn(
                pathname === link.href ? "bg-muted" : "hover:bg-muted hover:bg-opacity-75",
                "group p-2 font-medium rounded-md flex items-center",
              )}
            >
              <link.icon className="h-4 w-4 mr-2" />
              <span>{link.name}</span>
              {isMobile && isActive && (
                <motion.div
                  layoutId="mobile-navbar-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          </div>
        )
      })}
    </div>
  )
}
