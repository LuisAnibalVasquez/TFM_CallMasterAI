import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { UpdateTenantUseCase } from "./update-tenant.use-case";
import { EncryptionService } from "../../infrastructure/providers/encryption.service";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";
import { Tenant } from "../../domain/entities/tenant.entity";
import { TenantStatus } from "@callmaster/shared";

describe("UpdateTenantUseCase", () => {
  let useCase: UpdateTenantUseCase;
  let tenantRepository: jest.Mocked<ITenantRepository>;
  let encryptionService: jest.Mocked<EncryptionService>;
  let configService: jest.Mocked<ConfigService>;

  const tenantId = "tenant-1";
  const masterKey = "test-master-key";

  const existingTenant: Tenant = new Tenant({
    id: tenantId,
    name: "Acme Corp",
    phone: "+1234567890",
    contactEmail: "admin@acme.com",
    contactPerson: "John Doe",
    logoUrl: "https://acme.com/logo.png",
    status: TenantStatus.ACTIVE,
    sandboxConfig: {
      apiUrl: "https://sandbox.voiceflow.com",
      encryptedKey: "old-encrypted-sandbox",
    },
    productionConfig: {
      apiUrl: "https://api.voiceflow.com",
      encryptedKey: "old-encrypted-prod",
    },
  });

  beforeEach(async () => {
    tenantRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      countCampaigns: jest.fn(),
      createAdminUser: jest.fn(),
      linkUserToTenant: jest.fn(),
    };

    encryptionService = {
      encryptSecret: jest.fn(),
      decryptSecret: jest.fn(),
    } as any;

    configService = {
      get: jest.fn((key: string) => {
        if (key === "ENCRYPTION_MASTER_KEY") return masterKey;
        return null;
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTenantUseCase,
        {
          provide: "ITenantRepository",
          useValue: tenantRepository,
        },
        {
          provide: EncryptionService,
          useValue: encryptionService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateTenantUseCase>(UpdateTenantUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should throw NotFoundException if tenant does not exist", async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(tenantId, { name: "New Name" }),
    ).rejects.toThrow(NotFoundException);
  });

  it("should update only the provided fields", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue({
      ...existingTenant,
      name: "New Name",
    } as Tenant);

    await useCase.execute(tenantId, { name: "New Name" });

    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {
      name: "New Name",
    });
  });

  it("should toggle status when status field is provided", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue({
      ...existingTenant,
      status: TenantStatus.SUSPENDED,
    } as Tenant);

    await useCase.execute(tenantId, { status: TenantStatus.SUSPENDED });

    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {
      status: TenantStatus.SUSPENDED,
    });
  });

  it("should encrypt sandbox API key when sandboxConfig is provided", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue(existingTenant);
    encryptionService.encryptSecret.mockResolvedValue("new-encrypted-sandbox");

    await useCase.execute(tenantId, {
      sandboxConfig: {
        apiUrl: "https://new-sandbox.voiceflow.com",
        apiKey: "new-sk-sandbox",
      },
    });

    expect(encryptionService.encryptSecret).toHaveBeenCalledWith(
      "new-sk-sandbox",
      masterKey,
    );
    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {
      sandboxConfig: {
        apiUrl: "https://new-sandbox.voiceflow.com",
        encryptedKey: "new-encrypted-sandbox",
      },
    });
  });

  it("should encrypt production API key when productionConfig is provided", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue(existingTenant);
    encryptionService.encryptSecret.mockResolvedValue("new-encrypted-prod");

    await useCase.execute(tenantId, {
      productionConfig: {
        apiUrl: "https://new-api.voiceflow.com",
        apiKey: "new-sk-prod",
      },
    });

    expect(encryptionService.encryptSecret).toHaveBeenCalledWith(
      "new-sk-prod",
      masterKey,
    );
    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {
      productionConfig: {
        apiUrl: "https://new-api.voiceflow.com",
        encryptedKey: "new-encrypted-prod",
      },
    });
  });

  it("should update multiple fields at once", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue(existingTenant);

    await useCase.execute(tenantId, {
      name: "Acme Intl",
      phone: "+9876543210",
      status: TenantStatus.SUSPENDED,
    });

    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {
      name: "Acme Intl",
      phone: "+9876543210",
      status: TenantStatus.SUSPENDED,
    });
  });

  it("should not update any field if no fields are provided", async () => {
    tenantRepository.findById.mockResolvedValue(existingTenant);
    tenantRepository.update.mockResolvedValue(existingTenant);

    await useCase.execute(tenantId, {});

    expect(tenantRepository.update).toHaveBeenCalledWith(tenantId, {});
  });
});
