import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";

@Injectable()
export class DeleteTenantUseCase {
  constructor(
    @Inject("ITenantRepository")
    private readonly tenantRepository: ITenantRepository,
  ) {}

  async execute(tenantId: string): Promise<void> {
    // 1. Verify tenant exists
    const tenant = await this.tenantRepository.findById(tenantId);
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // 2. Count campaigns for this tenant
    const campaignCount = await this.tenantRepository.countCampaigns(tenantId);

    // 3. Reject deletion if campaigns exist
    if (campaignCount > 0) {
      throw new ConflictException(
        "Cannot delete tenant with existing campaigns. Remove all campaigns first.",
      );
    }

    // 4. Delete all Auth users belonging to this tenant
    const userIds = await this.tenantRepository.listUsersByTenant(tenantId);
    for (const userId of userIds) {
      await this.tenantRepository.deleteAuthUser(userId);
    }

    // 5. Finally, delete the tenant record
    await this.tenantRepository.delete(tenantId);
  }
}
