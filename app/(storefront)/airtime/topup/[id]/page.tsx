import { AirtimeTopupForm } from "@/app/components/airtime/AirtimeTopupForm"
import { getOperatorById } from "@/app/lib/reloadly-airtime"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function AirtimeTopupPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>
}) {
  noStore()
  const { id } = await paramsPromise

  try {
    const operator = await getOperatorById(id)

    if (!operator) {
      return notFound()
    }

    return (
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/airtime/all">
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Topup {operator.name}</h1>
        </div>

        <AirtimeTopupForm operator={operator} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching operator:", error)
    return notFound()
  }
}
