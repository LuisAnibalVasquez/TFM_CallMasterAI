# Design: Campaign Orchestration

## Technical Approach

### Architecture Overview

```
┌────────────────────────────────────────────────────────────────┐
│  Frontend (React + Radix UI)                                   │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │ CampaignsPage         │  │ CreateCampaignDialog          │  │
│  │ - List campaigns      │  │ - In-memory CSV parsing       │  │
│  │ - Download template   │  │   (papaparse)                  │  │
│  │ - Start / Cancel      │  │ - E.164 validation             │  │
│  └──────────┬───────────┘  │   (libphonenumber-js)           │  │
│             │              └──────────────┬─────────────────┘  │
│             │ HTTP (REST)                  │ HTTP (POST)       │
└─────────────┼──────────────────────────────┼──────────────────┘
              │                              │
              ▼                              ▼
┌────────────────────────────────────────────────────────────────┐
│  Backend (NestJS)                                              │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │ CampaignsController   │  │ CampaignsService              │  │
│  │ GET    /campaigns     │  │ - createCampaign()            │  │
│  │ POST   /campaigns     │  │ - startCampaign() → emits     │  │
│  │ POST   /campaigns/:id │  │   campaign.started event      │  │
│  │   /start              │  │ - cancelCampaign()            │  │
│  │ POST   /campaigns/:id │  │ - getCampaigns()              │  │
│  │   /cancel             │  │ - downloadTemplate()          │  │
│  │ GET    /campaigns/    │  │                                │  │
│  │   template            │  └──────────────┬─────────────────┘  │
│  └──────────────────────┘                 │                     │
│                                            │                     │
│  ┌─────────────────────────────────────────▼──────────────────┐  │
│  │  Inngest Module (campaigns/inngest/)                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ campaign.started → CampaignProcessingFunction        │  │  │
│  │  │  - Fetches calls for campaign (paginated)            │  │  │
│  │  │  - Processes each call sequentially (concurrency: 1) │  │  │
│  │  │  - Calls VoiceflowProvider.triggerCall()             │  │  │
│  │  │  - Updates call status/duration/cost per response    │  │  │
│  │  │  - On completion: save snapshot → trigger purge      │  │  │
│  │  │  - Uses Inngest steps for state persistence          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  │                                                              │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ campaign.completed → CampaignPurgeFunction           │  │  │
│  │  │  - Updates calls: SET customer_name = '[redacted]',  │  │  │
│  │  │    phone_encrypted = '[redacted]', phone_hash =      │  │  │
│  │  │    '[redacted]'                                      │  │  │
│  │  │  - Runs as a separate step after snapshot            │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                    │
│  ┌────────────────────────────────────────────────────────────┐   │
│  │  Infrastructure                                            │   │
│  │  - SupabaseRepository (campaigns + calls CRUD)             │   │
│  │  - VoiceflowProvider (mock)                                │   │
│  │  - InngestClient (Inngest SDK singleton)                   │   │
│  └────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Database Schema Changes

#### `campaigns` table — add snapshot columns

```sql
ALTER TABLE public.campaigns
  ADD COLUMN total_calls integer DEFAULT 0,
  ADD COLUMN successful_calls integer DEFAULT 0,
  ADD COLUMN failed_calls integer DEFAULT 0,
  ADD COLUMN total_cost numeric(10,2) DEFAULT 0.00;
```

#### `calls` table — no structural change, data is redacted in-place

The existing schema already has `phone_encrypted` and `phone_hash`. The purge step SETs these to `'[redacted]'` — no migration needed. The data stays for analytics but client-identifying fields are destroyed.

### Inngest Flow

```
campaign.started (user clicks "Start")
  │
  ▼
CampaignProcessingFunction (concurrency: 1)
  │
  ├─ Step 1: Fetch all calls for campaign_id
  ├─ Step 2: Loop each call (sequential within step)
  │    ├─ Invoke VoiceflowProvider.triggerCall()
  │    ├─ Update call record (status, duration, cost, transcript_id)
  │    └─ Continue to next call (regardless of success/failure)
  ├─ Step 3: Compute snapshot (total, success, fail, cost)
  ├─ Step 4: UPDATE campaigns SET status='Completed', metrics
  │
  └─ Step 5: Send campaign.completed event
              │
              ▼
       CampaignPurgeFunction
              │
              └─ UPDATE calls SET customer_name='[redacted]',
                   phone_encrypted='[redacted]',
                   phone_hash='[redacted]'
                   WHERE campaign_id = :id
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| In-memory CSV parsing (frontend) | No server-side file storage needed; no cleanup; immediate feedback |
| Redact-in-place vs delete vs separate table | Redact preserves referential integrity for analytics; no FK breakage; easier rollback |
| Inngest steps for snapshot + purge | Atomic within the Inngest lifecycle; no separate cron or manual step needed |
| `concurrency: 1` per function | Enforces sequential processing per campaign; next call waits for previous response |
| Snapshot stored on `campaigns` row | Avoids JOINs for dashboard queries; single-source for campaign summary after purge |
| `libphonenumber-js` for validation | Lightweight, well-maintained, E.164 parsing support; works client-side |
| `papaparse` for CSV | Most popular JS CSV parser; works in-browser; handles edge cases well |

### New/Modified Files

| File | Action | Purpose |
|------|--------|---------|
| `apps/frontend/src/features/campaigns/pages/CampaignsPage.tsx` | **New** | Campaign list + create dialog + template download |
| `apps/frontend/src/features/campaigns/components/CreateCampaignDialog.tsx` | **New** | Dialog with CSV upload, validation, form |
| `apps/frontend/src/features/campaigns/components/CampaignList.tsx` | **New** | Campaign table with status, actions |
| `apps/frontend/src/features/campaigns/hooks/useCampaigns.ts` | **New** | React Query hooks for campaign API |
| `apps/backend/src/modules/campaigns/application/use-cases/create-campaign.use-case.ts` | **New** | Campaign creation + call records bulk insert |
| `apps/backend/src/modules/campaigns/application/use-cases/start-campaign.use-case.ts` | **New** | Set status to In-Progress + emit Inngest event |
| `apps/backend/src/modules/campaigns/application/use-cases/cancel-campaign.use-case.ts` | **New** | Set status to Cancelled |
| `apps/backend/src/modules/campaigns/application/use-cases/get-campaigns.use-case.ts` | **New** | List campaigns for tenant |
| `apps/backend/src/modules/campaigns/infrastructure/controllers/campaigns.controller.ts` | **New** | REST endpoints |
| `apps/backend/src/modules/campaigns/infrastructure/providers/campaigns.repository.ts` | **New** | Supabase data access for campaigns + calls |
| `apps/backend/src/modules/campaigns/inngest/campaign-processing.function.ts` | **New** | Inngest function for sequential call processing |
| `apps/backend/src/modules/campaigns/inngest/campaign-purge.function.ts` | **New** | Inngest function for data redaction |
| `apps/backend/src/modules/campaigns/inngest/campaigns-inngest.module.ts` | **New** | Inngest module wiring |
| `apps/backend/src/modules/campaigns/campaigns.module.ts` | **Modified** | Register new controllers, providers, use cases |
| `apps/backend/src/app.module.ts` | **Modified** | Add CampaignsModule |
| `apps/frontend/src/App.tsx` | **Modified** | Add `/dashboard/campaigns` route |
| `supabase/migrations/20260522_add_campaign_snapshot_columns.sql` | **New** | Add total_calls, successful_calls, failed_calls, total_cost to campaigns |
| `supabase/migrations/20260522_template_bucket.sql` | **New** | Create `template` storage bucket and upload `template.csv` |
| `packages/shared/src/interfaces/campaign.interface.ts` | **Modified** | Add snapshot fields |

### Sequence: Campaign Lifecycle

```
User          Frontend          Backend          Supabase          Inngest          Voiceflow
 │               │                │                │                 │                │
 │ Create CSVs   │                │                │                 │                │
 │──────────────>│  parse+val     │                │                 │                │
 │               │────────────────│                │                 │                │
 │               │  POST /campaigns (rows)         │                 │                │
 │               │───────────────>│                │                 │                │
 │               │                │  INSERT calls  │                 │                │
 │               │                │───────────────>│                 │                │
 │               │                │  INSERT campaign (Created)       │                │
 │               │                │───────────────>│                 │                │
 │               │ 201 Created    │                │                 │                │
 │               │<───────────────│                │                 │                │
 │               │                │                │                 │                │
 │ Start         │                │                │                 │                │
 │──────────────>│  POST /campaigns/:id/start      │                 │                │
 │               │───────────────>│                │                 │                │
 │               │                │  UPDATE status=In-Progress       │                │
 │               │                │───────────────>│                 │                │
 │               │                │  emit campaign.started           │                │
 │               │                │─────────────────────────────────>│                │
 │               │ 200 OK         │                │                 │                │
 │               │<───────────────│                │                 │                │
 │               │                │                │                 │                │
 │               │                │                │                 │ Step1: fetch   │
 │               │                │                │<────────────────│ calls          │
 │               │                │                │────────────────>│                │
 │               │                │                │                 │                │
 │               │                │                │                 │ Step2: for each│
 │               │                │                │                 │────call───────>│
 │               │                │                │                 │<───response────│
 │               │                │                │                 │                │
 │               │                │  UPDATE call status,cost         │                │
 │               │                │<─────────────────────────────────│                │
 │               │                │───────────────>│                 │                │
 │               │                │                │                 │ ... next call  │
 │               │                │                │                 │                │
 │               │                │                │                 │ Step3: compute │
 │               │                │                │                 │ snapshot       │
 │               │                │                │                 │                │
 │               │                │                │                 │ Step4: UPDATE  │
 │               │                │                │                 │ campaigns      │
 │               │                │<─────────────────────────────────│ (status,       │
 │               │                │                │<────────────────│ metrics)       │
 │               │                │                │                 │                │
 │               │                │                │                 │ Step5: emit    │
 │               │                │                │                 │ campaign.      │
 │               │                │                │                 │ completed      │
 │               │                │                │                 │──┐            │
 │               │                │                │                 │  │            │
 │               │                │                │                 │  ▼            │
 │               │                │                │                 │ PurgeFunction │
 │               │                │  UPDATE calls SET [redacted]     │               │
 │               │                │<─────────────────────────────────│               │
 │               │                │───────────────>│                 │               │
```

### Inngest Dev Server Setup

Add a script to the backend `package.json`:
```json
"inngest:dev": "inngest dev --port 8288"
```

The Inngest client is configured to use `http://localhost:8288` when `NODE_ENV=development`. In production, it points to the Inngest Cloud endpoint.

Dependencies to add:
- `@inngest/inngest` (already present as `inngest`)
- Dev: `inngest-cli` (or use the dev server bundled with the SDK)

### Template Bucket

Supabase storage bucket `template` (public read) with file `template.csv`:
```csv
Customer Name,Phone Number,Age,Preferred Language
John Doe,+14155552671,30,English
```
