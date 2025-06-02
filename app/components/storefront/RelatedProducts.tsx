// app/components/storefront/RelatedProducts.tsx

import prisma from "@/app/lib/db"
import { LoadingProductCard, ProductCard } from "./ProductCard"
import { Suspense } from "react"
import { unstable_noStore as noStore } from "next/cache"
import type { Category } from "@prisma/client"

/**
 * Fetch up to 3 other products in the same category, excluding the current one.
 */
async function getRelatedProducts(
  category: Category,
  currentProductId: string
) {
  return prisma.product.findMany({
    where: {
      status: "published",
      category,                 // now correctly typed as Prisma’s Category
      id: { not: currentProductId },
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
}

/**
 * Main wrapper component: displays a heading and kicks off the Suspense boundary.
 */
export function RelatedProducts({
  category,
  currentProductId,
}: {
  category: Category
  currentProductId: string
}) {
  return (
    <>
      <h2 className="text-2xl font-extrabold tracking-tight">
        Related Products
      </h2>
      <Suspense fallback={<LoadingRows />}>
        <LoadRelatedProducts
          category={category}
          currentProductId={currentProductId}
        />
      </Suspense>
    </>
  )
}

/**
 * Inner async component that actually fetches & renders the product cards.
 */
async function LoadRelatedProducts({
  category,
  currentProductId,
}: {
  category: Category
  currentProductId: string
}) {
  noStore() // disable caching for this fetch
  const products = await getRelatedProducts(category, currentProductId)

  return (
    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  )
}

/**
 * Fallback skeleton UI while related products are loading.
 */
function LoadingRows() {
  return (
    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <LoadingProductCard />
      <LoadingProductCard />
      <LoadingProductCard />
    </div>
  )
}
