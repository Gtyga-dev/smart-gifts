"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Quote } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState, useEffect } from "react"

const testimonials = [
    {
        id: "1",
        name: "Sarah Johnson",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Regular Customer",
        content:
            "I love how easy it is to purchase gift cards on Smart Cards. The instant delivery is perfect for last-minute gifts!",
        rating: 5,
    },
    {
        id: "2",
        name: "Michael Chen",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Business Owner",
        content:
            "We use Smart Cards for all our employee rewards. The selection is great and the bulk ordering process is seamless.",
        rating: 5,
    },
    {
        id: "3",
        name: "Jessica Williams",
        avatar: "/placeholder.svg?height=40&width=40",
        role: "Verified Buyer",
        content: "The customer service is outstanding. When I had an issue with my order, they resolved it immediately.",
        rating: 4,
    },
]

export function Testimonials() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        if (!inView) return

        const interval = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [inView])

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl font-bold tracking-tight mb-4 neon-text">
                        What Our <span className="gradient-text">Customers</span> Say
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Don&apos;t just take our word for it. Here&apos;s what our customers have to say about their experience with Smart Cards.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            variants={itemVariants}
                            animate={{
                                scale: activeIndex === index ? 1.05 : 1,
                                boxShadow: activeIndex === index ? "0 10px 25px rgba(0, 0, 0, 0.2)" : "0 4px 6px rgba(0, 0, 0, 0.1)",
                            }}
                            transition={{ duration: 0.5 }}
                        >
                            <Card
                                className={`h-full bg-card relative group ${activeIndex === index ? "border-primary/50" : "border-border"}`}
                            >
                                <div
                                    className={`absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 ${activeIndex === index ? "opacity-100" : ""} group-hover:opacity-100 transition-opacity duration-300 -z-10`}
                                ></div>
                                <CardContent className="pt-6 relative">
                                    <Quote className="absolute top-2 right-2 h-6 w-6 text-primary/20" />
                                    <div className="flex items-center mb-4">
                                        <Avatar className="h-10 w-10 mr-4 ring-2 ring-primary/20">
                                            <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                {testimonial.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-semibold group-hover:text-primary transition-colors">{testimonial.name}</h3>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex mb-3">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${i < testimonial.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground"}`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground italic">&quot;{testimonial.content}&quot;</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>

                <div className="flex justify-center mt-8 gap-2">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`h-1 rounded-full transition-all ${activeIndex === index ? "bg-primary w-8 animate-pulse" : "bg-primary/30 w-4 hover:bg-primary/50"
                                }`}
                            aria-label={`View testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}
