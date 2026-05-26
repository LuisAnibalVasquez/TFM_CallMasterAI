# Design: Security Audit, RBAC Hardening, and Injection Prevention

## Technical Approach

Multi-layered defense spanning three tiers: NestJS pipes (API edge), RBAC guards with override (app layer), and RLS policies (database). Request-scoped Supabase clients replace the current `SERVICE_ROLE_KEY` singleton for tenant-scoped HTTP operations, while Inngest background jobs retain admin access. Frontend adds Zod+RHF for client-side validation at the form edge.

## Architecture Decisions

| Decision | Choice | Alternative | Rationale |
|----------|--------|-------------|-----------|
| Supabase client scope | Request-scoped `TenantSupabaseService` wrapping user JWT, used by `CampaignsService`; admin client stays for Inngest | Decorator-based DI, or pass client at method level | NestJS REQUEST scope is the idiomatic way. Cascade to Inngest avoided by splitting `ICampaignRepository` into two providers: request-scoped for HTTP, singleton admin for background jobs |
| RLS override mechanism | `@AllowOverride()` decorator + DB function `is_platform_emergency_access()` | JWT claim `is_emergency`, or separate API key | Keeps override state server-side (no client-tamperable JWT), extensible to audit logging |
| Frontend validation | Zod schemas in `packages/shared/src/schemas/`, consumed by React Hook Form via `@hookform/resolvers` | Manual validation (current), Yup | Zod is TypeScript-first, tree-shakeable, and already adopted in the ecosystem. Shared package enables backend reuse for contract tests |
| Global ValidationPipe | `whitelist: true, forbidNonWhitelisted: true, transform: true` | `whitelist` only, or manual per-controller pipes | `forbidNonWhitelisted` prevents mass-assignment. `transform` enables automatic type coercion (query params) |
| Rate limiting | `@nestjs/throttler` (global), 10 req/s default | Custom Redis-based throttler, or none | Built into NestJS ecosystem, low setup cost, sufficient for MVP |

## Data Flow

```
  Browser ──Zod schema──▶ React Hook Form ──(sanitized)──▶ ApiClient.post
                                                              │
  NestJS ◀──ThrottlerGuard── ValidationPipe ──❲DTO check❳───┘
    │
    ▼
  AuthGuard → attach req.user (id, role, tenantId, token)
    │
    ▼
  RolesGuard → check @Roles() ⋁ @AllowOverride()
    │
    ▼
  Controller → use case → CampaignsService
    │                        │
    │                 inject(TenantSupabaseService)
    │                        │
    │                 supabase.from("campaigns")
    │                   .select()  ──JWT header──▶  Supabase
    │                                                 │
    └─────────────────── RLS policy ◀──────────────────┘
                          USING (tenant_id = auth.jwt()→>'tenant_id'
                            OR is_platform_emergency_access())
```

**Inngest path**: Background functions inject `ICampaignRepository` bound to admin-scoped `CampaignsAdminService` (SERVICE_ROLE_KEY). RLS is bypassed — this is by design for server-to-server job processing.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `apps/backend/src/main.ts` | Modify | Add `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))` and `ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }])` |
| `apps/backend/src/modules/auth/infrastructure/providers/tenant-supabase.service.ts` | Create | Request-scoped (`@Injectable({ scope: Scope.REQUEST })`). Extracts JWT from `@Inject(REQUEST)`, calls `createClient(url, anonKey, { global: { headers: { Authorization } } })`. Exposes `getClient()` |
| `apps/backend/src/modules/auth/application/decorators/allow-override.decorator.ts` | Create | `@AllowOverride()` metadata decorator (`SetMetadata('allowOverride', true)`) |
| `apps/backend/src/modules/auth/infrastructure/guards/roles.guard.ts` | Modify | Read `@AllowOverride()` metadata. If present + user is PlatformOwner, query `is_platform_emergency_access()` via admin client, bypass role check if true |
| `apps/backend/src/modules/campaigns/infrastructure/providers/campaigns.service.ts` | Modify | Replace `ConfigService` + inline `createClient` with `TenantSupabaseService` injection. Use `this.tenantSupabase.getClient()` for all queries. Becomes request-scoped via dependency cascade |
| `apps/backend/src/modules/campaigns/infrastructure/providers/campaigns-admin.service.ts` | Create | Implements `ICampaignRepository` using `SERVICE_ROLE_KEY` client (singleton). Used by Inngest module. Reuses `mapToCampaign`/`mapToCall` helpers via shared base |
| `apps/backend/src/modules/campaigns/campaigns.module.ts` | Modify | Bind `ICampaignRepository` to `CampaignsService` for HTTP; `CampaignsInngestModule` provides `ICampaignRepository` → `CampaignsAdminService` separately |
| `apps/backend/src/modules/campaigns/inngest/campaigns-inngest.module.ts` | Modify | Add provider `ICampaignRepository` → `CampaignsAdminService`; inject `SERVICE_ROLE_KEY` from `ConfigService` |
| `apps/backend/src/modules/tenants/application/tenants.controller.ts` | Modify | Add `@Roles(UserRole.TenantAdmin)` protection to campaign-running domain; add `@AllowOverride()` to relevant endpoints |
| `packages/shared/src/schemas/` | Create | `login.schema.ts`, `campaign.schema.ts`, `tenant.schema.ts` — Zod schemas matching existing DTOs |
| `apps/frontend/src/features/auth/pages/LoginPage.tsx` | Modify | Integrate `useForm` + `zodResolver(loginSchema)`; replace manual `useState` |
| `apps/frontend/src/features/tenants/components/TenantForm.tsx` | Modify | Integrate `useForm` + `zodResolver(tenantSchema)` |
| `apps/frontend/src/features/campaigns/components/CreateCampaignDialog.tsx` | Modify | Integrate `useForm` + `zodResolver(campaignSchema)` for name/environment fields; keep custom CSV parsing |
| `supabase/migrations/20260525_rls_tenant_isolation.sql` | Create | Standard RLS policies for `campaigns`, `calls`; `is_platform_emergency_access()` function |
| `apps/backend/package.json` | Modify | Add `@nestjs/throttler` |
| `apps/frontend/package.json` | Modify | Add `zod`, `react-hook-form`, `@hookform/resolvers` |
| `packages/shared/package.json` | Modify | Add `zod` as peer dependency |

## RLS Migration Design

```sql
-- Emergency override check function
CREATE OR REPLACE FUNCTION public.is_platform_emergency_access()
RETURNS boolean AS $$
BEGIN
  RETURN public.is_platform_owner()
    AND (SELECT emergency_session FROM public.profiles WHERE id = auth.uid()) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Standard tenant isolation for campaigns
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.campaigns;
CREATE POLICY "tenant_isolation_campaigns" ON public.campaigns FOR ALL
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  OR public.is_platform_emergency_access()
);

-- Same for calls via campaign join
CREATE POLICY "tenant_isolation_calls" ON public.calls FOR ALL
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  )
  OR public.is_platform_emergency_access()
);
```

> **Note**: `profiles.emergency_session` column must be added (nullable boolean). Toggled via admin endpoint only.

## Testing Strategy

| Layer | What | Approach |
|-------|------|----------|
| Unit | ValidationPipe rejects extra fields | NestJS test module with `app.useGlobalPipes`, send payload with extra field, expect 400 |
| Unit | RolesGuard honors `@AllowOverride` | Mock Reflector metadata, test guard with PlatformOwner + emergency active |
| Unit | Zod schemas reject invalid inputs | `expect(schema.safeParse(invalid).success).toBe(false)` in vitest |
| Integration | Tenant data isolation (RLS) | Create two tenants, login as Tenant A, attempt GET campaign of Tenant B → expect 404 |
| Integration | PlatformOwner blocked without emergency | Login as PlatformOwner, GET /campaigns without emergency → expect 403 |
| Integration | PlatformOwner accessible with emergency | Set emergency_session=true, GET /campaigns → expect 200 |
| E2E | Frontend blocks invalid email | Render LoginPage, type "bad-email", submit → expect toast error, no network call |

## Migration / Rollout

1. Deploy migration (add `profiles.emergency_session`, create RLS policies, create functions)
2. Deploy backend (ValidationPipe + Throttler + request-scoped client). `forbidNonWhitelisted: true` may break existing clients sending unknown fields — monitor 400 errors in first 24h.
3. Deploy frontend (Zod + RHF)
4. Rollback: drop new policies, revert `CampaignsService` to create admin client from `ConfigService`, remove `ValidationPipe` from `main.ts`

## Open Questions

- [ ] `emergency_session` toggle endpoint: in-scope for this change or separate?
- [ ] Should `@nestjs/throttler` use Redis store for production, or in-memory sufficient?
