// Define shared P2P types for use across components

export interface P2PUser {
  id: string
  firstName: string
  lastName: string
  email?: string
  profileImage?: string
}

export interface P2POffer {
  id: string
  amount: number
  message?: string
  paymentMethod?: string
  paymentDetails?: string
  status: string
  listingId: string
  userId: string
  createdAt: string | Date
  updatedAt: string | Date
  user: P2PUser
}

export interface P2PListing {
  id: string
  type: string // "buy" or "sell"
  assetType: string // "crypto", "giftcard", "forex"
  assetName: string
  quantity: string | number // Can be either string or number from Prisma
  price: number
  priceType: string // "fixed" or "negotiable"
  paymentMethod: string
  description: string
  terms?: string
  paymentDetails?: string
  metadata?: {
    cryptoNetwork?: string
    location?: string
    cardRegion?: string
    [key: string]: any
  }
  status: string // "pending", "active", "completed", "rejected"
  userId: string
  createdAt: string | Date
  updatedAt: string | Date
  user: P2PUser
  offers?: P2POffer[]
}

export interface P2PTransaction {
  id: string
  amount: number
  status: string
  listingId: string
  buyerId: string
  sellerId: string
  paymentMethod?: string
  paymentProof?: string
  paymentReference?: string
  additionalInfo?: string
  createdAt: string | Date
  updatedAt: string | Date
  listing: P2PListing
  buyer: P2PUser
  seller: P2PUser
}
