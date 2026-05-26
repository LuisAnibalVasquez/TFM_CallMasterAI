# Tasks: Security Audit, RBAC Hardening, and Injection Prevention

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 500–650 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: DB migration + shared schemas → PR 2: Backend infrastructure → PR 3: Frontend validation |
| Delivery strategy | ask-always |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | DB migration (RLS + emergency function + column) + shared Zod schemas | PR 1 | Independent — no backend/frontend deps. Base: main |
| 2 | Backend: ValidationPipe, Throttler, TenantSupabaseService, RolesGuard override, CampaignsService split | PR 2 | Depends on PR 1 for shared schemas (contract tests). Largest PR (~300 lines) |
| 3 | Frontend: RHF + Zod integration in 3 forms | PR 3 | Depends on PR 1 for shared schemas. Independent of PR 2 |

## Phase 1: Database & Shared Schemas (Foundation)

- [x] 1.1 Create migration `20260525_rls_tenant_isolation.sql`: add `profiles.emergency_session` (nullable boolean), create `is_platform_emergency_access()` function, add RLS policies for `campaigns` and `calls` tables
- [x] 1.2 Create `packages/shared/src/schemas/login.schema.ts` with Zod email + password validation
- [x] 1.3 Create `packages/shared/src/schemas/campaign.schema.ts` with Zod shape for name/environment fields
- [x] 1.4 Create `packages/shared/src/schemas/tenant.schema.ts` with Zod shape for tenant create/update
- [x] 1.5 Add `zod` peer dependency to `packages/shared/package.json`
- [x] 1.6 Write unit tests for all Zod schemas (`schema.safeParse(invalid).success === false`)

## Phase 2: Backend Core Implementation

- [ ] 2.1 Modify `apps/backend/src/main.ts`: register `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })` globally; register `ThrottlerModule.forRoot([{ ttl: 60000, limit: 600 }])`
- [ ] 2.2 Create `tenant-supabase.service.ts`: `@Injectable({ scope: Scope.REQUEST })`, extract JWT from `@Inject(REQUEST)`, expose `getClient()` returning `createClient(url, anonKey, { global: { headers: { Authorization } } })`
- [ ] 2.3 Create `allow-override.decorator.ts`: `SetMetadata('allowOverride', true)` decorator
- [ ] 2.4 Modify `roles.guard.ts`: read `@AllowOverride()` metadata; if set + user is PlatformOwner, query `is_platform_emergency_access()` via admin client and bypass role check on true
- [ ] 2.5 Modify `campaigns.service.ts`: replace inline `createClient` with `TenantSupabaseService` injection; propagate REQUEST scope
- [ ] 2.6 Create `campaigns-admin.service.ts`: implements `ICampaignRepository` using `SERVICE_ROLE_KEY` client (singleton), shared `mapToCampaign`/`mapToCall` helpers with service
- [ ] 2.7 Modify `campaigns.module.ts`: bind `ICampaignRepository` → `CampaignsService` for HTTP scope
- [ ] 2.8 Modify `campaigns-inngest.module.ts`: add provider `ICampaignRepository` → `CampaignsAdminService`, inject `SERVICE_ROLE_KEY` from config
- [ ] 2.9 Modify `tenants.controller.ts`: add `@Roles(UserRole.TenantAdmin)` to campaign-running endpoints; add `@AllowOverride()` where platform escape needed
- [ ] 2.10 Add `@nestjs/throttler` to `apps/backend/package.json`

## Phase 3: Backend Testing

- [ ] 3.1 Unit test: ValidationPipe rejects extra fields (send payload with unknown field, expect 400)
- [ ] 3.2 Unit test: RolesGuard honors `@AllowOverride` with PlatformOwner + emergency active
- [ ] 3.3 Integration test: Tenant A cannot GET campaign of Tenant B via API (RLS isolation → 404/403)
- [ ] 3.4 Integration test: PlatformOwner blocked without emergency session (expect 403)
- [ ] 3.5 Integration test: PlatformOwner allowed with `emergency_session=true` (expect 200)

## Phase 4: Frontend Validation

- [ ] 4.1 Add `zod`, `react-hook-form`, `@hookform/resolvers` to `apps/frontend/package.json`
- [ ] 4.2 Modify `LoginPage.tsx`: integrate `useForm` + `zodResolver(loginSchema)`, replace manual `useState`, show toast on invalid email
- [ ] 4.3 Modify `TenantForm.tsx`: integrate `useForm` + `zodResolver(tenantSchema)`
- [ ] 4.4 Modify `CreateCampaignDialog.tsx`: integrate `useForm` + `zodResolver(campaignSchema)` for name/environment; keep custom CSV parser

## Phase 5: Frontend & E2E Testing

- [ ] 5.1 E2E test: render LoginPage, type "bad-email", submit → toast error, no network call
