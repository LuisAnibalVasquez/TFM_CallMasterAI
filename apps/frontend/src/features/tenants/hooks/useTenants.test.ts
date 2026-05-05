import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import {
  useTenants,
  useCreateTenant,
  useUpdateTenant,
  useDeleteTenant,
} from "./useTenants";

// Mock the tenantService module
vi.mock("../services/tenantService", () => ({
  tenantService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { tenantService } from "../services/tenantService";

describe("useTenants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch tenants on mount and return data", async () => {
    const mockData = {
      data: [
        {
          id: "1",
          name: "Acme",
          phone: "",
          contactEmail: "a@b.com",
          status: "active",
          sandboxConfig: { apiUrl: "", encryptedKey: "" },
          productionConfig: { apiUrl: "", encryptedKey: "" },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    };
    vi.mocked(tenantService.list).mockResolvedValue(mockData);

    const { result } = renderHook(() => useTenants());

    // Initial state should be loading
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tenants).toEqual(mockData.data);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("should handle fetch error", async () => {
    vi.mocked(tenantService.list).mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.tenants).toEqual([]);
  });

  it("should support refetch", async () => {
    const mockData = {
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    };
    vi.mocked(tenantService.list).mockResolvedValue(mockData);

    const { result } = renderHook(() => useTenants());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    vi.mocked(tenantService.list).mockResolvedValue({
      ...mockData,
      data: [
        {
          id: "2",
          name: "Beta",
          phone: "",
          contactEmail: "b@b.com",
          status: "active",
          sandboxConfig: { apiUrl: "", encryptedKey: "" },
          productionConfig: { apiUrl: "", encryptedKey: "" },
        },
      ],
      total: 1,
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.tenants).toHaveLength(1);
    expect(result.current.tenants[0].name).toBe("Beta");
  });
});

describe("useCreateTenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a tenant and return result", async () => {
    const mockResult = {
      tenant: {
        id: "1",
        name: "Acme",
        phone: "",
        contactEmail: "a@b.com",
        status: "active",
        sandboxConfig: { apiUrl: "", encryptedKey: "" },
        productionConfig: { apiUrl: "", encryptedKey: "" },
      },
      adminCredentials: {
        email: "admin@acme.com",
        temporaryPassword: "abc123A1!",
      },
    };
    vi.mocked(tenantService.create).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useCreateTenant());

    await act(async () => {
      await result.current.createTenant({
        name: "Acme",
        contactEmail: "a@b.com",
        sandboxConfig: { apiUrl: "https://a.com", apiKey: "k" },
        productionConfig: { apiUrl: "https://a.com", apiKey: "k" },
      });
    });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.result).toEqual(mockResult);
    expect(result.current.error).toBeNull();
  });

  it("should handle creation error", async () => {
    vi.mocked(tenantService.create).mockRejectedValue(
      new Error("Duplicate email"),
    );

    const { result } = renderHook(() => useCreateTenant());

    await act(async () => {
      try {
        await result.current.createTenant({
          name: "Acme",
          contactEmail: "a@b.com",
          sandboxConfig: { apiUrl: "https://a.com", apiKey: "k" },
          productionConfig: { apiUrl: "https://a.com", apiKey: "k" },
        });
      } catch {
        // Expected
      }
    });

    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBe("Duplicate email");
  });

  it("should clear result", async () => {
    vi.mocked(tenantService.create).mockResolvedValue({
      tenant: { id: "1" } as any,
      adminCredentials: { email: "a", temporaryPassword: "x" },
    });

    const { result } = renderHook(() => useCreateTenant());

    await act(async () => {
      await result.current.createTenant({
        name: "Acme",
        contactEmail: "a@b.com",
        sandboxConfig: { apiUrl: "https://a.com", apiKey: "k" },
        productionConfig: { apiUrl: "https://a.com", apiKey: "k" },
      });
    });

    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clearResult();
    });

    expect(result.current.result).toBeNull();
  });
});

describe("useUpdateTenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a tenant", async () => {
    const mockUpdated = {
      id: "1",
      name: "Updated",
      status: "suspended",
    };
    vi.mocked(tenantService.update).mockResolvedValue(mockUpdated as any);

    const { result } = renderHook(() => useUpdateTenant());

    let returned: any;
    await act(async () => {
      returned = await result.current.updateTenant("1", {
        name: "Updated",
        status: "suspended",
      });
    });

    expect(result.current.isUpdating).toBe(false);
    expect(returned).toEqual(mockUpdated);
  });

  it("should handle update error", async () => {
    vi.mocked(tenantService.update).mockRejectedValue(new Error("Not found"));

    const { result } = renderHook(() => useUpdateTenant());

    await act(async () => {
      try {
        await result.current.updateTenant("1", { name: "X" });
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Not found");
  });
});

describe("useDeleteTenant", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a tenant", async () => {
    vi.mocked(tenantService.delete).mockResolvedValue({} as any);

    const { result } = renderHook(() => useDeleteTenant());

    await act(async () => {
      await result.current.deleteTenant("1");
    });

    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle delete error", async () => {
    vi.mocked(tenantService.delete).mockRejectedValue(
      new Error("Cannot delete tenant with campaigns"),
    );

    const { result } = renderHook(() => useDeleteTenant());

    await act(async () => {
      try {
        await result.current.deleteTenant("1");
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Cannot delete tenant with campaigns");
  });
});
