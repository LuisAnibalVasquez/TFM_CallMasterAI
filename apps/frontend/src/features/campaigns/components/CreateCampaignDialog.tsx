// Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt3 on Tue May 26 2026
import { useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "../../../shared/components/ui/button";
import { Input } from "../../../shared/components/ui/input";
import { Label } from "../../../shared/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../shared/components/ui/card";
import { useToast } from "../../../shared/hooks/use-toast";
import { Loader2, Upload, FileText, AlertCircle, Download } from "lucide-react";
import { useCreateCampaign } from "../hooks/useCampaigns";
import { campaignSchema, type CampaignFormInput } from "@callmaster/shared";
import Papa from "papaparse";
import { parsePhoneNumber } from "libphonenumber-js";

interface CreateCampaignDialogProps {
  open: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  onTemplateDownload: () => void;
}

interface CsvRow {
  "Customer Name"?: string;
  "Phone Number"?: string;
  Age?: string;
  "Preferred Language"?: string;
}

const HEADER_MAP: Record<string, keyof CsvRow> = {
  // English canonical (for self-mapping)
  "customer name": "Customer Name",
  "phone number": "Phone Number",
  age: "Age",
  "preferred language": "Preferred Language",
  // English alternates
  name: "Customer Name",
  phone: "Phone Number",
  language: "Preferred Language",
  // Spanish
  nombre: "Customer Name",
  "nombre del cliente": "Customer Name",
  telefono: "Phone Number",
  teléfono: "Phone Number",
  edad: "Age",
  idioma: "Preferred Language",
  "idioma de preferencia": "Preferred Language",
  languaje: "Preferred Language",
};

export function normalizeCsvRow(rawRow: Record<string, string>): CsvRow {
  const normalized: CsvRow = {};
  for (const [key, value] of Object.entries(rawRow)) {
    const trimmed = key.trim().toLowerCase();
    const canonicalKey = HEADER_MAP[trimmed];
    if (canonicalKey) {
      normalized[canonicalKey] = value;
    }
  }
  return normalized;
}

const REQUIRED_COLUMNS: Array<keyof CsvRow> = ["Customer Name", "Phone Number"];

export function findMissingColumns(rows: CsvRow[]): string[] {
  const present = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      present.add(key);
    }
  }
  return REQUIRED_COLUMNS.filter((col) => !present.has(col));
}

interface RowError {
  row: number;
  message: string;
}

export function CreateCampaignDialog({
  open,
  onSuccess,
  onCancel,
  onTemplateDownload,
}: CreateCampaignDialogProps) {
  const { createCampaign, isCreating } = useCreateCampaign();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset: resetFormRHF,
    formState: { errors },
  } = useForm<CampaignFormInput>({
    resolver: zodResolver(campaignSchema),
    defaultValues: { name: "", environment: "Sandbox" },
  });

  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [rowErrors, setRowErrors] = useState<RowError[]>([]);
  const [missingColumns, setMissingColumns] = useState<string[]>([]);

  const resetForm = useCallback(() => {
    resetFormRHF({ name: "", environment: "Sandbox" });
    setCsvRows([]);
    setFileName("");
    setRowErrors([]);
    setMissingColumns([]);
  }, [resetFormRHF]);

  const validatePhone = useCallback((phone: string): boolean => {
    try {
      const parsed = parsePhoneNumber(phone.trim());
      return parsed !== undefined && parsed.isValid();
    } catch {
      return false;
    }
  }, []);

  const validateLanguage = useCallback((lang: string): boolean => {
    return /^[a-zA-Z]{2}$/.test(lang.trim());
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setFileName(file.name);
      const reader = new FileReader();

      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;

        Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: "greedy", // Better at skipping lines with just whitespace
          complete: (result) => {
            // 1. Normalize all rows first
            const allNormalized = result.data.map((raw, index) => ({
              data: normalizeCsvRow(raw),
              originalIndex: index + 2, // +2 because 0-based index and header is row 1
            }));

            // 2. Filter out rows that don't have any significant data
            const validRows = allNormalized.filter((item) => {
              const { data } = item;
              return (
                (data["Customer Name"]?.trim() || "") !== "" ||
                (data["Phone Number"]?.trim() || "") !== "" ||
                (data["Age"]?.trim() || "") !== ""
              );
            });

            const errors: RowError[] = [];
            const finalData: CsvRow[] = [];

            validRows.forEach((item) => {
              const { data, originalIndex } = item;
              const phone = (data["Phone Number"] || "").trim();
              const lang = (data["Preferred Language"] || "").trim();

              let hasError = false;

              if (!phone || !validatePhone(phone)) {
                errors.push({
                  row: originalIndex,
                  message: `Row ${originalIndex}: invalid phone number format (must be E.164 like +14155552671)`,
                });
                hasError = true;
              }

              if (!lang || !validateLanguage(lang)) {
                errors.push({
                  row: originalIndex,
                  message: `Row ${originalIndex}: invalid language format (must be a 2-letter code like 'en' or 'es')`,
                });
                hasError = true;
              }

              if (!hasError) {
                finalData.push(data);
              }
            });

            setCsvRows(finalData);
            setRowErrors(errors);
            setMissingColumns(findMissingColumns(finalData));
          },
          error: (err) => {
            toast({
              variant: "destructive",
              title: "CSV parsing error",
              description: err.message,
            });
          },
        });
      };

      reader.readAsText(file);
    },
    [validatePhone, validateLanguage, toast],
  );

  const onValidSubmit = useCallback(
    async (data: CampaignFormInput) => {
      if (csvRows.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: "Please upload a CSV file with at least one row.",
        });
        return;
      }

      if (rowErrors.length > 0) {
        toast({
          variant: "destructive",
          title: "Phone validation errors",
          description: `Found ${rowErrors.length} invalid phone number(s). Please fix them and re-upload.`,
        });
        return;
      }

      // Rebuild CSV content from parsed rows
      const headers = [
        "Customer Name",
        "Phone Number",
        "Age",
        "Preferred Language",
      ];
      const csvContent = [
        headers.join(","),
        ...csvRows.map((row) =>
          headers
            .map(
              (h) => `"${(row[h as keyof CsvRow] || "").replace(/"/g, '""')}"`,
            )
            .join(","),
        ),
      ].join("\n");

      try {
        await createCampaign({
          name: data.name,
          environment: data.environment,
          csvContent,
        });
        toast({
          title: "Campaign created",
          description: `"${data.name}" has been created with ${csvRows.length} call(s).`,
        });
        resetForm();
        onSuccess();
      } catch {
        toast({
          variant: "destructive",
          title: "Creation failed",
          description: "Could not create the campaign. Please try again.",
        });
      }
    },
    [csvRows, rowErrors, createCampaign, toast, resetForm, onSuccess],
  );

  const onInvalidSubmit = useCallback(() => {
    toast({
      variant: "destructive",
      title: "Validation Error",
      description: "Please enter a campaign name and select an environment.",
    });
  }, [toast]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Campaign
          </CardTitle>
          <CardDescription>
            Upload a CSV file with customer data and configure the campaign
            settings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
            className="space-y-6"
            noValidate
          >
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label htmlFor="campaign-name">Campaign Name</Label>
              <Input
                id="campaign-name"
                placeholder="Q1 Customer Outreach"
                className="bg-background"
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Environment */}
            <div className="space-y-2">
              <Label htmlFor="environment">Environment</Label>
              <select
                id="environment"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("environment")}
              >
                <option value="Sandbox">Sandbox</option>
                <option value="Production">Production</option>
              </select>
            </div>

            {/* CSV Upload */}
            <div className="space-y-2">
              <Label>Upload CSV</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-primary/50 ${
                  fileName ? "border-primary bg-primary/5" : "border-border"
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && fileInputRef.current) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    fileInputRef.current.files = dt.files;
                    handleFileChange({
                      target: { files: dt.files },
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
              >
                <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                {fileName ? (
                  <div>
                    <p className="text-sm font-medium text-primary">
                      {fileName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {csvRows.length} row(s) parsed
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Drop your CSV file here or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Expects columns: Customer Name, Phone Number, Age,
                      Preferred Language
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  data-testid="csv-file-input"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            {/* Validation Errors */}
            {rowErrors.length > 0 && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Invalid phone numbers found ({rowErrors.length})
                  </span>
                </div>
                <ul className="space-y-1">
                  {rowErrors.map((err) => (
                    <li
                      key={err.row}
                      className="text-xs text-muted-foreground pl-4"
                    >
                      {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Missing Columns Error */}
            {missingColumns.length > 0 && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium text-destructive">
                    Missing required column
                    {missingColumns.length > 1 ? "s" : ""}:{" "}
                    {missingColumns.join(", ")}
                  </span>
                </div>
              </div>
            )}

            {/* Template download link */}
            <div className="flex items-center justify-between text-xs">
              <button
                type="button"
                className="text-primary hover:underline flex items-center gap-1"
                onClick={onTemplateDownload}
              >
                <Download className="h-3 w-3" />
                Download Template
              </button>
              <span className="text-muted-foreground">
                .csv format with sample row
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  onCancel();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || rowErrors.length > 0}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
