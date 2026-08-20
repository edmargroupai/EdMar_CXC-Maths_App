-- P03 acceptance: pgTAP asserts every enum from §3.0 exists with its exact
-- value list, plus the trg_set_updated_at() helper function exists.
begin;

select plan(39);

select has_enum('app_role');
select enum_has_labels(
  'app_role',
  array['student', 'viewer', 'reviewer', 'curriculum_admin', 'content_admin', 'support', 'super_admin']
);

select has_enum('syllabus_code');
select enum_has_labels('syllabus_code', array['V2018', 'V2027']);

select has_enum('question_type');
select enum_has_labels(
  'question_type',
  array['multiple_choice', 'multi_select', 'true_false', 'numeric', 'expression', 'structured']
);

select has_enum('answer_type');
select enum_has_labels(
  'answer_type',
  array[
    'option_id', 'option_set', 'boolean', 'numeric_exact', 'numeric_tolerance',
    'numeric_sf', 'numeric_dp', 'fraction', 'mixed_number', 'ratio', 'currency',
    'with_units', 'expression', 'coordinate', 'set', 'interval', 'matrix', 'vector', 'text'
  ]
);

select has_enum('provenance_type');
select enum_has_labels(
  'provenance_type',
  array['past_paper', 'past_paper_adapted', 'original_authored', 'ai_variant', 'ai_authored', 'legacy_import']
);

select has_enum('rights_status');
select enum_has_labels(
  'rights_status',
  array['edmar_owned', 'licensed', 'public_domain', 'third_party_unlicensed', 'unknown']
);

select has_enum('content_status');
select enum_has_labels(
  'content_status',
  array[
    'draft', 'pending_validation', 'validating', 'pending_review', 'changes_requested',
    'approved', 'published', 'suspended', 'retired', 'rejected', 'archived'
  ]
);

select has_enum('review_decision');
select enum_has_labels(
  'review_decision',
  array['approved', 'changes_requested', 'rejected', 'suspended', 'escalated']
);

select has_enum('profile_dimension');
select enum_has_labels('profile_dimension', array['CK', 'AK', 'R']);

select has_enum('paper_code');
select enum_has_labels('paper_code', array['01', '02', '031', '032']);

select has_enum('sitting_month');
select enum_has_labels('sitting_month', array['january', 'may_june']);

select has_enum('practice_mode');
select enum_has_labels(
  'practice_mode',
  array['topic', 'recommended', 'weak_areas', 'diagnostic', 'bookmarks', 'incorrect']
);

select has_enum('session_status');
select enum_has_labels('session_status', array['in_progress', 'completed', 'abandoned', 'expired']);

select has_enum('exam_mode');
select enum_has_labels('exam_mode', array['practice', 'timed']);

select has_enum('entitlement_tier');
select enum_has_labels('entitlement_tier', array['free', 'premium']);

select has_enum('entitlement_source');
select enum_has_labels(
  'entitlement_source',
  array['default', 'google_play', 'apple', 'promo', 'school', 'manual']
);

select has_enum('entitlement_status');
select enum_has_labels(
  'entitlement_status',
  array['active', 'grace', 'on_hold', 'expired', 'cancelled', 'refunded']
);

select has_enum('job_status');
select enum_has_labels('job_status', array['queued', 'running', 'succeeded', 'failed', 'cancelled']);

select has_enum('asset_role');
select enum_has_labels('asset_role', array['question_figure', 'solution_figure', 'option_figure']);

select has_function('trg_set_updated_at');

select * from finish();

rollback;
