// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { describe, it, expect } from "vitest";
import {
  createTenantSchema,
  updateTenantSchema,
} from "../src/schemas/tenant.schema";

// ── Create Tenant Schema ────────────────────────────────────
describe("createTenantSchema", () => {
  const validPayload = {
    name: "Acme Corp",
    contactEmail: "admin@acme.com",
    sandboxConfig: {
      apiUrl: "https://api.sandbox.example.com",
      apiKey: "sk-sandbox-123",
    },
    productionConfig: {
      apiUrl: "https://api.example.com",
      apiKey: "sk-prod-456",
    },
  };

  it("accepts a valid minimal payload (only required fields)", () => {
    const result = createTenantSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("accepts a payload with all optional fields provided", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
      phone: "+34600123456",
      contactPerson: "Jane Doe",
      logoUrl: "https://cdn.example.com/logo.png",
    });
    expect(result.success).toBe(true);
  });

  // ── Required field validation ─────────────────────────────
  it("rejects input missing the name field", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { name: _name, ...rest } = validPayload;
    const result = createTenantSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects input missing the contactEmail field", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { contactEmail: _contactEmail, ...rest } = validPayload;
    const result = createTenantSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects an empty name", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
      name: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email for contactEmail", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
      contactEmail: "not-an-email",
    });
    expect(result.success).toBe(false);
  });

  // ── AI config validation ──────────────────────────────────
  it("rejects a sandboxConfig with a non-URL apiUrl", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
      sandboxConfig: { apiUrl: "not-a-url", apiKey: "sk-123" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a sandboxConfig with an empty apiKey", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
      sandboxConfig: { apiUrl: "https://api.example.com", apiKey: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects input missing sandboxConfig", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sandboxConfig: _sandboxConfig, ...rest } = validPayload;
    const result = createTenantSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects input missing productionConfig", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { productionConfig: _productionConfig, ...rest } = validPayload;
    const result = createTenantSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  // ── Optional field types ──────────────────────────────────
  it("accepts undefined for optional string fields (phone, contactPerson, logoUrl)", () => {
    const result = createTenantSchema.safeParse({
      ...validPayload,
    });
    // Optional fields not provided = undefined, which is fine
    expect(result.success).toBe(true);
  });
});

// ── Update Tenant Schema ────────────────────────────────────
describe("updateTenantSchema", () => {
  it("accepts an empty object (all fields optional for partial update)", () => {
    const result = updateTenantSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts a partial payload with only the name field", () => {
    const result = updateTenantSchema.safeParse({ name: "New Name" });
    expect(result.success).toBe(true);
  });

  it("accepts a partial payload with only the status field", () => {
    const result = updateTenantSchema.safeParse({ status: "active" });
    expect(result.success).toBe(true);
  });

  it("accepts a payload with all fields provided", () => {
    const result = updateTenantSchema.safeParse({
      name: "Acme Corp",
      contactEmail: "admin@acme.com",
      phone: "+34600123456",
      contactPerson: "Jane Doe",
      logoUrl: "https://cdn.example.com/logo.png",
      status: "active",
      sandboxConfig: {
        apiUrl: "https://api.sandbox.example.com",
        apiKey: "sk-sandbox-123",
      },
      productionConfig: {
        apiUrl: "https://api.example.com",
        apiKey: "sk-prod-456",
      },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid status value", () => {
    const result = updateTenantSchema.safeParse({ status: "deleted" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email for contactEmail in partial update", () => {
    const result = updateTenantSchema.safeParse({ contactEmail: "invalid" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty name in partial update", () => {
    const result = updateTenantSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a sandboxConfig with a non-URL apiUrl in partial update", () => {
    const result = updateTenantSchema.safeParse({
      sandboxConfig: { apiUrl: "bad-url", apiKey: "sk-123" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty apiKey in productionConfig", () => {
    const result = updateTenantSchema.safeParse({
      productionConfig: { apiUrl: "https://api.example.com", apiKey: "" },
    });
    expect(result.success).toBe(false);
  });
});
