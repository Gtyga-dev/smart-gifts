"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {  CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Zap } from "lucide-react"
import type { ProductStatus } from "@prisma/client"

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  status: ProductStatus
  category: string
}

interface ClientTrendingGiftCardsProps {
  products: Product[]
}

export function ClientTrendingGiftCards({ products }: ClientTrendingGiftCardsProps) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  const trendData = useMemo(() => {
    return products.map(() => `+${Math.floor(Math.random() * 15 + 5)}%`)
  }, [products])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  }

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#0f0f0f] via-[#161616] to-[#0f0f0f] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
          <div>
            <Badge
              variant="outline"
              className="mb-2 bg-white/10 text-primary border border-primary/30 backdrop-blur-sm flex items-center gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              Trending Now
            </Badge>
            <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
              Discover <span className="text-primary">Hot Gift Cards</span>
            </h2>
          </div>

          <Link href="/products/all" className="mt-6 md:mt-0">
            <Button variant="outline" className="group border-primary/30 hover:bg-primary/10 text-white">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={itemVariants}
              className="relative group rounded-xl overflow-hidden border border-white/10 backdrop-blur-md bg-white/5 transition-all duration-300 hover:scale-[1.015]"
            >
              <div className="absolute inset-0 z-0 transition-all duration-500 ease-in-out group-hover:scale-105 group-hover:blur-sm">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Overlay Content */}
              <CardContent className="relative z-10 p-5 flex flex-col h-[300px] justify-between bg-black/40 backdrop-blur-md">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-white truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  </div>
                  <Badge className="bg-green-500 text-white text-xs px-2 py-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {trendData[index]}
                  </Badge>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <span className="text-primary font-bold text-lg">${product.price.toFixed(2)}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-white border border-primary/20 hover:bg-primary/10 px-4 h-8"
                    asChild
                  >
                    <Link href={`/product/${product.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Glow background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/10 blur-3xl opacity-40" />
      </div>
    </section>
  )
}
