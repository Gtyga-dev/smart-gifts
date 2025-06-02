import type { ProductStatus } from "@prisma/client"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  status: ProductStatus
  category?: string
  isFeatured?: boolean
}
