-- ============================================================================
-- Migration: Tenant Management — Deletion Constraint + Suspended RLS Policy
-- Date: 2026-05-05
-- ============================================================================

-- 1. ALTER campaigns.tenant_id FK from ON DELETE CASCADE to ON DELETE RESTRICT
--    Ensures tenants with campaign history CANNOT be deleted at DB level.
--    Application layer provides user-friendly error; DB ensures integrity.

alter table public.campaigns
    drop constraint if exists campaigns_tenant_id_fkey;

alter table public.campaigns
    add constraint campaigns_tenant_id_fkey
    foreign key (tenant_id)
    references public.tenants(id)
    on delete restrict;

-- 2. RLS policy: Block access for users belonging to suspended tenants.
--    This is defense-in-depth — even if application-layer gate is bypassed,
--    direct Supabase calls from suspended tenant users are rejected.

drop policy if exists "Block suspended tenant users" on public.profiles;

create policy "Block suspended tenant users"
on public.profiles
for all
using (
    (
        -- User belongs to a suspended tenant → EXISTS returns true → NOT true → blocked
        select exists (
            select 1 from public.tenants
            where tenants.id = profiles.tenant_id
              and tenants.status = 'suspended'
        )
    ) = false
);
