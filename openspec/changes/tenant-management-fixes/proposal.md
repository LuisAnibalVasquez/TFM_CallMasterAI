# Proposal: Fix Tenant Operations and Implement Deletion Guard

## Intent

Fix critical 500 errors in Supabase Cloud during tenant creation/update due to `pgcrypto` function signature mismatches. Improve UX by preventing deletion of tenants with active campaigns at the UI level, and ensure frontend stability during deletion.

## Scope

### In Scope
- **SQL Migration**: Fix `encrypt_secret` and `decrypt_secret` signatures and schema references for Supabase Cloud compatibility.
- **Shared Interface**: Add `campaignCount` property to `Tenant` interface.
- **Backend Implementation**:
    - Update `Tenant` entity and DTOs to include `campaignCount`.
    - Update `TenantsService.findAll` to fetch campaign counts efficiently using Supabase aggregate selection.
    - Update `ListTenantsUseCase` to pass the count to the frontend.
- **Frontend Implementation**:
    - Update `TenantList.tsx` to disable the Delete button for tenants with `campaignCount > 0`.
    - Implement a tooltip or descriptive text explaining the deletion constraint.
    - Verify `ApiClient` handles 204/empty responses (Logic confirmed in code).

### Out of Scope
- Automatic deletion of campaigns when a tenant is deleted (business rule prohibits this).
- Moving encryption logic to the application layer (will remain in DB for security).

## Capabilities

### New Capabilities
None.

### Modified Capabilities
- `tenant-management`: Updated to include campaign counts in list view and preventive UI guards for deletion.

## Approach

### 1. SQL Compatibility (pgcrypto)
Update `encrypt_secret` and `decrypt_secret` to explicitly reference the `extensions` schema and use the full algorithm string `aes-cbc/pad:pkcs` to avoid ambiguity in Cloud environments.

```sql
-- Example fix
CREATE OR REPLACE FUNCTION public.encrypt_secret(secret text, master_key text)
RETURNS text AS $$
BEGIN
    RETURN encode(extensions.encrypt(secret::bytea, master_key::bytea, 'aes-cbc/pad:pkcs'), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 2. Data Enrichment (N+1 Prevention)
Modify `TenantsService.findAll` to use Supabase's recursive selection to get campaign counts in a single query:
`this.supabaseAdmin.from('tenants').select('*, campaigns(count)')`.

### 3. Frontend Preventive Guard
Modify the `TenantList` component to disable the trash icon button if `tenant.campaignCount > 0`.
Use a `title` attribute or a tooltip to inform the user: "Cannot delete tenant with existing campaigns".

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `supabase/migrations/` | Modified | Fix pgcrypto function signatures. |
| `packages/shared/src/interfaces/tenant.interface.ts` | Modified | Add `campaignCount` to `Tenant`. |
| `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` | Modified | Add `campaignCount` property. |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modified | Populate `campaignCount` in `findAll`. |
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Modified | Disable delete button based on `campaignCount`. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Encryption mismatch with existing data | Low | Cloud is currently failing (no data), local can be re-encrypted if necessary. |
| Performance of aggregate count | Low | Campaigns table has index on `tenant_id`. |

## Rollback Plan
Revert SQL functions to previous version and remove `campaignCount` from interfaces/entities.

## Dependencies
- Supabase `pgcrypto` extension must be active (already is).

## Success Criteria
- [ ] Tenant creation/update works in Supabase Cloud without 500 errors.
- [ ] Tenant list displays correctly with campaign counts.
- [ ] Delete button is disabled for tenants with 1+ campaigns.
- [ ] Deleting a tenant with 0 campaigns works without frontend crashes.
