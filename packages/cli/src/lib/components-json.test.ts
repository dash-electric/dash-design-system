import { describe, it, expect, beforeEach, afterEach } from "vitest"
import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import {
  readComponentsJson,
  writeComponentsJson,
  defaultComponentsJson,
  resolveTargetPath,
} from "./components-json.js"

function mkTmp(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "dash-cj-test-"))
}

describe("components.json", () => {
  let tmp: string

  beforeEach(() => {
    tmp = mkTmp()
  })

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true })
  })

  it("returns null when components.json missing", () => {
    expect(readComponentsJson(tmp)).toBeNull()
  })

  it("roundtrips write+read", () => {
    const cfg = defaultComponentsJson({
      registryUrl: "http://x",
      tsx: true,
      rsc: true,
    })
    writeComponentsJson(cfg, tmp)
    const read = readComponentsJson(tmp)
    expect(read?.registries?.["@dash"]?.url).toBe("http://x")
    expect(read?.tailwind?.css).toBe("app/globals.css")
  })

  it("throws on malformed JSON", () => {
    fs.writeFileSync(path.join(tmp, "components.json"), "{not json")
    expect(() => readComponentsJson(tmp)).toThrow(/Failed to parse/)
  })
})

describe("resolveTargetPath", () => {
  const cfg = defaultComponentsJson({
    registryUrl: "http://x",
    tsx: true,
    rsc: true,
  })

  it("maps ui/* paths through aliases.ui", () => {
    const out = resolveTargetPath(
      { path: "ui/button.tsx", type: "registry:ui" },
      cfg,
      "/proj",
    )
    expect(out).toBe(path.join("/proj", "components/ui/button.tsx"))
  })

  it("strips registry/<dash>/ prefix from build-time paths", () => {
    const out = resolveTargetPath(
      { path: "registry/dash/ui/card.tsx", type: "registry:ui" },
      cfg,
      "/proj",
    )
    expect(out).toBe(path.join("/proj", "components/ui/card.tsx"))
  })

  it("prefers explicit target over path", () => {
    const out = resolveTargetPath(
      { path: "ignored.tsx", target: "lib/utils.ts", type: "registry:lib" },
      cfg,
      "/proj",
    )
    expect(out).toBe(path.join("/proj", "lib/utils.ts"))
  })
})
