"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"

export function OutOfStockBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute top-2 right-2 z-10"
    >
      <Badge
        variant="destructive"
        className="px-3 py-1 text-xs font-semibold uppercase tracking-wider animate-pulse-blue"
      >
        Out of Stock
      </Badge>
    </motion.div>
  )
}

