# Tasks: Tenant Delete Cascade Fix

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 50–80 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Decision needed before apply | No |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Low

## Phase 1: Repository Interface Update

- [x] 1.1 Add `listUsersByTenant(tenantId: string): Promise<string[]>` to `ITenantRepository` port
- [x] 1.2 Add `deleteAuthUser(userId: string): Promise<void>` to `ITenantRepository` port

## Phase 2: Service Implementation

- [x] 2.1 Implement `listUsersByTenant` in `TenantsService`: query `public.profiles` for `id` where `tenant_id = :tenantId`
- [x] 2.2 Implement `deleteAuthUser` in `TenantsService`: call `supabaseAdmin.auth.admin.deleteUser(userId)` with 404 ignore
- [x] 2.3 Add tests for both new methods in `tenants.service.spec.ts`

## Phase 3: UseCase Orchestration Update

- [x] 3.1 Update `DeleteTenantUseCase.execute`: after campaign check, call `listUsersByTenant`, iterate and `deleteAuthUser` for each, then `delete(tenantId)`
- [x] 3.2 Add test scenarios in `delete-tenant.use-case.spec.ts`: multiple users, Auth failure aborts, no users edge case, idempotent on missing Auth user

## Phase 4: Verify Spec Coverage

- [x] 4.1 Verify all spec scenarios are covered by tests: success with users, failure on Auth error, no-users case, multiple users
