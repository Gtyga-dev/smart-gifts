/**
 * Reloadly configuration class
 */
export class ReloadlyEnv {
    isSandbox: boolean
    baseUrls: {
        giftcards: string
        topups: string
        utilities: string
        auth: string
    }
    apiVersionHeaders: {
        giftcards: string
        topups: string
        utilities: string
    }

    constructor() {
      
        this.isSandbox = process.env.RELOADLY_ENVIRONMENT !== "production"

        console.log(`Reloadly Environment: ${process.env.RELOADLY_ENVIRONMENT || "not set"} (sandbox: ${this.isSandbox})`)
        console.log(`Client ID available: ${!!process.env.RELOADLY_CLIENT_ID}`)
        console.log(`Client Secret available: ${!!process.env.RELOADLY_CLIENT_SECRET}`)

        // Base URLs for different Reloadly services based on environment
        this.baseUrls = {
            giftcards: this.isSandbox ? "https://giftcards-sandbox.reloadly.com" : "https://giftcards.reloadly.com",
            topups: this.isSandbox ? "https://topups-sandbox.reloadly.com" : "https://topups.reloadly.com",
            utilities: this.isSandbox ? "https://utilities-sandbox.reloadly.com" : "https://utilities.reloadly.com",
            auth: "https://auth.reloadly.com",
        }

        // API version headers for different services
        this.apiVersionHeaders = {
            giftcards: "application/com.reloadly.giftcards-v1+json",
            topups: "application/com.reloadly.topups-v1+json",
            utilities: "application/com.reloadly.utilities-v1+json",
        }
    }
}

// Export a singleton instance
export const reloadlyEnv = new ReloadlyEnv()
