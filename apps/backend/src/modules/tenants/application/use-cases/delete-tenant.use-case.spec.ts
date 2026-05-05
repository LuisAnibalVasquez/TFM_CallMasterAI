import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException } from "@nestjs/common";
import { DeleteTenantUseCase } from "./delete-tenant.use-case";
import { ITenantRepository } from "../../domain/ports/tenant-repository.port";

describe("DeleteTenantUseCase", () => {
  let useCase: DeleteTenantUseCase;
  let tenantRepository: jest.Mocked<ITenantRepository>;

  const tenantId = "tenant-1";

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteTenantUseCase,
        {
          provide: "ITenantRepository",
          useValue: tenantRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteTenantUseCase>(DeleteTenantUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should delete the tenant when campaign count is 0", async () => {
    tenantRepository.countCampaigns.mockResolvedValue(0);
    tenantRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(tenantId);

    expect(tenantRepository.countCampaigns).toHaveBeenCalledWith(tenantId);
    expect(tenantRepository.delete).toHaveBeenCalledWith(tenantId);
  });

  it("should reject deletion when campaign count is greater than 0", async () => {
    tenantRepository.countCampaigns.mockResolvedValue(5);

    await expect(useCase.execute(tenantId)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "Cannot delete tenant with existing campaigns",
    );

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should reject deletion when campaign count is 1", async () => {
    tenantRepository.countCampaigns.mockResolvedValue(1);

    await expect(useCase.execute(tenantId)).rejects.toThrow(ConflictException);

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors during count", async () => {
    tenantRepository.countCampaigns.mockRejectedValue(
      new Error("DB connection failed"),
    );

    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "DB connection failed",
    );

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors during delete", async () => {
    tenantRepository.countCampaigns.mockResolvedValue(0);
    tenantRepository.delete.mockRejectedValue(
      new Error("FK constraint violation"),
    );

    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "FK constraint violation",
    );
  });
});
