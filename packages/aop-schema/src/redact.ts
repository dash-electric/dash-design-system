/**
 * Privacy redaction helpers per the AOP "Privacy" section of the spec.
 *
 * Patterns covered:
 *   sk-[A-Za-z0-9]{20,}            OpenAI key       → sk-***REDACTED
 *   ghp_[A-Za-z0-9]{20,}           GitHub token     → ghp_***REDACTED
 *   Bearer\s+[A-Za-z0-9._-]+       Auth header      → Bearer ***REDACTED
 *   email                          local-part mask  → ***@domain
 *   `.env*` snippet                drop snippet     → (handled in scan walker)
 *
 * Plus `truncate(str, n)` for the spec's "<= 4 KB / <= 2 KB / <= 8 KB" caps,
 * which appends a `…[truncated:N bytes]` marker.
 */

import type { AOPEvent, ScanEvent, ThinkingEvent } from "./types.js";

// ---------------------------------------------------------------------------
// Regex
// ---------------------------------------------------------------------------

export const OPENAI_KEY_RE = /sk-[A-Za-z0-9]{20,}/g;
export const GITHUB_TOKEN_RE = /ghp_[A-Za-z0-9]{20,}/g;
export const BEARER_RE = /Bearer\s+[A-Za-z0-9._-]+/g;
export const EMAIL_RE = /([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+\.[A-Za-z]{2,})/g;

// ---------------------------------------------------------------------------
// String-level helpers
// ---------------------------------------------------------------------------

export function redactSecrets(input: string): string {
  return input
    .replace(OPENAI_KEY_RE, "sk-***REDACTED")
    .replace(GITHUB_TOKEN_RE, "ghp_***REDACTED")
    .replace(BEARER_RE, "Bearer ***REDACTED");
}

export function redactEmails(input: string): string {
  return input.replace(EMAIL_RE, (_, _local, domain) => `***@${domain}`);
}

export function redactString(input: string): string {
  return redactEmails(redactSecrets(input));
}

/** Truncate to N bytes (UTF-8) and append `…[truncated:N bytes]` marker. */
export function truncate(input: string, maxBytes: number): string {
  if (typeof input !== "string") return input;
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  if (bytes.length <= maxBytes) return input;
  // Find safe cut point that doesn't split a multibyte char
  let cut = maxBytes;
  while (cut > 0 && (bytes[cut]! & 0b11000000) === 0b10000000) cut--;
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return `${decoder.decode(bytes.slice(0, cut))}…[truncated:${bytes.length} bytes]`;
}

// ---------------------------------------------------------------------------
// Spec field caps
// ---------------------------------------------------------------------------

export const CAP_THINKING_MD = 4 * 1024;
export const CAP_SCAN_SNIPPET = 2 * 1024;
export const CAP_VALIDATE_OUTPUT = 8 * 1024;

// ---------------------------------------------------------------------------
// Per-event redactor
// ---------------------------------------------------------------------------

function isDotEnvPath(path: string): boolean {
  // `.env`, `.env.local`, `apps/web/.env.production`, etc.
  return /(^|\/)\.env(\.|$)/.test(path) || /(^|\/)\.env$/.test(path);
}

/**
 * Returns a copy of the event with secrets, emails, and oversized fields
 * scrubbed per spec. Pure function — does not mutate input.
 */
export function redactEvent<E extends AOPEvent>(event: E): E {
  // Structured clone via JSON round-trip is safe: payloads are JSON-shaped.
  const copy = JSON.parse(JSON.stringify(event)) as AOPEvent;

  switch (copy.type) {
    case "run.start": {
      copy.payload.prompt = redactString(copy.payload.prompt);
      break;
    }
    case "thinking": {
      const p = (copy as ThinkingEvent).payload;
      p.md = truncate(redactString(p.md), CAP_THINKING_MD);
      break;
    }
    case "scan": {
      const p = (copy as ScanEvent).payload;
      const hasDotEnv = p.paths.some(isDotEnvPath);
      if (hasDotEnv) {
        delete p.snippet;
      } else if (p.snippet !== undefined) {
        p.snippet = truncate(redactString(p.snippet), CAP_SCAN_SNIPPET);
      }
      break;
    }
    case "decision": {
      copy.payload.rationale = redactString(copy.payload.rationale);
      copy.payload.candidates = copy.payload.candidates.map((cand) => ({
        ...cand,
        reason: redactString(cand.reason),
      }));
      break;
    }
    case "artifact": {
      copy.payload.diff = redactString(copy.payload.diff);
      break;
    }
    case "validate": {
      copy.payload.checks = copy.payload.checks.map((chk) =>
        chk.output === undefined
          ? chk
          : { ...chk, output: truncate(redactString(chk.output), CAP_VALIDATE_OUTPUT) },
      );
      break;
    }
    case "error": {
      copy.payload.message = redactString(copy.payload.message);
      if (copy.payload.stack !== undefined) {
        copy.payload.stack = redactString(copy.payload.stack);
      }
      break;
    }
    case "run.end":
    case "cost":
    default:
      // No free-form text — nothing to redact.
      break;
  }

  return copy as E;
}
