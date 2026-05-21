# Spec: Dashboard Restructuring

## 1. KPI Card Component

**`features/dashboard/components/KpiCard.tsx`**

A reusable stateless component extracted from `DashboardMockup` that renders a KPI metric. MUST accept `icon`, `label`, `value`, `delta`, and optional `highlight` props.

### Scenarios

- **GIVEN** required props (icon, label, value, delta) **WHEN** rendered **THEN** it SHALL display the icon, label, value, and delta in a single card with the glass-panel aesthetic.
- **GIVEN** `highlight = true` **WHEN** rendered **THEN** the delta text SHALL use the accent/primary color.
- **GIVEN** `highlight = false` or omitted **WHEN** rendered **THEN** the delta text SHALL use the muted foreground color.

## 2. Calls Chart Component

**`features/dashboard/components/CallsChart.tsx`**

A chart component extracted from `DashboardMockup` that displays a trend line (calls/hour) using an SVG area chart with gradient fill.

### Scenarios

- **GIVEN** no props **WHEN** rendered **THEN** it SHALL render the SVG area chart matching the mockup's calls/hour visualization (area gradient + line path).
- **GIVEN** rendering **WHEN** the component mounts **THEN** the chart SHALL display "Calls / hour" label and "last 24 h" subtitle.

## 3. Analytic Overview Component

**`features/dashboard/components/AnalyticOverview.tsx`**

Composes `KpiCard` (3 instances: Calls, Conversion, Agents) and `CallsChart` into a grid layout suitable for both Platform Owner and Tenant Admin dashboards. Contains no management UI.

### Scenarios

- **GIVEN** the user is a Platform Owner **WHEN** viewing `/admin/dashboard` **THEN** they SHALL see the analytic overview with 3 KPI cards and the chart.
- **GIVEN** the user is a Tenant Admin **WHEN** viewing `/dashboard` **THEN** they SHALL see the same analytic overview layout.

## 4. Tenants Management Page

**`features/tenants/pages/TenantsPage.tsx`**

A page wrapper that renders the existing `TenantList` component at `/admin/tenants`. MUST NOT duplicate or modify `TenantList`.

### Scenarios

- **GIVEN** a Platform Owner **WHEN** visiting `/admin/tenants` **THEN** they SHALL see the full tenant management UI (list, create, edit, delete, suspend/activate).
- **GIVEN** a Tenant Admin **WHEN** visiting `/admin/tenants` **THEN** they SHALL be redirected or see an access denied state (outside scope — routing guards are existing).

## 5. Routing

Routes MUST be updated as follows:

| Path | Component | Role |
|------|-----------|------|
| `/admin/dashboard` | `PlatformOwnerDashboard` (reworked to use `AnalyticOverview`) | Platform Owner |
| `/admin/tenants` | `TenantsPage` | Platform Owner |
| `/dashboard` | `TenantAdminDashboard` (new, uses `AnalyticOverview`) | Tenant Admin |

### Scenarios

- **GIVEN** a Platform Owner **WHEN** navigating to `/admin/dashboard` **THEN** the URL SHALL NOT change **BUT** the content SHALL show analytics instead of the tenant list.
- **GIVEN** a Platform Owner **WHEN** navigating to `/admin/tenants` **THEN** the previous tenant management UI SHALL render.

## 6. Sidebar Navigation

**`features/dashboard/layouts/DashboardLayout.tsx`**

The "Dashboard" sidebar link MUST point to the role-appropriate analytics route. The "Tenants" link MUST point to `/admin/tenants`. Active state MUST reflect the current path.

### Scenarios

- **GIVEN** a Platform Owner **WHEN** on `/admin/dashboard` **THEN** the "Dashboard" link SHALL have the active (selected) style.
- **GIVEN** a Platform Owner **WHEN** on `/admin/tenants` **THEN** the "Tenants" link SHALL have the active (selected) style.
- **GIVEN** a Tenant Admin **WHEN** on `/dashboard` **THEN** the "Dashboard" link SHALL have the active style **AND** the "Tenants" link SHALL NOT appear.
