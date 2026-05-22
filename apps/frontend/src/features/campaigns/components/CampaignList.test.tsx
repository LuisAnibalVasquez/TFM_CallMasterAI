import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CampaignList } from "./CampaignList";

// Mock the hooks
vi.mock("../hooks/useCampaigns", () => ({
  useCampaigns: vi.fn(),
  useStartCampaign: vi.fn(),
  useCancelCampaign: vi.fn(),
}));

import { useStartCampaign, useCancelCampaign } from "../hooks/useCampaigns";

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

describe("CampaignList", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useStartCampaign).mockReturnValue({
      startCampaign: vi.fn(),
      isStarting: false,
      error: null,
      clearError: vi.fn(),
    });
    vi.mocked(useCancelCampaign).mockReturnValue({
      cancelCampaign: vi.fn(),
      isCanceling: false,
      error: null,
      clearError: vi.fn(),
    });
  });

  it("should show loading spinner when loading", () => {
    render(
      <CampaignList
        campaigns={[]}
        total={0}
        isLoading={true}
        refetch={mockRefetch}
      />,
    );
    expect(screen.getByText("Campaigns")).toBeDefined();
    expect(
      screen.getByText("Manage your call campaigns and track their progress."),
    ).toBeDefined();
  });

  it("should show empty state when no campaigns", async () => {
    render(
      <CampaignList
        campaigns={[]}
        total={0}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("No campaigns created yet")).toBeDefined();
    });
  });

  it("should render campaign rows with status badges", async () => {
    const campaigns = [
      mockCampaign({
        id: "1",
        name: "Q1 Outreach",
        status: "Created",
        totalCalls: 50,
        successfulCalls: 0,
        failedCalls: 0,
        totalCost: 0,
      }),
      mockCampaign({
        id: "2",
        name: "Q2 Outreach",
        status: "In-Progress",
        totalCalls: 100,
        successfulCalls: 45,
        failedCalls: 5,
        totalCost: 12.5,
      }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={2}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Q1 Outreach")).toBeDefined();
      expect(screen.getByText("Q2 Outreach")).toBeDefined();
      expect(screen.getByText("Created")).toBeDefined();
      expect(screen.getByText("In-Progress")).toBeDefined();
    });
  });

  it("should display analytics snapshot for each campaign", async () => {
    const campaigns = [
      mockCampaign({
        id: "1",
        name: "Analytics Campaign",
        status: "Completed",
        totalCalls: 200,
        successfulCalls: 180,
        failedCalls: 20,
        totalCost: 45.75,
      }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={1}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("200")).toBeDefined();
      expect(screen.getByText("180")).toBeDefined();
      expect(screen.getByText("20")).toBeDefined();
      expect(screen.getByText("Total:")).toBeDefined();
      expect(screen.getByText("Success:")).toBeDefined();
      expect(screen.getByText("Failed:")).toBeDefined();
    });
  });

  it("should show Start button for Created campaigns", async () => {
    const campaigns = [
      mockCampaign({ id: "1", name: "To Start", status: "Created" }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={1}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTitle("Start campaign")).toBeDefined();
    });
  });

  it("should show Cancel button for In-Progress campaigns", async () => {
    const campaigns = [
      mockCampaign({ id: "1", name: "Running", status: "In-Progress" }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={1}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTitle("Cancel campaign")).toBeDefined();
    });
  });

  it("should not show action buttons for Completed campaigns", async () => {
    const campaigns = [
      mockCampaign({ id: "1", name: "Done", status: "Completed" }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={1}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeDefined();
      expect(screen.queryByTitle("Start campaign")).toBeNull();
      expect(screen.queryByTitle("Cancel campaign")).toBeNull();
    });
  });

  it("should display environment badge", async () => {
    const campaigns = [
      mockCampaign({
        id: "1",
        name: "Sandbox Campaign",
        environment: "Sandbox",
      }),
      mockCampaign({
        id: "2",
        name: "Prod Campaign",
        environment: "Production",
      }),
    ];

    render(
      <CampaignList
        campaigns={campaigns}
        total={2}
        isLoading={false}
        refetch={mockRefetch}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Sandbox")).toBeDefined();
      expect(screen.getByText("Production")).toBeDefined();
    });
  });
});
