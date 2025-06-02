"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ShoppingCart, Heart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { ProductStatus } from "@prisma/client"

interface ProductCardProps {
  item: {
    id: string
    name: string
    price: number
    description: string
    images: string[]
    status: ProductStatus
  }
}

export function ProductCard({ item }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async () => {
    if (item.status === ProductStatus.archived) {
      toast({ title: "Out of Stock", variant: "destructive" })
      return
    }

    setAdding(true)
    setTimeout(() => {
      setAdding(false)
      toast({ title: "Added to cart", description: item.name })
    }, 800)
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from wishlist" : "Added to wishlist",
      description: item.name,
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="relative rounded-lg border border-border bg-background shadow-sm hover:shadow-lg transition-all overflow-hidden"
    >
      <Link href={`/product/${item.id}`} className="block group">
        <div className="relative h-56 w-full overflow-hidden">
          <Image
            src={item.images[0] || "/placeholder.svg"}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="p-4 space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base text-foreground line-clamp-1">
              {item.name}
            </h3>
            <Badge className="bg-primary text-white text-xs">${item.price.toFixed(2)}</Badge>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

          <div className="flex items-center justify-between mt-4">
            <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); toggleFavorite(); }}>
              <Heart
                className={`h-4 w-4 transition-all ${isFavorite ? "fill-primary text-primary" : ""}`}
              />
            </Button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.preventDefault()
                handleAddToCart()
              }}
              disabled={adding}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90 transition-all"
            >
              {adding ? "Adding..." : "Add to Cart"}
              <ShoppingCart className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
