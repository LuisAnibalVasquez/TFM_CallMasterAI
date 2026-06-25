import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { CampaignStatus } from "@callmaster/shared";

export interface DeleteCampaignInput {
  campaignId: string;
  tenantId: string;
}

@Injectable()
export class DeleteCampaignUseCase {
  constructor(
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(input: DeleteCampaignInput): Promise<void> {
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign || campaign.tenantId !== input.tenantId) {
      throw new NotFoundException("Campaign not found");
    }

    if (
      campaign.status === CampaignStatus.COMPLETED ||
      campaign.status === CampaignStatus.CANCELLED
    ) {
      throw new BadRequestException(
        "Cannot delete a completed or cancelled campaign",
      );
    }

    await this.campaignRepository.delete(input.campaignId);
  }
}
