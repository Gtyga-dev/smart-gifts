/**
 * Enhanced Redis client with fallback mechanisms and better error handling
 */

import { Redis } from "@upstash/redis"

// Define types for cache entries
interface CacheEntry<T> {
  value: T
  expiry: number | null
}

// Create a local in-memory cache for development fallback
const memoryCache = new Map<string, CacheEntry<unknown>>()

// Initialize Redis client
let redisClient: Redis | null = null
let redisInitialized = false
let redisConnectionError: Error | null = null

function initializeRedisClient() {
  if (redisInitialized) return

  redisInitialized = true

  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      redisClient = new Redis({
        url: process.env.KV_REST_API_URL,
        token: process.env.KV_REST_API_TOKEN,
      })
      console.log("Redis client initialized")
    } else {
      console.warn("Redis credentials not found, using in-memory cache")
    }
  } catch (error) {
    console.error("Failed to initialize Redis client:", error)
    redisConnectionError = error instanceof Error ? error : new Error(String(error))
    redisClient = null
  }
}

// Initialize Redis on module load
initializeRedisClient()

/**
 * Enhanced Redis client with fallback to in-memory cache
 */
export const redis = {
  /**
   * Get a value from Redis or fallback cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Try Redis first if available
      if (redisClient) {
        try {
          const value = await redisClient.get<T>(key)
          return value
        } catch (error) {
          console.warn(`Redis get operation failed for key ${key}, falling back to memory cache:`, error)
        }
      }

      // Fallback to memory cache
      const cachedItem = memoryCache.get(key) as CacheEntry<T> | undefined
      if (cachedItem) {
        // Check if the item has expired
        if (cachedItem.expiry && cachedItem.expiry < Date.now()) {
          memoryCache.delete(key)
          return null
        }
        return cachedItem.value as T
      }

      return null
    } catch (error) {
      console.error(`Error in redis.get for key ${key}:`, error)
      return null
    }
  },

  /**
   * Set a value in Redis or fallback cache
   */
  async set(key: string, value: unknown, options?: { ex?: number }): Promise<void> {
    try {
      // Try Redis first if available
      if (redisClient) {
        try {
          await redisClient.set(key, value, options?.ex ? { ex: options.ex } : undefined)
        } catch (error) {
          console.warn(`Redis set operation failed for key ${key}, using memory cache instead:`, error)
        }
      }

      // Always update memory cache as fallback
      const expiry = options?.ex ? Date.now() + options.ex * 1000 : null
      memoryCache.set(key, { value, expiry })
    } catch (error) {
      console.error(`Error in redis.set for key ${key}:`, error)
    }
  },

  /**
   * Delete a value from Redis or fallback cache
   */
  async del(key: string): Promise<void> {
    try {
      // Try Redis first if available
      if (redisClient) {
        try {
          await redisClient.del(key)
        } catch (error) {
          console.warn(`Redis del operation failed for key ${key}:`, error)
        }
      }

      // Always update memory cache
      memoryCache.delete(key)
    } catch (error) {
      console.error(`Error in redis.del for key ${key}:`, error)
    }
  },

  /**
   * Check if Redis is connected
   */
  async isConnected(): Promise<boolean> {
    if (!redisClient) return false

    try {
      // Try a simple ping operation
      await redisClient.ping()
      return true
    } catch (error) {
      console.warn("Redis connection check failed:", error)
      return false
    }
  },

  /**
   * Get Redis connection error if any
   */
  getConnectionError(): Error | null {
    return redisConnectionError
  },

  /**
   * Clear memory cache (useful for testing)
   */
  clearMemoryCache(): void {
    memoryCache.clear()
  },
}
