"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"
import { getUserReferrals } from "@/app/actions/referral"
import { useRouter } from "next/navigation"

interface Referral {
  id: string
  status: string
  rewardAmount: number
  rewardPaid: boolean
  createdAt: Date
  programName: string
}

interface ReferralHistoryProps {
  referrals: Referral[]
  totalCount?: number
}

export function ReferralHistory({ referrals: initialReferrals, totalCount = 0 }: ReferralHistoryProps) {
  const [referrals, setReferrals] = useState<Referral[]>(initialReferrals)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [totalReferrals, setTotalReferrals] = useState(totalCount || initialReferrals.length)
  const router = useRouter()

  const ITEMS_PER_PAGE = 10
  const totalPages = Math.ceil(totalReferrals / ITEMS_PER_PAGE)

  const loadPage = async (page: number) => {
    if (page < 1 || page > totalPages) return

    setIsLoading(true)
    try {
      const result = await getUserReferrals(page, ITEMS_PER_PAGE)
      setReferrals(result.referrals)
      setTotalReferrals(result.totalCount)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading referrals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshData = async () => {
    setIsLoading(true)
    try {
      const result = await getUserReferrals(currentPage, ITEMS_PER_PAGE)
      setReferrals(result.referrals)
      setTotalReferrals(result.totalCount)
      router.refresh()
    } catch (error) {
      console.error("Error refreshing referrals:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!referrals.length) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground">You haven&apos;t referred anyone yet.</p>
            <p className="text-muted-foreground mb-4">Share your referral code to start earning rewards!</p>
            <Button variant="outline" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>Track your referrals and rewards</CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <TableRow key={i} className="animate-pulse">
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        </TableCell>
                      </TableRow>
                    ))
                : referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{referral.programName}</TableCell>
                      <TableCell>
                        <StatusBadge status={referral.status} />
                      </TableCell>
                      <TableCell>
                        {referral.rewardPaid ? (
                          <span className="font-medium">${(referral.rewardAmount / 100).toFixed(2)}</span>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDistanceToNow(new Date(referral.createdAt), { addSuffix: true })}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, totalReferrals)}{" "}
              of {totalReferrals}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPage(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-green-500">
          Completed
        </Badge>
      )
    case "pending":
      return (
        <Badge variant="outline" className="text-amber-500 border-amber-500">
          Pending
        </Badge>
      )
    case "expired":
      return <Badge variant="secondary">Expired</Badge>
    case "cancelled":
      return <Badge variant="destructive">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

