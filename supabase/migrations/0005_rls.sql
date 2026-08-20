-- P07 · Technical Build Spec §5 — Row Level Security on all 45 tables.
--
-- §5.1 helpers, §5.2's full policy matrix, §5.3's paywall policy (verbatim),
-- §5.4 anonymous access (no special-cased policy — anonymous sign-in
-- produces a real auth.users row, so the ordinary student policies apply).
--
-- Role-hierarchy shorthand used in comments below, matching §5.2's matrix:
--   rev = reviewer+, support+ = support+, curr = curriculum_admin+,
--   content = content_admin+, super = super_admin+ (has_role() below).
--
-- Two spec/schema mismatches resolved here, not invented around:
--   - §5.2 marks `syllabus_versions`/`modules` "(active)" for student SELECT,
--     but neither table has an is_active column (§3.3) — subjects does.
--     Applied the (active) filter only where the column exists.
--   - `skill_prerequisites`/`skill_objectives` are pure join tables with no
--     is_active column; read unconditionally rather than inventing a filter.

-- ═══════════════════════════════════════════════════════════════════════════
-- §5.1 Helper functions
-- ═══════════════════════════════════════════════════════════════════════════

create or replace function auth_role() returns app_role
  language sql stable security definer set search_path = public as $$
    select coalesce((select role from profiles where id = auth.uid()), 'student'::app_role);
$$;

create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
    select auth_role() in ('viewer', 'reviewer', 'curriculum_admin', 'content_admin', 'support', 'super_admin');
$$;

create or replace function has_role(min_role app_role) returns boolean
  language sql stable security definer set search_path = public as $$
    select array_position(
             array['student', 'viewer', 'reviewer', 'support', 'curriculum_admin', 'content_admin', 'super_admin']::app_role[],
             auth_role())
         >= array_position(
             array['student', 'viewer', 'reviewer', 'support', 'curriculum_admin', 'content_admin', 'super_admin']::app_role[],
             min_role);
$$;

-- NOT in §5.1's verbatim four — added to resolve a real contradiction
-- discovered while testing this migration. §5.1's has_role() array ranks
-- 'support' above 'reviewer' (['student','viewer','reviewer','support',
-- 'curriculum_admin','content_admin','super_admin']), so has_role('reviewer')
-- is TRUE for a support-role caller. But §21.3's role table is explicit —
-- support gets "users, reports, entitlements... **No content rights**" — and
-- §27.4's own example test asserts a support caller is blocked from editing
-- question_versions. Content-authoring policies below use this instead of
-- has_role('reviewer'); table-visibility policies for support (attempts,
-- entitlements, practice_sessions, etc.) correctly keep using has_role
-- ('support'), where the hierarchy is unambiguous and intended.
create or replace function is_content_role() returns boolean
  language sql stable security definer set search_path = public as $$
    select auth_role() in ('reviewer', 'curriculum_admin', 'content_admin', 'super_admin');
$$;

-- D-08: entitlement is enforced in the database, not the client.
create or replace function has_premium(uid uuid default auth.uid()) returns boolean
  language sql stable security definer set search_path = public as $$
    select exists (
      select 1 from entitlements e
      where e.student_id = uid
        and e.tier = 'premium'
        and e.status in ('active', 'grace')
        and (e.current_period_end is null or e.current_period_end > now()
             or (e.status = 'grace' and e.grace_until > now()))
    );
$$;

-- §5.2 note 14: app_config exposes a whitelist of client-relevant keys
-- through this view; the table itself is staff-only.
--
-- Deliberately NOT security_invoker: app_config's own RLS (cfg_select_staff,
-- below) would otherwise make this view return nothing to a student — RLS
-- does not apply to a table's owner by default (no FORCE ROW LEVEL SECURITY
-- is set), so the view runs as its owner, and the WHERE clause below is the
-- entire access-control mechanism for it. This is the intended pattern, not
-- an accidental bypass: it is how footnote 14 lets two keys reach students
-- while the table itself stays locked down.
create view v_public_config as
  select key, value
  from app_config
  where key in ('free_daily_question_limit', 'session_max_questions');

grant select on v_public_config to authenticated;

-- ═══════════════════════════════════════════════════════════════════════════
-- Base grants — a precondition for RLS, not a substitute for it.
--
-- `config.toml`'s auto_expose_new_tables is off (matching the cloud default,
-- §7.1 note), so nothing created by 0002-0004 is reachable by anon,
-- authenticated or even service_role yet: GRANT and RLS are two independent
-- gates, and BYPASSRLS (service_role's attribute) only lifts the second one.
-- Grant broadly here; RLS policies below do the actual per-row restriction —
-- B-12's "authorisation lives in RLS policies, not in the API surface".
-- `anon` gets nothing: §5.4 rejects a public/unauthenticated read policy, so
-- there is nothing for a bare grant to unlock for that role.
-- ═══════════════════════════════════════════════════════════════════════════

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
grant execute on all functions in schema public to authenticated, service_role;

-- ═══════════════════════════════════════════════════════════════════════════
-- Enable RLS on all 45 tables (catalogue-provable — §32 P07 accept criteria)
-- ═══════════════════════════════════════════════════════════════════════════

alter table profiles enable row level security;
alter table admin_role_grants enable row level security;
alter table subjects enable row level security;
alter table syllabus_versions enable row level security;
alter table modules enable row level security;
alter table topics enable row level security;
alter table subtopics enable row level security;
alter table specific_objectives enable row level security;
alter table skills enable row level security;
alter table skill_prerequisites enable row level security;
alter table skill_objectives enable row level security;
alter table objective_mappings enable row level security;
alter table questions enable row level security;
alter table question_versions enable row level security;
alter table question_options enable row level security;
alter table solution_steps enable row level security;
alter table common_errors enable row level security;
alter table question_assets enable row level security;
alter table math_renders enable row level security;
alter table question_objectives enable row level security;
alter table question_skills enable row level security;
alter table question_sources enable row level security;
alter table question_payloads enable row level security;
alter table question_reviews enable row level security;
alter table question_quality_metrics enable row level security;
alter table question_reports enable row level security;
alter table papers enable row level security;
alter table paper_questions enable row level security;
alter table practice_sessions enable row level security;
alter table practice_session_items enable row level security;
alter table attempts enable row level security;
alter table attempt_skills enable row level security;
alter table exam_sessions enable row level security;
alter table exam_responses enable row level security;
alter table student_skill_mastery enable row level security;
alter table student_topic_mastery enable row level security;
alter table student_daily_usage enable row level security;
alter table student_bookmarks enable row level security;
alter table entitlements enable row level security;
alter table subscription_events enable row level security;
alter table audit_log enable row level security;
alter table analytics_events enable row level security;
alter table content_jobs enable row level security;
alter table ai_generations enable row level security;
alter table app_config enable row level security;

-- ═══════════════════════════════════════════════════════════════════════════
-- profiles / admin_role_grants (§3.1-3.2)
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert happens only in fn_handle_new_user's trigger, under the table
-- owner's privileges (not RLS-gated) — no student INSERT policy (note 1).
create policy prof_select_own on profiles for select to authenticated
  using (id = auth.uid());
create policy prof_select_staff on profiles for select to authenticated
  using (has_role('support'));
create policy prof_update_own on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Note 2: real deletion is a soft delete via a future fn_delete_own_account
-- (§6, not yet built) that sets deleted_at through the update policy above;
-- this literal delete policy matches the matrix's "own" cell exactly.
create policy prof_delete_own on profiles for delete to authenticated
  using (id = auth.uid());

create policy arg_select_super on admin_role_grants for select to authenticated
  using (has_role('super_admin'));
create policy arg_insert_super on admin_role_grants for insert to authenticated
  with check (has_role('super_admin'));
create policy arg_update_super on admin_role_grants for update to authenticated
  using (has_role('super_admin')) with check (has_role('super_admin'));
-- No delete policy anywhere: role grants are revoked (revoked_at set via the
-- update policy above), never deleted — permanent audit trail.

-- ═══════════════════════════════════════════════════════════════════════════
-- Curriculum tables (§3.3)
-- ═══════════════════════════════════════════════════════════════════════════

create policy subj_select_active on subjects for select to authenticated
  using (is_active);
create policy subj_select_staff on subjects for select to authenticated
  using (is_staff());
create policy subj_write_curr on subjects for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy subj_update_curr on subjects for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy sv_select_all on syllabus_versions for select to authenticated
  using (true);
create policy sv_write_curr on syllabus_versions for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy sv_update_curr on syllabus_versions for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy mod_select_all on modules for select to authenticated
  using (true);
create policy mod_write_curr on modules for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy mod_update_curr on modules for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy top_select_active on topics for select to authenticated
  using (is_active);
create policy top_select_staff on topics for select to authenticated
  using (is_staff());
create policy top_write_curr on topics for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy top_update_curr on topics for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy subt_select_active on subtopics for select to authenticated
  using (is_active);
create policy subt_select_staff on subtopics for select to authenticated
  using (is_staff());
create policy subt_write_curr on subtopics for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy subt_update_curr on subtopics for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy so_select_active on specific_objectives for select to authenticated
  using (is_active);
create policy so_select_staff on specific_objectives for select to authenticated
  using (is_staff());
create policy so_write_curr on specific_objectives for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy so_update_curr on specific_objectives for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));

create policy sk_select_active on skills for select to authenticated
  using (is_active);
create policy sk_select_staff on skills for select to authenticated
  using (is_staff());
create policy sk_write_curr on skills for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy sk_update_curr on skills for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));
-- Note 3: deletes permitted only where no dependents exist — ON DELETE
-- RESTRICT (§3.3) already enforces that; RLS just gates who may attempt it.
create policy sk_delete_curr on skills for delete to authenticated
  using (has_role('curriculum_admin'));

create policy skp_select_all on skill_prerequisites for select to authenticated
  using (true);
create policy skp_write_curr on skill_prerequisites for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy skp_update_curr on skill_prerequisites for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));
create policy skp_delete_curr on skill_prerequisites for delete to authenticated
  using (has_role('curriculum_admin'));

create policy sko_select_all on skill_objectives for select to authenticated
  using (true);
create policy sko_write_curr on skill_objectives for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy sko_update_curr on skill_objectives for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));
create policy sko_delete_curr on skill_objectives for delete to authenticated
  using (has_role('curriculum_admin'));

create policy om_select_all on objective_mappings for select to authenticated
  using (true);
create policy om_write_curr on objective_mappings for insert to authenticated
  with check (has_role('curriculum_admin'));
create policy om_update_curr on objective_mappings for update to authenticated
  using (has_role('curriculum_admin')) with check (has_role('curriculum_admin'));
create policy om_delete_curr on objective_mappings for delete to authenticated
  using (has_role('curriculum_admin'));

-- ═══════════════════════════════════════════════════════════════════════════
-- Content tables (§3.4-3.17)
-- ═══════════════════════════════════════════════════════════════════════════

create policy q_select_published on questions for select to authenticated
  using (status = 'published' and retired_at is null);
create policy q_select_staff on questions for select to authenticated
  using (is_staff());
create policy q_insert_rev on questions for insert to authenticated
  with check (is_content_role());
create policy q_update_rev on questions for update to authenticated
  using (is_content_role()) with check (is_content_role());
-- No delete policy: questions are retired (retired_at), never deleted.

-- Note 4: reachable only through a published, non-retired parent question.
create policy qv_select_published on question_versions for select to authenticated
  using (exists (
    select 1 from questions q where q.id = question_versions.question_id and q.status = 'published' and q.retired_at is null
  ));
create policy qv_select_staff on question_versions for select to authenticated
  using (is_staff());
create policy qv_insert_rev on question_versions for insert to authenticated
  with check (is_content_role());
-- Note 5: trg_qv_immutable blocks edits to published rows regardless of this policy.
create policy qv_update_rev on question_versions for update to authenticated
  using (is_content_role()) with check (is_content_role());

create policy qo_select_published on question_options for select to authenticated
  using (exists (
    select 1 from question_versions qv join questions q on q.id = qv.question_id
    where qv.id = question_options.question_version_id and q.status = 'published' and q.retired_at is null
  ));
create policy qo_select_staff on question_options for select to authenticated
  using (is_staff());
create policy qo_write_rev on question_options for insert to authenticated
  with check (is_content_role());
create policy qo_update_rev on question_options for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy qo_delete_rev on question_options for delete to authenticated
  using (is_content_role());

create policy ss_select_published on solution_steps for select to authenticated
  using (exists (
    select 1 from question_versions qv join questions q on q.id = qv.question_id
    where qv.id = solution_steps.question_version_id and q.status = 'published' and q.retired_at is null
  ));
create policy ss_select_staff on solution_steps for select to authenticated
  using (is_staff());
create policy ss_write_rev on solution_steps for insert to authenticated
  with check (is_content_role());
create policy ss_update_rev on solution_steps for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy ss_delete_rev on solution_steps for delete to authenticated
  using (is_content_role());

create policy ce_select_published on common_errors for select to authenticated
  using (exists (
    select 1 from question_versions qv join questions q on q.id = qv.question_id
    where qv.id = common_errors.question_version_id and q.status = 'published' and q.retired_at is null
  ));
create policy ce_select_staff on common_errors for select to authenticated
  using (is_staff());
create policy ce_write_rev on common_errors for insert to authenticated
  with check (is_content_role());
create policy ce_update_rev on common_errors for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy ce_delete_rev on common_errors for delete to authenticated
  using (is_content_role());

create policy qa_select_published on question_assets for select to authenticated
  using (exists (
    select 1 from question_versions qv join questions q on q.id = qv.question_id
    where qv.id = question_assets.question_version_id and q.status = 'published' and q.retired_at is null
  ));
create policy qa_select_staff on question_assets for select to authenticated
  using (is_staff());
create policy qa_write_rev on question_assets for insert to authenticated
  with check (is_content_role());
create policy qa_update_rev on question_assets for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy qa_delete_rev on question_assets for delete to authenticated
  using (is_content_role());

-- math_renders: content-addressed, shared across questions — readable by
-- anyone signed in; written only by the pipeline under service role.
create policy mr_select_all on math_renders for select to authenticated
  using (true);

create policy qob_select_published on question_objectives for select to authenticated
  using (exists (
    select 1 from questions q where q.id = question_objectives.question_id and q.status = 'published' and q.retired_at is null
  ));
create policy qob_select_staff on question_objectives for select to authenticated
  using (is_staff());
create policy qob_write_rev on question_objectives for insert to authenticated
  with check (is_content_role());
create policy qob_update_rev on question_objectives for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy qob_delete_rev on question_objectives for delete to authenticated
  using (is_content_role());

create policy qs_select_published on question_skills for select to authenticated
  using (exists (
    select 1 from questions q where q.id = question_skills.question_id and q.status = 'published' and q.retired_at is null
  ));
create policy qs_select_staff on question_skills for select to authenticated
  using (is_staff());
create policy qs_write_rev on question_skills for insert to authenticated
  with check (is_content_role());
create policy qs_update_rev on question_skills for update to authenticated
  using (is_content_role()) with check (is_content_role());
create policy qs_delete_rev on question_skills for delete to authenticated
  using (is_content_role());

create policy qsrc_select_published on question_sources for select to authenticated
  using (exists (
    select 1 from questions q where q.id = question_sources.question_id and q.status = 'published' and q.retired_at is null
  ));
create policy qsrc_select_staff on question_sources for select to authenticated
  using (is_staff());
create policy qsrc_insert_rev on question_sources for insert to authenticated
  with check (is_content_role());
create policy qsrc_update_rev on question_sources for update to authenticated
  using (is_content_role()) with check (is_content_role());

-- §5.3 The paywall policy — the single most important policy in the system.
-- Transcribed verbatim from the spec, not reconstructed.
create policy qp_student_read on question_payloads
for select to authenticated
using (
  exists (
    select 1 from questions q
    where q.id = question_payloads.question_id
      and q.status = 'published'
      and q.retired_at is null
  )
  and (
    is_staff()
    or has_premium()
    or question_payloads.is_free
  )
);
-- No insert/update/delete policy for anyone but service role: written only
-- by fn_build_question_payload (§6.8, P09) at publish time.

create policy qr_select_staff on question_reviews for select to authenticated
  using (is_staff());
create policy qr_insert_rev on question_reviews for insert to authenticated
  with check (is_content_role());

create policy qqm_select_staff on question_quality_metrics for select to authenticated
  using (is_staff());

create policy qrep_select_own on question_reports for select to authenticated
  using (reporter_id = auth.uid());
create policy qrep_select_staff on question_reports for select to authenticated
  using (is_staff());
-- Note 7: fn_report_question (§6, P09) is the only sanctioned insert path
-- and applies the 20/day rate limit (§25.7); RLS here just scopes ownership.
create policy qrep_insert_own on question_reports for insert to authenticated
  with check (reporter_id = auth.uid());
create policy qrep_update_rev on question_reports for update to authenticated
  using (has_role('reviewer')) with check (has_role('reviewer'));

create policy pap_select_published on papers for select to authenticated
  using (status = 'published');
create policy pap_select_staff on papers for select to authenticated
  using (is_staff());
create policy pap_insert_content on papers for insert to authenticated
  with check (has_role('content_admin'));
create policy pap_update_content on papers for update to authenticated
  using (has_role('content_admin')) with check (has_role('content_admin'));

-- Note 8: scoped through the parent paper's own publish status.
create policy pq_select_published on paper_questions for select to authenticated
  using (exists (select 1 from papers p where p.id = paper_questions.paper_id and p.status = 'published'));
create policy pq_select_staff on paper_questions for select to authenticated
  using (is_staff());
create policy pq_insert_content on paper_questions for insert to authenticated
  with check (has_role('content_admin'));
create policy pq_update_content on paper_questions for update to authenticated
  using (has_role('content_admin')) with check (has_role('content_admin'));
create policy pq_delete_content on paper_questions for delete to authenticated
  using (has_role('content_admin'));

-- ═══════════════════════════════════════════════════════════════════════════
-- Student / practice tables (§3.18-3.21)
-- ═══════════════════════════════════════════════════════════════════════════

-- Note 9: students never insert practice_sessions directly — only through
-- fn_create_practice_session (§6.4, P09), a SECURITY DEFINER function that
-- validates entitlement and writes student_daily_usage atomically. No
-- INSERT policy for role authenticated.
create policy ps_select_own on practice_sessions for select to authenticated
  using (student_id = auth.uid());
create policy ps_select_staff on practice_sessions for select to authenticated
  using (has_role('support'));
-- Note 10: the only legal transition via direct client update is
-- in_progress -> abandoned (everything else goes through fn_complete_session).
create policy ps_update_abandon on practice_sessions for update to authenticated
  using (student_id = auth.uid() and status = 'in_progress')
  with check (student_id = auth.uid() and status = 'abandoned');

create policy psi_select_own on practice_session_items for select to authenticated
  using (exists (select 1 from practice_sessions ps where ps.id = practice_session_items.session_id and ps.student_id = auth.uid()));
create policy psi_select_staff on practice_session_items for select to authenticated
  using (has_role('support'));

-- Note 9: attempts are recorded only via fn_record_attempt (§6.5, P09).
create policy at_select_own on attempts for select to authenticated
  using (student_id = auth.uid());
create policy at_select_staff on attempts for select to authenticated
  using (has_role('support'));
-- No update/delete policy for anyone but a service-role purge job (§25.12) —
-- attempts are immutable (D-13), bolded in the matrix.

create policy ats_select_own on attempt_skills for select to authenticated
  using (exists (select 1 from attempts a where a.id = attempt_skills.attempt_id and a.student_id = auth.uid()));
create policy ats_select_staff on attempt_skills for select to authenticated
  using (has_role('support'));

create policy es_select_own on exam_sessions for select to authenticated
  using (student_id = auth.uid());
create policy es_select_staff on exam_sessions for select to authenticated
  using (has_role('support'));
-- Note 10 (same pattern as practice_sessions): only in_progress -> abandoned.
create policy es_update_abandon on exam_sessions for update to authenticated
  using (student_id = auth.uid() and status = 'in_progress')
  with check (student_id = auth.uid() and status = 'abandoned');

create policy er_select_own on exam_responses for select to authenticated
  using (exists (select 1 from exam_sessions es where es.id = exam_responses.exam_session_id and es.student_id = auth.uid()));
create policy er_select_staff on exam_responses for select to authenticated
  using (has_role('support'));
-- Responses are written directly by the client during a timed paper (unlike
-- attempts) — scoped to the caller's own, still-open exam session.
create policy er_insert_own on exam_responses for insert to authenticated
  with check (exists (
    select 1 from exam_sessions es
    where es.id = exam_responses.exam_session_id and es.student_id = auth.uid()
      and es.status = 'in_progress' and es.expires_at > now()
  ));
-- Note 11: update permitted only while the parent session is in_progress and not expired.
create policy er_update_own on exam_responses for update to authenticated
  using (exists (
    select 1 from exam_sessions es
    where es.id = exam_responses.exam_session_id and es.student_id = auth.uid()
      and es.status = 'in_progress' and es.expires_at > now()
  ))
  with check (exists (
    select 1 from exam_sessions es
    where es.id = exam_responses.exam_session_id and es.student_id = auth.uid()
  ));

create policy ssm_select_own on student_skill_mastery for select to authenticated
  using (student_id = auth.uid());
create policy ssm_select_staff on student_skill_mastery for select to authenticated
  using (has_role('support'));

create policy stm_select_own on student_topic_mastery for select to authenticated
  using (student_id = auth.uid());
create policy stm_select_staff on student_topic_mastery for select to authenticated
  using (has_role('support'));

create policy sdu_select_own on student_daily_usage for select to authenticated
  using (student_id = auth.uid());
create policy sdu_select_staff on student_daily_usage for select to authenticated
  using (has_role('support'));

create policy sb_select_own on student_bookmarks for select to authenticated
  using (student_id = auth.uid());
create policy sb_select_staff on student_bookmarks for select to authenticated
  using (has_role('support'));
create policy sb_insert_own on student_bookmarks for insert to authenticated
  with check (student_id = auth.uid());
create policy sb_delete_own on student_bookmarks for delete to authenticated
  using (student_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- Commerce tables (§3.22)
-- ═══════════════════════════════════════════════════════════════════════════

create policy ent_select_own on entitlements for select to authenticated
  using (student_id = auth.uid());
create policy ent_select_staff on entitlements for select to authenticated
  using (has_role('support'));
-- Note 12: support may grant/extend only source='manual' entitlements;
-- store-sourced rows are written by service role only (verify-purchase,
-- play-rtdn edge functions, §8.1-8.2).
create policy ent_insert_support on entitlements for insert to authenticated
  with check (has_role('support') and source = 'manual');
-- USING deliberately does not also require source = 'manual' on the OLD row:
-- the entitlement support is converting almost always starts life as
-- source='default' (fn_handle_new_user's free grant) or a lapsed store
-- subscription support is overriding with a comp. Gating on the old value
-- would make the very first manual grant impossible. WITH CHECK is what
-- note 12 actually requires: the row support leaves behind must be
-- source='manual' — support can touch any row, but can never leave it (or
-- fabricate one) claiming to be a real store purchase.
create policy ent_update_support on entitlements for update to authenticated
  using (has_role('support'))
  with check (has_role('support') and source = 'manual');

create policy se_select_content on subscription_events for select to authenticated
  using (has_role('content_admin'));

-- Note 13: audit_log needs an INSERT policy so SECURITY DEFINER functions
-- writing on behalf of any authenticated caller can log the action; no
-- update/delete policy exists for any role, including super_admin — it is
-- append-only by construction. The service-role "insert only" note in the
-- matrix is enforced by Postgres/Supabase convention (service_role carries
-- BYPASSRLS, so no policy can further restrict it) rather than by a policy
-- here — documented, not silently ignored.
create policy al_select_super on audit_log for select to authenticated
  using (has_role('super_admin'));
create policy al_insert_authenticated on audit_log for insert to authenticated
  with check (true);

create policy ae_insert_own on analytics_events for insert to authenticated
  with check (student_id = auth.uid());
create policy ae_select_content on analytics_events for select to authenticated
  using (has_role('content_admin'));

create policy cj_select_staff on content_jobs for select to authenticated
  using (is_staff());
create policy cj_insert_content on content_jobs for insert to authenticated
  with check (has_role('content_admin'));
create policy cj_update_content on content_jobs for update to authenticated
  using (has_role('content_admin')) with check (has_role('content_admin'));

create policy ag_select_staff on ai_generations for select to authenticated
  using (is_staff());

create policy cfg_select_staff on app_config for select to authenticated
  using (is_staff());
create policy cfg_insert_super on app_config for insert to authenticated
  with check (has_role('super_admin'));
create policy cfg_update_super on app_config for update to authenticated
  using (has_role('super_admin')) with check (has_role('super_admin'));
