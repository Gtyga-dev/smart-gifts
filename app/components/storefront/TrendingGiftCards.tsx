"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, TrendingUp, Zap } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const trendingCards = [
    {
        id: "1",
        name: "Amazon Gift Card",
        image: "/placeholder.svg?height=200&width=300",
        price: 50,
        trend: "+12%",
    },
    {
        id: "2",
        name: "Netflix Gift Card",
        image: "/placeholder.svg?height=200&width=300",
        price: 25,
        trend: "+8%",
    },
    {
        id: "3",
        name: "Spotify Premium",
        image: "/placeholder.svg?height=200&width=300",
        price: 15,
        trend: "+5%",
    },
    {
        id: "4",
        name: "Steam Wallet",
        image: "/placeholder.svg?height=200&width=300",
        price: 20,
        trend: "+15%",
    },
]

export function TrendingGiftCards() {
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
                        <Button variant="outline" className="group border-primary/20 hover:bg-primary/10 text-primary">
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
                    {trendingCards.map((card) => (
                        <motion.div key={card.id} variants={itemVariants}>
                            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group bg-card border-border relative">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                <CardContent className="p-0">
                                    <div className="relative">
                                        <Image
                                            src={card.image || "/placeholder.svg"}
                                            alt={card.name}
                                            width={300}
                                            height={200}
                                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 right-3">
                                            <Badge className="bg-green-500 text-white flex items-center gap-1">
                                                <Zap className="h-3 w-3" /> {card.trend}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gradient-to-b from-card to-card/80">
                                        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                                            {card.name}
                                        </h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-primary font-bold">${card.price}</span>
                                            <Button size="sm" variant="ghost" className="text-primary hover:bg-primary/10" asChild>
                                                <Link href={`/product/${card.id}`}>View</Link>
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
