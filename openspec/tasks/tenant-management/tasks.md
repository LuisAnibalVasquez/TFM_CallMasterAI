# Tasks: Tenant Management

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~580-720 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: DB migration + encryption + domain layer → PR 2: Backend use-cases + controller → PR 3: Frontend UI |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB migration + EncryptionService + domain types | PR 1 | Base: main. Self-contained infra. Tests included. |
| 2 | Backend use-cases (CRUD, status, delete guard) + controller endpoints | PR 2 | Base: main. Depends on PR 1 types at interface level, not code coupling. |
| 3 | Frontend forms, list, status toggle UI | PR 3 | Base: main. Consumes backend API. |

## Phase 1: Database & Encryption Infrastructure

- [x] 1.1 Create `supabase/migrations/20260505_tenant_mgmt.sql` — alter `campaigns.tenant_id` FK from `CASCADE` to `RESTRICT`, add RLS policy for suspended tenant rejection at DB level
- [x] 1.2 Create `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` — wrap pgcrypto RPC calls (`encryptSecret`, `decryptSecret`)
- [x] 1.3 Write unit test: `encryption.service.spec.ts` — encrypt/decrypt roundtrip with mocked Supabase RPC

## Phase 2: Backend Domain & Application Layer

- [x] 2.1 Create `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` — domain entity with `canBeDeleted()`, `toggleStatus()` validation
- [x] 2.2 Create `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` — `ITenantRepository` port interface
- [ ] 2.3 Modify `apps/backend/src/modules/tenants/application/dto/create-tenant.dto.ts` — add `contactPerson`, `sandboxConfig`, `productionConfig`, `logoUrl` fields with validation
- [ ] 2.4 Create `apps/backend/src/modules/tenants/application/dto/update-tenant.dto.ts` — status toggle (`active`↔`suspended`), config update DTO
- [ ] 2.5 Create `apps/backend/src/modules/tenants/application/use-cases/create-tenant.use-case.ts` — orchestrates encryption RPC call, tenant insert, admin user creation, returns temp password once
- [ ] 2.6 Create `apps/backend/src/modules/tenants/application/use-cases/delete-tenant.use-case.ts` — checks campaign count, rejects with 409 if > 0, deletes if 0
- [ ] 2.7 Create `apps/backend/src/modules/tenants/application/use-cases/update-tenant.use-case.ts` — status toggle or config update
- [ ] 2.8 Create `apps/backend/src/modules/tenants/application/use-cases/list-tenants.use-case.ts` — paginated tenant list

## Phase 3: Backend Controller & Wiring

- [ ] 3.1 Modify `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` — refactor to delegate to use-cases, add campaign-count guard, status update
- [ ] 3.2 Modify `apps/backend/src/modules/tenants/application/tenants.controller.ts` — add `PUT`, `DELETE` endpoints (PlatformOwner guarded)
- [ ] 3.3 Modify `apps/backend/src/modules/tenants/tenants.module.ts` — register `EncryptionService`, import `CampaignsModule`
- [ ] 3.4 Modify `packages/shared/src/interfaces/tenant.interface.ts` — add `CreateTenantInput`, `UpdateTenantInput` types

## Phase 4: Backend Tests

- [ ] 4.1 Unit test: `create-tenant.use-case.spec.ts` — verifies encryption called with plaintext before insert, temp password returned once
- [ ] 4.2 Unit test: `delete-tenant.use-case.spec.ts` — rejects when campaign count > 0, deletes when count = 0
- [ ] 4.3 Unit test: `update-tenant.use-case.spec.ts` — toggles status, updates config
- [ ] 4.4 Integration test: pgcrypto encrypt→store→decrypt roundtrip against real Supabase local instance

## Phase 5: Frontend Implementation

- [ ] 5.1 Create `apps/frontend/src/features/tenants/services/tenantService.ts` — API client for CRUD endpoints
- [ ] 5.2 Create `apps/frontend/src/features/tenants/hooks/useTenants.ts` — React Query hooks (useQuery, useMutation)
- [ ] 5.3 Create `apps/frontend/src/features/tenants/components/TenantForm.tsx` — create/edit form with AI config sections (sandbox + production API URL/Key fields)
- [ ] 5.4 Create `apps/frontend/src/features/tenants/components/TenantList.tsx` — table with status toggle, delete button (guarded), temp password display modal
