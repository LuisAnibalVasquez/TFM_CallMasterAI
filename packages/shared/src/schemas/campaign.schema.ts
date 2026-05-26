// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
import { z } from "zod";

export const campaignSchema = z.object({
  name: z.string().trim().min(1),
  environment: z.enum(["Sandbox", "Production"]),
});

export type CampaignFormInput = z.infer<typeof campaignSchema>;
