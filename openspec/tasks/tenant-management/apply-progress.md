# Apply Progress: Tenant Management

**Change**: tenant-management
**Mode**: Standard

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

### Deviations from Design

1. **ITenantRepository extended**: Added `createAdminUser(email, password)` and `linkUserToTenant(userId, tenantId)` to the port. This was necessary because CreateTenantUseCase needs admin user creation capability without directly depending on Supabase. A future refactoring could split this into a separate `IAuthAdminService` port.
2. **CampaignsModule not imported**: Task 3.3 says to import CampaignsModule, but the campaigns module does not exist yet. TenantsService accesses campaigns via direct Supabase query (`countCampaigns`). The module import is deferred until the campaigns module is fully implemented.

### Issues Found

None.

### Test Results

```
Test Suites: 6 passed, 6 total
Tests:       37 passed, 37 total
```

### Remaining Tasks

- [ ] 4.4 Integration test: pgcrypto encrypt→store→decrypt roundtrip against real Supabase local instance
- [ ] 5.1 Create `apps/frontend/src/features/tenants/services/tenantService.ts` — API client for CRUD endpoints
- [ ] 5.2 Create `apps/frontend/src/features/tenants/hooks/useTenants.ts` — React Query hooks
- [ ] 5.3 Create `apps/frontend/src/features/tenants/components/TenantForm.tsx` — create/edit form with AI config sections
- [ ] 5.4 Create `apps/frontend/src/features/tenants/components/TenantList.tsx` — table with status toggle, delete button, temp password modal

### Workload / PR Boundary

- Mode: Chained PR slice (Work Unit 2 of 3)
- Chain strategy: feature-branch-chain
- Current work unit: Backend use-cases + controller + wiring + unit tests
- Boundary: Tasks 2.3-2.8, 3.1-3.4, 4.1-4.3 — complete backend implementation and tests
- Estimated review budget impact: ~400 lines (at budget boundary — 16 files changed, ~370 estimated changed lines)

### Status

16/19 tasks complete. Ready for next batch (Work Unit 3: Frontend UI).
