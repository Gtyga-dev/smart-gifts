"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
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
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    }

    // Generate random trend percentages for visual effect
    const getTrendPercentage = () => {
        return `+${Math.floor(Math.random() * 15) + 5}%`
    }

    return (
        <section className="py-16 bg-gradient-to-b from-background via-secondary/5 to-background cyber-grid">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
                    <div>
                        <Badge
                            variant="outline"
                            className="mb-2 bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
                        >
                            <TrendingUp className="mr-1 h-3 w-3" /> Trending Now
                        </Badge>
                        <h2 className="text-3xl font-bold tracking-tight neon-text">
                            Most Popular <span className="gradient-text">Gift Cards</span>
                        </h2>
                    </div>
                    <Link href="/products/all" className="mt-4 md:mt-0">
                        <Button variant="outline" className="group border-primary/20 hover:bg-primary/10 text-white">
                            View All
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                </div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {products.map((product) => (
                        <motion.div key={product.id} variants={itemVariants}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-card border-border relative h-[300px]">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                <CardContent className="p-0 h-full">
                                    <div className="relative h-[180px]">
                                        <Image
                                            src={product.images[0] || "/placeholder.svg"}
                                            alt={product.name}
                                            fill
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-green-500 text-white flex items-center gap-1">
                                                <Zap className="h-3 w-3" /> {getTrendPercentage()}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-b from-card to-card/80 h-[130px] flex flex-col">
                                        <h3 className="font-semibold text-base mb-1 group-hover:text-primary transition-colors line-clamp-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                                        <div className="flex justify-between items-center mt-auto">
                                            <span className="text-primary font-bold">${product.price.toFixed(2)}</span>
                                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10 h-8 px-3" asChild>
                                                <Link href={`/product/${product.id}`}>View</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
