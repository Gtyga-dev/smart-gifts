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
import { ShoppingCart } from "lucide-react"
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
      })
    } catch {
      toast({
        title: "Warning",
        description: "Please sign in to add items to the cart.",
        variant: "destructive",
        action: (
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        ),
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group relative rounded-xl overflow-hidden bg-muted shadow-sm hover:shadow-xl transition-all duration-300 border border-border"
    >
      {/* IMAGE CAROUSEL */}
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {item.images.map((image, index) => (
              <CarouselItem key={index} className="w-full flex-shrink-0">
                <div className="relative h-[230px] bg-zinc-100">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${item.name} - Image ${index + 1}`}
                    fill
                    className="object-cover object-center w-full h-full transition-transform duration-500 group-hover:scale-105 rounded-t-xl"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/70 backdrop-blur-sm hover:bg-background h-7 w-7" />
          <CarouselNext className="right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/70 backdrop-blur-sm hover:bg-background h-7 w-7" />
        </Carousel>

        {isOutOfStock && <OutOfStockBadge />}
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start gap-2">
          <h1 className="font-semibold text-sm text-foreground line-clamp-1">
            {item.name}
          </h1>
          <Badge className="bg-primary text-white px-2 py-0.5 text-xs rounded">
            ${item.price.toFixed(2)}
          </Badge>
        </div>

        <p className="text-muted-foreground text-xs leading-snug line-clamp-2">
          {item.description}
        </p>

        <Button
          className="w-full h-9 mt-2 text-sm gap-2"
          variant="default"
          onClick={handleAddProductToShoppingCart}
          disabled={isAddingToCart || isOutOfStock}
        >
          {isAddingToCart ? (
            <span className="h-4 w-4 animate-spin">⏳</span>
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          <span>Add to Cart</span>
        </Button>
      </div>
    </motion.div>
  )
}

export function LoadingProductCard() {
  return (
    <div className="rounded-xl overflow-hidden bg-muted p-3 animate-pulse border border-border">
      <Skeleton className="w-full h-[230px] rounded-lg" />
      <div className="flex flex-col mt-3 space-y-1.5">
        <Skeleton className="h-3.5 w-3/4" />
        <Skeleton className="h-3.5 w-1/4" />
      </div>
      <Skeleton className="w-full h-9 mt-4 rounded-md" />
    </div>
  )
}
