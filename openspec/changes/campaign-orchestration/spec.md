# Spec: Campaign Orchestration — Data Lifecycle & Automated Purging

## Purpose
Define behavioral requirements for the campaign lifecycle (creation, ingestion, execution, completion) including automated data purging after completion to comply with data privacy constraints.

## Related Main Specs
- `openspec/specs/campaign-core/spec.md` — extended and refined by this delta.

---

### Requirement: Campaign Creation via CSV Upload

The frontend MUST provide a dialog to create a campaign. The user uploads a CSV file that is parsed in-memory (no server-side storage of uploaded CSVs). Each valid row is stored as a `call` record.

#### Scenario: Create campaign with valid CSV
- GIVEN a logged-in TenantAdmin on `/dashboard/campaigns`
- WHEN they click "Create Campaign", fill in the name, select environment (Sandbox/Production), and upload a CSV with columns: `Customer Name`, `Phone Number`, `Age`, `Preferred Language`
- THEN the system MUST parse the CSV client-side
- AND MUST validate every phone number against E.164 format before submission
- AND MUST reject the entire upload if any phone number is invalid
- AND MUST display the corresponding error message per invalid row
- AND MUST store valid rows as `calls` records linked to the campaign
- AND MUST set campaign status to `Created`
- AND MUST NOT automatically start execution

#### Scenario: Create campaign with invalid phone format
- GIVEN a TenantAdmin on the create dialog
- WHEN they upload a CSV containing a phone number that does not conform to E.164
- THEN the system MUST display an inline error: "Row X: invalid phone number format"
- AND MUST NOT create the campaign
- AND MUST NOT store any partial data

### Requirement: Campaign Template Download

Tenants MUST be able to download a sample CSV template to understand the expected format.

#### Scenario: Download template CSV
- GIVEN a TenantAdmin on `/dashboard/campaigns`
- WHEN they click "Download Template"
- THEN the system MUST serve `template.csv` from Supabase bucket `template`
- AND MUST provide a file with columns `Customer Name, Phone Number, Age, Preferred Language` and one sample row

### Requirement: Campaign Start — Inngest Orchestration

Starting a campaign moves it to `In-Progress` and triggers an Inngest function that processes calls sequentially (concurrency 1).

#### Scenario: Start campaign with sequential execution
- GIVEN a campaign in `Created` status
- WHEN the Tenant clicks "Start"
- THEN the campaign status MUST change to `In-Progress`
- AND an Inngest function MUST begin processing the calls in FIFO order
- AND each call MUST be triggered only after the previous one receives a response (success or failure)
- AND failed calls MUST be logged with the error but MUST NOT block the queue
- AND once all calls are processed, the campaign status MUST change to `Completed`
- AND call metrics (success count, failure count, total cost) MUST be computed

#### Scenario: Sequential concurrency 1 enforcement
- GIVEN a campaign with 10 clients in the queue
- WHEN the Inngest function processes the queue
- THEN the system MUST invoke the provider for exactly one call at a time
- AND MUST wait for a response before processing the next call
- AND MUST NOT have more than one in-flight call per campaign at any moment

### Requirement: Campaign Completion & Snapshot

Upon completion, the campaign MUST store aggregate metrics in a new `snapshot` column (or separate fields) within the `campaigns` table. The raw client data (Name, Phone) in the `calls` table MUST be purged/anonymized.

#### Scenario: Store campaign snapshot on completion
- GIVEN a campaign whose queue is fully processed
- WHEN the last call response is received
- THEN the system MUST compute: total_calls, successful_calls, failed_calls, total_cost
- AND MUST persist these metrics on the `campaigns` record
- AND MUST update campaign status to `Completed`
- AND MUST THEN trigger the data purge step

#### Scenario: Anonymize client data after completion
- GIVEN a campaign in `Completed` status
- WHEN the purge step runs
- THEN the `customer_name` field for all associated `calls` MUST be replaced with `[redacted]`
- AND the `phone_encrypted` field MUST be replaced with `[redacted]`
- AND the `phone_hash` field MUST be replaced with `[redacted]`
- AND all other fields (age, language, duration, status, cost) MUST remain intact for analytics

#### Scenario: Campaign deletion restriction
- GIVEN a campaign in `Completed` or `Cancelled` status
- WHEN the Tenant attempts to delete the campaign
- THEN the system MUST reject the request
- AND MUST respond with: "Cannot delete a completed or cancelled campaign"

### Requirement: Campaign Cancellation (existing, confirmed)

#### Scenario: Cancel in-progress campaign
- GIVEN a campaign in `In-Progress` status
- WHEN the Tenant clicks "Cancel"
- THEN the system MUST set campaign status to `Cancelled`
- AND MUST stop processing remaining queued calls
- AND purge MUST NOT run (no snapshot needed for cancelled campaigns)
- AND all already-processed calls MUST remain in the `calls` table

### Requirement: Phone Validation — Strict E.164

All phone numbers ingested MUST comply with E.164 format: `+<country_code><national_number>` (e.g., `+14155552671`).

#### Scenario: Valid E.164 phone number
- GIVEN a CSV row with phone `+14155552671`
- WHEN the system validates the row
- THEN the phone MUST be accepted and stored as-is

#### Scenario: Invalid phone number
- GIVEN a CSV row with phone `555-2671` (missing country code)
- WHEN the system validates the row
- THEN the phone MUST be rejected with error: "Phone number must be in E.164 format (+<country><number>)"

### Requirement: Inngest Dev Server setup

The backend MUST support local Inngest development via Inngest Dev Server.

#### Scenario: Start Inngest Dev Server
- GIVEN the backend is running locally
- WHEN the developer runs the configured dev script
- THEN Inngest Dev Server MUST be accessible at the configured URL
- AND all campaign events MUST be visible in the dev server UI
