# Proposal: Security Audit, RBAC Hardening, and Injection Prevention

## Intent
Harden the platform's security posture by implementing multi-layered defense (Defense-in-Depth). This addresses critical flaws in tenant isolation (RLS bypass) and prevents common backend injection/payload attacks (OWASP Top 10).

## Scope

### In Scope
- **Backend Hardening**: Implementation of global `ValidationPipe` and `Throttler` (Rate Limiting).
- **Tenant Isolation**: Refactor services to use Request-scoped Supabase clients, enforcing Row Level Security (RLS).
- **RLS Policies**: Standardize and complete RLS coverage across all public schemas (especially `public.calls`).
- **RBAC Overrides**: Design of an extensible "Emergency Override" mechanism for `PlatformOwner`.
- **Frontend Validation**: Standardize on `Zod` schemas for all forms and API interactions.

### Out of Scope
- Full implementation of "Emergency Actions" UI (only the architectural support in RLS/RBAC).
- Migration of existing users' passwords (not changing hashing algorithms).

## Capabilities

### New Capabilities
- `input-validation-sanitization`: Global enforcement of schema validation and payload sanitization to prevent XSS and Injection.
- `tenant-data-isolation`: Native enforcement of multi-tenancy at the database level via RLS and JWT-bound clients.

### Modified Capabilities
- `security-auth`: Update RBAC requirements to include `PlatformOwner` isolation and emergency override policies.

## Approach

### 1. Extensible RBAC/RLS Design
- **Isolation by Default**: RLS policies will strictly enforce `tenant_id = auth.jwt() ->> 'tenant_id'`.
- **Architectural Override**: Add a database function `is_platform_emergency_access()` and include it in RLS policies:
  ```sql
  CREATE POLICY "tenant_isolation" ON campaigns
  USING (tenant_id = auth.jwt() ->> 'tenant_id' OR (is_platform_admin() AND is_emergency_session()));
  ```
- **NestJS Guards**: Update `RolesGuard` to support an `@AllowOverride()` metadata, enabling `PlatformOwner` access only on specific endpoints.

### 2. Injection Prevention (OWASP-Aligned)
- **Backend**: Enable `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })`. This prevents mass assignment and ensures payloads match expected DTOs.
- **ORM Safety**: Exclusively use Supabase (PostgREST) for queries, ensuring all inputs are parameterized.
- **Frontend**: Implement `Zod` at the edges (forms and `fetch` wrappers) to sanitize data before transmission.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/backend/src/main.ts` | Modified | Enable Global Pipes and Throttler. |
| `apps/backend/src/modules/*/providers/*.service.ts` | Modified | Switch to Request-scoped Supabase client. |
| `apps/frontend/src/features/` | Modified | Integration of Zod schemas in all forms. |
| `supabase/migrations/` | New/Modified | Definition of comprehensive RLS policies. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Performance overhead | Low | Request-scoped clients are lightweight; NestJS handles dependency injection efficiently. |
| Breaking existing API clients | Medium | Use `whitelist: true` but ensure all required fields are correctly decorated in DTOs. |

## Rollback Plan
1. Revert NestJS service injection to Singleton scope.
2. Disable `ValidationPipe` in `main.ts`.
3. Drop new RLS policies and revert to `SERVICE_ROLE_KEY` client.

## Success Criteria
- [ ] No tenant can access another tenant's data via API (verified by automated tests).
- [ ] Payloads with extra/unwanted fields are rejected by the API (400 Bad Request).
- [ ] `PlatformOwner` is denied access to `Campaigns` by default, but allowed when "Emergency Mode" is simulated.
- [ ] Frontend prevents submission of invalid data formats (email, numbers, lengths) before network call.
