import { NextResponse } from "next/server"
import { handleApiError } from "@/app/lib/api-error"

export async function GET() {
  try {
    // Check for required environment variables
    const requiredEnvVars = [
      "RELOADLY_CLIENT_ID",
      "RELOADLY_CLIENT_SECRET",
      "RELOADLY_ENVIRONMENT",
      "UPSTASH_REDIS_REST_URL",
      "UPSTASH_REDIS_REST_TOKEN",
    ]

    const missingEnvVars = requiredEnvVars.filter((envVar) => !process.env[envVar])
    const configuredEnvVars = requiredEnvVars.filter((envVar) => !!process.env[envVar])

    // Check Node.js version
    const nodeVersion = process.version
    const isNodeVersionCompatible =
      nodeVersion.startsWith("v16") || nodeVersion.startsWith("v18") || nodeVersion.startsWith("v20")

    // Check environment
    const environment = process.env.NODE_ENV || "development"
    const reloadlyEnvironment = process.env.RELOADLY_ENVIRONMENT || "sandbox"

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment,
      nodeVersion,
      isNodeVersionCompatible,
      reloadlyEnvironment,
      configStatus: {
        missingEnvVars,
        configuredEnvVars,
        isFullyConfigured: missingEnvVars.length === 0,
      },
    })
  } catch (error) {
    return handleApiError(error, "Failed to check environment")
  }
}
