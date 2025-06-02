import { User } from "@prisma/client"


// This is a simplified version of P2PTransaction that matches what we get from Prisma
export interface SimplifiedP2PTransaction {
    id: string
    amount: number
    listing: {
        id: string
        assetName: string
        assetType: string
        quantity: string | number
        type: string
        price: number
        priceType: string
        paymentMethod: string
        description: string
        createdAt: string | Date
        user: User
    }
    seller: User
    buyer?: User
}
