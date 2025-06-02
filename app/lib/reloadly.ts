import { redis } from "./redis-client"


// Token cache keys
const RELOADLY_TOKEN_KEY_PREFIX = "reloadly:token:"

type BaseUrls = Record<string, string>
const IS_SANDBOX = process.env.RELOADLY_ENVIRONMENT !== "production"

// Base URLs
const RELOADLY_BASE_URLS: BaseUrls = {
  giftcards: IS_SANDBOX
    ? "https://giftcards-sandbox.reloadly.com"
    : "https://giftcards.reloadly.com",
  topups: IS_SANDBOX
    ? "https://topups-sandbox.reloadly.com"
    : "https://topups.reloadly.com",
  utilities: IS_SANDBOX
    ? "https://utilities-sandbox.reloadly.com"
    : "https://utilities.reloadly.com",
  auth: "https://auth.reloadly.com/oauth/token",
}

// API version headers
const API_VERSION_HEADERS = {
  giftcards: "application/com.reloadly.giftcards-v1+json",
  topups: "application/com.reloadly.topups-v1+json",
  utilities: "application/com.reloadly.utilities-v1+json",
}

// Enhanced fetch helper
async function safeFetch(
  url: string,
  options: RequestInit = {},
  retries = 2
): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const resp = await fetch(url, { ...options, signal: controller.signal })
    clearTimeout(timeout)
    return resp
  } catch (err) {
    clearTimeout(timeout)
    if (retries > 0) {
      await new Promise((r) => setTimeout(r, 1000))
      return safeFetch(url, options, retries - 1)
    }
    throw err
  }
}

// Token retrieval with Redis caching
export async function getReloadlyToken(
  audience: string = RELOADLY_BASE_URLS.giftcards
): Promise<string> {
  // Attempt Redis cache first
  const tokenKey = `${RELOADLY_TOKEN_KEY_PREFIX}${audience}`
  try {
    const cached = await redis.get<string>(tokenKey)
    if (cached) return cached
  } catch {
    // ignore cache errors
  }

  const clientId = process.env.RELOADLY_CLIENT_ID
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("Missing Reloadly credentials. Set RELOADLY_CLIENT_ID and RELOADLY_CLIENT_SECRET.")
  }

  const response = await safeFetch(RELOADLY_BASE_URLS.auth, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      audience,
    }),
  })

  if (!response.ok) {
    const errText = await response.text().catch(() => response.statusText)
    throw new Error(`Reloadly token fetch failed: ${response.status} ${errText}`)
  }

  const data = await response.json()
  const accessToken = data.access_token
  const expiresIn = data.expires_in || 3600

  // Cache token with buffer
  try {
    await redis.set(tokenKey, accessToken, { ex: Math.max(expiresIn - 300, 60) })
  } catch {
    // ignore
  }

  return accessToken
}

// Balance fetch
export async function getReloadlyBalance(
  baseUrl: string = RELOADLY_BASE_URLS.giftcards
): Promise<{ balance: number; currencyCode: string }> {
  const token = await getReloadlyToken(baseUrl)
  const resp = await safeFetch(`${baseUrl}/accounts/balance`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  })
  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText)
    throw new Error(`Balance fetch failed: ${resp.status} ${err}`)
  }
  return resp.json()
}

// Generic GET
export async function reloadlyApiGet<T>(
  endpoint: string,
  baseUrl: string = RELOADLY_BASE_URLS.giftcards,
  params: Record<string, string> = {}
): Promise<T> {
  const token = await getReloadlyToken(baseUrl)
  const url = new URL(baseUrl + endpoint)
  Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v))
  const resp = await safeFetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}`, Accept: API_VERSION_HEADERS.giftcards },
  })
  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText)
    throw new Error(`API GET failed: ${resp.status} ${err}`)
  }
  return resp.json()
}

// Generic POST
export async function reloadlyApiPost<T>(
  endpoint: string,
  body: Record<string, unknown>,
  baseUrl: string = RELOADLY_BASE_URLS.giftcards
): Promise<T> {
  const token = await getReloadlyToken(baseUrl)
  const resp = await safeFetch(baseUrl + endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: API_VERSION_HEADERS.giftcards,
    },
    body: JSON.stringify(body),
  })
  if (!resp.ok) {
    const err = await resp.text().catch(() => resp.statusText)
    throw new Error(`API POST failed: ${resp.status} ${err}`)
  }
  return resp.json()
}

// Export environment info
export const reloadlyEnv = {
  isSandbox: IS_SANDBOX,
  baseUrls: RELOADLY_BASE_URLS,
  apiVersionHeaders: API_VERSION_HEADERS,
}
