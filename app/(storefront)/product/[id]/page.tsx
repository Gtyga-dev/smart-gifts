import { ImageSlider } from "@/app/components/storefront/ImageSlider"
import { RelatedProducts } from "@/app/components/storefront/RelatedProducts"
import prisma from "@/app/lib/db"
import { ProductStatus } from "@prisma/client"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import { ProductActions } from "./product-actions"

async function getData(productId: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      price: true,
      images: true,
      description: true,
      name: true,
      id: true,
      category: true,
      status: true,
    },
  })

  if (!data) return notFound()
  return data
}

export default async function ProductIdRoute({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  noStore()
  const { id } = await paramsPromise
  const data = await getData(id)

  const productStatus: "published" | "archived" =
    data.status === ProductStatus.published ? "published" : "archived"

  return (
    <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Image Section */}
        <div className="relative rounded-xl overflow-hidden shadow-xl border border-border bg-background">
          <div className="absolute -inset-1 bg-gradient-to-br from-purple-400/10 via-pink-400/10 to-yellow-300/10 rounded-xl blur-2xl z-[-1]" />
          <ImageSlider images={data.images} />
        </div>

        {/* Product Info Section */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              {data.name}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-primary">
              ${data.price.toFixed(2)}
            </p>
          </div>

          <p className="text-base text-muted-foreground leading-relaxed">
            {data.description}
          </p>

          <div className="pt-6">
            <ProductActions productId={data.id} status={productStatus} />
          </div>
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-24">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Related Products
        </h2>
        <RelatedProducts category={data.category} currentProductId={data.id} />
      </div>
    </section>
  )
}
