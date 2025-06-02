"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Users, Award, DollarSign, BarChart, RefreshCw, TrendingUp, TrendingDown } from "lucide-react"
import { getReferralStats } from "@/app/actions/referral"
import { useRouter } from "next/navigation"

interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  conversionRate: number
  totalRewardsAmount: number
  topReferrers: {
    userId: string
    userName: string
    email: string
    referralCode: string
    totalReferrals: number
    successfulReferrals: number
  }[]
}

interface ReferralDashboardProps {
  stats: ReferralStats
}

export function ReferralDashboard({ stats: initialStats }: ReferralDashboardProps) {
  const [stats, setStats] = useState<ReferralStats>(initialStats)
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState<"all" | "month" | "week">("all")
  const router = useRouter()

  const refreshStats = async () => {
    setIsLoading(true)
    try {
      const updatedStats = await getReferralStats()
      setStats(updatedStats)
      router.refresh()
    } catch (error) {
      console.error("Error refreshing stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button variant={timeframe === "all" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("all")}>
            All Time
          </Button>
          <Button
            variant={timeframe === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe("month")}
          >
            This Month
          </Button>
          <Button variant={timeframe === "week" ? "default" : "outline"} size="sm" onClick={() => setTimeframe("week")}>
            This Week
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={refreshStats} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
            <p className="text-xs text-muted-foreground">Total number of referral attempts</p>
          </CardContent>
          <CardFooter className="p-2">
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+12% from last month</span>
            </div>
          </CardFooter>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Referrals</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReferrals}</div>
            <p className="text-xs text-muted-foreground">Referrals that resulted in purchases</p>
          </CardContent>
          <CardFooter className="p-2">
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+8% from last month</span>
            </div>
          </CardFooter>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <BarChart className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Percentage of successful referrals</p>
          </CardContent>
          <CardFooter className="p-2">
            <div className="flex items-center text-xs text-red-500">
              <TrendingDown className="h-3 w-3 mr-1" />
              <span>-2% from last month</span>
            </div>
          </CardFooter>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(stats.totalRewardsAmount / 100).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total amount paid in referral rewards</p>
          </CardContent>
          <CardFooter className="p-2">
            <div className="flex items-center text-xs text-green-500">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>+15% from last month</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle>Top Referrers</CardTitle>
          <CardDescription>Users who have referred the most customers</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mr-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mr-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6 mr-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/6"></div>
                  </div>
                ))}
            </div>
          ) : stats.topReferrers.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">No referrals yet</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Referral Code</TableHead>
                    <TableHead>Total Referrals</TableHead>
                    <TableHead>Successful</TableHead>
                    <TableHead>Success Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.topReferrers.map((referrer) => (
                    <TableRow key={referrer.userId}>
                      <TableCell>
                        <div className="font-medium">{referrer.userName}</div>
                        <div className="text-sm text-muted-foreground">{referrer.email}</div>
                      </TableCell>
                      <TableCell>{referrer.referralCode}</TableCell>
                      <TableCell>{referrer.totalReferrals}</TableCell>
                      <TableCell>{referrer.successfulReferrals}</TableCell>
                      <TableCell>
                        {referrer.totalReferrals > 0
                          ? ((referrer.successfulReferrals / referrer.totalReferrals) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

