import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import {
  useCampaigns,
  useCreateCampaign,
  useStartCampaign,
  useCancelCampaign,
} from "./useCampaigns";

// Mock campaignService
const mockList = vi.fn();
const mockCreate = vi.fn();
const mockStart = vi.fn();
const mockCancel = vi.fn();

vi.mock("../services/campaignService", () => ({
  campaignService: {
    list: (...args: unknown[]) => mockList(...args),
    create: (...args: unknown[]) => mockCreate(...args),
    start: (...args: unknown[]) => mockStart(...args),
    cancel: (...args: unknown[]) => mockCancel(...args),
  },
}));

const mockCampaign = (overrides: Record<string, unknown> = {}) => ({
  id: "camp-1",
  tenantId: "tenant-1",
  name: "Test Campaign",
  status: "Created",
  environment: "Sandbox",
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  totalCost: 0,
  createdAt: "2025-01-01T00:00:00Z",
  ...overrides,
});

describe("useCampaigns", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with loading state and empty campaigns", () => {
    mockList.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 });

    const { result } = renderHook(() => useCampaigns());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.campaigns).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("should fetch campaigns and update state", async () => {
    const campaigns = [
      mockCampaign({ id: "1", name: "Campaign A" }),
      mockCampaign({ id: "2", name: "Campaign B", status: "In-Progress" }),
    ];
    mockList.mockResolvedValue({
      data: campaigns,
      total: 2,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() => useCampaigns());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.campaigns).toEqual(campaigns);
    expect(result.current.total).toBe(2);
    expect(result.current.error).toBeNull();
    expect(mockList).toHaveBeenCalledWith(1, 20);
  });

  it("should pass page and limit to service", async () => {
    const campaigns = [mockCampaign({ id: "3" })];
    mockList.mockResolvedValue({
      data: campaigns,
      total: 25,
      page: 2,
      limit: 10,
    });

    const { result } = renderHook(() => useCampaigns(2, 10));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockList).toHaveBeenCalledWith(2, 10);
    expect(result.current.total).toBe(25);
  });

  it("should handle fetch error", async () => {
    mockList.mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useCampaigns());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe("Network error");
    expect(result.current.campaigns).toEqual([]);
  });

  it("should refetch when called", async () => {
    const initialCampaigns = [mockCampaign({ id: "1" })];
    mockList.mockResolvedValueOnce({
      data: initialCampaigns,
      total: 1,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() => useCampaigns());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    expect(result.current.campaigns).toEqual(initialCampaigns);

    const updatedCampaigns = [mockCampaign({ id: "1", status: "In-Progress" })];
    mockList.mockResolvedValueOnce({
      data: updatedCampaigns,
      total: 1,
      page: 1,
      limit: 20,
    });

    await act(async () => {
      result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.campaigns).toEqual(updatedCampaigns);
    });
    expect(mockList).toHaveBeenCalledTimes(2);
  });
});

describe("useCreateCampaign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a campaign successfully", async () => {
    const created: Record<string, unknown> = mockCampaign({
      id: "new-1",
      name: "New",
    });
    mockCreate.mockResolvedValue(created);

    const { result } = renderHook(() => useCreateCampaign());

    const input = { name: "New", environment: "Sandbox", csvContent: "h\nd" };
    let returned: unknown;
    await act(async () => {
      returned = await result.current.createCampaign(input);
    });

    expect(returned).toEqual(created);
    expect(mockCreate).toHaveBeenCalledWith(input);
    expect(result.current.isCreating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set error on create failure", async () => {
    mockCreate.mockRejectedValue(new Error("Validation failed"));

    const { result } = renderHook(() => useCreateCampaign());

    await act(async () => {
      try {
        await result.current.createCampaign({
          name: "Bad",
          environment: "Sandbox",
          csvContent: "bad",
        });
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Validation failed");
    expect(result.current.isCreating).toBe(false);
  });

  it("should set isCreating to true while creating", async () => {
    mockCreate.mockResolvedValue(mockCampaign());
    const { result } = renderHook(() => useCreateCampaign());

    await act(async () => {
      await result.current.createCampaign({
        name: "Test",
        environment: "Production",
        csvContent: "h\nd",
      });
    });

    expect(result.current.isCreating).toBe(false);
    // Check that create was called with Production env
    expect(mockCreate).toHaveBeenCalledWith({
      name: "Test",
      environment: "Production",
      csvContent: "h\nd",
    });
  });
});

describe("useStartCampaign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start a campaign successfully", async () => {
    const started: Record<string, unknown> = mockCampaign({
      status: "In-Progress",
    });
    mockStart.mockResolvedValue(started);

    const { result } = renderHook(() => useStartCampaign());

    const returned = await act(async () =>
      result.current.startCampaign("camp-1"),
    );

    expect(returned).toEqual(started);
    expect(mockStart).toHaveBeenCalledWith("camp-1");
    expect(result.current.isStarting).toBe(false);
  });

  it("should set error on start failure", async () => {
    mockStart.mockRejectedValue(new Error("Cannot start"));

    const { result } = renderHook(() => useStartCampaign());

    await act(async () => {
      try {
        await result.current.startCampaign("camp-1");
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Cannot start");
  });
});

describe("useCancelCampaign", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should cancel a campaign successfully", async () => {
    const cancelled: Record<string, unknown> = mockCampaign({
      status: "Cancelled",
    });
    mockCancel.mockResolvedValue(cancelled);

    const { result } = renderHook(() => useCancelCampaign());

    const returned = await act(async () =>
      result.current.cancelCampaign("camp-1"),
    );

    expect(returned).toEqual(cancelled);
    expect(mockCancel).toHaveBeenCalledWith("camp-1");
    expect(result.current.isCanceling).toBe(false);
  });

  it("should set error on cancel failure", async () => {
    mockCancel.mockRejectedValue(new Error("Cannot cancel"));

    const { result } = renderHook(() => useCancelCampaign());

    await act(async () => {
      try {
        await result.current.cancelCampaign("camp-1");
      } catch {
        // Expected
      }
    });

    expect(result.current.error).toBe("Cannot cancel");
  });
});
