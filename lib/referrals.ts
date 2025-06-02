/**
 * Generates a unique referral code
 * @returns A unique referral code
 */
export function generateReferralCode(): string {
    const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789" // Removed confusing characters like 0, O, 1, I
    const length = 8
    let result = ""
  
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
  
    return result
  }
  
  /**
   * Validates a referral code format
   * @param code The referral code to validate
   * @returns Whether the code format is valid
   */
  export function isValidReferralCode(code: string): boolean {
    // Check if code matches our format (8 alphanumeric characters)
    return /^[A-Z0-9]{8}$/.test(code)
  }
  
  /**
   * Calculate reward amount for a referral
   * @param orderAmount The amount of the order in cents
   * @returns The reward amount in cents
   */
  export function calculateReferralReward(orderAmount: number): number {
    // Base reward is $10 (1000 cents)
    const baseReward = 1000
  
    // For orders over $100, add 5% of the order value as additional reward
    if (orderAmount > 10000) {
      const additionalReward = Math.floor(orderAmount * 0.05)
      return baseReward + additionalReward
    }
  
    return baseReward
  }
  
  /**
   * Format currency amount from cents to dollars with proper formatting
   * @param cents Amount in cents
   * @returns Formatted string with dollar sign
   */
  export function formatCurrency(cents: number): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100)
  }
  
  