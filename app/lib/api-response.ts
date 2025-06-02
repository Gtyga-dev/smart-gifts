import { NextResponse } from "next/server"

/**
 * Standard success response structure
 */
interface SuccessResponse<T> {
  success: true
  data: T
  message?: string
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  headers?: HeadersInit,
): NextResponse<SuccessResponse<T>> {
  const successResponse: SuccessResponse<T> = {
    success: true,
    data,
  }

  if (message) successResponse.message = message

  return NextResponse.json(successResponse, { headers })
}

/**
 * Parse request body with error handling
 */
export async function parseRequestBody<T = Record<string, unknown>>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T
  } catch {
    // Use empty catch block to avoid unused variable error
    throw new Error("Invalid JSON in request body")
  }
}

/**
 * Get search parameters from a request
 */
export function getSearchParams(request: Request): URLSearchParams {
  return new URL(request.url).searchParams
}

/**
 * Validate required fields in an object
 * @throws Error if any required field is missing
 */
export function validateRequiredFields<T extends Record<string, unknown>>(data: T, requiredFields: (keyof T)[]): void {
  const missingFields = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === "",
  )

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
  }
}
