import { useState } from "react"
import { Button } from "@/registry/dash/ui/button"
import { Input } from "@/registry/dash/ui/input"

// AUDIT TRAIL: log original + edited + editor + reason for every user-editable
// field. Persisted via audit-log table per dash-ai-rules § "Audit Trail".
type AuditMeta = {
  original: string
  edited: string
  edited_by: string
  edit_reason: string
}

export function ImageEditorWithAudit({
  src,
  editorId,
  onSave,
}: {
  src: string
  editorId: string
  onSave: (next: { dataUrl: string; audit: AuditMeta }) => void
}) {
  const [dataUrl, setDataUrl] = useState(src)
  const [edit_reason, setEditReason] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSave = () => {
    if (!edit_reason.trim()) return
    setSubmitting(true)
    onSave({
      dataUrl,
      audit: {
        original: src,
        edited: dataUrl,
        edited_by: editorId,
        edit_reason,
      },
    })
  }

  return (
    <div className="bg-bg-weak-50 text-text-strong-950 border border-stroke-soft-200 p-4 rounded-lg">
      <img src={dataUrl} alt="proof" className="max-w-full" />
      <div className="mt-4 space-y-2">
        <label className="text-text-sub-600 text-sm">Alasan edit (wajib diisi sebelum Anda menyimpan)</label>
        <Input
          value={edit_reason}
          onChange={(e) => setEditReason(e.target.value)}
          placeholder="Contoh: Putar 90 derajat, terang"
        />
        <Button
          onClick={handleSave}
          disabled={!edit_reason.trim() || submitting}
          className="bg-primary-500"
        >
          Simpan perubahan
        </Button>
      </div>
    </div>
  )
}
