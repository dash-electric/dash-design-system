import { NextRequest, NextResponse } from "next/server"

/**
 * Sliding-window rate limiter for the Dash registry API.
 *
 * Two adapters with the same Limiter interface:
 *   - InMemoryLimiter (default) — Map<key, timestamps[]> in module scope.
 *     Fine for single-process dev + small Vercel deployments where edge
 *     replicas are colocated. Memory clears on cold start (acceptable).
 *   - UpstashLimiter (lazy import) — used when UPSTASH_REDIS_REST_URL +
 *     UPSTASH_REDIS_REST_TOKEN env vars are set. Provides cross-replica
 *     correctness for production.
 *
 * Two limits applied per request:
 *   - perIp:    60 req / 60s   (DDoS amplification protection)
 *   - perToken: 1000 req / 1h  (per-Bearer abuse cap)
 *
 * Both limits are evaluated on every gated request. A request is allowed
 * only when BOTH pass. The tighter window remaining time is returned in
 * the Retry-After header on 429.
 *
 * Failure mode: if the limiter itself throws, requests are ALLOWED
 * (fail-open). The alternative — locking out all users on a Redis outage
 * — is worse for an internal-only deployment.
 */

type LimitResult = {
  allowed: boolean
  /** Seconds until the window resets. Always >= 0. */
  retryAfter: number
  /** Remaining requests in the current window. */
  remaining: number
  /** Total window cap. */
  limit: number
}

interface Limiter {
  check(key: string, limit: number, windowSeconds: number): Promise<LimitResult>
}

/* -------------------------------------------------------------------------- */
/* In-memory adapter — default                                                 */
/* -------------------------------------------------------------------------- */

const memoryBuckets = new Map<string, number[]>()

class InMemoryLimiter implements Limiter {
  async check(key: string, limit: number, windowSeconds: number): Promise<LimitResult> {
    const now = Date.now()
    const windowMs = windowSeconds * 1000
    const cutoff = now - windowMs

    const existing = memoryBuckets.get(key) ?? []
    // Drop timestamps outside the window.
    const fresh = existing.filter((t) => t > cutoff)

    if (fresh.length >= limit) {
      const oldest = fresh[0]
      const retryAfter = Math.ceil((oldest + windowMs - now) / 1000)
      memoryBuckets.set(key, fresh)
      return { allowed: false, retryAfter: Math.max(retryAfter, 1), remaining: 0, limit }
    }

    fresh.push(now)
    memoryBuckets.set(key, fresh)

    // Opportunistic cleanup — once every ~1k requests, prune stale buckets.
    if (memoryBuckets.size > 1000 && Math.random() < 0.01) {
      for (const [k, ts] of memoryBuckets.entries()) {
        const recent = ts.filter((t) => t > cutoff)
        if (recent.length === 0) memoryBuckets.delete(k)
        else memoryBuckets.set(k, recent)
      }
    }

    return {
      allowed: true,
      retryAfter: 0,
      remaining: limit - fresh.length,
      limit,
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Upstash Redis adapter — used when env vars are present                      */
/* -------------------------------------------------------------------------- */

class UpstashLimiter implements Limiter {
  constructor(
    private readonly url: string,
    private readonly token: string,
  ) {}

  async check(key: string, limit: number, windowSeconds: number): Promise<LimitResult> {
    // Sorted-set sliding window via pipelined commands.
    // ZADD <key> <now> <now>
    // ZREMRANGEBYSCORE <key> 0 <cutoff>
    // ZCARD <key>
    // EXPIRE <key> <windowSeconds>
    const now = Date.now()
    const cutoff = now - windowSeconds * 1000

    const pipeline = [
      ["ZREMRANGEBYSCORE", key, "0", String(cutoff)],
      ["ZADD", key, String(now), `${now}-${Math.random().toString(36).slice(2, 8)}`],
      ["ZCARD", key],
      ["EXPIRE", key, String(windowSeconds + 5)],
    ]

    const res = await fetch(`${this.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
      // 1s timeout — short window so the request can fall through if
      // Upstash is slow/down. The fail-open in checkRateLimit covers it.
      signal: AbortSignal.timeout(1000),
    })

    if (!res.ok) {
      throw new Error(`Upstash error: ${res.status}`)
    }

    const data = (await res.json()) as Array<{ result: number | string }>
    const count = Number(data[2]?.result ?? 0)

    if (count > limit) {
      return {
        allowed: false,
        retryAfter: windowSeconds, // Best-effort — real value would need ZRANGE.
        remaining: 0,
        limit,
      }
    }

    return {
      allowed: true,
      retryAfter: 0,
      remaining: Math.max(0, limit - count),
      limit,
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Adapter factory + public API                                                */
/* -------------------------------------------------------------------------- */

function getLimiter(): Limiter {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    return new UpstashLimiter(url, token)
  }
  return new InMemoryLimiter()
}

const limiter = getLimiter()

/**
 * Limit policy — picked to match a 10-user internal deployment.
 * Adjust here when team grows past 30 users or traffic 10x.
 */
const POLICY = {
  perIp: { limit: 60, windowSeconds: 60 },
  perToken: { limit: 1000, windowSeconds: 3600 },
} as const

function getClientIp(req: NextRequest): string {
  // Vercel populates x-forwarded-for; first value is the client.
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

function getTokenFingerprint(req: NextRequest): string | null {
  const header = req.headers.get("authorization") ?? ""
  const m = /^Bearer\s+(.+)$/i.exec(header.trim())
  if (!m) return null
  // Use the token's last 8 chars as the rate-limit bucket key.
  // Avoids the bucket key carrying the full secret in memory/logs.
  const token = m[1].trim()
  return token.length >= 8 ? token.slice(-8) : token
}

/**
 * Check both IP + token rate limits. Returns null if allowed, or a
 * NextResponse(429) ready to return if blocked. Fail-open on errors.
 */
export async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const ip = getClientIp(req)
  const tokenFp = getTokenFingerprint(req)

  try {
    // IP check
    const ipResult = await limiter.check(
      `dash:rl:ip:${ip}`,
      POLICY.perIp.limit,
      POLICY.perIp.windowSeconds,
    )
    if (!ipResult.allowed) {
      return rateLimitedResponse(ipResult, "ip")
    }

    // Token check (only if Bearer present — anonymous requests already
    // blocked by auth gate, but defense in depth).
    if (tokenFp) {
      const tokenResult = await limiter.check(
        `dash:rl:tok:${tokenFp}`,
        POLICY.perToken.limit,
        POLICY.perToken.windowSeconds,
      )
      if (!tokenResult.allowed) {
        return rateLimitedResponse(tokenResult, "token")
      }
    }
  } catch (err) {
    // Fail-open — log + allow.
    console.warn("[rate-limit] check failed (fail-open):", err)
    return null
  }

  return null
}

function rateLimitedResponse(result: LimitResult, scope: "ip" | "token"): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      scope,
      retry_after_seconds: result.retryAfter,
      hint:
        scope === "ip"
          ? `Throttle per-IP exceeded (${result.limit}/${POLICY.perIp.windowSeconds}s).`
          : `Throttle per-token exceeded (${result.limit}/${POLICY.perToken.windowSeconds}s).`,
    },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfter),
        "X-RateLimit-Limit": String(result.limit),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Scope": scope,
      },
    },
  )
}
