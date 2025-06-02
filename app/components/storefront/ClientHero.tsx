/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function ClientHero() {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  }

  const staggerChildren = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <section
      className="relative w-full pt-24 pb-32 bg-gradient-to-b from-background via-secondary/30 to-background overflow-hidden"
      style={{ backgroundPosition: `center ${scrollY * 0.5}px` }}
    >
      {/* Background Grid Animation */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <motion.div
          className="w-full h-full"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(var(--primary-rgb), 0.05) 1px, transparent 1px), linear-gradient(rgba(var(--primary-rgb), 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
          animate={{ backgroundPosition: ["0px 0px", "40px 40px"] }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Emotionally Powerful Highlights */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="flex justify-center mb-10"
        >
          <div className="glass-effect rounded-xl py-4 px-6 flex flex-col sm:flex-row justify-center gap-6 border border-primary/20 shadow-lg animate-glow bg-background/60 backdrop-blur-md">
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold">🎁 Over 10,000 Gifts Delivered</h3>
              <p className="text-sm text-white/80">Trusted by thousands across the globe</p>
            </div>
            <div className="text-center">
              <h3 className="text-white text-lg font-semibold">⚡ 24/7 Instant Delivery</h3>
              <p className="text-sm text-white/80">Even on holidays and weekends</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Content */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerChildren}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Left Text */}
          <motion.div variants={fadeInUp} className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight text-white">
              Make Someone Smile <span className="text-primary">In Just Seconds</span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl">
              Make every occasion unforgettable with instant gift cards. Delight your loved ones—no shipping, no waiting, just pure joy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white shadow-xl" asChild>
                <Link href="/products/all">
                  Get Gift Cards Now <ArrowRight size={16} className="ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/20 text-white hover:bg-white/10" asChild>
                <Link href="/how-it-works">
                  See How You Can Surprise Someone <span className="ml-2">→</span>
                </Link>
              </Button>
            </div>
            <motion.div
              className="pt-4"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1, repeat: Infinity, repeatType: "reverse" }}
            >
              <ArrowRight className="rotate-90 text-white/60" size={20} />
            </motion.div>
          </motion.div>

          {/* Right Animation / Illustration */}
          <motion.div
            variants={fadeInUp}
            className="relative flex justify-center items-center"
          >
            <div className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-gradient-to-tr from-primary/50 to-accent/50 rounded-full blur-2xl absolute animate-pulse-slow" />
            <motion.div
              className="relative z-10 p-6 rounded-3xl bg-background/90 border border-primary/10 backdrop-blur-lg shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="text-center">
                <p className="text-sm uppercase tracking-wide text-primary mb-2">New Arrival</p>
                <h3 className="text-2xl font-bold text-white mb-2">eGift Card Mega Pack</h3>
                <p className="text-white/80 text-sm">20+ top brands in one sleek bundle. Perfect for birthdays, holidays, and surprises.</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}