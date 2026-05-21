import { parseCsvToRows, CsvParseResult } from "./csv-parser.service";

describe("CsvParserService", () => {
  describe("parseCsvToRows", () => {
    const validHeader = "Customer Name,Phone Number,Age,Preferred Language";
    const validRow1 = "John Doe,+14155552671,30,English";
    const validRow2 = "Jane Smith,+34666111222,25,Spanish";
    const validRow3 = "Bob Wilson,+441632960961,45,English";

    describe("happy path — valid CSV", () => {
      it("should parse a single valid row", () => {
        const csv = `${validHeader}\n${validRow1}`;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(true);
        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].customerName).toBe("John Doe");
        expect(result.rows[0].phone).toBe("+14155552671");
        expect(result.rows[0].age).toBe(30);
        expect(result.rows[0].language).toBe("English");
        expect(result.errors).toEqual([]);
      });

      it("should parse multiple valid rows", () => {
        const csv = [validHeader, validRow1, validRow2, validRow3].join("\n");

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(true);
        expect(result.rows).toHaveLength(3);
        expect(result.errors).toEqual([]);
      });

      it("should trim whitespace from all fields", () => {
        const csv = `${validHeader}\n  John Doe , +14155552671 , 30 , English `;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.rows[0].customerName).toBe("John Doe");
        expect(result.rows[0].phone).toBe("+14155552671");
        expect(result.rows[0].age).toBe(30);
        expect(result.rows[0].language).toBe("English");
      });
    });

    describe("validation — E.164 phone numbers", () => {
      it("should reject a phone number without a + prefix", () => {
        const csv = `${validHeader}\nJohn Doe,14155552671,30,English`;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(false);
        expect(result.rows).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].message).toMatch(/Row 1.*E\.164/);
      });

      it("should reject a phone number with letters", () => {
        const csv = `${validHeader}\nJohn Doe,+14A555B2671,30,English`;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(false);
        expect(result.errors[0].message).toMatch(/Row 1.*E\.164/);
      });

      it("should reject the entire upload if ANY row has an invalid phone", () => {
        const csv = [
          validHeader,
          validRow1,
          "Jane Smith,not-a-phone,25,Spanish",
        ].join("\n");

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(false);
        expect(result.rows).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
      });

      it("should accept various valid E.164 formats", () => {
        const csv = [
          validHeader,
          "US,+14155552671,30,English",
          "ES Mobile,+34666111222,25,Spanish",
          "UK,+441632960961,45,English",
          "Argentina,+5491112345678,35,Spanish",
        ].join("\n");

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(true);
        expect(result.rows).toHaveLength(4);
      });
    });

    describe("edge cases", () => {
      it("should return an error for empty CSV", () => {
        const result: CsvParseResult = parseCsvToRows("");

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should return an error when only header is present", () => {
        const result: CsvParseResult = parseCsvToRows(validHeader);

        expect(result.success).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });

      it("should handle rows with empty optional fields gracefully", () => {
        const csv = `${validHeader}\nJohn Doe,+14155552671,,English`;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(true);
        expect(result.rows[0].age).toBe(0);
      });

      it("should ignore extra whitespace around header names", () => {
        const csv =
          " Customer Name , Phone Number , Age , Preferred Language \n" +
          validRow1;

        const result: CsvParseResult = parseCsvToRows(csv);

        expect(result.success).toBe(true);
        expect(result.rows).toHaveLength(1);
      });
    });
  });
});
