import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CampaignsPage } from "./CampaignsPage";

// Mock the child components
vi.mock("../components/CampaignList", () => ({
  CampaignList: vi.fn(
    ({
      onCreateClick,
      onTemplateDownload,
    }: {
      onCreateClick: () => void;
      onTemplateDownload: () => void;
    }) => (
      <div data-testid="campaign-list">
        <button data-testid="create-trigger" onClick={onCreateClick}>
          Create Campaign
        </button>
        <button data-testid="template-trigger" onClick={onTemplateDownload}>
          Download Template
        </button>
      </div>
    ),
  ),
}));

vi.mock("../components/CreateCampaignDialog", () => ({
  CreateCampaignDialog: vi.fn(
    ({
      open,
      onSuccess,
      onCancel,
      onTemplateDownload,
    }: {
      open: boolean;
      onSuccess: () => void;
      onCancel: () => void;
      onTemplateDownload: () => void;
    }) =>
      open ? (
        <div data-testid="create-dialog">
          <button data-testid="dialog-success" onClick={onSuccess}>
            Success
          </button>
          <button data-testid="dialog-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button data-testid="dialog-template" onClick={onTemplateDownload}>
            Template
          </button>
        </div>
      ) : null,
  ),
}));

// Mock the hooks
vi.mock("../hooks/useCampaigns", () => ({
  useCampaigns: vi.fn(() => ({
    campaigns: [],
    total: 0,
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  })),
  useStartCampaign: vi.fn(),
  useCancelCampaign: vi.fn(),
}));

// Mock campaignService for downloadTemplate
vi.mock("../services/campaignService", () => ({
  campaignService: {
    downloadTemplate: vi.fn(),
  },
}));

// Mock useToast
vi.mock("../../../shared/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({ toast: vi.fn() })),
}));

describe("CampaignsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render CampaignList by default (no dialog open)", () => {
    render(<CampaignsPage />);
    expect(screen.getByTestId("campaign-list")).toBeDefined();
    expect(screen.queryByTestId("create-dialog")).toBeNull();
  });

  it("should open CreateCampaignDialog when Create button is clicked", async () => {
    const user = userEvent.setup();
    render(<CampaignsPage />);

    // Dialog should not be visible initially
    expect(screen.queryByTestId("create-dialog")).toBeNull();

    // Click create trigger in mocked CampaignList
    await user.click(screen.getByTestId("create-trigger"));

    // Dialog should now be visible
    expect(screen.getByTestId("create-dialog")).toBeDefined();
  });

  it("should close dialog when Cancel is clicked in dialog", async () => {
    const user = userEvent.setup();
    render(<CampaignsPage />);

    // Open dialog
    await user.click(screen.getByTestId("create-trigger"));
    expect(screen.getByTestId("create-dialog")).toBeDefined();

    // Click cancel in dialog
    await user.click(screen.getByTestId("dialog-cancel"));

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId("create-dialog")).toBeNull();
    });
  });

  it("should close dialog when Success is clicked in dialog", async () => {
    const user = userEvent.setup();
    render(<CampaignsPage />);

    // Open dialog
    await user.click(screen.getByTestId("create-trigger"));
    expect(screen.getByTestId("create-dialog")).toBeDefined();

    // Click success in dialog
    await user.click(screen.getByTestId("dialog-success"));

    // Dialog should be closed
    await waitFor(() => {
      expect(screen.queryByTestId("create-dialog")).toBeNull();
    });
  });
});
