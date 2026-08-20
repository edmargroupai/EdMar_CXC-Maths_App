-- §0.3 / §3.3. Only V2027 is seeded — U-02 recommends V2018 support be
-- deferred (no V2018 topic/objective data has been extracted). The
-- syllabus_code enum already carries 'V2018' so adding it later needs no
-- schema change, only a second row here plus its own taxonomy seed.

insert into subjects (code, name, is_active, sequence)
values ('CSEC_MATH', 'CSEC Mathematics', true, 0);

insert into syllabus_versions (
  code, subject_code, official_code, effective_from_year, effective_from_month,
  has_modules, is_default, source_document
)
values (
  'V2027', 'CSEC_MATH', 'CXC 05/G/SYLL 16', 2027, 'may_june',
  true, true, 'CSEC_Mathematics_Syllabus_2027.pdf'
);
