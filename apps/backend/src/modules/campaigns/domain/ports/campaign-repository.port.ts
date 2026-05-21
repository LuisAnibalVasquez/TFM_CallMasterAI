import { Campaign } from "../entities/campaign.entity";

export interface CallRecord {
  id: string;
  campaignId: string;
  customerName: string;
  phoneEncrypted: string;
  phoneHash: string;
  language: string;
  age: number;
  duration?: number;
  status: string;
  cost: number;
  voiceflowTranscriptId?: string;
  createdAt: Date;
}

export interface CreateCallInput {
  customerName: string;
  phone: string;
  language: string;
  age: number;
}

export interface ICampaignRepository {
  create(campaign: Campaign): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  findByTenant(
    tenantId: string,
    options: { page: number; limit: number },
  ): Promise<{ data: Campaign[]; total: number }>;
  update(id: string, delta: Partial<Campaign>): Promise<Campaign>;
  bulkInsertCalls(
    campaignId: string,
    calls: CreateCallInput[],
  ): Promise<CallRecord[]>;
  findCallsByCampaign(campaignId: string): Promise<CallRecord[]>;
}
