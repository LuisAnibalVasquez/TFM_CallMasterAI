import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock apiClient before importing tenantService
const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPut = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../../shared/api/ApiClient", () => ({
  apiClient: {
    get: (...args: any[]) => mockGet(...args),
    post: (...args: any[]) => mockPost(...args),
    put: (...args: any[]) => mockPut(...args),
    delete: (...args: any[]) => mockDelete(...args),
  },
}));

import { tenantService } from "./tenantService";

describe("tenantService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should list tenants with pagination params", async () => {
    const mockResponse = {
      data: [
        { id: "1", name: "Acme", contactEmail: "a@b.com", status: "active" },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };
    mockGet.mockResolvedValue(mockResponse);

    const result = await tenantService.list(1, 20);

    expect(mockGet).toHaveBeenCalledWith("/tenants", {
      params: { page: 1, limit: 20 },
    });
    expect(result).toEqual(mockResponse);
  });

  it("should create a tenant with AI config", async () => {
    const mockResult = {
      tenant: { id: "1", name: "Acme" },
      adminCredentials: {
        email: "admin@acme.com",
        temporaryPassword: "abc123A1!",
      },
    };
    mockPost.mockResolvedValue(mockResult);

    const input = {
      name: "Acme",
      contactEmail: "admin@acme.com",
      sandboxConfig: {
        apiUrl: "https://sandbox.api.com",
        apiKey: "sk-sandbox",
      },
      productionConfig: { apiUrl: "https://api.com", apiKey: "sk-prod" },
    };

    const result = await tenantService.create(input);

    expect(mockPost).toHaveBeenCalledWith("/tenants", input);
    expect(result.adminCredentials.temporaryPassword).toBe("abc123A1!");
  });

  it("should update a tenant by ID", async () => {
    const mockTenant = { id: "1", name: "Updated", status: "suspended" };
    mockPut.mockResolvedValue(mockTenant);

    const result = await tenantService.update("1", {
      name: "Updated",
      status: "suspended",
    });

    expect(mockPut).toHaveBeenCalledWith("/tenants/1", {
      name: "Updated",
      status: "suspended",
    });
    expect(result).toEqual(mockTenant);
  });

  it("should delete a tenant by ID", async () => {
    mockDelete.mockResolvedValue({});

    const result = await tenantService.delete("1");

    expect(mockDelete).toHaveBeenCalledWith("/tenants/1");
    expect(result).toEqual({});
  });

  it("should handle create error propagation", async () => {
    mockPost.mockRejectedValue(new Error("Cannot create tenant"));

    await expect(
      tenantService.create({
        name: "Acme",
        contactEmail: "a@b.com",
        sandboxConfig: { apiUrl: "https://a.com", apiKey: "k" },
        productionConfig: { apiUrl: "https://a.com", apiKey: "k" },
      }),
    ).rejects.toThrow("Cannot create tenant");
  });

  it("should list tenants with default pagination", async () => {
    mockGet.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    await tenantService.list();

    expect(mockGet).toHaveBeenCalledWith("/tenants", {
      params: { page: 1, limit: 20 },
    });
  });
});
