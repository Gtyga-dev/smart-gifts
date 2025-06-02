"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShoppingCart, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { addItem } from "@/app/actions"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductStatus } from "@prisma/client"
import { OutOfStockBadge } from "./OutofStockBadge"
import { motion } from "framer-motion"

interface iAppProps {
  item: {
    id: string
    name: string
    description: string
    price: number
    images: string[]
    status: ProductStatus
  }
}

export function ProductCard({ item }: iAppProps) {
  const { toast } = useToast()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const isOutOfStock = item.status === ProductStatus.archived

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isOutOfStock) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock.",
        variant: "destructive",
      })
      return
    }

    setIsAddingToCart(true)
    try {
      await addItem(item.id)
      toast({
        title: `${item.name}`,
        description: "Item added to cart!",
        variant: "default",
        action: (
          <Link href="/bag">
            <Button variant="outline" size="sm">
              Open Cart <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        ),
      })
    } catch {
      toast({
        title: "Warning",
        description: "Please sign in to add items to the cart.",
        variant: "destructive",
        action: (
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm">
              Sign in <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        ),
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    toast({
      title: isFavorite ? "Removed from favorites" : "Added to favorites",
      description: isFavorite
        ? "Item removed from your wishlist"
        : "Item added to your wishlist",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="bg-card rounded-xl border border-border shadow-md hover:shadow-lg transition-all group relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {item.images.map((img, i) => (
              <CarouselItem key={i} className="flex-shrink-0 w-full">
                <div className="relative h-[250px]">
                  <Image
                    fill
                    alt={`Image ${i + 1}`}
                    src={img || "/placeholder.svg"}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-background/80 border" />
          <CarouselNext className="right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm bg-background/80 border" />
        </Carousel>

        {isOutOfStock && <OutOfStockBadge />}

        {/* Favorite Icon */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full shadow transition-all duration-200 ${
            isFavorite
              ? "bg-primary text-white"
              : "bg-background/80 text-foreground backdrop-blur-sm hover:bg-background"
          } ${isHovered || isFavorite ? "opacity-100" : "opacity-0"}`}
        >
          <Heart className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-sm line-clamp-1">{item.name}</h3>
          <Badge className="px-2 py-0.5 rounded text-xs bg-primary text-white">
            ${item.price.toFixed(2)}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 h-8">
          {item.description}
        </p>

        <div className="flex gap-2 items-center">
          <Button asChild className="flex-1 h-8 text-xs" variant="default">
            <Link href={`/product/${item.id}`}>
              View Details
              <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            size="icon"
            className="h-8 w-8"
            variant="secondary"
            onClick={handleAddToCart}
            disabled={isAddingToCart || isOutOfStock}
          >
            {isAddingToCart ? (
              <span className="text-xs animate-spin">⏳</span>
            ) : (
              <ShoppingCart className="h-3 w-3" />
            )}
            <span className="sr-only">Add to Cart</span>
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export function LoadingProductCard() {
  return (
    <div className="bg-card border border-border rounded-lg p-3 animate-pulse">
      <Skeleton className="w-full h-[250px] rounded-md" />
      <div className="mt-3 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="w-full h-8 mt-4 rounded-md" />
    </div>
  )
}
