-- P05 acceptance: "every index in §3 exists; immutability trigger raises on a
-- published-version update; the status-transition trigger rejects
-- draft -> published."
begin;

select plan(55);

-- ── Tables (§3.4-3.17) ──────────────────────────────────────────────────────
select has_table('questions');
select has_table('question_versions');
select has_table('question_options');
select has_table('solution_steps');
select has_table('common_errors');
select has_table('question_assets');
select has_table('math_renders');
select has_table('question_objectives');
select has_table('question_skills');
select has_table('question_sources');
select has_table('question_payloads');
select has_table('question_reviews');
select has_table('question_quality_metrics');
select has_table('question_reports');
select has_table('papers');
select has_table('paper_questions');

-- ── Indexes (§3.4-3.17, every named index) ─────────────────────────────────
select has_index('questions', 'idx_q_published');
select has_index('questions', 'idx_q_difficulty');
select has_index('questions', 'idx_q_variant_family');
select has_index('questions', 'idx_q_provenance');
select has_index('questions', 'idx_q_free');
select has_index('questions', 'uq_q_legacy');
select has_index('question_versions', 'idx_qv_hash');
select has_index('question_versions', 'idx_qv_embedding');
select has_index('question_versions', 'idx_qv_question');
select has_index('common_errors', 'idx_ce_version');
select has_index('common_errors', 'idx_ce_value');
select has_index('question_options', 'idx_qo_version');
select has_index('solution_steps', 'idx_ss_version');
select has_index('question_assets', 'idx_qa_version');
select has_index('math_renders', 'idx_mr_created');
select has_index('question_objectives', 'idx_qo_objective');
select has_index('question_objectives', 'uq_qo_primary');
select has_index('question_skills', 'idx_qs_skill');
select has_index('question_sources', 'idx_qsrc_paper');
select has_index('question_sources', 'idx_qsrc_kind');
select has_index('question_payloads', 'idx_qp_question');
select has_index('question_payloads', 'idx_qp_free');
select has_index('question_reviews', 'idx_qr_question');
select has_index('question_reviews', 'idx_qr_reviewer');
select has_index('question_quality_metrics', 'idx_qqm_flagged');
select has_index('question_quality_metrics', 'idx_qqm_accuracy');
select has_index('question_reports', 'idx_qrep_open');
select has_index('question_reports', 'idx_qrep_reporter');
select has_index('papers', 'uq_papers_sitting');
select has_index('papers', 'idx_papers_published');
select has_index('paper_questions', 'idx_pq_question');

-- ── trg_question_status_transition (§15.2) ─────────────────────────────────
insert into questions (id, question_type, provenance, difficulty_band)
values ('00000000-0000-0000-0000-000000000a01', 'numeric', 'original_authored', 2);

select throws_ok(
  $$ update questions set status = 'published' where id = '00000000-0000-0000-0000-000000000a01' $$,
  'P0001',
  'questions.status: draft -> published is not a valid transition (§15.2)',
  'direct draft -> published is rejected'
);
select lives_ok(
  $$ update questions set status = 'pending_validation' where id = '00000000-0000-0000-0000-000000000a01' $$,
  'draft -> pending_validation is a valid transition'
);

-- ── fn_answer_spec_schema / trg_validate_answer_spec (§11.2) ───────────────
insert into questions (id, question_type, provenance, difficulty_band)
values ('00000000-0000-0000-0000-000000000a02', 'numeric', 'original_authored', 2);

select throws_ok(
  $$
    insert into question_versions (question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
    values (
      '00000000-0000-0000-0000-000000000a02', 1,
      '[{"type":"text","value":"x"}]'::jsonb, 'x',
      '{"answerType":"numeric_exact"}'::jsonb,
      'hash-missing-fields'
    )
  $$,
  'P0001', null,
  'a malformed answer_spec (missing required fields) is rejected'
);
-- (explicit NULL errmsg: sqlstate-only match, custom description. The actual
-- message is dynamic — it embeds question_id/version_no and the
-- jsonschema_validation_errors() list — so it is not worth hand-matching.
-- pgTAP's throws_ok(sql, text) 2-arg form is NOT "any error, custom label":
-- a 5-byte string is matched as a sqlstate, anything else as an exact
-- expected message; there is no free-standing description-only overload.)

select lives_ok(
  $$
    insert into question_versions (question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
    values (
      '00000000-0000-0000-0000-000000000a02', 1,
      '[{"type":"text","value":"Evaluate 2+2"}]'::jsonb, 'Evaluate 2+2',
      '{"answerType":"numeric_exact","canonicalValue":"4","displayValue":"4","acceptedForms":["4"],"normalisation":"numeric_default"}'::jsonb,
      'hash-valid-q2'
    )
  $$,
  'a well-formed answer_spec is accepted'
);

-- ── trg_qv_immutable (I-4) ──────────────────────────────────────────────────
insert into questions (id, question_type, provenance, difficulty_band)
values ('00000000-0000-0000-0000-000000000a03', 'numeric', 'original_authored', 2);
insert into question_versions (
  id, question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash, published_at
)
values (
  '00000000-0000-0000-0000-0000000000a6',
  '00000000-0000-0000-0000-000000000a03', 1,
  '[{"type":"text","value":"Evaluate 2+2"}]'::jsonb, 'Evaluate 2+2',
  '{"answerType":"numeric_exact","canonicalValue":"4","displayValue":"4","acceptedForms":["4"],"normalisation":"numeric_default"}'::jsonb,
  'hash-published-q3',
  now()
);

select throws_ok(
  $$ update question_versions set stem_plain = 'Evaluate 2+3' where id = '00000000-0000-0000-0000-0000000000a6' $$,
  'P0001', null,
  'editing a published question_version is rejected (I-4)'
);
-- (explicit NULL errmsg: the real message embeds published_at, set from
-- now() above, so it is not exactly predictable.)
select lives_ok(
  $$ update question_versions set validation_report = '{"ok":true}'::jsonb where id = '00000000-0000-0000-0000-0000000000a6' $$,
  'validation_report may still be updated on a published version'
);

-- ── trg_qo_exactly_one_correct (§3.6, deferred to commit/SET CONSTRAINTS) ──
insert into questions (id, question_type, provenance, difficulty_band)
values ('00000000-0000-0000-0000-000000000a04', 'multiple_choice', 'original_authored', 2);
insert into question_versions (id, question_id, version_no, stem_blocks, stem_plain, answer_spec, normalised_hash)
values (
  '00000000-0000-0000-0000-0000000000a7',
  '00000000-0000-0000-0000-000000000a04', 1,
  '[{"type":"text","value":"pick one"}]'::jsonb, 'pick one',
  '{"answerType":"option_id","canonicalValue":"A","displayValue":"A","acceptedForms":["A"],"normalisation":"default"}'::jsonb,
  'hash-mcq-q4'
);

select throws_ok(
  $$
    insert into question_options (question_version_id, option_key, content_blocks, content_plain, is_correct, sequence)
    values ('00000000-0000-0000-0000-0000000000a7', 'A', '[{"type":"text","value":"a"}]'::jsonb, 'a', false, 1);
    insert into question_options (question_version_id, option_key, content_blocks, content_plain, is_correct, sequence)
    values ('00000000-0000-0000-0000-0000000000a7', 'B', '[{"type":"text","value":"b"}]'::jsonb, 'b', false, 2);
    set constraints trg_qo_exactly_one_correct immediate;
  $$,
  'P0001',
  'question_options for question_version 00000000-0000-0000-0000-0000000000a7 (multiple_choice) must have exactly one is_correct, found 0',
  'multiple_choice with zero correct options is rejected at commit'
);

select lives_ok(
  $$
    insert into question_options (question_version_id, option_key, content_blocks, content_plain, is_correct, sequence)
    values ('00000000-0000-0000-0000-0000000000a7', 'A', '[{"type":"text","value":"a"}]'::jsonb, 'a', true, 1);
    insert into question_options (question_version_id, option_key, content_blocks, content_plain, is_correct, sequence)
    values ('00000000-0000-0000-0000-0000000000a7', 'B', '[{"type":"text","value":"b"}]'::jsonb, 'b', false, 2);
    set constraints trg_qo_exactly_one_correct immediate;
  $$,
  'multiple_choice with exactly one correct option is accepted'
);

select * from finish();

rollback;
