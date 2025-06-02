import { NextResponse } from "next/server"
import { getReloadlyToken } from "@/app/lib/reloadly"

// Define types for products
interface ReloadlyProduct {
  productId: number
  productName: string
  redeemInstruction?: {
    concise?: string
    verbose?: string
  }
  fixedRecipientDenominations?: number[]
  logoUrls?: string[]
  brand: {
    brandId: number
    brandName: string
  }
  recipientCurrencyCode: string
  senderCurrencyCode: string
  discountPercentage: number
  denominationType: string
  country: {
    isoName: string
    name: string
  }
  category?: {
    name: string
  }
}

interface TransformedProduct {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  status: string
  isFeatured: boolean
  reloadlyData: {
    productId: number
    brandId: number
    recipientCurrencyCode: string
    senderCurrencyCode: string
    discountPercentage: number
    denominationType: string
    fixedRecipientDenominations?: number[]
    country: {
      isoName: string
      name: string
    }
  }
}

// Updated for Next.js 15 with Promise<params>
export async function GET(request: Request, context: { params: Promise<{ countryCode: string }> }) {
  try {
    const { countryCode } = await context.params

    if (!countryCode) {
      return NextResponse.json({ error: "Country code is required" }, { status: 400 })
    }

    const token = await getReloadlyToken()

    // Fetch gift card products for the specified country
    const response = await fetch(`https://giftcards-sandbox.reloadly.com/countries/${countryCode}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Reloadly products error:", errorData)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: response.status })
    }

    const products = (await response.json()) as ReloadlyProduct[]

    // Transform the response to match your product schema
    const transformedProducts: TransformedProduct[] = products.map((product) => ({
      id: product.productId.toString(),
      name: product.productName,
      description: product.redeemInstruction?.concise || "Gift card product",
      price: product.fixedRecipientDenominations?.[0] || 0,
      images: product.logoUrls || [],
      category: mapReloadlyToCategory(product),
      status: "published",
      isFeatured: false,
      reloadlyData: {
        productId: product.productId,
        brandId: product.brand.brandId,
        recipientCurrencyCode: product.recipientCurrencyCode,
        senderCurrencyCode: product.senderCurrencyCode,
        discountPercentage: product.discountPercentage,
        denominationType: product.denominationType,
        fixedRecipientDenominations: product.fixedRecipientDenominations,
        country: product.country,
      },
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error("Error fetching Reloadly products:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to map Reloadly categories to your app categories
function mapReloadlyToCategory(product: ReloadlyProduct) {
  // Map based on product.category.name or other properties
  // This is just an example mapping
  const categoryName = product.category?.name?.toLowerCase() || ""

  if (categoryName.includes("gaming")) return "entertainment"
  if (categoryName.includes("shopping")) return "retail"
  if (categoryName.includes("fashion")) return "fashion"
  if (categoryName.includes("utility")) return "utilities"
  if (categoryName.includes("crypto")) return "crypto"

  // Default category
  return "retail"
}
