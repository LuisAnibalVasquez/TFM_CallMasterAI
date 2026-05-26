# Tasks: Campaign Orchestration

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 850–1100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: DB + Backend → PR 2: Frontend → PR 3: Inngest + Purge |
| Delivery strategy | ask-on-risk |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: feature-branch-chain (Work Unit 2 applied)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB migrations + backend API + shared interfaces | PR 1 | Campaigns controller, use cases, repository, DB snapshot columns, template bucket |
| 2 | Inngest orchestration + purge function | PR 2 | Depends on PR 1; adds campaign-processing and campaign-purge Inngest functions |
| 3 | Frontend campaign management UI | PR 3 | Pages, dialog, hooks, route wiring, template download |
| 4 | Tests for all layers | PR 4 (or merged into each PR) | Spec alignment verification |

## Phase 1: Foundation — DB & Shared Interfaces

- [x] 1.1 Run Supabase migration: add `total_calls`, `successful_calls`, `failed_calls`, `total_cost` columns to `campaigns` table
- [x] 1.2 Run Supabase migration: create `template` storage bucket and upload `template.csv`
- [x] 1.3 Add snapshot fields to `Campaign` interface in `packages/shared/src/interfaces/campaign.interface.ts`

## Phase 2: Backend API Layer

- [x] 2.1 Create `campaigns.repository.ts` in `campaigns/infrastructure/providers/` with CRUD for campaigns and calls
- [x] 2.2 Create use cases: `create-campaign.use-case.ts`, `start-campaign.use-case.ts`, `cancel-campaign.use-case.ts`, `list-campaigns.use-case.ts`
- [x] 2.3 Create `campaigns.controller.ts` with REST endpoints: GET /campaigns, POST /campaigns, POST /campaigns/:id/start, POST /campaigns/:id/cancel, GET /campaigns/template
- [x] 2.4 Update `campaigns.module.ts` to register controller, repository, use cases
- [x] 2.5 Add `CampaignsModule` to `AppModule`

## Phase 3: Inngest Orchestration

- [x] 3.1 Create `campaigns-inngest.module.ts` with Inngest client configured for dev server (port 8288) and cloud production endpoint
- [x] 3.2 Create `campaign-processing.function.ts`: fetch calls → sequential loop (concurrency 1) → invoke VoiceflowProvider → update call records → compute snapshot → update campaign status → emit `campaign.completed`
- [x] 3.3 Create `campaign-purge.function.ts`: redact `customer_name`, `phone_encrypted`, `phone_hash` for all calls in the completed campaign
- [x] 3.4 Add npm script `inngest:dev` to backend `package.json`

## Phase 4: Frontend

- [x] 4.1 Create `useCampaigns.ts` hook with React Query for campaign list, create, start, cancel, template download
- [x] 4.2 Create `CreateCampaignDialog.tsx`: CSV upload with `papaparse` in-memory parsing and `libphonenumber-js` E.164 validation
- [x] 4.3 Create `CampaignList.tsx`: table with status badges, Start/Cancel action buttons
- [x] 4.4 Create `CampaignsPage.tsx`: composition of list + dialog + template download button
- [x] 4.5 Add `/dashboard/campaigns` route to `App.tsx`

## Phase 5: Testing

- [ ] 5.1 Unit tests for `create-campaign.use-case` (valid CSV rows stored, invalid phone rejected)
- [x] 5.2 Unit tests for `start-campaign.use-case` (status transition, Inngest event emitted)
- [x] 5.3 Unit tests for `cancel-campaign.use-case` (status transition, no purge)
- [x] 5.4 Unit tests for `campaign-processing.function` (sequential processing, snapshot computation)
- [x] 5.5 Unit tests for `campaign-purge.function` (redaction of Name, Phone fields)
- [ ] 5.6 Integration test: full lifecycle (create → start → process → complete → purge → verify redacted)
