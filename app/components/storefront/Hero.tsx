/* eslint-disable @typescript-eslint/no-explicit-any */

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Gift, ShoppingBag, Sparkles } from "lucide-react"
import prisma from "@/app/lib/db"

async function getData() {
  const data = await prisma.banner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  })

  return data
}

export async function Hero() {
  const data = await getData()

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-primary/5 to-background pt-6 pb-12">
      {/* Decorative elements */}
      <div className="absolute inset-0 z-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(var(--primary-rgb),0.2),transparent_40%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(var(--primary-rgb),0.2),transparent_40%)]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Stats banner */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="bg-background/80 backdrop-blur-md rounded-full py-2 px-4 flex items-center gap-6 border border-border shadow-lg">
            <div className="flex items-center gap-2">
              <Gift size={16} className="text-primary" />
              <span className="text-sm font-medium">Premium Gift Cards</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <ShoppingBag size={16} className="text-primary" />
              <span className="text-sm font-medium">Secure Shopping</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              <span className="text-sm font-medium">Instant Delivery</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left column - Text content */}
          <div className="order-2 lg:order-1 space-y-6 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              The Perfect Gift{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
                Every Time
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl">
              Discover premium gift cards for all your favorite brands. Easy to purchase, instant to deliver, and
              perfect for any occasion.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 group"
                asChild
              >
                <Link href="/products/all">
                  Shop Gift Cards
                  <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/20 hover:bg-primary/5" asChild>
                <Link href="/about">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Right column - Carousel */}
          <div className="order-1 lg:order-2">
            <Carousel className="w-full">
              <CarouselContent>
                {data.map((item) => (
                  <CarouselItem key={item.id}>
                    <div className="relative h-[50vh] md:h-[60vh] lg:h-[50vh] overflow-hidden rounded-xl shadow-xl">
                      <Image
                        alt={item.title || "Banner Image"}
                        src={item.imageString || "/placeholder.svg"}
                        fill
                        className="object-cover w-full h-full rounded-xl"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 w-full">
                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{item.title}</h2>
                        {/* Optional subtitle - safely check if it exists */}
                        {"subtitle" in item && <p className="text-white/90 text-lg">{(item as any).subtitle}</p>}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
              <CarouselNext className="right-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
            </Carousel>

            {/* Carousel indicators */}
            <div className="flex justify-center mt-4 gap-2">
              {data.map((_, index) => (
                <button
                  key={index}
                  className="w-2 h-2 rounded-full transition-all bg-primary/30 hover:bg-primary/50"
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
