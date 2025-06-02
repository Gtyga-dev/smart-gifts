/**
 * Utility functions for API calls with retry logic and error handling
 */

// Configuration for API requests
const API_CONFIG = {
  maxRetries: 3,
  initialBackoff: 300, // ms
  maxBackoff: 5000, // ms
  timeoutDuration: 10000, // ms
}

/**
 * Enhanced fetch function with retry logic, timeout, and error handling
 */
export async function fetchWithRetry(url: string, options: RequestInit = {}, retryCount = 0): Promise<Response> {
  // Add timeout to the request
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutDuration)

  const fetchOptions = {
    ...options,
    signal: controller.signal,
  }

  try {
    const response = await fetch(url, fetchOptions)
    clearTimeout(timeoutId)

    // If the request was successful, return the response
    if (response.ok) {
      return response
    }

    // If we've reached the max retries, throw an error
    if (retryCount >= API_CONFIG.maxRetries) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      throw new Error(`Request failed with status ${response.status}: ${JSON.stringify(errorData)}`)
    }

    // Calculate backoff time with exponential increase and jitter
    const backoff = Math.min(
      API_CONFIG.initialBackoff * Math.pow(2, retryCount) + Math.random() * 100,
      API_CONFIG.maxBackoff,
    )

    // Wait for the backoff period
    await new Promise((resolve) => setTimeout(resolve, backoff))

    // Retry the request
    return fetchWithRetry(url, options, retryCount + 1)
  } catch (error) {
    clearTimeout(timeoutId)

    // If we've reached the max retries, throw the error
    if (retryCount >= API_CONFIG.maxRetries) {
      console.error(`Request to ${url} failed after ${API_CONFIG.maxRetries} retries:`, error)
      throw error
    }

    // Calculate backoff time
    const backoff = Math.min(
      API_CONFIG.initialBackoff * Math.pow(2, retryCount) + Math.random() * 100,
      API_CONFIG.maxBackoff,
    )

    // Wait for the backoff period
    await new Promise((resolve) => setTimeout(resolve, backoff))

    // Retry the request
    return fetchWithRetry(url, options, retryCount + 1)
  }
}

/**
 * Check if the application can connect to the internet
 */
export async function checkConnectivity(): Promise<boolean> {
  try {
    // Try to fetch a reliable external resource
    await fetch("https://www.google.com", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
    return true
  } catch (error) {
    console.warn("Connectivity check failed:", error)
    return false
  }
}

/**
 * Check if a specific API endpoint is reachable
 */
export async function checkApiEndpoint(url: string): Promise<boolean> {
  try {
    await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
    return true
  } catch (error) {
    console.warn(`API endpoint check failed for ${url}:`, error)
    return false
  }
}

/**
 * Log API errors with detailed information
 */
export function logApiError(endpoint: string, error: Error, context: Record<string, unknown> = {}) {
  console.error(`API Error in ${endpoint}:`, {
    message: error.message,
    cause: error.cause,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}
