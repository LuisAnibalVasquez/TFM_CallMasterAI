# Proposal: Dashboard Restructuring

## Intent

Currently, the `PlatformOwnerDashboard` directly serves as the tenant management tool, and the `TenantAdminDashboard` is a placeholder. This change aims to establish a data-driven "Overview" as the primary landing page for all administrators, moving management tools (like the Tenant list) to dedicated sub-pages. This improves information density and aligns the UI with the product vision presented in the landing page's mockup.

## Scope

### In Scope
- **Component Extraction**: Extract `KpiCard` and a `ChartPlaceholder` from `DashboardMockup.tsx` into reusable components in `features/dashboard/components`.
- **Analytic Dashboard**: Create a shared `AnalyticDashboard` component that displays KPIs (Calls, Conversion, Agents) and a chart.
- **Dedicated Management Pages**: Create `TenantsPage` to host the `TenantList` component.
- **Routing Updates**:
  - `/admin/dashboard`: Platform Owner analytics.
  - `/admin/tenants`: Platform Owner tenant management.
  - `/dashboard`: Tenant Admin analytics.
- **Navigation**: Update `DashboardLayout` sidebar to reflect the new structure.
- **Refactoring**: Update `PlatformOwnerDashboard` and `TenantAdminDashboard` to use the new analytic components.

### Out of Scope
- Real-time data integration for analytics (will use mock data for now, matching `DashboardMockup`).
- Advanced filtering or date range selection for analytics.
- Redesigning the `TenantList` itself.

## Capabilities

### New Capabilities
- `analytic-overview`: A reusable dashboard layout showing key performance indicators and trend charts.
- `tenant-management-page`: A dedicated page for platform owners to manage tenants.

### Modified Capabilities
- `platform-administration`: Shift from a single dashboard to a split Analytics/Management structure.
- `tenant-dashboard`: Replace the current placeholder with the new analytic overview.

## Approach

1. **Extract UI**: Move `KpiCard` from `landing/components/dashboard-mockup.tsx` to `dashboard/components/KpiCard.tsx`. Create `CallsChart.tsx` based on the SVG in the mockup.
2. **Create Pages**: 
   - New `features/tenants/pages/TenantsPage.tsx`.
   - New `features/dashboard/pages/TenantAdminDashboard.tsx`.
3. **Update Layout**: Modify `DashboardLayout.tsx` to handle active states correctly and point to the new `/admin/tenants` route.
4. **Wire Routing**: Update `App.tsx` with the new routes.
5. **Styling**: Ensure the new dashboards match the "glass-panel" and soft-shadow aesthetic of the landing page.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `apps/frontend/src/features/dashboard/components/` | New | `KpiCard`, `CallsChart`, `AnalyticOverview` |
| `apps/frontend/src/features/dashboard/pages/` | Modified | `PlatformOwnerDashboard` (now shows analytics) |
| `apps/frontend/src/features/dashboard/pages/` | New | `TenantAdminDashboard` |
| `apps/frontend/src/features/tenants/pages/` | New | `TenantsPage` (hosts `TenantList`) |
| `apps/frontend/src/features/dashboard/layouts/` | Modified | `DashboardLayout` sidebar links |
| `apps/frontend/src/App.tsx` | Modified | Routing for new pages |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Navigation confusion | Low | Clear sidebar labeling ("Overview" vs "Management") |
| Component duplication | Low | Centralizing KPI and Chart components early |

## Rollback Plan

Revert `App.tsx` routing and restore `PlatformOwnerDashboard` to its previous state (importing `TenantList` directly).

## Dependencies

- `lucide-react` (already in project)
- `react-router-dom` (already in project)

## Success Criteria

- [ ] `/admin/dashboard` shows KPI cards (Calls, Conversion, Agents) and a chart.
- [ ] `/admin/tenants` shows the existing `TenantList` table.
- [ ] `/dashboard` shows a similar analytic overview for Tenant Admins.
- [ ] Sidebar navigation correctly switches between "Dashboard" (analytics) and "Tenants".
- [ ] No regression in tenant management functionality (create/edit/delete still work).
