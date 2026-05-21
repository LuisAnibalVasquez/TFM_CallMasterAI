# Design: Tenant Management

## Technical Approach

Extend the existing NestJS Clean Architecture tenants module with AI provider encryption, deletion constraints, and status management. Leverage the already-deployed pgcrypto `encrypt_secret`/`decrypt_secret` DB functions for AES-256. Decrypt API keys only at Voiceflow invocation time — never store plaintext in memory beyond the request scope.

## Architecture Decisions

| Decision | Option A | Option B | Choice | Rationale |
|----------|----------|----------|--------|-----------|
| Encryption layer | Application (Node `crypto`) | **Database (pgcrypto)** | **B** ✅ | Already decided in `initial-core-specs`. Master key never leaves DB process. DB functions `encrypt_secret`/`decrypt_secret` already deployed. |
| Deletion constraint FK | Keep `ON DELETE CASCADE` + app guard | **Change FK to `RESTRICT`** | **B** ✅ | Spec requires REJECTION, not cascade. New migration `ALTER FK` prevents accidental bypass. App-layer check provides user-friendly error. |
| API key decryption trigger | On tenant load | **On Voiceflow invocation** | **B** ✅ | Spec explicitly: "decrypted at moment of API invocation". Minimizes plaintext key lifetime. |
| Tenant status enforcement | App-layer gate only | **DB RLS policy + app gate** | **B** ✅ | Defense in depth. `suspended` tenants blocked at RLS level so even direct Supabase calls fail. |

## Data Flow

```
[Platform Owner UI] ─── POST /tenants ──→ [TenantsController]
                                               │
                          ┌─────────────────────┤
                          ▼                     ▼
                   [TenantsService]      [Supabase Admin]
                   encrypt via RPC       auth.admin.createUser
                          │                     │
                          ▼                     ▼
                   INSERT tenants          profiles trigger
                   (encrypted keys)        links user→tenant
```

**API Key Decryption (Voiceflow invocation):**

```
[Inngest Step] ─→ [Campaign Service] ─→ SELECT decrypt_secret(sandbox_config->>'encrypted_key', $MASTER_KEY)
                                              │
                                              ▼ plaintext key (ephemeral)
                                        [VoiceflowProvider.triggerCall(config)]
                                              │
                                              ▼ key discarded after HTTP response
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `supabase/migrations/20260505_tenant_mgmt.sql` | Create | Alter FK constraint (CASCADE→RESTRICT), suspended RLS policy |
| `apps/backend/src/modules/tenants/domain/entities/tenant.entity.ts` | Create | Tenant domain entity with validation methods |
| `apps/backend/src/modules/tenants/domain/ports/tenant-repository.port.ts` | Create | ITenantRepository port interface |
| `apps/backend/src/modules/tenants/application/dto/create-tenant.dto.ts` | Modify | Add `sandboxConfig`, `productionConfig`, `logoUrl`, AI provider fields |
| `apps/backend/src/modules/tenants/application/dto/update-tenant.dto.ts` | Create | Status toggle (active↔suspended), config update |
| `apps/backend/src/modules/tenants/application/use-cases/` | Create | CreateTenantUseCase, UpdateTenantUseCase, DeleteTenantUseCase, ListTenantsUseCase |
| `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` | Modify | Add encryption RPC calls, campaign-count guard, status update |
| `apps/backend/src/modules/tenants/infrastructure/providers/encryption.service.ts` | Create | Wraps pgcrypto RPC calls (`encryptSecret`, `decryptSecret`) |
| `apps/backend/src/modules/tenants/tenants.module.ts` | Modify | Register EncryptionService, import CampaignsModule for deletion check |
| `apps/frontend/src/features/tenants/services/tenantService.ts` | Create | API client for tenant CRUD |
| `apps/frontend/src/features/tenants/hooks/useTenants.ts` | Create | React Query hooks |
| `apps/frontend/src/features/tenants/components/TenantForm.tsx` | Create | Create/edit form with AI config sections |
| `apps/frontend/src/features/tenants/components/TenantList.tsx` | Create | Table with status toggle, delete (guarded) |
| `packages/shared/src/interfaces/tenant.interface.ts` | Modify | Add `CreateTenantInput`, `UpdateTenantInput` types |

## Interfaces / Contracts

```typescript
// EncryptionService
interface IEncryptionService {
  encryptSecret(plaintext: string, masterKey: string): Promise<string>;
  decryptSecret(encryptedHex: string, masterKey: string): Promise<string>;
}

// Updated CreateTenantDto (additions to existing)
class CreateTenantDto {
  sandboxConfig: { apiUrl: string; apiKey: string };   // plaintext in, encrypted at rest
  productionConfig: { apiUrl: string; apiKey: string }; // plaintext in, encrypted at rest
  logoUrl?: string;
}

// Deletion guard
class DeleteTenantUseCase {
  // 1. SELECT COUNT(*) FROM campaigns WHERE tenant_id = $id
  // 2. If count > 0 → throw ConflictException("Cannot delete tenant with campaigns")
  // 3. If count == 0 → DELETE tenant (cascades profiles)
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | EncryptionService encrypt/decrypt roundtrip | Jest, mock Supabase RPC |
| Unit | DeleteTenantUseCase rejects when campaigns exist | Mock campaign count > 0 |
| Unit | CreateTenantUseCase encrypts keys before insert | Verify RPC called with plaintext |
| Integration | Supabase pgcrypto encrypt→store→decrypt | Real Supabase local, test ENCRYPTION_MASTER_KEY |
| E2E | Platform Owner creates tenant, sees temp password once | Playwright, verify password not in response body after redirect |

## Migration / Rollout

1. **Migration**: New supabase migration alters `campaigns.tenant_id` FK from `ON DELETE CASCADE` to `ON DELETE RESTRICT`. Idempotent — safe to run on existing data.
2. **Feature flag**: Not required. Existing tenants have empty `sandbox_config`/`production_config` (default `{}`), so encryption is opt-in per tenant until config is set.
3. **Rollback**: Revert migration (restore CASCADE), deploy previous NestJS build.

## Open Questions

- [ ] Should the ENCRYPTION_MASTER_KEY be rotated periodically? If so, we need a re-encrypt migration.
- [ ] Should suspended tenants' existing API keys be temporarily revoked (e.g., rotated) or just rejected by the gateway?
