export type Cart = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productType: any;
    userId: string;
    items: Array<{
      id: string;
      name: string;
      price: number;
      quantity: number;
      imageString: string;
    }>;
  };
  

  // Add these interfaces to your existing interfaces file

export interface ReferralProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  rewardAmount: number
  referrerReward: number
  refereeReward: number
  minimumPurchase?: number
  maxRewardsPerUser?: number
  createdAt: Date
  updatedAt: Date
}

export interface ReferralCode {
  id: string
  code: string
  userId: string
  programId: string
  timesUsed: number
  createdAt: Date
  updatedAt: Date
}

export interface Referral {
  id: string
  referralCodeId: string
  referrerId: string
  refereeId: string
  status: "pending" | "completed" | "expired" | "cancelled"
  rewardPaid: boolean
  rewardAmount?: number
  qualifyingOrderId?: string
  createdAt: Date
  updatedAt: Date
}

