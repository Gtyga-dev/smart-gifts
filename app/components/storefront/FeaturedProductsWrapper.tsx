import prisma from "@/app/lib/db"
import { ClientFeaturedProducts } from "@/app/components/storefront/ClientFeaturedProducts"
import { unstable_noStore as noStore } from "next/cache"
import { ProductStatus } from "@prisma/client"

async function getFeaturedProductsData() {
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

export async function FeaturedProductsWrapper() {
    const products = await getFeaturedProductsData()

    return <ClientFeaturedProducts products={products} />
}
