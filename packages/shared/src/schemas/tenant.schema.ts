// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { z } from "zod";

// ── Nested AI config ────────────────────────────────────────
const aiConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().trim().min(1),
});

// ── Create Tenant ───────────────────────────────────────────
export const createTenantSchema = z.object({
  name: z.string().trim().min(1),
  contactEmail: z.string().email(),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  logoUrl: z.string().url().optional(),
  sandboxConfig: aiConfigSchema,
  productionConfig: aiConfigSchema,
});

export type CreateTenantFormInput = z.infer<typeof createTenantSchema>;

// ── Update Tenant ───────────────────────────────────────────
export const updateTenantSchema = z.object({
  name: z.string().trim().min(1).optional(),
  contactEmail: z.string().email().optional(),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  logoUrl: z.string().url().optional(),
  status: z.enum(["active", "suspended"]).optional(),
  sandboxConfig: aiConfigSchema.optional(),
  productionConfig: aiConfigSchema.optional(),
});

export type UpdateTenantFormInput = z.infer<typeof updateTenantSchema>;
