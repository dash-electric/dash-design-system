import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { readDbSchema } from "../db-schema-reader.js"

let repoRoot: string

function w(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

beforeEach(() => {
  repoRoot = mkdtempSync(path.join(tmpdir(), "dash-db-read-"))
})

afterEach(() => {
  try {
    rmSync(repoRoot, { recursive: true, force: true })
  } catch {
    /* ignore */
  }
})

describe("readDbSchema — empty repo", () => {
  it("returns an empty catalog with source=none", async () => {
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.tables).toEqual([])
    expect(catalog.source).toBe("none")
  })
})

describe("readDbSchema — Prisma", () => {
  it("parses model blocks with scalar columns + relations", async () => {
    w(
      path.join(repoRoot, "prisma/schema.prisma"),
      `model Mitra {
  id        BigInt    @id @default(autoincrement())
  email     String    @unique
  phone     String?
  status    String    @default("ACTIVE")
  drivers   Driver[]
}

model Driver {
  id        BigInt @id @default(autoincrement())
  mitra     Mitra  @relation(fields: [mitraId], references: [id])
  mitraId   BigInt
}
`,
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("prisma")
    expect(catalog.tables).toHaveLength(2)

    const mitra = catalog.tables.find((t) => t.name === "Mitra")!
    expect(mitra.columns.find((c) => c.name === "id")?.primary).toBe(true)
    expect(mitra.columns.find((c) => c.name === "email")?.unique).toBe(true)
    expect(mitra.columns.find((c) => c.name === "phone")?.nullable).toBe(true)
    expect(mitra.columns.find((c) => c.name === "status")?.default).toBe('"ACTIVE"')
    // drivers is a relation, not a scalar column
    expect(mitra.columns.find((c) => c.name === "drivers")).toBeUndefined()
    expect(mitra.relations.find((r) => r.toTable === "Driver")?.type).toBe(
      "one-to-many",
    )

    const driver = catalog.tables.find((t) => t.name === "Driver")!
    expect(driver.relations[0]).toMatchObject({
      type: "one-to-one",
      toTable: "Mitra",
      via: "mitraId",
    })
  })

  it("falls back to root-level schema.prisma when prisma/ dir is absent", async () => {
    w(
      path.join(repoRoot, "schema.prisma"),
      `model Foo { id Int @id }`,
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("prisma")
    expect(catalog.tables[0]!.name).toBe("Foo")
  })
})

describe("readDbSchema — Drizzle", () => {
  it("parses pgTable definitions", async () => {
    w(
      path.join(repoRoot, "src/db/schema.ts"),
      `import { pgTable, serial, text, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  active: boolean("active").default(true)
})
`,
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("drizzle")
    const users = catalog.tables[0]!
    expect(users.name).toBe("users")
    const id = users.columns.find((c) => c.name === "id")!
    expect(id.primary).toBe(true)
    const email = users.columns.find((c) => c.name === "email")!
    expect(email.nullable).toBe(false)
    expect(email.unique).toBe(true)
  })
})

describe("readDbSchema — SQL migrations", () => {
  it("parses CREATE TABLE statements", async () => {
    w(
      path.join(repoRoot, "migrations/0001_init.sql"),
      `CREATE TABLE IF NOT EXISTS "orders" (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);`,
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("sql")
    const orders = catalog.tables[0]!
    expect(orders.name).toBe("orders")
    expect(orders.columns.find((c) => c.name === "id")?.primary).toBe(true)
    expect(orders.columns.find((c) => c.name === "customer_id")?.nullable).toBe(
      false,
    )
    expect(orders.columns.find((c) => c.name === "notes")?.nullable).toBe(true)
    expect(orders.columns.find((c) => c.name === "amount")?.type).toMatch(
      /DECIMAL/i,
    )
  })

  it("prefers Prisma when both Prisma and SQL exist", async () => {
    w(path.join(repoRoot, "prisma/schema.prisma"), `model Bar { id Int @id }`)
    w(
      path.join(repoRoot, "migrations/0001_init.sql"),
      `CREATE TABLE legacy (id INT PRIMARY KEY);`,
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("prisma")
    expect(catalog.tables[0]!.name).toBe("Bar")
  })
})

describe("readDbSchema — edge cases", () => {
  it("does not throw on a malformed Prisma schema — returns none", async () => {
    w(
      path.join(repoRoot, "prisma/schema.prisma"),
      "garbage content {{{ no models here",
    )
    const catalog = await readDbSchema(repoRoot)
    expect(catalog.source).toBe("none")
    expect(catalog.tables).toEqual([])
  })
})
