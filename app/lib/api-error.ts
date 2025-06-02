import { NextResponse } from "next/server"

/**
 * Standard error response structure
 */
interface ErrorResponse {
  error: string
  details?: unknown
  code?: string
  status: number
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  message: string,
  status = 500,
  details?: unknown,
  code?: string,
): NextResponse<ErrorResponse> {
  const errorResponse: ErrorResponse = {
    error: message,
    status,
  }

  if (details) errorResponse.details = details
  if (code) errorResponse.code = code

  return NextResponse.json(errorResponse, { status })
}

/**
 * Handle API errors in a standardized way
 */
export function handleApiError(error: unknown, defaultMessage = "Internal server error"): NextResponse {
  console.error("API Error:", error)

  // Handle known error types
  if (error instanceof ReloadlyApiError) {
    return createErrorResponse(error.message, error.status, error.details, error.code)
  }

  // Handle standard errors
  if (error instanceof Error) {
    return createErrorResponse(error.message || defaultMessage, 500, {
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    })
  }

  // Handle unknown errors
  return createErrorResponse(defaultMessage, 500)
}

/**
 * Custom error class for Reloadly API errors
 */
export class ReloadlyApiError extends Error {
  status: number
  details?: unknown
  code?: string

  constructor(message: string, status = 500, details?: unknown, code?: string) {
    super(message)
    this.name = "ReloadlyApiError"
    this.status = status
    this.details = details
    this.code = code
  }

  /**
   * Create a ReloadlyApiError from a fetch response
   */
  static async fromResponse(response: Response): Promise<ReloadlyApiError> {
    let details: unknown
    try {
      details = await response.json()
    } catch {
      // Use empty catch block to avoid unused variable error
      details = { text: await response.text().catch(() => "") }
    }

    const errorDetails = details as Record<string, unknown>
    return new ReloadlyApiError(
      (errorDetails.message as string) || `API request failed with status ${response.status}`,
      response.status,
      details,
      errorDetails.code as string,
    )
  }
}

// Create a named export object
const apiErrorUtils = {
  createErrorResponse,
  handleApiError,
  ReloadlyApiError,
}

export default apiErrorUtils
