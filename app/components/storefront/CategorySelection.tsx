"use client"

import Link from "next/link"
import { ArrowRight, Tag, ShoppingBag, Gamepad2, Zap, Wallet, Bitcoin, ShoppingBasket } from "lucide-react"
import { motion } from "framer-motion"

// Define category data with icons
const categories = [
  {
    name: "All Products",
    icon: <ShoppingBag className="h-5 w-5" />,
    description: "Browse our complete collection of gift cards and digital products",
    href: "/products/all",
    color: "from-blue-600 to-blue-800",
  },
  {
    name: "Fashion",
    icon: <Tag className="h-5 w-5" />,
    description: "Gift cards for clothing, accessories, and fashion retailers",
    href: "/products/fashion",
    color: "from-purple-600 to-purple-800",
  },
  {
    name: "Retail & eCommerce",
    icon: <ShoppingBasket className="h-5 w-5" />,
    description: "Gift cards for online shopping and retail stores",
    href: "/products/retail",
    color: "from-pink-600 to-pink-800",
  },
  {
    name: "Entertainment",
    icon: <Gamepad2 className="h-5 w-5" />,
    description: "Gaming, streaming, and entertainment gift cards",
    href: "/products/entertainment",
    color: "from-green-600 to-green-800",
  },
  {
    name: "Crypto Currencies",
    icon: <Bitcoin className="h-5 w-5" />,
    description: "Gift cards for popular cryptocurrencies and exchanges",
    href: "/products/crypto",
    color: "from-yellow-600 to-yellow-800",
  },
  {
    name: "Digital Wallets & Payments",
    icon: <Wallet className="h-5 w-5" />,
    description: "Gift cards for payment platforms and digital wallets",
    href: "/products/digital-wallets",
    color: "from-indigo-600 to-indigo-800",
  },
  {
    name: "Utilities",
    icon: <Zap className="h-5 w-5" />,
    description: "Gift cards for everyday services and utilities",
    href: "/products/utilities",
    color: "from-orange-600 to-orange-800",
  },
]

export function CategoriesSelection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <Link
            className="text-sm font-semibold text-blue-400 hover:text-blue-500 flex items-center transition-colors duration-300"
            href="/products/all"
          >
            Browse all Products
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={item}>
              <Link
                href={category.href}
                className="group block relative overflow-hidden rounded-lg shadow-lg transition-all duration-500 hover-card-effect h-full"
              >
                <div className="h-full bg-secondary/50 border border-blue-900/30 p-6 flex flex-col">
                  <div
                    className={`w-12 h-12 rounded-lg mb-4 flex items-center justify-center bg-gradient-to-br ${category.color} text-white`}
                  >
                    {category.icon}
                  </div>

                  <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-blue-400 transition-colors duration-300">
                    {category.name}
                  </h3>

                  <p className="text-muted-foreground text-sm mb-6 flex-grow">{category.description}</p>

                  <div className="mt-auto">
                    <span className="inline-flex items-center text-blue-500 text-sm font-medium group-hover:translate-x-1 transition-transform duration-300">
                      Explore
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-500/50 rounded-lg transition-all duration-300"></div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

