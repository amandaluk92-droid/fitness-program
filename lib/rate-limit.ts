/**
 * Simple in-memory token bucket rate limiter.
 * Uses a Map to track request counts per key (typically IP address).
 * Suitable for single-instance deployments; for multi-instance, use Redis.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxAttempts: number
  /** Time window in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * Check if a request is allowed under the rate limit.
 * @param key - Unique identifier (e.g. IP address or IP + route)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // First request or window expired — start new window
    store.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 })
    return { allowed: true, remaining: config.maxAttempts - 1, retryAfterSeconds: 0 }
  }

  if (entry.count < config.maxAttempts) {
    entry.count++
    return { allowed: true, remaining: config.maxAttempts - entry.count, retryAfterSeconds: 0 }
  }

  const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000)
  return { allowed: false, remaining: 0, retryAfterSeconds }
}

// Pre-configured limiters for common use cases

/** Auth endpoints: 5 attempts per 15 minutes per IP */
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 5,
  windowSeconds: 15 * 60,
}

/** General API endpoints: 100 requests per minute per IP */
export const API_RATE_LIMIT: RateLimitConfig = {
  maxAttempts: 100,
  windowSeconds: 60,
}

/**
 * Extract client IP from request headers.
 * Checks X-Forwarded-For (common behind proxies/Vercel), then X-Real-IP.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return headers.get('x-real-ip') || 'unknown'
}
