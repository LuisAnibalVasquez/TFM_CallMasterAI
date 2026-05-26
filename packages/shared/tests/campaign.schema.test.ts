// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { describe, it, expect } from "vitest";
import { campaignSchema } from "../src/schemas/campaign.schema";

describe("campaignSchema", () => {
  // ── Happy path ────────────────────────────────────────────
  it("accepts a valid name and Sandbox environment", () => {
    const result = campaignSchema.safeParse({
      name: "My Campaign",
      environment: "Sandbox",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid name and Production environment", () => {
    const result = campaignSchema.safeParse({
      name: "Production Push",
      environment: "Production",
    });
    expect(result.success).toBe(true);
  });

  // ── Invalid name ──────────────────────────────────────────
  it("rejects an empty name", () => {
    const result = campaignSchema.safeParse({
      name: "",
      environment: "Sandbox",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("name");
    }
  });

  it("rejects a whitespace-only name", () => {
    const result = campaignSchema.safeParse({
      name: "   ",
      environment: "Sandbox",
    });
    expect(result.success).toBe(false);
  });

  // ── Invalid environment ───────────────────────────────────
  it("rejects an unrecognized environment value", () => {
    const result = campaignSchema.safeParse({
      name: "Test",
      environment: "Staging",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("environment");
    }
  });

  it("rejects an empty environment string", () => {
    const result = campaignSchema.safeParse({
      name: "Test",
      environment: "",
    });
    expect(result.success).toBe(false);
  });

  // ── Missing fields ────────────────────────────────────────
  it("rejects input missing the name field", () => {
    const result = campaignSchema.safeParse({
      environment: "Sandbox",
    });
    expect(result.success).toBe(false);
  });

  it("rejects input missing the environment field", () => {
    const result = campaignSchema.safeParse({
      name: "Test",
    });
    expect(result.success).toBe(false);
  });

  // ── Extra fields ──────────────────────────────────────────
  it("strips unknown extra fields from the parsed output", () => {
    const result = campaignSchema.safeParse({
      name: "Test",
      environment: "Sandbox",
      isAdmin: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("isAdmin");
    }
  });
});
