import { ProductCard } from "@/app/components/storefront/ProductCard"
import prisma from "@/app/lib/db"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import { ProductStatus, type Category } from "@prisma/client"

type Product = {
  id: string
  name: string
  images: string[]
  price: number
  description: string
  status: ProductStatus
}

async function getData(productCategory: string) {
  const baseQuery = {
    select: {
      id: true,
      name: true,
      images: true,
      price: true,
      description: true,
      status: true,
    },
    where: {
      status: {
        in: [ProductStatus.published, ProductStatus.archived],
      },
    },
  }

  if (productCategory === "all") {
    const data = await prisma.product.findMany(baseQuery)

    return {
      title: "All Products",
      data: data as Product[],
    }
  }

  const validCategories: Category[] = [
    "fashion",
    "retail",
    "entertainment",
    "crypto",
    "wallets",
    "utilities",
  ]

  if (validCategories.includes(productCategory as Category)) {
    const data = await prisma.product.findMany({
      ...baseQuery,
      where: {
        ...baseQuery.where,
        category: productCategory as Category,
      },
    })

    const title =
      "Products for " +
      productCategory.charAt(0).toUpperCase() + productCategory.slice(1)

    return {
      title,
      data: data as Product[],
    }
  }

  return notFound()
}

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const { name } = await params
  noStore()

  const { data, title } = await getData(name)

  return (
    <section className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-primary neon-text">
          {title}
        </h1>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <ProductCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  )
}
