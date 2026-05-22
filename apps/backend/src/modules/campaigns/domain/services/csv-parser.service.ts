export interface CsvRow {
  customerName: string;
  phone: string;
  age: number;
  language: string;
}

export interface CsvError {
  row: number;
  message: string;
}

export interface CsvParseResult {
  success: boolean;
  rows: CsvRow[];
  errors: CsvError[];
}

/**
 * Validates that a phone number string conforms to E.164 format:
 * +<country_code><national_number> (e.g., +14155552671)
 */
export function isValidE164(phone: string): boolean {
  // E.164: starts with '+' followed by 7-15 digits
  return /^\+[1-9]\d{6,14}$/.test(phone.trim());
}

/**
 * Validates that a language code is exactly 2 alphabetic characters.
 */
export function isValidLanguageCode(lang: string): boolean {
  return /^[a-zA-Z]{2}$/.test(lang.trim());
}

/**
 * Parses a CSV string into an array of validated CsvRow objects.
 * The CSV MUST have the expected header row.
 * All phone numbers MUST be valid E.164 format — the entire upload
 * is rejected if ANY row contains an invalid phone number.
 */
export function parseCsvToRows(csvText: string): CsvParseResult {
  const errors: CsvError[] = [];
  const rows: CsvRow[] = [];

  if (!csvText || csvText.trim().length === 0) {
    return {
      success: false,
      rows: [],
      errors: [{ row: 0, message: "CSV content is empty" }],
    };
  }

  const lines = csvText
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      rows: [],
      errors: [
        {
          row: 0,
          message: "CSV must contain a header row and at least one data row",
        },
      ],
    };
  }

  const headerLine = lines[0];
  const headers = headerLine.split(",").map((h) => {
    // Strip optional quotes and trim
    return h
      .trim()
      .replace(/^"(.*)"$/, "$1")
      .trim();
  });

  // Validate expected headers (case-insensitive)
  const expectedHeaders = [
    "customer name",
    "phone number",
    "age",
    "preferred language",
  ];
  const normalizedHeaders = headers.map((h) => h.toLowerCase());
  for (const expected of expectedHeaders) {
    if (!normalizedHeaders.includes(expected)) {
      return {
        success: false,
        rows: [],
        errors: [
          {
            row: 0,
            message: `Missing required column: "${expected}"`,
          },
        ],
      };
    }
  }

  // Build column index map from normalized headers
  const colIndex: Record<string, number> = {};
  normalizedHeaders.forEach((header, index) => {
    colIndex[header] = index;
  });

  // Parse each data row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Improved field extraction: split by comma but handle potential quoted values
    // and strip surrounding quotes/spaces from the result
    const fields = line.split(",").map((f) => {
      return f
        .trim()
        .replace(/^["'](.*)["']$/, "$1") // Remove both double and single quotes
        .trim();
    });
    const rowNumber = i; // 1-indexed for user-facing messages

    const customerName = fields[colIndex["customer name"]] || "";
    const phone = (fields[colIndex["phone number"]] || "").replace(/\s+/g, ""); // Remove ALL internal spaces
    const ageStr = fields[colIndex["age"]] || "0";
    const language = (fields[colIndex["preferred language"]] || "")
      .toLowerCase()
      .trim();

    // Validate E.164 phone
    if (!isValidE164(phone)) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: invalid phone number format (${phone}). Phone must be in E.164 format (+<country><number>)`,
      });
    }

    // Validate 2-letter language code
    if (!isValidLanguageCode(language)) {
      errors.push({
        row: rowNumber,
        message: `Row ${rowNumber}: invalid language format (${language}). Language must be a 2-letter code (e.g., 'en', 'es')`,
      });
    }

    const age = parseInt(ageStr, 10) || 0;

    rows.push({
      customerName,
      phone,
      age,
      language,
    });
  }

  if (errors.length > 0) {
    return {
      success: false,
      rows: [],
      errors,
    };
  }

  return {
    success: true,
    rows,
    errors: [],
  };
}
