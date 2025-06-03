"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, Search, ShoppingBag  } from "lucide-react"
import { NavbarLinks } from "./NavbarLinks"
import { UserDropdown } from "./UserDropdown"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"

interface NavbarClientProps {
  user: {
    email: string
    given_name: string
    picture: string
  } | null
  cartTotal: number
}

export function NavbarClient({ user, cartTotal }: NavbarClientProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "backdrop-blur-md shadow-md bg-background/70" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/tlogo.png"
            alt="Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-6 items-center">
          <NavbarLinks />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Search */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-muted-foreground hover:text-primary transition"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          {/* Cart */}
          <Link href="/bag" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
              {cartTotal > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center"
                >
                  {cartTotal}
                </motion.span>
              )}
            </Button>
          </Link>

          {/* User or Auth */}
          {user ? (
            <UserDropdown
              email={user.email}
              name={user.given_name}
              userImage={user.picture || `https://avatar.vercel.sh/${user.given_name}`}
            />
          ) : (
            <div className="hidden md:flex gap-2">
              <Button asChild variant="ghost" className="text-primary hover:bg-primary/10">
                <Link href="/auth/sign-in">Sign in</Link>
              </Button>
              <Button asChild className="bg-primary text-white hover:bg-primary/90">
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </div>
          )}

          {/* Mobile Nav Toggle */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6 text-muted-foreground" />
                </Button>
              </SheetTrigger>

              <SheetContent
                side="left"
                className="p-0 bg-black/90 backdrop-blur-md max-w-xs w-full flex flex-col"
                style={{ boxShadow: "rgba(0, 0, 0, 0.1) 0px 8px 24px" }}
              >
                {/* Header with Close */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  {user ? (
                    <div className="flex items-center gap-4">
                      <Image
                        src="/tlogo.png"
                       alt="logo"
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                  )}
                  <SheetTrigger asChild>
                  
                  </SheetTrigger>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-6 mt-6 px-6">
                  <NavbarLinks
                    isMobile
                    onLinkClick={() => {
                      // close menu on link click if needed
                    }}
                  />
                </nav>

                {/* Auth Buttons if no user */}
                {!user && (
                  <div className="flex flex-col gap-4 mt-auto px-6 pb-8 pt-10 border-t border-gray-200">
                    <Button asChild variant="outline" className="w-full py-3 text-primary border-primary hover:bg-primary/10">
                      <Link href="/auth/sign-in">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full py-3 bg-primary text-white hover:bg-primary/90">
                      <Link href="/auth/sign-up">Get Started</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Input Animated */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t border-border bg-background"
          >
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for items, categories..."
                  className="pl-10 bg-card border-primary/20 focus:border-primary"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                >
                  &times;
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
