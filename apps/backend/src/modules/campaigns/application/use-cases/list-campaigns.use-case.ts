import { Inject, Injectable } from "@nestjs/common";
import { Campaign } from "../../domain/entities/campaign.entity";
import { ICampaignRepository } from "../../domain/ports/campaign-repository.port";

export interface PaginatedCampaigns {
  data: Campaign[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ListCampaignsUseCase {
  constructor(
    @Inject("ICampaignRepository")
    private readonly campaignRepository: ICampaignRepository,
  ) {}

  async execute(
    tenantId: string,
    options?: { page?: number; limit?: number },
  ): Promise<PaginatedCampaigns> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 20;

    const { data, total } = await this.campaignRepository.findByTenant(
      tenantId,
      { page, limit },
    );

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
