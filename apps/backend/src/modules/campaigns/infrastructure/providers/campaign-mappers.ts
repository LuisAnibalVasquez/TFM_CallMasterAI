// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Campaign } from "../../domain/entities/campaign.entity";
import { CallRecord } from "../../domain/ports/campaign-repository.port";

/**
 * Maps a raw Supabase row to a Campaign domain entity.
 * Shared by CampaignsService and CampaignsAdminService.
 */
export function mapToCampaign(row: any): Campaign {
  return new Campaign({
    id: row.id,
    tenantId: row.tenant_id,
    name: row.name,
    status: row.status,
    environment: row.environment,
    csvUrl: row.csv_url || "",
    totalCalls: row.total_calls ?? 0,
    successfulCalls: row.successful_calls ?? 0,
    failedCalls: row.failed_calls ?? 0,
    totalCost:
      typeof row.total_cost === "string"
        ? parseFloat(row.total_cost)
        : (row.total_cost ?? 0),
    createdAt: new Date(row.created_at),
  });
}

/**
 * Maps a raw Supabase row to a CallRecord.
 * Shared by CampaignsService and CampaignsAdminService.
 */
export function mapToCall(row: any): CallRecord {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    customerName: row.customer_name,
    phoneEncrypted: row.phone_encrypted,
    phoneHash: row.phone_hash,
    language: row.language,
    age: row.age,
    duration: row.duration,
    status: row.status,
    cost: typeof row.cost === "string" ? parseFloat(row.cost) : (row.cost ?? 0),
    voiceflowTranscriptId: row.voiceflow_transcript_id,
    createdAt: new Date(row.created_at),
  };
}
