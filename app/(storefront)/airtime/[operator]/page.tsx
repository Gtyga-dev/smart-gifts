import { AirtimeOperatorList } from "@/app/components/airtime/AirtimeOperatorList"
import { AirtimeHeader } from "@/app/components/airtime/AirtimeHeader"
import { notFound } from "next/navigation"
import { unstable_noStore as noStore } from "next/cache"

const validOperators = ["all", "tnm", "airtel", "international"]

export default async function AirtimeOperatorPage({
  params: paramsPromise,
}: {
  params: Promise<{ operator: string }>
}) {
  noStore()
  const { operator } = await paramsPromise

  if (!validOperators.includes(operator)) {
    return notFound()
  }

  return (
    <section className="cyber-grid">
      <AirtimeHeader operator={operator} />
      <AirtimeOperatorList operator={operator} />
    </section>
  )
}
