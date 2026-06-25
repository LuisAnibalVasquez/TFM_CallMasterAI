import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { Inngest } from "inngest";
import { Campaign } from "../../domain/entities/campaign.entity";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";
import { CampaignStatus } from "@callmaster/shared";

export interface StartCampaignInput {
  campaignId: string;
  tenantId: string;
}

@Injectable()
export class StartCampaignUseCase {
  private readonly logger = new Logger(StartCampaignUseCase.name);

  constructor(
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
    @Inject("InngestClient")
    private readonly inngest: Inngest,
  ) {}

  async execute(input: StartCampaignInput): Promise<Campaign> {
    const campaign = await this.campaignRepository.findById(input.campaignId);

    if (!campaign || campaign.tenantId !== input.tenantId) {
      throw new NotFoundException("Campaign not found");
    }

    if (campaign.status !== CampaignStatus.CREATED) {
      throw new BadRequestException(
        `Campaign cannot be started. Current status: ${campaign.status}`,
      );
    }

    const updated = await this.campaignRepository.update(input.campaignId, {
      status: CampaignStatus.IN_PROGRESS,
    });

    // Emit Inngest event to trigger the orchestration flow
    await this.inngest.send({
      name: "campaign.started",
      data: {
        campaignId: input.campaignId,
        tenantId: input.tenantId,
      },
    });

    this.logger.log(
      `Emitted campaign.started event for campaign ${input.campaignId}`,
    );

    return updated;
  }
}
