// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { describe, it, expect } from "vitest";
import { loginSchema } from "../src/schemas/login.schema";

describe("loginSchema", () => {
  // ── Happy path ────────────────────────────────────────────
  it("accepts a valid email and non-empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
    });
    expect(result.success).toBe(true);
  });

  // ── Invalid email ─────────────────────────────────────────
  it("rejects an email missing the @ symbol", () => {
    const result = loginSchema.safeParse({
      email: "invalid-email",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  it("rejects an empty email string", () => {
    const result = loginSchema.safeParse({
      email: "",
      password: "secret123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("email");
    }
  });

  // ── Invalid password ──────────────────────────────────────
  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  it("rejects a whitespace-only password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "   ",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain("password");
    }
  });

  // ── Missing fields ────────────────────────────────────────
  it("rejects input missing the email field", () => {
    const result = loginSchema.safeParse({
      password: "secret123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects input missing the password field", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
    });
    expect(result.success).toBe(false);
  });

  // ── Extra fields ──────────────────────────────────────────
  it("strips extra fields not declared in the schema (zod strips by default)", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "secret123",
      isAdmin: true,
    });
    // Zod .safeParse strips unknown keys by default, so this should succeed
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty("isAdmin");
    }
  });
});
