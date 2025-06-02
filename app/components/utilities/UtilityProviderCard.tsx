"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Zap, Droplet, Tv, Wifi } from "lucide-react"

interface Biller {
  id: string
  name: string
  type: string
  serviceType: string
  countryIsoCode: string
  minAmount: number
  maxAmount: number
  currencyCode: string
}

interface UtilityProviderCardProps {
  biller: Biller
}

export function UtilityProviderCard({ biller }: UtilityProviderCardProps) {
  const router = useRouter()

  const handlePay = () => {
    router.push(`/utilities/pay/${biller.id}`)
  }

  const getIcon = () => {
    switch (biller.type) {
      case "ELECTRICITY_BILL_PAYMENT":
        return <Zap className="h-8 w-8 text-yellow-500" />
      case "WATER_BILL_PAYMENT":
        return <Droplet className="h-8 w-8 text-blue-500" />
      case "TV_BILL_PAYMENT":
        return <Tv className="h-8 w-8 text-purple-500" />
      case "INTERNET_BILL_PAYMENT":
        return <Wifi className="h-8 w-8 text-green-500" />
      default:
        return <Zap className="h-8 w-8 text-primary" />
    }
  }

  const getServiceTypeLabel = () => {
    return biller.serviceType === "PREPAID" ? "Prepaid" : "Postpaid"
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-2 bg-primary/10 rounded-full">{getIcon()}</div>
          <div>
            <h3 className="font-semibold text-lg">{biller.name}</h3>
            <p className="text-sm text-muted-foreground">{getServiceTypeLabel()}</p>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Country:</span> {biller.countryIsoCode}
          </p>
          <p>
            <span className="text-muted-foreground">Amount Range:</span> {biller.currencyCode}{" "}
            {biller.minAmount.toFixed(2)} - {biller.maxAmount.toFixed(2)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button onClick={handlePay} className="w-full">
          Pay Now
        </Button>
      </CardFooter>
    </Card>
  )
}
