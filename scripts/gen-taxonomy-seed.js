#!/usr/bin/env node
// Generates supabase/seed/02_topics.sql (topics portion) and
// supabase/seed/03_specific_objectives.sql from
// content/taxonomy/csec_2027_taxonomy_seed.json — the human-verified,
// PDF-extracted V2027 taxonomy (Technical Build Spec §0.3, §3.3).
//
// Deterministic transform only: no content is invented here. The per-topic
// Paper 01 item counts and Paper 02 mark shares in TOPIC_ASSESSMENT below are
// transcribed from the spec's own Assessment Grid table (§0.3), not derived
// or guessed. The one non-integer group split (Number Theory and Computation
// + Consumer Arithmetic sharing 9 marks) is left NULL — see
// [CXC-DISCREPANCY-02] in docs/PROJECT_INSTRUCTIONS.md.
//
// Usage: node scripts/gen-taxonomy-seed.js
// Re-run after a curriculum reviewer edits csec_2027_taxonomy_seed.json
// (e.g. once the 44 needs_human_review objectives are cleared) to regenerate
// 03_specific_objectives.sql with the corrected text.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const SEED_JSON_PATH = path.join(ROOT, "content/taxonomy/csec_2027_taxonomy_seed.json");
const TOPICS_OUT_PATH = path.join(ROOT, "supabase/seed/02_topics.sql");
const OBJECTIVES_OUT_PATH = path.join(ROOT, "supabase/seed/03_specific_objectives.sql");

// §0.3 "Official topic structure (V2027)" table — Paper 01 items and Paper 02
// marks per topic. Keyed by `${module_no}.${topic_no}`.
const TOPIC_ASSESSMENT = {
  1.1: {
    paper01Items: 4,
    paper02MarksGroup: "Number Theory and Computation, Consumer Arithmetic (9 marks combined)",
    paper02Marks: null, // 9 marks / 2 topics does not divide evenly — see [CXC-DISCREPANCY-02]
  },
  1.2: {
    paper01Items: 4,
    paper02MarksGroup: "Number Theory and Computation, Consumer Arithmetic (9 marks combined)",
    paper02Marks: null,
  },
  1.3: {
    paper01Items: 3,
    paper02MarksGroup: "Introduction to Graphs, Sets, Measurement, Algebra 1 (12 marks combined)",
    paper02Marks: 3,
  },
  1.4: {
    paper01Items: 4,
    paper02MarksGroup: "Introduction to Graphs, Sets, Measurement, Algebra 1 (12 marks combined)",
    paper02Marks: 3,
  },
  1.5: {
    paper01Items: 3,
    paper02MarksGroup: "Introduction to Graphs, Sets, Measurement, Algebra 1 (12 marks combined)",
    paper02Marks: 3,
  },
  1.6: {
    paper01Items: 2,
    paper02MarksGroup: "Introduction to Graphs, Sets, Measurement, Algebra 1 (12 marks combined)",
    paper02Marks: 3,
  },
  2.1: { paper01Items: 4, paper02MarksGroup: null, paper02Marks: 6 },
  2.2: {
    paper01Items: 4,
    paper02MarksGroup: "Algebra 2, Relations Functions and Graphs 1 (12 marks combined)",
    paper02Marks: 6,
  },
  2.3: {
    paper01Items: 4,
    paper02MarksGroup: "Algebra 2, Relations Functions and Graphs 1 (12 marks combined)",
    paper02Marks: 6,
  },
  2.4: { paper01Items: 4, paper02MarksGroup: null, paper02Marks: 9 },
  2.5: { paper01Items: 4, paper02MarksGroup: null, paper02Marks: 3 },
  3.1: { paper01Items: 4, paper02MarksGroup: null, paper02Marks: 6 },
  3.2: { paper01Items: 6, paper02MarksGroup: null, paper02Marks: 6 },
  3.3: { paper01Items: 6, paper02MarksGroup: null, paper02Marks: 9 },
  3.4: { paper01Items: 4, paper02MarksGroup: null, paper02Marks: 9 },
};

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlBool(value) {
  return value ? "true" : "false";
}

function main() {
  const seed = JSON.parse(fs.readFileSync(SEED_JSON_PATH, "utf8"));
  const syllabusCode = seed.syllabus_version;

  if (seed.modules.length !== 3) {
    throw new Error(`Expected 3 modules, found ${seed.modules.length}`);
  }
  if (seed.topics.length !== 15) {
    throw new Error(`Expected 15 topics, found ${seed.topics.length}`);
  }
  if (seed.specific_objectives.length !== 159) {
    throw new Error(`Expected 159 specific objectives, found ${seed.specific_objectives.length}`);
  }

  // -- 02_topics.sql -----------------------------------------------------
  const moduleRows = seed.modules
    .map(
      (m) =>
        `  (${sqlString(syllabusCode)}, ${m.module_no}, ${sqlString(m.name)}, 20, 30, 100, 65)`,
    )
    .join(",\n");

  let sequence = 0;
  const topicRows = seed.topics
    .map((t) => {
      sequence += 1;
      const key = `${t.module_no}.${t.topic_no}`;
      const assessment = TOPIC_ASSESSMENT[key];
      if (!assessment) throw new Error(`No §0.3 assessment data for topic ${key} (${t.name})`);
      const code = `M${t.module_no}-T${t.topic_no}`;
      return (
        `  (${sqlString(syllabusCode)}, ` +
        `(select id from modules where syllabus_code = ${sqlString(syllabusCode)} and module_no = ${t.module_no}), ` +
        `${t.topic_no}, ${sqlString(code)}, ${sqlString(t.name)}, ${sequence}, ` +
        `${assessment.paper01Items}, ${sqlString(assessment.paper02MarksGroup)}, ` +
        `${assessment.paper02Marks === null ? "null" : assessment.paper02Marks})`
      );
    })
    .join(",\n");

  const topicsSql = `-- Generated by scripts/gen-taxonomy-seed.js from
-- content/taxonomy/csec_2027_taxonomy_seed.json. Do not hand-edit — re-run
-- the generator instead.

insert into modules (syllabus_code, module_no, name, paper01_items, paper02_marks, weighted_marks, duration_hours)
values
${moduleRows};

insert into topics (
  syllabus_code, module_id, topic_no, code, name, sequence,
  paper01_items, paper02_marks_group, paper02_marks
)
values
${topicRows};
`;

  fs.writeFileSync(TOPICS_OUT_PATH, topicsSql);

  // -- 03_specific_objectives.sql -----------------------------------------
  let objSequence = 0;
  const objectiveRows = seed.specific_objectives
    .map((o) => {
      objSequence += 1;
      const topicCode = `M${o.module}-T${o.topic_no}`;
      return (
        `  (${sqlString(syllabusCode)}, ` +
        `(select id from topics where syllabus_code = ${sqlString(syllabusCode)} and code = ${sqlString(topicCode)}), ` +
        `${sqlString(o.code)}, ${o.obj_no}, ${sqlString(o.text)}, ${sqlBool(o.needs_human_review)}, ${objSequence})`
      );
    })
    .join(",\n");

  const objectivesSql = `-- Generated by scripts/gen-taxonomy-seed.js from
-- content/taxonomy/csec_2027_taxonomy_seed.json. Do not hand-edit — re-run
-- the generator instead (e.g. after a curriculum reviewer clears the 44
-- needs_human_review objectives — §0.3, P04 human task).

insert into specific_objectives (
  syllabus_code, topic_id, code, objective_no, statement, needs_human_review, sequence
)
values
${objectiveRows};
`;

  fs.writeFileSync(OBJECTIVES_OUT_PATH, objectivesSql);

  const flaggedCount = seed.specific_objectives.filter((o) => o.needs_human_review).length;
  console.log(`Wrote ${TOPICS_OUT_PATH}`);
  console.log(`Wrote ${OBJECTIVES_OUT_PATH}`);
  console.log(`3 modules, 15 topics, 159 objectives (${flaggedCount} flagged needs_human_review).`);
}

main();
