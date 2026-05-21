-- ============================================================================
-- Migration: Add contact_person column to tenants table
-- Date: 2026-05-05
-- ============================================================================
-- The contactPerson field was already added to the DTO, Entity, and shared
-- types in a previous slice, but the database column was missing.
-- This migration fills that gap.

alter table public.tenants
    add column if not exists contact_person text;
