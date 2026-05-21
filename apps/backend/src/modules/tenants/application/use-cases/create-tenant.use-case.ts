import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TenantStatus } from "@callmaster/shared";
import { Tenant } from "../../domain/entities/tenant.entity";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";
import { EncryptionService } from "../../infrastructure/providers/encryption.service";
import { CreateTenantDto } from "../dto/create-tenant.dto";
import * as crypto from "crypto";

export interface CreateTenantResult {
  tenant: Tenant;
  adminCredentials: {
    email: string;
    temporaryPassword: string;
  };
}

@Injectable()
export class CreateTenantUseCase {
  constructor(
    @Inject("ITenantRepository")
    private readonly tenantRepository: ITenantRepository,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

  async execute(dto: CreateTenantDto): Promise<CreateTenantResult> {
    const masterKey = this.configService.get<string>("ENCRYPTION_MASTER_KEY");
    if (!masterKey) {
      throw new Error("ENCRYPTION_MASTER_KEY is not configured in environment");
    }

    // 1. Encrypt both API keys before storage
    const encryptedSandboxKey = await this.encryptionService.encryptSecret(
      dto.sandboxConfig.apiKey,
      masterKey,
    );
    const encryptedProductionKey = await this.encryptionService.encryptSecret(
      dto.productionConfig.apiKey,
      masterKey,
    );

    // 2. Build the tenant domain entity with encrypted configs
    const tenant = new Tenant({
      id: crypto.randomUUID(),
      name: dto.name,
      phone: dto.phone || "",
      contactEmail: dto.contactEmail,
      contactPerson: dto.contactPerson,
      logoUrl: dto.logoUrl,
      status: TenantStatus.ACTIVE,
      campaignCount: 0,
      sandboxConfig: {
        apiUrl: dto.sandboxConfig.apiUrl,
        encryptedKey: encryptedSandboxKey,
      },
      productionConfig: {
        apiUrl: dto.productionConfig.apiUrl,
        encryptedKey: encryptedProductionKey,
      },
    });

    // 3. Persist the tenant via the repository
    const createdTenant = await this.tenantRepository.create(tenant);

    // 4. Generate a secure temporary password for the admin user
    const tempPassword = crypto.randomBytes(8).toString("hex") + "A1!";

    // 5. Create the admin user in Supabase Auth
    const { userId } = await this.tenantRepository.createAdminUser(
      dto.contactEmail,
      tempPassword,
    );

    // 6. Link the admin user to the newly created tenant
    await this.tenantRepository.linkUserToTenant(userId, createdTenant.id);

    return {
      tenant: createdTenant,
      adminCredentials: {
        email: dto.contactEmail,
        temporaryPassword: tempPassword,
      },
    };
  }
}
