-- ============================================================================
-- Migration: Add Select Policy to Roles Table
-- Date: 2026-05-21
-- ============================================================================

-- The roles table is a static lookup table (PlatformOwner, TenantAdmin)
-- It needs to be readable by all users (authenticated or anon) so that
-- joined queries like select('*, role:roles(name)') return the role name.
-- If RLS is enabled without a policy, the join returns null for the role.

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all users on roles" ON public.roles;

CREATE POLICY "Allow read access to all users on roles"
ON public.roles FOR SELECT
USING (true);