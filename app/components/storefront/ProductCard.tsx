"use client"

import type React from "react"
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
import { useState } from "react"
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

  const handleAddProductToShoppingCart = async (e: React.MouseEvent) => {
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
        description: "Item has been added to cart!",
        variant: "default",
        action: (
          <Link href="/bag">
            <Button
              variant="outline"
              size="sm"
              className="gap-x-1 whitespace-nowrap"
            >
              <span>Open cart</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        ),
      })
    } catch {
      // Optional catch binding: no unused variable
      toast({
        title: "Warning",
        description: "Please sign in to add items to the cart.",
        variant: "destructive",
        action: (
          <Link href="/auth/sign-in">
            <Button
              variant="ghost"
              size="sm"
              className="gap-x-1 whitespace-nowrap"
            >
              <span>Sign in</span>
              <ArrowRight className="h-4 w-4" />
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
      variant: "default",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -3 }}
      className="rounded-lg overflow-hidden bg-card shadow-md hover:shadow-lg transition-all duration-200 border border-border group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {item.images.map((image, index) => (
              <CarouselItem key={index} className="w-full flex-shrink-0">
                <div className="relative h-[250px]">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${item.name} - Image ${index + 1}`}
                    fill
                    className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border-border hover:bg-background h-7 w-7" />
          <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/80 backdrop-blur-sm border-border hover:bg-background h-7 w-7" />
        </Carousel>
        {isOutOfStock && <OutOfStockBadge />}

        {/* Favorite button */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 ${isFavorite
            ? "bg-primary/90 text-white"
            : "bg-background/80 backdrop-blur-sm text-foreground hover:bg-background"
            } ${isHovered || isFavorite ? "opacity-100" : "opacity-0"}`}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-3">
        <div className="flex justify-between items-start gap-2 mb-1.5">
          <h1 className="font-medium text-base line-clamp-1">{item.name}</h1>
          <Badge className="bg-primary text-primary-foreground px-2 py-0.5 rounded-md text-xs shrink-0">
            ${item.price.toFixed(2)}
          </Badge>
        </div>
        <p className="text-muted-foreground text-xs line-clamp-2 mb-3 h-8">
          {item.description}
        </p>
        <div className="flex items-center justify-between gap-2">
          <Button
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-xs h-8 px-3"
            asChild
          >
            <Link href={`/product/${item.id}`}>
              <span>View Details</span>
              <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>

          <Button
            className="h-8 w-8 p-0"
            size="icon"
            variant="secondary"
            onClick={handleAddProductToShoppingCart}
            disabled={isAddingToCart || isOutOfStock}
          >
            {isAddingToCart ? (
              <span className="h-3 w-3 animate-spin">⏳</span>
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
    <div className="rounded-lg overflow-hidden bg-card p-3 animate-pulse border border-border">
      <Skeleton className="w-full h-[250px] rounded-md" />
      <div className="flex flex-col mt-3 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/4" />
      </div>
      <Skeleton className="w-full h-8 mt-4 rounded-md" />
    </div>
  )
}
