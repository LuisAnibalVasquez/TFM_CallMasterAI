import { Inject, Injectable, BadRequestException } from "@nestjs/common";
import { Campaign } from "../../domain/entities/campaign.entity";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { parseCsvToRows } from "../../domain/services/csv-parser.service";
import { CampaignEnvironment } from "@callmaster/shared";

export interface CreateCampaignInput {
  tenantId: string;
  name: string;
  environment: string;
  csvContent: string;
}

export interface CreateCampaignResult {
  campaign: Campaign;
  insertedCalls: number;
}

@Injectable()
export class CreateCampaignUseCase {
  constructor(
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(input: CreateCampaignInput): Promise<CreateCampaignResult> {
    // 1. Parse and validate CSV rows
    const parseResult = parseCsvToRows(input.csvContent);

    if (!parseResult.success) {
      const errorMessages = parseResult.errors.map((e) => e.message).join("; ");
      throw new BadRequestException(`CSV validation failed: ${errorMessages}`);
    }

    // 2. Create the campaign domain entity
    const campaign = Campaign.create({
      tenantId: input.tenantId,
      name: input.name,
      environment: input.environment as CampaignEnvironment,
      csvUrl: "", // no persistent file URL since CSV is processed in-memory
    });

    // 3. Persist the campaign
    await this.campaignRepository.create(campaign);

    // 4. Bulk insert call records
    const calls = parseResult.rows.map((row) => ({
      customerName: row.customerName,
      phone: row.phone,
      language: row.language,
      age: row.age,
    }));
    await this.campaignRepository.bulkInsertCalls(campaign.id, calls);

    return {
      campaign,
      insertedCalls: calls.length,
    };
  }
}
