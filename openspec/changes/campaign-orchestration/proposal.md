# Proposal: Campaign Orchestration

## Intent
Implement the full campaign lifecycle (creation, ingestion, execution) to enable Tenants to manage automated call campaigns. This change bridges the gap between the core specification and the actual implementation, ensuring reliable data ingestion, strict phone number validation, and sequential asynchronous execution via Inngest.

## Scope

### In Scope
- **Frontend**: Campaign management UI under `/dashboard/campaigns` (Listing, Creation Dialog).
- **In-Memory Ingestion**: CSV parsing without persistent file storage (except for the sample template).
- **Validation**: Strict E.164 format validation for customer phone numbers.
- **Orchestration**: Sequential campaign execution (concurrency 1) using Inngest workflows.
- **Provider**: Mock implementation of Voiceflow AI Agent provider.
- **Template**: Storage bucket for downloading a sample `template.csv`.

### Out of Scope
- Real Voiceflow API calls (mocked for now).
- Parallel execution of multiple campaigns for the same tenant.
- Advanced campaign analytics or retry dashboards.

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `campaign-core`: Implementation of existing requirements for creation, ingestion, and orchestration.

## Approach
1. **Frontend**: Build the `CampaignsPage` and `CreateCampaignDialog` using React and Radix UI. Implement client-side CSV parsing for immediate feedback.
2. **Backend**: Create a NestJS controller and use cases for campaign management.
3. **Data Ingestion**: Use `papaparse` for in-memory parsing. Validate each row against E.164 standards. Store validated clients in the `calls` table.
4. **Inngest Orchestration**: 
   - Emit `campaign.started` event.
   - Define an Inngest function that fetches clients and triggers calls sequentially.
   - Use `concurrency: 1` to satisfy the sequential requirement.
5. **Provider Integration**: Inject the `VoiceflowProvider` to trigger calls with tenant-specific configuration (sandbox/production).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend/src/modules/campaigns/` | Modified | Add application layer (controllers, use cases) and Inngest functions. |
| `apps/frontend/src/features/campaigns/` | New | Create campaign management feature module. |
| `apps/frontend/src/App.tsx` | Modified | Add `/dashboard/campaigns` route. |
| `supabase/migrations/` | New | Migration for storage bucket and sample CSV template. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| CSV size performance | Low | Enforce reasonable limits on rows per upload. |
| Inngest failure mid-campaign | Med | Ensure Inngest retries and campaign state persistence. |
| Invalid phone formats | Med | Use robust E.164 validation libraries. |

## Rollback Plan
- Revert the frontend route and feature folder.
- Delete the backend application layer for campaigns.
- Roll back the Supabase migration for the storage bucket.
- Remove Inngest function registrations.

## Dependencies
- Inngest (already in backend `package.json`).
- `papaparse` or similar for CSV parsing.
- `libphonenumber-js` for phone validation.

## Success Criteria
- [ ] Tenant can create a campaign by uploading a valid CSV.
- [ ] Campaign executes calls sequentially (concurrency 1).
- [ ] Phone numbers are validated and stored in E.164 format.
- [ ] Sample CSV template is downloadable from the UI.
- [ ] UI shows correct campaign status (Created -> In-Progress -> Completed).
