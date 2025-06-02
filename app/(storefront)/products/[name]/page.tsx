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
      name: true,
      images: true,
      price: true,
      id: true,
      description: true,
      status: true,
    },
    where: {
      status: { in: [ProductStatus.published, ProductStatus.archived] },
    },
  }

  switch (productCategory) {
    case "all": {
      const data = await prisma.product.findMany(baseQuery)

      return {
        title: "All Products",
        data: data as Product[],
      }
    }
    case "fashion":
    case "retail":
    case "entertainment":
    case "crypto":
    case "wallets":
    case "utilities": {
      const data = await prisma.product.findMany({
        ...baseQuery,
        where: {
          ...baseQuery.where,
          category: productCategory as Category,
        },
      })

      return {
        title: `Products for ${productCategory.charAt(0).toUpperCase() + productCategory.slice(1)}`,
        data: data as Product[],
      }
    }
    default: {
      return notFound()
    }
  }
}

export default async function CategoriesPage(props: {
  params: Promise<{ name: string }>
}) {
  const params = await props.params
  noStore()
  const { data, title } = await getData(params.name)
  return (
    <section className="cyber-grid">
      <div className="flex items-center gap-2 mb-6">

        <h1 className="font-semibold text-3xl neon-text">{title}</h1>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.map((item: Product) => (
          <ProductCard item={item} key={item.id} />
        ))}
      </div>
    </section>
  )
}
