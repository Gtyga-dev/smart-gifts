"use client"

import { ProductCard } from "@/app/components/storefront/ProductCard"
import { Product } from "@/types"
import { motion } from "framer-motion"


interface ClientFeaturedProductsProps {
  products: Product[]
}

export function ClientFeaturedProducts({ products }: ClientFeaturedProductsProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold tracking-tight mb-8"
        >
          Featured Gift Cards
        </motion.h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {products && products.length > 0 ? (
            products.map((product) => <ProductCard key={product.id} item={product} />)
          ) : (
            <p>No featured products available.</p>
          )}
        </motion.div>
      </div>
    </section>
  )
}
