-- P07 acceptance: "RLS enabled on all 45 tables (asserted by a catalogue
-- query)." This is the criterion the spec says the phase does NOT complete
-- without — proven by an actual system-catalogue query, not by trusting
-- that every ALTER TABLE in 0005_rls.sql was written correctly.
begin;

select plan(2);

select is(
  (select count(*)::int from pg_tables where schemaname = 'public'),
  45,
  'exactly 45 tables in the public schema'
);

select is(
  (select count(*)::int from pg_tables where schemaname = 'public' and not rowsecurity),
  0,
  'zero public tables without RLS enabled — none were missed'
);

select * from finish();

rollback;
