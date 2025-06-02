"use client"

import type React from "react"


import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { motion, useAnimation } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Send, ChevronRight, Mail} from "lucide-react"
import { useInView } from "react-intersection-observer"

export function Footer() {
  const [email, setEmail] = useState("")
  const { toast } = useToast()
  const controls = useAnimation()
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  useEffect(() => {
    if (inView) {
      controls.start("visible")
    }
  }, [controls, inView])

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    // Here you would typically send this to your API
    toast({
      title: "Subscribed!",
      description: "You've been added to our newsletter.",
    })

    setEmail("")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }



  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="mt-16 bg-gradient-to-t from-background via-card/50 to-background py-12 cyber-grid relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 90%, rgba(var(--primary-rgb), 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 10%, rgba(var(--primary-rgb), 0.15) 0%, transparent 50%)`,
          }}
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          {/* About section */}
          <motion.div variants={itemVariants} className="md:col-span-5">
            <div className="flex items-center gap-2 mb-4">

              <Image src="/tlogo.png" alt="logo" width={150} height={40} className="h-8 w-auto filter brightness-0 invert" />
            </div>
            <p className="text-white mb-6">
              Smart Cards is your premier destination for gift cards. We offer a wide selection of digital gift cards from
              top brands, delivered instantly to your inbox.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <h4 className="text-sm font-semibold text-white">Subscribe to our newsletter</h4>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-grow">
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-card/80 border-primary/20 focus:border-primary text-white pr-10"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Mail className="h-4 w-4 text-primary/50" />
                  </div>
                </div>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">Subscribe</span>
                </Button>
              </div>
            </form>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">

              <h3 className="text-lg font-semibold gradient-text">Quick Links</h3>
            </div>
            <ul className="space-y-3 text-white">
              <li>
                <Link
                  href="/products/all"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  About
                </Link>
              </li>
              <li>
                <Link href="/faq" className="flex items-center gap-2 hover:text-primary transition duration-300 group">
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Contact
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Customer Service */}
          <motion.div variants={itemVariants} className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">

              <h3 className="text-lg font-semibold gradient-text">Support</h3>
            </div>
            <ul className="space-y-3 text-white">
              <li>
                <Link
                  href="/terms"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Shipping
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="flex items-center gap-2 hover:text-primary transition duration-300 group"
                >
                  <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  Returns
                </Link>
              </li>
            </ul>
          </motion.div>

   </div>

      </div>
    </motion.footer>
  )
}
