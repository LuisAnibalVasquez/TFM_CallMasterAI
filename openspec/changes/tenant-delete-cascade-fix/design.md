# Design: Tenant Delete Cascade Fix

## Technical Approach

Add two new methods to `ITenantRepository`: `listUsersByTenant` (fetches user IDs from `public.profiles`) and `deleteAuthUser` (calls Supabase Admin Auth API). Update `DeleteTenantUseCase` to orchestrate: list users → delete each from Auth → delete tenant.

## Architecture Decisions

| Decision | Choice | Alternatives | Rationale |
|----------|--------|-------------|-----------|
| User ID source | Query `public.profiles` for `tenant_id` | Query `auth.users` via raw SQL | `public.profiles` is our schema, accessible via the Supabase JS client. `auth.users` requires raw SQL with service_role. |
| Auth user deletion | `supabaseAdmin.auth.admin.deleteUser()` | Raw SQL `DELETE FROM auth.users` | The Admin SDK handles cleanup (sessions, reaper hooks). Raw SQL bypasses GoTrue internals and may orphan data. |
| Abort-on-failure | Fail-fast & throw; tenant not deleted | Continue on failure (best-effort) | Partial deletion leaves inconsistencies. The tenant remains so the Platform Owner can retry. |
| Idempotent deletion | Ignore 404 from `deleteUser` | Require every user to exist | A user may be manually removed in the dashboard. Idempotent behavior prevents spurious failures. |

## Data Flow

```
DeleteTenantUseCase.execute(tenantId)
  │
  ├─ 1. findById(tenantId) → throws if not found
  ├─ 2. countCampaigns(tenantId) → throws if > 0
  ├─ 3. listUsersByTenant(tenantId) → [userId, ...]
  │       └─ SELECT id FROM public.profiles WHERE tenant_id = :id
  ├─ 4. For each userId:
  │       └─ deleteAuthUser(userId)
  │            └─ supabaseAdmin.auth.admin.deleteUser(userId)
  │            └─ Ignores 404 (user already gone)
  │
  └─ 5. delete(tenantId)
        └─ DELETE FROM public.tenants WHERE id = :id
```

**Cascade note**: `public.profiles` has `ON DELETE CASCADE` from `auth.users`, so step 4 automatically removes profile rows. The tenant record and associated campaigns are removed in step 5 (DB-level cascading on `campaigns.tenant_id`).

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` | Modify | Add `listUsersByTenant(tenantId): Promise<string[]>` and `deleteAuthUser(userId): Promise<void>` |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modify | Implement both new methods using Supabase Admin Client |
| `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.ts` | Modify | Add orchestration: list users → delete each → delete tenant |

## Interfaces / Contracts

```typescript
// Added to ITenantRepository
listUsersByTenant(tenantId: string): Promise<string[]>;
deleteAuthUser(userId: string): Promise<void>;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit (UseCase) | Deletion orchestration with multiple users, Auth deletion failure, no-users edge case | Mock `ITenantRepository`, assert call order and error propagation |
| Unit (Service) | `listUsersByTenant` Supabase query, `deleteAuthUser` Admin API call | Mock `SupabaseClient`, assert correct `.from("profiles")` and `.auth.admin.deleteUser` calls |
| Integration | Full flow against Supabase local instance | Verify tenant + users + profiles are all removed |

## Migration / Rollout

No migration required. The change is purely behavioral — new orchestration logic in the use case.

## Open Questions

None.
