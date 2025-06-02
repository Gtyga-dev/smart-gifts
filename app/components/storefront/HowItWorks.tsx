"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, CreditCard, Gift, Check } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

export function HowItWorks() {
    const [ref, inView] = useInView({
        triggerOnce: true,
        threshold: 0.1,
    })

    const steps = [
        {
            icon: <ShoppingCart className="h-10 w-10 text-primary" />,
            title: "Choose Your Gift Card",
            description: "Browse our selection of premium gift cards from top brands.",
        },
        {
            icon: <CreditCard className="h-10 w-10 text-primary" />,
            title: "Secure Checkout",
            description: "Pay securely using your preferred payment method.",
        },
        {
            icon: <Gift className="h-10 w-10 text-primary" />,
            title: "Instant Delivery",
            description: "Receive your digital gift card instantly via email.",
        },
        {
            icon: <Check className="h-10 w-10 text-primary" />,
            title: "Ready to Use",
            description: "Use your gift card online or in-store at your convenience.",
        },
    ]

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
                        How It <span className="gradient-text">Works</span>
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Getting your favorite gift cards has never been easier. Follow these simple steps to get started.
                    </p>
                </motion.div>

                <motion.div
                    ref={ref}
                    variants={containerVariants}
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {steps.map((step, index) => (
                        <motion.div key={index} variants={itemVariants}>
                            <Card className="border-border hover:border-primary/30 hover:shadow-lg transition-all duration-300 h-full bg-card relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <div className="mb-4 p-3 rounded-full bg-primary/10 animate-glow">{step.icon}</div>
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                        <span className="font-bold text-primary">{index + 1}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                        {step.title}
                                    </h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    )
}
