import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateCampaignDialog } from "./CreateCampaignDialog";

// Mock papaparse
vi.mock("papaparse", () => ({
  default: {
    parse: vi.fn(),
  },
}));

// Mock libphonenumber-js
vi.mock("libphonenumber-js", () => ({
  parsePhoneNumber: vi.fn(),
}));

describe("CreateCampaignDialog", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnTemplateDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render the dialog with form fields", () => {
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    // "Create Campaign" appears both as title and button text
    const headings = screen.getAllByText("Create Campaign");
    expect(headings.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Campaign Name")).toBeDefined();
    expect(screen.getByLabelText("Environment")).toBeDefined();
    expect(screen.getByText("Upload CSV")).toBeDefined();
  });

  it("should show Download Template link", () => {
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    expect(screen.getByText("Download Template")).toBeDefined();
  });

  it("should call onCancel when Cancel button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    await user.click(screen.getByText("Cancel"));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it("should call onTemplateDownload when link is clicked", async () => {
    const user = userEvent.setup();

    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    await user.click(screen.getByText("Download Template"));
    expect(mockOnTemplateDownload).toHaveBeenCalledTimes(1);
  });

  it("should render environment options with Sandbox as default", () => {
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    const select = screen.getByLabelText("Environment") as HTMLSelectElement;
    expect(select.value).toBe("Sandbox");
  });

  it("should render file upload area", () => {
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    // The dropzone should be visible
    expect(screen.getByText(/Drop your CSV file here/)).toBeDefined();
  });
});
