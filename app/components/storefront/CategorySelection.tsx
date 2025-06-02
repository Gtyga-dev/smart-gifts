"use client"

import Link from "next/link"
import {
  ArrowRight,
  Tag,
  ShoppingBag,
  Gamepad2,
  Zap,
  Wallet,
  Bitcoin,
  ShoppingBasket,
} from "lucide-react"
import { motion } from "framer-motion"

// Dark-themed gradients for cards
const categories = [
  {
    name: "All Products",
    icon: <ShoppingBag className="h-12 w-12" />,
    href: "/products/all",
    gradient: "bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700",
  },
  {
    name: "Fashion",
    icon: <Tag className="h-12 w-12" />,
    href: "/products/fashion",
    gradient: "bg-gradient-to-tr from-purple-900 via-purple-800 to-purple-700",
  },
  {
    name: "Retail & eCommerce",
    icon: <ShoppingBasket className="h-12 w-12" />,
    href: "/products/retail",
    gradient: "bg-gradient-to-tr from-pink-900 via-pink-800 to-pink-700",
  },
  {
    name: "Entertainment",
    icon: <Gamepad2 className="h-12 w-12" />,
    href: "/products/entertainment",
    gradient: "bg-gradient-to-tr from-green-900 via-green-800 to-green-700",
  },
  {
    name: "Crypto Currencies",
    icon: <Bitcoin className="h-12 w-12" />,
    href: "/products/crypto",
    gradient: "bg-gradient-to-tr from-yellow-900 via-yellow-800 to-yellow-700",
  },
  {
    name: "Digital Wallets & Payments",
    icon: <Wallet className="h-12 w-12" />,
    href: "/products/digital-wallets",
    gradient: "bg-gradient-to-tr from-indigo-900 via-indigo-800 to-indigo-700",
  },
  {
    name: "Utilities",
    icon: <Zap className="h-12 w-12" />,
    href: "/products/utilities",
    gradient: "bg-gradient-to-tr from-orange-900 via-orange-800 to-orange-700",
  },
]

// Motion variants for card animations
const cardVariants = {
  rest: {
    scale: 1,
    boxShadow:
      "0 6px 15px rgba(0, 0, 0, 0.4), 0 0 0 0 rgba(59, 130, 246, 0)", // subtle shadow
    transition: { duration: 0.3, type: "spring", stiffness: 300 },
  },
  hover: {
    scale: 1.06,
    boxShadow:
      "0 15px 25px rgba(59, 130, 246, 0.7), 0 0 20px 6px rgba(59, 130, 246, 0.45)", // bright blue glow
    transition: { duration: 0.3, type: "spring", stiffness: 300 },
  },
}

export function CategoriesSelection() {
  return (
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-12 text-center">
          <h2 className="text-5xl font-extrabold tracking-tight text-white">
            Shop by Category
          </h2>
          <p className="mt-3 text-gray-300 max-w-xl mx-auto">
            Discover the perfect gift cards & digital products tailored for you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {categories.map(({ name, icon, href, gradient }) => (
            <motion.div
              key={name}
              initial="rest"
              whileHover="hover"
              animate="rest"
              variants={cardVariants}
              className={`rounded-3xl ${gradient} cursor-pointer shadow-lg flex flex-col justify-center items-center p-10 text-white select-none`}
            >
              <Link href={href} className="flex flex-col items-center gap-6">
                <div
                  className="bg-white bg-opacity-10 rounded-full p-5 shadow-inner shadow-blue-900"
                  aria-label={`${name} category icon`}
                >
                  {icon}
                </div>
                <h3 className="text-2xl font-semibold drop-shadow-lg">{name}</h3>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="mt-4 px-6 py-2 rounded-full bg-blue-600 bg-opacity-80 hover:bg-opacity-100 shadow-lg text-white font-semibold tracking-wide transition"
                >
                  Explore
                  <ArrowRight className="inline ml-2 h-5 w-5" />
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
