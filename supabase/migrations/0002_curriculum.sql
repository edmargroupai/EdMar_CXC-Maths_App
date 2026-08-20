-- P04 · Technical Build Spec §3.3 — curriculum tables (the CXC taxonomy tree
-- and EdMar's skill vocabulary layered on top of it).
--
-- RLS is intentionally NOT enabled on these tables in this migration. Per the
-- phased plan (§32 P07), every policy ships together in 0005_rls.sql once all
-- 45 tables exist, so the whole matrix can be reviewed and catalogue-checked
-- as one unit. Supabase's local `auto_expose_new_tables` default is off
-- (supabase/config.toml), so these tables are not reachable via the Data API
-- before then regardless.

create table subjects (
  code text primary key,
  name text not null,
  is_active boolean not null default true,
  sequence smallint not null default 0
);

create table syllabus_versions (
  code syllabus_code primary key,
  subject_code text not null references subjects (code),
  official_code text,
  effective_from_year smallint not null,
  effective_from_month sitting_month not null,
  has_modules boolean not null default false,
  is_default boolean not null default false,
  source_document text
);

create unique index uq_syllabus_default on syllabus_versions ((true)) where is_default;

create table modules (
  id uuid primary key default gen_random_uuid(),
  syllabus_code syllabus_code not null references syllabus_versions (code),
  module_no smallint not null check (module_no between 1 and 3),
  name text not null,
  paper01_items smallint not null default 20,
  paper02_marks smallint not null default 30,
  weighted_marks smallint not null default 100,
  duration_hours smallint not null default 65,
  unique (syllabus_code, module_no)
);

create table topics (
  id uuid primary key default gen_random_uuid(),
  syllabus_code syllabus_code not null references syllabus_versions (code),
  module_id uuid references modules (id),
  topic_no smallint not null,
  code text not null,
  name text not null,
  sequence smallint not null,
  paper01_items smallint,
  paper02_marks_group text,
  paper02_marks smallint,
  is_active boolean not null default true,
  unique (syllabus_code, code),
  unique (syllabus_code, module_id, topic_no)
);

create index idx_topics_syllabus on topics (syllabus_code, sequence);

comment on column topics.paper02_marks is
  'This topic''s share of its module''s 30 Paper 02 marks; where the syllabus groups topics, the group total is divided evenly and the group label is kept in paper02_marks_group. This is the numeric column §9.11 and §9.12 weight by. NULL where an even split would not be a whole number (see [CXC-DISCREPANCY-02] in docs/PROJECT_INSTRUCTIONS.md) — a human curriculum reviewer must resolve it, not an invented split.';

-- subtopics — EdMar construct, not official CXC. Must be visually marked as
-- EdMar-authored in admin (§3.3). No seed rows: authored on demand by
-- content reviewers as they group specific objectives for presentation.
create table subtopics (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references topics (id) on delete restrict,
  code text not null,
  name text not null,
  sequence smallint not null default 0,
  is_edmar_construct boolean not null default true check (is_edmar_construct),
  is_active boolean not null default true,
  unique (topic_id, code)
);

-- specific_objectives — the anchor of the whole system (§3.3).
create table specific_objectives (
  id uuid primary key default gen_random_uuid(),
  syllabus_code syllabus_code not null references syllabus_versions (code),
  topic_id uuid not null references topics (id) on delete restrict,
  subtopic_id uuid references subtopics (id) on delete set null,
  code text not null,
  objective_no smallint not null,
  statement text not null,
  content_notes text,
  needs_human_review boolean not null default false,
  sequence smallint not null default 0,
  is_active boolean not null default true,
  unique (syllabus_code, code)
);

create index idx_so_topic on specific_objectives (topic_id, sequence);
create index idx_so_review on specific_objectives (needs_human_review) where needs_human_review;

-- skills — EdMar construct, controlled vocabulary (§3.3). Target size
-- 150-250 (blueprint §F.4); a hard cap is enforced in admin, not here.
-- Not seeded in this migration: the real 17-skill vocabulary is legacy data
-- (data/csec_skill_map_phase3.json) migrated with full legacy_id provenance
-- by scripts/import-legacy.ts in P12 (§12), not invented here.
create table skills (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_set_updated_at before update on skills
  for each row execute function trg_set_updated_at();

create index idx_skills_active on skills (is_active) where is_active;

create table skill_prerequisites (
  skill_id uuid not null references skills (id) on delete cascade,
  prerequisite_skill_id uuid not null references skills (id) on delete cascade,
  primary key (skill_id, prerequisite_skill_id),
  check (skill_id <> prerequisite_skill_id)
);

-- Cycle prevention: a skill may never (transitively) be its own prerequisite.
create function trg_skill_prereq_acyclic()
returns trigger
language plpgsql
as $$
begin
  if exists (
    with recursive chain (skill_id, prerequisite_skill_id) as (
      select new.skill_id, new.prerequisite_skill_id
      union all
      select sp.skill_id, sp.prerequisite_skill_id
      from skill_prerequisites sp
      join chain c on sp.skill_id = c.prerequisite_skill_id
    )
    select 1 from chain where prerequisite_skill_id = new.skill_id
  ) then
    raise exception 'skill_prerequisites: cycle detected for skill %', new.skill_id;
  end if;
  return new;
end;
$$;

create trigger trg_skill_prereq_acyclic before insert or update on skill_prerequisites
  for each row execute function trg_skill_prereq_acyclic();

create table skill_objectives (
  skill_id uuid not null references skills (id) on delete cascade,
  specific_objective_id uuid not null references specific_objectives (id) on delete cascade,
  primary key (skill_id, specific_objective_id)
);

create index idx_skill_objectives_objective on skill_objectives (specific_objective_id);

-- objective_mappings — V2018 <-> V2027 bridge. Populated only if U-02
-- resolves toward dual-syllabus support; the table exists from this
-- migration regardless, so adding V2018 later needs no schema change.
create table objective_mappings (
  from_objective_id uuid not null references specific_objectives (id),
  to_objective_id uuid not null references specific_objectives (id),
  relationship text not null check (relationship in ('identical', 'partial', 'moved', 'split', 'merged')),
  note text,
  primary key (from_objective_id, to_objective_id)
);
