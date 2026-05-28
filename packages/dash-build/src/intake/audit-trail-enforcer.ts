/**
 * Audit-trail enforcer (CR-3).
 *
 * CR-3 (CLAUDE.md): "Audit trail mandatory for user-editable fields carrying
 * legal/financial weight (image proof, payment, signature, KYC)."
 *
 * Pure, synchronous, no I/O. Pattern-matches the prompt and the affected
 * field names against a single watch-list kept inline below so the rule is
 * auditable in one place.
 */

export type AuditTrailPattern =
  | "inline-edit-with-audit"
  | "image-editor-with-audit"
  | "custom"

export interface AuditTrailRequirement {
  required: boolean
  reason: string
  pattern: AuditTrailPattern
  fieldsToLog: string[]
}

// Bucketed watch-list — case-insensitive. Whole-word match for short tokens,
// substring for multi-word phrases.
interface KeywordBucket {
  label: string
  pattern: AuditTrailPattern
  keywords: string[]
}

const BUCKETS: KeywordBucket[] = [
  {
    label: "image/identity proof",
    pattern: "image-editor-with-audit",
    keywords: [
      "image proof",
      "photo proof",
      "foto bukti",
      "bukti foto",
      "bukti gambar",
      "signature",
      "ttd",
      "ktp",
      "npwp",
      "kyc",
      "selfie",
      "id card",
      "passport",
      "sim",
      "surat",
    ],
  },
  {
    label: "financial",
    pattern: "inline-edit-with-audit",
    keywords: [
      "payment",
      "transfer",
      "withdraw",
      "withdrawal",
      "topup",
      "top up",
      "top-up",
      "balance",
      "refund",
      "payout",
      "commission",
      "komisi",
      "fee",
      "charge",
      "invoice",
      "tagihan",
      "saldo",
      "biaya",
    ],
  },
  {
    label: "authority transition",
    pattern: "inline-edit-with-audit",
    keywords: [
      "approval",
      "approve",
      "reject",
      "rejection",
      "verification",
      "verify",
      "suspend",
      "suspension",
      "unsuspend",
      "delist",
      "blacklist",
      "activate",
      "deactivate",
      "mitra status",
      "driver status",
      "account status",
      "user status",
    ],
  },
]

// The standard log shape Dash DS blocks emit. Always logged regardless of
// pattern.
const BASE_LOG_FIELDS = [
  "originalValue",
  "newValue",
  "editor",
  "timestamp",
  "reason",
]

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function matchesKeyword(haystack: string, keyword: string): boolean {
  if (keyword.includes(" ") || /[-]/.test(keyword)) {
    return haystack.includes(keyword.toLowerCase())
  }
  const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i")
  return re.test(haystack)
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

interface BucketHit {
  bucket: KeywordBucket
  matched: string[]
}

function findBucketHits(text: string): BucketHit[] {
  const lower = text.toLowerCase()
  const hits: BucketHit[] = []
  for (const bucket of BUCKETS) {
    const matched: string[] = []
    for (const kw of bucket.keywords) {
      if (matchesKeyword(lower, kw)) matched.push(kw)
    }
    if (matched.length > 0) hits.push({ bucket, matched })
  }
  return hits
}

function fieldsExtraForBucket(bucket: KeywordBucket): string[] {
  // Image-bearing buckets push an `imageUrl` field too so the
  // image-editor-with-audit block has somewhere to write the new asset.
  if (bucket.pattern === "image-editor-with-audit") return ["imageUrl"]
  return []
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

/**
 * Split camelCase / snake_case / kebab-case identifiers so `approvalStatus`
 * tokenises to `approval status` and matches whole-word keywords.
 */
function explodeIdentifier(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
}

export function checkAuditTrailRequired(
  prompt: string,
  affectedFields: string[],
): AuditTrailRequirement {
  const exploded = affectedFields.map(explodeIdentifier)
  const combined = [prompt, ...exploded].join("\n")
  const hits = findBucketHits(combined)

  if (hits.length === 0) {
    return {
      required: false,
      reason: "No CR-3 sensitive keywords found in prompt or affected fields.",
      pattern: "inline-edit-with-audit",
      fieldsToLog: [],
    }
  }

  // Prefer image-editor pattern when any image-bearing bucket matches; else
  // inline-edit. `custom` is reserved for future overrides — never returned
  // automatically.
  const usesImagePattern = hits.some(
    (h) => h.bucket.pattern === "image-editor-with-audit",
  )
  const pattern: AuditTrailPattern = usesImagePattern
    ? "image-editor-with-audit"
    : "inline-edit-with-audit"

  const matchedLabels = hits.map((h) => h.bucket.label).join(", ")
  const matchedKeywords = hits
    .flatMap((h) => h.matched)
    .slice(0, 8)
    .join(", ")

  const fieldsToLog = new Set<string>(BASE_LOG_FIELDS)
  for (const hit of hits) {
    for (const extra of fieldsExtraForBucket(hit.bucket)) {
      fieldsToLog.add(extra)
    }
  }
  // Surface the affected field names too — generator should log them by name.
  for (const f of affectedFields) {
    if (f.trim()) fieldsToLog.add(f.trim())
  }

  return {
    required: true,
    reason: `CR-3 triggered by ${matchedLabels} keyword(s): ${matchedKeywords}.`,
    pattern,
    fieldsToLog: Array.from(fieldsToLog),
  }
}
