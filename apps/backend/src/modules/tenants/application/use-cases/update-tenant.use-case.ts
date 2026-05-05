import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Tenant } from "../../domain/entities/tenant.entity";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";
import { EncryptionService } from "../../infrastructure/providers/encryption.service";
import { UpdateTenantDto } from "../dto/update-tenant.dto";

@Injectable()
export class UpdateTenantUseCase {
  constructor(
    @Inject("ITenantRepository")
    private readonly tenantRepository: ITenantRepository,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

  async execute(tenantId: string, dto: UpdateTenantDto): Promise<Tenant> {
    const existingTenant = await this.tenantRepository.findById(tenantId);
    if (!existingTenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found`);
    }

    // Build the delta to apply. Only include fields that were provided.
    const delta: Partial<Tenant> = {};

    if (dto.status !== undefined) {
      delta.status = dto.status;
    }

    if (dto.name !== undefined) {
      delta.name = dto.name;
    }

    if (dto.phone !== undefined) {
      delta.phone = dto.phone;
    }

    if (dto.contactEmail !== undefined) {
      delta.contactEmail = dto.contactEmail;
    }

    if (dto.contactPerson !== undefined) {
      delta.contactPerson = dto.contactPerson;
    }

    if (dto.logoUrl !== undefined) {
      delta.logoUrl = dto.logoUrl;
    }

    // Encrypt new API keys if provided
    if (dto.sandboxConfig) {
      const masterKey = this.configService.get<string>("ENCRYPTION_MASTER_KEY");
      if (!masterKey) {
        throw new Error(
          "ENCRYPTION_MASTER_KEY is not configured in environment",
        );
      }

      const encryptedKey = await this.encryptionService.encryptSecret(
        dto.sandboxConfig.apiKey,
        masterKey,
      );
      delta.sandboxConfig = {
        apiUrl: dto.sandboxConfig.apiUrl,
        encryptedKey: encryptedKey,
      };
    }

    if (dto.productionConfig) {
      const masterKey = this.configService.get<string>("ENCRYPTION_MASTER_KEY");
      if (!masterKey) {
        throw new Error(
          "ENCRYPTION_MASTER_KEY is not configured in environment",
        );
      }

      const encryptedKey = await this.encryptionService.encryptSecret(
        dto.productionConfig.apiKey,
        masterKey,
      );
      delta.productionConfig = {
        apiUrl: dto.productionConfig.apiUrl,
        encryptedKey: encryptedKey,
      };
    }

    return this.tenantRepository.update(tenantId, delta);
  }
}
