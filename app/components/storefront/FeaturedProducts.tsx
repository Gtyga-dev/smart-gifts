// This is a server component that fetches data
import prisma from "@/app/lib/db"
import { ProductCard } from "./ProductCard"
import { Suspense } from "react"
import { unstable_noStore as noStore } from "next/cache"
import { ProductStatus } from "@prisma/client"

async function getData() {
  noStore()
  try {
    const data = await prisma.product.findMany({
      where: {
        status: {
          in: [ProductStatus.published, ProductStatus.archived],
        },
        isFeatured: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        images: true,
        price: true,
        status: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    })

    return data
  } catch (error) {
    console.error("Error fetching featured products:", error)
    return []
  }
}

export function FeaturedProducts() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold tracking-tight mb-8 animate-fade-in-up">Featured Gift Cards</h2>
        <Suspense >
          <LoadFeaturedproducts />
        </Suspense>
      </div>
    </section>
  )
}

async function LoadFeaturedproducts() {
  const data = await getData()

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {data && data.length > 0 ? (
        data.map((item) => <ProductCard key={item.id} item={item} />)
      ) : (
        <p>No featured products available.</p>
      )}
    </div>
  )
}
