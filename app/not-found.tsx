'use client'

import { Button } from "@/components/ui/button"
import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: 'easeOut' }
  }),
}

export default function NotFound() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#2e026d] via-[#701a75] to-[#ff1cf7] flex items-center justify-center overflow-hidden px-4">
      {/* Floating particles */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/10 rounded-full blur-sm"
            style={{
              width: `${Math.random() * 6 + 3}px`,
              height: `${Math.random() * 6 + 3}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glass Card Content */}
      <motion.div
        className="relative z-10 max-w-lg w-full text-center bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.15 } },
        }}
      >
        <motion.h1
          className="text-8xl font-extrabold text-white drop-shadow-md"
          variants={fadeUp}
          custom={0}
        >
          404
        </motion.h1>
        <motion.h2
          className="text-2xl md:text-3xl font-semibold text-white mt-4"
          variants={fadeUp}
          custom={1}
        >
          Page Not Found
        </motion.h2>
        <motion.p
          className="text-white/80 text-lg mt-4 mb-6"
          variants={fadeUp}
          custom={2}
        >
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </motion.p>
        <motion.div variants={fadeUp} custom={3}>
          <Button
            asChild
            size="lg"
            className="bg-white text-purple-700 hover:bg-white/80 transition-all"
          >
            <Link href="/">Go Back Home</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  )
}
