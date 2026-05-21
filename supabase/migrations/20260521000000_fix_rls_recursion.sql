-- ============================================================================
-- Migration: Fix Infinite Recursion in RLS Policies
-- Date: 2026-05-21
-- ============================================================================

-- 1. Create a SECURITY DEFINER function to check tenant status without triggering RLS on tenants
CREATE OR REPLACE FUNCTION public.get_tenant_status(t_id uuid)
RETURNS text AS $$
DECLARE
    t_status text;
BEGIN
    SELECT status INTO t_status FROM public.tenants WHERE id = t_id;
    RETURN t_status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create a SECURITY DEFINER function to check if current user is PlatformOwner
CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean AS $$
DECLARE
    is_owner boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role_id = (SELECT id FROM public.roles WHERE name = 'PlatformOwner')
    ) INTO is_owner;
    RETURN is_owner;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update the profiles policy to use the new function
DROP POLICY IF EXISTS "Block suspended tenant users" ON public.profiles;

CREATE POLICY "Block suspended tenant users"
ON public.profiles
FOR ALL
USING (
    public.get_tenant_status(tenant_id) IS DISTINCT FROM 'suspended'
);

-- 4. Update the tenants policy to use the new function
DROP POLICY IF EXISTS "PlatformOwner can do everything" ON public.tenants;

CREATE POLICY "PlatformOwner can do everything"
ON public.tenants FOR ALL
USING ( public.is_platform_owner() );
