# Apply Progress: Tenant Management

**Change**: tenant-management
**Mode**: Standard

---

## Batch 1 — Work Unit 1: DB Migration + EncryptionService + Domain Types

### Completed Tasks

- [x] 1.1 Create `supabase/migrations/20260505_tenant_mgmt.sql` — ALTER `campaigns.tenant_id` FK from CASCADE to RESTRICT, add RLS policy for suspended tenant rejection
- [x] 1.2 Create `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` — wraps pgcrypto RPC calls (`encryptSecret`, `decryptSecret`)
- [x] 1.3 Write unit test: `encryption.service.spec.ts` — encrypt/decrypt roundtrip with mocked Supabase RPC (5 tests, all passing)
- [x] 2.1 Create `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` — domain entity with `canBeDeleted()`, `toggleStatus()` validation
- [x] 2.2 Create `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` — `ITenantRepository` port interface (extended with `createAdminUser`, `linkUserToTenant`)

### Files Changed (Batch 1)

| File | Action | What Was Done |
|------|--------|---------------|
| `supabase/migrations/20260505_tenant_mgmt.sql` | Created | Drops and re-creates campaigns FK with ON DELETE RESTRICT; adds RLS policy blocking suspended tenant users at DB level |
| `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` | Created | IEncryptionService interface + EncryptionService class using Supabase RPC for pgcrypto encrypt_secret/decrypt_secret |
| `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.spec.ts` | Created | 5 unit tests: encrypt call, encrypt error, decrypt call, decrypt error, full roundtrip |
| `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` | Created | Tenant domain entity with canBeDeleted(campaignCount) and toggleStatus() |
| `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` | Created | ITenantRepository port interface with CRUD + countCampaigns + admin user operations |

---

## Batch 2 — Work Unit 2: Backend Use-Cases + Controller + Wiring + Unit Tests

### Completed Tasks

- [x] 2.3 Modify `create-tenant.dto.ts` — add `contactPerson`, `sandboxConfig`, `productionConfig`, `logoUrl` fields with validation
- [x] 2.4 Create `update-tenant.dto.ts` — status toggle, config update DTO with partial-update semantics
- [x] 2.5 Create `create-tenant.use-case.ts` — orchestrates encryption RPC, tenant insert, admin user creation, temp password returned once
- [x] 2.6 Create `delete-tenant.use-case.ts` — campaign count guard, rejects with 409 ConflictException if > 0
- [x] 2.7 Create `update-tenant.use-case.ts` — status toggle or config update with encryption for new keys
- [x] 2.8 Create `list-tenants.use-case.ts` — paginated tenant list
- [x] 3.1 Modify `tenants.service.ts` — implements ITenantRepository, delegates to use-cases, adds countCampaigns/createAdminUser/linkUserToTenant
- [x] 3.2 Modify `tenants.controller.ts` — add PUT /tenants/:id and DELETE /tenants/:id endpoints, add pagination query params to GET
- [x] 3.3 Modify `tenants.module.ts` — register EncryptionService, all use-cases, ITenantRepository token binding
- [x] 3.4 Modify `tenant.interface.ts` (shared) — add `CreateTenantInput`, `UpdateTenantInput`, `AIConfigInput` types; add `contactPerson` to Tenant
- [x] 4.1 Unit test: `create-tenant.use-case.spec.ts` — 6 tests: encrypt keys before insert, temp password in response, admin user email/password, link user to tenant, missing master key error, encryption error propagation
- [x] 4.2 Unit test: `delete-tenant.use-case.spec.ts` — 5 tests: delete when 0 campaigns, reject when > 0, reject when exactly 1, propagate count error, propagate delete error
- [x] 4.3 Unit test: `update-tenant.use-case.spec.ts` — 7 tests: not found, partial update, status toggle, encrypt sandbox key, encrypt production key, multi-field update, empty delta

### Files Changed (Batch 2)

| File | Action | What Was Done |
|------|--------|---------------|
| `packages/shared/src/interfaces/tenant.interface.ts` | Modified | Added contactPerson, AIConfigInput, CreateTenantInput, UpdateTenantInput |
| `apps/backend/src/modules/tenants/application/dto/create-tenant.dto.ts` | Modified | Added AIConfigDto nested validator, sandboxConfig, productionConfig, contactPerson, logoUrl |
| `apps/backend/src/modules/tenants/application/dto/update-tenant.dto.ts` | Created | Full partial-update DTO with status enum, all tenant fields, nested AI configs |
| `apps/backend/src/modules/tenants/application/use-cases/create-tenant.use-case.ts` | Created | Encrypts both keys via EncryptionService, creates tenant via repository, generates temp password, creates admin user, links to tenant |
| `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.ts` | Created | Counts campaigns, throws ConflictException if > 0, deletes if 0 |
| `apps/backend/src/modules/tenants/application/use-cases/update-tenant.use-case.ts` | Created | Finds tenant, applies partial delta, encrypts new keys if provided |
| `apps/backend/src/modules/tenants/application/use-cases/list-tenants.use-case.ts` | Created | Delegates to repository findAll with pagination |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modified | Implements ITenantRepository; delegates to use-cases; adds countCampaigns, createAdminUser, linkUserToTenant, findAll, findById, update, delete; mapToTenant helper |
| `apps/backend/src/modules/tenants/application/tenants.controller.ts` | Modified | Added PUT /tenants/:id and DELETE /tenants/:id endpoints; added page/limit query params to GET |
| `apps/backend/src/modules/tenants/tenants.module.ts` | Modified | Registered EncryptionService, all 4 use-cases, ITenantRepository token bound to TenantsService |
| `apps/backend/src/modules/tenants/application/use-cases/create-tenant.use-case.spec.ts` | Created | 6 unit tests |
| `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.spec.ts` | Created | 5 unit tests |
| `apps/backend/src/modules/tenants/application/use-cases/update-tenant.use-case.spec.ts` | Created | 7 unit tests |
| `apps/backend/src/modules/tenants/application/tenants.controller.spec.ts` | Modified | Added tests for updateTenant and deleteTenant endpoints + pagination test |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.spec.ts` | Modified | Rewritten to match new constructor (4 use-case dependencies); tests delegation pattern + ITenantRepository methods |
| `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` | Modified | Added createAdminUser and linkUserToTenant methods |
| `packages/shared/dist/` | Rebuilt | Shared package rebuilt to export new types |

---

## Batch 3 — Work Unit 3: DB Migration Fix + Frontend UI (FINAL)

### Completed Tasks

- [x] **DB Fix**: Create `supabase/migrations/20260505_contact_person.sql` — add `contact_person` column to `tenants` table (was missing from initial schema)
- [x] **Backend Fix**: Update `tenants.service.ts` — include `contact_person` in INSERT payload (`create()`) and UPDATE delta mapping (`update()`)
- [x] **Backend Test**: Add 2 tests for `contactPerson` mapping in `tenants.service.spec.ts` (present + absent cases)
- [x] 5.1 Create `apps/frontend/src/features/tenants/services/tenantService.ts` — API client wrapping `apiClient` with typed methods for CRUD endpoints
- [x] 5.2 Create `apps/frontend/src/features/tenants/hooks/useTenants.ts` — custom React hooks (`useTenants`, `useCreateTenant`, `useUpdateTenant`, `useDeleteTenant`) following project's useState/useCallback pattern
- [x] 5.3 Create `apps/frontend/src/features/tenants/components/TenantForm.tsx` — create/edit form with basic fields (name, email, phone, contactPerson, logoUrl) and collapsible AI config sections (sandbox + production API URL/Key)
- [x] 5.4 Create `apps/frontend/src/features/tenants/components/TenantList.tsx` — table with status toggle, delete button (with confirmation dialog guarded by 409 campaign check), temp password display modal, and AI config indicators

### Files Changed (Batch 3)

| File | Action | What Was Done |
|------|--------|---------------|
| `supabase/migrations/20260505_contact_person.sql` | Created | Migration adding `contact_person` text column to `tenants` table |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modified | Added `contact_person` to INSERT payload and UPDATE delta mapping |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.spec.ts` | Modified | Added 2 tests for contactPerson mapping (present → mapped, absent → undefined) |
| `apps/frontend/vitest.config.ts` | Modified | Added `@` path alias to resolve imports in component tests |
| `apps/frontend/src/features/tenants/services/tenantService.ts` | Created | Typed API client with `list(page, limit)`, `create(input)`, `update(id, input)`, `delete(id)` |
| `apps/frontend/src/features/tenants/services/tenantService.test.ts` | Created | 6 tests: list with pagination, create with AI config, update, delete, error propagation, default pagination |
| `apps/frontend/src/features/tenants/hooks/useTenants.ts` | Created | 4 hooks: useTenants (fetch + refetch), useCreateTenant, useUpdateTenant, useDeleteTenant |
| `apps/frontend/src/features/tenants/hooks/useTenants.test.ts` | Created | 8 tests: fetch on mount, fetch error, refetch, create result, create error, clear result, update, update error, delete, delete error |
| `apps/frontend/src/features/tenants/components/TenantForm.tsx` | Created | Create/edit form with basic fields, collapsible sandbox/production AI config sections, temp password modal shown once after creation |
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Created | Tenant table with Name/Contact/Status/AI Config/Actions columns, status toggle, delete with confirmation modal (handles 409), edit button, AI config indicators |
| `apps/frontend/src/features/tenants/components/TenantList.test.tsx` | Created | 4 tests: loading spinner, empty state, rendered rows with data, New Tenant button |

### Deviations from Design

1. **React Query not used**: Tasks 5.2 specified "React Query hooks (useQuery, useMutation)", but React Query (`@tanstack/react-query`) is not a project dependency. Instead, custom hooks were built using `useState`/`useEffect`/`useCallback` following the existing project pattern (same as `PlatformOwnerDashboard.tsx`). This keeps the dependency footprint minimal and matches project conventions.
2. **ITenantRepository extended** (from Batch 2): Added `createAdminUser(email, password)` and `linkUserToTenant(userId, tenantId)` to the port. This was necessary because CreateTenantUseCase needs admin user creation capability without directly depending on Supabase. A future refactoring could split this into a separate `IAuthAdminService` port.
3. **CampaignsModule not imported** (from Batch 2): Task 3.3 says to import CampaignsModule, but the campaigns module does not exist yet. TenantsService accesses campaigns via direct Supabase query (`countCampaigns`). The module import is deferred until the campaigns module is fully implemented.
4. **TenantList uses table layout instead of card grid**: The existing `PlatformOwnerDashboard` uses a card grid, but the tenant list requires more columns (contact person, AI config status, multiple actions). A table layout provides better information density and scanability for the multi-column tenant data.

### Issues Found

None.

### Test Results

```
Backend: 38 passed, 38 total (6 suites)
Frontend: 26 passed, 26 total (5 suites)
Combined: 64 passed, 64 total (11 suites)
```

---

### Remaining Tasks

- [ ] 4.4 Integration test: pgcrypto encrypt→store→decrypt roundtrip against real Supabase local instance (requires Supabase local stack)

### Workload / PR Boundary

- Mode: Chained PR slice (Work Unit 3 of 3 — FINAL)
- Chain strategy: feature-branch-chain
- Current work unit: DB migration fix + Frontend UI
- Boundary: Tasks 5.1-5.4 plus contactPerson DB fix — complete frontend implementation with tests
- Estimated review budget impact: ~550 lines (11 files changed, ~500 estimated changed lines)

### Status

**20/21 tasks complete** (20 done + 4.4 pending). All code-level tasks are complete. Only the integration test (4.4) remains, which requires a running Supabase local instance.

Ready for sdd-verify or sdd-archive. The remaining task 4.4 can be completed as a follow-up after setting up the Supabase local environment.

---

## Verification Fixes — Resolved Warnings from sdd-verify

### Fix 1: Frontend TypeScript enum errors

Replaced all raw string literals (`"active"`, `"suspended"`) with `TenantStatus.ACTIVE` / `TenantStatus.SUSPENDED` enum members from `@callmaster/shared`.

**Source file:**
| File | Change |
|------|--------|
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Changed import from `type`-only to value import (`TenantStatus` is an enum, needs runtime access). Replaced 4 string comparisons/assignments with `TenantStatus.ACTIVE` / `TenantStatus.SUSPENDED`. |

**Test files:**
| File | Change |
|------|--------|
| `apps/frontend/src/features/tenants/components/TenantList.test.tsx` | Added `TenantStatus` import; replaced 2 mock data `status` fields with enum members (lines 78, 91). |
| `apps/frontend/src/features/tenants/services/tenantService.test.ts` | Added `TenantStatus` import; replaced 4 string literals in mock data and assertions with enum members. |
| `apps/frontend/src/features/tenants/hooks/useTenants.test.ts` | Added `TenantStatus` import; replaced 5 string literals in mock data with enum members. |

### Fix 2: Backend Error Handling — DeleteTenantUseCase

Added `NotFoundException` for non-existent tenant IDs instead of letting it fall through to a generic 500.

**`delete-tenant.use-case.ts`**: Added `findById()` existence check before `countCampaigns()`. If not found, throws `NotFoundException('Tenant with ID {id} not found')` before any other operations.

**`delete-tenant.use-case.spec.ts`**: Added new test "should throw NotFoundException if tenant does not exist" (mocks `findById → null`, verifies 404 message and no further calls). Updated remaining 5 tests to mock `findById` returning a valid tenant stub.

**Test results**: All 6 tests pass (1 new + 5 existing, all green).

### Fix 3: Missing Frontend Test Script

Added `"test": "vitest run"` to `apps/frontend/package.json` scripts section.

### Verification Test Results After Fixes

```
Backend: 62 passed, 63 total (1 pre-existing auth failure — unrelated)
Frontend: 26 passed, 26 total (all vitest passing; 1 Playwright example failure — unrelated)
DeleteTenantUseCase: 6/6 passed (includes new NotFoundException test)
Types: TenantStatus enum members resolve correctly in all 4 frontend files
```

### Files Changed (Verification Fixes)

| File | Action | What Was Done |
|------|--------|---------------|
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Modified | Replaced `type` import with value import; 4 string literals → `TenantStatus.ACTIVE`/`SUSPENDED` |
| `apps/frontend/src/features/tenants/components/TenantList.test.tsx` | Modified | Added `TenantStatus` import; replaced mock status strings with enum members |
| `apps/frontend/src/features/tenants/services/tenantService.test.ts` | Modified | Added `TenantStatus` import; replaced 4 string literals with enum members |
| `apps/frontend/src/features/tenants/hooks/useTenants.test.ts` | Modified | Added `TenantStatus` import; replaced 5 string literals with enum members |
| `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.ts` | Modified | Added `findById()` existence check → `NotFoundException` before campaign count |
| `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.spec.ts` | Modified | Added NotFoundException test; updated all 5 existing tests with `findById` mock |
| `apps/frontend/package.json` | Modified | Added `"test": "vitest run"` script |
