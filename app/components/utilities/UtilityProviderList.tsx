"use client"

import { useEffect, useState } from "react"
import { UtilityProviderCard } from "./UtilityProviderCard"
import { Input } from "@/components/ui/input"
import { Search, WifiOff, RefreshCw, ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Biller {
  id: string
  name: string
  type: string
  serviceType: string
  countryIsoCode: string
  minAmount: number
  maxAmount: number
  currencyCode: string
  requiresInvoice: boolean
}

interface UtilityProviderListProps {
  type: string
}

export function UtilityProviderList({ type }: UtilityProviderListProps) {
  const [billers, setBillers] = useState<Biller[]>([])
  const [filteredBillers, setFilteredBillers] = useState<Biller[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOffline, setIsOffline] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function fetchBillers() {
      try {
        setLoading(true)
        setError(null)
        setIsOffline(false)

        const response = await fetch(`/api/reloadly/utilities/billers?type=${type}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            `Failed to fetch billers: ${response.status} ${response.statusText} ${errorData.error || errorData.message || ""
            }`,
          )
        }

        const data = await response.json()
        setBillers(data)
        setFilteredBillers(data)
      } catch (error) {
        console.error("Error fetching billers:", error)
        setError(error instanceof Error ? error.message : "An unknown error occurred")

        // Check if it's a network error
        if (
          error instanceof Error &&
          (error.message.includes("fetch failed") ||
            error.message.includes("network") ||
            error.message.includes("ENOTFOUND"))
        ) {
          setIsOffline(true)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchBillers()
  }, [type, retryCount])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBillers(billers)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = billers.filter((biller) => biller.name.toLowerCase().includes(query))

    setFilteredBillers(filtered)
  }, [searchQuery, billers])

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1)
  }

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant={isOffline ? "destructive" : "destructive"}>
          {isOffline ? <WifiOff className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle>{isOffline ? "Network Connectivity Issue" : "Error"}</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>
              {isOffline
                ? "Unable to connect to the Reloadly API. This could be due to network issues or DNS resolution problems."
                : error}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {isOffline && (
                <>
                  <Button size="sm" variant="outline" className="w-fit" onClick={handleRetry}>
                    <RefreshCw className="h-3 w-3 mr-2" /> Retry Connection
                  </Button>
                  <Button size="sm" variant="outline" className="w-fit" asChild>
                    <Link href="/dashboard/network">
                      <ExternalLink className="h-3 w-3 mr-2" /> Network Diagnostics
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search utility providers..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredBillers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {error ? "Please check your connection and try again." : "No utility providers found matching your search."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBillers.map((biller) => (
            <UtilityProviderCard key={biller.id} biller={biller} />
          ))}
        </div>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
      </div>
    </div>
  )
}
