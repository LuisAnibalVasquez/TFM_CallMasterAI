-- Fix pgcrypto function signatures for Supabase Cloud compatibility.
-- Supabase Cloud requires full schema qualifier (extensions.encrypt) and
-- the complete algorithm string (aes-cbc/pad:pkcs) to avoid 500 errors.
--
-- Replaces the bare encrypt/decrypt calls from 20260502_initial_schema.sql
-- lines 67-79 with Cloud-compatible equivalents.

create or replace function public.encrypt_secret(secret text, master_key text)
returns text as $$
begin
    return encode(extensions.encrypt(secret::bytea, master_key::bytea, 'aes-cbc/pad:pkcs'), 'hex');
end;
$$ language plpgsql security definer;

create or replace function public.decrypt_secret(encrypted_text text, master_key text)
returns text as $$
begin
    return convert_from(extensions.decrypt(decode(encrypted_text, 'hex'), master_key::bytea, 'aes-cbc/pad:pkcs'), 'utf8');
end;
$$ language plpgsql security definer;
