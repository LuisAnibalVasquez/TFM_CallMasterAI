import { Test, TestingModule } from "@nestjs/testing";
import { ConflictException, NotFoundException } from "@nestjs/common";
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
      listUsersByTenant: jest.fn(),
      deleteAuthUser: jest.fn(),
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

  it("should throw NotFoundException if tenant does not exist", async () => {
    tenantRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(tenantId)).rejects.toThrow(NotFoundException);
    await expect(useCase.execute(tenantId)).rejects.toThrow(
      `Tenant with ID ${tenantId} not found`,
    );

    expect(tenantRepository.countCampaigns).not.toHaveBeenCalled();
    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should delete the tenant when campaign count is 0", async () => {
    tenantRepository.findById.mockResolvedValue({
      id: tenantId,
      name: "Test",
      status: "active",
    } as any);
    tenantRepository.countCampaigns.mockResolvedValue(0);
    tenantRepository.listUsersByTenant.mockResolvedValue([]);
    tenantRepository.delete.mockResolvedValue(undefined);

    await useCase.execute(tenantId);

    expect(tenantRepository.countCampaigns).toHaveBeenCalledWith(tenantId);
    expect(tenantRepository.listUsersByTenant).toHaveBeenCalledWith(tenantId);
    expect(tenantRepository.delete).toHaveBeenCalledWith(tenantId);
  });

  it("should reject deletion when campaign count is greater than 0", async () => {
    tenantRepository.findById.mockResolvedValue({
      id: tenantId,
      name: "Test",
      status: "active",
    } as any);
    tenantRepository.countCampaigns.mockResolvedValue(5);

    await expect(useCase.execute(tenantId)).rejects.toThrow(ConflictException);
    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "Cannot delete tenant with existing campaigns",
    );

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should reject deletion when campaign count is 1", async () => {
    tenantRepository.findById.mockResolvedValue({
      id: tenantId,
      name: "Test",
      status: "active",
    } as any);
    tenantRepository.countCampaigns.mockResolvedValue(1);

    await expect(useCase.execute(tenantId)).rejects.toThrow(ConflictException);

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors during count", async () => {
    tenantRepository.findById.mockResolvedValue({
      id: tenantId,
      name: "Test",
      status: "active",
    } as any);
    tenantRepository.countCampaigns.mockRejectedValue(
      new Error("DB connection failed"),
    );

    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "DB connection failed",
    );

    expect(tenantRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate repository errors during delete", async () => {
    tenantRepository.findById.mockResolvedValue({
      id: tenantId,
      name: "Test",
      status: "active",
    } as any);
    tenantRepository.countCampaigns.mockResolvedValue(0);
    tenantRepository.listUsersByTenant.mockResolvedValue([]);
    tenantRepository.delete.mockRejectedValue(
      new Error("FK constraint violation"),
    );

    await expect(useCase.execute(tenantId)).rejects.toThrow(
      "FK constraint violation",
    );
  });

  describe("Auth user cascade on delete", () => {
    it("should delete all Auth users before deleting the tenant", async () => {
      tenantRepository.findById.mockResolvedValue({
        id: tenantId,
        name: "Test",
        status: "active",
      } as any);
      tenantRepository.countCampaigns.mockResolvedValue(0);
      tenantRepository.listUsersByTenant.mockResolvedValue([
        "user-1",
        "user-2",
        "user-3",
      ]);
      tenantRepository.deleteAuthUser.mockResolvedValue(undefined);
      tenantRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(tenantId);

      expect(tenantRepository.listUsersByTenant).toHaveBeenCalledWith(tenantId);
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledTimes(3);
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledWith("user-1");
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledWith("user-2");
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledWith("user-3");
      expect(tenantRepository.delete).toHaveBeenCalledWith(tenantId);
    });

    it("should still delete tenant when tenant has no associated users", async () => {
      tenantRepository.findById.mockResolvedValue({
        id: tenantId,
        name: "Test",
        status: "active",
      } as any);
      tenantRepository.countCampaigns.mockResolvedValue(0);
      tenantRepository.listUsersByTenant.mockResolvedValue([]);
      tenantRepository.delete.mockResolvedValue(undefined);

      await useCase.execute(tenantId);

      expect(tenantRepository.listUsersByTenant).toHaveBeenCalledWith(tenantId);
      expect(tenantRepository.deleteAuthUser).not.toHaveBeenCalled();
      expect(tenantRepository.delete).toHaveBeenCalledWith(tenantId);
    });

    it("should abort deletion and NOT delete tenant when Auth user deletion fails", async () => {
      tenantRepository.findById.mockResolvedValue({
        id: tenantId,
        name: "Test",
        status: "active",
      } as any);
      tenantRepository.countCampaigns.mockResolvedValue(0);
      tenantRepository.listUsersByTenant.mockResolvedValue([
        "user-1",
        "user-2",
      ]);
      tenantRepository.deleteAuthUser.mockResolvedValueOnce(undefined);
      tenantRepository.deleteAuthUser.mockRejectedValueOnce(
        new Error("Network failure"),
      );

      await expect(useCase.execute(tenantId)).rejects.toThrow(
        "Network failure",
      );

      expect(tenantRepository.delete).not.toHaveBeenCalled();
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledTimes(2);
    });

    it("should abort and NOT delete remaining users when one Auth deletion fails", async () => {
      tenantRepository.findById.mockResolvedValue({
        id: tenantId,
        name: "Test",
        status: "active",
      } as any);
      tenantRepository.countCampaigns.mockResolvedValue(0);
      tenantRepository.listUsersByTenant.mockResolvedValue([
        "user-1",
        "user-2",
        "user-3",
      ]);
      // First user deleted OK, second fails
      tenantRepository.deleteAuthUser.mockResolvedValueOnce(undefined);
      tenantRepository.deleteAuthUser.mockRejectedValueOnce(
        new Error("Auth service unavailable"),
      );

      await expect(useCase.execute(tenantId)).rejects.toThrow(
        "Auth service unavailable",
      );

      // Third user should NOT be attempted
      expect(tenantRepository.deleteAuthUser).toHaveBeenCalledTimes(2);
      expect(tenantRepository.delete).not.toHaveBeenCalled();
    });
  });
});
