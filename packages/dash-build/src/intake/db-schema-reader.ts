/**
 * DB schema reader.
 *
 * Tries Prisma → Drizzle → raw SQL migrations, in that order. Returns the
 * first non-empty result. Empty DbCatalog when nothing detected — never
 * throws.
 */

import { readFile, readdir, stat } from "node:fs/promises"
import path from "node:path"

export type DbSource = "prisma" | "drizzle" | "sql"

export interface ColumnSchema {
  name: string
  type: string
  nullable: boolean
  default?: string
  unique?: boolean
  primary?: boolean
}

export interface RelationSchema {
  type: "one-to-one" | "one-to-many" | "many-to-many"
  toTable: string
  via?: string
}

export interface TableSchema {
  name: string
  columns: ColumnSchema[]
  relations: RelationSchema[]
  source: DbSource
  filePath: string
}

export interface DbCatalog {
  tables: TableSchema[]
  source: DbSource | "none"
}

const CAP_TABLES = 300
const CAP_COLUMNS = 80

async function safeReadFile(file: string): Promise<string | null> {
  try {
    return await readFile(file, "utf-8")
  } catch {
    return null
  }
}

async function safeReadDir(dir: string): Promise<string[]> {
  try {
    return await readdir(dir)
  } catch {
    return []
  }
}

async function exists(p: string): Promise<boolean> {
  try {
    await stat(p)
    return true
  } catch {
    return false
  }
}

// ---------------------------------------------------------------------------
// Prisma parser
// ---------------------------------------------------------------------------

// Lazy match to `}` — Prisma model bodies don't nest, so this is safe and it
// covers both multi-line blocks and single-line `model X { id Int @id }`.
const PRISMA_MODEL_RE = /\bmodel\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}/g

function parsePrismaModel(
  filePath: string,
  name: string,
  body: string,
): TableSchema {
  const columns: ColumnSchema[] = []
  const relations: RelationSchema[] = []
  // Track scalar field names so we can recognise "type === modelName" as
  // a relation when the field type matches the model name (heuristic).
  const knownScalars = new Set([
    "Int",
    "BigInt",
    "Float",
    "Decimal",
    "String",
    "Boolean",
    "DateTime",
    "Json",
    "Bytes",
  ])
  for (const rawLine of body.split("\n")) {
    const line = rawLine.trim()
    if (!line) continue
    if (line.startsWith("//")) continue
    if (line.startsWith("@@")) continue
    if (line.startsWith("@")) continue
    const m = line.match(
      /^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)(\[\])?(\?)?(.*)$/,
    )
    if (!m) continue
    const [, fieldName, type, listMark, optMark, rest] = m
    if (!fieldName || !type) continue
    const isList = Boolean(listMark)
    const optional = Boolean(optMark)
    const tail = rest ?? ""
    const isScalar = knownScalars.has(type)

    // Relation detection: field whose type is another model name. Use the
    // capitalised-first-letter heuristic plus !isScalar so we don't confuse
    // scalar fields with relations.
    const looksLikeRelation =
      /^[A-Z]/.test(type) && !isScalar && type !== "Json"
    if (looksLikeRelation) {
      // Try to recover the FK column from @relation(fields: [colName])
      const viaMatch = tail.match(
        /@relation\([^)]*fields\s*:\s*\[\s*([A-Za-z_][A-Za-z0-9_]*)\s*\]/,
      )
      relations.push({
        type: isList ? "one-to-many" : "one-to-one",
        toTable: type,
        ...(viaMatch?.[1] ? { via: viaMatch[1] } : {}),
      })
      continue
    }

    // Scalar column
    const col: ColumnSchema = {
      name: fieldName,
      type,
      nullable: optional,
    }
    if (/@id\b/.test(tail)) col.primary = true
    if (/@unique\b/.test(tail)) col.unique = true
    const def = tail.match(/@default\(([^)]+)\)/)
    if (def?.[1]) col.default = def[1].trim()
    columns.push(col)
    if (columns.length >= CAP_COLUMNS) break
  }
  return {
    name,
    columns,
    relations,
    source: "prisma",
    filePath,
  }
}

async function readPrisma(repoRoot: string): Promise<TableSchema[] | null> {
  const candidates = [
    path.join(repoRoot, "prisma", "schema.prisma"),
    path.join(repoRoot, "schema.prisma"),
  ]
  for (const file of candidates) {
    const content = await safeReadFile(file)
    if (content === null) continue
    const tables: TableSchema[] = []
    PRISMA_MODEL_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = PRISMA_MODEL_RE.exec(content)) !== null) {
      const [, name, body] = m
      if (!name || !body) continue
      tables.push(parsePrismaModel(file, name, body))
      if (tables.length >= CAP_TABLES) break
    }
    if (tables.length > 0) return tables
  }
  return null
}

// ---------------------------------------------------------------------------
// Drizzle parser (best-effort, regex)
// ---------------------------------------------------------------------------

const DRIZZLE_TABLE_RE =
  /export\s+const\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(?:pg|mysql|sqlite)?Table\s*\(\s*[`'"]([^`'"]+)[`'"]\s*,\s*\{([\s\S]*?)\n\}\s*\)/g

function parseDrizzleColumns(body: string): ColumnSchema[] {
  const out: ColumnSchema[] = []
  // field: colType("col_name") modifiers
  const re =
    /([A-Za-z_][A-Za-z0-9_]*)\s*:\s*([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*[`'"]?([^`'",)]+)?[`'"]?[^)]*\)([^,\n]*)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(body)) !== null) {
    const [, jsName, type, colName, modifiers] = m
    if (!jsName || !type) continue
    if (out.length >= CAP_COLUMNS) break
    const tail = modifiers ?? ""
    const col: ColumnSchema = {
      name: colName ?? jsName,
      type,
      nullable: !/\.notNull\(\)/.test(tail),
    }
    if (/\.primaryKey\(\)/.test(tail)) col.primary = true
    if (/\.unique\(\)/.test(tail)) col.unique = true
    const def = tail.match(/\.default\(([^)]+)\)/)
    if (def?.[1]) col.default = def[1].trim()
    out.push(col)
  }
  return out
}

async function readDrizzle(repoRoot: string): Promise<TableSchema[] | null> {
  const candidates = [
    path.join(repoRoot, "src", "db", "schema.ts"),
    path.join(repoRoot, "src", "schema.ts"),
    path.join(repoRoot, "db", "schema.ts"),
    path.join(repoRoot, "drizzle", "schema.ts"),
  ]
  const tables: TableSchema[] = []
  for (const file of candidates) {
    const content = await safeReadFile(file)
    if (content === null) continue
    DRIZZLE_TABLE_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = DRIZZLE_TABLE_RE.exec(content)) !== null) {
      const [, _jsName, tableName, body] = m
      if (!tableName || !body) continue
      const columns = parseDrizzleColumns(body)
      if (columns.length === 0) continue
      tables.push({
        name: tableName,
        columns,
        relations: [],
        source: "drizzle",
        filePath: file,
      })
      if (tables.length >= CAP_TABLES) break
    }
  }
  return tables.length > 0 ? tables : null
}

// ---------------------------------------------------------------------------
// SQL migration parser (best-effort)
// ---------------------------------------------------------------------------

// CREATE TABLE [IF NOT EXISTS] "schema"."name" ( ... );
const SQL_CREATE_RE =
  /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:["`]?[A-Za-z_][A-Za-z0-9_]*["`]?\.)?["`]?([A-Za-z_][A-Za-z0-9_]*)["`]?\s*\(([\s\S]*?)\);/gi

function parseSqlColumns(body: string): ColumnSchema[] {
  const out: ColumnSchema[] = []
  // Split on commas at depth-0 only (handles `DECIMAL(10,2)`)
  const parts: string[] = []
  let depth = 0
  let buf = ""
  for (const ch of body) {
    if (ch === "(") depth++
    if (ch === ")") depth--
    if (ch === "," && depth === 0) {
      parts.push(buf)
      buf = ""
      continue
    }
    buf += ch
  }
  if (buf.trim()) parts.push(buf)

  for (const raw of parts) {
    const line = raw.trim().replace(/^\s*--.*$/gm, "").trim()
    if (!line) continue
    // Skip table-level constraints
    if (/^(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CONSTRAINT|CHECK)\b/i.test(line)) {
      continue
    }
    const m = line.match(/^["`]?([A-Za-z_][A-Za-z0-9_]*)["`]?\s+([A-Za-z_][A-Za-z0-9_]*(?:\([^)]+\))?)/)
    if (!m) continue
    const [, name, type] = m
    if (!name || !type) continue
    const upper = line.toUpperCase()
    const col: ColumnSchema = {
      name,
      type,
      nullable: !/\bNOT\s+NULL\b/i.test(upper),
    }
    if (/\bPRIMARY\s+KEY\b/i.test(upper)) col.primary = true
    if (/\bUNIQUE\b/i.test(upper)) col.unique = true
    const def = line.match(/DEFAULT\s+([^,\s]+)/i)
    if (def?.[1]) col.default = def[1]
    out.push(col)
    if (out.length >= CAP_COLUMNS) break
  }
  return out
}

async function readSqlMigrations(
  repoRoot: string,
): Promise<TableSchema[] | null> {
  const candidates = [
    path.join(repoRoot, "migrations"),
    path.join(repoRoot, "db", "migrations"),
    path.join(repoRoot, "src", "db", "migrations"),
  ]
  const tables: TableSchema[] = []
  for (const dir of candidates) {
    if (!(await exists(dir))) continue
    const entries = await safeReadDir(dir)
    for (const entry of entries.sort()) {
      if (!entry.endsWith(".sql")) continue
      const file = path.join(dir, entry)
      const content = await safeReadFile(file)
      if (content === null) continue
      SQL_CREATE_RE.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = SQL_CREATE_RE.exec(content)) !== null) {
        const [, name, body] = m
        if (!name || !body) continue
        const columns = parseSqlColumns(body)
        if (columns.length === 0) continue
        tables.push({
          name,
          columns,
          relations: [],
          source: "sql",
          filePath: file,
        })
        if (tables.length >= CAP_TABLES) break
      }
      if (tables.length >= CAP_TABLES) break
    }
  }
  return tables.length > 0 ? tables : null
}

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export async function readDbSchema(repoRoot: string): Promise<DbCatalog> {
  try {
    const prisma = await readPrisma(repoRoot)
    if (prisma) return { tables: prisma, source: "prisma" }
  } catch {
    /* fall through */
  }
  try {
    const drizzle = await readDrizzle(repoRoot)
    if (drizzle) return { tables: drizzle, source: "drizzle" }
  } catch {
    /* fall through */
  }
  try {
    const sql = await readSqlMigrations(repoRoot)
    if (sql) return { tables: sql, source: "sql" }
  } catch {
    /* fall through */
  }
  return { tables: [], source: "none" }
}
