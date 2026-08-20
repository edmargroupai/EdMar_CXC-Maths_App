-- P04 acceptance: "seed applies; counts match [3 modules, 15 topics, 159
-- objectives]". Also asserts the tables from §3.3 exist and the taxonomy is
-- internally consistent (every topic belongs to a module, every objective
-- to a topic, no orphaned assessment weights).
begin;

select plan(19);

-- Tables exist (§3.3).
select has_table('subjects');
select has_table('syllabus_versions');
select has_table('modules');
select has_table('topics');
select has_table('subtopics');
select has_table('specific_objectives');
select has_table('skills');
select has_table('skill_prerequisites');
select has_table('skill_objectives');
select has_table('objective_mappings');

-- Seed counts (§0.3 / P04 accept criteria).
select is((select count(*)::int from modules where syllabus_code = 'V2027'), 3, '3 V2027 modules seeded');
select is((select count(*)::int from topics where syllabus_code = 'V2027'), 15, '15 V2027 topics seeded');
select is(
  (select count(*)::int from specific_objectives where syllabus_code = 'V2027'),
  159,
  '159 V2027 specific objectives seeded'
);

-- The human-review gate this phase exists to close (§0.3, Appendix B):
-- currently 44 flagged, 115 clear. P05 must not begin while this is nonzero.
select is(
  (select count(*)::int from specific_objectives where needs_human_review),
  44,
  '44 objectives currently flagged needs_human_review — must reach 0 before P05'
);

-- Referential integrity: every topic resolves to a module (V2027 has_modules
-- = true, so module_id must never be null here); every objective to a topic.
select is(
  (select count(*)::int from topics where syllabus_code = 'V2027' and module_id is null),
  0,
  'no V2027 topic is missing its module_id'
);
select is(
  (
    select count(*)::int
    from specific_objectives so
    left join topics t on t.id = so.topic_id
    where so.syllabus_code = 'V2027' and t.id is null
  ),
  0,
  'every specific_objective resolves to a real topic'
);

-- Paper 01 item counts sum to 60 across the whole syllabus (§0.3 Assessment
-- Grid: 60 MCQ items total).
select is(
  (select coalesce(sum(paper01_items), 0)::int from topics where syllabus_code = 'V2027'),
  60,
  'topic paper01_items sum to 60 across V2027'
);

-- trg_skill_prereq_acyclic: a skill may never (transitively) be its own
-- prerequisite.
select lives_ok(
  $$
    insert into skills (id, code, name) values
      ('aaaaaaaa-0000-0000-0000-000000000001', 'PGTAP_TEST_A', 'pgTAP test skill A'),
      ('aaaaaaaa-0000-0000-0000-000000000002', 'PGTAP_TEST_B', 'pgTAP test skill B');
    insert into skill_prerequisites (skill_id, prerequisite_skill_id)
      values ('aaaaaaaa-0000-0000-0000-000000000001', 'aaaaaaaa-0000-0000-0000-000000000002');
  $$,
  'a straight-line skill_prerequisites edge (A depends on B) is allowed'
);
select throws_ok(
  $$
    insert into skill_prerequisites (skill_id, prerequisite_skill_id)
      values ('aaaaaaaa-0000-0000-0000-000000000002', 'aaaaaaaa-0000-0000-0000-000000000001')
  $$,
  'P0001',
  'skill_prerequisites: cycle detected for skill aaaaaaaa-0000-0000-0000-000000000002',
  'closing the loop (B depends on A) is rejected by trg_skill_prereq_acyclic'
);

select * from finish();

rollback;
