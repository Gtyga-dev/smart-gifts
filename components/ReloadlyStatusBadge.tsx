import type React from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle, XCircle, RefreshCw } from "lucide-react"

interface ReloadlyStatusBadgeProps {
  status: string
  className?: string
}

export function ReloadlyStatusBadge({ status, className = "" }: ReloadlyStatusBadgeProps) {
  // Normalize status to lowercase for case-insensitive comparison
  const normalizedStatus = status.toLowerCase()

  // Define status configurations
  const statusConfig: Record<
    string,
    { variant: "default" | "secondary" | "destructive" | "outline" | null; icon: React.ReactNode; label: string }
  > = {
    successful: {
      variant: "default",
      icon: <CheckCircle className="h-3 w-3 mr-1" />,
      label: "Successful",
    },
    pending: {
      variant: "secondary",
      icon: <Clock className="h-3 w-3 mr-1" />,
      label: "Pending",
    },
    processing: {
      variant: "secondary",
      icon: <RefreshCw className="h-3 w-3 mr-1 animate-spin" />,
      label: "Processing",
    },
    failed: {
      variant: "destructive",
      icon: <XCircle className="h-3 w-3 mr-1" />,
      label: "Failed",
    },
    refunded: {
      variant: "outline",
      icon: <RefreshCw className="h-3 w-3 mr-1" />,
      label: "Refunded",
    },
  }

  // Get config for the current status or use a default
  const config = statusConfig[normalizedStatus] || {
    variant: "outline",
    icon: <AlertCircle className="h-3 w-3 mr-1" />,
    label: status, // Use the original status text
  }

  return (
    <Badge variant={config.variant} className={`flex items-center ${className}`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
