# Design: Dashboard Restructuring

## Architecture

```
features/dashboard/
├── components/
│   ├── KpiCard.tsx          ← Extracted from landing DashboardMockup
│   ├── CallsChart.tsx       ← Extracted from landing DashboardMockup
│   └── AnalyticOverview.tsx ← Composes KpiCard (×3) + CallsChart
├── pages/
│   ├── PlatformOwnerDashboard.tsx  ← Rewired to use AnalyticOverview
│   └── TenantAdminDashboard.tsx    ← New, uses AnalyticOverview
└── layouts/
    └── DashboardLayout.tsx  ← Updated sidebar routing + active state

features/tenants/
├── pages/
│   └── TenantsPage.tsx      ← New, wraps TenantList
└── components/
    └── TenantList.tsx       ← Unchanged
```

## Component Tree

```
DashboardLayout
├── [Sidebar: Dashboard link → role-appropriate analytics route]
├── [Sidebar: Tenants link → /admin/tenants (PO only)]
└── <Outlet>
    ├── /admin/dashboard → PlatformOwnerDashboard
    │   └── AnalyticOverview
    │       ├── KpiCard (Calls, 12,847, +18.2%)
    │       ├── KpiCard (Conversion, 34.6%, +4.1%, highlight)
    │       ├── KpiCard (Agents, 48, online)
    │       └── CallsChart
    ├── /admin/tenants → TenantsPage
    │   └── TenantList (unchanged)
    └── /dashboard → TenantAdminDashboard
        └── AnalyticOverview (same layout)
```

## Extraction Strategy

1. **KpiCard.tsx**: Copy the `KpiCard` function from `landing/components/dashboard-mockup.tsx` into `dashboard/components/KpiCard.tsx`. Export named. Update `DashboardMockup` to import from the new location.

2. **CallsChart.tsx**: Extract the SVG area chart block (lines 51-91) from `DashboardMockup` into `dashboard/components/CallsChart.tsx`. Accept an optional `className` prop for layout. Export named. Update `DashboardMockup` to import from the new location.

3. **AnalyticOverview.tsx**: Create a new component that composes `KpiCard` × 3 (Calls, Conversion, Agents) and `CallsChart` in a vertical stack matching the mockup grid. Accept no props — data is static for now (per out-of-scope).

## Page Reorganization

- **PlatformOwnerDashboard.tsx**: Replace the `TenantList` import with `AnalyticOverview`. Remove the `TenantList` import.
- **TenantAdminDashboard.tsx**: New file. Import and render `AnalyticOverview`. Same layout as the PO version.
- **TenantsPage.tsx**: New file in `features/tenants/pages/`. Import and render `TenantList`. Add appropriate page title.

## Routing Changes (`App.tsx`)

```tsx
import { TenantsPage } from "./features/tenants/pages/TenantsPage";
import { TenantAdminDashboard } from "./features/dashboard/pages/TenantAdminDashboard";

// Inside <Route element={<DashboardLayout />}>
<Route path="/admin/dashboard" element={<PlatformOwnerDashboard />} />
<Route path="/admin/tenants" element={<TenantsPage />} />
<Route path="/dashboard" element={<TenantAdminDashboard />} />
```

## Sidebar Update (`DashboardLayout.tsx`)

- Change the "Tenants" link `to` from `/admin/dashboard` to `/admin/tenants`.
- Use `useLocation()` to derive active state: compare `pathname` against link paths. Apply `bg-secondary text-secondary-foreground` to the active link, `text-muted-foreground hover:bg-secondary/50` to inactive.
- Tenant Admin MUST NOT see the Tenants link (unchanged — already gated by `user.role === UserRole.PlatformOwner`).

## Active State Logic

```tsx
const location = useLocation();
const isActive = (path: string) => location.pathname === path;
```

Applied to each sidebar link:
```tsx
<Link
  to="/admin/dashboard"
  className={cn(
    "flex items-center gap-3 px-3 py-2 rounded-md font-medium text-sm transition-colors",
    isActive("/admin/dashboard")
      ? "bg-secondary text-secondary-foreground"
      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
  )}
>
```

## Styling Guidelines

- All new components MUST use the existing `rounded-xl border border-border bg-background p-3` card pattern.
- KPI icons use lucide-react (already imported: `PhoneCall`, `Users`, `Activity`).
- The chart uses the same `#3366FF` accent color and gradient defined in the mockup.
- Responsive: KPI grid uses `grid grid-cols-1 sm:grid-cols-3 gap-3`.

## Decision Record

| Decision | Rationale |
|----------|-----------|
| Extract components to dashboard, not shared | KPI cards and chart are dashboard-domain, not generic enough for shared |
| Keep data static/mocked for now | Proposal out-of-scope for real-time data; mockup data matches the landing page vision |
| New page per route (no inline) | Keeps App.tsx clean, each page is independently testable |
| Active state by pathname exact match | Avoids false matches from substring matching ("/admin/dashboard" !== "/admin/tenants") |
