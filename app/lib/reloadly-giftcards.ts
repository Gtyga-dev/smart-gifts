/* eslint-disable @typescript-eslint/no-explicit-any */
import { getReloadlyToken } from "./reloadly"
import { ReloadlyApiError } from "./api-error"

const API_VERSION_HEADER = "application/com.reloadly.giftcards-v1+json"
const BASE_URL = process.env.RELOADLY_ENVIRONMENT === 'production'
  ? 'https://giftcards.reloadly.com'
  : 'https://giftcards-sandbox.reloadly.com'

export async function getProductById(id: string) {
  const token = await getReloadlyToken(BASE_URL)
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER }
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    if (res.status === 404) return null
    throw new ReloadlyApiError(
      `Failed to fetch product ${id}`, 
      res.status, 
      errData, 
      "PRODUCT_FETCH_ERROR"
    )
  }
  return await res.json()
}

export async function getProductsByCountry(countryCode: string) {
  const token = await getReloadlyToken(BASE_URL)
  const res = await fetch(`${BASE_URL}/countries/${countryCode}/products`, {
    headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER }
  })
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}))
    throw new ReloadlyApiError(
      `Failed to fetch products for country ${countryCode}`, 
      res.status, 
      errData, 
      "PRODUCTS_FETCH_ERROR"
    )
  }
  return await res.json()
}

export async function orderGiftCard(payload: any) {
  // First, fetch the product details to validate the price
  const productDetails = await getProductById(payload.productId.toString())
  if (!productDetails) {
    throw new ReloadlyApiError(
      "Product not found",
      404,
      { productId: payload.productId },
      "PRODUCT_NOT_FOUND"
    )
  }

  // Validate the price against the product's price range or fixed denominations
  const requestedPrice = payload.unitPrice
  let validPrice = requestedPrice

  if (productDetails.fixedRecipientDenominations?.length > 0) {
    // For fixed denomination cards, use the closest valid denomination
    const validDenominations = productDetails.fixedRecipientDenominations
    validPrice = validDenominations.find((d: number) => d === requestedPrice) || validDenominations[0]
  } else {
    // For range-based cards, validate against min/max
    const minPrice = productDetails.recipientCurrencyMinAmount
    const maxPrice = productDetails.recipientCurrencyMaxAmount
    if (requestedPrice < minPrice || requestedPrice > maxPrice) {
      throw new ReloadlyApiError(
        `Invalid price. Must be between ${minPrice} and ${maxPrice}`,
        400,
        { requestedPrice, minPrice, maxPrice, productId: payload.productId },
        "INVALID_PRICE_RANGE"
      )
    }
  }

  // Ensure we're using the correct country code from the product details
  const countryCode = productDetails.country?.isoName
  if (!countryCode) {
    throw new ReloadlyApiError(
      "Country code not found in product details",
      400,
      { productId: payload.productId },
      "MISSING_COUNTRY_CODE"
    )
  }

  const orderPayload = {
    ...payload,
    countryCode,
    unitPrice: validPrice
  }

  const token = await getReloadlyToken(BASE_URL)
  
  try {
    console.log("Sending order to Reloadly:", orderPayload)
    
    const res = await fetch(`${BASE_URL}/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: API_VERSION_HEADER,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderPayload)
    })
    
    const responseBody = await res.json()
    
    if (!res.ok) {
      console.error(`Reloadly API error (${res.status}):`, responseBody)
      throw new ReloadlyApiError(
        responseBody.message || "Failed to order gift card",
        res.status,
        responseBody,
        responseBody.errorCode || "ORDER_ERROR"
      )
    }
    
    // In sandbox mode, we need to wait longer for the order to process
    const isSandbox = BASE_URL.includes('sandbox')
    await new Promise(resolve => setTimeout(resolve, isSandbox ? 5000 : 2000))
    
    return responseBody
  } catch (error) {
    if (error instanceof ReloadlyApiError) {
      throw error
    }
    console.error("Unexpected error ordering gift card:", error)
    throw new ReloadlyApiError(
      "Unexpected error ordering gift card", 
      500, 
      { originalError: String(error) }, 
      "ORDER_ERROR"
    )
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function getGiftCardOrder(transactionId: string, maxRetries = 15): Promise<any> {
  const token = await getReloadlyToken(BASE_URL)
  let lastError: any = null
  let attempt = 0
  const isSandbox = BASE_URL.includes('sandbox')
  const maxWaitTime = isSandbox ? 120000 : 60000 // 120 seconds for sandbox, 60 for production
  const startTime = Date.now()

  while (attempt < maxRetries && (Date.now() - startTime) < maxWaitTime) {
    try {
      console.log(`Attempt ${attempt + 1} of ${maxRetries} to fetch gift card details for transaction ${transactionId}`)
      
      const cardsRes = await fetch(`${BASE_URL}/orders/transactions/${transactionId}/cards`, {
        headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER }
      })

      if (!cardsRes.ok) {
        const errData = await cardsRes.json().catch(() => ({}))
        if (cardsRes.status === 404) {
          console.log(`Order still processing (sandbox mode: ${isSandbox}), waiting before retry...`)
          lastError = new ReloadlyApiError(
            "Order is still processing",
            404,
            errData,
            "ORDER_PROCESSING"
          )
          // Longer waits for sandbox mode
          const baseWait = isSandbox ? 8000 : 2000
          const waitTime = Math.min(baseWait * Math.pow(1.5, attempt), isSandbox ? 15000 : 8000)
          await sleep(waitTime)
          attempt++
          continue
        }
        
        throw new ReloadlyApiError(
          cardsRes.status === 401 ? "Unauthorized" : "Failed to fetch gift card details",
          cardsRes.status,
          errData,
          "CARD_FETCH_ERROR"
        )
      }

      const cardsData = await cardsRes.json()
      
      if (!cardsData.cardNumber) {
        console.log("Card number not yet available, waiting before retry...")
        lastError = new ReloadlyApiError(
          "Card number not yet available",
          404,
          cardsData,
          "CARD_NUMBER_MISSING"
        )
        const baseWait = isSandbox ? 8000 : 2000
        const waitTime = Math.min(baseWait * Math.pow(1.5, attempt), isSandbox ? 15000 : 8000)
        await sleep(waitTime)
        attempt++
        continue
      }

      console.log("Successfully retrieved gift card details")
      return {
        redemptionCode: cardsData.cardNumber.toString(),
        pinCode: cardsData.pinCode?.toString() || null,
        serialNumber: cardsData.serialNumber?.toString() || null,
        redemptionInstructions: await getRedeemInstructions(cardsData.productId) || "",
      }
    } catch (error) {
      console.error(`Error on attempt ${attempt + 1}:`, error)
      lastError = error
      
      const baseWait = isSandbox ? 8000 : 2000
      const waitTime = Math.min(baseWait * Math.pow(1.5, attempt), isSandbox ? 15000 : 8000)
      await sleep(waitTime)
      attempt++
    }
  }

  throw lastError || new ReloadlyApiError(
    `Failed to retrieve gift card details after ${attempt} attempts (${Math.round((Date.now() - startTime) / 1000)}s)`,
    504,
    { 
      transactionId, 
      attempts: attempt, 
      totalTime: Date.now() - startTime,
      isSandbox,
      maxWaitTime 
    },
    "CARD_FETCH_TIMEOUT"
  )
}

export async function getRedeemInstructions(productId: string) {
  const token = await getReloadlyToken(BASE_URL)
  const res = await fetch(`${BASE_URL}/redeem-instructions/${productId}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADER }
  })
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return data?.content || null
}

export function mapReloadlyToCategory(category: string): string {
  const name = (category || "").toLowerCase()
  if (name.includes("gaming"))        return "entertainment"
  if (name.includes("shopping"))      return "retail"
  if (name.includes("fashion"))       return "fashion"
  if (name.includes("utility"))       return "utilities"
  if (name.includes("crypto"))        return "crypto"
  if (name.includes("entertainment")) return "entertainment"
  if (name.includes("wallet"))        return "wallets"
  return "retail"
}

export { ReloadlyApiError }