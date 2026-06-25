// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt2 on Tue May 26 2026
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import * as crypto from "crypto";
import { Campaign } from "../../domain/entities/campaign.entity";
import {
  ICampaignRepository,
  CreateCallInput,
  CallRecord,
} from "../../domain/ports/campaign-repository.port";
import { mapToCampaign, mapToCall } from "./campaign-mappers";

/**
 * Admin-scoped CampaignRepository implementation.
 *
 * Uses SERVICE_ROLE_KEY to bypass RLS. This is intentionally a singleton
 * — used by Inngest background jobs that need full data access.
 */
@Injectable()
export class CampaignsAdminService implements ICampaignRepository {
  private supabaseAdmin: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL");
    const serviceRoleKey = this.configService.get<string>("SERVICE_ROLE_KEY");

    this.supabaseAdmin = createClient(supabaseUrl || "", serviceRoleKey || "", {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  // ─── ICampaignRepository implementation ────────────────────────────

  async create(campaign: Campaign): Promise<Campaign> {
    const { data, error } = await this.supabaseAdmin
      .from("campaigns")
      .insert({
        id: campaign.id,
        tenant_id: campaign.tenantId,
        name: campaign.name,
        status: campaign.status,
        environment: campaign.environment,
        csv_url: campaign.csvUrl,
        total_calls: campaign.totalCalls,
        successful_calls: campaign.successfulCalls,
        failed_calls: campaign.failedCalls,
        total_cost: campaign.totalCost,
        created_at: campaign.createdAt?.toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to create campaign: ${error.message}`,
      );
    }

    return mapToCampaign(data);
  }

  async findById(id: string): Promise<Campaign | null> {
    const { data, error } = await this.supabaseAdmin
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return mapToCampaign(data);
  }

  async findByTenant(
    tenantId: string,
    options: { page: number; limit: number },
  ): Promise<{ data: Campaign[]; total: number }> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabaseAdmin
      .from("campaigns")
      .select("*", { count: "exact" })
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch campaigns: ${error.message}`,
      );
    }

    return {
      data: (data || []).map((row: any) => mapToCampaign(row)),
      total: count || 0,
    };
  }

  async update(id: string, delta: Partial<Campaign>): Promise<Campaign> {
    const updatePayload: Record<string, unknown> = {};

    if (delta.name !== undefined) updatePayload.name = delta.name;
    if (delta.status !== undefined) updatePayload.status = delta.status;
    if (delta.totalCalls !== undefined)
      updatePayload.total_calls = delta.totalCalls;
    if (delta.successfulCalls !== undefined)
      updatePayload.successful_calls = delta.successfulCalls;
    if (delta.failedCalls !== undefined)
      updatePayload.failed_calls = delta.failedCalls;
    if (delta.totalCost !== undefined)
      updatePayload.total_cost = delta.totalCost;

    const { data, error } = await this.supabaseAdmin
      .from("campaigns")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update campaign: ${error?.message || "Campaign not found"}`,
      );
    }

    return mapToCampaign(data);
  }

  async bulkInsertCalls(
    campaignId: string,
    calls: CreateCallInput[],
  ): Promise<CallRecord[]> {
    const rows = calls.map((call) => ({
      campaign_id: campaignId,
      customer_name: call.customerName,
      phone_encrypted: call.phone,
      phone_hash: this.hashPhone(call.phone),
      language: call.language,
      age: call.age,
      status: "pending",
      cost: 0,
    }));

    const { data, error } = await this.supabaseAdmin
      .from("calls")
      .insert(rows)
      .select();

    if (error) {
      throw new InternalServerErrorException(
        `Failed to insert calls: ${error.message}`,
      );
    }

    return (data || []).map((row: any) => mapToCall(row));
  }

  async findCallsByCampaign(campaignId: string): Promise<CallRecord[]> {
    const { data, error } = await this.supabaseAdmin
      .from("calls")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true });

    if (error) {
      throw new InternalServerErrorException(
        `Failed to fetch calls: ${error.message}`,
      );
    }

    return (data || []).map((row: any) => mapToCall(row));
  }

  async updateCall(
    callId: string,
    delta: Partial<CallRecord>,
  ): Promise<CallRecord> {
    const updatePayload: Record<string, unknown> = {};

    if (delta.status !== undefined) updatePayload.status = delta.status;
    if (delta.duration !== undefined) updatePayload.duration = delta.duration;
    if (delta.cost !== undefined) updatePayload.cost = delta.cost;
    if (delta.voiceflowTranscriptId !== undefined)
      updatePayload.voiceflow_transcript_id = delta.voiceflowTranscriptId;

    const { data, error } = await this.supabaseAdmin
      .from("calls")
      .update(updatePayload)
      .eq("id", callId)
      .select()
      .single();

    if (error || !data) {
      throw new InternalServerErrorException(
        `Failed to update call: ${error?.message || "Call not found"}`,
      );
    }

    return mapToCall(data);
  }

  async redactCalls(campaignId: string): Promise<number> {
    const { error, count } = await this.supabaseAdmin
      .from("calls")
      .update(
        {
          customer_name: "[redacted]",
          phone_encrypted: "[redacted]",
          phone_hash: "[redacted]",
        },
        { count: "exact" },
      )
      .eq("campaign_id", campaignId);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to redact calls: ${error.message}`,
      );
    }

    return count ?? 0;
  }

  async getTemplateDownloadUrl(): Promise<string> {
    const { data, error } = await this.supabaseAdmin.storage
      .from("template")
      .createSignedUrl("template.csv", 300);

    if (error || !data?.signedUrl) {
      throw new InternalServerErrorException(
        `Failed to generate template URL: ${error?.message || "Unknown error"}`,
      );
    }

    return data.signedUrl;
  }

  async delete(id: string): Promise<void> {
    // Delete associated calls first to respect FK constraints
    await this.supabaseAdmin.from("calls").delete().eq("campaign_id", id);

    const { error } = await this.supabaseAdmin
      .from("campaigns")
      .delete()
      .eq("id", id);

    if (error) {
      throw new InternalServerErrorException(
        `Failed to delete campaign: ${error.message}`,
      );
    }
  }

  // ─── Private helpers ───────────────────────────────────────────────

  private hashPhone(phone: string): string {
    return crypto.createHash("sha256").update(phone).digest("hex");
  }
}
