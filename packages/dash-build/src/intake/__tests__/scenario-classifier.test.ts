import { describe, expect, it } from "vitest"
import { classifyPrompt } from "../scenario-classifier.js"
import type { BeCatalog } from "../be-endpoint-catalog.js"
import type { DbCatalog } from "../db-schema-reader.js"

const emptyBe: BeCatalog = {
  endpoints: [],
  framework: "none",
  totalEndpoints: 0,
}

const emptyDb: DbCatalog = { tables: [], source: "none" }

const beWithDrivers: BeCatalog = {
  framework: "express",
  totalEndpoints: 1,
  endpoints: [
    {
      method: "GET",
      path: "/api/drivers",
      filePath: "/x/routes/drivers.ts",
      framework: "express",
      handlerExport: "listDrivers",
    },
  ],
}

const dbWithMitra: DbCatalog = {
  source: "prisma",
  tables: [
    {
      name: "Mitra",
      source: "prisma",
      filePath: "/x/prisma/schema.prisma",
      relations: [],
      columns: [
        { name: "id", type: "BigInt", nullable: false, primary: true },
        { name: "email", type: "String", nullable: false, unique: true },
        { name: "status", type: "String", nullable: false },
      ],
    },
  ],
}

describe("classifyPrompt — fe_only", () => {
  it("classifies pure visual prompts as fe_only", async () => {
    const r = await classifyPrompt(
      "Change the button color to Dash Purple and add a hover transition.",
      { beCatalog: emptyBe, dbCatalog: emptyDb, existingFiles: ["Button.tsx"] },
    )
    expect(r.scenario).toBe("fe_only")
    expect(r.confidence).toBeGreaterThanOrEqual(0.8)
  })
})

describe("classifyPrompt — update_existing", () => {
  it("matches BE keyword + existing endpoint path", async () => {
    const r = await classifyPrompt(
      "Update the drivers endpoint so it filters by region.",
      { beCatalog: beWithDrivers, dbCatalog: emptyDb, existingFiles: [] },
    )
    expect(r.scenario).toBe("update_existing")
    expect(r.affectedFiles?.be).toContain("/x/routes/drivers.ts")
  })

  it("falls back to update_existing for vague modify-prompts with existing files", async () => {
    const r = await classifyPrompt(
      "Polish the mitra detail page.",
      {
        beCatalog: emptyBe,
        dbCatalog: emptyDb,
        existingFiles: ["pages/mitra/[id].tsx"],
      },
    )
    expect(r.scenario).toBe("update_existing")
  })
})

describe("classifyPrompt — extend_fe_be", () => {
  it("BE keyword without a matching endpoint → extend_fe_be", async () => {
    const r = await classifyPrompt(
      "Add an endpoint to export the suspension log as CSV.",
      { beCatalog: beWithDrivers, dbCatalog: emptyDb, existingFiles: [] },
    )
    expect(r.scenario).toBe("extend_fe_be")
  })
})

describe("classifyPrompt — extend_fe_be_db", () => {
  it("DB keyword fires the schema-extension scenario", async () => {
    const r = await classifyPrompt(
      "Add a new column `suspendedReason` to the mitra table.",
      { beCatalog: emptyBe, dbCatalog: dbWithMitra, existingFiles: [] },
    )
    expect(r.scenario).toBe("extend_fe_be_db")
    expect(r.confidence).toBeGreaterThanOrEqual(0.7)
  })

  it("returns extend_fe_be_db with affectedFiles.db when table matches", async () => {
    const r = await classifyPrompt(
      "Persist mitra status changes with a reason field.",
      { beCatalog: emptyBe, dbCatalog: dbWithMitra, existingFiles: [] },
    )
    expect(r.scenario).toBe("extend_fe_be_db")
    expect(r.affectedFiles?.db).toContain("/x/prisma/schema.prisma")
  })
})

describe("classifyPrompt — new_product", () => {
  it("greenfield phrasing with no existing files → new_product", async () => {
    const r = await classifyPrompt(
      "Build a new module for fleet maintenance from scratch.",
      { beCatalog: emptyBe, dbCatalog: emptyDb, existingFiles: [] },
    )
    expect(r.scenario).toBe("new_product")
  })
})

describe("classifyPrompt — ambiguous", () => {
  it("returns ambiguous + needsClarify when nothing matches", async () => {
    const r = await classifyPrompt("do the thing", {
      beCatalog: emptyBe,
      dbCatalog: emptyDb,
      existingFiles: [],
    })
    expect(r.scenario).toBe("ambiguous")
    expect(r.needsClarify).toBeTruthy()
    expect(r.confidence).toBeLessThan(0.5)
  })
})
