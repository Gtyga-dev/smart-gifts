/* eslint-disable @typescript-eslint/no-explicit-any */

"use client"

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { useState, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Gift, ShoppingBag, Sparkles } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"
import { useRef } from "react"
import { useInView } from "react-intersection-observer"

interface Banner {
    id: string
    title: string
    imageString: string
    createdAt?: Date
}

interface ClientHeroProps {
    banners: Banner[]
}

export function ClientHero({ banners }: ClientHeroProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const autoplayRef = useRef(Autoplay({ delay: 5000, stopOnInteraction: false }))
    const [carouselApi, setCarouselApi] = useState<any>(null)
    const [scrollY, setScrollY] = useState(0)
    const [ref, inView] = useInView({
        triggerOnce: false,
        threshold: 0.1,
    })

    // Handle scroll for parallax effect
    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Set up the carousel API and track slide changes
    const onApiChange = useCallback((api: any) => {
        setCarouselApi(api)

        if (api) {
            api.on("select", () => {
                setActiveIndex(api.selectedScrollSnap())
            })
        }
    }, [])

    // Function to handle indicator clicks
    const scrollTo = useCallback(
        (index: number) => {
            if (carouselApi) {
                carouselApi.scrollTo(index)
            }
        },
        [carouselApi],
    )

    const fadeInUp = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    }

    const staggerChildren = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    }

    return (
        <section
            ref={ref}
            className="relative w-full overflow-hidden bg-gradient-to-b from-background via-secondary/30 to-background pt-6 pb-12 cyber-grid"
            style={{
                backgroundPosition: `center ${scrollY * 0.5}px`,
            }}
        >
            {/* Decorative elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.15),transparent_40%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary-rgb),0.15),transparent_40%)]"></div>

                {/* Animated grid lines */}
                <div className="absolute inset-0 opacity-20">
                    <motion.div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(90deg, rgba(var(--primary-rgb), 0.1) 1px, transparent 1px), 
                               linear-gradient(rgba(var(--primary-rgb), 0.1) 1px, transparent 1px)`,
                            backgroundSize: "40px 40px",
                        }}
                        animate={{
                            backgroundPosition: ["0px 0px", "40px 40px"],
                        }}
                        transition={{
                            duration: 20,
                            ease: "linear",
                            repeat: Number.POSITIVE_INFINITY,
                        }}
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Stats banner */}
                <motion.div
                    initial="hidden"
                    animate={inView ? "visible" : "hidden"}
                    variants={fadeInUp}
                    className="flex justify-center mb-8"
                >
                    <div className="glass-effect rounded-full py-2 px-4 flex items-center gap-6 border border-primary/20 shadow-lg animate-glow">
                        <div className="flex items-center gap-2">
                            <Gift size={16} className="text-primary" />
                            <span className="text-sm font-medium text-white">Premium Gift Cards</span>
                        </div>
                        <div className="hidden md:flex items-center gap-2">
                            <ShoppingBag size={16} className="text-primary" />
                            <span className="text-sm font-medium text-white">Secure Shopping</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-primary" />
                            <span className="text-sm font-medium text-white">Instant Delivery</span>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Left column - Text content */}
                    <motion.div
                        initial="hidden"
                        animate={inView ? "visible" : "hidden"}
                        variants={staggerChildren}
                        className="order-2 lg:order-1"
                    >

                        <motion.h1
                            variants={fadeInUp}
                            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight neon-text"
                        >
                            The Perfect Gift <span className="gradient-text">Every Time</span>
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg text-white mb-8 max-w-xl">
                            Discover premium gift cards for all your favorite brands. Easy to purchase, instant to deliver, and
                            perfect for any occasion.
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                            <Button
                                size="lg"
                                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 group animate-pulse-border border border-primary/50"
                                asChild
                            >
                                <Link href="/products/all">
                                    Shop Gift Cards
                                    <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-primary/20 hover:bg-primary/10 text-white group"
                                asChild
                            >
                                <Link href="/about">
                                    Learn More
                                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                </Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Right column - Carousel */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="order-1 lg:order-2"
                    >
                        <div className="relative animate-float">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-accent/50 rounded-xl blur-lg opacity-75"></div>
                            <Carousel className="w-full relative" plugins={[autoplayRef.current as any]} setApi={onApiChange}>
                                <CarouselContent>
                                    {banners.map((item, index) => (
                                        <CarouselItem key={item.id}>
                                            <AnimatePresence mode="wait">
                                                {activeIndex === index && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 1.1 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        transition={{ duration: 0.5 }}
                                                        className="relative h-[50vh] md:h-[60vh] lg:h-[50vh] overflow-hidden rounded-xl shadow-xl"
                                                    >
                                                        <Image
                                                            alt={item.title || "Banner Image"}
                                                            src={item.imageString || "/placeholder.svg"}
                                                            fill
                                                            className="object-cover w-full h-full rounded-xl"
                                                            priority={index === 0}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 20 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ duration: 0.5, delay: 0.2 }}
                                                            className="absolute bottom-0 left-0 p-6 w-full"
                                                        >
                                                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 neon-text">{item.title}</h2>
                                                            {/* Optional subtitle - safely check if it exists */}
                                                            {item.hasOwnProperty("subtitle") && (
                                                                <p className="text-white/90 text-lg">{(item as any).subtitle}</p>
                                                            )}
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                <CarouselPrevious className="left-4 bg-background/40 backdrop-blur-md border-primary/20 hover:bg-background/60 text-primary" />
                                <CarouselNext className="right-4 bg-background/40 backdrop-blur-md border-primary/20 hover:bg-background/60 text-primary" />
                            </Carousel>
                        </div>

                        {/* Carousel indicators */}
                        <div className="flex justify-center mt-6 gap-2">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={`h-1 rounded-full transition-all ${activeIndex === index ? "bg-primary w-8 animate-pulse" : "bg-primary/30 w-4 hover:bg-primary/50"
                                        }`}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
