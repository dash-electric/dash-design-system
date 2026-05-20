"use client"

import * as React from "react"
import { RiLinkM as LinkIcon } from "@remixicon/react"
import { cn } from "@/registry/dash/lib/utils"

type ApiRow = {
  name: string
  type: string
  defaultValue?: string
  required?: boolean
  description: React.ReactNode
}

type ApiTableProps = {
  /**
   * Anchor id prefix — e.g. `button-prop`. Combined with the prop name to
   * produce stable per-prop anchors like `button-prop-tone`.
   */
  idPrefix?: string
  rows: Array<ApiRow>
  className?: string
}

/**
 * DocsApiTable — anchor-linked per-prop field reference. Hovering a row
 * surfaces a small link icon that copies a deep link to that prop.
 *
 * Required props are sorted first to match shadcn's "important first"
 * convention. Within each tier, original ordering is preserved.
 */
export const DocsApiTable = ({ idPrefix = "prop", rows, className }: ApiTableProps) => {
  const sorted = React.useMemo(() => {
    const req: ApiRow[] = []
    const opt: ApiRow[] = []
    for (const r of rows) {
      if (r.required) req.push(r)
      else opt.push(r)
    }
    return [...req, ...opt]
  }, [rows])

  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-stroke-soft-200 bg-bg-white-0",
        className,
      )}
    >
      <table className="w-full text-sm">
        <thead className="bg-bg-weak-50 sticky top-0">
          <tr className="text-left">
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400 w-1/5">
              Prop
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
              Type
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
              Default
            </th>
            <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-text-soft-400">
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stroke-soft-200">
          {sorted.map((r) => {
            const id = `${idPrefix}-${r.name.replace(/[^a-zA-Z0-9-]/g, "-")}`
            return (
              <tr
                key={r.name}
                id={id}
                className="group align-top scroll-mt-24"
              >
                <td className="px-3 py-2.5 whitespace-nowrap">
                  <a
                    href={`#${id}`}
                    className="inline-flex items-center gap-1.5 text-xs text-text-strong-950 hover:text-(--dash-purple-600)"
                  >
                    <span className="font-mono">{r.name}</span>
                    {r.required ? (
                      <span className="text-[10px] uppercase tracking-widest text-error-base">
                        req
                      </span>
                    ) : null}
                    <LinkIcon
                      className="size-3.5 opacity-0 group-hover:opacity-60 transition-opacity"
                      aria-hidden
                    />
                  </a>
                </td>
                <td className="px-3 py-2.5 text-xs text-(--dash-purple-600) dark:text-(--dash-purple-300) font-mono whitespace-pre-wrap break-words">
                  {r.type}
                </td>
                <td className="px-3 py-2.5 text-xs text-text-soft-400 font-mono">
                  {r.defaultValue ?? "—"}
                </td>
                <td className="px-3 py-2.5 text-sm text-text-sub-600 leading-relaxed">
                  {r.description}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
