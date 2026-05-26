# Tasks: Dashboard Restructuring

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 220–300 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | single-pr |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Extract components + create pages + update routing + sidebar | PR 1 | Single coherent change; all parts depend on each other |

## Phase 1: Component Extraction

- [x] 1.1 Extract `KpiCard` from `landing/components/dashboard-mockup.tsx` to `shared/components/analytics/KpiCard.tsx`. Update mockup to re-import.
- [x] 1.2 Extract `CallsChart` (SVG area + gradient) from `dashboard-mockup.tsx` to `shared/components/analytics/CallsChart.tsx`. Update mockup to re-import.
- [x] 1.3 Create `shared/components/analytics/AnalyticOverview.tsx` composing KpiCard (×3) + CallsChart.

## Phase 2: Page Reorganization

- [x] 2.1 Rewrite `PlatformOwnerDashboard.tsx` — replace `TenantList` with `AnalyticOverview`.
- [x] 2.2 Create `features/dashboard/pages/TenantAdminDashboard.tsx` rendering `AnalyticOverview`.
- [x] 2.3 Create `features/tenants/pages/TenantsPage.tsx` rendering `TenantList` with page title.

## Phase 3: Routing & Navigation

- [x] 3.1 Update `App.tsx` — add imports for `TenantsPage` and `TenantAdminDashboard`, add `/admin/tenants` route, replace inline placeholder for `/dashboard` with `TenantAdminDashboard`.
- [x] 3.2 Update `DashboardLayout.tsx` — add `useLocation()`, derive active state by pathname match, point Tenants link to `/admin/tenants`.

## Phase 4: Testing

- [x] 4.1 Write test for `KpiCard`: renders props, highlight colors.
- [x] 4.2 Write test for `AnalyticOverview`: renders 3 KPI cards + chart.
- [x] 4.3 Write test for `TenantsPage`: delegates to `TenantList`.
- [x] 4.4 Verify no regression: `TenantList.test.tsx` still passes.
