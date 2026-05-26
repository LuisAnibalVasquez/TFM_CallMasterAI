## Exploration: Security Audit (RBAC, RLS, and OWASP)

### Current State
The platform currently consists of a React frontend and a NestJS backend interacting with a Supabase database. Authentication is handled by Supabase Auth, with a custom JWT profile containing `role` and `tenantId`.

**Frontend:**
- Implements basic HTML5 form validations (e.g., `required`, `type="email"`).
- Manual validation logic exists for CSV parsing and specific fields (e.g., `TenantForm`).
- No global schema validation library (like Zod or Yup) is used to validate inputs before making API requests.

**Backend:**
- Uses NestJS decorators (`class-validator`) on DTOs, but the `ValidationPipe` is missing from `main.ts`, meaning all payload validations are bypassed.
- Defines RBAC using a custom `@Roles()` decorator and `RolesGuard`. The `TenantsController` restricts access to `PlatformOwner`.
- `CampaignsController` uses `AuthGuard` and `RolesGuard`, but lacks a `@Roles(UserRole.TenantAdmin)` decorator.
- Supabase database uses RLS policies on `tenants` and `campaigns`, but `public.calls` lacks policies.
- **Critical Flaw:** The NestJS `TenantsService` and `CampaignsService` instantiate the Supabase client using the `SERVICE_ROLE_KEY`. This bypasses **all database-level Row Level Security (RLS)**, shifting the entire burden of data isolation (multitenancy) onto manual application logic.

### Affected Areas
- `apps/backend/src/main.ts` — Missing `ValidationPipe`.
- `apps/backend/src/modules/campaigns/infrastructure/controllers/campaigns.controller.ts` — Missing `@Roles` decorators.
- `apps/backend/src/modules/campaigns/infrastructure/providers/campaigns.service.ts` — Uses `SERVICE_ROLE_KEY`, bypassing RLS.
- `apps/backend/src/modules/tenants/infrastructure/providers/tenants.service.ts` — Uses `SERVICE_ROLE_KEY`, bypassing RLS.
- `apps/frontend/src/features/**/*.tsx` — Missing robust client-side validation schema (Zod).
- `supabase/migrations/` — Missing RLS policies for `public.calls`.

### Approaches

1. **Approach: Strict Defense-in-Depth (Recommended)**
   - **Backend:** 
     - Add `app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))` in `main.ts` (mitigates Injection/Mass Assignment).
     - Instantiate Supabase clients dynamically in requests using the user's JWT (`createClient(url, anonKey, { global: { headers: { Authorization: token } } })`) to enforce database RLS.
     - Add RLS policies for `public.calls`.
     - Add `@Roles(UserRole.TenantAdmin)` to `CampaignsController`.
     - Implement rate limiting (`@nestjs/throttler`) to prevent DoS/Brute-force.
   - **Frontend:** 
     - Implement `zod` schemas for all forms (`react-hook-form` + `@hookform/resolvers/zod`) to secure inputs against validation bypass and XSS payloads at the boundaries.
   - **Pros:** Aligns with OWASP Top 10 (Injection, Broken Access Control). Strong multi-layered security.
   - **Cons:** Requires refactoring service injection scope in NestJS (from `Singleton` to `Request` scoped).
   - **Effort:** Medium/High

2. **Approach: App-Level Only Security**
   - **Backend:** 
     - Add `ValidationPipe` in `main.ts`. 
     - Add `@Roles(UserRole.TenantAdmin)` to `CampaignsController`.
     - Keep `SERVICE_ROLE_KEY` in services but rigorously audit and add `where('tenant_id', req.user.tenantId)` on every query.
   - **Frontend:** 
     - Keep existing manual validations, just add manual string length/format checks.
   - **Pros:** Fast implementation, no need to change Supabase auth flow in the backend.
   - **Cons:** Highly fragile. A single developer mistake (forgetting an `eq` clause) results in catastrophic data leaks between tenants. Violates zero-trust architectures.
   - **Effort:** Low

### Recommendation
**Approach 1 (Strict Defense-in-Depth)** is strongly recommended. 
Relying entirely on app-level filters while holding the `SERVICE_ROLE_KEY` negates the primary benefit of Supabase (RLS). Enforcing `ValidationPipe` is critical to stop injection attacks immediately. Implementing Zod on the frontend provides a better user experience and robust defense before requests hit the network.

### Risks
- Changing services to Request-Scoped (to use the user's JWT) can slightly impact performance in NestJS, but it is necessary for secure multitenancy with Supabase RLS.
- Missing `ValidationPipe` means currently deployed instances are vulnerable to mass assignment and payload pollution.
- `PlatformOwner` could crash campaign endpoints if they bypass the UI and make API calls, as their `tenantId` is `null`.

### Ready for Proposal
Yes. The orchestrator should proceed to define the exact tasks to implement `ValidationPipe`, Zod schemas on the frontend, fix the RBAC roles, and either update the Supabase client strategy or strictly enforce RLS policies alongside app-level validations.