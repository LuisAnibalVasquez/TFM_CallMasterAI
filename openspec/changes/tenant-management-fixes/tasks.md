# Tasks: Tenant Management Fixes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 90–140 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Fix pgcrypto + enrich tenant list + frontend guard | Single PR | All changes are small and scoped to tenant domain |

## Phase 1: Database Migration

- [x] 1.1 Create `supabase/migrations/20260521_fix_pgcrypto_cloud.sql` — replace `encrypt`/`decrypt` with schema-qualified `extensions.encrypt` + `'aes-cbc/pad:pkcs'`

## Phase 2: Backend — Campaign Count

- [x] 2.1 Add `campaignCount: number` to `Tenant` interface in `packages/shared/src/interfaces/tenant.interface.ts`
- [x] 2.2 Add `campaignCount` property and constructor param to `Tenant` entity in `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts`
- [x] 2.3 Update `TenantsService.findAll` to use `.select('*, campaigns(count)')` and map `campaignCount` in `mapToTenant`
- [x] 2.4 Update `ListTenantsUseCase` to include `campaignCount` in `PaginatedResult` (no additional work — propagates from entity)

## Phase 3: Frontend Deletion Guard

- [x] 3.1 In `TenantList.tsx`, add `disabled` prop to Trash2 button when `tenant.campaignCount > 0`
- [x] 3.2 Add `title` tooltip "Cannot delete tenant with existing campaigns" on disabled delete button
- [x] 3.3 Skip `setDeleteConfirm` dialog when button is disabled (no code change needed — disabled button blocks `onClick`)

## Phase 4: Verification

- [ ] 4.1 Verify tenant creation works in Supabase Cloud (no 500 errors)
- [ ] 4.2 Verify tenant list shows correct campaign counts
- [ ] 4.3 Verify delete button disabled state for tenants with campaigns
- [ ] 4.4 Verify delete works for tenants with 0 campaigns (no frontend crash)
