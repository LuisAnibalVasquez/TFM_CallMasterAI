# Apply Progress: Tenant Management

**Change**: tenant-management
**Mode**: Standard

## Batch 1 — Work Unit 1: DB Migration + EncryptionService + Domain Types

### Completed Tasks

- [x] 1.1 Create `supabase/migrations/20260505_tenant_mgmt.sql` — ALTER `campaigns.tenant_id` FK from CASCADE to RESTRICT, add RLS policy for suspended tenant rejection
- [x] 1.2 Create `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` — wraps pgcrypto RPC calls (`encryptSecret`, `decryptSecret`)
- [x] 1.3 Write unit test: `encryption.service.spec.ts` — encrypt/decrypt roundtrip with mocked Supabase RPC (5 tests, all passing)
- [x] 2.1 Create `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` — domain entity with `canBeDeleted()`, `toggleStatus()` validation
- [x] 2.2 Create `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` — `ITenantRepository` port interface

### Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `supabase/migrations/20260505_tenant_mgmt.sql` | Created | Drops and re-creates campaigns FK with ON DELETE RESTRICT; adds RLS policy blocking suspended tenant users at DB level |
| `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` | Created | IEncryptionService interface + EncryptionService class using Supabase RPC for pgcrypto encrypt_secret/decrypt_secret |
| `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.spec.ts` | Created | 5 unit tests: encrypt call, encrypt error, decrypt call, decrypt error, full roundtrip |
| `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` | Created | Tenant domain entity with canBeDeleted(campaignCount) and toggleStatus() |
| `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` | Created | ITenantRepository port interface with CRUD + countCampaigns |

### Deviations from Design

None — implementation matches design.

### Issues Found

None.

### Remaining Tasks (Next Batch)

- [ ] 2.3 Modify `create-tenant.dto.ts` — add `contactPerson`, `sandboxConfig`, `productionConfig`, `logoUrl` fields
- [ ] 2.4 Create `update-tenant.dto.ts` — status toggle, config update DTO
- [ ] 2.5 Create `create-tenant.use-case.ts` — orchestrates encryption, insert, admin creation
- [ ] 2.6 Create `delete-tenant.use-case.ts` — campaign count guard
- [ ] 2.7 Create `update-tenant.use-case.ts` — status toggle or config update
- [ ] 2.8 Create `list-tenants.use-case.ts` — paginated list
- [ ] 3.1-3.4 Backend controller, module wiring
- [ ] 4.1-4.4 Backend tests (use-cases + integration)
- [ ] 5.1-5.4 Frontend implementation

### Workload / PR Boundary

- Mode: Chained PR slice (Work Unit 1 of 3)
- Chain strategy: feature-branch-chain
- Current work unit: DB migration + EncryptionService + domain types
- Boundary: Tasks 1.1-1.3, 2.1-2.2 — self-contained infrastructure and domain layer
- Estimated review budget impact: ~80 lines (well under 400-line budget)

### Status

5/19 tasks complete. Ready for next batch (Work Unit 2: Backend use-cases + controller).
