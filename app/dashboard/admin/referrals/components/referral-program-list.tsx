"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Pencil, Plus } from "lucide-react"
import { saveReferralProgram } from "@/app/actions/referral"

import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface ReferralProgram {
  id: string
  name: string
  description: string
  isActive: boolean
  rewardAmount: number
  referrerReward: number
  refereeReward: number
  minimumPurchase: number | null
  maxRewardsPerUser: number | null
  createdAt: Date
  updatedAt: Date
}

interface ReferralProgramListProps {
  programs: ReferralProgram[]
}

export function ReferralProgramList({ programs }: ReferralProgramListProps) {
  const router = useRouter()
  const toast = useToast()
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const toggleProgramStatus = async (program: ReferralProgram) => {
    setUpdatingId(program.id)

    const formData = new FormData()
    formData.append("id", program.id)
    formData.append("name", program.name)
    formData.append("description", program.description)
    formData.append("isActive", (!program.isActive).toString())
    formData.append("referrerReward", (program.referrerReward / 100).toString())
    formData.append("refereeReward", (program.refereeReward / 100).toString())

    if (program.minimumPurchase) {
      formData.append("minimumPurchase", (program.minimumPurchase / 100).toString())
    }

    if (program.maxRewardsPerUser) {
      formData.append("maxRewardsPerUser", program.maxRewardsPerUser.toString())
    }

    try {
      const result = await saveReferralProgram(formData)
      if (result.success) {
        toast.toast({
          title: "Success",
          description: `Program ${program.isActive ? "disabled" : "enabled"} successfully`,
          variant: "default",
        })
        router.refresh()
      } else {
        toast.toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.toast({
        title: "Error",
        description: "An error occurred while updating the program",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  if (!programs.length) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle>Referral Programs</CardTitle>
          <CardDescription>Manage your store&apos;s referral programs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-4">No referral programs found.</p>
            <Button asChild>
              <Link href="/dashboard/admin/referrals?tab=new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Program
              </Link>
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
          <CardTitle>Referral Programs</CardTitle>
          <CardDescription>Manage your store&apos;s referral programs</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/admin/referrals?tab=new">
            <Plus className="mr-2 h-4 w-4" />
            New Program
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Rewards</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((program) => (
              <TableRow key={program.id}>
                <TableCell>
                  <div className="font-medium">{program.name}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1">{program.description}</div>
                </TableCell>
                <TableCell>
                  <div>Referrer: ${(program.referrerReward / 100).toFixed(2)}</div>
                  <div>Friend: ${(program.refereeReward / 100).toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={program.isActive}
                      onCheckedChange={() => toggleProgramStatus(program)}
                      disabled={updatingId === program.id}
                    />
                    <Badge variant={program.isActive ? "default" : "secondary"}>
                      {program.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>{format(new Date(program.createdAt), "MMM d, yyyy")}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/admin/referrals/edit/${program.id}`}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

