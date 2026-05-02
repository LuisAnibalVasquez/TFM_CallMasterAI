-- 1. Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Crear tabla de roles
create table public.roles (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Insertar roles base
insert into public.roles (name) values ('PlatformOwner'), ('TenantAdmin');

-- 3. Crear tabla de tenants
create table public.tenants (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    phone text,
    contact_email text not null unique,
    logo_url text,
    status text not null default 'active',
    sandbox_config jsonb default '{}'::jsonb,
    production_config jsonb default '{}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint tenants_status_check check (status in ('active', 'suspended'))
);

-- 4. Crear tabla de perfiles (extiende auth.users)
create table public.profiles (
    id uuid primary key references auth.users on delete cascade,
    email text not null unique,
    role_id uuid not null references public.roles(id),
    tenant_id uuid references public.tenants(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Crear tablas de campañas y llamadas
create table public.campaigns (
    id uuid primary key default uuid_generate_v4(),
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    name text not null,
    status text not null default 'Created',
    environment text not null default 'Sandbox',
    csv_url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint campaigns_status_check check (status in ('Created', 'In-Progress', 'Completed', 'Cancelled')),
    constraint campaigns_env_check check (environment in ('Sandbox', 'Production'))
);

create table public.calls (
    id uuid primary key default uuid_generate_v4(),
    campaign_id uuid not null references public.campaigns(id) on delete cascade,
    customer_name text not null,
    phone_encrypted text not null, -- Teléfono cifrado
    phone_hash text not null,      -- Hash para búsquedas rápidas
    language text not null,
    age integer,
    duration integer,
    status text,
    cost numeric(10,2) default 0.00,
    voiceflow_transcript_id text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Funciones de Cifrado (Security)
-- Nota: La master_key se debería configurar vía: 
-- alter database postgres set "app.settings.master_key" = 'CasioperaH.5780';

create or replace function public.encrypt_secret(secret text)
returns text as $$
declare
    master_key text;
begin
    master_key := current_setting('app.settings.master_key');
    return encode(encrypt(secret::bytea, master_key::bytea, 'aes'), 'hex');
end;
$$ language plpgsql security definer;

create or replace function public.decrypt_secret(encrypted_text text)
returns text as $$
declare
    master_key text;
begin
    master_key := current_setting('app.settings.master_key');
    return convert_from(decrypt(decode(encrypted_text, 'hex'), master_key::bytea, 'aes'), 'utf8');
end;
$$ language plpgsql security definer;

-- 7. Configuración de RLS (Row Level Security)
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.campaigns enable row level security;
alter table public.calls enable row level security;

-- Política para que el PlatformOwner vea todo
create policy "PlatformOwner can do everything"
on public.tenants for all
using (
    exists (
        select 1 from public.profiles
        where profiles.id = auth.uid()
        and profiles.role_id = (select id from public.roles where name = 'PlatformOwner')
    )
);

-- Política para que el Tenant vea solo lo suyo
create policy "Tenants can view their own data"
on public.campaigns for all
using (
    tenant_id = (
        select tenant_id from public.profiles
        where id = auth.uid()
    )
);

-- 8. Trigger para crear perfil automáticamente
create or replace function public.handle_new_user()
returns trigger as $$
declare
    default_role_id uuid;
begin
    -- Por defecto asignamos TenantAdmin (a menos que sea el PO)
    select id into default_role_id from public.roles where name = 'TenantAdmin';
    
    insert into public.profiles (id, email, role_id)
    values (new.id, new.email, default_role_id);
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
