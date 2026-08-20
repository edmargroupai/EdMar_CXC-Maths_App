-- P05 · Technical Build Spec §3.4-3.17 — the question bank schema.
--
-- Table creation order follows FK dependency, not the spec's document order
-- (common_errors is created before question_options because
-- question_options.common_error_id references it — the spec's own §3.6
-- appears before §3.8 in prose, but that is presentational).
--
-- RLS is intentionally NOT enabled here — see the note at the top of
-- 0002_curriculum.sql; every policy ships together in P07's 0005_rls.sql.

create extension if not exists vector;
create extension if not exists pg_jsonschema;

-- ═══════════════════════════════════════════════════════════════════════════
-- questions — stable identity (§3.4)
-- ═══════════════════════════════════════════════════════════════════════════

create table questions (
  id                  uuid primary key default gen_random_uuid(),
  subject_code        text not null default 'CSEC_MATH' references subjects (code),
  question_type       question_type not null,
  provenance          provenance_type not null,
  rights_status       rights_status not null default 'unknown',
  status              content_status not null default 'draft',
  current_version_id  uuid,
  variant_family_id   uuid,
  source_question_id  uuid references questions (id),
  calculator_allowed  boolean not null default true,
  difficulty_band     smallint not null check (difficulty_band between 1 and 5),
  profile_dimension   profile_dimension,
  is_free             boolean not null default false,
  legacy_id           text,
  retired_at          timestamptz,
  retired_reason      text,
  created_by          uuid, -- FK -> profiles(id) added in 0004_student.sql
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  check (status <> 'published' or current_version_id is not null)
);

create trigger trg_set_updated_at before update on questions
  for each row execute function trg_set_updated_at();

create index idx_q_published on questions (status) where status = 'published';
create index idx_q_difficulty on questions (difficulty_band) where status = 'published';
create index idx_q_variant_family on questions (variant_family_id) where variant_family_id is not null;
create index idx_q_provenance on questions (provenance, rights_status);
create index idx_q_free on questions (is_free) where is_free and status = 'published';
create unique index uq_q_legacy on questions (legacy_id) where legacy_id is not null;

-- ═══════════════════════════════════════════════════════════════════════════
-- question_versions — immutable content (§3.5)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_versions (
  id                  uuid primary key default gen_random_uuid(),
  question_id         uuid not null references questions (id) on delete cascade,
  version_no          integer not null check (version_no >= 1),
  stem_blocks         jsonb not null check (jsonb_typeof(stem_blocks) = 'array'),
  stem_plain          text not null,
  answer_spec         jsonb not null,
  explanation         text,
  explanation_blocks  jsonb,
  marks               smallint check (marks between 1 and 20),
  estimated_seconds   smallint,
  hint                text,
  normalised_hash     text not null,
  embedding           vector (1536),
  validation_report   jsonb,
  change_note         text,
  created_by          uuid, -- FK -> profiles(id) added in 0004_student.sql
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  unique (question_id, version_no)
);

-- Now that question_versions exists, the deferred FK from questions can be added.
alter table questions
  add constraint fk_q_current_version foreign key (current_version_id)
    references question_versions (id) deferrable initially deferred;

create index idx_qv_hash on question_versions (normalised_hash);
create index idx_qv_embedding on question_versions using ivfflat (embedding vector_cosine_ops) with (lists = 100);
create index idx_qv_question on question_versions (question_id, version_no desc);

-- §11.2 edmar-answer-spec.schema.json, embedded so question_versions.answer_spec
-- can be validated at write time. Kept in sync by hand with
-- packages/content-schema/schemas/edmar-answer-spec.schema.json once P10
-- creates that package — the two must never diverge.
create function fn_answer_spec_schema()
returns json
language sql
immutable
as $$
  select '{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "https://schema.edmar.ai/edmar-answer-spec.schema.json",
    "type": "object",
    "additionalProperties": false,
    "required": ["answerType", "canonicalValue", "displayValue", "acceptedForms", "normalisation"],
    "properties": {
      "answerType": {
        "enum": [
          "option_id", "option_set", "boolean", "numeric_exact", "numeric_tolerance",
          "numeric_sf", "numeric_dp", "fraction", "mixed_number", "ratio", "currency",
          "with_units", "expression", "coordinate", "set", "interval", "matrix", "vector", "text"
        ]
      },
      "canonicalValue": { "type": ["string", "array"] },
      "displayValue": { "type": "string", "minLength": 1 },
      "acceptedForms": { "type": "array", "items": { "type": "string" }, "minItems": 1 },
      "tolerance": {
        "type": "object",
        "additionalProperties": false,
        "required": ["kind"],
        "properties": {
          "kind": { "enum": ["absolute", "relative", "range", "none"] },
          "value": { "type": "number", "minimum": 0 },
          "min": { "type": "number" },
          "max": { "type": "number" }
        }
      },
      "precision": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "kind": { "enum": ["significant_figures", "decimal_places", "none"] },
          "value": { "type": "integer", "minimum": 0, "maximum": 10 },
          "required": { "type": "boolean", "default": false }
        }
      },
      "units": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "requirement": { "enum": ["none", "optional", "required", "convertible"] },
          "canonical": { "type": ["string", "null"] },
          "acceptedSet": { "type": "array", "items": { "type": "string" } }
        }
      },
      "form": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "lowestTerms": { "type": "boolean", "default": false },
          "simplifiedSurd": { "type": "boolean", "default": false },
          "simplestRatio": { "type": "boolean", "default": false },
          "specifiedForm": { "type": ["string", "null"] }
        }
      },
      "followThrough": {
        "type": "object",
        "additionalProperties": false,
        "required": ["dependsOn", "rule"],
        "properties": {
          "dependsOn": { "type": "string" },
          "rule": { "type": "string" }
        }
      },
      "normalisation": {
        "enum": [
          "default", "numeric_default", "currency_default", "expression_default",
          "units_default", "text_default"
        ]
      },
      "caseSensitive": { "type": "boolean", "default": false },
      "commonErrorValues": {
        "type": "array",
        "items": {
          "type": "object",
          "required": ["key", "value"],
          "properties": { "key": { "type": "string" }, "value": { "type": "string" } }
        }
      },
      "parts": {
        "type": "object",
        "additionalProperties": { "$ref": "https://schema.edmar.ai/edmar-answer-spec.schema.json" }
      }
    },
    "allOf": [
      {
        "if": {
          "properties": {
            "answerType": { "enum": ["numeric_tolerance", "numeric_sf", "numeric_dp", "currency", "with_units"] }
          }
        },
        "then": { "required": ["tolerance"] }
      },
      {
        "if": { "properties": { "answerType": { "enum": ["numeric_sf", "numeric_dp"] } } },
        "then": { "required": ["precision"] }
      },
      {
        "if": { "properties": { "answerType": { "const": "with_units" } } },
        "then": { "required": ["units"] }
      }
    ]
  }'::json;
$$;

create function trg_validate_answer_spec()
returns trigger
language plpgsql
as $$
begin
  if not jsonb_matches_schema(fn_answer_spec_schema(), new.answer_spec) then
    raise exception 'question_versions.answer_spec (question_id=%, version_no=%) does not conform to edmar-answer-spec.schema.json (§11.2): %',
      new.question_id, new.version_no,
      array_to_string(jsonschema_validation_errors(fn_answer_spec_schema(), new.answer_spec::json), '; ');
  end if;
  return new;
end;
$$;

create trigger trg_validate_answer_spec before insert or update of answer_spec on question_versions
  for each row execute function trg_validate_answer_spec();

-- **Immutability** (I-4, D-06): a published version is never edited, except
-- for the two columns that are legitimately recomputed after the fact
-- (embedding is generated async; validation_report can be re-run).
create function trg_qv_immutable()
returns trigger
language plpgsql
as $$
begin
  if old.published_at is not null
     and to_jsonb(new) - 'embedding' - 'validation_report'
         is distinct from to_jsonb(old) - 'embedding' - 'validation_report'
  then
    raise exception 'question_versions % is published (published_at=%) and immutable — corrections are new versions (I-4), not edits',
      old.id, old.published_at;
  end if;
  return new;
end;
$$;

create trigger trg_qv_immutable before update on question_versions
  for each row execute function trg_qv_immutable();

comment on table question_versions is
  'Why no separate explanations table: an explanation is 1:1 with a version, always fetched with it, no independent lifecycle (§3.5). Why no separate generated_questions table: generation is an attribute (provenance + ai_generations row), not a different kind of object.';

-- ═══════════════════════════════════════════════════════════════════════════
-- common_errors (§3.8) — created before question_options, which references it
-- ═══════════════════════════════════════════════════════════════════════════

create table common_errors (
  id                  uuid primary key default gen_random_uuid(),
  question_version_id uuid not null references question_versions (id) on delete cascade,
  part_key            text,
  wrong_value         text,
  wrong_option_key    char(1),
  misconception       text not null,
  corrective_note     text not null,
  skill_id            uuid references skills (id),
  check (wrong_value is not null or wrong_option_key is not null)
);

create index idx_ce_version on common_errors (question_version_id);
create index idx_ce_value on common_errors (question_version_id, wrong_value);

-- ═══════════════════════════════════════════════════════════════════════════
-- question_options — multiple choice / multi-select (§3.6)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_options (
  id                    uuid primary key default gen_random_uuid(),
  question_version_id   uuid not null references question_versions (id) on delete cascade,
  option_key            char(1) not null check (option_key in ('A', 'B', 'C', 'D', 'E')),
  content_blocks        jsonb not null,
  content_plain         text not null,
  is_correct            boolean not null default false,
  common_error_id       uuid references common_errors (id) on delete set null,
  sequence              smallint not null,
  preserve_order        boolean not null default false,
  unique (question_version_id, option_key)
);

create index idx_qo_version on question_options (question_version_id, sequence);

-- §3.6: for multiple_choice, exactly one is_correct; for multi_select, at
-- least one. A DEFERRABLE constraint trigger, because options for one
-- version are inserted as several separate rows within one transaction —
-- checking after every single row would reject the transaction before the
-- second option ever lands.
create function trg_qo_exactly_one_correct()
returns trigger
language plpgsql
as $$
declare
  v_question_version_id uuid := coalesce(new.question_version_id, old.question_version_id);
  v_question_type question_type;
  v_correct_count integer;
begin
  select q.question_type into v_question_type
  from question_versions qv
  join questions q on q.id = qv.question_id
  where qv.id = v_question_version_id;

  -- question_options is only meaningful for multiple_choice / multi_select
  -- (§3.6's own header); any other question_type is not this trigger's concern.
  if v_question_type not in ('multiple_choice', 'multi_select') then
    return coalesce(new, old);
  end if;

  select count(*) into v_correct_count
  from question_options
  where question_version_id = v_question_version_id
    and is_correct;

  if v_question_type = 'multiple_choice' and v_correct_count <> 1 then
    raise exception 'question_options for question_version % (multiple_choice) must have exactly one is_correct, found %',
      v_question_version_id, v_correct_count;
  end if;

  if v_question_type = 'multi_select' and v_correct_count < 1 then
    raise exception 'question_options for question_version % (multi_select) must have at least one is_correct, found %',
      v_question_version_id, v_correct_count;
  end if;

  return coalesce(new, old);
end;
$$;

create constraint trigger trg_qo_exactly_one_correct
  after insert or update or delete on question_options
  deferrable initially deferred
  for each row execute function trg_qo_exactly_one_correct();

-- ═══════════════════════════════════════════════════════════════════════════
-- solution_steps (§3.7)
-- ═══════════════════════════════════════════════════════════════════════════

create table solution_steps (
  id                    uuid primary key default gen_random_uuid(),
  question_version_id   uuid not null references question_versions (id) on delete cascade,
  part_key              text,
  step_no               smallint not null check (step_no >= 1),
  instruction            text not null,
  content_blocks        jsonb not null,
  content_plain         text not null,
  marks                 smallint,
  note                  text,
  unique (question_version_id, part_key, step_no)
);

create index idx_ss_version on solution_steps (question_version_id, step_no);

-- ═══════════════════════════════════════════════════════════════════════════
-- question_assets (§3.9)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_assets (
  id                    uuid primary key default gen_random_uuid(),
  question_version_id   uuid not null references question_versions (id) on delete cascade,
  role                  asset_role not null default 'question_figure',
  part_key              text,
  storage_bucket        text not null default 'question-assets',
  storage_path          text not null,
  mime_type             text not null check (mime_type in ('image/svg+xml', 'image/png', 'image/webp')),
  width_px              integer,
  height_px             integer,
  alt_text              text not null check (char_length(alt_text) >= 10),
  requires_colour       boolean not null default false,
  sequence              smallint not null default 0,
  unique (storage_bucket, storage_path)
);

create index idx_qa_version on question_assets (question_version_id, sequence);

-- ═══════════════════════════════════════════════════════════════════════════
-- math_renders — content-addressed pre-rendered mathematics (§3.10, D-01, D-03)
-- ═══════════════════════════════════════════════════════════════════════════

create table math_renders (
  hash              text primary key,
  latex             text not null,
  style             text not null default 'display' check (style in ('inline', 'display')),
  svg               text not null,
  width_ex          numeric(8, 3) not null,
  height_ex         numeric(8, 3) not null,
  depth_ex          numeric(8, 3) not null default 0,
  renderer_version  text not null,
  byte_size         integer not null,
  created_at        timestamptz not null default now()
);

create index idx_mr_created on math_renders (created_at);

-- ═══════════════════════════════════════════════════════════════════════════
-- question_objectives / question_skills (§3.11)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_objectives (
  question_id            uuid not null references questions (id) on delete cascade,
  specific_objective_id  uuid not null references specific_objectives (id) on delete restrict,
  is_primary             boolean not null default false,
  confidence             numeric(3, 2),
  confirmed_by           uuid, -- FK -> profiles(id) added in 0004_student.sql
  confirmed_at           timestamptz,
  primary key (question_id, specific_objective_id)
);
create index idx_qo_objective on question_objectives (specific_objective_id);
create unique index uq_qo_primary on question_objectives (question_id) where is_primary;

create table question_skills (
  question_id uuid not null references questions (id) on delete cascade,
  skill_id    uuid not null references skills (id) on delete restrict,
  weight      numeric(3, 2) not null default 1.00 check (weight > 0 and weight <= 1),
  primary key (question_id, skill_id)
);
create index idx_qs_skill on question_skills (skill_id);

comment on table question_objectives is
  'A published question must have >=1 objective and 1-3 skills (question_skills) - enforced by fn_publish_question (§6.7, P09), not a table constraint, because rows are inserted before publication.';

-- ═══════════════════════════════════════════════════════════════════════════
-- question_sources — past-paper provenance (§3.12)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_sources (
  question_id         uuid primary key references questions (id) on delete cascade,
  source_kind         text not null check (source_kind in ('past_paper', 'workbook', 'textbook', 'authored')),
  source_title        text,
  sitting_year        smallint check (sitting_year between 1980 and 2040),
  sitting_month       sitting_month,
  paper               paper_code,
  question_no         smallint,
  part_label          text,
  syllabus_in_force   syllabus_code,
  page_ref            text
);

create index idx_qsrc_paper on question_sources (sitting_year, sitting_month, paper, question_no);
create index idx_qsrc_kind on question_sources (source_kind);

-- ═══════════════════════════════════════════════════════════════════════════
-- question_payloads — the denormalised student read (§3.13, D-14)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_payloads (
  question_version_id  uuid primary key references question_versions (id) on delete cascade,
  question_id          uuid not null references questions (id) on delete cascade,
  payload               jsonb not null,
  payload_bytes         integer not null check (payload_bytes < 262144),
  content_version       bigint not null,
  is_free                boolean not null,
  built_at               timestamptz not null default now()
);

create index idx_qp_question on question_payloads (question_id);
create index idx_qp_free on question_payloads (is_free) where is_free;

comment on table question_payloads is
  'This is the only content table the student app reads (§3.13). Assembled by fn_build_question_payload (§6.8, P09) at publish time.';

-- ═══════════════════════════════════════════════════════════════════════════
-- question_reviews (§3.14)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_reviews (
  id                      uuid primary key default gen_random_uuid(),
  question_id             uuid not null references questions (id) on delete cascade,
  question_version_id     uuid not null references question_versions (id) on delete cascade,
  reviewer_id             uuid not null, -- FK -> profiles(id) added in 0004_student.sql
  decision                review_decision not null,
  note                    text,
  rejection_reason_code   text,
  diff                    jsonb,
  review_seconds          integer,
  created_at              timestamptz not null default now(),
  check (decision = 'approved' or note is not null)
);

create index idx_qr_question on question_reviews (question_id, created_at desc);
create index idx_qr_reviewer on question_reviews (reviewer_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- question_quality_metrics — rolled up, refreshed hourly (§3.15)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_quality_metrics (
  question_id         uuid primary key references questions (id) on delete cascade,
  total_attempts       integer not null default 0,
  distinct_students     integer not null default 0,
  correct_attempts      integer not null default 0,
  accuracy              numeric(5, 4),
  skip_count             integer not null default 0,
  mean_seconds           numeric(8, 2),
  median_seconds         numeric(8, 2),
  top_wrong_value        text,
  top_wrong_share        numeric(5, 4),
  report_count           integer not null default 0,
  flagged_reason          text,
  last_computed_at        timestamptz not null default now()
);

create index idx_qqm_flagged on question_quality_metrics (flagged_reason) where flagged_reason is not null;
create index idx_qqm_accuracy on question_quality_metrics (accuracy);

comment on column question_quality_metrics.top_wrong_share is
  'The most diagnostic single content metric (§3.15).';

-- ═══════════════════════════════════════════════════════════════════════════
-- question_reports — student-reported problems (§3.16)
-- ═══════════════════════════════════════════════════════════════════════════

create table question_reports (
  id                     uuid primary key default gen_random_uuid(),
  question_id            uuid not null references questions (id),
  question_version_id    uuid not null references question_versions (id),
  reporter_id            uuid, -- FK -> profiles(id) ON DELETE SET NULL, added in 0004_student.sql
  reason_code            text not null check (
    reason_code in ('wrong_answer', 'wrong_solution', 'unclear', 'typo', 'diagram_missing', 'off_syllabus', 'other')
  ),
  detail                 text check (char_length(detail) <= 500),
  student_answer         text,
  resolution             text check (resolution in ('fixed', 'no_change', 'duplicate', 'invalid')),
  resolved_by            uuid, -- FK -> profiles(id) added in 0004_student.sql
  resolved_at            timestamptz,
  created_at             timestamptz not null default now()
);

create index idx_qrep_open on question_reports (question_id) where resolved_at is null;
create index idx_qrep_reporter on question_reports (reporter_id, created_at desc);

-- ═══════════════════════════════════════════════════════════════════════════
-- papers / paper_questions (§3.17)
-- ═══════════════════════════════════════════════════════════════════════════

create table papers (
  id                 uuid primary key default gen_random_uuid(),
  syllabus_code      syllabus_code not null references syllabus_versions (code),
  title              text not null,
  paper              paper_code not null,
  sitting_year       smallint,
  sitting_month      sitting_month,
  is_original        boolean not null default false,
  module_scope       smallint[] not null default '{1,2,3}',
  total_marks        smallint not null,
  duration_minutes   smallint not null,
  rights_status      rights_status not null default 'unknown',
  status             content_status not null default 'draft',
  published_at       timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger trg_set_updated_at before update on papers
  for each row execute function trg_set_updated_at();

create unique index uq_papers_sitting on papers (syllabus_code, paper, sitting_year, sitting_month)
  where sitting_year is not null;
create index idx_papers_published on papers (status, sitting_year desc) where status = 'published';

create table paper_questions (
  paper_id     uuid not null references papers (id) on delete cascade,
  question_id  uuid not null references questions (id) on delete restrict,
  position     smallint not null,
  display_no   text not null,
  marks        smallint not null,
  module_no    smallint,
  primary key (paper_id, question_id),
  unique (paper_id, position)
);
create index idx_pq_question on paper_questions (question_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- trg_question_status_transition — the content state machine (§15.2)
-- ═══════════════════════════════════════════════════════════════════════════

-- Valid questions.status transitions, transcribed exactly from the §15.2
-- diagram. 'escalated' is a question_reviews.decision value, not a
-- content_status — escalating leaves status at 'pending_review' (routed to a
-- second reviewer), which is why it needs no entry here.
create function trg_question_status_transition()
returns trigger
language plpgsql
as $$
begin
  if new.status = old.status then
    return new;
  end if;

  if (old.status, new.status) in (
    ('draft', 'pending_validation'),
    ('pending_validation', 'validating'),
    ('validating', 'rejected'),
    ('validating', 'pending_review'),
    ('pending_review', 'rejected'),
    ('pending_review', 'changes_requested'),
    ('pending_review', 'approved'),
    ('changes_requested', 'pending_validation'),
    ('approved', 'published'),
    ('published', 'suspended'),
    ('suspended', 'published'),
    ('published', 'retired'),
    ('rejected', 'archived')
  ) then
    return new;
  end if;

  raise exception 'questions.status: % -> % is not a valid transition (§15.2)', old.status, new.status;
end;
$$;

create trigger trg_question_status_transition before update of status on questions
  for each row execute function trg_question_status_transition();
