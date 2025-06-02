import { NextResponse } from "next/server"
import { getReloadlyToken, reloadlyEnv } from "@/app/lib/reloadly"
import prisma from "@/app/lib/db"
import { Category, ProductStatus } from "@prisma/client"
import { handleApiError } from "@/app/lib/api-error"


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

// Helper function to map Reloadly category to Prisma Category enum
function mapToPrismaCategory(category: string): Category {
  const categoryMap: Record<string, Category> = {
    shopping: Category.retail,
    retail: Category.retail,
    fashion: Category.fashion,
    entertainment: Category.entertainment,
    gaming: Category.entertainment,
    utility: Category.utilities,
    utilities: Category.utilities,
    crypto: Category.crypto,
    wallet: Category.wallets,
    wallets: Category.wallets,
  }

  return categoryMap[category.toLowerCase()] || Category.retail
}

// Update the GET function to handle the "ALL" country code case properly
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const countryCode = searchParams.get("countryCode") || "MW" // Default to MW

    // Check if the country code is "ALL" - this is not a valid ISO country code
    if (countryCode === "ALL") {
      console.log("'ALL' is not a valid country code for Reloadly API. Using 'MW' instead.")

      // In development mode, use mock data


      // For production, use a valid country code like MW
      const validCountryCode = "MW"

      // Continue with the rest of the function using validCountryCode
      const baseUrl = reloadlyEnv.baseUrls.giftcards
      const token = await getReloadlyToken(baseUrl)
      const apiVersionHeader = reloadlyEnv.apiVersionHeaders?.giftcards || "application/com.reloadly.giftcards-v1+json"

      // Fetch gift card products for the specified country
      const response = await fetch(`${baseUrl}/countries/${validCountryCode}/products`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: apiVersionHeader,
        },
      })

      // Rest of the function remains the same...
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Failed to fetch products: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`,
        )
      }

      const products = (await response.json()) as ReloadlyProduct[]
      let count = 0

      for (const product of products) {
        // Map Reloadly category to Prisma Category enum
        const categoryName = product.category?.name?.toLowerCase() || "retail"
        const category = mapToPrismaCategory(categoryName)

        // Create or update product in database
        await prisma.product.upsert({
          where: {
            id: `reloadly-${product.productId}-${validCountryCode}`,
          },
          update: {
            name: product.productName,
            description: product.redeemInstruction?.concise || "Gift card product",
            price: product.fixedRecipientDenominations?.[0] || 0,
            images: product.logoUrls || [],
            category: category,
            status: ProductStatus.published,
            reloadlyProductId: product.productId,
            reloadlyBrandId: product.brand.brandId,
            recipientCurrencyCode: product.recipientCurrencyCode,
            denominationType: product.denominationType,
            redemptionInstructions: product.redeemInstruction?.verbose || "",
          },
          create: {
            id: `reloadly-${product.productId}-${validCountryCode}`,
            name: product.productName,
            description: product.redeemInstruction?.concise || "Gift card product",
            price: product.fixedRecipientDenominations?.[0] || 0,
            images: product.logoUrls || [],
            category: category,
            status: ProductStatus.published,
            reloadlyProductId: product.productId,
            reloadlyBrandId: product.brand.brandId,
            recipientCurrencyCode: product.recipientCurrencyCode,
            denominationType: product.denominationType,
            redemptionInstructions: product.redeemInstruction?.verbose || "",
          },
        })

        count++
      }

      return NextResponse.json({
        success: true,
        count,
        message: `Successfully synced ${count} products from Reloadly`,
      })
    }

  

    const baseUrl = reloadlyEnv.baseUrls.giftcards
    const token = await getReloadlyToken(baseUrl)
    // Use the API version header from reloadlyEnv
    const apiVersionHeader = reloadlyEnv.apiVersionHeaders?.giftcards || "application/com.reloadly.giftcards-v1+json"

    // Fetch gift card products for the specified country
    const response = await fetch(`${baseUrl}/countries/${countryCode}/products`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: apiVersionHeader,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `Failed to fetch products: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`,
      )
    }

    const products = (await response.json()) as ReloadlyProduct[]

    // Process and save products to database
    let count = 0

    for (const product of products) {
      // Map Reloadly category to Prisma Category enum
      const categoryName = product.category?.name?.toLowerCase() || "retail"
      const category = mapToPrismaCategory(categoryName)

      // Create or update product in database
      await prisma.product.upsert({
        where: {
          // Use a unique identifier that combines Reloadly product ID and country
          id: `reloadly-${product.productId}-${countryCode}`,
        },
        update: {
          name: product.productName,
          description: product.redeemInstruction?.concise || "Gift card product",
          price: product.fixedRecipientDenominations?.[0] || 0,
          images: product.logoUrls || [],
          category: category,
          status: ProductStatus.published,
          reloadlyProductId: product.productId,
          reloadlyBrandId: product.brand.brandId,
          recipientCurrencyCode: product.recipientCurrencyCode,
          denominationType: product.denominationType,
          redemptionInstructions: product.redeemInstruction?.verbose || "",
        },
        create: {
          id: `reloadly-${product.productId}-${countryCode}`,
          name: product.productName,
          description: product.redeemInstruction?.concise || "Gift card product",
          price: product.fixedRecipientDenominations?.[0] || 0,
          images: product.logoUrls || [],
          category: category,
          status: ProductStatus.published,
          reloadlyProductId: product.productId,
          reloadlyBrandId: product.brand.brandId,
          recipientCurrencyCode: product.recipientCurrencyCode,
          denominationType: product.denominationType,
          redemptionInstructions: product.redeemInstruction?.verbose || "",
        },
      })

      count++
    }

    return NextResponse.json({
      success: true,
      count,
      message: `Successfully synced ${count} products from Reloadly`,
    })
  } catch (error) {
    return handleApiError(error, "Failed to sync products")
  }
}