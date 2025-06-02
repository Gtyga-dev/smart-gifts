import { Badge } from "@/components/ui/badge"
import { Phone } from "lucide-react"

interface AirtimeHeaderProps {
  operator: string
}

export function AirtimeHeader({ operator }: AirtimeHeaderProps) {
  const title = getTitle(operator)

  return (
    <div className="flex flex-col space-y-4 mb-8">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
          <Phone className="mr-1 h-3 w-3" /> Airtime
        </Badge>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight neon-text">{title}</h1>
      <p className="text-muted-foreground max-w-3xl">
        Purchase airtime for mobile phones in Malawi and around the world. Instant delivery to any number.
      </p>
    </div>
  )
}

function getTitle(operator: string): string {
  switch (operator) {
    case "all":
      return "All Airtime Operators"
    case "tnm":
      return "TNM Airtime"
    case "airtel":
      return "Airtel Airtime"
    case "international":
      return "International Airtime"
    default:
      return "Airtime Topup"
  }
}
