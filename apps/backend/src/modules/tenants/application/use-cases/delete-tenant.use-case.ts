import { ConflictException, Inject, Injectable } from "@nestjs/common";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";

@Injectable()
export class DeleteTenantUseCase {
  constructor(
    @Inject("ITenantRepository")
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: string): Promise<void> {
    // 1. Count campaigns for this tenant
    const campaignCount = await this.tenantRepository.countCampaigns(tenantId);

    // 2. Reject deletion if campaigns exist
    if (campaignCount > 0) {
      throw new ConflictException(
        "Cannot delete tenant with existing campaigns. Remove all campaigns first.",
      );
    }

    // 3. Proceed with deletion (DB-level RESTRICT FK also enforces this)
    await this.tenantRepository.delete(tenantId);
  }
}
