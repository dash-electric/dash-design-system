"use client"

import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/registry/dash/ui/tabs"
import { DocsCode } from "@/components/docs/code-block"
import { cn } from "@/registry/dash/lib/utils"

type Manager = "pnpm" | "npm" | "yarn" | "bun"

const MANAGERS: Array<{ id: Manager; cmd: (name: string) => string }> = [
  { id: "pnpm", cmd: (n) => `pnpm dlx dashkit add ${n}` },
  { id: "npm", cmd: (n) => `npx dashkit add ${n}` },
  { id: "yarn", cmd: (n) => `yarn dlx dashkit add ${n}` },
  { id: "bun", cmd: (n) => `bunx dashkit add ${n}` },
]

type ManualBlock = {
  /** Source path inside the registry, e.g. `registry/dash/ui/button.tsx`. */
  sourcePath: string
  /** Optional inline source snippet to paste. */
  source?: string
  /** Optional dependencies the user must install. */
  dependencies?: string[]
}

type InstallTabsProps = {
  /** Component slug, e.g. `button`. Drives the CLI command. */
  name: string
  /** Manual install block — source location + deps. */
  manual?: ManualBlock
  className?: string
}

/**
 * DocsInstallTabs — top-level CLI / Manual split, with a nested PM picker
 * under CLI (pnpm/npm/yarn/bun). Matches the shadcn install pattern so
 * users land on the same mental model when crossing between docs.
 */
export const DocsInstallTabs = ({ name, manual, className }: InstallTabsProps) => {
  return (
    <Tabs defaultValue="cli" className={cn("space-y-4", className)}>
      <TabsList>
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="manual">Manual</TabsTrigger>
      </TabsList>
      <TabsContent value="cli" className="space-y-3">
        <Tabs defaultValue="pnpm">
          <TabsList>
            {MANAGERS.map((m) => (
              <TabsTrigger key={m.id} value={m.id}>
                {m.id}
              </TabsTrigger>
            ))}
          </TabsList>
          {MANAGERS.map((m) => (
            <TabsContent key={m.id} value={m.id}>
              <DocsCode language="bash" code={m.cmd(name)} />
            </TabsContent>
          ))}
        </Tabs>
      </TabsContent>
      <TabsContent value="manual" className="space-y-4">
        {manual?.dependencies && manual.dependencies.length > 0 ? (
          <div className="space-y-2">
            <p className="text-sm text-text-sub-600">Install dependencies:</p>
            <DocsCode
              language="bash"
              code={`pnpm add ${manual.dependencies.join(" ")}`}
            />
          </div>
        ) : null}
        {manual?.sourcePath ? (
          <div className="space-y-2">
            <p className="text-sm text-text-sub-600">
              Copy the source into your project at{" "}
              <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">
                {manual.sourcePath}
              </code>
              .
            </p>
            {manual.source ? (
              <DocsCode language="tsx" code={manual.source} />
            ) : null}
          </div>
        ) : null}
        {!manual ? (
          <p className="text-sm text-text-sub-600 leading-relaxed">
            Source lives in{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">
              registry/dash/ui/{name}.tsx
            </code>
            . Copy the file into your project and install peer dependencies
            from{" "}
            <code className="text-xs px-1 py-0.5 rounded bg-bg-weak-50 text-text-strong-950">
              registry.json
            </code>
            .
          </p>
        ) : null}
      </TabsContent>
    </Tabs>
  )
}
