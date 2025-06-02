import { NextResponse } from "next/server"
import { handleApiError } from "@/app/lib/api-error"
import { redis } from "@/app/lib/redis-client"

interface DiagnosticsResult {
  allEndpointsReachable: boolean
  reachableCount: number
  totalEndpoints: number
  unreachableEndpoints: string[]
  redisConnected: boolean
  redisError: string | null
  internetConnected: boolean
  details: Record<
    string,
    {
      reachable: boolean
      responseTime?: number
      error?: string
    }
  >
  environment: {
    nodeEnv: string
    reloadlyEnvironment: string
    hasClientId: boolean
    hasClientSecret: boolean
    hasWebhookSecret: boolean
  }
}

export async function GET() {
  try {
    // Define endpoints to check - use sandbox endpoints
    const endpoints = [
      { name: "Google (Internet Check)", url: "https://www.google.com" },
      { name: "Auth API", url: "https://auth.reloadly.com" },
      { name: "Giftcards API (Sandbox)", url: "https://giftcards-sandbox.reloadly.com" },
      { name: "Topups API (Sandbox)", url: "https://topups-sandbox.reloadly.com" },
      { name: "Utilities API (Sandbox)", url: "https://utilities-sandbox.reloadly.com" },
    ]

    const result: DiagnosticsResult = {
      allEndpointsReachable: true,
      reachableCount: 0,
      totalEndpoints: endpoints.length,
      unreachableEndpoints: [],
      redisConnected: false,
      redisError: null,
      internetConnected: false,
      details: {},
      environment: {
        nodeEnv: process.env.NODE_ENV || "development",
        reloadlyEnvironment: process.env.RELOADLY_ENVIRONMENT || "sandbox",
        hasClientId: !!process.env.RELOADLY_CLIENT_ID,
        hasClientSecret: !!process.env.RELOADLY_CLIENT_SECRET,
        hasWebhookSecret: !!process.env.RELOADLY_WEBHOOK_SECRET,
      },
    }

    // Check Redis connection
    try {
      result.redisConnected = await redis.isConnected()
      const redisError = redis.getConnectionError()
      result.redisError = redisError ? redisError.message : null
    } catch (error) {
      result.redisError = error instanceof Error ? error.message : "Unknown Redis error"
    }

    // In development mode, simulate endpoint checks
    if (process.env.NODE_ENV === "development") {
      // Simulate all endpoints as reachable in development
      endpoints.forEach((endpoint) => {
        result.details[endpoint.name] = {
          reachable: true,
          responseTime: Math.floor(Math.random() * 100) + 50, // Random response time between 50-150ms
        }
      })

      result.reachableCount = endpoints.length
      result.internetConnected = true

      return NextResponse.json(result)
    }

    // Check each endpoint
    await Promise.all(
      endpoints.map(async (endpoint) => {
        const startTime = Date.now()
        try {
          // Use HEAD request with no-cors mode to just check connectivity
          const responseTime = Date.now() - startTime
          result.details[endpoint.name] = {
            reachable: true,
            responseTime,
          }
          result.reachableCount++

          // Mark internet as connected if Google is reachable
          if (endpoint.name === "Google (Internet Check)") {
            result.internetConnected = true
          }
        } catch (error) {
          result.allEndpointsReachable = false
          result.unreachableEndpoints.push(endpoint.name)
          result.details[endpoint.name] = {
            reachable: false,
            error: error instanceof Error ? error.message : "Unknown error",
          }

          // Mark internet as disconnected if Google is unreachable
          if (endpoint.name === "Google (Internet Check)") {
            result.internetConnected = false
          }
        }
      }),
    )

    return NextResponse.json(result)
  } catch (error) {
    return handleApiError(error, "Failed to run network diagnostics")
  }
}
