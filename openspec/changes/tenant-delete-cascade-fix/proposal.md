# Proposal: Tenant Delete Cascade Fix

## Intent

Currently, deleting a tenant leaves "stale" users in Supabase Auth (GoTrue). While database-level cascading (on `public.profiles`) might remove the profile records, the underlying Auth users remain because `auth.users` is outside the reach of standard `public` schema cascading. This change ensures that when a tenant is deleted, all its associated users are explicitly removed from Supabase Auth via the Admin API.

## Scope

### In Scope
- Fetching all user IDs associated with a tenant from the `profiles` table.
- Deleting users from Supabase Auth using `auth.admin.deleteUser`.
- Updating the `DeleteTenantUseCase` to orchestrate this cleanup before tenant deletion.
- Updating `ITenantRepository` and `TenantsService` to support these operations.

### Out of Scope
- Modifying database FK constraints (already handled manually).
- Automated backup of tenant data before deletion.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `tenant-management`: Update the deletion flow to include Auth user cleanup as required by the "Successful Tenant deletion" scenario.

## Approach

1.  **Repository Update**: Add `listUsersByTenant(tenantId: string)` and `deleteAuthUser(userId: string)` to `ITenantRepository`.
2.  **Service Implementation**:
    *   `listUsersByTenant`: Query `public.profiles` for `id` where `tenant_id = :tenantId`.
    *   `deleteAuthUser`: Call `supabaseAdmin.auth.admin.deleteUser(userId)`.
3.  **UseCase Orchestration**:
    *   In `DeleteTenantUseCase`, after verifying the tenant has no campaigns:
    *   Retrieve all user IDs for the tenant.
    *   Iterate and delete each user from Auth.
    *   Finally, delete the tenant record.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `.../domain/ports/tenant-repository.port.ts` | Modified | New methods for user listing and deletion. |
| `.../infrastructure/providers/tenants.service.ts` | Modified | Implementation of new repository methods using Supabase Admin Client. |
| `.../application/use-cases/delete-tenant.use-case.ts` | Modified | Orchestration logic for user cleanup. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Partial user deletion | Medium | Ensure tenant deletion only happens after all users are successfully removed. Add logging for failures. |
| Performance (many users) | Low | Tenants typically have few users (Admins). If expected to have hundreds, we'd need batching. |
| Auth/DB inconsistency | Low | The `profiles` table has `ON DELETE CASCADE` from `auth.users`, so deleting from Auth cleans up DB profiles automatically. |

## Rollback Plan

Revert code changes. Manual cleanup of any orphaned users in Supabase dashboard if a partial deletion occurred during testing.

## Dependencies

- Supabase Service Role Key (already configured in `TenantsService`).

## Success Criteria

- [ ] Deleting a tenant results in 0 rows for that tenant in `public.tenants`.
- [ ] Deleting a tenant results in 0 rows in `auth.users` for users previously belonging to that tenant.
- [ ] Deleting a tenant results in 0 rows in `public.profiles` for those users.
