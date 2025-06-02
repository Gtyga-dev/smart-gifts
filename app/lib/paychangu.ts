import crypto from "crypto"

/**
 * Verify the signature from Paychangu webhook
 *
 * @param payload The raw request body as text
 * @param signature The signature from the x-paychangu-signature header
 * @param secret The webhook secret from Paychangu dashboard
 * @returns boolean indicating whether the signature is valid
 */
export function verifyPaychanguSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  if (!payload || !signature || !secret) {
    return false
  }

  try {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex")

    // Use fixed-time compare to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  } catch (error) {
    console.error("Error verifying Paychangu signature:", error)
    return false
  }
}

/**
 * Format an amount for display with currency
 *
 * @param amount The amount to format
 * @param currency The currency code
 * @returns Formatted amount string
 */
export function formatAmount(amount: number, currency: string): string {
  const currencyFormats: Record<string, Intl.NumberFormatOptions> = {
    MWK: { style: "currency", currency: "MWK", minimumFractionDigits: 2 },
    USD: { style: "currency", currency: "USD", minimumFractionDigits: 2 },
    ZAR: { style: "currency", currency: "ZAR", minimumFractionDigits: 2 },
  }

  const format =
    currencyFormats[currency] ?? {
      style: "currency",
      currency: currency || "MWK",
      minimumFractionDigits: 2,
    }

  return new Intl.NumberFormat("en-US", format).format(amount)
}

/**
 * Sanitize common Malawi phone inputs into E.164 format.
 *
 * - Strips all non-digits
 * - 0XXXXXXXXX    → +265XXXXXXXXX
 * - 265XXXXXXXXX  → +265XXXXXXXXX
 * - XXXXXXXXX     → +265XXXXXXXXX  (where XXXXXXXXX starts with 88|99|98|31–34)
 * - Leaves valid E.164 untouched
 */
export function sanitizePhoneNumber(input: string): string {
  const digits = input.replace(/\D+/g, "")

  // 0XXXXXXXXX → +265XXXXXXXXX
  if (/^0\d{8,9}$/.test(digits)) {
    return "+265" + digits.slice(1)
  }

  // 265XXXXXXXXX → +265XXXXXXXXX
  if (/^265\d{9}$/.test(digits)) {
    return "+" + digits
  }

  // XXXXXXXXX (9 digits) with valid Malawi prefix → +265XXXXXXXXX
  if (/^(?:88|99|98|31|32|33|34)\d{6}$/.test(digits)) {
    return "+265" + digits
  }

  // Already E.164
  if (/^\+\d{8,15}$/.test(input)) {
    return input
  }

  // Fallback: return raw input so validation can catch it
  return input
}

/**
 * Validate a phone number against country specific rules
 *
 * @param phoneNumber The sanitized phone number (E.164)
 * @param _countryIso The ISO code of the country (e.g. 'MW')
 * @returns boolean indicating whether the phone number is valid
 */
export function validatePhoneNumber(
  phoneNumber: string,
  _countryIso: string,
  operator: { country: { isoName: string } }
): boolean {
  if (!phoneNumber) {
    return false
  }

  // For Malawi numbers, ensure they have the correct format
  if (operator.country.isoName === "MW" && phoneNumber.startsWith("+265")) {
    // Should be +265 followed by 9 digits
    const digits = phoneNumber.replace("+265", "")
    if (!/^\d{9}$/.test(digits)) {
      return false
    }
  }

  return true
}

/**
 * Generate a transaction reference for Paychangu
 *
 * @param prefix Prefix for the transaction reference (e.g., 'air' for airtime)
 * @param id Unique identifier to include in the reference
 * @returns A unique transaction reference string
 */
export function generateTransactionReference(
  prefix: string,
  id: string
): string {
  const timestamp = Date.now().toString(36)
  const randomChars = Math.random().toString(36).substring(2, 6)
  return `${prefix}_${id.substring(0, 8)}_${timestamp}${randomChars}`
}

/**
 * React-style phone validation helper.
 *
 * - Sanitizes the raw input
 * - Validates against country code rules
 * - Sets context-aware error messages via the provided setter
 *
 * @param rawPhone The raw string the user typed
 * @param countryIso ISO country code (e.g. 'MW')
 * @param setPhoneError Setter for your component's error state
 * @returns boolean indicating validity
 */
export const validatePhone = (
  rawPhone: string,
  countryIso: string,
  setPhoneError: (msg: string) => void
): boolean => {
  // 1) Required?
  if (!rawPhone) {
    setPhoneError("Phone number is required")
    return false
  }

  // 2) Sanitize into E.164
  const phone = sanitizePhoneNumber(rawPhone)

  // 3) Country-specific checks
  if (countryIso === "MW") {
    if (!phone.startsWith("+265")) {
      setPhoneError("Malawi numbers must start with +265")
      return false
    }
  }

  // 4) Validate full format
  if (!validatePhoneNumber(phone, countryIso, { country: { isoName: countryIso } })) {
    if (countryIso === "MW") {
      setPhoneError(
        "Invalid phone number format for Malawi: should be +265 followed by 9 digits"
      )
    } else {
      setPhoneError("Invalid phone number format")
    }
    return false
  }

  // All good!
  setPhoneError("")  
  return true
}

