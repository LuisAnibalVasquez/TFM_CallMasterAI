import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { CreateTenantUseCase } from "./create-tenant.use-case";
import { EncryptionService } from "../../infrastructure/providers/encryption.service";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";
import { Tenant } from "../../domain/entities/tenant.entity";
import { CreateTenantDto } from "../dto/create-tenant.dto";

describe("CreateTenantUseCase", () => {
  let useCase: CreateTenantUseCase;
  let tenantRepository: jest.Mocked<ITenantRepository>;
  let encryptionService: jest.Mocked<EncryptionService>;
  let configService: jest.Mocked<ConfigService>;

  const masterKey = "test-master-key-32bytes!!";
  const encryptedSandboxKey = "encrypted-sandbox-hex";
  const encryptedProductionKey = "encrypted-production-hex";
  const testUserId = "auth-user-uuid";

  const validDto: CreateTenantDto = {
    name: "Acme Corp",
    contactEmail: "admin@acme.com",
    phone: "+1234567890",
    contactPerson: "John Doe",
    logoUrl: "https://acme.com/logo.png",
    sandboxConfig: {
      apiUrl: "https://sandbox.voiceflow.com",
      apiKey: "sk-sandbox-key",
    },
    productionConfig: {
      apiUrl: "https://api.voiceflow.com",
      apiKey: "sk-prod-key",
    },
  };

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
      listUsersByTenant: jest.fn(),
      deleteAuthUser: jest.fn(),
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
        CreateTenantUseCase,
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

    useCase = module.get<CreateTenantUseCase>(CreateTenantUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should encrypt both API keys before inserting the tenant", async () => {
    encryptionService.encryptSecret
      .mockResolvedValueOnce(encryptedSandboxKey)
      .mockResolvedValueOnce(encryptedProductionKey);

    tenantRepository.create.mockResolvedValue({ id: "tenant-1" } as Tenant);
    tenantRepository.createAdminUser.mockResolvedValue({ userId: testUserId });
    tenantRepository.linkUserToTenant.mockResolvedValue(undefined);

    await useCase.execute(validDto);

    expect(encryptionService.encryptSecret).toHaveBeenCalledTimes(2);
    expect(encryptionService.encryptSecret).toHaveBeenNthCalledWith(
      1,
      "sk-sandbox-key",
      masterKey,
    );
    expect(encryptionService.encryptSecret).toHaveBeenNthCalledWith(
      2,
      "sk-prod-key",
      masterKey,
    );

    // Verify the tenant was created with encrypted keys, not plaintext
    expect(tenantRepository.create).toHaveBeenCalledTimes(1);
    const createdTenantArg = tenantRepository.create.mock.calls[0][0];
    expect(createdTenantArg.sandboxConfig.encryptedKey).toBe(
      encryptedSandboxKey,
    );
    expect(createdTenantArg.productionConfig.encryptedKey).toBe(
      encryptedProductionKey,
    );
  });

  it("should return temp password exactly once in the response", async () => {
    encryptionService.encryptSecret.mockResolvedValue(encryptedSandboxKey);
    tenantRepository.create.mockResolvedValue({ id: "tenant-1" } as Tenant);
    tenantRepository.createAdminUser.mockResolvedValue({ userId: testUserId });
    tenantRepository.linkUserToTenant.mockResolvedValue(undefined);

    const result = await useCase.execute(validDto);

    expect(result.adminCredentials.temporaryPassword).toBeDefined();
    expect(
      result.adminCredentials.temporaryPassword.length,
    ).toBeGreaterThanOrEqual(8);
    expect(result.adminCredentials.email).toBe(validDto.contactEmail);
    expect(result.tenant).toBeDefined();
  });

  it("should create admin user with the contact email and generated temp password", async () => {
    encryptionService.encryptSecret.mockResolvedValue(encryptedSandboxKey);
    tenantRepository.create.mockResolvedValue({ id: "tenant-1" } as Tenant);
    tenantRepository.createAdminUser.mockResolvedValue({ userId: testUserId });
    tenantRepository.linkUserToTenant.mockResolvedValue(undefined);

    await useCase.execute(validDto);

    expect(tenantRepository.createAdminUser).toHaveBeenCalledTimes(1);
    const [email, password] = tenantRepository.createAdminUser.mock.calls[0];
    expect(email).toBe(validDto.contactEmail);
    expect(password).toBeDefined();
    expect(password).toMatch(/[A-Z]/); // has uppercase
    expect(password).toMatch(/[0-9]/); // has digit
    expect(password).toMatch(/[!@#$%^&*]/); // has special char
  });

  it("should link the admin user to the created tenant", async () => {
    encryptionService.encryptSecret.mockResolvedValue(encryptedSandboxKey);
    tenantRepository.create.mockResolvedValue({ id: "tenant-uuid" } as Tenant);
    tenantRepository.createAdminUser.mockResolvedValue({ userId: testUserId });
    tenantRepository.linkUserToTenant.mockResolvedValue(undefined);

    await useCase.execute(validDto);

    expect(tenantRepository.linkUserToTenant).toHaveBeenCalledWith(
      testUserId,
      "tenant-uuid",
    );
  });

  it("should throw if ENCRYPTION_MASTER_KEY is not configured", async () => {
    configService.get.mockReturnValue(null);

    await expect(useCase.execute(validDto)).rejects.toThrow(
      "ENCRYPTION_MASTER_KEY is not configured",
    );
  });

  it("should propagate encryption errors", async () => {
    encryptionService.encryptSecret.mockRejectedValue(
      new Error("Encryption failed"),
    );

    await expect(useCase.execute(validDto)).rejects.toThrow(
      "Encryption failed",
    );
  });
});
