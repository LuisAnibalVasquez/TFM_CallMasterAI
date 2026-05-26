-- ============================================================================
-- Migration: RLS Tenant Isolation + Emergency Override
-- Modified by Gentle AI in branch feat/sec-audit-rbac-rls-pt1 on Tue May 26 2026
-- ============================================================================
-- Purpose: Enforce tenant isolation at the database level via RLS policies
-- on campaigns and calls tables. Adds emergency_session column to profiles
-- and creates is_platform_emergency_access() function for Platform Owner
-- emergency override capability.
-- ============================================================================

-- 1. Add emergency_session column to profiles (nullable boolean)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS emergency_session boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.emergency_session IS
  'When true and user is PlatformOwner, RLS policies grant tenant-wide access';

-- 2. Create emergency access check function (SECURITY DEFINER to bypass own RLS)
CREATE OR REPLACE FUNCTION public.is_platform_emergency_access()
RETURNS boolean AS $$
BEGIN
  RETURN public.is_platform_owner()
    AND (SELECT emergency_session FROM public.profiles WHERE id = auth.uid()) = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Replace campaigns RLS policy with JWT-based tenant isolation + emergency override
DROP POLICY IF EXISTS "Tenants can view their own data" ON public.campaigns;
DROP POLICY IF EXISTS "tenant_isolation_campaigns" ON public.campaigns;

CREATE POLICY "tenant_isolation_campaigns"
ON public.campaigns FOR ALL
USING (
  tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  OR public.is_platform_emergency_access()
);

-- 4. Create calls RLS policy with tenant isolation via campaign join + emergency override
DROP POLICY IF EXISTS "tenant_isolation_calls" ON public.calls;

CREATE POLICY "tenant_isolation_calls"
ON public.calls FOR ALL
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  )
  OR public.is_platform_emergency_access()
);
