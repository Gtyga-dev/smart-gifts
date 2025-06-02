import { Badge } from "@/components/ui/badge"
import { Zap } from "lucide-react"

interface UtilityHeaderProps {
  type: string
}

export function UtilityHeader({ type }: UtilityHeaderProps) {
  const title = getTitle(type)

  return (
    <div className="flex flex-col space-y-4 mb-8">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1">
          <Zap className="mr-1 h-3 w-3" /> Utilities
        </Badge>
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight neon-text">{title}</h1>
      <p className="text-muted-foreground max-w-3xl">
        Pay your utility bills online - quick, secure, and convenient. No more queues or late payments.
      </p>
    </div>
  )
}

function getTitle(type: string): string {
  switch (type) {
    case "all":
      return "All Utility Providers"
    case "electricity":
      return "Electricity Bill Payments"
    case "water":
      return "Water Bill Payments"
    case "tv":
      return "TV Subscription Payments"
    case "internet":
      return "Internet Bill Payments"
    default:
      return "Utility Payments"
  }
}
