
import { ImageSlider } from "@/app/components/storefront/ImageSlider"
import { RelatedProducts } from "@/app/components/storefront/RelatedProducts"
import prisma from "@/app/lib/db"
import { ProductStatus } from "@prisma/client"
import { StarIcon} from "lucide-react"
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

  if (!data) {
    return notFound()
  }

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

  // Convert ProductStatus to "published" | "archived"
  const productStatus: "published" | "archived" = data.status === ProductStatus.published ? "published" : "archived"

  return (
    <div className="cyber-grid">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start lg:gap-x-24 py-4">
        <div className="animate-float">
          <div className="relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-accent/30 rounded-xl blur-lg opacity-75"></div>
            <ImageSlider images={data.images} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
           
            <h1 className="text-3xl font-extrabold tracking-tight neon-text">{data.name}</h1>
          </div>
          <p className="text-3xl text-primary gradient-text">${data.price.toFixed(2)}</p>

          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">(5.0)</span>
          </div>

          <p className="text-base text-muted-foreground">{data.description}</p>

          <ProductActions productId={data.id} status={productStatus} />
        </div>
      </div>

      <div className="mt-16">
        <RelatedProducts category={data.category} currentProductId={data.id} />
      </div>
    </div>
  )
}
