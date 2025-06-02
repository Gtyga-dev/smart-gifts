// Mock data for development and testing - Updated to focus on Malawi

// Mock balance data
export const MOCK_BALANCE = {
  balance: 5000,
  currencyCode: "USD",
  currencyName: "US Dollar",
  updatedAt: new Date().toISOString(),
}

// Mock operators for airtime - Focused on Malawi
export const MOCK_OPERATORS = [
  {
    id: "1",
    name: "Airtel Malawi",
    logoUrls: [
      "https://s3.amazonaws.com/rld-operator/airtel-malawi-1.png",
      "https://s3.amazonaws.com/rld-operator/airtel-malawi-2.png",
    ],
    country: {
      isoName: "MW",
      name: "Malawi",
      flagUrl: "https://s3.amazonaws.com/rld-flags/mw.svg",
    },
    minAmount: 1,
    maxAmount: 100,
    senderCurrencyCode: "USD",
    destinationCurrencyCode: "MWK",
  },
  {
    id: "2",
    name: "TNM Malawi",
    logoUrls: [
      "https://s3.amazonaws.com/rld-operator/tnm-malawi-1.png",
      "https://s3.amazonaws.com/rld-operator/tnm-malawi-2.png",
    ],
    country: {
      isoName: "MW",
      name: "Malawi",
      flagUrl: "https://s3.amazonaws.com/rld-flags/mw.svg",
    },
    minAmount: 1,
    maxAmount: 100,
    senderCurrencyCode: "USD",
    destinationCurrencyCode: "MWK",
  },
  // Add more Malawi operators if needed
  {
    id: "282", // Adding this specific ID that was causing issues
    name: "Airtel Malawi Bundles",
    logoUrls: ["https://s3.amazonaws.com/rld-operator/airtel-malawi-1.png"],
    country: {
      isoName: "MW",
      name: "Malawi",
      flagUrl: "https://s3.amazonaws.com/rld-flags/mw.svg",
    },
    minAmount: 1,
    maxAmount: 100,
    senderCurrencyCode: "USD",
    destinationCurrencyCode: "MWK",
  },
]

// Mock billers for utilities - Focused on Malawi
export const MOCK_BILLERS = [
  {
    id: "1",
    name: "ESCOM Malawi",
    type: "ELECTRICITY_BILL_PAYMENT",
    serviceType: "PREPAID",
    countryIsoCode: "MW",
    minAmount: 500,
    maxAmount: 50000,
    currencyCode: "MWK",
    requiresInvoice: false,
  },
  {
    id: "2",
    name: "Lilongwe Water Board",
    type: "WATER_BILL_PAYMENT",
    serviceType: "POSTPAID",
    countryIsoCode: "MW",
    minAmount: 1000,
    maxAmount: 100000,
    currencyCode: "MWK",
    requiresInvoice: true,
  },
  {
    id: "3",
    name: "Blantyre Water Board",
    type: "WATER_BILL_PAYMENT",
    serviceType: "POSTPAID",
    countryIsoCode: "MW",
    minAmount: 1000,
    maxAmount: 100000,
    currencyCode: "MWK",
    requiresInvoice: true,
  },
  {
    id: "4",
    name: "DSTV Malawi",
    type: "TV_BILL_PAYMENT",
    serviceType: "PREPAID",
    countryIsoCode: "MW",
    minAmount: 2000,
    maxAmount: 30000,
    currencyCode: "MWK",
    requiresInvoice: false,
  },
  {
    id: "5",
    name: "GOtv Malawi",
    type: "TV_BILL_PAYMENT",
    serviceType: "PREPAID",
    countryIsoCode: "MW",
    minAmount: 1500,
    maxAmount: 15000,
    currencyCode: "MWK",
    requiresInvoice: false,
  },
  {
    id: "6",
    name: "Skyband Internet Malawi",
    type: "INTERNET_BILL_PAYMENT",
    serviceType: "POSTPAID",
    countryIsoCode: "MW",
    minAmount: 5000,
    maxAmount: 50000,
    currencyCode: "MWK",
    requiresInvoice: true,
  },
  {
    id: "7",
    name: "MTL Internet Malawi",
    type: "INTERNET_BILL_PAYMENT",
    serviceType: "POSTPAID",
    countryIsoCode: "MW",
    minAmount: 3000,
    maxAmount: 30000,
    currencyCode: "MWK",
    requiresInvoice: true,
  },
  {
    id: "18", // Adding this specific ID that was causing issues
    name: "Malawi Electricity Supply Corporation",
    type: "ELECTRICITY_BILL_PAYMENT",
    serviceType: "PREPAID",
    countryIsoCode: "MW",
    minAmount: 500,
    maxAmount: 50000,
    currencyCode: "MWK",
    requiresInvoice: false,
  },
]

// Mock products for gift cards - Focused on Malawi where possible
export const MOCK_PRODUCTS = [
  {
    productId: 1,
    productName: "Amazon Gift Card",
    redeemInstruction: {
      concise: "Redeem at amazon.com",
      verbose: "Go to amazon.com, click on 'Your Account', select 'Gift Cards' and enter the code.",
    },
    fixedRecipientDenominations: [10, 25, 50, 100],
    logoUrls: ["https://cdn.reloadly.com/giftcards/amazon-logo.png"],
    brand: {
      brandId: 1,
      brandName: "Amazon",
    },
    recipientCurrencyCode: "USD",
    senderCurrencyCode: "USD",
    discountPercentage: 2.5,
    denominationType: "FIXED",
    country: {
      isoName: "US",
      name: "United States",
    },
    category: {
      name: "Shopping",
    },
  },
  {
    productId: 2,
    productName: "iTunes Gift Card",
    redeemInstruction: {
      concise: "Redeem in the iTunes Store",
      verbose:
        "Open the iTunes Store, App Store, or iBooks Store. Tap 'Featured', scroll to the bottom, and tap 'Redeem'.",
    },
    fixedRecipientDenominations: [15, 25, 50, 100],
    logoUrls: ["https://cdn.reloadly.com/giftcards/itunes-logo.png"],
    brand: {
      brandId: 2,
      brandName: "Apple",
    },
    recipientCurrencyCode: "USD",
    senderCurrencyCode: "USD",
    discountPercentage: 3.0,
    denominationType: "FIXED",
    country: {
      isoName: "US",
      name: "United States",
    },
    category: {
      name: "Entertainment",
    },
  },
  {
    productId: 3,
    productName: "Google Play Gift Card",
    redeemInstruction: {
      concise: "Redeem in the Google Play Store",
      verbose: "Open the Google Play Store app, tap Menu > Redeem > Enter code.",
    },
    fixedRecipientDenominations: [10, 20, 50],
    logoUrls: ["https://cdn.reloadly.com/giftcards/google-play-logo.png"],
    brand: {
      brandId: 3,
      brandName: "Google",
    },
    recipientCurrencyCode: "USD",
    senderCurrencyCode: "USD",
    discountPercentage: 2.0,
    denominationType: "FIXED",
    country: {
      isoName: "US",
      name: "United States",
    },
    category: {
      name: "Entertainment",
    },
  },
  {
    productId: 4,
    productName: "Steam Gift Card",
    redeemInstruction: {
      concise: "Redeem on Steam",
      verbose:
        "Log in to your Steam account, click on your account name > Account Details > Add Funds to your Steam Wallet > Redeem a Steam Gift Card or Wallet Code.",
    },
    fixedRecipientDenominations: [20, 50, 100],
    logoUrls: ["https://cdn.reloadly.com/giftcards/steam-logo.png"],
    brand: {
      brandId: 4,
      brandName: "Steam",
    },
    recipientCurrencyCode: "USD",
    senderCurrencyCode: "USD",
    discountPercentage: 4.0,
    denominationType: "FIXED",
    country: {
      isoName: "US",
      name: "United States",
    },
    category: {
      name: "Gaming",
    },
  },
  {
    productId: 5,
    productName: "Netflix Gift Card",
    redeemInstruction: {
      concise: "Redeem at netflix.com/redeem",
      verbose: "Visit netflix.com/redeem and enter the gift card code to add the balance to your Netflix account.",
    },
    fixedRecipientDenominations: [30, 60, 100],
    logoUrls: ["https://cdn.reloadly.com/giftcards/netflix-logo.png"],
    brand: {
      brandId: 5,
      brandName: "Netflix",
    },
    recipientCurrencyCode: "USD",
    senderCurrencyCode: "USD",
    discountPercentage: 3.5,
    denominationType: "FIXED",
    country: {
      isoName: "US",
      name: "United States",
    },
    category: {
      name: "Entertainment",
    },
  },
]

// Mock transactions for development
export const MOCK_TRANSACTIONS = {
  airtime: [
    {
      transactionId: "12345",
      status: "SUCCESSFUL",
      operatorName: "Airtel Malawi",
      recipientPhone: "+265888123456",
      amount: 10,
      deliveredAmount: 2500,
      deliveredAmountCurrencyCode: "MWK",
      currencyCode: "USD",
      createdAt: new Date().toISOString(),
    },
  ],
  utilities: [
    {
      id: "67890",
      status: "SUCCESSFUL",
      billDetails: {
        billerName: "ESCOM Malawi",
        subscriberDetails: {
          accountNumber: "12345678",
        },
        pinDetails: {
          token: "ABC123456789",
          info1: "Valid for 30 days",
        },
      },
      amount: 50,
      amountCurrencyCode: "USD",
      createdAt: new Date().toISOString(),
    },
  ],
  giftCards: [
    {
      transactionId: "54321",
      status: "SUCCESSFUL",
      productName: "Amazon Gift Card",
      amount: 25,
      currencyCode: "USD",
      createdAt: new Date().toISOString(),
    },
  ],
}

// DNS test endpoints
export const DNS_TEST_ENDPOINTS = [
  { name: "Google DNS", url: "https://8.8.8.8" },
  { name: "Cloudflare DNS", url: "https://1.1.1.1" },
  { name: "Auth API", url: "https://auth.reloadly.com" },
  { name: "Giftcards API (Sandbox)", url: "https://giftcards-sandbox.reloadly.com" },
  { name: "Topups API (Sandbox)", url: "https://topups-sandbox.reloadly.com" },
  { name: "Utilities API (Sandbox)", url: "https://utilities-sandbox.reloadly.com" },
]

// Helper functions
export function filterOperatorsByType(operators: { name: string; country?: { isoName: string } }[], type: string) {
  if (type === "all") return operators
  if (type === "international") return operators.filter((op) => op.country?.isoName !== "MW")
  return operators.filter((op) => (op as { name: string }).name.toLowerCase().includes(type))
}

export function filterBillersByType(
  billers: { type: string }[],
  type: string
) {
  if (type === "all") return billers

  const typeMap: Record<string, string> = {
    electricity: "ELECTRICITY_BILL_PAYMENT",
    water: "WATER_BILL_PAYMENT",
    tv: "TV_BILL_PAYMENT",
    internet: "INTERNET_BILL_PAYMENT",
  }

  const apiType = typeMap[type.toLowerCase()] || type
  return billers.filter((biller) => biller.type === apiType)
}
