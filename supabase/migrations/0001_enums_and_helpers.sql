-- P03 · Technical Build Spec §3.0 — enumerated types + the shared updated_at helper.
--
-- Forward-only (§30.4): a mistake here is fixed by a new migration, never an
-- edit to this file. Every enum's value list is authoritative — see §3.0 for
-- provenance and pgTAP tests in supabase/tests/schema/0001_enums.sql for the
-- assertion that each one exists with its exact values.

-- gen_random_uuid() — every table's default PK generator from 0002 onward.
create extension if not exists pgcrypto;

create type app_role as enum (
  'student', 'viewer', 'reviewer', 'curriculum_admin', 'content_admin', 'support', 'super_admin'
);

create type syllabus_code as enum ('V2018', 'V2027');

create type question_type as enum (
  'multiple_choice', 'multi_select', 'true_false', 'numeric', 'expression', 'structured'
);

create type answer_type as enum (
  'option_id', 'option_set', 'boolean', 'numeric_exact', 'numeric_tolerance',
  'numeric_sf', 'numeric_dp', 'fraction', 'mixed_number', 'ratio', 'currency',
  'with_units', 'expression', 'coordinate', 'set', 'interval', 'matrix', 'vector', 'text'
);

create type provenance_type as enum (
  'past_paper', 'past_paper_adapted', 'original_authored', 'ai_variant', 'ai_authored', 'legacy_import'
);

create type rights_status as enum (
  'edmar_owned', 'licensed', 'public_domain', 'third_party_unlicensed', 'unknown'
);

create type content_status as enum (
  'draft', 'pending_validation', 'validating', 'pending_review', 'changes_requested',
  'approved', 'published', 'suspended', 'retired', 'rejected', 'archived'
);

create type review_decision as enum (
  'approved', 'changes_requested', 'rejected', 'suspended', 'escalated'
);

create type profile_dimension as enum ('CK', 'AK', 'R');

create type paper_code as enum ('01', '02', '031', '032');

create type sitting_month as enum ('january', 'may_june');

create type practice_mode as enum (
  'topic', 'recommended', 'weak_areas', 'diagnostic', 'bookmarks', 'incorrect'
);

create type session_status as enum ('in_progress', 'completed', 'abandoned', 'expired');

create type exam_mode as enum ('practice', 'timed');

create type entitlement_tier as enum ('free', 'premium');

create type entitlement_source as enum ('default', 'google_play', 'apple', 'promo', 'school', 'manual');

create type entitlement_status as enum ('active', 'grace', 'on_hold', 'expired', 'cancelled', 'refunded');

create type job_status as enum ('queued', 'running', 'succeeded', 'failed', 'cancelled');

create type asset_role as enum ('question_figure', 'solution_figure', 'option_figure');

-- §3 conventions: "tables whose rows are edited after creation carry
-- created_at and updated_at, maintained by the shared trigger
-- trg_set_updated_at". One function, re-used as the trigger name on every
-- table that has an updated_at column — attached in the migration that
-- defines that column, never here.
create function trg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function trg_set_updated_at() is
  'Shared BEFORE UPDATE trigger function: sets updated_at = now() on every row update. Attached per-table as a trigger also named trg_set_updated_at.';
