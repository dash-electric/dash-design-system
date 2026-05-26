import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { introspectRepo } from "../repo-introspector.js"

let dashRoot: string

function writeFile(filePath: string, content: string) {
  mkdirSync(path.dirname(filePath), { recursive: true })
  writeFileSync(filePath, content, "utf-8")
}

function scaffoldBackoffice(root: string) {
  // BE
  const beRoot = path.join(root, "ts-delivery-service-main")
  writeFile(
    path.join(beRoot, "prisma", "schema.prisma"),
    `// header comment
generator client {
  provider = "prisma-client-js"
}

model Delivery {
  id          BigInt   @id @default(autoincrement())
  uid         String   @unique
  status      String
  driver_id   BigInt?
  packages    Package[]
  metadata    Json?
}

model Package {
  id           BigInt   @id @default(autoincrement())
  delivery_id  BigInt
  weight_kg    Decimal?
}

enum OrderStatus {
  CREATED
  IN_DELIVERY
  COMPLETED
  CANCELLED
  FAILED
}

enum InstructionType {
  NONE
  WEBVIEW
}
`,
  )

  // FE — backoffice (JS pages)
  const feRoot = path.join(root, "next-backoffice-web")
  writeFile(
    path.join(feRoot, "src", "enums", "constValue.js"),
    `export const deliveryStatus = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  ALLOCATING: 'ALLOCATING',
  COMPLETED: 'COMPLETED',
};

export const platform = 'BACKOFFICE';
`,
  )

  writeFile(
    path.join(feRoot, "src", "services", "apiService.js"),
    `import ApiService from '@/utils/axios';

export const getMitra = async ({ page, size = 10 }) => {
  const response = await ApiService.get(\`/v3/drivers\`, { params: { page, size } });
  return response.data;
};

export const getDriverById = async (id, detail = 1) => {
  const response = await ApiService.get(\`/v3/drivers/\${id}\`, { params: { detail } });
  return response.data;
};

export const updateDriverById = async (id, data) => {
  const response = await ApiService.patch(\`/v3/drivers/\${id}\`, data);
  return response.data;
};
`,
  )

  // FE components — sidebar with default export
  writeFile(
    path.join(feRoot, "src", "components", "badge", "StatusBadge.jsx"),
    `import React from 'react';
export default function StatusBadge({ status }) {
  return <span>{status}</span>;
}
`,
  )
  writeFile(
    path.join(feRoot, "src", "components", "sidebar", "Sidebar.jsx"),
    `import React from 'react';
export default function Sidebar() {
  return <div>side</div>;
}
`,
  )
  writeFile(
    path.join(feRoot, "src", "components", "filter-system", "index.js"),
    `import React from 'react';
export default function FilterSystem() {
  return <div>filter</div>;
}
`,
  )
}

beforeEach(() => {
  dashRoot = mkdtempSync(path.join(tmpdir(), "dash-introspect-"))
})

afterEach(() => {
  // tmpdir cleanup is best-effort — let OS reap.
})

describe("introspectRepo (backoffice)", () => {
  it("extracts prisma models, enums, FE enums, endpoints, components", async () => {
    scaffoldBackoffice(dashRoot)
    const result = await introspectRepo("backoffice", { dashRoot })

    // Prisma models
    const modelNames = result.prismaModels.map((m) => m.name)
    expect(modelNames).toContain("Delivery")
    expect(modelNames).toContain("Package")
    const delivery = result.prismaModels.find((m) => m.name === "Delivery")
    expect(delivery).toBeDefined()
    const fieldNames = delivery!.fields.map((f) => f.name)
    expect(fieldNames).toContain("id")
    expect(fieldNames).toContain("uid")
    expect(fieldNames).toContain("driver_id")
    const driverId = delivery!.fields.find((f) => f.name === "driver_id")!
    expect(driverId.optional).toBe(true)
    const packages = delivery!.fields.find((f) => f.name === "packages")!
    expect(packages.isList).toBe(true)
    expect(packages.type).toBe("Package")

    // Prisma enums
    const enumNames = result.prismaEnums.map((e) => e.name)
    expect(enumNames).toContain("OrderStatus")
    expect(enumNames).toContain("InstructionType")
    const orderStatus = result.prismaEnums.find((e) => e.name === "OrderStatus")!
    expect(orderStatus.values).toEqual([
      "CREATED",
      "IN_DELIVERY",
      "COMPLETED",
      "CANCELLED",
      "FAILED",
    ])

    // FE enums
    const feEnumNames = result.feEnums.map((e) => e.name)
    expect(feEnumNames).toContain("deliveryStatus")
    expect(feEnumNames).toContain("platform")
    const status = result.feEnums.find((e) => e.name === "deliveryStatus")!
    expect(status.values).toEqual(
      expect.arrayContaining(["PENDING_PAYMENT", "ALLOCATING", "COMPLETED"]),
    )

    // Endpoints
    const endpointFns = result.endpointSignatures.map((e) => e.functionName)
    expect(endpointFns).toContain("getMitra")
    expect(endpointFns).toContain("getDriverById")
    expect(endpointFns).toContain("updateDriverById")
    const update = result.endpointSignatures.find(
      (e) => e.functionName === "updateDriverById",
    )!
    expect(update.method).toBe("PATCH")
    expect(update.path).toContain("/v3/drivers/")

    // Components
    const componentNames = result.reusableComponents.map((c) => c.name)
    expect(componentNames).toContain("StatusBadge")
    expect(componentNames).toContain("Sidebar")
    expect(componentNames).toContain("FilterSystem")
    const statusBadge = result.reusableComponents.find((c) => c.name === "StatusBadge")!
    expect(statusBadge.importPath).toContain("src/components/badge/StatusBadge")

    // Sanity
    expect(result.repoSlug).toBe("backoffice")
    expect(result.sources.length).toBeGreaterThan(0)
  })

  it("does not throw when sources are missing (graceful degrade)", async () => {
    // Empty dashRoot — nothing to find
    const result = await introspectRepo("backoffice", { dashRoot })
    expect(result.repoSlug).toBe("backoffice")
    expect(result.prismaModels).toEqual([])
    expect(result.prismaEnums).toEqual([])
    expect(result.feEnums).toEqual([])
    expect(result.endpointSignatures).toEqual([])
    expect(result.reusableComponents).toEqual([])
    expect(result.missingSources.length).toBeGreaterThan(0)
  })

  it("handles unknown repo slug without throwing", async () => {
    const result = await introspectRepo("totally-unknown-repo", { dashRoot })
    expect(result.repoSlug).toBe("totally-unknown-repo")
    expect(result.missingSources.length).toBeGreaterThan(0)
  })
})
