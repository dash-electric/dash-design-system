"use client"

import * as React from "react"
import {
  DocsPageShell,
  DocsHeader,
  DocsSection,
  DocsExample,
} from "@/components/docs/page-shell"

/**
 * Portal Home. Ported from Dash Next Portal v2 source (2026-05-19).
 * Source: app/[locale]/(dashboard)/page.tsx
 * The actual page renders an empty container + `useEffect` redirect to /signin.
 * In production the dashboard root is never a real "landing"; it's a router-only
 * stub that bounces unauthenticated visitors to the signin flow.
 */
export default function PortalHomePage() {
  return (
    <DocsPageShell>
      <DocsHeader
        category="Templates / Dash Next Portal"
        title="Home (root)"
        description="The Next Portal v2 dashboard root is a redirect-only page. Authenticated session is checked in layouts; if the user lands on `/` they are immediately pushed to `/signin` (or to `/deliveries` after login)."
      />

      <DocsSection title="Behavior">
        <DocsExample
          bare
          title="Render = redirect to /signin"
          description="No visible UI. `useEffect` fires `router.push('/signin')` on mount. The commented-out marketing scaffold (Quick Starter AlignUI hero) is preserved in source but unused in production."
          preview={
            <DocsTemplatePreview>
              <div className="grid min-h-[480px] place-items-center bg-bg-white-0 text-text-soft-400">
                <div className="text-center">
                  <p className="text-paragraph-md">Redirecting to /signin…</p>
                  <p className="mt-2 text-paragraph-xs text-text-soft-400">
                    (No UI rendered — this page is router-only.)
                  </p>
                </div>
              </div>
            </DocsTemplatePreview>
          }
          code={`'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => {
    router.push('/signin')
  })
  return <div className='container mx-auto flex-1 px-6' />
}`}
        />
      </DocsSection>

      <DocsSection title="Notes">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Imports kept in source but unused: <code>Link</code>, <code>Button</code>, <code>RiGithubFill</code> — vestigial from the AlignUI starter template.</li>
          <li>The signed-in landing route is <code>/deliveries</code> (see <code>signin/page.tsx</code> → <code>router.replace(&apos;/deliveries&apos;)</code> on success).</li>
          <li>The redirect uses <code>router.push</code> not <code>redirect()</code> because the page is <code>&apos;use client&apos;</code>.</li>
          <li>The route also doubles as a fallback for stale bookmarks of the AlignUI starter scaffold; the commented-out hero (“Quick Starter AlignUI Template with Next.js &amp; Typescript”) stays as historical reference.</li>
        </ul>
      </DocsSection>

      <DocsSection title="When to use">
        <ul className="text-sm text-text-sub-600 space-y-1.5 list-disc pl-6">
          <li>Use when you need a soft landing that defers routing decisions to client-side checks (e.g. localStorage token gating).</li>
          <li>For server-side checks prefer <code>middleware.ts</code> + <code>NextResponse.redirect</code> instead — this page only exists to keep the route table stable.</li>
        </ul>
      </DocsSection>
    </DocsPageShell>
  )
}

function DocsTemplatePreview({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-stroke-soft-200 bg-bg-weak-50">
      <div className="min-w-[1280px]">{children}</div>
    </div>
  )
}
