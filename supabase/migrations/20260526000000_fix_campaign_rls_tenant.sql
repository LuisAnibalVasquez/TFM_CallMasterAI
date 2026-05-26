-- Fix RLS tenant isolation to use auth.uid() instead of missing JWT claim
CREATE OR REPLACE FUNCTION public.get_auth_tenant_id()
RETURNS uuid AS $$
DECLARE
    t_id uuid;
BEGIN
    SELECT tenant_id INTO t_id FROM public.profiles WHERE id = auth.uid();
    RETURN t_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP POLICY IF EXISTS "tenant_isolation_campaigns" ON public.campaigns;
CREATE POLICY "tenant_isolation_campaigns"
ON public.campaigns FOR ALL
USING (
  tenant_id = public.get_auth_tenant_id()
  OR public.is_platform_emergency_access()
);

DROP POLICY IF EXISTS "tenant_isolation_calls" ON public.calls;
CREATE POLICY "tenant_isolation_calls"
ON public.calls FOR ALL
USING (
  campaign_id IN (
    SELECT id FROM public.campaigns
    WHERE tenant_id = public.get_auth_tenant_id()
  )
  OR public.is_platform_emergency_access()
);
