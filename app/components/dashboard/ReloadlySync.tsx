"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RefreshCw, AlertCircle, CheckCircle, Wifi, WifiOff, ExternalLink, HelpCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"

export function ReloadlySync() {
  const [syncing, setSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)
  const [balance, setBalance] = useState<{
    amount: number
    currency: string
  } | null>(null)
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking")
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("giftcards")
  const { toast } = useToast()

  // Check API status on component mount
  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      setApiStatus("checking")
      setError(null)

      const response = await fetch("/api/reloadly/balance", {
        // Add cache: 'no-store' to prevent caching
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setBalance({
          amount: data.balance,
          currency: data.currencyCode,
        })
        setApiStatus("online")
        setError(null)
      } else {
        setApiStatus("offline")
        const errorData = await response.json()
        setError(errorData.error || "Failed to connect to Reloadly API")
      }
    } catch (error) {
      console.error("Error checking API status:", error)
      setApiStatus("offline")
      setError(
        "Network error when connecting to Reloadly API. Please check your internet connection and API credentials.",
      )
    }
  }

  const syncProducts = async (countryCode = "MW") => {
    try {
      setSyncing(true)
      setError(null)

      // Fetch Reloadly products for the specified country
      const response = await fetch(`/api/reloadly/sync-products?countryCode=${countryCode}`, {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to sync products")
      }

      const data = await response.json()

      toast({
        title: "Products synced successfully",
        description: data.message || `Synced ${data.count} products from Reloadly`,
      })

      setLastSynced(new Date().toLocaleString())
    } catch (error) {
      console.error("Error syncing products:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "Sync failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setSyncing(false)
    }
  }

  const fetchBalance = async () => {
    try {
      setError(null)
      const response = await fetch("/api/reloadly/balance", {
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch balance")
      }

      const data = await response.json()

      setBalance({
        amount: data.balance,
        currency: data.currencyCode,
      })

      setApiStatus("online")

      toast({
        title: "Balance updated",
        description: `Current balance: ${data.currencyCode} ${data.balance.toFixed(2)}`,
      })
    } catch (error) {
      console.error("Error fetching balance:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      setApiStatus("offline")
      toast({
        variant: "destructive",
        title: "Failed to fetch balance",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  const runDiagnostics = async () => {
    try {
      setError(null)
      toast({
        title: "Running diagnostics...",
        description: "Checking connectivity to Reloadly API endpoints",
      })

      const response = await fetch("/api/reloadly/diagnostics", {
        cache: "no-store",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to run diagnostics")
      }

      const data = await response.json()

      if (data.allEndpointsReachable) {
        toast({
          title: "Network diagnostics complete",
          description: "All Reloadly API endpoints are reachable",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Network issues detected",
          description: `${data.reachableCount}/${data.totalEndpoints} endpoints reachable`,
        })
        setError(`Network connectivity issues detected: ${data.unreachableEndpoints.join(", ")}`)
      }
    } catch (error) {
      console.error("Error running diagnostics:", error)
      setError(error instanceof Error ? error.message : "An unknown error occurred")
      toast({
        variant: "destructive",
        title: "Diagnostics failed",
        description: error instanceof Error ? error.message : "An error occurred",
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Reloadly Integration</CardTitle>
            <CardDescription>Manage your Reloadly services</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {apiStatus === "online" && (
              <div className="flex items-center gap-1 text-sm text-green-600">
                <Wifi className="h-4 w-4" />
                API Online
              </div>
            )}
            {apiStatus === "offline" && (
              <div className="flex items-center gap-1 text-sm text-amber-600">
                <WifiOff className="h-4 w-4" />
                API Offline
              </div>
            )}
            {apiStatus === "checking" && (
              <div className="flex items-center gap-1 text-sm text-blue-600">
                <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                Checking...
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>{error}</p>
                {apiStatus === "offline" && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Button size="sm" variant="outline" className="w-fit" asChild>
                      <Link href="/dashboard/network">
                        <ExternalLink className="h-3 w-3 mr-2" /> Network Diagnostics
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" className="w-fit" asChild>
                      <Link href="/dashboard/dns-help">
                        <HelpCircle className="h-3 w-3 mr-2" /> DNS Help
                      </Link>
                    </Button>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {apiStatus === "offline" && !error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Connectivity Issue</AlertTitle>
              <AlertDescription className="flex flex-col gap-2">
                <p>
                  Unable to connect to Reloadly API. Please check your internet connection and Reloadly API credentials.
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button size="sm" variant="outline" className="w-fit" asChild>
                    <Link href="/dashboard/network">
                      <ExternalLink className="h-3 w-3 mr-2" /> Network Diagnostics
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" className="w-fit" asChild>
                    <Link href="/dashboard/dns-help">
                      <HelpCircle className="h-3 w-3 mr-2" /> DNS Help
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {balance ? (
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="font-medium">Current Balance</p>
              <p className="text-2xl font-bold">
                {balance.currency} {balance.amount.toFixed(2)}
              </p>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Balance information unavailable</p>
            </div>
          )}

          {lastSynced && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
              <p>Last synced: {lastSynced}</p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
              <TabsTrigger value="airtime">Airtime</TabsTrigger>
              <TabsTrigger value="utilities">Utilities</TabsTrigger>
            </TabsList>
            <TabsContent value="giftcards" className="p-4 border rounded-md mt-2">
              <h3 className="text-sm font-medium mb-2">Gift Cards Management</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Sync gift card products from Reloadly to your database.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => syncProducts("MW")} disabled={syncing}>
                  {syncing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Malawi Products
                    </>
                  )}
                </Button>
                <Button size="sm" variant="outline" onClick={() => syncProducts("ALL")} disabled={syncing}>
                  Sync All Countries
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="airtime" className="p-4 border rounded-md mt-2">
              <h3 className="text-sm font-medium mb-2">Airtime Management</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage airtime operators and topup services.</p>
              <Button size="sm" variant="outline" onClick={() => window.open("/airtime/all", "_blank")}>
                View Airtime Services
              </Button>
            </TabsContent>
            <TabsContent value="utilities" className="p-4 border rounded-md mt-2">
              <h3 className="text-sm font-medium mb-2">Utilities Management</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage utility providers and payment services.</p>
              <Button size="sm" variant="outline" onClick={() => window.open("/utilities/all", "_blank")}>
                View Utility Services
              </Button>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={runDiagnostics}>
          Run Diagnostics
        </Button>
        <Button onClick={fetchBalance}>Refresh Balance</Button>
      </CardFooter>
    </Card>
  )
}
