import type React from "react"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata = {
  title: "Airtime Topup",
  description: "Purchase airtime for local and international mobile numbers",
}

export default function AirtimeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>{children}</Suspense>
    </div>
  )
}
