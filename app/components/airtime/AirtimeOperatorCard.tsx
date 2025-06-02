"use client"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { PlaceholderImage } from "@/components/PlaceholderImage"

interface Operator {
  id: string
  name: string
  logoUrls: string[]
  country: {
    isoName: string
    name: string
    flagUrl: string
  }
  minAmount: number
  maxAmount: number
  senderCurrencyCode: string
  destinationCurrencyCode: string
}

interface AirtimeOperatorCardProps {
  operator: Operator
}

export function AirtimeOperatorCard({ operator }: AirtimeOperatorCardProps) {
  const router = useRouter()

  const handleTopup = () => {
    router.push(`/airtime/topup/${operator.id}`)
  }

  // Check if logo URL is valid (starts with http/https)
  const hasValidLogo = operator.logoUrls && operator.logoUrls.length > 0 && /^https?:\/\//.test(operator.logoUrls[0])

  // Check if flag URL is valid
  const hasValidFlag = operator.country && operator.country.flagUrl && /^https?:\/\//.test(operator.country.flagUrl)

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative h-32 bg-muted/50">
        <div className="absolute inset-0 flex items-center justify-center p-6">
          {hasValidLogo ? (
            <Image
              src={operator.logoUrls[0] || "/placeholder.svg"}
              alt={operator.name}
              width={120}
              height={80}
              className="object-contain max-h-20"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderImage width={120} height={80} text={operator.name.substring(0, 2).toUpperCase()} />
            </div>
          )}
        </div>

        {hasValidFlag && (
          <div className="absolute top-2 right-2">
            <Image
              src={operator.country.flagUrl || "/placeholder.svg"}
              alt={operator.country.name}
              width={24}
              height={16}
              className="rounded-sm shadow-sm"
            />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-1">{operator.name}</h3>
        <p className="text-sm text-muted-foreground">{operator.country?.name || "International"}</p>

        <div className="mt-3 text-sm">
          <p>
            <span className="text-muted-foreground">Amount Range:</span> {operator.senderCurrencyCode}{" "}
            {operator.minAmount.toFixed(2)} - {operator.maxAmount.toFixed(2)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button onClick={handleTopup} className="w-full">
          Topup Now
        </Button>
      </CardFooter>
    </Card>
  )
}
