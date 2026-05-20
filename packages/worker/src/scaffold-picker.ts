/**
 * Heuristic scaffold picker. Maps a gap description to one of the canonical
 * scaffold templates (Agent O output) by keyword match. Deliberately simple —
 * regex over substrings, biased toward the highest-signal keywords first.
 *
 * If no keywords match, we fall back to `generic-block` (a plain function
 * component with audit-trail boilerplate commented out).
 *
 * Adding a new scaffold: append to SCAFFOLDS with keywords in priority order.
 * Keywords are tested as lowercased substring matches.
 */
import type { Scaffold } from "./types.js"

type ScaffoldDef = Scaffold & { keywords: string[] }

const AUDIT_TRAIL_COMMENT = `// AUDIT TRAIL: log original + edited + editor + reason for every user-editable
// field below. Use the audit-log table per dash-ai-rules § "Audit Trail".`

const SCAFFOLDS: ScaffoldDef[] = [
  {
    name: "image-editor-with-audit",
    category: "block",
    scaffoldId: "image-proof-editor",
    keywords: ["image", "photo", "proof", "editor", "crop", "annotate"],
    stubSource: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"

${AUDIT_TRAIL_COMMENT}

export function ImageEditorWithAudit({
  src,
  onSave,
}: {
  src: string
  onSave: (next: { dataUrl: string; reason: string }) => void
}) {
  const [reason, setReason] = useState("")
  return (
    <div className="bg-bg-weak-50 text-text-strong-950">
      <img src={src} alt="proof" />
      <Button onClick={() => onSave({ dataUrl: src, reason })}>Simpan</Button>
    </div>
  )
}
`,
  },
  {
    name: "signature-pad-with-audit",
    category: "block",
    scaffoldId: "signature-pad",
    keywords: ["signature", "sign", "ttd", "tanda tangan"],
    stubSource: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"

${AUDIT_TRAIL_COMMENT}

export function SignaturePadWithAudit() {
  const [, setStrokes] = useState<string[]>([])
  return (
    <div className="bg-bg-weak-50">
      <canvas className="border border-stroke-soft-200" />
      <Button>Selesai</Button>
    </div>
  )
}
`,
  },
  {
    name: "payment-form-with-audit",
    category: "block",
    scaffoldId: "payment-form",
    keywords: ["payment", "payout", "transfer", "saldo", "rekening"],
    stubSource: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"

${AUDIT_TRAIL_COMMENT}

export function PaymentFormWithAudit() {
  const [amount, setAmount] = useState("")
  return (
    <form className="bg-bg-weak-50 text-text-strong-950">
      <input value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Button type="submit">Kirim</Button>
    </form>
  )
}
`,
  },
  {
    name: "kyc-uploader",
    category: "block",
    scaffoldId: "kyc-uploader",
    keywords: ["kyc", "ktp", "sim", "identity", "document"],
    stubSource: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"

${AUDIT_TRAIL_COMMENT}

export function KycUploader() {
  const [file, setFile] = useState<File | null>(null)
  return (
    <div className="bg-bg-weak-50">
      <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      <Button disabled={!file}>Unggah</Button>
    </div>
  )
}
`,
  },
]

const GENERIC: Scaffold = {
  name: "generic-block",
  category: "block",
  scaffoldId: "generic-block",
  stubSource: `import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"

export function GenericBlock() {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-bg-weak-50 text-text-strong-950">
      <Button onClick={() => setOpen((v) => !v)}>{open ? "Tutup" : "Buka"}</Button>
    </div>
  )
}
`,
}

/**
 * Pick a scaffold based on gap description keywords. Slug-name is derived
 * from description if no specific scaffold matches.
 */
export function pickScaffold(description: string): Scaffold {
  const d = description.toLowerCase()
  for (const sc of SCAFFOLDS) {
    if (sc.keywords.some((k) => d.includes(k))) {
      return {
        name: sc.name,
        category: sc.category,
        scaffoldId: sc.scaffoldId,
        stubSource: sc.stubSource,
      }
    }
  }
  return {
    ...GENERIC,
    name: slugify(description) || GENERIC.name,
  }
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
}
