-- P06 · Technical Build Spec §3.1-3.2 + §3.18-3.23 — identity, student
-- progress, commerce and operations tables, plus fn_handle_new_user (§6.1).
--
-- Table creation order again follows FK dependency rather than document
-- order: exam_sessions is created before attempts (attempts.exam_session_id
-- references it), even though the spec discusses attempts first (§3.19
-- before §3.20) — same presentational-vs-dependency distinction noted in
-- 0003_content.sql.
--
-- RLS is intentionally NOT enabled here — see the note at the top of
-- 0002_curriculum.sql; every policy ships together in P07's 0005_rls.sql.

create extension if not exists citext;

-- ═══════════════════════════════════════════════════════════════════════════
-- profiles — one row per authenticated user (§3.1)
-- ═══════════════════════════════════════════════════════════════════════════

create table profiles (
  id                       uuid primary key references auth.users (id) on delete cascade,
  display_name             text check (char_length(display_name) between 1 and 40),
  email                    citext not null unique,
  role                     app_role not null default 'student',
  territory                text default 'JM' check (territory ~ '^[A-Z]{2}$'),
  syllabus_version         syllabus_code not null default 'V2027',
  exam_sitting_year        smallint check (exam_sitting_year between 2026 and 2035),
  exam_sitting_month       sitting_month,
  age_confirmed_13_plus    boolean not null default false,
  onboarding_completed_at  timestamptz,
  locale                   text not null default 'en-JM',
  theme_preference         text not null default 'system' check (theme_preference in ('system', 'light', 'dark')),
  notifications_opt_in     boolean not null default false,
  deleted_at               timestamptz,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

create trigger trg_set_updated_at before update on profiles
  for each row execute function trg_set_updated_at();

create index idx_profiles_role on profiles (role) where role <> 'student';
create index idx_profiles_deleted on profiles (deleted_at) where deleted_at is not null;

comment on table profiles is
  'No predicted_csec_grade column, by decision (§0.4 conflict 1). No date of birth, school, address or phone number stored (blueprint B-11).';

-- ═══════════════════════════════════════════════════════════════════════════
-- admin_role_grants — auditable role assignment (§3.2)
-- ═══════════════════════════════════════════════════════════════════════════

create table admin_role_grants (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references profiles (id) on delete cascade,
  role         app_role not null,
  granted_by   uuid not null references profiles (id),
  granted_at   timestamptz not null default now(),
  revoked_by   uuid references profiles (id),
  revoked_at   timestamptz,
  reason       text not null check (char_length(reason) >= 5)
);

create unique index uq_arg_active_role on admin_role_grants (profile_id, role) where revoked_at is null;
create index idx_arg_profile on admin_role_grants (profile_id);

-- Now that profiles exists, add the FK constraints P05 deferred (0003_content.sql
-- added these columns as plain uuid because profiles didn't exist yet).
alter table questions add constraint fk_q_created_by foreign key (created_by) references profiles (id);
alter table question_versions add constraint fk_qv_created_by foreign key (created_by) references profiles (id);
alter table question_objectives add constraint fk_qob_confirmed_by foreign key (confirmed_by) references profiles (id);
alter table question_reviews add constraint fk_qr_reviewer foreign key (reviewer_id) references profiles (id);
alter table question_reports add constraint fk_qrep_reporter foreign key (reporter_id) references profiles (id) on delete set null;
alter table question_reports add constraint fk_qrep_resolved_by foreign key (resolved_by) references profiles (id);

-- ═══════════════════════════════════════════════════════════════════════════
-- practice_sessions / practice_session_items (§3.18)
-- ═══════════════════════════════════════════════════════════════════════════

create table practice_sessions (
  id                 uuid primary key default gen_random_uuid(),
  student_id         uuid not null references profiles (id) on delete cascade,
  mode               practice_mode not null,
  scope_kind         text not null check (scope_kind in ('topic', 'subtopic', 'objective', 'skill', 'module', 'mixed')),
  scope_ids          uuid[] not null default '{}',
  syllabus_code      syllabus_code not null,
  difficulty_mode    text not null default 'mixed'
                       check (difficulty_mode in ('mixed', 'building', 'challenge')),
  requested_count    smallint not null check (requested_count between 1 and 20),
  delivered_count    smallint not null default 0,
  seed               bigint not null,
  status             session_status not null default 'in_progress',
  correct_count      smallint not null default 0,
  answered_count     smallint not null default 0,
  started_at         timestamptz not null default now(),
  completed_at       timestamptz,
  client_started_at  timestamptz,
  duration_seconds   integer
);
create index idx_ps_student on practice_sessions (student_id, started_at desc);
create index idx_ps_open on practice_sessions (student_id) where status = 'in_progress';

create table practice_session_items (
  session_id           uuid not null references practice_sessions (id) on delete cascade,
  position             smallint not null,
  question_id          uuid not null references questions (id) on delete restrict,
  question_version_id  uuid not null references question_versions (id) on delete restrict,
  option_order         char(1)[],
  answered             boolean not null default false,
  primary key (session_id, position),
  unique (session_id, question_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- exam_sessions / exam_responses (§3.20) — created ahead of attempts, which
-- references exam_sessions
-- ═══════════════════════════════════════════════════════════════════════════

create table exam_sessions (
  id                uuid primary key default gen_random_uuid(),
  student_id        uuid not null references profiles (id) on delete cascade,
  paper_id          uuid not null references papers (id) on delete restrict,
  mode              exam_mode not null default 'practice',
  duration_minutes  smallint not null,
  server_started_at timestamptz not null default now(),
  expires_at        timestamptz not null,
  submitted_at      timestamptz,
  status            session_status not null default 'in_progress',
  answer_marks      smallint,
  max_answer_marks  smallint,
  total_paper_marks smallint,
  created_at        timestamptz not null default now()
);
create index idx_es_student on exam_sessions (student_id, server_started_at desc);
create index idx_es_open on exam_sessions (student_id) where status = 'in_progress';

comment on table exam_sessions is
  'No predicted_grade and no integrity_alerts/lockdown_log — both present in the prototype, both removed by decision (§0.4, blueprint R-09; lockdown monitoring of minors is disproportionate and unenforceable in React Native).';

create table exam_responses (
  exam_session_id uuid not null references exam_sessions (id) on delete cascade,
  question_id     uuid not null references questions (id) on delete restrict,
  part_key        text not null default '',
  raw_answer      text,
  is_correct      boolean,
  marks_awarded   smallint not null default 0,
  max_marks       smallint not null,
  flagged         boolean not null default false,
  answered_at     timestamptz,
  primary key (exam_session_id, question_id, part_key)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- attempts — append-only, immutable (§3.19, D-13)
-- ═══════════════════════════════════════════════════════════════════════════

create table attempts (
  id                        bigint generated always as identity primary key,
  client_attempt_id         uuid not null,
  student_id                uuid not null references profiles (id) on delete cascade,
  question_id                uuid not null references questions (id) on delete restrict,
  question_version_id        uuid not null references question_versions (id) on delete restrict,
  session_id                 uuid references practice_sessions (id) on delete set null,
  exam_session_id             uuid references exam_sessions (id) on delete set null,
  context                    practice_mode,
  part_key                   text,
  raw_answer                 text,
  normalised_answer           text,
  is_correct                 boolean not null,
  client_is_correct           boolean,
  matched_common_error_id     uuid references common_errors (id) on delete set null,
  was_skipped                boolean not null default false,
  solution_viewed             boolean not null default false,
  difficulty_band             smallint not null,
  duration_ms                 integer check (duration_ms between 0 and 3600000),
  client_created_at           timestamptz,
  created_at                  timestamptz not null default now()
);

create unique index uq_at_client on attempts (client_attempt_id);
create index idx_at_student_time on attempts (student_id, created_at desc);
create index idx_at_student_q on attempts (student_id, question_id, created_at desc);
create index idx_at_question on attempts (question_id) include (is_correct, duration_ms);
create index idx_at_session on attempts (session_id) where session_id is not null;
create index idx_at_wrong on attempts (question_id, normalised_answer) where not is_correct;

comment on table attempts is
  'Immutability: no UPDATE or DELETE policy exists for any role except a purge job under service role (§25.12) — enforced in 0005_rls.sql (P07), not here.';

create table attempt_skills (
  attempt_id bigint not null references attempts (id) on delete cascade,
  skill_id   uuid not null references skills (id) on delete restrict,
  weight     numeric(3, 2) not null default 1.00,
  primary key (attempt_id, skill_id)
);
create index idx_as_skill on attempt_skills (skill_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Progress tables (§3.21)
-- ═══════════════════════════════════════════════════════════════════════════

create table student_skill_mastery (
  student_id          uuid not null references profiles (id) on delete cascade,
  skill_id            uuid not null references skills (id) on delete cascade,
  score               numeric(5, 2),
  raw_score           numeric(5, 2) not null default 0,
  confidence          numeric(4, 3) not null default 0,
  coverage_cap        numeric(5, 2) not null default 100,
  attempts_count      integer not null default 0,
  distinct_questions  integer not null default 0,
  correct_count       integer not null default 0,
  bands_seen          smallint[] not null default '{}',
  last_attempt_at     timestamptz,
  last_correct_at     timestamptz,
  decayed_at          timestamptz,
  updated_at          timestamptz not null default now(),
  primary key (student_id, skill_id)
);
create trigger trg_set_updated_at before update on student_skill_mastery
  for each row execute function trg_set_updated_at();
create index idx_ssm_student_score on student_skill_mastery (student_id, score);
create index idx_ssm_stale on student_skill_mastery (last_attempt_at) where score is not null;

create table student_topic_mastery (
  student_id      uuid not null references profiles (id) on delete cascade,
  topic_id        uuid not null references topics (id) on delete cascade,
  score           numeric(5, 2),
  confidence      numeric(4, 3) not null default 0,
  attempts_count  integer not null default 0,
  skills_started  smallint not null default 0,
  skills_total    smallint not null default 0,
  updated_at      timestamptz not null default now(),
  primary key (student_id, topic_id)
);
create trigger trg_set_updated_at before update on student_topic_mastery
  for each row execute function trg_set_updated_at();

create table student_daily_usage (
  student_id           uuid not null references profiles (id) on delete cascade,
  usage_date           date not null,
  questions_served     smallint not null default 0,
  questions_answered   smallint not null default 0,
  sessions_started     smallint not null default 0,
  primary key (student_id, usage_date)
);
create index idx_sdu_date on student_daily_usage (usage_date);

create table student_bookmarks (
  student_id  uuid not null references profiles (id) on delete cascade,
  question_id uuid not null references questions (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (student_id, question_id)
);

-- ═══════════════════════════════════════════════════════════════════════════
-- Commerce tables (§3.22)
-- ═══════════════════════════════════════════════════════════════════════════

create table entitlements (
  id                        uuid primary key default gen_random_uuid(),
  student_id                uuid not null references profiles (id) on delete cascade,
  tier                      entitlement_tier not null default 'free',
  source                    entitlement_source not null default 'default',
  status                    entitlement_status not null default 'active',
  current_period_start      timestamptz,
  current_period_end        timestamptz,
  grace_until               timestamptz,
  auto_renewing             boolean not null default false,
  platform_product_id       text,
  platform_purchase_token   text,
  platform_order_id         text,
  granted_by                uuid references profiles (id),
  grant_reason              text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);
create trigger trg_set_updated_at before update on entitlements
  for each row execute function trg_set_updated_at();
create unique index uq_ent_active on entitlements (student_id) where status in ('active', 'grace', 'on_hold');
create unique index uq_ent_token on entitlements (platform_purchase_token) where platform_purchase_token is not null;
create index idx_ent_expiring on entitlements (current_period_end) where status = 'active';

create table subscription_events (
  id                  bigint generated always as identity primary key,
  entitlement_id      uuid references entitlements (id) on delete set null,
  student_id          uuid references profiles (id) on delete set null,
  provider            text not null default 'google_play',
  event_type          text not null,
  purchase_token      text,
  raw_payload         jsonb not null,
  signature_verified  boolean not null default false,
  processed_at        timestamptz,
  error               text,
  created_at          timestamptz not null default now()
);
create index idx_se_token on subscription_events (purchase_token);
create index idx_se_unprocessed on subscription_events (created_at) where processed_at is null;

-- ═══════════════════════════════════════════════════════════════════════════
-- Operations tables (§3.23)
-- ═══════════════════════════════════════════════════════════════════════════

create table audit_log (
  id           bigint generated always as identity primary key,
  actor_id     uuid references profiles (id) on delete set null,
  actor_role   app_role,
  action       text not null,
  entity_type  text not null,
  entity_id    text not null,
  before       jsonb,
  after        jsonb,
  reason       text,
  ip_hash      text,
  created_at   timestamptz not null default now()
);
create index idx_al_entity on audit_log (entity_type, entity_id, created_at desc);
create index idx_al_actor on audit_log (actor_id, created_at desc);

comment on table audit_log is 'Append-only; no UPDATE/DELETE policy exists (enforced in 0005_rls.sql).';

create table analytics_events (
  id           bigint generated always as identity primary key,
  student_id   uuid references profiles (id) on delete cascade,
  session_id   uuid,
  event_name   text not null,
  event_props  jsonb not null default '{}',
  app_version  text,
  platform     text check (platform in ('android', 'ios', 'web')),
  occurred_at  timestamptz not null,
  created_at   timestamptz not null default now()
);
create index idx_ae_name_time on analytics_events (event_name, occurred_at desc);
create index idx_ae_student on analytics_events (student_id, occurred_at desc);

create table content_jobs (
  id                   uuid primary key default gen_random_uuid(),
  job_type             text not null,
  status               job_status not null default 'queued',
  params               jsonb not null default '{}',
  source_path          text,
  requested_by         uuid references profiles (id),
  estimated_cost_usd   numeric(10, 4),
  actual_cost_usd      numeric(10, 4),
  items_total          integer not null default 0,
  items_done           integer not null default 0,
  items_failed         integer not null default 0,
  result               jsonb,
  error                text,
  started_at           timestamptz,
  finished_at          timestamptz,
  created_at           timestamptz not null default now()
);
create index idx_cj_status on content_jobs (status, created_at);

create table ai_generations (
  id                    uuid primary key default gen_random_uuid(),
  job_id                uuid references content_jobs (id) on delete set null,
  question_id           uuid references questions (id) on delete cascade,
  question_version_id   uuid references question_versions (id) on delete cascade,
  stage                 text not null,
  provider              text not null,
  model                 text not null,
  prompt_name           text not null,
  prompt_version        text not null,
  input_tokens          integer,
  output_tokens         integer,
  cost_usd              numeric(10, 6),
  confidence            numeric(3, 2),
  raw_output            jsonb,
  accepted              boolean,
  created_at            timestamptz not null default now()
);
create index idx_ag_question on ai_generations (question_id);
create index idx_ag_prompt on ai_generations (prompt_name, prompt_version, created_at desc);
create index idx_ag_cost on ai_generations (created_at) include (cost_usd);

create table app_config (
  key          text primary key,
  value        jsonb not null,
  description  text,
  updated_by   uuid references profiles (id),
  updated_at   timestamptz not null default now()
);
create trigger trg_set_updated_at before update on app_config
  for each row execute function trg_set_updated_at();

-- Seeded here (not supabase/seed/) because these are operationally required
-- config, not sample/dev data — they must exist in every environment a
-- migration runs in, including production, where supabase/seed/ is not
-- applied automatically.
insert into app_config (key, value, description) values
  ('free_daily_question_limit', '10', 'Free-tier questions per day (§9)'),
  ('cooldown_days_default', '30', 'Days before a correctly-answered question may repeat (§9.4)'),
  ('cooldown_days_incorrect', '7', 'Days before an incorrectly-answered question may repeat (§9.4)'),
  ('mastery_evidence_floor', '5', 'Minimum attempts before a mastery score is shown (§9.11)'),
  ('mastery_full_weight_at', '15', 'Attempts at which mastery confidence reaches 1.0 (§9.11)'),
  ('session_max_questions', '20', 'Upper bound on practice_sessions.requested_count'),
  ('content_version', '1', 'Global counter incremented on every publish (D-14); cache-invalidation signal'),
  ('ai_monthly_cap_usd', '400', 'Circuit breaker for apps/pipeline spend (§29.2)'),
  ('duplicate_cosine_threshold', '0.92', 'Layer-3 duplicate detection threshold (§9.8)');

-- ═══════════════════════════════════════════════════════════════════════════
-- fn_handle_new_user — trigger on auth.users (§6.1)
-- ═══════════════════════════════════════════════════════════════════════════

create function fn_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);

  insert into entitlements (student_id, tier, source, status)
  values (new.id, 'free', 'default', 'active');

  return new;
end;
$$;

create trigger trg_handle_new_user
  after insert on auth.users
  for each row execute function fn_handle_new_user();
