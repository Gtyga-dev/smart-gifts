/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { NavbarLinks } from "./NavbarLinks"
import { Menu, ShoppingCart, Search } from "lucide-react"
import { UserDropdown } from "./UserDropdown"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Sheet, SheetTrigger, SheetContent, SheetHeader } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { motion, AnimatePresence } from "framer-motion"


interface NavbarClientProps {
  user: {
    email: string
    given_name: string
    picture: string
  } | null
  cartTotal: number
}

export function NavbarClient({ user, cartTotal }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const closeSheet = () => setIsOpen(false)

  useEffect(() => {

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])



  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "glass-effect shadow-md" : "bg-background"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b mb-4 border-border">
        {/* Logo and Links */}
        <div className="flex items-center">
          <Link href="/" className="mr-6">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center">
              <div className="relative">

                <Image src="/tlogo.png" alt="logo" width={150} height={40} className="h-8 w-auto filter brightness-0 invert" />
              </div>
            </motion.div>
          </Link>
          {/* Hidden on Mobile */}
          <div className="hidden md:block">
            <NavbarLinks />
          </div>
        </div>

        {/* Search, Cart, User Auth, Theme Toggle */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Theme toggle */}

          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-primary"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
          >
            <Search className="h-5 w-5" />
            <span className="sr-only">Search</span>
          </Button>

          {/* Cart Link - Always visible */}
          <Link href="/bag" className="relative group">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
              <ShoppingCart className="h-5 w-5" />
              {cartTotal > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                  {cartTotal}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          {/* User Dropdown or Sign In / Create Account */}
          {user ? (
            <UserDropdown
              email={user.email}
              name={user.given_name}
              userImage={user.picture ?? `https://avatar.vercel.sh/${user.given_name}`}
            />
          ) : (
            <>
              {/* Desktop Sign In / Create Account */}
              <div className="hidden md:flex space-x-2">
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="border-primary/20 hover:bg-primary/10 text-primary"
                >
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
                <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link href="/auth/sign-up">Create Account</Link>
                </Button>
              </div>
              {/* Mobile Sign In Button */}
              <div className="md:hidden">
                <Button
                  variant="outline"
                  asChild
                  size="sm"
                  className="border-primary/20 hover:bg-primary/10 text-primary"
                >
                  <Link href="/auth/sign-in">Sign in</Link>
                </Button>
              </div>
            </>
          )}

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 bg-card overflow-y-auto border-r border-border">
                <SheetHeader>
                  {/* Logo in Mobile Menu */}
                  <Link href="/" className="flex items-center mb-6" onClick={closeSheet}>
                    <div className="relative">

                      <Image
                        src="/tlogo.png"
                        alt="logo"
                        width={120}
                        height={40}
                        className="h-8 w-auto filter brightness-0 invert"
                      />
                    </div>
                  </Link>
                </SheetHeader>
                <Separator className="my-4" />

                {/* Mobile Menu Links - only show if user is logged in */}
                {user && (
                  <div className="space-y-4 mt-4">
                    <NavbarLinks isMobile={true} onLinkClick={closeSheet} />
                  </div>
                )}

                {/* Sign In / Create Account on Mobile */}
                {!user && (
                  <div className="mt-6 space-y-2">
                    <Button
                      variant="outline"
                      asChild
                      className="w-full border-primary/20 hover:bg-primary/10 text-primary"
                      onClick={closeSheet}
                    >
                      <Link href="/auth/sign-in">Sign in</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={closeSheet}
                    >
                      <Link href="/auth/sign-up">Create Account</Link>
                    </Button>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-b border-border overflow-hidden glass-effect"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for gift cards..."
                  className="pl-10 bg-card border-primary/20 focus:border-primary"
                  autoFocus
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary"
                  onClick={() => setIsSearchOpen(false)}
                >
                  <span className="sr-only">Close search</span>
                  &times;
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}