"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface iAppProps {
  images: string[]
}

export function ImageSlider({ images }: iAppProps) {
  const [mainImageIndex, setMainImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })

  function handlePreviousClick() {
    setMainImageIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1))
  }

  function handleNextClick() {
    setMainImageIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1))
  }

  function handleImageClick(index: number) {
    setMainImageIndex(index)
  }

  function handleZoomToggle() {
    setIsZoomed(!isZoomed)
  }

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isZoomed) return

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - left) / width
    const y = (e.clientY - top) / height

    setZoomPosition({ x, y })
  }

  return (
    <div className="grid gap-6 md:gap-3 items-start">
      <div
        className="relative overflow-hidden rounded-lg mb-4 bg-muted/30"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isZoomed && setIsZoomed(false)}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative w-full h-[600px]"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={mainImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                width={600}
                height={600}
                src={images[mainImageIndex] || "/placeholder.svg"}
                alt="Product image"
                className={cn(
                  "object-cover w-full h-full transition-transform duration-300",
                  isZoomed ? "scale-150" : "scale-100",
                )}
                style={
                  isZoomed
                    ? {
                      transformOrigin: `${zoomPosition.x * 100}% ${zoomPosition.y * 100}%`,
                    }
                    : undefined
                }
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <div className="absolute inset-0 flex items-center justify-between px-4">
          <Button
            onClick={handlePreviousClick}
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm border border-border hover:bg-background h-10 w-10 rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            onClick={handleNextClick}
            variant="ghost"
            size="icon"
            className="bg-background/80 backdrop-blur-sm border border-border hover:bg-background h-10 w-10 rounded-full"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>

        <Button
          onClick={handleZoomToggle}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm border border-border hover:bg-background h-10 w-10 rounded-full"
        >
          <ZoomIn className="w-5 h-5" />
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {images.map((image, index) => (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              index === mainImageIndex
                ? "border-2 border-primary ring-2 ring-primary/20"
                : "border border-border hover:border-primary/50",
              "relative overflow-hidden rounded-lg cursor-pointer transition-all duration-200",
            )}
            key={index}
            onClick={() => handleImageClick(index)}
          >
            <Image
              src={image || "/placeholder.svg"}
              alt="Product Image"
              width={100}
              height={80}
              className="object-cover w-[100px] h-[100px]"
            />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
