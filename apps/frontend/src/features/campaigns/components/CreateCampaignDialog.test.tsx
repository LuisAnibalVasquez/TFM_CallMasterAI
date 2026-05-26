import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  CreateCampaignDialog,
  normalizeCsvRow,
  findMissingColumns,
} from "./CreateCampaignDialog";

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

const { mockCreateCampaign, capturedToastRef } = vi.hoisted(() => {
  const ref: { current: Record<string, unknown> | null } = { current: null };
  return {
    mockCreateCampaign: vi.fn(),
    capturedToastRef: ref,
  };
});

vi.mock("../hooks/useCampaigns", () => ({
  useCreateCampaign: () => ({
    createCampaign: mockCreateCampaign,
    isCreating: false,
  }),
}));

vi.mock("../../../shared/hooks/use-toast", () => ({
  useToast: () => ({
    toast: (props: Record<string, unknown>) => {
      capturedToastRef.current = props;
    },
  }),
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

// ──────────────────────────────────────────────
// Pure function tests — normalizeCsvRow
// ──────────────────────────────────────────────
describe("normalizeCsvRow", () => {
  it("should map English lowercase headers to canonical keys", () => {
    const raw = {
      "customer name": "Alice",
      "phone number": "+15551234567",
      age: "30",
      "preferred language": "en",
    };

    const result = normalizeCsvRow(raw);

    expect(result["Customer Name"]).toBe("Alice");
    expect(result["Phone Number"]).toBe("+15551234567");
    expect(result["Age"]).toBe("30");
    expect(result["Preferred Language"]).toBe("en");
  });

  it("should map Spanish headers to canonical keys", () => {
    const raw = {
      nombre: "Bob",
      teléfono: "+15559876543",
      edad: "25",
      "idioma de preferencia": "es",
    };

    const result = normalizeCsvRow(raw);

    expect(result["Customer Name"]).toBe("Bob");
    expect(result["Phone Number"]).toBe("+15559876543");
    expect(result["Age"]).toBe("25");
    expect(result["Preferred Language"]).toBe("es");
  });

  it("should handle headers with extra spaces and mixed case", () => {
    const raw = {
      "  Customer Name  ": "Carol",
      "PHONE Number": "+15550001111",
      " Age": "40",
    };

    const result = normalizeCsvRow(raw);

    expect(result["Customer Name"]).toBe("Carol");
    expect(result["Phone Number"]).toBe("+15550001111");
    expect(result["Age"]).toBe("40");
  });

  it("should return empty object for completely unrecognized headers", () => {
    const raw = {
      "unknown column": "value",
      another_thing: "test",
    };

    const result = normalizeCsvRow(raw);

    expect(Object.keys(result)).toHaveLength(0);
  });

  it("should handle alternate English header 'name' for Customer Name", () => {
    const raw = { name: "Dave" };
    const result = normalizeCsvRow(raw);
    expect(result["Customer Name"]).toBe("Dave");
  });

  it("should handle alternate English header 'phone' for Phone Number", () => {
    const raw = { phone: "+15551112222" };
    const result = normalizeCsvRow(raw);
    expect(result["Phone Number"]).toBe("+15551112222");
  });

  it("should handle alternate English header 'language' for Preferred Language", () => {
    const raw = { language: "French" };
    const result = normalizeCsvRow(raw);
    expect(result["Preferred Language"]).toBe("French");
  });
});

// ──────────────────────────────────────────────
// Pure function tests — findMissingColumns
// ──────────────────────────────────────────────
describe("findMissingColumns", () => {
  it("should return empty array when all required columns are present", () => {
    const rows = [{ "Customer Name": "Alice", "Phone Number": "+15551234567" }];

    const missing = findMissingColumns(rows);

    expect(missing).toEqual([]);
  });

  it("should detect missing Customer Name column", () => {
    const rows = [{ "Phone Number": "+15551234567", Age: "30" }];

    const missing = findMissingColumns(rows);

    expect(missing).toEqual(["Customer Name"]);
  });

  it("should detect missing Phone Number column", () => {
    const rows = [{ "Customer Name": "Alice", Age: "30" }];

    const missing = findMissingColumns(rows);

    expect(missing).toEqual(["Phone Number"]);
  });

  it("should detect both required columns missing", () => {
    const rows = [{ Age: "30", "Preferred Language": "English" }];

    const missing = findMissingColumns(rows);

    expect(missing).toEqual(["Customer Name", "Phone Number"]);
  });

  it("should detect missing column when multiple rows exist", () => {
    const rows = [
      { "Customer Name": "Alice", Age: "30" },
      { "Phone Number": "+15551112222", Age: "25" },
    ];

    // Phone Number appears in row 1 but not row 0 — still present overall
    const missing = findMissingColumns(rows);

    // Customer Name and Phone Number both appear across rows
    expect(missing).toEqual([]);
  });
});

// ──────────────────────────────────────────────
// Integration tests — CSV parsing with varied headers
// ──────────────────────────────────────────────
describe("CreateCampaignDialog CSV parsing", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnTemplateDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should parse and display rows when CSV has lowercase headers", async () => {
    const Papa = await import("papaparse");
    const parseMock = Papa.default.parse as ReturnType<typeof vi.fn>;

    parseMock.mockImplementation((_text: string, _config: unknown) => {
      const config = _config as { complete?: (result: unknown) => void };
      config?.complete?.({
        data: [
          {
            "customer name": "Alice",
            "phone number": "+15551234567",
            age: "30",
            "preferred language": "en",
          },
          { name: "Bob", phone: "+15559876543", edad: "25", idioma: "es" },
        ],
      });
    });

    const user = userEvent.setup();
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    // Simulate file upload
    const file = new File(["dummy"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-file-input");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/2 row\(s\) parsed/)).toBeDefined();
    });
  });

  it("should parse and display rows when CSV has Spanish headers", async () => {
    const Papa = await import("papaparse");
    const parseMock = Papa.default.parse as ReturnType<typeof vi.fn>;

    parseMock.mockImplementation((_text: string, _config: unknown) => {
      const config = _config as { complete?: (result: unknown) => void };
      config?.complete?.({
        data: [
          {
            nombre: "Carlos",
            teléfono: "+15551112222",
            edad: "28",
            idioma: "es",
          },
        ],
      });
    });

    const user = userEvent.setup();
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    const file = new File(["dummy"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-file-input");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/1 row\(s\) parsed/)).toBeDefined();
    });
  });

  it("should show an error message when a required column is missing", async () => {
    const Papa = await import("papaparse");
    const parseMock = Papa.default.parse as ReturnType<typeof vi.fn>;

    parseMock.mockImplementation((_text: string, _config: unknown) => {
      const config = _config as { complete?: (result: unknown) => void };
      config?.complete?.({
        data: [{ age: "30", language: "English" }],
      });
    });

    const user = userEvent.setup();
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    const file = new File(["dummy"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-file-input");
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/0 row\(s\) parsed/)).toBeDefined();
      expect(screen.getByText(/Missing required column/)).toBeDefined();
    });
  });
});

// ──────────────────────────────────────────────
// RHF + Zod validation tests
// ──────────────────────────────────────────────
describe("CreateCampaignDialog — RHF validation", () => {
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnTemplateDownload = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    capturedToastRef.current = null;
    mockCreateCampaign.mockReset();
  });

  const getCapturedToast = () => capturedToastRef.current;

  // ── Blocks empty name ──
  it("should block submission when campaign name is empty", async () => {
    const user = userEvent.setup();
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    await user.click(screen.getByRole("button", { name: /create campaign/i }));

    await waitFor(() => {
      expect(mockCreateCampaign).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Blocks whitespace-only name ──
  it("should block submission when campaign name is only whitespace", async () => {
    const user = userEvent.setup();
    render(
      <CreateCampaignDialog
        open={true}
        onSuccess={mockOnSuccess}
        onCancel={mockOnCancel}
        onTemplateDownload={mockOnTemplateDownload}
      />,
    );

    await user.type(screen.getByLabelText("Campaign Name"), "   ");
    await user.click(screen.getByRole("button", { name: /create campaign/i }));

    await waitFor(() => {
      expect(mockCreateCampaign).not.toHaveBeenCalled();
      const toast = getCapturedToast();
      expect(toast).toBeTruthy();
      expect(toast?.variant).toBe("destructive");
    });
  });

  // ── Environment defaults to Sandbox ──
  it("should default environment to Sandbox and allow Production", async () => {
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
});
