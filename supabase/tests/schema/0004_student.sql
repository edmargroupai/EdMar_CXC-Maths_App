-- P06 acceptance: "all 45 tables exist; fn_handle_new_user creates a profile
-- and a free entitlement on auth.users insert."
begin;

select plan(25);

-- ── All 45 tables exist (10 curriculum + 16 content + 19 student/commerce/ops) ──
select is(
  (select count(*)::int from pg_tables where schemaname = 'public'),
  45,
  'exactly 45 tables in the public schema'
);

select has_table('profiles');
select has_table('admin_role_grants');
select has_table('practice_sessions');
select has_table('practice_session_items');
select has_table('exam_sessions');
select has_table('exam_responses');
select has_table('attempts');
select has_table('attempt_skills');
select has_table('student_skill_mastery');
select has_table('student_topic_mastery');
select has_table('student_daily_usage');
select has_table('student_bookmarks');
select has_table('entitlements');
select has_table('subscription_events');
select has_table('audit_log');
select has_table('analytics_events');
select has_table('content_jobs');
select has_table('ai_generations');
select has_table('app_config');

-- ── The FK constraints P05 deferred now exist ──────────────────────────────
select fk_ok('questions', array['created_by'], 'profiles', array['id']);
select fk_ok('question_reviews', array['reviewer_id'], 'profiles', array['id']);

-- ── app_config seeded with the 9 operational keys (§3.23) ──────────────────
select is(
  (select count(*)::int from app_config),
  9,
  'app_config seeded with all 9 keys'
);

-- ── fn_handle_new_user (§6.1): creates a profile and a free entitlement ────
insert into auth.users (id, email) values ('00000000-0000-0000-0000-00000000f001', 'pgtap-test@example.com');

select results_eq(
  $$ select role, syllabus_version, age_confirmed_13_plus from profiles where id = '00000000-0000-0000-0000-00000000f001' $$,
  $$ values ('student'::app_role, 'V2027'::syllabus_code, false) $$,
  'fn_handle_new_user creates a profile row with the documented defaults'
);
select results_eq(
  $$ select tier, source, status from entitlements where student_id = '00000000-0000-0000-0000-00000000f001' $$,
  $$ values ('free'::entitlement_tier, 'default'::entitlement_source, 'active'::entitlement_status) $$,
  'fn_handle_new_user creates a free, active, default-source entitlement'
);

select * from finish();

rollback;
