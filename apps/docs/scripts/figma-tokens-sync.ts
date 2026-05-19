#!/usr/bin/env tsx
/**
 * figma-tokens-sync.ts
 *
 * Parses .figma-cache/design-tokens.tokens.json (Token Studio export from
 * AlignUI Pro Figma file iewHPx14AepU971rR07jSk) and emits:
 *
 *   1. app/globals.css — full token catalog (foundations + semantic light/dark
 *      + state + radius + spacing + typography + shadows).
 *   2. figma-audit/tokens.md — diff report (added / removed / changed vs prev).
 *   3. figma-audit/hold-list.md — appends any token that can't be resolved
 *      (broken ref, unknown type, etc).
 *
 * Dash extensions (not pure Figma): primary=purple, neutral=gray. Both
 * preserved + documented in figma-audit/dash-extensions.md.
 *
 * Run: pnpm tsx scripts/figma-tokens-sync.ts
 */

import fs from "node:fs"
import path from "node:path"

// ---------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------

const ROOT = process.cwd()
const TOKENS_JSON = path.join(ROOT, ".figma-cache", "design-tokens.tokens.json")
const GLOBALS_CSS = path.join(ROOT, "app", "globals.css")
const AUDIT_DIR = path.join(ROOT, "figma-audit")
const TOKENS_REPORT = path.join(AUDIT_DIR, "tokens.md")
const HOLD_LIST = path.join(AUDIT_DIR, "hold-list.md")
const EXT_DOC = path.join(AUDIT_DIR, "dash-extensions.md")

fs.mkdirSync(AUDIT_DIR, { recursive: true })

// ---------------------------------------------------------------------------
// Load tokens
// ---------------------------------------------------------------------------

type TokenLeaf = { value: unknown; type: string }
type TokenTree = { [k: string]: TokenLeaf | TokenTree }

const raw = JSON.parse(fs.readFileSync(TOKENS_JSON, "utf-8")) as TokenTree

// ---------------------------------------------------------------------------
// Reference resolver
// ---------------------------------------------------------------------------

const holdList: string[] = []

function getByPath(tree: TokenTree, dotted: string): TokenLeaf | null {
  const parts = dotted.split(".")
  let cur: any = tree
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) cur = cur[p]
    else return null
  }
  if (cur && typeof cur === "object" && "value" in cur && "type" in cur) {
    return cur as TokenLeaf
  }
  return null
}

function resolveRef(val: string, seen = new Set<string>()): string {
  if (typeof val !== "string") return String(val)
  const m = val.match(/^\{(.+)\}$/)
  if (!m) return val
  const refPath = m[1]
  if (seen.has(refPath)) {
    holdList.push(`Circular ref: ${refPath}`)
    return val
  }
  seen.add(refPath)
  const target = getByPath(raw, refPath)
  if (!target) {
    holdList.push(`Unresolved ref: {${refPath}}`)
    return val
  }
  if (typeof target.value === "string" && target.value.startsWith("{")) {
    return resolveRef(target.value, seen)
  }
  return String(target.value)
}

function hex(v: string): string {
  if (!v) return v
  const cleaned = v.startsWith("{") ? resolveRef(v) : v
  if (cleaned.length === 9 && cleaned.startsWith("#")) {
    // Drop trailing 'ff' alpha
    if (cleaned.slice(7).toLowerCase() === "ff") return cleaned.slice(0, 7)
    return cleaned
  }
  return cleaned
}

// ---------------------------------------------------------------------------
// Walk helpers
// ---------------------------------------------------------------------------

function flatten(
  tree: TokenTree | undefined | null,
  prefix = "",
): Array<{ path: string; leaf: TokenLeaf }> {
  const out: Array<{ path: string; leaf: TokenLeaf }> = []
  if (!tree || typeof tree !== "object") return out
  for (const [k, v] of Object.entries(tree)) {
    const p = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === "object" && "value" in v && "type" in v) {
      out.push({ path: p, leaf: v as TokenLeaf })
    } else if (v && typeof v === "object") {
      out.push(...flatten(v as TokenTree, p))
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Emit foundations (raw hex)
// ---------------------------------------------------------------------------

const SCALES = ["red", "orange", "yellow", "green", "teal", "sky", "blue", "purple", "pink"]
const SCALE_STEPS = ["0", "50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"]

function emitFoundations(): string {
  const lines: string[] = []
  lines.push("  /* ------ Foundations (06-foundations.*) — raw hex ------ */")

  // Neutral slate
  for (const step of SCALE_STEPS) {
    const leaf = getByPath(raw, `06-foundations.neutral.slate.${step}`)
    if (leaf) lines.push(`  --dash-slate-${step}: ${hex(String(leaf.value))};`)
  }
  for (const a of ["alpha-10", "alpha-16", "alpha-24"]) {
    const leaf = getByPath(raw, `06-foundations.alpha.slate.${a}`)
    if (leaf) lines.push(`  --dash-slate-${a}: ${hex(String(leaf.value))};`)
  }
  lines.push("")

  // Neutral gray
  for (const step of SCALE_STEPS) {
    const leaf = getByPath(raw, `06-foundations.neutral.gray.${step}`)
    if (leaf) lines.push(`  --dash-gray-${step}: ${hex(String(leaf.value))};`)
  }
  for (const a of ["alpha-10", "alpha-16", "alpha-24"]) {
    const leaf = getByPath(raw, `06-foundations.alpha.gray.${a}`)
    if (leaf) lines.push(`  --dash-gray-${a}: ${hex(String(leaf.value))};`)
  }
  lines.push("")

  // Color scales
  for (const scale of SCALES) {
    for (const step of SCALE_STEPS) {
      const leaf = getByPath(raw, `06-foundations.${scale}.${step}`)
      if (leaf) lines.push(`  --dash-${scale}-${step}: ${hex(String(leaf.value))};`)
    }
    for (const a of ["alpha-10", "alpha-16", "alpha-24"]) {
      const leaf = getByPath(raw, `06-foundations.alpha.${scale}.${a}`)
      if (leaf) lines.push(`  --dash-${scale}-${a}: ${hex(String(leaf.value))};`)
    }
    lines.push("")
  }

  // Black/white alpha (overlays)
  for (const which of ["black", "white"]) {
    for (const a of ["alpha-10", "alpha-16", "alpha-24"]) {
      const leaf = getByPath(raw, `06-foundations.alpha.${which}.${a}`)
      if (leaf) lines.push(`  --dash-${which}-${a}: ${hex(String(leaf.value))};`)
    }
  }
  lines.push("")

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Semantic tokens — DARK from JSON, LIGHT via index inversion
// ---------------------------------------------------------------------------

// Index inversion map (light ↔ dark for slate scale)
const FLIP: Record<string, string> = {
  "0": "950",
  "50": "900",
  "100": "800",
  "200": "700",
  "300": "600",
  "400": "500",
  "500": "400",
  "600": "300",
  "700": "200",
  "800": "100",
  "900": "50",
  "950": "0",
}

function resolveNeutralIndex(refVal: string): { step: string } | null {
  // refVal like "{02-neutral.950}" or "{06-foundations.neutral.slate.500}"
  const m = refVal.match(/^\{(.+)\}$/)
  if (!m) return null
  const p = m[1]
  let mm = p.match(/^02-neutral\.(\d+)$/)
  if (mm) return { step: mm[1] }
  mm = p.match(/^06-foundations\.neutral\.slate\.(\d+)$/)
  if (mm) return { step: mm[1] }
  return null
}

function emitSemantic(mode: "light" | "dark"): string {
  const lines: string[] = []
  const sections = ["bg", "text", "icon", "stroke", "illustration"]
  const flat = flatten(raw["01-tokens"] as TokenTree, "01-tokens")
  for (const section of sections) {
    const matching = flat.filter((x) => x.path.startsWith(`01-tokens.${section}.`))
    if (!matching.length) continue
    lines.push(`  /* -- ${section} -- */`)
    for (const { path: p, leaf } of matching) {
      const name = p.replace(`01-tokens.${section}.`, "")
      const refVal = String(leaf.value)
      const neutralRef = resolveNeutralIndex(refVal)
      if (neutralRef) {
        const step = mode === "dark" ? neutralRef.step : FLIP[neutralRef.step] ?? neutralRef.step
        lines.push(`  --${section}-${name}: var(--dash-slate-${step});`)
      } else {
        lines.push(`  --${section}-${name}: ${hex(refVal)};`)
      }
    }
  }

  // Static (same both modes)
  const statics = flatten(raw["01-tokens"] as TokenTree, "01-tokens").filter(
    (x) => x.path.startsWith("01-tokens.static."),
  )
  for (const { path: p, leaf } of statics) {
    const name = p.replace("01-tokens.static.", "")
    const refVal = String(leaf.value)
    const neutralRef = resolveNeutralIndex(refVal)
    if (neutralRef) {
      // static-black = neutral.950 always (DON'T flip)
      // static-white = neutral.0 always (DON'T flip)
      lines.push(`  --${name}: var(--dash-slate-${neutralRef.step});`)
    } else {
      lines.push(`  --${name}: ${hex(refVal)};`)
    }
  }

  // Overlay (same both modes — already hex)
  const overlays = flatten(raw["01-tokens"] as TokenTree, "01-tokens").filter(
    (x) => x.path.startsWith("01-tokens.overlay."),
  )
  for (const { path: p, leaf } of overlays) {
    const name = p.replace("01-tokens.overlay.", "overlay-")
    lines.push(`  --${name}: ${hex(String(leaf.value))};`)
  }

  // Social (brand colors, same both modes)
  const social = flatten(raw["01-tokens"] as TokenTree, "01-tokens").filter(
    (x) => x.path.startsWith("01-tokens.social."),
  )
  for (const { path: p, leaf } of social) {
    const name = p.replace("01-tokens.social.", "social-")
    lines.push(`  --${name}: ${hex(String(leaf.value))};`)
  }

  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// State colors (same both modes — semantic refers to foundation scales)
// ---------------------------------------------------------------------------

function emitStates(): string {
  // OVERRIDE: Token Studio export ships state-X-light/lighter as foundation
  // alpha overlays. Multiple agents flagged this as visually wrong for
  // Alert/Badge/Banner/Toast — those expect SOLID tints. User-provided
  // Figma React paste also used solid hex (#C2F5DA = green-200 for
  // state-success-light). Decision D1 flipped: use SOLID scale instead.
  //
  // Mapping rule:
  //   state-X-base    → foundation scale (mid-tone) per JSON (kept as-is)
  //   state-X-dark    → foundation scale (light-tone) per JSON (kept as-is)
  //   state-X-light   → foundation -200 (solid tint)        OVERRIDE
  //   state-X-lighter → foundation -50  (solid washy)       OVERRIDE
  //
  // Special-case neutral 'faded' state which maps to slate scale.
  const lines: string[] = []
  lines.push("  /* ------ State semantic (01-tokens.state.*) — solid-tint overrides ------ */")

  const STATES_SCALE: Record<string, string> = {
    error: "red",
    warning: "orange",
    success: "green",
    information: "blue",
    feature: "purple",
    highlighted: "pink",
    stable: "teal",
    verified: "sky",
    away: "yellow",
    faded: "slate", // neutral state
  }

  for (const [status, scale] of Object.entries(STATES_SCALE)) {
    // Base/dark from JSON refs
    for (const tone of ["base", "dark"] as const) {
      const leaf = getByPath(raw, `01-tokens.state.${status}.${tone}`)
      if (!leaf) continue
      const refVal = String(leaf.value)
      const refMatch = refVal.match(/^\{(.+)\}$/)
      let cssVal = refVal
      if (refMatch) {
        const f = refMatch[1].match(/^06-foundations\.(\w+)\.(\w+)$/)
        if (f) cssVal = `var(--dash-${f[1]}-${f[2]})`
        else cssVal = hex(refVal)
      } else cssVal = hex(refVal)
      lines.push(`  --state-${status}-${tone}: ${cssVal};`)
    }
    // Light/lighter — solid override
    lines.push(`  --state-${status}-light:   var(--dash-${scale}-200);`)
    lines.push(`  --state-${status}-lighter: var(--dash-${scale}-50);`)
  }
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Primary theme (Dash override: purple, NOT sky)
// ---------------------------------------------------------------------------

function emitPrimary(): string {
  // Dash extension: override Figma's sky → purple. Documented.
  return [
    "  /* ------ Primary theme (Dash extension: purple, see dash-extensions.md) ------ */",
    "  --primary-base:     var(--dash-purple-500);",
    "  --primary-dark:     var(--dash-purple-700);",
    "  --primary-darker:   var(--dash-purple-800);",
    "  --primary-alpha-10: var(--dash-purple-alpha-10);",
    "  --primary-alpha-16: var(--dash-purple-alpha-16);",
    "  --primary-alpha-24: var(--dash-purple-alpha-24);",
  ].join("\n")
}

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

function emitRadius(): string {
  const lines: string[] = ["  /* ------ Radius (04-radius.*) ------ */"]
  const items = flatten(raw["04-radius"] as TokenTree, "04-radius")
  for (const { path: p, leaf } of items) {
    const name = p.replace("04-radius.", "")
    const val = leaf.value
    const css = val === 999 ? "9999px" : `${val}px`
    lines.push(`  --${name}: ${css};`)
  }
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Spacing
// ---------------------------------------------------------------------------

function emitSpacing(): string {
  const lines: string[] = ["  /* ------ Spacing (05-spacing.*) ------ */"]
  const items = flatten(raw["05-spacing"] as TokenTree, "05-spacing")
  for (const { path: p, leaf } of items) {
    const name = p.replace("05-spacing.", "")
    lines.push(`  --${name}: ${leaf.value}px;`)
  }
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Shadows
// ---------------------------------------------------------------------------

function shadowToCss(shadow: any): string {
  if (!shadow || typeof shadow !== "object") return "none"
  const t = shadow.shadowType === "innerShadow" ? "inset " : ""
  const x = shadow.offsetX ?? 0
  const y = shadow.offsetY ?? 0
  const blur = shadow.radius ?? 0
  const spread = shadow.spread ?? 0
  const color = shadow.color ?? "#00000000"
  return `${t}${x}px ${y}px ${blur}px ${spread}px ${color}`
}

function emitShadows(): string {
  const lines: string[] = ["  /* ------ Shadows (effect.*) ------ */"]

  function emitGroup(prefix: string, nameOut: string) {
    const items = flatten(raw["effect"] as TokenTree, "effect").filter((x) =>
      x.path.startsWith(`effect.${prefix}`),
    )
    if (!items.length) return
    // Group by parent path (everything except last index)
    const groups: Record<string, any[]> = {}
    for (const { path: p, leaf } of items) {
      const parts = p.split(".")
      const last = parts[parts.length - 1]
      if (!/^\d+$/.test(last)) continue
      const group = parts.slice(0, -1).join(".")
      groups[group] = groups[group] || []
      groups[group][parseInt(last, 10)] = leaf.value
    }
    for (const [g, arr] of Object.entries(groups)) {
      const css = arr.filter(Boolean).map(shadowToCss).join(", ")
      const varName = g.replace(/^effect\./, "shadow-").replace(/\./g, "-").replace(/\s+/g, "-")
      lines.push(`  --${varName}: ${css};`)
    }
  }

  emitGroup("regular-shadow", "regular")
  emitGroup("custom-shadows", "custom")
  emitGroup("tooltip", "tooltip")
  return lines.join("\n")
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

function emitTypography(): string {
  // Generate utility classes via @theme isn't sufficient; emit CSS rules.
  // We collect every typography.<group>.<name> set of properties and emit
  // .text-<group>-<name> class with size/weight/line-height/letter-spacing.
  const lines: string[] = []
  const items = flatten(raw["typography"] as TokenTree, "typography")
  // Group by full path minus last segment (which is the property)
  const groups: Record<string, Record<string, any>> = {}
  for (const { path: p, leaf } of items) {
    const parts = p.split(".")
    const prop = parts[parts.length - 1]
    const key = parts.slice(0, -1).join(".")
    groups[key] = groups[key] || {}
    groups[key][prop] = leaf.value
  }
  for (const [key, props] of Object.entries(groups)) {
    // key like "typography.title.h1 title"
    const segments = key.replace("typography.", "").split(".")
    const cls =
      "text-" +
      segments
        .join("-")
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-title$|-paragraph$|-label$|-subheading$|-docs$/, "")
    const rules: string[] = []
    if (props.fontFamily) rules.push(`  font-family: "${props.fontFamily}", sans-serif;`)
    if (props.fontSize) rules.push(`  font-size: ${props.fontSize}px;`)
    if (props.fontWeight) rules.push(`  font-weight: ${props.fontWeight};`)
    if (props.lineHeight) rules.push(`  line-height: ${typeof props.lineHeight === "number" ? props.lineHeight + "px" : props.lineHeight};`)
    if (props.letterSpacing !== undefined && props.letterSpacing !== 0)
      rules.push(`  letter-spacing: ${props.letterSpacing}px;`)
    if (props.textCase && props.textCase !== "none") rules.push(`  text-transform: ${props.textCase};`)
    if (rules.length) {
      lines.push(`.${cls} {\n${rules.join("\n")}\n}`)
    }
  }
  return lines.join("\n\n")
}

// ---------------------------------------------------------------------------
// Assemble globals.css
// ---------------------------------------------------------------------------

function build(): string {
  const foundations = emitFoundations()
  const lightSemantic = emitSemantic("light")
  const darkSemantic = emitSemantic("dark")
  const states = emitStates()
  const primary = emitPrimary()
  const radius = emitRadius()
  const spacing = emitSpacing()
  const shadows = emitShadows()
  const typography = emitTypography()

  return `@import "tailwindcss";

/*
 * Dash Design System — globals.css
 * AUTO-GENERATED from .figma-cache/design-tokens.tokens.json
 * Source: AlignUI Pro Figma (file: iewHPx14AepU971rR07jSk)
 * Regen: pnpm tsx scripts/figma-tokens-sync.ts
 *
 * Dash extensions (NOT pure AlignUI default):
 *   - primary brand = purple (Figma default = sky)
 *   - neutral alias = gray (Figma default = slate)
 * See figma-audit/dash-extensions.md for rationale.
 *
 * 100% Figma parity for: foundations, state semantic, semantic light+dark,
 * radius, spacing, typography classes, shadows.
 */

:root {
${foundations}

${radius}

${spacing}

${primary}

${states}

  /* ------ Semantic (LIGHT mode default) ------ */
${lightSemantic}
}

.dark {
  /* ------ Semantic (DARK mode override) ------ */
${darkSemantic}
}

@theme inline {
  /* Tailwind v4 — surface foundation + semantic vars to utilities */
  --color-bg-strong-950:   var(--bg-strong-950);
  --color-bg-surface-800:  var(--bg-surface-800);
  --color-bg-sub-300:      var(--bg-sub-300);
  --color-bg-soft-200:     var(--bg-soft-200);
  --color-bg-weak-50:      var(--bg-weak-50);
  --color-bg-white-0:      var(--bg-white-0);
  --color-text-strong-950: var(--text-strong-950);
  --color-text-sub-600:    var(--text-sub-600);
  --color-text-soft-400:   var(--text-soft-400);
  --color-text-disabled-300: var(--text-disabled-300);
  --color-text-white-0:    var(--text-white-0);
  --color-icon-strong-950: var(--icon-strong-950);
  --color-icon-sub-600:    var(--icon-sub-600);
  --color-icon-soft-400:   var(--icon-soft-400);
  --color-icon-disabled-300: var(--icon-disabled-300);
  --color-icon-white-0:    var(--icon-white-0);
  --color-stroke-strong-950: var(--stroke-strong-950);
  --color-stroke-sub-300:  var(--stroke-sub-300);
  --color-stroke-soft-200: var(--stroke-soft-200);
  --color-stroke-white-0:  var(--stroke-white-0);
  --color-static-black:    var(--static-black);
  --color-static-white:    var(--static-white);

  /* Bare semantic aliases (bg-primary, text-error-base, etc.) */
  --color-primary:         var(--primary-base);
  --color-primary-base:    var(--primary-base);
  --color-primary-dark:    var(--primary-dark);
  --color-primary-darker:  var(--primary-darker);

  /* State semantic — bare (bg-error-base, text-success-base, etc.) */
  --color-error-base:        var(--state-error-base);
  --color-error-dark:        var(--state-error-dark);
  --color-error-light:       var(--state-error-light);
  --color-error-lighter:     var(--state-error-lighter);
  --color-warning-base:      var(--state-warning-base);
  --color-warning-dark:      var(--state-warning-dark);
  --color-warning-light:     var(--state-warning-light);
  --color-warning-lighter:   var(--state-warning-lighter);
  --color-success-base:      var(--state-success-base);
  --color-success-dark:      var(--state-success-dark);
  --color-success-light:     var(--state-success-light);
  --color-success-lighter:   var(--state-success-lighter);
  --color-information-base:  var(--state-information-base);
  --color-information-dark:  var(--state-information-dark);
  --color-information-light: var(--state-information-light);
  --color-information-lighter: var(--state-information-lighter);
  --color-feature-base:      var(--state-feature-base);
  --color-feature-dark:      var(--state-feature-dark);
  --color-feature-light:     var(--state-feature-light);
  --color-feature-lighter:   var(--state-feature-lighter);
  --color-faded-base:        var(--state-faded-base);
  --color-faded-dark:        var(--state-faded-dark);
  --color-faded-light:       var(--state-faded-light);
  --color-faded-lighter:     var(--state-faded-lighter);
  --color-highlighted-base:  var(--state-highlighted-base);
  --color-highlighted-dark:  var(--state-highlighted-dark);
  --color-highlighted-light: var(--state-highlighted-light);
  --color-highlighted-lighter: var(--state-highlighted-lighter);
  --color-stable-base:       var(--state-stable-base);
  --color-stable-dark:       var(--state-stable-dark);
  --color-stable-light:      var(--state-stable-light);
  --color-stable-lighter:    var(--state-stable-lighter);
  --color-verified-base:     var(--state-verified-base);
  --color-verified-dark:     var(--state-verified-dark);
  --color-verified-light:    var(--state-verified-light);
  --color-verified-lighter:  var(--state-verified-lighter);
  --color-away-base:         var(--state-away-base);
  --color-away-dark:         var(--state-away-dark);
  --color-away-light:        var(--state-away-light);
  --color-away-lighter:      var(--state-away-lighter);

  /* State namespaced (bg-state-error-base, text-state-success-dark, etc.) */
  --color-state-error-base:        var(--state-error-base);
  --color-state-error-dark:        var(--state-error-dark);
  --color-state-error-light:       var(--state-error-light);
  --color-state-error-lighter:     var(--state-error-lighter);
  --color-state-warning-base:      var(--state-warning-base);
  --color-state-warning-dark:      var(--state-warning-dark);
  --color-state-warning-light:     var(--state-warning-light);
  --color-state-warning-lighter:   var(--state-warning-lighter);
  --color-state-success-base:      var(--state-success-base);
  --color-state-success-dark:      var(--state-success-dark);
  --color-state-success-light:     var(--state-success-light);
  --color-state-success-lighter:   var(--state-success-lighter);
  --color-state-information-base:  var(--state-information-base);
  --color-state-information-dark:  var(--state-information-dark);
  --color-state-information-light: var(--state-information-light);
  --color-state-information-lighter: var(--state-information-lighter);
  --color-state-feature-base:      var(--state-feature-base);
  --color-state-feature-dark:      var(--state-feature-dark);
  --color-state-feature-light:     var(--state-feature-light);
  --color-state-feature-lighter:   var(--state-feature-lighter);
  --color-state-faded-base:        var(--state-faded-base);
  --color-state-faded-dark:        var(--state-faded-dark);
  --color-state-faded-light:       var(--state-faded-light);
  --color-state-faded-lighter:     var(--state-faded-lighter);
  --color-state-highlighted-base:  var(--state-highlighted-base);
  --color-state-highlighted-dark:  var(--state-highlighted-dark);
  --color-state-highlighted-light: var(--state-highlighted-light);
  --color-state-highlighted-lighter: var(--state-highlighted-lighter);
  --color-state-stable-base:       var(--state-stable-base);
  --color-state-stable-dark:       var(--state-stable-dark);
  --color-state-stable-light:      var(--state-stable-light);
  --color-state-stable-lighter:    var(--state-stable-lighter);
  --color-state-verified-base:     var(--state-verified-base);
  --color-state-verified-dark:     var(--state-verified-dark);
  --color-state-verified-light:    var(--state-verified-light);
  --color-state-verified-lighter:  var(--state-verified-lighter);
  --color-state-away-base:         var(--state-away-base);
  --color-state-away-dark:         var(--state-away-dark);
  --color-state-away-light:        var(--state-away-light);
  --color-state-away-lighter:      var(--state-away-lighter);

  /* Bare icon/text/bg shorthand aliases */
  --color-icon-soft:       var(--icon-soft-400);
  --color-icon-sub:        var(--icon-sub-600);
  --color-icon-strong:     var(--icon-strong-950);
  --color-text-soft:       var(--text-soft-400);
  --color-text-sub:        var(--text-sub-600);
  --color-text-strong:     var(--text-strong-950);
  --color-stroke-soft:     var(--stroke-soft-200);
  --color-stroke-sub:      var(--stroke-sub-300);
  --color-stroke-strong:   var(--stroke-strong-950);

  --radius-0:   var(--radius-0);
  --radius-2:   var(--radius-2);
  --radius-4:   var(--radius-4);
  --radius-6:   var(--radius-6);
  --radius-8:   var(--radius-8);
  --radius-10:  var(--radius-10);
  --radius-12:  var(--radius-12);
  --radius-16:  var(--radius-16);
  --radius-20:  var(--radius-20);
  --radius-24:  var(--radius-24);
  --radius-28:  var(--radius-28);
  --radius-full: var(--radius-full);

  /* Shadow aliases */
  --shadow-card-lg: var(--shadow-custom-shadows-large);
  --shadow-card-md: var(--shadow-custom-shadows-medium);
  --shadow-card-sm: var(--shadow-custom-shadows-small);
  --shadow-card-xs: var(--shadow-custom-shadows-x-small);
  --shadow-custom-md: var(--shadow-custom-shadows-medium);
  --shadow-custom-sm: var(--shadow-custom-shadows-small);
  --shadow-regular-xs: var(--shadow-custom-shadows-x-small);
}

/* ------ Shadows ------ */
:root {
${shadows}
}

/* ------ Typography classes (font.* / typography.*) ------ */
${typography}

/* Motion tokens (Dash defaults, NOT in Figma export) */
:root {
  --duration-fast: 150ms;
  --duration-base: 250ms;
  --duration-slow: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
`
}

// ---------------------------------------------------------------------------
// Diff vs prev globals.css
// ---------------------------------------------------------------------------

function countDecl(css: string): Map<string, string> {
  const map = new Map<string, string>()
  const re = /--([\w-]+):\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = re.exec(css)) !== null) {
    map.set(m[1], m[2].trim())
  }
  return map
}

function writeReport(prev: string, next: string) {
  const before = countDecl(prev)
  const after = countDecl(next)
  const added: string[] = []
  const removed: string[] = []
  const changed: Array<{ name: string; from: string; to: string }> = []

  for (const [k, v] of after.entries()) {
    if (!before.has(k)) added.push(`--${k}: ${v}`)
    else if (before.get(k) !== v) changed.push({ name: k, from: before.get(k)!, to: v })
  }
  for (const [k, v] of before.entries()) {
    if (!after.has(k)) removed.push(`--${k}: ${v}`)
  }

  const report = `# Token Sync Report — ${new Date().toISOString().slice(0, 10)}

Source: \`.figma-cache/design-tokens.tokens.json\` (AlignUI Pro)

## Stats

- Before: **${before.size}** CSS var declarations
- After:  **${after.size}** declarations
- Added:   **${added.length}**
- Removed: **${removed.length}**
- Changed: **${changed.length}**

## Added (${added.length})

${added.map((x) => `- \`${x}\``).join("\n") || "_none_"}

## Removed (${removed.length})

${removed.map((x) => `- \`${x}\``).join("\n") || "_none_"}

## Changed (${changed.length})

${changed.map((c) => `- \`--${c.name}\`: \`${c.from}\` → \`${c.to}\``).join("\n") || "_none_"}
`
  fs.writeFileSync(TOKENS_REPORT, report)
  console.log(`✓ wrote ${TOKENS_REPORT}`)
}

function writeHoldList() {
  if (!holdList.length) return
  const existing = fs.existsSync(HOLD_LIST) ? fs.readFileSync(HOLD_LIST, "utf-8") : ""
  const section = `\n## Token Sync (${new Date().toISOString().slice(0, 10)})\n\n${[...new Set(holdList)].map((x) => `- ${x}`).join("\n")}\n`
  fs.writeFileSync(HOLD_LIST, existing + section)
  console.log(`✓ appended ${holdList.length} items to ${HOLD_LIST}`)
}

function writeExtDoc() {
  // Only write if file doesn't exist (preserve manual edits across regen).
  if (fs.existsSync(EXT_DOC)) {
    console.log(`✓ ${EXT_DOC} exists, preserving manual edits`)
    return
  }
  const md = `# Dash Extensions (beyond Figma)

Components/blocks/templates/tokens that **diverge** from AlignUI Pro Figma source. Kept as Dash brand identity.

## Brand overrides

| Token | Figma default | Dash override | Reason |
|---|---|---|---|
| \`--primary-*\` | sky (\`06-foundations.sky.*\`) | purple (\`--dash-purple-*\`) | Dash company brand color = #5e2aac |
| neutral alias | slate (\`02-neutral.* → slate\`) | gray (\`--dash-gray-*\` retained) | Dash chose warmer gray scale; slate scale ALSO emitted for Figma 1:1 components |

## Dash-only components (no Figma equivalent)

- \`registry/dash/blocks/mitra-suspend-page\` — Dash Express ops UI
- \`registry/dash/templates/halo-dash-3pane-shell\` — Halo-dash backoffice
- \`registry/dash/templates/phase7-results-dashboard\` — PT Box trader dashboard

These stay as-is. They use Dash semantic tokens (same surface), inherit theme.

## Convention

When pulling new Figma components, the agent MUST:
1. Use \`--primary-*\` for any "primary" / "brand" surface (auto-becomes purple in Dash)
2. Use \`--dash-gray-*\` for neutral if component is Dash-product UI
3. Use \`--dash-slate-*\` if component is AlignUI-template port (1:1 Figma)
4. Document any new divergence in this file
`
  fs.writeFileSync(EXT_DOC, md)
  console.log(`✓ wrote ${EXT_DOC}`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const prev = fs.existsSync(GLOBALS_CSS) ? fs.readFileSync(GLOBALS_CSS, "utf-8") : ""
  const next = build()
  fs.writeFileSync(GLOBALS_CSS, next)
  console.log(`✓ wrote ${GLOBALS_CSS} (${next.length} bytes)`)
  writeReport(prev, next)
  writeHoldList()
  writeExtDoc()
}

main()
