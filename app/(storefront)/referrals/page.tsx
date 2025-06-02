import { Suspense } from "react"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"
import { getUserReferralCode, getUserReferrals } from "@/app/actions/referral"
import { ReferralStats } from "./components/referral-stats"
import { ReferralShare } from "./components/referral-share"
import { ReferralHistory } from "./components/referral-history"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"


function ReferralSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2 bg-primary/10" />
        <Skeleton className="h-4 w-96 bg-primary/10" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md bg-primary/10" />

        <div className="grid gap-4 md:grid-cols-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="bg-gradient-to-br from-card to-card/50 border border-primary/20">
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24 bg-primary/10" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-6 w-16 mb-2 bg-primary/10" />
                  <Skeleton className="h-3 w-32 bg-primary/10" />
                </CardContent>
              </Card>
            ))}
        </div>

        <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20">
          <CardHeader>
            <Skeleton className="h-6 w-32 mb-2 bg-primary/10" />
            <Skeleton className="h-4 w-64 bg-primary/10" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full bg-primary/10" />
            <Skeleton className="h-32 w-full bg-primary/10" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

async function ReferralContent() {
  const { getUser } = getKindeServerSession()
  const user = await getUser()

  if (!user) {
    redirect("/")
  }

  const referralData = await getUserReferralCode()
  const { referrals } = await getUserReferrals(1, 10)

  if (!referralData) {
    return (
      <Card className="bg-gradient-to-br from-card to-card/50 border border-primary/20 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">

            <CardTitle className="neon-text">Referral Program</CardTitle>
          </div>
          <CardDescription>Our referral program is currently unavailable</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please check back later for updates on our referral program.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-2">

          <h1 className="text-3xl font-bold tracking-tight neon-text">
            Referral <span className="gradient-text">Program</span>
          </h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Invite friends and earn rewards when they make their first purchase.
        </p>
      </div>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-card border border-primary/20">
          <TabsTrigger value="share" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Share & Earn
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
            Referral History
          </TabsTrigger>
        </TabsList>
        <TabsContent value="share" className="space-y-6 pt-4">
          <ReferralStats
            code={referralData.code}
            timesUsed={referralData.timesUsed}
            referrerReward={referralData.program.referrerReward / 100}
            refereeReward={referralData.program.refereeReward / 100}
          />
          <ReferralShare referralUrl={referralData.referralUrl} referralCode={referralData.code} />
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <ReferralHistory referrals={referrals} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ReferralsPage() {
  return (
    <div className="max-w-4xl mx-auto mt-10 px-4 sm:px-6 lg:px-8 cyber-grid">
      <Suspense fallback={<ReferralSkeleton />}>
        <ReferralContent />
      </Suspense>
    </div>
  )
}
