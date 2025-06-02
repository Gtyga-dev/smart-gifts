import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Gift, DollarSign } from "lucide-react"

interface ReferralStatsProps {
  code: string
  timesUsed: number
  referrerReward: number
  refereeReward: number
}

export function ReferralStats({ code, timesUsed, referrerReward, refereeReward }: ReferralStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Your Referral Code</CardTitle>
          <Gift className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{code}</div>
          <p className="text-xs text-muted-foreground">Share this code with friends</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
          <Users className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{timesUsed}</div>
          <p className="text-xs text-muted-foreground">People who used your code</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Rewards</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${referrerReward.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            You get ${referrerReward.toFixed(2)}, friends get ${refereeReward.toFixed(2)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

