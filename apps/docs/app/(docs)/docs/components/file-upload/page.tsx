"use client"

import * as React from "react"
import {
  RiUploadCloud2Line as UploadCloud,
  RiCloseLine as Close,
  RiLinkM as LinkIc,
  RiInformationLine as Info,
} from "@remixicon/react"
import {
  FileUploadDropzone,
  FileUploadList,
  FileUploadItem,
  ImageUpload,
} from "@/registry/dash/ui/file-upload"
import { Button } from "@/registry/dash/ui/button"
import { ContentDivider } from "@/registry/dash/ui/divider"
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
  DrawerClose,
} from "@/registry/dash/ui/drawer"
import { CompactButton } from "@/registry/dash/ui/compact-button"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
  DocsPropsTable,
} from "@/components/docs/page-shell"

/**
 * File Upload — Figma 1:1 (11 nodes verified 2026-05-18).
 *
 *   450:9413      Dropzone master spec (default + idle)
 *   450:17234     Dropzone hover / drag-over
 *   451:409       FileUploadItem 3-status (uploading w/ progress / completed / failed w/ Try Again)
 *   452:653       Compact chip variant
 *   3280:21147    ImageUpload avatar variant — Remove + Change (light)
 *   3280:21149    same dark
 *   167138:24942..25000  Upload Files dialog — dropzone + multi-item list + URL import (light + dark)
 */

export default function FileUploadDocsPage() {
  const [openDialog, setOpenDialog] = React.useState(false)

  return (
    <DocsPageShell>
      <DocsHeader
        category="Components / Forms"
        title="File Upload"
        description="Dropzone + uploaded-item list. Three primitives: FileUploadDropzone (click-or-drag target), FileUploadItem (single row with status + progress + actions), ImageUpload (compact avatar slot with Remove + Change). Compose inside Drawer or Dialog for full upload workflows."
      />

      <DocsSection title="Dropzone — default + hover">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Dashed border + cloud icon + title + accepted formats + Browse File button. Hover (drag-over) state fills the surface with bg-weak-50.
        </p>
        <DocsExample
          title="2 states"
          preview={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
              <FileUploadDropzone
                title="Choose a file or drag & drop it here."
                description="JPEG, PNG, PDF, and MP4 formats, up to 50 MB."
                accept=".jpg,.jpeg,.png,.pdf,.mp4"
              />
              <FileUploadDropzone
                className="bg-bg-weak-50"
                title="Choose a file or drag & drop it here."
                description="JPEG, PNG, PDF, and MP4 formats, up to 50 MB."
                accept=".jpg,.jpeg,.png,.pdf,.mp4"
              />
            </div>
          }
          code={`<FileUploadDropzone
  title="Choose a file or drag & drop it here."
  description="JPEG, PNG, PDF, and MP4 formats, up to 50 MB."
  accept=".jpg,.jpeg,.png,.pdf,.mp4"
  onFilesSelected={(files) => upload(files)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Item 3-status">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          File row with status icon + name + size + progress bar (uploading) / completed check / failed error + Try Again link. File-type chip color auto-derived from extension.
        </p>
        <DocsExample
          title="uploading / completed / failed"
          preview={
            <FileUploadList className="max-w-md">
              <FileUploadItem
                name="my-cv.pdf"
                size={120_000}
                progress={30}
                status="uploading"
                onRemove={() => {}}
              />
              <FileUploadItem
                name="my-cv.pdf"
                size={120_000}
                progress={100}
                status="complete"
                onRemove={() => {}}
              />
              <FileUploadItem
                name="my-cv.pdf"
                size={120_000}
                progress={0}
                status="error"
                onRemove={() => {}}
                onRetry={() => {}}
              />
            </FileUploadList>
          }
          code={`<FileUploadItem name="my-cv.pdf" size={120_000} progress={30} status="uploading" onCancel={cancel} />
<FileUploadItem name="my-cv.pdf" size={120_000} progress={100} status="complete" onRemove={remove} />
<FileUploadItem name="my-cv.pdf" size={120_000} status="error" onRemove={remove} onRetry={retry} />`}
        />
      </DocsSection>

      <DocsSection title="ImageUpload — avatar slot">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Compact card with preview + label + meta + Remove (destructive stroke) + Change buttons. Use for profile photo, brand logo, single-image slots.
        </p>
        <DocsExample
          title="Profile image upload"
          preview={
            <div className="space-y-4">
              <ImageUpload
                label="Upload Image"
                description="Min 400x400px, PNG or JPEG"
                accept="image/png,image/jpeg"
              />
              <ImageUpload
                src="https://i.pravatar.cc/200?u=lp-upload"
                label="Upload Image"
                description="Min 400x400px, PNG or JPEG"
                accept="image/png,image/jpeg"
                onRemove={() => {}}
              />
            </div>
          }
          code={`<ImageUpload
  label="Upload Image"
  description="Min 400x400px, PNG or JPEG"
  accept="image/png,image/jpeg"
  value={photoUrl}
  onChange={setPhoto}
  onRemove={() => setPhoto(undefined)}
/>`}
        />
      </DocsSection>

      <DocsSection title="Upload files dialog">
        <p className="text-sm text-text-sub-600 max-w-2xl">
          Drawer-pattern: header (cloud icon chip + title + description + close) + Dropzone + active uploads list + "OR" divider + URL import field. Use for multi-source uploads where users can paste a link OR drag a local file.
        </p>
        <DocsExample
          title='"Upload files" dialog'
          preview={
            <Drawer open={openDialog} onOpenChange={setOpenDialog}>
              <DrawerTrigger asChild>
                <Button tone="neutral" style="stroke" leftIcon={<UploadCloud />}>Open Upload Files</Button>
              </DrawerTrigger>
              <DrawerContent side="right" className="w-[440px]">
                <DrawerHeader>
                  <div className="flex items-center gap-3">
                    <span className="size-9 rounded-full bg-bg-white-0 border border-stroke-soft-200 inline-flex items-center justify-center text-icon-soft-400 shrink-0">
                      <UploadCloud className="size-4" />
                    </span>
                    <div className="flex-1">
                      <DrawerTitle>Upload files</DrawerTitle>
                      <DrawerDescription>Select and upload the files of your choice</DrawerDescription>
                    </div>
                    <DrawerClose asChild>
                      <CompactButton size="sm" variant="ghost" aria-label="Close"><Close /></CompactButton>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <DrawerBody className="space-y-4">
                  <FileUploadDropzone
                    title="Choose a file or drag & drop it here."
                    description="JPEG, PNG, PDF, and MP4 formats, up to 50 MB."
                    accept=".jpg,.jpeg,.png,.pdf,.mp4"
                  />
                  <FileUploadList>
                    <FileUploadItem
                      name="my-cv.pdf"
                      size={120_000}
                      progress={30}
                      status="uploading"
                      onRemove={() => {}}
                    />
                    <FileUploadItem
                      name="google-certificate.pdf"
                      size={94_000}
                      progress={100}
                      status="complete"
                      onRemove={() => {}}
                    />
                  </FileUploadList>
                  <ContentDivider>OR</ContentDivider>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-text-strong-950 inline-flex items-center gap-1.5">
                      Import from URL Link <Info className="size-3.5 text-icon-soft-400" />
                    </label>
                    <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-stroke-soft-200 bg-bg-white-0 text-sm">
                      <LinkIc className="size-4 text-icon-soft-400" />
                      <input type="url" placeholder="Paste file URL" className="flex-1 bg-transparent text-text-strong-950 placeholder:text-text-soft-400 outline-none" />
                    </div>
                  </div>
                </DrawerBody>
              </DrawerContent>
            </Drawer>
          }
          code={`<Drawer>
  <DrawerContent>
    <DrawerHeader>
      <IconChip><UploadCloud /></IconChip>
      <DrawerTitle>Upload files</DrawerTitle>
      <DrawerDescription>Select and upload the files of your choice</DrawerDescription>
    </DrawerHeader>
    <DrawerBody>
      <FileUploadDropzone />
      <FileUploadList>
        <FileUploadItem status="uploading" ... />
        <FileUploadItem status="complete" ... />
      </FileUploadList>
      <ContentDivider>OR</ContentDivider>
      <UrlImportField />
    </DrawerBody>
  </DrawerContent>
</Drawer>`}
        />
      </DocsSection>

      <DocsSection title="API">
        <DocsPropsTable
          rows={[
            { name: "FileUploadDropzone.title", type: "ReactNode", description: "Primary label inside the dropzone." },
            { name: "FileUploadDropzone.description", type: "ReactNode", description: "Secondary text — accepted formats + size hint." },
            { name: "FileUploadDropzone.accept", type: "string", description: "MIME or extension list (e.g. .jpg,.png,application/pdf)." },
            { name: "FileUploadDropzone.multiple", type: "boolean", defaultValue: "false", description: "Allow multiple files." },
            { name: "FileUploadDropzone.onFilesSelected", type: "(files: File[]) => void", description: "Fires on click-select OR drag-drop." },
            { name: "FileUploadItem.name", type: "string", description: "Filename." },
            { name: "FileUploadItem.size", type: "number", description: "Total bytes." },
            { name: "FileUploadItem.uploadedBytes", type: "number", description: "Bytes uploaded so far — drives progress bar in uploading state." },
            { name: "FileUploadItem.status", type: '"uploading" | "complete" | "error"', description: "Drives status icon + actions." },
            { name: "FileUploadItem.onCancel / onRemove / onRetry", type: "() => void", description: "uploading=cancel, complete=remove (trash), error=remove + Try Again retry." },
            { name: "ImageUpload.value", type: "string (url)", description: "Current image source — renders preview when set." },
            { name: "ImageUpload.label / description", type: "ReactNode", description: "Header label + secondary hint (min size, formats)." },
            { name: "ImageUpload.onChange / onRemove", type: "(file?: File) => void", description: "Change picks a new file; Remove clears it." },
            { name: "ImageUpload.size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Preview avatar size." },
          ]}
        />
      </DocsSection>
    </DocsPageShell>
  )
}
