// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().trim().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
