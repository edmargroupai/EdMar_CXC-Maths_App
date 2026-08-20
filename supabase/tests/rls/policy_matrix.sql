-- P07 acceptance: "a test for both directions of every cell... a student
-- cannot read a draft, another student's attempts, or a premium payload."
--
-- One shared fixture set, exercised from multiple actor perspectives by
-- switching `request.jwt.claims` within a single transaction (RLS reads
-- auth.uid() from that GUC — verified directly against auth.uid()'s
-- definition). Fixtures are inserted as `postgres`, which is a superuser and
-- so is exempt from RLS by construction — this is not a workaround, it is
-- how every real content-authoring and migration path in this system works.
begin;

select plan(47);

-- ── Fixtures (as postgres — superuser, RLS-exempt) ─────────────────────────
insert into auth.users (id, email) values
  ('10000000-0000-0000-0000-000000000001', 'rls-student-free@test.com'),
  ('10000000-0000-0000-0000-000000000002', 'rls-student-premium@test.com'),
  ('20000000-0000-0000-0000-000000000001', 'rls-reviewer@test.com'),
  ('20000000-0000-0000-0000-000000000002', 'rls-support@test.com'),
  ('20000000-0000-0000-0000-000000000003', 'rls-curriculum-admin@test.com'),
  ('20000000-0000-0000-0000-000000000004', 'rls-content-admin@test.com'),
  ('20000000-0000-0000-0000-000000000005', 'rls-super-admin@test.com');

update profiles set role = 'reviewer' where id = '20000000-0000-0000-0000-000000000001';
update profiles set role = 'support' where id = '20000000-0000-0000-0000-000000000002';
update profiles set role = 'curriculum_admin' where id = '20000000-0000-0000-0000-000000000003';
update profiles set role = 'content_admin' where id = '20000000-0000-0000-0000-000000000004';
update profiles set role = 'super_admin' where id = '20000000-0000-0000-0000-000000000005';
update entitlements set tier = 'premium', status = 'active'
  where student_id = '10000000-0000-0000-0000-000000000002';

-- a draft question
insert into questions (id, question_type, provenance, difficulty_band, status)
values ('30000000-0000-0000-0000-000000000001', 'numeric', 'original_authored', 2, 'draft');

-- a published, free question with a payload
insert into questions (id, question_type, provenance, difficulty_band, status, is_free)
values ('30000000-0000-0000-0000-000000000002', 'numeric', 'original_authored', 2, 'draft', true);
insert into question_versions (id, question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
values ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 1,
  '[{"type":"text","value":"2+2"}]'::jsonb, '2+2',
  '{"answerType":"numeric_exact","canonicalValue":"4","displayValue":"4","acceptedForms":["4"],"normalisation":"numeric_default"}'::jsonb,
  'rls-hash-free');
update questions set current_version_id = '31000000-0000-0000-0000-000000000002' where id = '30000000-0000-0000-0000-000000000002';
update questions set status = 'pending_validation' where id = '30000000-0000-0000-0000-000000000002';
update questions set status = 'validating' where id = '30000000-0000-0000-0000-000000000002';
update questions set status = 'pending_review' where id = '30000000-0000-0000-0000-000000000002';
update questions set status = 'approved' where id = '30000000-0000-0000-0000-000000000002';
update questions set status = 'published' where id = '30000000-0000-0000-0000-000000000002';
update question_versions set published_at = now() where id = '31000000-0000-0000-0000-000000000002';
insert into question_payloads (question_version_id, question_id, payload, payload_bytes, content_version, is_free)
values ('31000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '{"x":1}'::jsonb, 10, 1, true);

-- a published, premium question with a payload
insert into questions (id, question_type, provenance, difficulty_band, status, is_free)
values ('30000000-0000-0000-0000-000000000003', 'numeric', 'original_authored', 2, 'draft', false);
insert into question_versions (id, question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
values ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 1,
  '[{"type":"text","value":"3+3"}]'::jsonb, '3+3',
  '{"answerType":"numeric_exact","canonicalValue":"6","displayValue":"6","acceptedForms":["6"],"normalisation":"numeric_default"}'::jsonb,
  'rls-hash-premium');
update questions set current_version_id = '31000000-0000-0000-0000-000000000003' where id = '30000000-0000-0000-0000-000000000003';
update questions set status = 'pending_validation' where id = '30000000-0000-0000-0000-000000000003';
update questions set status = 'validating' where id = '30000000-0000-0000-0000-000000000003';
update questions set status = 'pending_review' where id = '30000000-0000-0000-0000-000000000003';
update questions set status = 'approved' where id = '30000000-0000-0000-0000-000000000003';
update questions set status = 'published' where id = '30000000-0000-0000-0000-000000000003';
update question_versions set published_at = now() where id = '31000000-0000-0000-0000-000000000003';
insert into question_payloads (question_version_id, question_id, payload, payload_bytes, content_version, is_free)
values ('31000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', '{"x":1}'::jsonb, 10, 1, false);

insert into attempts (client_attempt_id, student_id, question_id, question_version_id, is_correct, difficulty_band)
values (gen_random_uuid(), '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002', true, 2);

-- two separate sessions: one is legally abandoned by the test, the other is
-- used for the illegal-transition test so the first doesn't consume the
-- only in_progress row before the second test runs.
insert into practice_sessions (id, student_id, mode, scope_kind, syllabus_code, requested_count, seed, status)
values
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'topic', 'topic', 'V2027', 10, 1, 'in_progress'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'topic', 'topic', 'V2027', 10, 2, 'in_progress');

insert into question_reports (id, question_id, question_version_id, reporter_id, reason_code)
values ('50000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', '31000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000001', 'wrong_answer');

-- a version for the still-draft question, so the reviewer-inserts-a-review
-- fixture below has a real (question_id, question_version_id) pair.
insert into question_versions (id, question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
values ('31000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 1,
  '[{"type":"text","value":"draft stem"}]'::jsonb, 'draft stem',
  '{"answerType":"numeric_exact","canonicalValue":"1","displayValue":"1","acceptedForms":["1"],"normalisation":"numeric_default"}'::jsonb,
  'rls-hash-draft');

insert into audit_log (actor_id, actor_role, action, entity_type, entity_id)
values ('20000000-0000-0000-0000-000000000005', 'super_admin', 'rls.fixture', 'test', '0');

update topics set is_active = false where code = 'M1-T6';

-- ── As student A (free tier) ────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select is_empty($$ select 1 from questions where id = '30000000-0000-0000-0000-000000000001' $$, 'free student cannot see a draft question');
select isnt_empty($$ select 1 from questions where id = '30000000-0000-0000-0000-000000000002' $$, 'free student can see a published question');
select isnt_empty($$ select 1 from question_payloads where question_id = '30000000-0000-0000-0000-000000000002' $$, 'free student can read the free payload');
select is_empty($$ select 1 from question_payloads where question_id = '30000000-0000-0000-0000-000000000003' $$, 'free student cannot read the premium payload — the paywall');
select isnt_empty($$ select 1 from attempts where student_id = '10000000-0000-0000-0000-000000000001' $$, 'student sees own attempts');
select is_empty($$ select 1 from attempts where student_id = '10000000-0000-0000-0000-000000000002' $$, 'student cannot see another student''s attempts');
-- attempts has no UPDATE policy at all for authenticated, so this silently
-- matches zero rows rather than throwing (verified below), same as a
-- USING-only policy mismatch would.
select is_empty(
  $$ update attempts set is_correct = false where student_id = '10000000-0000-0000-0000-000000000001' returning 1 $$,
  'attempts UPDATE affects zero rows for a student (immutable, D-13)'
);
select is_empty(
  $$ update entitlements set tier = 'premium' where student_id = '10000000-0000-0000-0000-000000000001' returning 1 $$,
  'a student cannot grant themselves premium'
);
select is_empty(
  $$ update questions set status = 'published' where id = '30000000-0000-0000-0000-000000000001' returning 1 $$,
  'a student cannot publish a draft'
);
select is_empty($$ select 1 from topics where code = 'M1-T6' $$, 'student cannot see a deactivated topic');
select isnt_empty($$ select 1 from topics where is_active $$, 'student can see active topics');
select isnt_empty($$ select 1 from v_public_config $$, 'student can read the public-config whitelist view');
select is_empty($$ select 1 from app_config $$, 'student cannot read the app_config table directly (only via the view)');
select is_empty($$ select 1 from question_reviews $$, 'student has zero access to question_reviews');
select is_empty($$ select 1 from ai_generations $$, 'student has zero access to ai_generations');
select is_empty($$ select 1 from audit_log $$, 'student has zero SELECT access to audit_log');
select isnt_empty($$ select 1 from question_reports where reporter_id = '10000000-0000-0000-0000-000000000001' $$, 'student sees own question report');

-- own-row write cycle: practice_sessions abandon transition
select isnt_empty(
  $$ update practice_sessions set status = 'abandoned' where id = '40000000-0000-0000-0000-000000000001' returning 1 $$,
  'student can transition own in_progress session to abandoned'
);
select throws_ok(
  $$ update practice_sessions set status = 'completed' where id = '40000000-0000-0000-0000-000000000002' $$,
  '42501', null,
  'student cannot set an arbitrary status directly (only in_progress -> abandoned is a legal client-side transition)'
);

-- student_bookmarks own-row cycle
select lives_ok(
  $$ insert into student_bookmarks (student_id, question_id) values ('10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002') $$,
  'student can bookmark a question for themselves'
);
select isnt_empty(
  $$ select 1 from student_bookmarks where student_id = '10000000-0000-0000-0000-000000000001' $$,
  'student sees own bookmark'
);

-- ── As student B (premium) ──────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"10000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

select isnt_empty($$ select 1 from question_payloads where question_id = '30000000-0000-0000-0000-000000000003' $$, 'premium student CAN read the premium payload');
select is_empty($$ select 1 from student_bookmarks where student_id = '10000000-0000-0000-0000-000000000001' $$, 'student B cannot see student A''s bookmark');
select is_empty($$ select 1 from question_reports where reporter_id = '10000000-0000-0000-0000-000000000001' $$, 'student B cannot see student A''s question report');

-- ── As reviewer ──────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000001","role":"authenticated"}', true);

select isnt_empty($$ select 1 from questions where id = '30000000-0000-0000-0000-000000000001' $$, 'reviewer can see a draft question');
select is_empty($$ select 1 from attempts $$, 'reviewer (below support) has zero access to attempts');
select lives_ok(
  $$ insert into question_reviews (question_id, question_version_id, reviewer_id, decision, note)
     values ('30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'changes_requested', 'needs a diagram') $$,
  'reviewer can insert a question_reviews row'
);
-- reviewer's own review cannot be edited afterward — no UPDATE policy exists
-- on question_reviews for anyone, so this silently affects zero rows rather
-- than throwing (same "no policy at all" behavior verified earlier).
select is_empty(
  $$ update question_reviews set note = 'changed my mind' where reviewer_id = '20000000-0000-0000-0000-000000000001' returning 1 $$,
  'reviewer cannot edit their own submitted review'
);
select lives_ok(
  $$ insert into questions (question_type, provenance, difficulty_band, status) values ('numeric', 'original_authored', 3, 'draft') $$,
  'reviewer can author a new draft question'
);
select throws_ok(
  $$ insert into skills (code, name) values ('RLS_TEST_SKILL', 'test') $$,
  '42501', null,
  'reviewer lacks curriculum_admin — cannot create a skill'
);

-- ── As support ───────────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000002","role":"authenticated"}', true);

select isnt_empty($$ select 1 from attempts where student_id = '10000000-0000-0000-0000-000000000001' $$, 'support can see any student''s attempts');
select isnt_empty($$ select 1 from entitlements where student_id = '10000000-0000-0000-0000-000000000001' $$, 'support can see any student''s entitlements');
select isnt_empty(
  $$ update entitlements set tier = 'premium', source = 'manual' where student_id = '10000000-0000-0000-0000-000000000001' returning 1 $$,
  'support can grant a manual entitlement, including the very first one on a default-sourced row'
);
select throws_ok(
  $$ update entitlements set tier = 'premium', source = 'google_play' where student_id = '10000000-0000-0000-0000-000000000001' $$,
  '42501', null,
  'support cannot leave an entitlement claiming a store-sourced origin (note 12)'
);
-- No UPDATE policy on question_versions matches a support caller
-- (is_content_role() excludes support — §21.3 "No content rights"), so this
-- affects zero rows silently rather than throwing.
select is_empty(
  $$ update question_versions set explanation = 'x' where id = '31000000-0000-0000-0000-000000000002' returning 1 $$,
  'support has no content-editing rights'
);

-- ── As curriculum_admin ────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000003","role":"authenticated"}', true);

select lives_ok(
  $$ insert into skills (code, name) values ('RLS_TEST_SKILL', 'test') $$,
  'curriculum_admin can create a skill'
);
select lives_ok(
  $$ update topics set name = name where code = 'M1-T1' $$,
  'curriculum_admin can update a topic'
);
select throws_ok(
  $$ select fn_publish_question('30000000-0000-0000-0000-000000000001', '31000000-0000-0000-0000-000000000002', 'x') $$,
  '42883', null,
  'fn_publish_question does not exist yet (P09) — curriculum_admin has no path to publish regardless'
);

-- ── As content_admin ─────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000004","role":"authenticated"}', true);

select lives_ok(
  $$ insert into papers (syllabus_code, title, paper, total_marks, duration_minutes) values ('V2027', 'RLS test paper', '01', 60, 90) $$,
  'content_admin can create a paper'
);
select lives_ok(
  $$ insert into content_jobs (job_type, status) values ('extract', 'queued') $$,
  'content_admin can create a content_job'
);

-- ── As super_admin ───────────────────────────────────────────────────────────
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"20000000-0000-0000-0000-000000000005","role":"authenticated"}', true);

select isnt_empty($$ select 1 from audit_log $$, 'super_admin can read audit_log (sees the fixture row)');
select lives_ok(
  $$ insert into audit_log (actor_id, actor_role, action, entity_type, entity_id) values (auth.uid(), 'super_admin', 'rls.test', 'test', '1') $$,
  'an authenticated actor can insert an audit_log row'
);
-- append-only for everyone, including super_admin — no UPDATE/DELETE policy
-- exists at all, so both silently affect zero rows.
select is_empty(
  $$ update audit_log set reason = 'tampered' where entity_type = 'test' returning 1 $$,
  'audit_log is append-only for super_admin too — UPDATE affects zero rows'
);
select is_empty(
  $$ delete from audit_log where entity_type = 'test' returning 1 $$,
  'audit_log is append-only for super_admin too — DELETE affects zero rows'
);
select lives_ok(
  $$ update app_config set value = value where key = 'content_version' $$,
  'super_admin can update app_config'
);
select throws_ok(
  $$ insert into admin_role_grants (profile_id, role, granted_by, reason) values ('10000000-0000-0000-0000-000000000001', 'reviewer', auth.uid(), 'no') $$,
  '23514', null,
  'admin_role_grants.reason must be >= 5 chars — a real constraint, not RLS, but confirms the insert path is reachable for super_admin'
);
select lives_ok(
  $$ insert into admin_role_grants (profile_id, role, granted_by, reason) values ('10000000-0000-0000-0000-000000000001', 'reviewer', auth.uid(), 'promoted for pgTAP test') $$,
  'super_admin can grant a role'
);

select * from finish();

rollback;
