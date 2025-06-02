import prisma from "@/app/lib/db"
import { ClientTrendingGiftCards } from "./ClientTrendingGiftCards"
import { unstable_noStore as noStore } from "next/cache"

async function getTrendingProductsData() {
    noStore()
    // Fetch trending products with random ordering
    const data = await prisma.product.findMany({
        where: {
            status: {
                in: ["published", "archived"],
            },
        },
        select: {
            id: true,
            name: true,
            description: true,
            images: true,
            price: true,
            status: true,
            category: true,
        },
        orderBy: {
            // Use a random ordering approach
            id: "asc", // This will be randomized in the next step
        },
        take: 8, // Get more products than we need
    })

    // Shuffle the array to get random products
    const shuffledData = [...data].sort(() => Math.random() - 0.5)

    // Take only the first 4 products
    return shuffledData.slice(0, 4)
}

export async function TrendingGiftCardsWrapper() {
    const products = await getTrendingProductsData()

    return <ClientTrendingGiftCards products={products} />
}
