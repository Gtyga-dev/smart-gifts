"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { motion, useAnimation } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { useInView } from "react-intersection-observer"
import { Send, Mail, ChevronRight } from "lucide-react"

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

    toast({
      title: "Subscribed!",
      description: "You’ve successfully subscribed to our newsletter.",
    })

    setEmail("")
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.footer
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={containerVariants}
      className="relative mt-24 bg-background border-t border-border"
    >
      {/* Background Glow */}
      <div className="absolute inset-0 z-0">
        <motion.div
          style={{
            backgroundImage: `radial-gradient(circle at 30% 80%, rgba(var(--primary-rgb), 0.12), transparent 60%),
                              radial-gradient(circle at 70% 20%, rgba(var(--primary-rgb), 0.12), transparent 60%)`,
          }}
          className="absolute inset-0"
          animate={{ opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Logo & Description */}
        <motion.div variants={itemVariants} className="space-y-6">
          <Image
            src="/tlogo.png"
            alt="Smart Cards"
            width={160}
            height={80}
            className="h-10 w-auto filter brightness-0 invert"
          />
          <p className="text-muted-foreground text-sm leading-relaxed">
            Smart Cards is your premier destination for digital gift cards.
            Shop top brands delivered instantly to your inbox.
          </p>
        </motion.div>

        {/* Newsletter */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h4 className="text-white text-lg font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Newsletter
          </h4>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted/20 border border-border text-white placeholder:text-muted-foreground"
            />
            <Button type="submit" className="bg-primary hover:bg-primary/90 text-white w-full flex gap-2">
              <Send className="h-4 w-4" />
              Subscribe
            </Button>
          </form>
        </motion.div>

        {/* Quick Links */}
        <motion.div variants={itemVariants}>
          <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: "Shop", href: "/products/all" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <li key={label}>
                <Link href={href} className="flex items-center gap-2 text-muted-foreground hover:text-white transition">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>  
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-border py-4 px-6 text-sm text-muted-foreground text-center">
        © {new Date().getFullYear()} Smart Cards. All rights reserved.
      </div>
    </motion.footer>
  )
}
