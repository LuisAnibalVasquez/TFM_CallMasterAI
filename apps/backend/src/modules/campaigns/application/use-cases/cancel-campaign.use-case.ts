import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { Campaign } from "../../domain/entities/campaign.entity";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { CampaignStatus } from "@callmaster/shared";

export interface CancelCampaignInput {
  campaignId: string;
  tenantId: string;
}

@Injectable()
export class CancelCampaignUseCase {
  constructor(
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(input: CancelCampaignInput): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign || campaign.tenantId !== input.tenantId) {
      throw new NotFoundException("Campaign not found");
    }

    if (campaign.status !== CampaignStatus.IN_PROGRESS) {
      throw new BadRequestException(
        `Campaign cannot be cancelled. Current status: ${campaign.status}`,
      );
    }

    return this.campaignRepository.update(input.campaignId, {
      status: CampaignStatus.CANCELLED,
    });
  }
}
