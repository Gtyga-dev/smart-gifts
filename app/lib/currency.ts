/**
 * Currency utility functions for handling conversions between USD and MWK
 */


const DEFAULT_MWK_TO_USD_RATE = 4000

/**
 * Convert USD to MWK
 * @param amountUSD Amount in USD
 * @returns Amount in MWK
 */
export function convertUSDtoMWK(amountUSD: number): number {
    return Math.round(amountUSD * DEFAULT_MWK_TO_USD_RATE * 100) / 100
}

/**
 * Convert MWK to USD
 * @param amountMWK Amount in MWK
 * @returns Amount in USD
 */
export function convertMWKtoUSD(amountMWK: number): number {
    return Math.round((amountMWK / DEFAULT_MWK_TO_USD_RATE) * 100) / 100
}

/**
 * Format a currency amount with the appropriate symbol and decimal places
 * @param amount Amount to format
 * @param currency Currency code (USD or MWK)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency = "MWK"): string {
    if (currency === "USD") {
        return `$${amount.toFixed(2)}`
    } else {
        // MWK formatting
        return `MK${amount.toFixed(2)}`
    }
}

/**
 * Get the current exchange rate (fixed value)
 * @returns The current exchange rate
 */
export function getCurrentExchangeRate(): number {
    return DEFAULT_MWK_TO_USD_RATE
}

/**
 * Get the currency symbol for a given currency code
 * @param currency Currency code
 * @returns Currency symbol
 */
export function getCurrencySymbol(currency = "MWK"): string {
    switch (currency) {
        case "USD":
            return "$"
        case "MWK":
            return "MK"
        default:
            return currency
    }
}

/**
 * Determine the appropriate currency for a product type
 * @param productType Type of product
 * @returns Currency code
 */
export function getProductCurrency(productType: string): string {
    switch (productType.toLowerCase()) {
        case "airtime":
        case "utility":
            return "MWK"
        case "giftcard":
        default:
            return "USD"
    }
}
