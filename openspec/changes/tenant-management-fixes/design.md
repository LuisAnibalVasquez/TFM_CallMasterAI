# Design: Tenant Management Fixes

## Technical Approach

Three independent concerns addressed in parallel: (1) fix `pgcrypto` function signatures for Supabase Cloud compatibility, (2) enrich tenant list with campaign counts via a single recursive Supabase query, and (3) add a frontend deletion guard that disables the delete button for tenants with active campaigns.

## Architecture Decisions

### Decision: pgcrypto Function Signature

| Option | Tradeoff | Decision |
|--------|----------|----------|
| Bare `encrypt(bytea, bytea, 'aes')` | Works locally, 500 in Cloud | Rejected |
| Explicit `extensions.encrypt(...)` + `'aes-cbc/pad:pkcs'` | Compatible everywhere | **Chosen** |

Supabase Cloud requires full schema qualifier and complete algorithm string.

### Decision: Campaign Count via Supabase Recursive Select

Use `select('*, campaigns(count)')` instead of a separate `countCampaigns` per tenant call. Supabase transforms this into a single SQL query with a lateral join — no N+1, no extra round trips.

### Decision: Frontend Guard at Button Level

Disable the Trash2 button when `campaignCount > 0` rather than catching errors after the confirmation dialog. This eliminates the cognitive friction of reaching a confirmation modal only to discover deletion is blocked.

## Data Flow

```
TenantsService.findAll
  └─ supabase.from('tenants').select('*, campaigns(count)')
     └─ Returns rows with nested { campaigns: [{ count: N }] }
        └─ Tenant entity maps field + Tenant interface exposes campaignCount
           └─ Frontend TenantList reads campaignCount, disables button

Delete button state:
  tenant.campaignCount > 0 → button disabled + tooltip
  tenant.campaignCount === 0 → normal flow → DeleteConfirmDialog → API call
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260521_fix_pgcrypto_cloud.sql` | Create | New migration fixing `encrypt`/`decrypt` function signatures |
| `packages/shared/src/interfaces/tenant.interface.ts` | Modify | Add `campaignCount: number` to `Tenant` interface |
| `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` | Modify | Add `campaignCount` property and constructor param |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modify | Change `findAll` to use recursive select, map `campaignCount` in `mapToTenant` |
| `apps/backend/src/modules/tenants/application/use-cases/list-tenants.use-case.ts` | Modify | Pass `campaignCount` through to `PaginatedResult` |
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Modify | Disable Trash2 button, add tooltip based on `campaignCount` |

## Interfaces / Contracts

```typescript
// Modified Tenant interface
export interface Tenant {
  // ... existing fields
  campaignCount: number; // NEW
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Tenant entity `canBeDeleted` | Existing test, verify `campaignCount` param works |
| Unit | `ListTenantsUseCase.execute` | Mock repository, verify `campaignCount` in result |
| Integration | `TenantsService.findAll` | Verify recursive query returns count (if integration test DB available) |
| E2E | Tenant list with campaign count | Manual/Playwright: tenants with 0/1+ campaigns render correct button state |

## Migration / Rollout

Run the new SQL migration to fix pgcrypto functions. Rollback: restore previous function definitions from `20260502_initial_schema.sql`.

## Open Questions

None.
