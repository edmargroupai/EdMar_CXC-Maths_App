# EdMar CXC Mathematics — MASTER BLUEPRINT

**Document type:** Product & System Master Blueprint (pre-implementation)
**Phase:** Blueprint / Architecture. **No application code is contained in this document.**
**Prepared for:** EdMar Group
**Version:** 1.0
**Date:** 19 August 2026
**Downstream consumer:** An engineering agent that will convert this into a Technical Build Specification, then implement in Cursor.

---

## 0. HOW TO READ THIS DOCUMENT

### 0.1 Required-output cross-reference

The brief requested seventeen final outputs and twenty-three lettered sections. They are the same material organised two ways. This table maps one onto the other so nothing is assumed missing.

| #   | Required final output          | Where it lives             |
| --- | ------------------------------ | -------------------------- |
| 1   | Executive Summary              | §1                         |
| 2   | Complete Product Blueprint     | §A–§W (the whole document) |
| 3   | System Conceptual Architecture | §2                         |
| 4   | Feature Matrix                 | §D.6                       |
| 5   | User Journeys                  | §C                         |
| 6   | Question Engine Architecture   | §E                         |
| 7   | Content Architecture           | §F, §G, §H                 |
| 8   | AI Architecture                | §K, §L                     |
| 9   | Admin Architecture             | §M                         |
| 10  | Subscription Architecture      | §N                         |
| 11  | Security Architecture          | §O                         |
| 12  | Analytics Architecture         | §Q                         |
| 13  | MVP Scope                      | §T                         |
| 14  | Development Roadmap            | §S                         |
| 15  | Risk Register                  | §V                         |
| 16  | Definition of Done             | §W                         |
| 17  | Recommended next steps         | §X                         |

### 0.2 Status of source material

The brief refers to an existing JSON knowledge base of CSEC Mathematics past-paper content and to supplied CXC curriculum material. **Neither was available to this session.** No files were attached and no folder was connected.

The blueprint therefore proceeds on the basis agreed with the product owner: design against the _published, verifiable_ CXC syllabus structure (retrieved and cited below), and design the content model so the existing JSON can be migrated into it once inspected. Places where the real JSON must be examined before a decision is finalised are marked **[VERIFY-JSON]** inline, and the full list of fourteen specific things to check is collected in §X.2 as a single Phase 0 work item.

This is a design constraint, not a defect. The canonical model in §G is deliberately specified as a _target_ schema with an explicit migration contract (§G.9), which is the correct shape regardless of what the legacy JSON turns out to contain.

### 0.3 Assumptions register

Every non-obvious assumption is listed here. An assumption that later proves wrong should be traced back to this table rather than discovered in code.

| ID   | Assumption                                                                                                                             | Confidence       | Impact if wrong                                            | Verify by                                                             |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------------- | --------------------------------------------------------------------- |
| A-01 | EdMar has, or can obtain, a lawful basis to reproduce CXC past-paper questions, **or** will pivot to original past-paper-_style_ items | Low — unresolved | Existential. See R-01                                      | Legal opinion / CXC licensing enquiry, before any content publication |
| A-02 | The legacy JSON contains per-question worked solutions in LaTeX of usable quality                                                      | Medium           | Rework of ingestion pipeline; higher AI spend              | [VERIFY-JSON]                                                         |
| A-03 | Target students have Android devices with intermittent but real connectivity                                                           | High             | Offline architecture (§E.9) becomes more or less important | Market research in Phase 0                                            |
| A-04 | US$4/month is payable via Google Play billing in target territories                                                                    | Medium           | Payment architecture changes materially                    | Google Play merchant availability check per territory                 |
| A-05 | Initial market is Jamaica, then wider CARICOM                                                                                          | High             | Localisation and currency assumptions                      | Product owner confirmation                                            |
| A-06 | EdMar has an existing brand direction (logo, palette, type)                                                                            | Medium           | §P.9 must be re-specified                                  | Request brand assets                                                  |
| A-07 | No student under 13 will be accepted without parental consent flow                                                                     | High             | Legal exposure; app-store rejection                        | Policy decision in Phase 0                                            |
| A-08 | Content authoring capacity of at least one qualified CSEC Mathematics teacher-reviewer is available                                    | High             | The whole human-review gate (§K.7) is unstaffable          | Hiring / contracting decision                                         |

### 0.4 Verified CXC facts used in this blueprint

These were retrieved from CXC's own published syllabus documents during preparation. They are cited so the engineering agent does not re-derive them, and so that anything CXC changes can be re-checked against a known baseline.

**There are two live syllabus versions. This is the single most important content-architecture fact in this document.**

**Syllabus V2018** — _effective for examinations from May–June 2018_. Governs examinations up to and including 2026. Nine sections, in order:

1. Number Theory and Computation
2. Consumer Arithmetic
3. Sets
4. Measurement
5. Statistics
6. Algebra
7. Relations, Functions and Graphs
8. Geometry and Trigonometry
9. Vectors and Matrices

Assessment: Paper 01 — 60 multiple-choice items, 1 hour 30 minutes, 60 marks, 30% of total. Paper 02 — 10 compulsory structured questions including one investigation question, 2 hours 40 minutes, 100 marks, 50%. Paper 03/1 — School-Based Assessment project, 20 marks, 20%. Paper 03/2 — alternative for private candidates, 1 hour, 2 compulsory questions, 20 marks.

**Syllabus V2027** — _effective for examinations from May–June 2027_. A structural redesign into three modules:

- **Module 1 — Fundamentals of Secondary Level Mathematics:** Number Theory and Computation; Consumer Arithmetic; Sets; Measurement; Algebra 1; Introduction to Graphs
- **Module 2 — Intermediate Secondary Level Mathematics:** Statistics 1; Algebra 2; Relations, Functions and Graphs 1; Geometry and Trigonometry 1; Vectors and Matrices 1
- **Module 3 — Higher Concepts in Secondary Level Mathematics:** Statistics 2; Relations, Functions and Graphs 2; Geometry and Trigonometry 2; Vectors and Matrices 2

Assessment: Paper 01 — 60 multiple-choice questions, 20 per module, 1 hour 30 minutes. Paper 02 — nine compulsory structured questions, three per module, 2 hours 30 minutes. Paper 031 — School-Based Assessment project (groups of no more than six candidates). Paper 032 — alternative for private candidates, 1 hour, three optional questions, one per module. Modular entry options exist for candidates sitting one or two modules.

Profile dimensions (both versions, reported per candidate): **Conceptual Knowledge (CK) 30%**, **Algorithmic Knowledge (AK) 40%**, **Reasoning (R) 30%**. The V2018 document labels the first two "Knowledge" and "Comprehension" in its weighting grid; the V2027 document uses CK/AK/R throughout.

Each syllabus section is internally structured as: General Objectives → Specific Objectives → Content/Explanatory Notes → Suggested Teaching and Learning Activities. **The Specific Objective is the atomic, officially-numbered unit of the CXC curriculum, and it is the anchor point for EdMar's entire taxonomy (§F).**

> **Note on exact mark weightings.** The published weighting grids were read via automated extraction and returned mutually inconsistent weighted-mark totals for Paper 01 (30 vs 90 weighted marks against a 300-mark total). The _percentages_ (30/50/20) are consistent across sources and are what the product needs. Before any feature displays weighted marks to a student, a human must read the assessment grid in the official PDF directly. Marked **[VERIFY-CXC-01]**.

> **Non-affiliation.** CXC®, CSEC® and CAPE® are trade marks of the Caribbean Examinations Council. EdMar is not affiliated with, endorsed by, or approved by CXC. Every surface of the product — store listing, splash, about screen, marketing site — must carry a non-affiliation disclaimer. See §V R-02.

---

## 1. EXECUTIVE SUMMARY

### 1.1 What is being built

EdMar CXC Mathematics is a mobile examination-preparation application for Caribbean secondary students sitting CSEC Mathematics. It is a **structured practice engine**, not a chatbot. A student picks a topic, receives a syllabus-aligned question, works it out themselves, submits an answer, and immediately receives: a correct/incorrect verdict, the correct answer, a step-by-step worked solution, and a plain-language explanation of _why_. Every attempt updates a per-skill mastery model that drives what the student is offered next.

### 1.2 The central architectural decision

**AI is a factory, not a fixture.**

All artificial intelligence in this system operates _behind the product_, in batch, at content-build time — extracting questions from source documents, classifying them against the syllabus, drafting worked solutions and explanations, proposing question variants, and flagging duplicates. Every AI output passes through deterministic mathematical validation and then a human subject-matter reviewer before it is ever published.

At runtime, when a student taps CHECK ANSWER, **no AI is invoked**. The answer is validated deterministically against a pre-computed accepted-answer specification stored with the question. The solution and explanation are pre-written text already sitting in the database. The response is instant, works on a poor connection, is identical for every student who sees that question, and costs nothing per attempt.

This is not merely a cost optimisation, though the economics are decisive (§1.4). It is a _correctness_ decision. Mathematics has right answers. A system that regenerates an explanation on every attempt is a system that can produce a different — and sometimes wrong — explanation on every attempt, with no reviewable audit trail. A system that serves a reviewed, frozen, human-approved explanation is one whose quality can be measured, corrected, and guaranteed.

### 1.3 The content problem is the real problem

Software for this product is well-understood: React Native, Supabase, Postgres, standard authentication, standard subscriptions. None of it is hard. **The difficulty, the cost, the risk and the defensibility all live in the question bank.**

A CSEC Mathematics practice app is only as good as the accuracy of its worked solutions and the fidelity of its syllabus mapping. A single wrong worked solution, screenshotted and shared in a WhatsApp group of Fifth Formers, does more reputational damage than a month of downtime. Accordingly, this blueprint devotes its centre of gravity — §E, §F, §G, §I, §K — to how questions are modelled, mapped, validated, reviewed and retired, and treats the app itself as the comparatively simple delivery layer that it is.

### 1.4 Why the economics work

At US$4/month, with Google Play taking 15% on the first US$1M of annual revenue, net revenue per subscriber is approximately US$3.40/month before local taxes.

The load-bearing question is whether _per-student marginal cost_ stays near zero. Under this architecture it does: a student attempt is one database write and one cached read. Fixed infrastructure (Supabase Pro, Vercel, storage/CDN) is roughly US$50–150/month across the whole service until well past 10,000 students.

The counterfactual is instructive. If the product instead called a language model once per attempt at a conservative US$0.01, an ordinary student doing 5 questions a day would incur about US$1.50/month in AI cost — roughly **44% of net revenue**, consumed by a variable cost that grows precisely in line with the engagement the business wants to encourage. That architecture cannot be made to work at this price point. The one specified here can: gross margin above 90% is achievable from a few hundred subscribers upward.

AI spend becomes, in effect, a capital expenditure on the content library: a one-time-per-question cost, amortised across every student who ever sees that question, and falling toward zero per student as the base grows.

### 1.5 What must be true for this to succeed

Four things, in order of how likely they are to kill the product:

1. **Content rights are resolved.** CXC past papers are copyrighted. Reproducing them verbatim at commercial scale without a licence is infringement, and it is the risk most likely to end this product. §V R-01 sets out the decision and the fallback (original syllabus-aligned items).
2. **Mathematical accuracy is systematically enforced**, not hoped for. §I and §K.6 specify the deterministic validation gates.
3. **Dual-syllabus support is built in from day one.** A student sitting in 2026 needs V2018; a student sitting in 2027 needs V2027's modular structure. Retrofitting this later means re-tagging the entire question bank. §F.6.
4. **Students actually return.** A practice app is worthless if it is opened twice. §J's mastery loop and §D's retention features exist for this reason, and §Q measures it honestly.

### 1.6 MVP in one paragraph

Android only. Email and Google sign-in. The nine V2018 syllabus sections, tagged additionally to V2027 modules. A reviewed bank of at least 1,200 questions with worked solutions. Topic practice with a 10-question session. Deterministic answer checking for multiple-choice and numeric/fraction answers. Worked solution and explanation screens. Session results. A simple progress screen showing per-topic mastery. Free tier limited by daily question count; premium unlocks the bank. Admin web console for question review and publication. Nothing else. §T draws the boundary precisely, including an explicit exclusion list.

---

## 2. SYSTEM CONCEPTUAL ARCHITECTURE

### 2.1 The three planes

The system separates cleanly into three planes with deliberately narrow interfaces. Understanding this separation is sufficient to understand the whole architecture.

```
┌──────────────────────────────────────────────────────────────────────────┐
│  PLANE 1 — CONTENT FACTORY          (offline · batch · AI-heavy)         │
│                                                                          │
│   Source documents ──► Extraction ──► Question candidates                │
│        │                                     │                           │
│        │                                     ▼                           │
│        │                            Classification &                     │
│        │                            curriculum mapping                   │
│        │                                     │                           │
│        │                                     ▼                           │
│        │                        Solution + explanation drafting          │
│        │                                     │                           │
│        │                                     ▼                           │
│        │                     ┌───────────────────────────┐               │
│        │                     │ DETERMINISTIC VALIDATION  │  (no AI)      │
│        │                     │ CAS · numeric · LaTeX     │               │
│        │                     │ lint · schema · duplicate │               │
│        │                     └───────────────────────────┘               │
│        │                                     │                           │
│        │                                     ▼                           │
│        │                     ┌───────────────────────────┐               │
│        └────────────────────►│   HUMAN REVIEW GATE       │               │
│           (audit trail)      │   qualified SME approval  │               │
│                              └───────────────────────────┘               │
│                                              │                           │
│                                       APPROVED / PUBLISHED               │
└──────────────────────────────────────────────┼───────────────────────────┘
                                               │
                                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  PLANE 2 — CANONICAL STORE          (Supabase · Postgres · Storage)      │
│                                                                          │
│   curriculum taxonomy · question bank · accepted-answer specs ·          │
│   worked solutions · explanations · diagrams · papers ·                  │
│   student identities · attempts · mastery state · entitlements ·         │
│   audit log                                                              │
│                                                                          │
│   Row Level Security is the primary authorisation boundary.              │
└──────────────────────────────────────────────┬───────────────────────────┘
                                               │
                       ┌───────────────────────┴────────────────────┐
                       ▼                                            ▼
┌────────────────────────────────────────┐   ┌────────────────────────────────┐
│  PLANE 3a — STUDENT APP                │   │  PLANE 3b — ADMIN CONSOLE      │
│  React Native · Expo · TypeScript      │   │  Next.js · TypeScript · Vercel │
│                                        │   │                                │
│  · Reads published content only        │   │  · Review queue                │
│  · Writes attempts only                │   │  · Question editor             │
│  · DETERMINISTIC answer checking       │   │  · Curriculum management       │
│    ON DEVICE — no network round trip   │   │  · Publication control         │
│  · Local cache of active topic         │   │  · Analytics · audit           │
│  · NO AI CALLS. EVER.                  │   │  · Triggers factory batches    │
└────────────────────────────────────────┘   └────────────────────────────────┘
```

### 2.2 The rules that hold the architecture together

Five invariants. An engineering agent should treat a violation of any of them as a design bug, not a trade-off.

**I-1 — No AI on the student path.** No screen a student can reach may cause a language-model call, directly or transitively. Enforced by network policy (the mobile client holds no AI credentials and no route to one) and by a CI check that the mobile bundle imports no AI SDK.

**I-2 — Nothing reaches a student unapproved.** The student app reads only rows whose status is `published`. Enforced in Row Level Security, not application logic, so that a client bug cannot leak draft or AI-unreviewed content.

**I-3 — Answer checking is deterministic and local.** Correctness is decided by evaluating the student's input against a pre-computed accepted-answer specification (§I). It runs on-device, so it works offline and returns in milliseconds. The server re-derives correctness when the attempt syncs, and the server value is authoritative for progress.

**I-4 — Content is immutable once published; corrections are versions.** A published question is never edited in place. A correction creates a new version and retires the old one, preserving the attempt history's meaning. §E.11.

**I-5 — Every AI-touched artefact carries provenance.** Which model, which prompt version, which run, which reviewer approved it, and when. Non-negotiable for quality forensics and for the "was this written by a machine" question that schools and parents will eventually ask.

### 2.3 Request paths in words

**Student practises a topic.** App requests a practice session for a skill set → selection service (a Postgres function, §E.4) returns N question IDs honouring cooldown, difficulty targeting and entitlement → app fetches those question payloads, cached where already held → student answers → device evaluates against accepted-answer spec → verdict shown instantly with the stored solution and explanation → attempt queued locally → synced → server recomputes mastery.

**Admin publishes a question.** Admin opens the review queue → sees the item with its AI provenance, its validation report and its proposed curriculum mapping → edits if necessary → approves → status transitions to `published` → the change is written to the audit log → the content version counter increments, which is how clients know their cache is stale.

**Content batch runs.** Admin uploads a source document → a background job (Edge Function or scheduled worker) extracts candidates → classification and drafting run against the AI provider → deterministic validators run → duplicate detection runs → survivors land in the review queue as `pending_review`. No student is affected at any point in this process.

---

## SECTION A — PRODUCT VISION

### A.1 Product name

Working name: **EdMar Maths** (store listing: _EdMar Maths — CSEC Mathematics Practice_).

Naming constraints that must be respected: the name must not imply CXC endorsement, must not use "CXC" or "CSEC" as the _leading_ element of the app name (trade-mark exposure), and should read naturally to a Caribbean fifteen-year-old. Descriptive use of "CSEC Mathematics" in the subtitle is defensible; "CSEC Maths Official" is not. Final name is a Phase 0 decision. Placeholder used throughout this document: **EdMar Maths**.

### A.2 Purpose

To give every Caribbean student sitting CSEC Mathematics access to unlimited, correctly-worked, syllabus-aligned practice with an explanation for every question — at a price a student can pay themselves.

### A.3 The problem

CSEC Mathematics is a gatekeeper subject across the Caribbean. It is required for matriculation into most tertiary programmes and for a large share of entry-level employment. Regional pass rates have long been a subject of public concern, and the constraint is rarely that students do not work — it is the structure of the help available to them:

- **Practice without feedback.** A student can obtain past papers easily. What is scarce is a _correct worked solution_ at the moment of not understanding. Mark schemes give the answer, not the method. A student who gets 14 wrong and cannot see why has learned that they are bad at mathematics, which is the opposite of what was intended.
- **Feedback is priced as a scarce human service.** Private tuition in the region typically runs from roughly US$10 to US$30 per hour. A student needing sustained support needs many hours. Most families cannot buy them, and the students who most need help are systematically the ones least able to.
- **Free material is unstructured.** YouTube and shared PDFs exist in abundance but are not mapped to the syllabus, not sequenced, and not responsive to what a given student keeps getting wrong. The student must already know what they don't know in order to search for it — a well-known bootstrapping failure.
- **Nothing keeps score.** Almost nothing in a student's revision tells them, concretely, _"you are strong on Consumer Arithmetic and weak on Vectors, and here are twelve questions on the specific thing you keep missing."_
- **A syllabus change is arriving.** The V2027 syllabus restructures the subject into three modules with modular entry options. Existing material, teacher notes and revision books will lag. This is a genuine opening for a product whose taxonomy is version-aware from the start.

### A.4 Target users

**Primary user — the CSEC Mathematics candidate.** Typically 14–18, in Fourth or Fifth Form, sitting the examination in May–June (with a smaller January cohort). Owns or shares an Android phone. Data is metered and sometimes tight. Studies in bursts, heavily concentrated in the ten weeks before the examination. Motivated by a grade, not by mathematics. Has limited patience for anything that is slow, confusing, or feels like a toy.

A secondary strand of the same user: the **resit candidate** — often older, often out of school, often self-funding, frequently the most motivated user in the base and the most willing to pay. Do not design them out.

**Secondary users:**

- **Parents and guardians**, who in practice are the payer for a meaningful share of subscriptions and who need a reason to believe the money is doing something. They are not a _user_ of the practice loop in MVP but are a purchaser and a churn factor.
- **Teachers**, who influence adoption enormously — a teacher recommending an app to a class of thirty is the highest-leverage acquisition channel available — and who become a direct user in V2 via class/school features.
- **Schools**, as a licensing customer in the future roadmap (§U), not in MVP.
- **EdMar content administrators and reviewers**, who are internal users of the admin console (§M) and whose throughput is the binding constraint on content growth.

### A.5 Geographic market and expansion

**Phase 1 — Jamaica.** Largest single CSEC candidate cohort, English-speaking, high Android penetration, and EdMar's home market. Launch here, learn here.

**Phase 2 — the wider CARICOM CSEC market:** Trinidad and Tobago, Barbados, Guyana, and the OECS territories (Antigua and Barbuda, Dominica, Grenada, St Kitts and Nevis, Saint Lucia, St Vincent and the Grenadines), plus Belize, The Bahamas, Suriname's anglophone cohort and the British Overseas Territories that sit CSEC.

**Why expansion is architecturally cheap here:** CSEC is a _regional_ examination. The syllabus is identical across territories. Unlike a national-curriculum product, EdMar does not need to rebuild its content library per market. What changes per territory is: currency presentation, payment rails, examination-session calendar, and marketing. That is a thin layer.

**What must be built now to make it cheap later:** a `territory` attribute on the student profile from day one (cheap now, painful to backfill); currency display driven by locale rather than hard-coded to JMD or USD; and no assumption anywhere in the codebase that there is exactly one examination sitting per year.

**Diaspora.** A non-trivial number of candidates sit CSEC from the US, Canada and the UK. They pay in hard currency, and they are reachable through the same store listing at zero marginal cost. Do not geo-restrict.

### A.6 Value proposition

> _Every CSEC Mathematics question you can't do, worked out properly, for less than the price of a patty a week._

For the student: unlimited syllabus-aligned practice, a correct worked solution for every single question, an explanation written for a student rather than a marker, and an honest picture of which topics will cost them marks.

For the parent: a defensible, cheap, visible intervention — with progress they can see.

For the teacher: a way to set structured practice without marking it.

### A.7 Competitive positioning

The realistic competitive set, and where EdMar sits against each:

| Competitor type                              | What they do well              | Where they fail the CSEC student                                                                                                                         | EdMar's position                                                                        |
| -------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Free PDFs / past paper sites                 | Free, abundant, authentic      | No solutions, no structure, no feedback, no tracking                                                                                                     | EdMar supplies exactly what is missing: the worked solution and the tracking            |
| YouTube tutors                               | Free, human, often excellent   | Passive, unsearchable by weakness, no practice, no record                                                                                                | EdMar is active practice, not watching                                                  |
| General AI chatbots                          | Free or cheap, answer anything | Confidently wrong on mathematics; not syllabus-mapped; teach the student to ask rather than to work; no progress model                                   | EdMar is reviewed, syllabus-mapped, and deliberately makes the student attempt first    |
| International EdTech (Khan, Photomath, etc.) | Polished, well-funded          | Not CSEC-aligned; wrong curriculum, wrong notation conventions, wrong exam technique; Photomath in particular _removes_ the work rather than teaching it | EdMar is regionally specific — the thing global platforms structurally will not build   |
| Private tutors                               | Highest quality, personal      | US$10–30/hour; unavailable at 11pm the night before                                                                                                      | EdMar is not a substitute for a good tutor; it is the practice a tutor cannot supervise |
| Regional CSEC apps                           | Same market, same alignment    | Typically thin content, unreviewed solutions, poor mathematical typesetting, abandoned                                                                   | EdMar's moat is content depth and _verified_ accuracy — see A.9                         |

**The honest strategic read:** the barrier to entry on the _software_ is near zero. Anyone can ship a quiz app. The barrier on a **reviewed, syllabus-mapped, mathematically-verified question bank with worked solutions** is high, slow and compounding. That is the asset. Build the app to be adequate and the bank to be excellent.

### A.8 Why a student pays US$4/month

Four reasons, in descending order of persuasiveness:

1. **Price anchoring against tuition.** One hour of tuition costs two to seven months of EdMar. The comparison makes itself.
2. **The unlock is specific and immediate.** The free tier gives real value but rations it. A student in April who has hit the daily limit and has an examination in six weeks converts readily, because the thing being withheld is the thing they need right now.
3. **It is a self-purchasable amount.** US$4 is inside a student's own discretionary range in much of the region. Products priced at US$15 require a parental conversation; products at US$4 often do not. This materially raises conversion.
4. **The progress screen creates ownership.** A student who has built up 60% mastery across eleven topics has a sunk investment they can see. This is the retention mechanism, and it is why §J is a core section rather than a nice-to-have.

**Where the objection will come from:** seasonality. Students churn hard in July after the examination. Plan for it (§N.7) — do not treat it as a failure.

### A.9 Core differentiators

1. **Verified mathematical accuracy.** Every published solution has passed deterministic validation and human SME approval, with an audit trail. This is a claim EdMar can make truthfully and competitors mostly cannot.
2. **True syllabus mapping to the Specific Objective.** Not "Algebra" — _Section 6, Specific Objective 12_. This is what makes recommendation meaningful and what makes teacher adoption possible.
3. **Dual-syllabus readiness (V2018 and V2027).** A structural advantage over every incumbent's back catalogue for the next two years.
4. **Explanation quality as the product.** Most competitors treat the explanation as an afterthought to the answer. Here, the explanation _is_ the thing being sold; the question is just the delivery vehicle.
5. **Speed and offline tolerance.** Instant answer checking, works on a weak connection. In this market that is a feature, not polish.
6. **Cost structure.** The margin profile allows EdMar to sustain a US$4 price indefinitely, which a per-attempt-AI competitor cannot match without either raising price or degrading quality.

---

## SECTION B — PRODUCT PRINCIPLES

These are decision rules, not values statements. Each is written so that it can actually settle an argument. Where two principles conflict, the lower-numbered one wins.

**B-1 · CXC-first.** If it is not on the CXC syllabus, it is not in the product. Every question maps to a Specific Objective. Interesting mathematics that is not examinable is a distraction from the one thing the student is paying for.

**B-2 · Mathematically correct, or absent.** A wrong solution is worse than no solution. When in doubt, unpublish. There is no acceptable error rate that can be traded against velocity.

**B-3 · The student does the work.** The product never solves the question before the student has attempted it. No hints before the attempt in MVP; no answer-reveal shortcut; no photograph-the-question-and-get-the-answer. This is a pedagogical commitment and it is also what distinguishes EdMar from tools that damage the students who use them.

**B-4 · Explanation over verdict.** "Incorrect" is worthless on its own. Every wrong answer is an opportunity to teach, and the interface should devote more space to the _why_ than to the mark.

**B-5 · Deterministic by default.** If a task can be done with arithmetic, a rule, or a lookup, it must not be done with a model. AI is permitted only where genuine natural-language generation or classification is required, and only offline. (§L)

**B-6 · No AI on the student path.** Restated as a principle because it will be under pressure from every future feature request. The answer is no. If a feature requires runtime AI, it needs to be redesigned or costed as a separate premium tier.

**B-7 · Fast beats featureful.** Target: question renders in under 400ms from tap on a mid-range Android device over 3G; answer verdict is instantaneous because it is local. A student in a revision session will tolerate a plain interface; they will not tolerate a spinner.

**B-8 · Mobile-first, small-screen-first, low-data-first.** Design for a 5.5" screen, one hand, and a metered connection. The admin console is the only place where a desktop assumption is permitted.

**B-9 · Content is versioned, never overwritten.** Published content is immutable. Corrections create versions. History must remain interpretable, because a student's past attempt was against a specific version of a question.

**B-10 · Low fixed cost, near-zero marginal cost.** Every architectural decision is checked against the question "what does this cost at 50,000 students?" A design whose cost scales linearly with attempts is rejected by default.

**B-11 · Least data.** Collect what the product needs to function and improve; nothing more. Students are minors. Every additional field is a liability, a consent obligation, and an app-store review question. (§Q.9)

**B-12 · Security at the data layer.** Authorisation lives in Row Level Security policies, not in client code and not solely in API handlers. Assume the client is hostile; assume the API surface will be called directly.

**B-13 · Build the boring version first.** Prefer the well-understood solution. Novel infrastructure is a tax paid in incidents. Deviations from the stack in §4 of the brief require written justification.

**B-14 · The review gate is sacred.** No mechanism, however convenient, may publish content that a qualified human has not approved. This includes future "high-confidence auto-approve" proposals, which will be raised and must be refused until there is measured evidence over thousands of items.

**B-15 · Measure retention honestly.** Vanity metrics (downloads, registrations, questions in the bank) are reported but never used for decisions. The decision metrics are weekly active practice, questions per active student, and subscription retention. (§Q)

**B-16 · Design for the syllabus change.** Anything that hard-codes the V2018 nine-section structure is a defect. (§F.6)

**B-17 · Accessible enough to be usable.** Minimum: legible type at default size, 4.5:1 contrast on text, touch targets ≥44pt, and — specific to this product — mathematical content that does not rely on colour alone to convey meaning. Full screen-reader support for LaTeX is a known hard problem and is explicitly deferred (§U), but the rest of the interface should not be gratuitously inaccessible.

**B-18 · Ship the smallest thing that is genuinely useful.** Scope creep is the named enemy of this project. §T's exclusion list is binding.

---

## SECTION C — STUDENT EXPERIENCE

The complete journey, stage by stage. For each stage: what the student sees, what the system does, what is decided, and what is deliberately _not_ there.

### C.1 First launch and onboarding

**Goal: get to a first solved question in under 90 seconds, with no account.**

The single largest drop-off in education apps is a registration wall in front of an unproven product. EdMar inverts this: the student practises first, registers when they have a reason to.

- **Screen 1 — Value, once.** Three swipeable cards, skippable: _Practice real CSEC questions_ / _See every step of the working_ / _Know exactly which topics to fix_. No sign-up prompt.
- **Screen 2 — Exam target.** "When are you sitting CSEC Maths?" — May–June 2027, January 2027, May–June 2028, Not sure yet. This single answer determines the syllabus version (§F.6) and is the most valuable piece of data collected in the entire onboarding. It is asked first because it is genuinely used.
- **Screen 3 — Starting point (optional, skippable).** "Which topics do you want to work on?" — a multi-select of syllabus sections, defaulting to none selected with a prominent _Show me everything_ option. Used only to order the topic list; it is not a commitment.
- **Screen 4 — Straight into a question.** Not a dashboard. A real question from a commonly-taught topic, at accessible difficulty. The student answers it, sees the worked solution, and now understands the product.

_Not present:_ a diagnostic test. It is tempting and it is a mistake at this stage — a 20-question assessment before any value has been delivered is a drop-off machine. A diagnostic is a V1 feature offered to _engaged_ students (§D).

### C.2 Account creation

**Trigger:** after the third question, or when the student taps anything that needs persistence (progress, saving a session), or when they hit the free daily limit.

- Email + password, and Google sign-in. Apple sign-in is required when iOS ships (App Store policy).
- Requested at sign-up: display name (or nickname), territory, exam sitting (pre-filled from onboarding). **Not** requested: date of birth beyond an age-band check, school, address, phone number, photograph. (B-11)
- **Age handling.** An age-band question ("Are you 13 or over?") gates directly; under-13 requires a parent/guardian email consent flow before an account is created. This is not optional — it is a Google Play Families policy requirement and a data-protection requirement. (A-07, §O.9)
- Anonymous progress from C.1 is migrated into the new account on creation. Losing the student's first three attempts is a small thing that feels like a big one.

### C.3 Home

The home screen answers one question: _what should I do right now?_ It is not a dashboard.

- **Continue** — resumes the last unfinished session, or offers the natural next one. Primary action, largest element.
- **Recommended practice** — one card, generated by the mastery model (§J.8): _"Fractions and decimals — you're at 42%. 10 questions."_ One recommendation, not five. A list of recommendations is a decision the student has to make; a single recommendation is a decision made for them.
- **Practice by topic** — entry to the topic list.
- **Past papers** — entry to the paper library (V1; in MVP this entry point is present but leads to a single sample paper or is hidden).
- **A streak or weekly-questions indicator** — small, honest, non-manipulative. Practice days this week, not a punitive streak that punishes a missed day. (§D notes on gamification restraint.)
- Free-tier students see remaining questions today, stated plainly, without a countdown-timer aesthetic.

### C.4 Topic selection

- Syllabus sections listed in official order, each showing: name, question count available, and the student's mastery as a small bar. Mastery is shown as a proportion filled, not a percentage figure, until enough attempts exist for the number to be meaningful (§J.6) — showing "100%" after two lucky guesses destroys trust in the whole progress system.
- Tapping a section expands to subtopics/Specific Objective groupings, each independently practisable.
- Locked (premium) content is visible but marked, never hidden. A student who cannot see what they would get does not convert.
- Search across topic and subtopic names. Not full-text question search in MVP — that invites answer-hunting (B-3).

### C.5 Practice setup

Deliberately minimal. Two controls, sensible defaults, one large button.

- **Number of questions:** 5 / 10 / 20, default 10. Ten is long enough to be a real session and short enough to finish on a bus.
- **Difficulty:** Mixed (default) / Building up / Challenge. Presented in student language, mapped to the difficulty bands in §E.5.
- Everything else — question selection, spacing, avoiding repeats — is the engine's job and is not exposed. (B-7: every option is a decision tax.)
- **Start practice.**

### C.6 The question screen

The most important screen in the product. Everything about it is subordinate to the student's ability to read the question and think.

- **Top bar:** progress through the session (e.g. `4 / 10`), topic name, exit. No countdown timer in normal practice — timers belong in exam mode and nowhere else, because a timer during learning induces exactly the anxiety the product exists to reduce.
- **Question body:** rendered mathematics (LaTeX, §G.8), and a diagram where present, sized to be legible without pinching but tappable to enlarge.
- **Answer input:** varies by answer type (§I) — multiple-choice options, a numeric keypad, a fraction input, or a structured multi-part input.
- **Working space:** an explicit, understated note that the student should work it out on paper. In V1, an optional on-screen scratch pad. This matters more than it appears: the product's pedagogical claim (B-3) depends on the student actually attempting the question.
- **CHECK ANSWER** — persistent, thumb-reachable, disabled until an answer is entered.
- **Skip** — available, and recorded as a distinct outcome from a wrong answer. A skipped question is a strong signal for the mastery model.

_Not present:_ hints before the attempt, a "show answer" button, any AI affordance, adverts, or social features.

### C.7 Answer

The student enters or selects an answer. Input is normalised as they type (§I.3) — a student typing `1/2`, `0.5`, or `.50` should not be failed on formatting. Invalid _input_ (letters in a numeric field) is prevented at the keypad rather than punished at submission.

### C.8 Check

Tap CHECK ANSWER. The device evaluates the input against the question's accepted-answer specification (§I.4). This is local, deterministic, and instantaneous. There is no network call and there is no loading state, because a loading state at this moment is the single most frustrating thing the product could do.

The attempt is written to the local queue immediately and synced opportunistically.

### C.9 Result

Immediate, unambiguous, and brief.

- **Correct:** a clear affirmative, restrained rather than celebratory. Over-celebration of a routine correct answer is patronising to a sixteen-year-old.
- **Incorrect:** the verdict, and the student's answer shown next to the correct answer. Neutral language — "Not quite" — never anything that reads as judgement of the student.
- **A common-error match.** If the student's wrong answer matches a recorded distractor/common error for that question (§G.5), say so specifically: _"You've divided instead of multiplied here — this is the most common slip on this type."_ This is the single highest-value feedback the product can give and it costs nothing at runtime because it is precomputed. It is a major differentiator; it should be built in MVP.

### C.10 Solution

The step-by-step worked solution, always shown, for correct and incorrect answers alike. A student who guessed correctly needs the method more than one who reasoned to a wrong answer.

- Numbered steps, each with its mathematical line and a short statement of what is being done and why.
- Steps revealed progressively by default (tap to advance), with a _show all_ control. Progressive reveal lets a student stop as soon as they see their error, which is how people actually use worked solutions.
- Marks allocation shown where the question derives from a structured paper — this teaches examination technique, which is a real and under-served need.

### C.11 Explanation

Distinct from the solution, and the distinction matters. The solution says _what to do_; the explanation says _why it works and what to notice_. Two to four sentences in plain, student-directed English:

- the underlying concept in one sentence
- the trap most students fall into
- how to recognise this question type next time

### C.12 Next question

A single forward action. The student should be able to complete a ten-question session with their thumb without moving their hand. Rhythm is a real determinant of session completion.

### C.13 Session results

- Score, time taken, and a per-question strip that can be tapped to revisit any question and its solution.
- **What changed:** the mastery movement caused by this session, stated concretely — _"Consumer Arithmetic: 38% → 47%"_. This closes the loop and is why students come back.
- **One next action:** either _Practise the two you missed_ or _Next topic_. Not a menu.
- Free-tier students at their limit see the upgrade prompt here — at the moment of demonstrated value and demonstrated appetite, which is the only moment it converts.

### C.14 Progress

- Overall readiness indicator, expressed carefully. It must not read as a predicted CSEC grade — that is a promise the product cannot keep and a reputational trap (§V R-09). Frame as coverage and mastery, not prediction.
- Mastery per syllabus section, with subtopic detail on tap.
- Strongest and weakest areas, named specifically at Specific Objective level.
- Activity over time; total questions; accuracy trend.
- Question history, filterable to _questions I got wrong_, which is the most-used view in any product like this.

### C.15 Recommended practice

The output of §J.8. A short, ordered list of what to do next, each item explaining _why_ it was chosen: _"You've missed 4 of the last 5 on simultaneous equations."_ An unexplained recommendation is ignored; an explained one is followed.

### C.16 The journey in one line

```
INSTALL → onboarding (exam target) → FIRST QUESTION (no account)
   → solution → explanation → 2 more questions → SIGN UP
   → HOME → topic → setup → [ question → answer → check → result
        → solution → explanation → next ] ×10
   → session results → mastery updated → RECOMMENDED PRACTICE
   → (limit reached) → UPGRADE → unlimited practice → PROGRESS
   → weak areas → targeted practice → repeat → EXAM
```

---

## SECTION D — COMPLETE FEATURE INVENTORY

### D.1 How to read this section

Features are classified MoSCoW _within a release_, and assigned to a release. A "Must" in V2 is not a "Must" in MVP. The binding rule (B-18) is that nothing outside the MVP Must list is built before launch, regardless of how cheap it looks.

Release definitions:

- **MVP** — the smallest launchable, chargeable product. Target: internal + closed beta.
- **V1** — public Google Play launch with paid subscriptions.
- **V2** — the retention and depth release, roughly 4–6 months post-launch.
- **V3+/Future** — directional; see §U.

### D.2 MVP features

**MUST HAVE**

| Feature                                                                     | Notes                                      |
| --------------------------------------------------------------------------- | ------------------------------------------ |
| Anonymous first-run practice                                                | 3 questions before account required (§C.1) |
| Email + Google authentication                                               | Supabase Auth                              |
| Age-band gate and under-13 consent flow                                     | Legal/store requirement, not negotiable    |
| Student profile: name, territory, exam sitting                              | Minimal fields only                        |
| Curriculum taxonomy, V2018 sections + V2027 module tags                     | §F                                         |
| Question bank ≥1,200 published, reviewed questions                          | The real MVP gate; see §T.4                |
| Topic and subtopic browsing with availability counts                        | §C.4                                       |
| Practice session setup (count, difficulty)                                  | §C.5                                       |
| Question engine: selection, cooldown, difficulty targeting                  | §E.4                                       |
| Multiple-choice answer handling                                             | §I.5                                       |
| Numeric / decimal / fraction answer handling with tolerance and equivalence | §I.6–I.8                                   |
| Deterministic on-device answer validation                                   | I-3                                        |
| LaTeX rendering of question, solution and explanation                       | §G.8                                       |
| Diagram rendering (static image/SVG from Storage)                           | §G.6                                       |
| Worked solution screen with progressive reveal                              | §C.10                                      |
| Explanation screen                                                          | §C.11                                      |
| Common-error / distractor matching on wrong answers                         | §C.9 — high value, precomputed, cheap      |
| Attempt recording with offline queue and sync                               | §E.9                                       |
| Mastery model per skill and topic                                           | §J                                         |
| Session results with mastery delta                                          | §C.13                                      |
| Progress screen: per-topic mastery, weak areas, history                     | §C.14                                      |
| Recommended practice (single recommendation)                                | §J.8                                       |
| Free tier with daily question limit                                         | §N.3                                       |
| Premium entitlement architecture (enforced, even if billing is stubbed)     | §N.5                                       |
| Upgrade screen and paywall placement                                        | §C.13                                      |
| Admin: authentication and role separation                                   | §O.4                                       |
| Admin: question CRUD and editor with LaTeX preview                          | §M.3                                       |
| Admin: review queue and publish/unpublish                                   | §M.5                                       |
| Admin: curriculum management                                                | §M.7                                       |
| Content ingestion pipeline (batch, offline)                                 | §K                                         |
| Deterministic validation suite for content                                  | §K.6                                       |
| Duplicate detection                                                         | §E.10                                      |
| Audit logging of all content and role changes                               | §O.11                                      |
| Row Level Security on every table                                           | §O.3                                       |
| Crash and error reporting                                                   | §Q.7                                       |
| Basic product analytics events                                              | §Q.2                                       |

**SHOULD HAVE (MVP if cheap, else V1)**

| Feature                                                      | Notes                                                                  |
| ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| Password reset                                               | Nearly Must; include unless it genuinely slips                         |
| Bookmark / flag a question for later                         | Cheap, well-loved                                                      |
| Report a problem with a question                             | High value for content quality — a free QA channel from 1,000 students |
| Session pause and resume                                     |                                                                        |
| Dark mode                                                    | Students revise at night; cheaper to build now than retrofit           |
| Question count and "last updated" transparency on topic list | Builds trust in a new product                                          |

**COULD HAVE**

| Feature                        | Notes                         |
| ------------------------------ | ----------------------------- |
| On-screen scratch pad          | Nice; paper works             |
| Weekly practice-days indicator | Restrained gamification only  |
| Share a result card            | Organic acquisition, low cost |

**NOT IN MVP** — see §T.5 for the full binding exclusion list.

### D.3 V1 features (public launch)

**MUST HAVE**

| Feature                                                        | Notes                                     |
| -------------------------------------------------------------- | ----------------------------------------- |
| Google Play Billing integration, real subscriptions            | §N.6                                      |
| Subscription management, restore purchases, grace period       | Store policy requirement                  |
| Past paper library and paper mode                              | §H                                        |
| Timed exam mode                                                | §H.6                                      |
| Paper review mode with per-question analysis                   | §H.8                                      |
| Question bank ≥3,000 published questions                       | Depth becomes the retention driver        |
| Full coverage of all nine V2018 sections at usable depth       | No empty topics                           |
| Diagnostic assessment (offered to engaged students)            | §J.9                                      |
| Improved recommendation with spaced repetition of past errors  | §J.8                                      |
| Push notifications (opt-in, low frequency)                     | §D.7                                      |
| In-app content update / cache invalidation                     | §E.12                                     |
| Admin analytics dashboard                                      | §M.10                                     |
| Admin AI-generated content review workflow, fully instrumented | §M.6                                      |
| Account deletion, data export                                  | Legal requirement; also store requirement |
| Terms, privacy policy, non-affiliation disclaimer              | §V R-02                                   |

**SHOULD HAVE:** annual plan (US$40); referral mechanism; topic-level exam-technique notes; "questions I got wrong" dedicated practice mode; multi-device sync conflict handling; V2027 syllabus browsing as a first-class mode.

**COULD HAVE:** offline pack download for a whole topic; light achievement system; teacher share-a-practice-link.

### D.4 V2 features

**MUST HAVE:** full V2027 modular syllabus support including modular entry paths; Apple App Store release; adaptive practice using the enhanced mastery model (§J.10); performance analytics by profile dimension (CK/AK/R); content freshness process for new past papers.

**SHOULD HAVE:** class/teacher accounts (teacher creates a class, sets practice, sees aggregate — not individual surveillance); parent progress summary by email; question variant generation at scale (§K.5); step-level solution interactivity ("I'm stuck at step 3").

**COULD HAVE:** leaderboards within a class only (never global — see D.7); certificates of topic mastery; printable worksheets.

### D.5 Future

See §U. Additional CXC subjects, CAPE, Additional Mathematics, school licensing, competitions.

### D.6 Feature matrix

Legend: ● built · ◐ partial · ○ not present

| Capability                           |  MVP  |  V1   |   V2   | Future  |
| ------------------------------------ | :---: | :---: | :----: | :-----: |
| **Access & identity**                |       |       |        |         |
| Anonymous trial practice             |   ●   |   ●   |   ●    |    ●    |
| Email / Google auth                  |   ●   |   ●   |   ●    |    ●    |
| Apple sign-in                        |   ○   |   ○   |   ●    |    ●    |
| Under-13 consent flow                |   ●   |   ●   |   ●    |    ●    |
| Account deletion & export            |   ◐   |   ●   |   ●    |    ●    |
| **Content**                          |       |       |        |         |
| V2018 taxonomy                       |   ●   |   ●   |   ●    |    ●    |
| V2027 module tagging                 |   ◐   |   ●   |   ●    |    ●    |
| V2027 modular entry paths            |   ○   |   ○   |   ●    |    ●    |
| Published question bank              | 1,200 | 3,000 | 6,000+ | 10,000+ |
| Worked solutions                     |   ●   |   ●   |   ●    |    ●    |
| Explanations                         |   ●   |   ●   |   ●    |    ●    |
| Common-error distractors             |   ●   |   ●   |   ●    |    ●    |
| Diagrams                             |   ●   |   ●   |   ●    |    ●    |
| Past paper library                   |   ○   |   ●   |   ●    |    ●    |
| **Practice**                         |       |       |        |         |
| Topic practice sessions              |   ●   |   ●   |   ●    |    ●    |
| Difficulty selection                 |   ●   |   ●   |   ●    |    ●    |
| Multiple choice                      |   ●   |   ●   |   ●    |    ●    |
| Numeric / fraction / decimal         |   ●   |   ●   |   ●    |    ●    |
| Algebraic expression answers         |   ◐   |   ●   |   ●    |    ●    |
| Structured multi-part answers        |   ○   |   ●   |   ●    |    ●    |
| Paper mode                           |   ○   |   ●   |   ●    |    ●    |
| Timed exam mode                      |   ○   |   ●   |   ●    |    ●    |
| Adaptive practice                    |   ○   |   ◐   |   ●    |    ●    |
| Spaced repetition of errors          |   ○   |   ●   |   ●    |    ●    |
| Offline practice                     |   ◐   |   ●   |   ●    |    ●    |
| **Progress**                         |       |       |        |         |
| Attempt history                      |   ●   |   ●   |   ●    |    ●    |
| Per-topic mastery                    |   ●   |   ●   |   ●    |    ●    |
| Per-skill mastery                    |   ●   |   ●   |   ●    |    ●    |
| Weak/strong areas                    |   ●   |   ●   |   ●    |    ●    |
| Recommended practice                 |   ●   |   ●   |   ●    |    ●    |
| Profile-dimension analysis (CK/AK/R) |   ○   |   ○   |   ●    |    ●    |
| Diagnostic assessment                |   ○   |   ●   |   ●    |    ●    |
| **Monetisation**                     |       |       |        |         |
| Entitlement architecture             |   ●   |   ●   |   ●    |    ●    |
| Free tier limits                     |   ●   |   ●   |   ●    |    ●    |
| Google Play Billing                  |   ○   |   ●   |   ●    |    ●    |
| Annual plan                          |   ○   |   ◐   |   ●    |    ●    |
| School licensing                     |   ○   |   ○   |   ○    |    ●    |
| **Admin**                            |       |       |        |         |
| Question editor                      |   ●   |   ●   |   ●    |    ●    |
| Review queue                         |   ●   |   ●   |   ●    |    ●    |
| AI content review workflow           |   ●   |   ●   |   ●    |    ●    |
| Curriculum management                |   ●   |   ●   |   ●    |    ●    |
| User management                      |   ◐   |   ●   |   ●    |    ●    |
| Subscription admin                   |   ○   |   ●   |   ●    |    ●    |
| Analytics dashboard                  |   ○   |   ●   |   ●    |    ●    |
| Audit log viewer                     |   ◐   |   ●   |   ●    |    ●    |
| **AI (offline only)**                |       |       |        |         |
| Document extraction                  |   ●   |   ●   |   ●    |    ●    |
| Classification & mapping             |   ●   |   ●   |   ●    |    ●    |
| Solution drafting                    |   ●   |   ●   |   ●    |    ●    |
| Explanation drafting                 |   ●   |   ●   |   ●    |    ●    |
| Variant generation                   |   ○   |   ◐   |   ●    |    ●    |
| Duplicate detection                  |   ●   |   ●   |   ●    |    ●    |
| AI on student path                   |   ○   |   ○   |   ○    |    ○    |

The final row is the most important row in the table, and it is intended to remain unchanged permanently.

### D.7 Features deliberately refused, and why

Recording these prevents them being re-proposed every quarter.

- **Student-facing AI chat / "ask a question".** Violates B-3, B-6 and the cost model. It is also the feature most likely to produce a confidently wrong mathematical claim attributed to EdMar.
- **Photo-solve (point camera at homework).** Directly undermines the pedagogical premise. It also carries the highest per-use cost in the product and would attract exactly the users least likely to pay.
- **Global leaderboards.** In a cohort where a bad grade is a life event, ranking a struggling student publicly against strangers is harmful and drives churn among the students who most need the product. Class-scoped leaderboards in V2 are acceptable because the comparison group is real and consensual.
- **Aggressive streak mechanics with loss aversion.** Punishing a student for missing a day during examination season is counterproductive. A gentle weekly indicator only.
- **Social feed / friends / messaging.** Enormous moderation and child-safety liability for negligible learning value.
- **Adverts.** Incompatible with a paid product for minors, and destroys the concentration the question screen depends on.
- **Predicted CSEC grade.** See §V R-09. The product will be held to it, and it cannot be substantiated.

---

## SECTION E — QUESTION ENGINE

The question engine is the part of the system that decides _which question a student sees next_ and guarantees that it is a legitimate, published, appropriate question they have not just seen. It is deliberately deterministic and cheap.

### E.1 Design stance

Three commitments shape every decision below.

1. **Selection is a database operation, not a service.** Question selection is implemented as a parameterised Postgres function invoked over Supabase RPC. This keeps selection logic beside the data (no N+1 round trips), keeps it inside the RLS boundary, and keeps it fast enough that no caching layer is needed at the scales in §R.
2. **Selection is seeded and reproducible.** Randomisation uses a seed derived from `(student_id, session_id)`. The same session regenerates identically — essential for debugging a support complaint, for resuming an interrupted session, and for reproducing a reported problem.
3. **Selection never blocks on the network being good.** Sessions are materialised up front (all N question IDs and payloads fetched at session start), so a student who loses signal mid-session finishes it.

### E.2 How questions are stored

Conceptually — the field-level model is §G:

- The **question** is the stable identity: its stem, its type, its assets, its curriculum mapping, its difficulty, its provenance, its status.
- The **question version** carries the actual content. Publishing creates a version; correcting creates the next. Attempts reference the version they were answered against (B-9, I-4). This is what makes historical accuracy analysis possible.
- The **answer specification** is a structured object attached to the version, describing exactly how a response is judged (§I.4). It is precomputed at authoring time so runtime checking is trivial.
- The **solution** is an ordered list of steps, each with LaTeX and prose and an optional mark allocation.
- The **explanation** is short prose keyed to the version.
- **Distractors / common errors** are recorded values with the misconception each represents (§G.5).
- **Assets** (diagrams) live in Supabase Storage, referenced by stable path, served via CDN, immutable once published.
- **Curriculum links** are many-to-many: a question may legitimately assess more than one Specific Objective, and must be tagged against both syllabus versions (§F.6).

Content is denormalised into a single read-optimised payload per published version — one row, one round trip, no joins on the student path. Assembling that payload is a publish-time job, not a request-time job. This is the main reason the read path stays flat as the bank grows.

### E.3 How questions are classified

Every published question carries:

**Curriculum** — syllabus version, section, subtopic, one or more Specific Objectives, and derived skill tags (§F.4).

**Cognitive** — profile dimension (CK / AK / R), aligned to CXC's own reporting dimensions. Tagging this from the start costs almost nothing and unlocks a genuinely differentiated V2 analytic ("you lose marks on Reasoning, not on method").

**Format** — question type (multiple choice, numeric, expression, structured multi-part), answer type, whether a diagram is required, whether a calculator is assumed.

**Difficulty** — see E.5.

**Provenance** — `past_paper` | `past_paper_adapted` | `original_authored` | `ai_variant`. Legally and pedagogically load-bearing (§E.7, §V R-01).

**Operational** — status, version, review state, quality metrics, retirement flag.

Classification is proposed by AI during ingestion and **confirmed by a human reviewer**. AI-proposed mapping is a labour-saving device, never an authority. Mis-mapped questions are the most insidious content defect available: they are individually invisible and they silently corrupt every mastery score and recommendation downstream.

### E.4 How questions are selected

The selection function takes: student, target skill/objective set, count, difficulty mode, syllabus version, entitlement, and seed. It applies a filter chain, each stage of which is a plain predicate:

1. **Eligibility** — status is `published`, not retired, version is current, matches requested syllabus version.
2. **Curriculum match** — question links to at least one requested Specific Objective (or the requested subtopic/section, resolved downward).
3. **Entitlement** — free-tier students are restricted to the free question pool and to their remaining daily allowance (§N.3).
4. **Cooldown** — exclude questions attempted by this student within a cooldown window. Default 30 days, shortened to 7 days for questions previously answered _incorrectly_ (deliberate: errors should come back sooner). If the filter would leave too few questions, the cooldown relaxes progressively rather than failing — and the student is told, quietly, when they are seeing repeats.
5. **Difficulty targeting** — see E.5.
6. **Diversity** — avoid returning many near-identical questions in one session by spreading across Specific Objectives and, where available, across question "families" (variant groups, §E.10).
7. **Weighted random ordering** — seeded; weights favour questions with fewer total attempts (so new content gets exposure and accumulates quality data) and, in recommendation contexts, questions targeting the student's recorded misconceptions.
8. **Materialise** — return N; if fewer than N are available, return what exists and tell the student honestly rather than padding with repeats.

**The starvation case matters.** Early on, some subtopics will have twelve questions. A student who does three sessions there exhausts them. The engine must degrade gracefully: relax cooldown, then explicitly surface _"You've worked through everything we have here — try [adjacent topic]"_. Silently recycling questions makes the product feel broken and inflates mastery scores dishonestly.

### E.5 How difficulty works

Difficulty is a 1–5 integer band, with defined meanings so that different authors and reviewers assign it consistently:

| Band | Meaning                                                        | Typical                                |
| ---- | -------------------------------------------------------------- | -------------------------------------- |
| 1    | Direct recall or single-step application of one objective      | Early Paper 01 items                   |
| 2    | Routine two-step, familiar presentation                        | Typical Paper 01                       |
| 3    | Multi-step, or requires selecting the right method             | Harder Paper 01 / early Paper 02 parts |
| 4    | Combines two objectives, or non-obvious set-up                 | Later Paper 02 parts                   |
| 5    | Extended reasoning, unfamiliar context, or investigation-style | Investigation / hardest parts          |

**Initial assignment** is by author/reviewer judgement, informed by source (a Paper 02 part (c) is rarely a 1). **Subsequent calibration is empirical:** once a question has ≥30 attempts from ≥20 distinct students, its observed accuracy is compared against its band's expected range. Persistent outliers are flagged to admin for re-banding — flagged, not auto-adjusted, because a low accuracy can equally indicate a _wrong solution_ rather than a hard question, and that distinction requires a human. (§E.13)

Difficulty modes in practice:

- **Mixed (default)** — a fixed spread, roughly 20/30/30/15/5 across bands 1–5, which approximates a real paper.
- **Building up** — starts at one band below the student's demonstrated level for that skill and climbs. Good for a student rebuilding confidence.
- **Challenge** — bands 4–5 only.

The student's demonstrated level per skill comes from the mastery model (§J) and is a lookup, not a computation, at selection time.

### E.6 Topic, subtopic and skill filtering

Filtering resolves downward through the taxonomy (§F). A request for a section expands to all its subtopics, then to all their Specific Objectives; a request for a Specific Objective is used directly. This is implemented as a recursive resolution in the selection function so that callers never need to know the depth of the tree — important because the V2027 structure adds a module level above section.

Skill tags (§F.4) cut _across_ the tree — "solving linear equations" appears under more than one objective — and are filterable independently. This is what makes targeted remediation possible: a student's weakness is usually a skill, not a syllabus section.

### E.7 Identifying past-paper questions

Every question declares its provenance explicitly, and past-paper-derived questions additionally carry the sitting (year, month), paper (01 / 02 / 032), question number and part label, and the syllabus version in force at that sitting.

Two reasons this must be first-class rather than a note in a text field:

1. **Students specifically want authentic past-paper practice**, and being able to say "this is 2019 Paper 02 Q4(b)" is a genuine selling point.
2. **The rights position differs by provenance.** If the licensing question (§V R-01) resolves badly, EdMar must be able to identify and withdraw every affected item in one operation. A provenance field makes that a query; a free-text note makes it an archaeology project.

`past_paper_adapted` is a distinct value and is important: a question whose numbers and context have been changed but whose structure derives from a past paper is _not_ the same rights object as a verbatim reproduction, and it is not the same pedagogical object either. The distinction must be recorded honestly at authoring time.

### E.8 Identifying generated questions

AI-originated items carry provenance `ai_variant` or `ai_authored`, plus: source question (if a variant), model identifier, prompt template version, generation run ID, validation report, and the reviewer who approved them.

**Students are not shown AI provenance in MVP** — it is not information they can act on, and it invites unwarranted distrust of items that have passed the same human review as everything else. But it is retained, queryable, and disclosable. If EdMar is ever asked "how much of this is AI-written?", the answer must be a number, not a shrug. Consider surfacing an aggregate statement in the app's About screen; that is a positioning decision, not an architectural one.

**A hard constraint:** an AI-generated _variant_ must never be published into the same practice pool as its source question without a human confirming they are not effectively identical. Variant families are tracked (§E.10) and the engine will not serve two members of the same family in one session.

### E.9 Randomisation, sessions and offline behaviour

Sessions are seeded (E.1) and fully materialised at start. The client stores the session, its questions, their solutions and their answer specifications locally. Consequences:

- The student can complete a session with no connectivity.
- Answer checking is local and instant (I-3).
- Attempts queue locally with client timestamps and sync when connectivity returns; the server is authoritative for mastery recomputation and resolves duplicates idempotently by attempt ID.
- A student who reinstalls loses queued unsynced attempts only.

Anti-cheat is not a serious concern here — the student is the beneficiary of their own honesty and there is no score to game — so the client is trusted with correctness for _display_, while the server independently re-derives correctness on sync for _record_. If they disagree, the server wins and the discrepancy is logged, because a systematic disagreement indicates a genuine bug in an answer specification.

### E.10 Duplicate prevention

Duplicates are the characteristic failure mode of an AI-assisted content pipeline. Three layers:

**Layer 1 — exact/near-exact (deterministic, cheap).** Normalise the stem: strip whitespace, normalise LaTeX to a canonical form, lowercase prose, replace numerals with placeholders. Hash. Identical hashes are duplicates. Catches re-ingestion of the same source document, which is the most common case by far.

**Layer 2 — structural similarity (deterministic).** Compare normalised stems by trigram/edit-distance similarity, and compare answer specifications. Two questions with the same structure and the same answer, differing only in surface wording, are duplicates. Two questions with the same structure and _different_ numbers are **variants**, not duplicates — they are legitimate and desirable, and they are grouped into a variant family so the engine does not serve both in one session.

**Layer 3 — semantic similarity (embeddings, offline).** Embed stems; flag high-cosine-similarity pairs above a tuned threshold for human adjudication. Runs as a batch job at ingestion, never at runtime. Embedding cost is negligible and one-time. Store the embedding so re-checks are free.

Nothing here auto-deletes. Layers 1 and 2 can auto-reject _at ingestion_, before human time is spent. Layer 3 only flags.

### E.11 Retirement and correction

A published question leaves circulation by one of three routes, all reversible except the first:

- **Retired** — no longer served, history preserved, attempts still count toward past mastery. Reasons: superseded by syllabus change, rights withdrawal, persistent quality flags, or duplication discovered late.
- **Suspended** — temporarily withheld pending investigation (e.g. a student report of a wrong answer). Fast, one-click, no approval needed. **The bias must be toward suspending quickly**: a wrong solution serving 500 students an hour is worse than a temporarily missing question.
- **Corrected** — a new version is published and the previous version retired. Attempts against the old version retain their meaning. Where a correction changes the _correct answer_, affected students' attempts must be identified and their mastery recomputed; students who were marked wrong on the old (incorrect) answer should be notified. This is rare and it is exactly the situation that justifies versioning.

### E.12 Content freshness on the client

A global `content_version` counter increments on any publish, correction or retirement. The client checks it cheaply on launch and on resume, and invalidates only the affected caches. This avoids both stale content and gratuitous re-downloading on a metered connection.

### E.13 Quality maintenance

Quality is a continuous process with four inputs:

1. **Pre-publication:** deterministic validation (§K.6) and human review (§K.7). Nothing published without both.
2. **Empirical monitoring:** per-question accuracy, mean time-to-answer, skip rate, and — the most diagnostic single signal — **the proportion of wrong answers that cluster on one specific value**. If 60% of students give the same wrong answer, either that is a well-understood misconception worth recording as a distractor, or the stated correct answer is wrong. Both are actionable; both need a human.
3. **Student reports.** An in-app "something's wrong with this question" control, routed to an admin queue with the student's answer and the question version attached. A thousand students are a better QA department than any test suite, and this is close to free.
4. **Scheduled audit.** A rolling sample of published questions re-reviewed each month, weighted toward high-traffic and AI-originated items.

**Quality metrics tracked per question:** total attempts, accuracy, wrong-answer distribution, skip rate, mean duration, report count, last review date, reviewer.

---

## SECTION F — CXC CURRICULUM ARCHITECTURE

### F.1 Principle

The taxonomy mirrors CXC's own published structure and does not invent terminology. Where EdMar needs a concept CXC does not name — a "skill" that cuts across objectives — it is clearly marked as an EdMar construct so that no one later mistakes it for official CXC vocabulary.

The **Specific Objective is the atomic official unit** and is the anchor of the entire system. Every question maps to at least one. Every mastery number rolls up from them. Every recommendation names one.

### F.2 The hierarchy

```
SUBJECT                     CSEC Mathematics
   │
   └── SYLLABUS VERSION     V2018 (exams to 2026) | V2027 (exams from 2027)
          │
          └── MODULE        [V2027 only] Module 1 / 2 / 3
                 │
                 └── SECTION          e.g. "Consumer Arithmetic"
                        │
                        └── SUBTOPIC          [EdMar construct — see F.3]
                               │
                               └── SPECIFIC OBJECTIVE   [official, numbered]
                                      │
                                      ├── SKILL          [EdMar construct]
                                      │
                                      └── QUESTION
```

Two structural notes:

- **MODULE exists only in V2027.** Rather than modelling two different trees, the module level is present in the schema always and simply null for V2018 sections. Cleaner than a polymorphic tree, and it means a V2018 question can carry a V2027 module tag for forward compatibility.
- **SUBTOPIC is an EdMar grouping**, not an official CXC level. The syllabus goes Section → General Objectives → Specific Objectives directly. But a section like Geometry and Trigonometry contains dozens of Specific Objectives, and presenting a student with a flat list of forty is a usability failure. Subtopics are a _presentation_ grouping over Specific Objectives, editable in admin, and they must never be treated as authoritative CXC structure. **[VERIFY-JSON]**: the existing dataset's "topics" field most likely corresponds to this level and should be reconciled against it.

### F.3 What is official and what is EdMar's

This distinction must survive into the database, the admin UI and the student-facing copy.

| Level                       | Source           | Notes                                            |
| --------------------------- | ---------------- | ------------------------------------------------ |
| Subject                     | CXC              | "Mathematics" (CSEC)                             |
| Syllabus version            | CXC              | Effective-from examination sitting               |
| Module                      | CXC (V2027 only) | Three named modules                              |
| Section                     | CXC              | Named and ordered exactly as published           |
| General Objective           | CXC              | Stored for reference; not used for filtering     |
| Specific Objective          | CXC              | **The anchor.** Officially numbered              |
| Content / Explanatory Note  | CXC              | Stored; useful context for authors and reviewers |
| **Subtopic**                | **EdMar**        | Presentation grouping only                       |
| **Skill**                   | **EdMar**        | Cross-cutting capability tag                     |
| **Difficulty band**         | **EdMar**        | 1–5, §E.5                                        |
| Profile dimension (CK/AK/R) | CXC              | Official reporting dimensions                    |

Anything in the EdMar rows must be visually distinguishable in the admin console and must never appear in student copy in a way that implies CXC authorship.

### F.4 Skills — the cross-cutting layer

A **skill** is a specific, teachable capability that a question exercises: _"solve a linear equation in one variable"_, _"convert between percentage and decimal"_, _"apply Pythagoras' theorem"_, _"read a value from a cumulative frequency curve"_.

Why this layer exists rather than relying on Specific Objectives alone:

- Students fail at the level of skills, not objectives. "You are weak on Section 6" is not actionable. "You keep making sign errors when expanding brackets" is.
- Skills recur across sections. Rearranging a formula appears in Algebra, Measurement and Geometry. A student weak at it is weak at it everywhere, and their mastery evidence should pool.
- Recommendation quality depends on it (§J.8).

Constraints: skills are a controlled vocabulary managed in admin (not free tags), each is linked to the Specific Objectives it serves, and a question carries 1–3 of them. Allowing uncontrolled skill tags produces a hundred near-synonyms within a month and destroys the mastery model — this is a known failure mode and the controlled vocabulary is the mitigation.

**Target scale:** roughly 150–250 skills across the whole syllabus. Fewer than 100 is too coarse to be actionable; more than 400 fragments the evidence so badly that no student ever accumulates enough attempts per skill for mastery to be meaningful (§J.6).

### F.5 Learning objectives

The brief's hierarchy includes a learning-objective level between skill and question. In this design that is served by the CXC **Specific Objective** itself, which _is_ a learning objective and is officially worded. Introducing a second, EdMar-authored learning-objective level would duplicate it and create two competing sources of truth. Where an author needs finer granularity than a Specific Objective, the **skill** provides it.

This is a deliberate simplification of the requested structure and is flagged as such for the product owner's confirmation.

### F.6 Dual-syllabus support — the critical design point

This is the most consequential single decision in the content architecture, and getting it wrong means re-tagging the entire question bank later.

**The situation.** A student sitting in May–June 2026 is examined on V2018. A student sitting from May–June 2027 is examined on V2027, which reorganises content into three modules, splits several sections into numbered parts (Algebra 1/2, Statistics 1/2, Relations Functions and Graphs 1/2, Geometry and Trigonometry 1/2, Vectors and Matrices 1/2), introduces "Introduction to Graphs", and adds modular entry options.

**The design.**

1. **Curriculum nodes are versioned.** Sections and Specific Objectives belong to a syllabus version. V2018 and V2027 trees coexist.
2. **A mapping table relates them.** Each V2018 Specific Objective maps to zero, one or many V2027 Specific Objectives, and vice versa, with a relationship qualifier (`identical` / `partial` / `moved` / `removed` / `new`). This is a one-time human effort of perhaps two to three days by a qualified teacher, and it is _enormously_ cheaper than re-tagging thousands of questions.
3. **Questions map to objectives, not sections.** Because the mapping table exists, a question tagged to a V2018 objective is automatically reachable from the corresponding V2027 objective, at whatever fidelity the qualifier declares. Questions whose objective is `removed` in V2027 are excluded from V2027 practice automatically.
4. **The student's exam sitting selects the tree.** Captured at onboarding (§C.1), changeable in profile. Everything the student sees — topic list, progress, recommendations — is rendered against their tree.
5. **New content is authored against V2027 by default** from the point the mapping exists, and back-mapped to V2018 while V2018 still matters.

**What this buys:** in 2027, when V2018 becomes irrelevant, EdMar switches default trees and retires V2018 presentation with no content migration. Competitors relying on flat "topic" strings will be re-tagging by hand.

**[VERIFY-CXC-02]:** the V2027 Specific Objective list must be transcribed from the official PDF by a human. It is the foundation of the taxonomy and must not be paraphrased, inferred, or generated.

### F.7 Extensibility to other subjects

The taxonomy is rooted at SUBJECT rather than assuming Mathematics, and no level below it is Mathematics-specific except the answer-type vocabulary in §I. Adding CSEC Additional Mathematics, CAPE Mathematics, or a non-mathematical subject requires new curriculum rows and (for non-mathematical subjects) new answer types — not a schema change. This is close to free now and expensive to retrofit, which is the definition of a decision worth making early.

### F.8 Curriculum data management

The taxonomy is reference data: low-volume, high-importance, rarely changed, and catastrophic if corrupted. Accordingly it is: version-controlled as seed files in the repository (so changes are reviewable in a pull request), applied by migration, editable in admin only by a `curriculum_admin` role, and fully audit-logged. It is never bulk-edited directly against the production database.

---

## SECTION G — QUESTION CONTENT MODEL

This section defines the _conceptual_ content model. It is not a schema listing; the engineering agent will derive tables from it. Field names are indicative.

### G.1 Model overview

```
QUESTION (stable identity)
  ├── provenance, type, calculator flag, status, retirement
  ├── QUESTION_VERSION (content; immutable once published)  ← attempts reference this
  │     ├── stem (LaTeX + prose)
  │     ├── ANSWER_SPEC        (how to judge a response — §I.4)
  │     ├── OPTION[]           (multiple choice only)
  │     ├── SOLUTION_STEP[]    (ordered; LaTeX + prose + marks)
  │     ├── EXPLANATION        (short prose)
  │     ├── COMMON_ERROR[]     (wrong value + misconception + corrective note)
  │     ├── ASSET[]            (diagrams; Storage refs)
  │     └── PART[]             (structured multi-part questions)
  ├── CURRICULUM_LINK[]        (→ specific objectives, per syllabus version)
  ├── SKILL_LINK[]             (→ skills)
  ├── SOURCE                   (paper metadata, where applicable)
  ├── AI_PROVENANCE            (model, prompt version, run, validation report)
  ├── REVIEW_EVENT[]           (who, when, what decision, what changed)
  └── QUALITY_METRICS          (rolled up from attempts)
```

### G.2 Question

| Concept              | Purpose                                                                                                               | Notes                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `id`                 | Stable identity across versions                                                                                       |                                                                                                                                      |
| `type`               | `multiple_choice` \| `numeric` \| `expression` \| `structured` \| `multi_select` \| `true_false`                      | Drives input UI and validation strategy                                                                                              |
| `provenance`         | `past_paper` \| `past_paper_adapted` \| `original_authored` \| `ai_variant` \| `ai_authored`                          | §E.7, §E.8 — rights-critical                                                                                                         |
| `calculator_allowed` | Boolean                                                                                                               | CSEC permits a calculator in both papers; some items are designed to be done without one, and this affects difficulty interpretation |
| `status`             | `draft` \| `pending_validation` \| `pending_review` \| `changes_requested` \| `published` \| `suspended` \| `retired` | The only status the student app may read is `published` (I-2)                                                                        |
| `variant_family_id`  | Groups a source question with its variants                                                                            | Prevents serving near-identical items together (§E.10)                                                                               |
| `current_version_id` | Pointer to the live version                                                                                           |                                                                                                                                      |
| `is_free`            | Available to free tier                                                                                                | §N.3                                                                                                                                 |

### G.3 Question version and stem

The version holds all content. Publishing a correction creates a new version and repoints `current_version_id`.

The **stem** is stored as structured content, not a single blob: an ordered list of blocks, each either prose, a display-mathematics expression, an inline-mixed line, an asset reference, or a table. Reasons: it renders reliably across screen sizes, it allows diagrams to sit correctly between paragraphs, and it makes the LaTeX validator's job tractable (§G.8). A single "markdown with dollar signs" text field is much easier to build and it will produce layout defects on small screens for the life of the product.

Also on the version: `version_number`, `created_by`, `published_at`, `change_note`, and the validation report from §K.6.

### G.4 Options, correct answer and answer specification

For multiple choice: an ordered list of options, each with content (LaTeX/prose), a correctness flag, and — importantly — an optional link to the **common error** it embodies. Well-constructed CSEC distractors are not random; each is the answer a student gets by making a specific mistake. Capturing that mapping is what makes §C.9's targeted feedback possible, and it is the cheapest high-value feature in the product.

Option order is randomised at presentation time by default (seeded per session), with an `preserve_order` flag for items where order is semantically meaningful ("Which of the following is _first_…", or options that are themselves ordered values).

For everything else, correctness is defined by the **answer specification** (§I.4): a structured object stating the answer type, the canonical value, accepted equivalent forms, tolerance, required units, and any normalisation rules. This is the single most important object in the content model for correctness, and it is computed and validated at authoring time so that runtime checking is a pure function with no ambiguity.

### G.5 Common errors

An explicit, first-class list per version. Each entry: the wrong value or form, the misconception it indicates (e.g. _"subtracted before multiplying — order of operations"_), a short corrective note shown to the student, and a link to the skill the student is missing.

This structure earns its keep three times: in immediate feedback (§C.9), in diagnostics (a student who repeatedly triggers the same misconception across questions has an identifiable, nameable gap), and in recommendation (§J.8 can target the skill behind the misconception rather than the topic).

**[VERIFY-JSON]**: the legacy dataset reportedly contains "common-error warnings". These are likely prose rather than value-keyed. Migration should preserve the prose while a follow-up pass adds the value keys, which are what make matching possible.

### G.6 Diagrams and assets

- Preferred format **SVG**, with a rasterised PNG fallback generated at publish time for renderer edge cases. SVG scales on every screen, is small over a metered connection, and stays legible when zoomed.
- Stored in Supabase Storage under a deterministic, immutable path keyed by question version. Never mutated in place.
- Each asset carries: role (`question_figure`, `solution_figure`, `option_figure`), alt text (mandatory — a diagram with no alt text fails validation), intrinsic dimensions, and a `requires_colour` flag for accessibility checking.
- Public read via CDN for published assets; private otherwise. Assets for unpublished questions must not be publicly reachable, since asset URLs are a well-known way to leak draft content.
- **[VERIFY-JSON]**: the legacy dataset contains "diagram information". Whether this is images, descriptions, or generation instructions materially changes the migration effort and is a top-priority inspection item.

### G.7 Marks, source and metadata

Marks are recorded per question and per solution step where the source supports it. Displaying the mark allocation alongside the working teaches examination technique — where marks are actually awarded — which is a genuine gap in most revision material.

Source metadata for past-paper-derived items: sitting year, sitting month (January / May–June), paper (`01` / `02` / `031` / `032`), question number, part label, and syllabus version in force. These are separate typed fields, never a concatenated string, because they must be filterable, and because a rights withdrawal must be executable as a query (§E.7).

### G.8 LaTeX handling

Mathematical typesetting is the highest-risk _technical_ area in the client. It is also where a cheap approach produces a product that looks broken.

**Storage.** Store LaTeX as authored, in a **restricted, whitelisted subset**. Maintain an explicit allowlist of commands and environments (fractions, roots, exponents/subscripts, common operators and relations, Greek letters, matrices, vectors, degrees, the standard trigonometric and logarithmic functions, aligned environments, simple arrays). Anything outside the allowlist fails validation and cannot be published.

The allowlist is not bureaucracy. It is what makes the following possible: reliable client-side rendering, safe normalisation for duplicate detection, deterministic conversion into an alternative representation later, and confidence that an AI-generated expression cannot inject something the renderer chokes on. An unrestricted LaTeX field is an unbounded compatibility surface.

**Validation at authoring time.** Every expression is parsed and rendered headlessly in CI/ingestion. If it does not render, it does not publish. Ever. A `$` that never closes is the classic content defect and it is trivially preventable.

**Rendering on the client.** Use **KaTeX**, which is fast, synchronous, and covers the CSEC-level subset comfortably. In React Native the practical choices are a KaTeX-in-WebView wrapper or a native math view. Recommendation: evaluate both in Phase 1 against a corpus of 200 real expressions on a low-end Android device, and choose on measured render latency and layout stability. **This is a designated technical spike (§S Phase 1)** — it is exactly the kind of decision that is cheap to make with evidence and expensive to reverse.

**The safety net.** For any expression that fails to render client-side, the publish pipeline holds a **pre-rendered SVG** in Storage. The client falls back to the image. This guarantees a student never sees raw LaTeX source, which is the worst possible failure and instantly signals amateurism.

**Normalisation.** A canonical form (whitespace, equivalent command spellings, brace usage) is computed at publish time and stored alongside. Used for duplicate detection (§E.10) and for answer matching where an expression answer is compared structurally (§I.9).

**Mixed content.** Prose and mathematics interleave constantly. The block model in §G.3 handles this; the renderer must handle inline mathematics inside a sentence without breaking line-wrapping on a narrow screen — a specific, testable requirement.

### G.9 Migration contract for the legacy JSON

The existing dataset is a valuable seed and a poor schema. Both things are true, and the migration should treat it accordingly.

**Preserve without question:** worked solutions, final answers, LaTeX expressions, paper/year/question-number metadata, concepts, diagram information, common-error notes. This is real intellectual work and it is the reason the project starts from a running start rather than zero.

**Do not preserve:** the schema shape itself. A flat per-question JSON document with embedded topic strings cannot support versioning, cross-syllabus mapping, controlled skill vocabularies, answer specifications, or review history — all of which this blueprint requires.

**Anticipated weaknesses to check for [VERIFY-JSON]:**

1. Topic labels as free text rather than references — will need mapping to the taxonomy, probably semi-automatically with human confirmation.
2. No Specific Objective mapping at all. This is the largest expected gap and the largest piece of migration work.
3. Answers stored as display strings ("x = 3.5 cm") rather than structured values with units — cannot be used for validation as-is; needs parsing into answer specifications.
4. Worked solutions as a single prose/LaTeX blob rather than ordered steps — needs splitting, which AI can propose and a human must confirm.
5. Inconsistent LaTeX conventions across records, especially if assembled over time or from multiple sources.
6. No difficulty rating, or an inconsistent one.
7. No provenance or rights status.
8. No versioning or review history.
9. Diagram references that may be missing, broken, or textual descriptions rather than assets.
10. Possible duplicates within the dataset itself.
11. Possible OCR-origin errors in mathematics (a classic: `5` vs `S`, minus signs lost, exponents flattened) — **this is the highest-risk category and requires a full human read of a sample before trusting the set**.
12. No profile-dimension (CK/AK/R) tagging.

**Migration approach.** A one-way, re-runnable, idempotent import into a staging area, never directly into published content. Each legacy record becomes a `draft` question with its legacy ID retained for traceability. Automated validators run. AI proposes taxonomy mapping, step splitting and answer-spec extraction. Every record then passes human review before publication. **No legacy record is published without a human having read it.** Given a realistic reviewer throughput of 30–60 questions per day, this is the actual critical path to MVP (§S Phase 2, §T.4) and it should be resourced accordingly from day one rather than discovered in month three.

### G.10 Review history

Every review event is retained: reviewer, timestamp, decision (`approved` / `changes_requested` / `rejected` / `suspended`), free-text note, and a diff of what changed. This supports accountability, reviewer quality measurement, and the forensic question "who approved this, and what did they see?" — which will be asked the first time a wrong solution reaches students.

---

## SECTION H — PAST PAPER SYSTEM

_V1 feature. Included in MVP only as a data structure, not a student-facing mode._

### H.1 Position and dependency

The past paper system is the most requested feature in this category of product and the one with the greatest legal exposure (§V R-01). **It must not be built before the rights position is resolved.** The architecture supports it fully; the decision to expose it is a business one.

If rights cannot be obtained, the same architecture serves **EdMar Practice Papers** — original papers constructed to the authentic specification (Paper 01: 60 items; Paper 02: nine or ten structured questions; correct timing, correct section balance). This is a fully viable substitute product and, notably, several successful revision publishers operate exactly this way.

### H.2 Paper library

Browsable by year and sitting, with per-paper status: not started / in progress / completed, and best score. Filterable by syllabus version — a student sitting V2027 should not be shown V2018 papers by default, though they remain available as extra practice with a clear label explaining the structural difference.

### H.3 Paper metadata

Sitting year, sitting month, paper code, syllabus version, total marks, official duration, question count, section/module coverage summary, and rights status. Rights status is a real field with real behaviour: `licensed`, `original`, `adapted`, `unavailable`. An `unavailable` paper is invisible to students regardless of any other state.

### H.4 Paper questions

Papers reference questions by ordered position, with their original numbering and part labels preserved. A question can belong to a paper _and_ appear in topic practice — the same content object, two access paths. This is why questions are not stored inside papers.

Multi-part structured questions (2(a), 2(b)(i), 2(b)(ii)) are modelled as a parent question with ordered parts, each with its own answer specification, marks and solution steps (§I.10).

### H.5 Navigation

Within a paper: question list with answered/unanswered/flagged state, direct jump to any question, flag-for-review, next/previous. This mirrors real examination behaviour — students skip and return — and a linear-only navigation makes paper mode feel unlike an examination, which defeats its purpose.

### H.6 Paper mode and timed mode

**Practice paper mode:** work through at leisure, check answers as you go, solutions available immediately. This is learning.

**Timed exam mode:** the official duration, a visible countdown, **no solutions until submission**, no answer checking during the attempt, and automatic submission at time expiry with everything answered so far. This is rehearsal, and its value depends entirely on the constraints being real.

Timed mode must survive the app being backgrounded — a student takes a call during a 2h40m paper. The timer is anchored to a server-issued start timestamp, not to client uptime, and the session resumes correctly. Getting this wrong ruins the feature.

### H.7 Results

Total score, per-question marks (for structured papers, marks awarded per part), time taken versus allowed, and a breakdown by syllabus section and by profile dimension. The section breakdown is the analytically valuable output: _"You lost 18 of your 34 dropped marks in Geometry and Trigonometry."_

**Marking honesty.** Automated marking of structured questions can only award marks for answers the answer specification can judge. Method marks — a substantial share of Paper 02 marks in reality — cannot be awarded automatically without either AI (prohibited, §B-6) or human marking. **The product must say so plainly**: report an "answer-mark score" and be explicit that a real examiner awards method marks the app cannot see. Overstating marking fidelity is a trust failure waiting to happen and would be seized on by any teacher evaluating the product.

### H.8 Review mode

After submission: every question with the student's answer, the correct answer, the full worked solution and the explanation. Filterable to incorrect only. Directly actionable — _"practise this topic"_ from any missed question, which converts a post-mortem into practice, the single most valuable transition in the product.

### H.9 Topic analysis from papers

Paper attempts feed the same mastery model as topic practice (§J), weighted slightly higher because a paper attempt is a more valid signal — closer to examination conditions, less scaffolded. Per-paper topic analysis is presented as a chart of marks lost by section, with a direct route into targeted practice for the worst two.

---

## SECTION I — STUDENT ANSWER SYSTEM

### I.1 The governing rule

**Answer validation is deterministic. AI is never used to judge a student's answer.**

This is not merely cost. It is:

- **Correctness** — a language model asked "is `0.667` an acceptable answer to a question whose answer is `2/3`?" will usually be right and occasionally not, and it will not be consistent across students. Deterministic rules are consistent by construction.
- **Speed** — local evaluation returns in single-digit milliseconds.
- **Availability** — works offline.
- **Auditability** — when a student disputes a marking, there is a rule to point at.
- **Cost** — zero marginal cost per attempt.

The intellectual work is moved to authoring time: deciding what counts as correct is a _content_ decision made once, by a human, and recorded in the answer specification. This is the right place for it.

### I.2 Answer types

| Type                        | Example               | Validation                                                   |
| --------------------------- | --------------------- | ------------------------------------------------------------ |
| `multiple_choice`           | Select one of A–D     | Exact option-ID match                                        |
| `multi_select`              | Select all that apply | Set equality                                                 |
| `true_false`                |                       | Exact match                                                  |
| `numeric_exact`             | `36`                  | Exact after normalisation                                    |
| `numeric_tolerance`         | `3.14` (±0.005)       | Absolute or relative tolerance                               |
| `numeric_sf` / `numeric_dp` | "to 2 decimal places" | Value _and_ precision both checked                           |
| `fraction`                  | `3/4`                 | Rational equality, optionally requiring lowest terms         |
| `mixed_number`              | `1 1/2`               | Rational equality                                            |
| `ratio`                     | `3:5`                 | Proportional equality, optionally requiring simplest form    |
| `currency`                  | `$45.50`              | Numeric with 2dp and currency handling                       |
| `with_units`                | `12 cm²`              | Value + unit, with unit conversion where declared acceptable |
| `expression`                | `2x + 3`              | Structural/symbolic equivalence (§I.9)                       |
| `coordinate`                | `(3, -2)`             | Componentwise numeric                                        |
| `set`                       | `{2, 3, 5}`           | Set equality, order-independent                              |
| `interval` / `inequality`   | `x > 4`               | Normalised comparison                                        |
| `matrix` / `vector`         |                       | Elementwise numeric                                          |
| `structured`                | Multi-part            | Each part validated independently (§I.10)                    |

### I.3 Input normalisation

Applied before comparison, and applied identically on client and server. A student must never be marked wrong for formatting.

Strip whitespace and thousands separators. Accept `,` or `.` as decimal separator where unambiguous by locale. Normalise unicode minus, en-dash and hyphen to a single minus. Normalise `×`, `*`, `x` (in numeric contexts) and implicit multiplication. Accept `^` and superscript digits for exponents. Normalise unit spellings and casing against a controlled unit vocabulary (`cm2`, `cm^2`, `cm²`, `sq cm` → the same unit). Trim leading `+`. Accept a leading `=` or restatement (`x = 5` where `5` was expected) when the specification permits it — students do this constantly and failing them for it is indefensible.

**Normalisation is shared code between the mobile client and the server validator.** Divergence between them produces the worst class of bug in this system: a student who is told they are right and recorded as wrong. Single source, shared package, property-tested against each other in CI.

### I.4 The answer specification

The object attached to each question version that fully determines correctness:

- **Answer type** (from I.2)
- **Canonical value** — the machine-comparable form
- **Display value** — the human-readable correct answer shown in the result screen
- **Accepted alternative forms** — an explicit list of other correct representations
- **Tolerance** — absolute or relative, where applicable
- **Precision requirement** — significant figures or decimal places, and whether precision is _required_ or merely _accepted_
- **Unit requirement** — required / optional / must-match / convertible-set
- **Form requirement** — e.g. fraction must be in lowest terms, ratio in simplest form, surd simplified
- **Case sensitivity** — for the rare text answer
- **Normalisation profile** — which of I.3's rules apply
- **Common-error values** — the wrong answers to recognise (§G.5)

**Critically: the accepted-forms list is generated once, at authoring time, with computer algebra assistance and human confirmation.** For a question whose answer is `3/4`, the pipeline pre-computes and stores `0.75`, `.75`, `75%` (if the specification allows percentage form), `6/8` (accepted only if lowest terms are not required), and so on. The runtime then does nothing cleverer than a normalised lookup.

This single decision is what allows sophisticated equivalence handling with zero runtime cost and zero runtime ambiguity — and it is the pattern that should be reached for whenever "we'll need AI to judge this" is proposed.

### I.5 Multiple choice

Exact match on option ID, not on option text — text can be edited without invalidating history. Options are presented in a seeded random order unless `preserve_order` is set. A wrong selection is matched against the option's linked common error to produce targeted feedback.

### I.6 Numerical and decimal answers

Compare canonical numeric values within the specified tolerance. Where the question demands a precision ("give your answer to 3 significant figures"), **both value and precision are checked**, and a right value at the wrong precision produces a distinct, specific message — _"Correct value, but the question asked for 3 significant figures"_ — which is a real CSEC mark-loser and worth teaching directly.

Guidance for authors: prefer explicit tolerances over relying on defaults; a tolerance that is too tight fails honest students who rounded at a different stage, and one too loose accepts wrong work. Where a question involves intermediate rounding, the answer specification should accept the range produced by rounding at any reasonable stage, with those bounds computed at authoring time.

### I.7 Fractions

Parse into a rational, reduce, compare. Handle mixed numbers, improper fractions, negatives (`-3/4`, `3/-4`, `-(3/4)`). Where the question requires lowest terms, an unreduced but numerically-equal answer is judged _correct with a note_ rather than wrong, unless the objective being assessed is specifically simplification — in which case it is wrong and the message says why. This distinction is a content decision recorded in the specification, not a global rule.

### I.8 Equivalent answers

The general principle: **equivalence is enumerated at authoring time, not decided at runtime.** The accepted-forms list plus normalisation covers the overwhelming majority of cases. Where an answer genuinely has an unbounded set of equivalent forms, the answer type must be `expression` and §I.9 applies.

### I.9 Algebraic expressions

The hardest case, handled in three tiers:

- **Tier 1 (MVP)** — canonical-form comparison. Normalise the student's input into a canonical algebraic form (ordered terms, collected like terms, standard spacing) and compare against the stored canonical form and its accepted variants. Handles `2x+3`, `3+2x`, `2*x + 3` correctly. Fails on genuinely different but equivalent forms such as `(x+1)(x+2)` versus `x²+3x+2`.
- **Tier 2 (V1)** — structural equivalence via a lightweight client-side computer algebra library, comparing expanded/simplified normal forms. Handles the factorisation case. Runs on-device, still deterministic, still free.
- **Tier 3 (authoring-time, all releases)** — a full CAS in the content pipeline enumerates the expected equivalent forms and stores them. Wherever the expected answer space is finite and small, this reduces the runtime problem to Tier 1.

**Where genuine ambiguity remains, the answer specification must instead demand a specific form** ("give your answer in the form `ax² + bx + c`") — which is standard CSEC phrasing anyway, so this is a constraint the examination itself already applies. Prefer this to building a general algebraic equivalence engine.

### I.10 Structured multi-part answers

Each part carries its own answer specification, marks, solution steps and explanation. Parts are answered and validated independently. Reported per-part and in aggregate.

**Follow-through (error carried forward)** is worth stating explicitly because CSEC examiners apply it: a student who gets part (a) wrong and then uses their wrong value correctly in part (b) earns marks in a real examination. Full automated follow-through is out of scope for MVP and V1 — it requires re-deriving part (b) from the student's part (a) value. Two mitigations: (1) where the dependency is simple and the derivation is a stored formula, the answer specification may declare a follow-through rule; (2) otherwise, the results screen states plainly that method and follow-through marks are not modelled. Do not silently under-mark students and let them conclude they are worse than they are. This is a specific, foreseeable trust failure.

### I.11 Where AI is permitted in the answer system

Exactly one place: **offline, at authoring time**, to _propose_ accepted alternative forms and likely common errors for human confirmation. Its output is never used unreviewed, and it never runs while a student is waiting.

---

## SECTION J — STUDENT PROGRESS SYSTEM

### J.1 What this system is for

Two jobs, and it is worth being clear which is which:

1. **Tell the student the truth about where they stand** — specifically enough to act on.
2. **Decide what they should practise next** — so they do not have to.

A third, commercial job follows from doing those two well: visible accumulated progress is the primary retention mechanism in this product (§A.8).

What it is explicitly _not_ for: predicting a CSEC grade (§V R-09), ranking students against each other, or generating engagement pressure.

### J.2 Attempts — the atomic record

Every attempt records: student, question, question version, session, whether it was correct, the raw answer given, the normalised answer, the matched common error (if any), time taken, whether it was skipped, whether a solution was viewed before answering (should be impossible, but recorded as a guard), the difficulty band, the skills exercised, the specific objectives, the practice context (topic practice / recommended / paper / timed), and both client and server timestamps.

Attempts are **append-only and immutable**. Everything else in this section is derived from them and can be fully recomputed. This matters: mastery algorithms _will_ be tuned, and a recomputable derived state means tuning is a migration rather than a data loss.

### J.3 Accuracy

Reported at several scopes (overall, section, subtopic, objective, skill, difficulty band) and over several windows (all time, last 30 days, last 20 attempts). The recent window is what the student cares about; the all-time figure is what makes the recent one meaningful.

Skipped questions are excluded from accuracy but recorded separately, because skip rate is an independent and useful signal — a high skip rate on a topic means "I don't know where to start", which is different from "I make errors".

### J.4 Mastery — conceptual algorithm

**Design requirements**, in priority order:

1. **Explainable.** A student must be able to understand why their number moved. This rules out anything opaque.
2. **Recomputable and cheap.** Updated incrementally per attempt, fully recomputable from the attempt log.
3. **Honest about uncertainty.** Two attempts must not produce a confident number.
4. **Difficulty-aware.** Getting a band-5 question right is worth more than a band-1.
5. **Recency-weighted.** A student improves; evidence from three months ago should not anchor them.

**The model.** For each _skill_, mastery is a 0–100 score built from three components:

**(a) Recency-weighted, difficulty-adjusted performance.** Each attempt contributes evidence weighted by (i) an exponential recency decay — recent attempts weigh more, with a half-life of roughly 20 attempts or 30 days, whichever comes first — and (ii) a difficulty weight, so that a correct answer on a harder question contributes more credit and an incorrect answer on an easier question contributes more penalty. Conceptually this is an exponentially-weighted moving average of difficulty-adjusted outcomes.

**(b) A confidence factor.** Evidence accumulates with attempts and with the number of _distinct questions_ attempted (five attempts at one question is much weaker evidence than five attempts at five questions). Below a floor of roughly 5 distinct questions, mastery is not reported as a number at all — it is shown as "getting started" (§J.6). Between 5 and 15, the score is shrunk toward a neutral prior, so it moves conservatively. Above 15 it is reported at full weight.

**(c) A coverage factor.** A skill assessed at only one difficulty band, or through only one question type, cannot be described as mastered. Coverage caps the achievable score: a student who has only ever answered band-1 and band-2 questions on a skill is capped below the top range regardless of accuracy. This prevents the single most damaging failure of naive mastery systems — a student shown 95% who is then destroyed by the examination.

**Rolling up.** Skill → Specific Objective → subtopic → section → overall, each level a coverage-weighted mean of its children, weighted by how many questions exist at that level and, for the top-level figure, by the examination weighting of each section. A section with no attempts is _unknown_, not zero — a crucial distinction, since displaying 0% for untouched topics tells a student they are failing at something they have simply not started.

**Deliberately not in MVP:** Bayesian Knowledge Tracing, Item Response Theory, or a learned model. They are better in principle, they require per-item parameters that need thousands of attempts to estimate, and they are not explainable to a sixteen-year-old. Revisit at V2 with real data (§J.10). The design above is deliberately the _boring_ one (B-13), and it is recomputable, so upgrading later is safe.

### J.5 Mastery bands

Presented in words, with the number secondary:

| Score  | Label           | Meaning to the student                           |
| ------ | --------------- | ------------------------------------------------ |
| —      | Not started     | No attempts                                      |
| —      | Getting started | Fewer than 5 distinct questions; no score shown  |
| 0–39   | Needs work      |                                                  |
| 40–59  | Developing      |                                                  |
| 60–74  | Competent       |                                                  |
| 75–89  | Strong          |                                                  |
| 90–100 | Mastered        | Capped by coverage — unreachable without breadth |

### J.6 Honesty rules

These exist because a progress system that flatters students is worse than none.

- No numeric score below the evidence floor.
- Untouched content is "not started", never 0%.
- A guessed correct answer on a multiple-choice question is worth less credit than a correct constructed answer — multiple choice carries a guessing discount in the evidence weighting proportional to the number of options.
- Mastery **decays** with disuse: a skill untouched for 60+ days drifts down slowly toward the confidence-shrunk value. Framed constructively ("time for a refresher"), never punitively.
- Overall readiness is explicitly _not_ a predicted grade, and the interface says so (§V R-09).

### J.7 Weak and strong areas

Weak areas are ranked by a combination of low mastery, high examination weighting, and sufficient evidence to be confident. A topic that is weak _and_ heavily examined outranks one that is weak and rarely examined — this is the difference between a helpful recommendation and a merely accurate one.

Strong areas are shown too, and matter more than they appear: a student who only ever sees their failures stops opening the app.

### J.8 Recommended practice

The recommendation engine is deterministic, rule-based, and explainable. No AI. It scores candidate practice targets on:

- Mastery deficit (low mastery scores higher)
- Examination weight of the containing section
- Recency of failure (recent errors score higher)
- Spaced repetition due-ness — a previously-failed question or skill becoming due for re-testing on an expanding interval (1, 3, 7, 21 days)
- Repeated misconceptions (§G.5) — three triggers of the same common error is a strong, specific target
- Content availability (never recommend a topic with too few unseen questions)
- Staleness of decayed skills
- A diversity penalty so the student is not sent to the same topic four sessions running

The top-scoring target becomes the single home-screen recommendation, **with its reason stated in one sentence**. The reason is not decoration; an unexplained recommendation is ignored.

### J.9 Diagnostic (V1)

A 20–25 question adaptive-ish assessment spanning all sections, offered to students who have completed several sessions — not to new installs (§C.1). Its purpose is to bootstrap mastery estimates across untouched areas so that recommendations become useful faster. Selection walks difficulty up and down per section based on running performance. Results present as a coverage map, explicitly framed as a starting point rather than a verdict.

### J.10 Evolution path

With 100,000+ attempts, the empirical data supports genuine item calibration: per-question difficulty parameters estimated from response data, then a proper knowledge-tracing model. Because attempts are immutable and mastery is derived, this can be introduced by recomputation and validated against the existing model before switchover. Design for it now by keeping the attempt record rich (J.2); build it in V2 at the earliest.

---

## SECTION K — AI CONTENT PIPELINE

### K.1 Position

AI is the content factory (§2.1, Plane 1). It runs offline, in batch, triggered by administrators, and its every output is validated deterministically and approved by a human before it can reach a student. Nothing in this section runs while a student is waiting.

### K.2 The pipeline

```
  SOURCE DOCUMENT (PDF / DOCX / legacy JSON)
        │
   [1]  ▼  EXTRACTION                    ── AI + OCR ──
        │  text, mathematics, diagrams, structure
        │
   [2]  ▼  QUESTION IDENTIFICATION       ── AI ──
        │  segment into discrete questions and parts
        │
   [3]  ▼  NORMALISATION                 ── deterministic ──
        │  LaTeX canonicalisation, block structuring, asset extraction
        │
   [4]  ▼  CLASSIFICATION                ── AI, human-confirmed ──
        │  type, difficulty, profile dimension, skills
        │
   [5]  ▼  CURRICULUM MAPPING            ── AI, human-confirmed ──
        │  → Specific Objectives, both syllabus versions
        │
   [6]  ▼  ANSWER SPEC EXTRACTION        ── AI + CAS, human-confirmed ──
        │  canonical value, accepted forms, tolerance, units
        │
   [7]  ▼  SOLUTION DRAFTING             ── AI ──
        │  ordered steps, LaTeX + prose, marks
        │
   [8]  ▼  EXPLANATION DRAFTING          ── AI ──
        │  concept, trap, recognition cue
        │
   [9]  ▼  COMMON ERROR DERIVATION       ── AI + CAS ──
        │  wrong values and the misconceptions behind them
        │
  [10]  ▼  DETERMINISTIC VALIDATION      ── NO AI ──
        │  ┌────────────────────────────────────────────┐
        │  │ schema · LaTeX render · CAS verification of │
        │  │ the final answer · step continuity · unit   │
        │  │ consistency · asset presence · alt text ·   │
        │  │ curriculum reference integrity              │
        │  └────────────────────────────────────────────┘
        │  FAIL ──► rejected or returned for regeneration
        │
  [11]  ▼  DUPLICATE DETECTION           ── deterministic + embeddings ──
        │  §E.10, three layers
        │
  [12]  ▼  HUMAN REVIEW                  ── QUALIFIED SME ──
        │  approve / edit / request changes / reject
        │
  [13]  ▼  PUBLICATION                   ── admin action ──
        │  status → published, content_version++, audit logged
        │
        ▼  SUPABASE ──► STUDENT APP
```

### K.3 Extraction (steps 1–3)

The hardest technical step, and the one most likely to be underestimated. Mathematical PDFs are hostile: multi-column layouts, mathematics as vector graphics or images, diagrams interleaved with text, question numbering that resets, and parts that span page breaks.

Approach: use a document-understanding model with vision capability rather than plain text extraction, since mathematical notation is frequently lost or mangled by text-layer extraction. Output structured candidates, not prose. Extract diagrams as image regions for later human replacement with clean SVG — **auto-extracted diagram crops are acceptable for review but should not be published**; they look poor and often carry source branding.

**Assume a meaningful failure rate and design the review queue for it.** Extraction quality is the single largest driver of downstream human review time, and improving the extraction prompt is far cheaper than paying reviewers to fix its output. Budget a tuning cycle.

### K.4 Classification and mapping (steps 4–5)

AI proposes; humans confirm. The reviewer sees the proposal with the AI's stated reasoning and the relevant syllabus text side by side, so confirming is a two-second action and correcting is a two-click one. Getting this interaction right is the difference between 30 and 60 reviewed questions per reviewer-day, which is the difference between a three-month and a six-week content ramp.

Confidence is recorded. Low-confidence mappings are routed to a stricter review path. Mis-mapping silently corrupts mastery and recommendations (§E.3), so this is worth the extra step.

### K.5 Generation (steps 6–9) and variants

For questions from source documents, solutions may already exist and AI's job is structuring rather than solving. For original and variant questions, AI drafts genuinely new content.

**Variant generation** is the highest-leverage AI operation in the product: take an approved question and produce structurally identical items with different numbers and contexts. It multiplies a reviewed question into a family, addresses content starvation (§E.4), and reduces the chance that two students share answers.

Constraints, all of which matter:

- Variants are generated only from **already-approved** source questions.
- The numbers must be chosen so that the answer remains reasonable (no answers of `0.0000317` where the original was `12`); the pipeline verifies this with a CAS and rejects variants that produce ugly or degenerate answers.
- Each variant is solved independently by CAS and the AI's stated answer is checked against it. Disagreement is an automatic rejection.
- Variants join the source's variant family (§E.10) and are never served alongside it.
- **Variants still require human review**, though review is fast because the reviewer is checking a known structure with new numbers.

### K.6 Deterministic validation (step 10) — the quality backbone

Every item, whatever its origin, must pass all of the following before a human ever sees it. **No AI participates in this gate**, which is the entire point of it.

| Check                       | Rejects                                                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema completeness         | Missing stem, answer spec, solution, explanation, curriculum link                                                                                                                                             |
| LaTeX allowlist             | Commands outside the permitted subset (§G.8)                                                                                                                                                                  |
| LaTeX render                | Anything that fails headless rendering                                                                                                                                                                        |
| **CAS answer verification** | Where the question is symbolically tractable, the CAS independently derives the answer and compares to the stated one. **A mismatch is an automatic reject.** This is the highest-value check in the pipeline |
| Step continuity             | A solution step whose result does not follow from the previous one, where checkable                                                                                                                           |
| Numeric sanity              | Answers with absurd magnitude, precision, or sign for the context                                                                                                                                             |
| Unit consistency            | Dimensional analysis across the solution; area answers in cm not cm²                                                                                                                                          |
| Answer-spec coherence       | Canonical value parses as its declared type; tolerance is sane; accepted forms are genuinely equal                                                                                                            |
| Distractor validity         | No distractor equals the correct answer; distractors are distinct                                                                                                                                             |
| Option balance              | Multiple choice has the right number of options; no "all of the above" unless the source has it                                                                                                               |
| Asset integrity             | Referenced assets exist; every asset has alt text                                                                                                                                                             |
| Curriculum integrity        | Objective references resolve in the declared syllabus version                                                                                                                                                 |
| Duplicate hash              | §E.10 layers 1–2                                                                                                                                                                                              |
| Reading level               | Explanation prose within a target readability band — it is written for a 15-year-old                                                                                                                          |
| Prohibited content          | Names, contact details, source watermarks, third-party branding                                                                                                                                               |

A failing item is either auto-rejected or returned for a single bounded regeneration attempt. **It is never sent to human review in a known-broken state**, because the fastest way to destroy reviewer throughput is to make them do the validator's job.

### K.7 Human review (step 12) — the gate that cannot be automated

**Reviewers must be qualified in CSEC Mathematics.** This is not a general content-moderation task; a reviewer who cannot independently solve the question cannot verify the solution, and a review process staffed by unqualified reviewers is theatre.

The reviewer sees, on one screen: the rendered question exactly as a student would; the answer specification with its accepted forms; the full worked solution; the explanation; the proposed curriculum mapping with the syllabus text alongside; the AI provenance; the validation report; and any duplicate candidates. They can edit anything inline before approving.

Decisions: **approve** (publishable), **approve with edits** (recorded as a diff), **request changes** (back to the pipeline with a note), **reject** (discarded with a reason, which feeds prompt improvement), **escalate** (second reviewer for genuinely ambiguous items).

**Throughput planning.** A qualified reviewer sustainably handles roughly 30–60 items per day depending on complexity and the quality of the incoming batch. To reach 1,200 published questions for MVP: approximately 20–40 reviewer-days. **This is the critical path** (§S, §T.4) and it is the thing most likely to be underestimated when the software looks nearly finished.

**Reviewer quality is itself measured:** approval rates, subsequent student-report rates on items each reviewer approved, and periodic double-review of a random sample. A reviewer who approves fast and generates complaints is a bigger problem than a slow one.

### K.8 AI-generated versus human-approved — the essential distinction

|                     | AI-generated                                                   | Human-approved                                           |
| ------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| Definition          | Any artefact produced by a model                               | An artefact a qualified reviewer has explicitly approved |
| Visible to students | **Never** in that state                                        | Yes, when published                                      |
| Stored              | Yes, with full provenance                                      | Yes, with review event and diff                          |
| Can be published    | No                                                             | Yes                                                      |
| Overlap             | An item is almost always both: AI-drafted _and_ human-approved |                                                          |

The system must never conflate "produced by AI" with "unreliable" or "human-approved" with "not AI-touched". The meaningful line is **approval**, and it is enforced by status, by RLS (I-2), and by the audit log.

### K.9 Prompt and model management

Prompts are versioned artefacts in the repository, reviewed like code. Every AI output records the prompt version that produced it, which makes it possible to answer "did the quality drop when we changed the classification prompt?" — a question that will be asked.

Model selection is per pipeline stage and configurable, not hard-coded: a strong reasoning model for solution drafting where accuracy dominates; a cheap fast model for classification where a human confirms anyway; an embedding model for duplicates. Deliberately mixed, because using an expensive model for classification is the most common avoidable overspend in pipelines like this.

A **golden set** of 50–100 fully human-verified questions is kept as a regression suite. Any prompt or model change is run against it and the outputs diffed before the change is adopted. This is what prevents a silent quality regression from reaching students.

---

## SECTION L — AI COST-CONTROL STRATEGY

### L.1 The core insight

AI cost in this product is **capital expenditure on a durable asset**, not cost of goods sold.

A question is processed once and served to every student who ever practises that topic. A question costing US$0.20 in AI to produce and serve to 5,000 students over three years costs US$0.00004 per student-view. The same question generated per-attempt would cost thousands of dollars over the same period and deliver a worse, less consistent product.

Every decision in this section follows from moving work from the per-attempt axis to the per-question axis.

### L.2 Operations that require AI

Exclusively in the content factory, exclusively in batch:

| Operation               | Frequency           | Why AI                                                      |
| ----------------------- | ------------------- | ----------------------------------------------------------- |
| Document extraction     | Per source document | Vision + layout understanding; no deterministic alternative |
| Question segmentation   | Per document        | Structural judgement                                        |
| Classification          | Per question, once  | Language understanding; human-confirmed                     |
| Curriculum mapping      | Per question, once  | Semantic matching to syllabus text; human-confirmed         |
| Solution drafting       | Per question, once  | Natural-language generation                                 |
| Explanation drafting    | Per question, once  | Natural-language generation, pitched for a student          |
| Common-error derivation | Per question, once  | Pedagogical judgement about likely misconceptions           |
| Variant generation      | Per variant, once   | Generation                                                  |
| Duplicate embeddings    | Per question, once  | Semantic similarity                                         |
| Admin review assistance | On demand           | Optional convenience for reviewers                          |

### L.3 Operations that must never use AI

| Operation                                    | Instead                                                                                                          |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Judging a student's answer**               | Deterministic evaluation against the answer specification (§I)                                                   |
| **Serving a solution or explanation**        | Stored, reviewed text                                                                                            |
| **Selecting the next question**              | Postgres selection function (§E.4)                                                                               |
| **Computing mastery**                        | Deterministic algorithm (§J.4)                                                                                   |
| **Generating recommendations**               | Deterministic rules (§J.8)                                                                                       |
| **Marking a paper**                          | Answer specifications per part (§H.7)                                                                            |
| **Any student-initiated request whatsoever** | There is no student action that reaches a model                                                                  |
| **Content validation**                       | CAS and rule checks (§K.6) — validation by the same class of system that generated the content is not validation |

That last row deserves emphasis: using AI to check AI is a correlated-failure design. The check must be of a different kind, which is why the validation gate is deterministic.

### L.4 Caching and permanent storage

Everything AI produces is stored permanently and never regenerated:

- Solutions, explanations, common errors, classifications, mappings — stored on the question version, immutable, reused forever.
- Accepted answer forms — computed once, stored, used at every attempt.
- Embeddings — stored, reused for every future duplicate check.
- Extraction outputs — retained, so a pipeline change does not require re-processing (and re-paying for) the source document.
- Pre-rendered LaTeX SVG fallbacks — generated at publish, served from CDN.

**Rule: if a model produced it, it is written to the database and never asked for again.**

### L.5 Batch and offline execution

All AI work runs as background jobs against a queue, initiated by an administrator or a schedule. Nothing is synchronous with a user action, which means: batch APIs and their discounts are available; failures are retried without anyone waiting; jobs can be run in off-peak windows; a provider outage delays content work and does not affect a single student.

### L.6 Rate limiting and spend control

- **Hard monthly spend cap** at the provider account level. Not a target — a cap.
- **Per-job budget estimate before execution.** An admin uploading a 40-page document sees an estimated cost and must confirm. The scenario this prevents is a well-meaning admin queueing 200 documents on a Friday.
- **Per-stage token limits**, so a malformed input cannot produce an unbounded generation.
- **Concurrency limits** on the job queue.
- **Daily spend alerting** with a threshold that triggers a human, and a circuit breaker that pauses the queue at 80% of monthly cap.
- **Model tiering by stage** (§K.9) — cheap models where a human confirms anyway.
- **No AI credentials anywhere near the student app.** Keys live in server-side secrets, reachable only by the job runner. The mobile bundle cannot call a model even if someone tries to make it (I-1, §O.7).

### L.7 Illustrative economics

Figures are indicative, for shaping decisions rather than for budgeting; real numbers depend on provider pricing and document quality, and should be measured on a 50-question pilot batch in Phase 1.

**Content build, one-off:**

| Item                       | Assumption                      | Cost                |
| -------------------------- | ------------------------------- | ------------------- |
| Full pipeline per question | ~US$0.10–0.30 including retries |                     |
| 1,200 questions (MVP)      |                                 | **~US$120–360**     |
| 3,000 questions (V1)       |                                 | **~US$300–900**     |
| 10,000 questions (mature)  |                                 | **~US$1,000–3,000** |
| Ongoing content additions  | ~300 questions/month            | ~US$30–90/month     |

**Runtime, per student:** US$0.00. There is no per-attempt AI call.

**Fixed infrastructure:** Supabase Pro from ~US$25/month, Vercel ~US$0–20/month, storage and CDN ~US$5–25/month. Call it **US$50–150/month** across the whole service to well past 10,000 students.

**Unit economics at 1,000 subscribers:**

| Line                                         | Amount                                           |
| -------------------------------------------- | ------------------------------------------------ |
| Gross revenue                                | US$4,000/month                                   |
| Less store commission (15%)                  | −US$600                                          |
| Net revenue                                  | US$3,400                                         |
| Less infrastructure                          | −US$100                                          |
| Less ongoing AI content                      | −US$60                                           |
| **Contribution before people and marketing** | **~US$3,240 — 95% of net revenue, 81% of gross** |

**The counterfactual, for contrast.** With one model call per attempt at US$0.01 and a student doing 5 questions a day: US$1.50 per student per month, or roughly **44% of net revenue**, scaling directly with engagement. At 1,000 subscribers that is US$1,500/month against US$160 — a difference of an order of magnitude, growing.

The dominant real costs in this business are **content review labour** and **customer acquisition**, not compute. Which is the correct place for the costs to sit, because both buy durable assets.

### L.8 Cost-control review rules

Any proposed feature must answer: _does this add per-student marginal cost?_ If yes, it needs an explicit economic justification and a cap, and it should probably be redesigned. The pattern to reach for is always the same one used for answer specifications (§I.4): **move the expensive computation to authoring time, store the result, make the runtime a lookup.**

---

## SECTION M — ADMIN SYSTEM

### M.1 Position and users

A Next.js application on Vercel, desktop-first, authenticated through the same Supabase Auth instance as the student app but gated on role. It is an internal tool for a small team, so it should be optimised for **throughput of the review queue** rather than for visual polish. Content review speed is the business's rate limiter (§K.7); every second saved per item compounds across thousands of items.

Roles:

| Role               | Can                                                                                |
| ------------------ | ---------------------------------------------------------------------------------- |
| `viewer`           | Read content and analytics                                                         |
| `reviewer`         | Review and approve/reject questions; edit content                                  |
| `curriculum_admin` | Everything above, plus edit the taxonomy and skill vocabulary                      |
| `content_admin`    | Everything above, plus publish, retire, run pipeline jobs                          |
| `support`          | View student accounts, manage entitlements, handle reports — **no content rights** |
| `super_admin`      | Everything, plus role assignment                                                   |

Role separation is enforced in RLS (§O.4), not only in the UI.

### M.2 Dashboard

The landing view answers "what needs my attention?":

- Review queue depth, with age of the oldest item — a queue growing faster than it is drained is the single most important operational signal in the business.
- Items awaiting a second review (escalations).
- Open student problem reports on published questions, sorted by traffic on the affected question.
- Questions flagged by empirical quality monitoring (§E.13).
- Running and failed pipeline jobs, with spend to date this month against cap.
- Published question counts by section and by syllabus version, with gaps highlighted — the "which topics are thin" view that drives content planning.
- Yesterday's active students, attempts, and new subscriptions.

### M.3 Question management

List and search across the whole bank, filterable by every classification axis in §E.3 plus status, provenance, reviewer, date, and quality flags. Bulk operations on selections: assign to reviewer, change status, retire, re-run validation, export.

The list must be genuinely fast at 10,000+ rows with server-side pagination and indexed filters. An admin tool that takes four seconds per page is an admin tool people stop using.

### M.4 Question editor

The most-used screen in the system. Requirements:

- **Split view:** editing on the left, live student-accurate preview on the right. The preview must render exactly as the mobile app does — same KaTeX configuration, same block model, same width constraint — because "it looked fine in admin" is a defect class that reaches students.
- **Structured editing** of stem blocks, options, solution steps, explanation and common errors — not a single text area.
- **LaTeX assistance:** a palette of common CSEC notation, inline render-error highlighting against the allowlist, and immediate feedback rather than a save-time failure.
- **Answer specification builder** with a test harness: the reviewer types candidate student answers and sees immediately whether they would be judged correct. This is the fastest way to catch a too-tight tolerance or a missing accepted form, and it should be prominent.
- **Curriculum mapping** with syllabus text visible alongside, and both syllabus versions handled in one interaction (§F.6).
- **Asset management:** upload, replace, alt-text editing, with alt text enforced before publish.
- **Validation panel** showing the §K.6 report inline, so a reviewer never has to guess why an item is blocked.
- **Version history** with diffs, and a one-click revert to a previous version.

### M.5 Review queue

Optimised for sustained throughput:

- Queue with filters (batch, provenance, confidence, section, reviewer assignment) and a clear "next item" flow. A reviewer should never have to choose what to work on.
- Keyboard shortcuts for approve / request changes / reject / next. This is not a luxury — at 40 items a day, mouse travel is measurable.
- Everything needed to decide, on one screen (§K.7). No tab-switching to check the syllabus.
- Approve-with-edits captures the diff automatically.
- Rejection requires a reason from a controlled list plus optional free text; reasons aggregate into the prompt-improvement loop (§K.9).
- Per-reviewer throughput and quality statistics, visible to the reviewer themselves as well as to admins.

### M.6 AI content review

The same queue with AI-specific affordances: model and prompt version shown, confidence scores per proposed field, the CAS verification result displayed prominently, the source question shown side by side for variants, and batch-level statistics (approval rate for this run, common rejection reasons). A run with an unusually low approval rate should be stoppable in one click, and the remaining items requeued after a prompt fix rather than reviewed one by one.

### M.7 Curriculum management

Manage sections, subtopics, Specific Objectives and skills, per syllabus version; manage the V2018↔V2027 mapping table (§F.6) with a side-by-side interface; view question counts per node to find coverage gaps.

Because the taxonomy is version-controlled seed data (§F.8), the admin UI writes changes as proposed migrations rather than direct edits in production, or at minimum records every change in the audit log with a full before/after. Accidental deletion of a Specific Objective with 300 questions attached must be impossible, not merely discouraged: referential integrity plus a soft-delete with a dependency check.

### M.8 Past paper management

Create papers, define metadata (§H.3), assemble questions in order, set rights status, preview as a student sees it, publish or withhold. A one-action "withdraw this paper and all its questions from student view" control exists specifically for the rights scenario in §V R-01, and it must be tested.

### M.9 User and subscription management

For support staff: find a student by email, view their profile, subscription state and recent activity; grant, extend or revoke entitlement (fully audit-logged); process account deletion and data export requests; view and respond to their problem reports.

**Explicit constraint:** support staff can see account and subscription state and aggregate activity. They do not have a general ability to browse an individual minor's detailed answer history without a recorded support reason. This is a privacy design decision and it should be enforced, not assumed.

### M.10 Analytics

The admin-facing views of §Q: student growth and retention cohorts; practice volume; conversion funnel; content coverage and gaps; question quality outliers; AI spend against budget; pipeline throughput. Sourced from materialised views refreshed on a schedule rather than computed live, so the dashboard cannot degrade the student-facing database.

### M.11 Audit log

Every content state change, taxonomy change, role change, entitlement change and support action, with actor, timestamp, before/after, and reason where applicable. Append-only, not editable by any role including `super_admin`, searchable and exportable. This is the record that answers every "how did that happen?" question the business will ever have.

---

## SECTION N — SUBSCRIPTION MODEL

### N.1 Structure

Two tiers. Resist the temptation to add a third — a middle tier at this price point adds decision friction that costs more conversions than it earns revenue.

### N.2 Design intent

The free tier must be **genuinely useful and clearly insufficient**. A free tier that is useless produces uninstalls; one that is sufficient produces no revenue. The right shape here is a **daily volume limit on full-quality content** — the student experiences the real product, including worked solutions and explanations, and simply runs out. This converts far better than withholding quality, and it is honest.

### N.3 Free tier

| Included                          | Limit                                                            |
| --------------------------------- | ---------------------------------------------------------------- |
| Practice questions                | 10 per day, resetting at local midnight                          |
| Worked solutions and explanations | Full quality, no restriction                                     |
| Topics                            | All sections browsable; a defined free question pool within each |
| Progress tracking                 | Full                                                             |
| Recommended practice              | Yes                                                              |
| Past papers                       | One sample paper (V1)                                            |
| Timed exam mode                   | No                                                               |
| Diagnostic                        | No                                                               |

The daily limit is a configurable server-side value, not a constant in the app. It will need tuning against conversion data, and it should be tunable without a store release. It is also the natural lever for promotional periods ("unlimited practice week before exams").

### N.4 Premium

US$4/month; US$40/year at V1+ (a 17% discount, and a strong option for a student sitting an examination eight months away).

Unlimited questions; the full bank; all past papers; timed exam mode; diagnostic; full analytics; offline packs (V1); priority on problem reports.

### N.5 Entitlement architecture

**Built in MVP even though billing is not.** This is the decision that prevents a painful retrofit.

- An `entitlement` record per student: tier, source (`trial` / `google_play` / `promo` / `school` / `manual`), current period start and end, status (`active` / `grace` / `expired` / `cancelled`), and the platform transaction reference.
- **Entitlement is checked server-side and enforced in RLS.** The client's belief about the student's tier is a display convenience only. A client-side paywall is not a paywall.
- The daily free-question counter is a server-authoritative record, not a device counter, or it is defeated by reinstalling.
- Entitlement checks are a single cheap lookup on the student row, cached in the session, so this adds no meaningful latency.
- The entitlement model is deliberately **source-agnostic**: Google Play, Apple, a future direct payment rail, a school licence, or a manual grant all produce the same entitlement shape. This is what makes school licensing (§U) a business-logic change rather than an architecture change.

### N.6 Billing (V1)

Google Play Billing, since a digital subscription consumed in-app must use it. Commission is 15% on the first US$1M of annual revenue per developer account.

Requirements: server-side receipt validation via the Play Developer API — never trust the client; Real-Time Developer Notifications for renewals, cancellations, grace periods, refunds and holds; restore-purchases on reinstall; correct grace-period and account-hold handling (a student whose card fails should not lose access instantly); and clear, store-compliant disclosure of price, period and cancellation.

**[VERIFY-A-04]:** Google Play merchant support and supported payment methods must be confirmed per target territory before launch. This is a real constraint in parts of the Caribbean and it can invalidate the pricing assumption. If Play billing proves unworkable in a key market, the fallback is a web checkout for entitlement purchased outside the app — permitted in some jurisdictions and store policies, prohibited in others, and requiring specific care. Investigate in Phase 0, not at launch.

### N.7 Seasonality

CSEC is examined in May–June with a January sitting. Expect a heavy subscription cycle: sign-ups building from January, peaking April–May, and a sharp churn in June–July.

This is normal and must not be misread as failure. Responses: promote the annual plan hard in January–February (it converts the seasonal user into a retained one and pulls revenue forward); accept July–August as a trough; use it for content build; consider a low-cost "keep your progress" dormant state rather than fighting churn from students who have finished the examination. Retention should be measured **within cohort by exam sitting**, not as a flat monthly figure, or the numbers will be meaningless (§Q.5).

### N.8 Pricing notes

- US$4/month is a strong price for the region and the value delivered, and it is defensible against the tuition anchor.
- Local-currency display should follow territory. Play handles the mechanics; the product should present a familiar figure rather than a converted one where possible.
- Resist discounting below this level. The cost structure (§L.7) does not require it, and a lower price signals lower quality in an examination-preparation category where students associate cheapness with unreliability.
- A referral mechanism (free weeks for both parties) is a better growth lever than a discount, and preserves the price anchor.

---

## SECTION O — SECURITY ARCHITECTURE

### O.1 Threat model

Worth stating plainly, because it shapes what matters:

| Asset                     | Threat                                  | Severity                             |
| ------------------------- | --------------------------------------- | ------------------------------------ |
| The question bank         | Bulk extraction by a competitor         | **High** — it is the entire moat     |
| Student personal data     | Breach; and these are minors            | **High** — legal and reputational    |
| Unpublished content       | Leakage of draft or unreviewed material | Medium                               |
| AI provider credentials   | Theft and abuse                         | **High** — direct financial loss     |
| Service-role database key | Theft — total compromise                | **Critical**                         |
| Entitlement state         | Manipulation for free access            | Medium — revenue, not safety         |
| Admin accounts            | Compromise → content corruption         | **High**                             |
| Attempt data              | Manipulation                            | Low — students only cheat themselves |

Note the asymmetry: paywall circumvention is a _revenue_ problem and should not be defended so aggressively that it degrades the experience for honest students. Bulk content extraction and minors' data are the serious ones.

### O.2 Authentication

Supabase Auth. Email/password with verification; Google OAuth; Apple sign-in when iOS ships. Sensible password policy, rate-limited sign-in with exponential backoff, secure token storage in the platform keychain (never in plain storage), short-lived access tokens with refresh rotation, and session revocation on password change. MFA for all admin accounts — mandatory, not optional.

### O.3 Authorisation and RLS

**Row Level Security is the primary authorisation boundary** (B-12). Every table has RLS enabled; there is no table where RLS is "not needed". The governing policies:

- A student may read **only** content rows whose status is `published` (I-2). Draft, pending and retired content is invisible at the database level, so no client bug or direct API call can expose it.
- A student may read and write **only their own** attempts, sessions, progress and profile.
- A student may never write to any content table.
- Premium-only content is filtered by an entitlement check inside the policy, so the paywall is enforced in the database.
- Admin roles are checked against a role table via a security-definer helper, never against a client-supplied claim.
- The audit log is insert-only for everyone and updatable by no one.

**Testing requirement:** RLS policies are tested as code — a test suite that attempts, as each role, every operation that should fail and asserts that it does. RLS is easy to get subtly wrong and impossible to verify by inspection.

### O.4 Admin permissions

Roles per §M.1, stored server-side, assignable only by `super_admin`, every change audit-logged. Principle of least privilege: support staff cannot touch content; reviewers cannot publish; nobody has standing production database access for routine work. Admin sessions are shorter-lived than student sessions. All admin actions are logged with actor and reason.

### O.5 Student permissions

Read published content; create attempts and sessions; read and update their own profile; delete their own account. Nothing else. In particular a student cannot read another student's anything, cannot enumerate the question bank outside a practice session, and cannot write their own entitlement.

### O.6 API and content-extraction defence

The realistic attack is a competitor scripting the API to pull the bank. Mitigations, in order of value:

- **Sessions are the only route to questions.** There is no "list all questions" endpoint for students. Questions arrive only as materialised practice sessions of bounded size (§E.4).
- **Rate limiting** per user and per IP on session creation and content fetch, tuned generously enough not to affect real students.
- **Anomaly detection** on volume: a student requesting 400 questions an hour is not a student. Flag, throttle, and review rather than auto-ban, since false positives on a paying customer are costly.
- **Free-tier limits** are themselves a strong extraction defence, which is a useful side effect.
- Accept that a determined competitor can extract content slowly. The mitigation for that is not technical — it is that the bank keeps growing and is verified, which a copy is not. Do not over-invest here at the expense of the student experience.

### O.7 AI credential protection

AI API keys exist only in server-side secret storage, accessible only to the content pipeline job runner. They are never in the mobile bundle, never in the admin client bundle, never in the repository, and never in a client-reachable environment variable. Rotation is scheduled. Provider spend caps (§L.6) mean that even a compromise is bounded. Access to the pipeline runner is restricted to `content_admin` and above, and every job execution is logged with its actor and cost.

### O.8 Service-role key protection

The Supabase service-role key bypasses RLS entirely and is the highest-value secret in the system. It exists only in server-side contexts — Edge Functions and the admin server runtime. It is never in any client bundle of either application. It is stored in the platform secret manager, rotated on a schedule and immediately on any suspicion, and its use is confined to a small number of clearly-identified server modules.

A specific, common and severe mistake to prevent: using the service-role key in a Next.js **client** component or in an API route that forwards unvalidated user input. A CI check should scan both bundles for the key pattern and for the anon/service key names, and fail the build on any match.

### O.9 Data privacy and minors

- **Data minimisation** (B-11): name/nickname, email, territory, exam sitting, age band. No date of birth beyond the band, no school, no address, no phone number, no photograph, no precise location, no contacts.
- **Under-13 handling** (A-07): verifiable parental consent before account creation, or refuse the account. Google Play's Families policy and general data-protection law both require this, and getting it wrong risks removal from the store.
- **No advertising identifiers, no third-party ad SDKs, no data sale.** Ever. This should be stated in the privacy policy as a commitment, because it is a genuine differentiator with parents and schools.
- **Analytics is privacy-preserving:** aggregate behavioural data, pseudonymous identifiers, no third-party analytics SDK that builds cross-app profiles of minors.
- **Rights honoured:** access, export, correction and deletion, with deletion actually deleting (attempt data anonymised or removed, not merely flagged).
- **Data residency** and applicable law across Caribbean territories, plus GDPR/UK-GDPR exposure from diaspora users, need a legal review in Phase 0.
- **Retention:** attempt data retained while the account is active and for a defined period after; audit logs longer; nothing retained indefinitely without a stated reason.

### O.10 Storage security

Published assets are public-read via CDN, which is correct and necessary for performance. **Unpublished assets are private**, because asset URLs are a classic draft-content leak. Upload paths are validated and content-typed; file size limits are enforced; uploaded SVGs are sanitised (SVG can carry script — this is a real vector and a common oversight). Storage bucket policies mirror the content status model.

### O.11 Audit logging

Per §M.11. Append-only, immutable, covering all content, taxonomy, role, entitlement and support actions. Retained beyond the operational window. Reviewable by `super_admin` only.

### O.12 Abuse prevention

Account sharing (a single subscription used by a class of thirty) is the realistic abuse case. Detect via concurrent-device and impossible-travel heuristics, respond with a soft device limit and a gentle message rather than a ban. Note that this abuse is also a _signal_: heavy sharing in a school is a school-licensing sales lead (§U).

Also covered: sign-up abuse (email verification, rate limits), report-feature abuse (rate limit, deprioritise repeat false reporters), and free-tier reset gaming (server-authoritative counters, §N.5).

### O.13 Operational security

Dependency scanning in CI; secret scanning on every commit; Supabase database backups with a tested restore procedure (an untested backup is not a backup); staging environment with synthetic data, never a copy of production student data; a written incident response process including a content-defect path (suspend the question first, investigate second); and annual penetration testing once the product carries meaningful subscriber data.

---

## SECTION P — UX / UI ARCHITECTURE

### P.1 Design stance

The interface has one job: get out of the way of the mathematics. Every pixel competes with the question the student is trying to think about.

The tone is **serious tool, not toy**. The user is fifteen or sixteen, preparing for an examination that will shape their next five years. They are past cartoon mascots and confetti, and they notice being patronised. The reference points are a well-made professional utility, not a children's learning app.

### P.2 Navigation

A four-tab bottom bar — the correct pattern for one-handed phone use and the one this audience already knows.

```
┌──────────────────────────────────────────┐
│                                          │
│              [ SCREEN ]                  │
│                                          │
├──────────────────────────────────────────┤
│  Home     Practice    Papers    Progress │
└──────────────────────────────────────────┘
```

Profile, settings and subscription live behind an avatar in the header, not in the tab bar — they are visited rarely and would waste a permanent slot. In MVP, **Papers** is either hidden or a single sample; the tab position is reserved so that adding it in V1 does not re-teach navigation.

**The question screen takes over the display entirely** — no tab bar, no distractions — and exits back to where it was entered.

### P.3 Screen hierarchy

```
Onboarding
  ├── Value cards (skippable)
  ├── Exam sitting selection
  ├── Topic interest (skippable)
  └── First question  ──► Question flow
Auth
  ├── Sign up / Sign in / Google
  ├── Age gate ──► Parental consent (under 13)
  └── Password reset
Home (tab)
  ├── Continue
  ├── Recommended practice card
  ├── Practice by topic
  └── Weekly activity
Practice (tab)
  ├── Section list
  │     └── Subtopic list
  │           └── Practice setup ──► Question flow
  └── Search
Question flow (full screen)
  ├── Question
  ├── Result
  ├── Solution
  ├── Explanation
  └── Session results
Papers (tab, V1)
  ├── Paper library
  ├── Paper overview
  ├── Paper mode / Timed mode
  ├── Paper results
  └── Paper review
Progress (tab)
  ├── Overview
  ├── Section detail ──► Subtopic detail
  ├── Weak / strong areas
  └── Question history ──► Question review
Profile
  ├── Account
  ├── Exam sitting & territory
  ├── Subscription ──► Upgrade
  ├── Settings (theme, notifications)
  ├── Bookmarks
  ├── Help & report a problem
  └── About (incl. non-affiliation notice)
```

### P.4 The question screen — detailed

The most important screen in the product; everything else can be adequate if this one is right.

```
┌────────────────────────────────────────────┐
│  ←        Consumer Arithmetic       4 / 10 │   compact header
├────────────────────────────────────────────┤
│                                            │
│  A shopkeeper buys an item for $450 and    │   question text
│  sells it at a profit of 20%.              │   comfortable measure,
│                                            │   generous line-height
│  Calculate the selling price.              │
│                                            │
│         ┌──────────────────────┐           │   diagram if present,
│         │      [ figure ]      │           │   tap to enlarge
│         └──────────────────────┘           │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │  $ [        540.00          ]        │  │   answer input,
│  └──────────────────────────────────────┘  │   type-appropriate
│                                            │
│  Work it out on paper first.               │   quiet nudge (B-3)
│                                            │
│                                            │
├────────────────────────────────────────────┤
│  Skip              [  CHECK ANSWER  ]      │   thumb zone
└────────────────────────────────────────────┘
```

Non-negotiables on this screen: the question is never scrolled out of reach of the answer input on a standard device; the keypad never covers the question stem; mathematics renders at a size legible without zooming; CHECK ANSWER is always reachable by thumb; and there is no timer.

### P.5 Result, solution and explanation

Result appears **in place**, as an expanding panel below the answer rather than a new screen or a modal — the student's answer stays visible next to the verdict, which is what makes the comparison meaningful.

```
┌────────────────────────────────────────────┐
│  Not quite                                 │   neutral, not harsh
│                                            │
│  Your answer      $470.00                  │
│  Correct answer   $540.00                  │
│                                            │
│  ⚠ You added 20% of the profit rather      │   common-error match
│    than 20% of the cost price. This is     │   — the highest-value
│    the most common slip on this type.      │   feedback available
│                                            │
│  ─────────── WORKED SOLUTION ───────────   │
│                                            │
│  Step 1  Find the profit                   │
│          20% of $450 = 0.20 × 450 = $90    │
│                                     [1 mk] │
│                                            │
│  Step 2  Add the profit to the cost        │
│          $450 + $90 = $540                 │
│                                     [1 mk] │
│                                            │
│              [ Show next step ]            │   progressive reveal
│                                            │
│  ─────────── WHY THIS WORKS ────────────   │
│                                            │
│  Profit percentage is always calculated    │
│  on the cost price, not the selling        │
│  price. Read carefully for which value     │
│  the percentage refers to.                 │
│                                            │
├────────────────────────────────────────────┤
│  Bookmark    Report      [ NEXT → ]        │
└────────────────────────────────────────────┘
```

### P.6 Component inventory

| Component         | Notes                                                                                                     |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `MathText`        | Renders mixed prose and LaTeX with SVG fallback (§G.8). The single most important component in the app    |
| `QuestionCard`    | Stem block renderer                                                                                       |
| `AnswerInput`     | Polymorphic by answer type                                                                                |
| `NumericKeypad`   | Custom keypad — the system keyboard is wrong for mathematics; needs fraction, decimal, minus, and a clear |
| `FractionInput`   | Numerator/denominator, mixed-number support                                                               |
| `OptionList`      | Multiple choice, seeded order, selection state                                                            |
| `ResultPanel`     | Verdict, comparison, common-error note                                                                    |
| `SolutionSteps`   | Progressive reveal, mark display                                                                          |
| `ExplanationCard` |                                                                                                           |
| `MasteryBar`      | Handles "not started" and "getting started" states correctly (§J.6)                                       |
| `TopicRow`        | Name, count, mastery, lock state                                                                          |
| `SessionProgress` |                                                                                                           |
| `DiagramView`     | Zoomable, alt-text aware                                                                                  |
| `PaywallSheet`    | Contextual upgrade prompt                                                                                 |
| `EmptyState`      | Including the content-starvation case (§E.4)                                                              |
| `OfflineBanner`   | Non-alarming, states what still works                                                                     |

### P.7 Visual language

- **Type:** one clean, highly legible sans-serif family. Mathematics uses the KaTeX serif face, which correctly signals "this is mathematics" and matches examination typography. Question text at a comfortable reading size, never below 16pt equivalent.
- **Colour:** restrained. A single brand accent for primary actions; semantic green and amber for correct and not-quite (never red — red is the marking pen, and this product is deliberately not that); a neutral grey scale for everything else. **Never colour alone** to convey meaning (B-17).
- **Space:** generous. Dense screens are unreadable on a phone and unusable for mathematics.
- **Motion:** minimal and fast. Transitions under 200ms. No decorative animation on the question flow — it delays a student who is in rhythm.
- **Dark mode:** first-class. Students revise at night and this is a real request, not a preference.

### P.8 Key screens summarised

- **Home** — one primary action, one recommendation, quiet activity indicator. Not a dashboard.
- **Topic list** — scannable, mastery visible, locked items visible but marked.
- **Practice setup** — two controls, big start button.
- **Session results** — score, per-question strip, mastery delta, one next action.
- **Progress** — overview, section breakdown, weak areas named at objective level, history filterable to incorrect.
- **Papers** — library by sitting, paper overview with mode choice, in-paper navigation grid, results with section breakdown and the marking-honesty note (§H.7).
- **Profile / subscription** — plain, honest, with cancellation clearly available. Hiding cancellation is a store-policy risk and a trust failure.

### P.9 Brand

**[A-06]** EdMar's existing brand assets were not available. The blueprint therefore specifies brand _behaviour_ rather than brand _values_: one accent colour used sparingly and consistently for primary action; the EdMar mark present on splash, About and the store listing but absent from the question flow; a tone of voice that is direct, warm and never patronising; and copy written in standard Caribbean English, avoiding both American idiom and forced dialect.

A design token layer (colour, type scale, spacing, radii) must be defined once and consumed by both applications, so that applying the real brand later is a token change rather than a refactor. Request brand assets in Phase 0.

### P.10 Accessibility

Minimum bar (B-17): 4.5:1 contrast on all text; touch targets ≥44pt; respects system text scaling without breaking layout — including mathematical layout, which is the hard part and needs explicit testing; no meaning conveyed by colour alone; every diagram has alt text; screen-reader labels on all controls.

**Honestly stated limitation:** full screen-reader support for rendered mathematics is a hard, unsolved problem in this stack. Alt text on diagrams and a text description field for complex expressions are the pragmatic mitigations. A properly accessible mathematics experience is a deliberate future project (§U), not something to claim prematurely.

### P.11 Performance targets

| Metric                                    | Target                                    |
| ----------------------------------------- | ----------------------------------------- |
| Cold start to interactive                 | < 2.5s on a mid-range Android device      |
| Question render                           | < 400ms from tap                          |
| Answer verdict                            | < 50ms (local, §I)                        |
| Session start (10 questions materialised) | < 1.5s on 3G                              |
| Practice session data                     | < 500KB for 10 questions including assets |
| Crash-free sessions                       | > 99.5%                                   |

The 400ms question render is the one that determines whether the product feels good. It is achievable because the payload is denormalised (§E.2) and cached, and it should be treated as a release gate rather than an aspiration.

---

## SECTION Q — ANALYTICS ARCHITECTURE

### Q.1 Principles

Measure what informs a decision. Collect the minimum personal data necessary (B-11). Prefer aggregates to individual traces. Never use a third-party SDK that profiles minors across applications.

### Q.2 Student metrics

Activation: install → first question completed → account created → third session. Engagement: DAU/WAU/MAU, sessions per active student per week, questions per session, session completion rate, days active per week. Learning: questions attempted, accuracy trend, mastery movement per week, topics covered, weak areas resolved. Retention: D1/D7/D30, and — the one that matters here — **week-N retention within an exam-sitting cohort** (§N.7).

### Q.3 Question metrics

Per question: attempts, unique students, accuracy, mean and median time, skip rate, wrong-answer distribution, common-error match rate, report count, bookmark count. These feed §E.13's quality loop and §E.5's difficulty calibration. The wrong-answer distribution is the single most diagnostic content metric available and should be visible in admin per question.

### Q.4 Topic and content metrics

Coverage (published questions per objective, per difficulty band, per syllabus version) with gaps ranked by examination weight — this is the content roadmap, generated rather than guessed. Also: practice volume by topic, mean mastery by topic across the base (a topic where everyone is weak may indicate a teaching gap or a content defect), and content freshness.

### Q.5 Revenue and retention metrics

MRR, ARR, paying subscribers, ARPU, free→paid conversion rate and time-to-convert, trial-to-paid, churn (monthly and by cohort), LTV, and — critically — **cohort retention indexed to exam sitting rather than calendar month**. A flat monthly churn figure for a seasonal examination product is not merely uninformative; it is actively misleading, and it will cause bad decisions if reported.

Conversion funnel: install → first question → account → limit reached → paywall viewed → purchase initiated → purchase completed. The step with the largest drop is the roadmap.

### Q.6 Practice and AI metrics

Practice: sessions started/completed, questions per session, recommendation acceptance rate (do students follow it?), paper attempts, timed mode usage.

AI/pipeline: spend by stage and by month against cap, cost per published question, pipeline throughput, validation pass rate, human approval rate by batch and by prompt version, review time per item, reviewer throughput and quality. **Cost per published question is the number that tells EdMar whether the content engine is working.**

### Q.7 Technical metrics

Crash-free rate, cold start, screen render times, API latency percentiles, sync failure and offline attempt rates, error rates by endpoint, database query performance against the §R budgets.

### Q.8 Implementation

Events are defined in a single versioned schema shared by both applications — an event taxonomy that drifts between platforms produces analytics nobody trusts. Events are written to Postgres and aggregated by scheduled materialised views; the admin dashboard reads views, never raw events, so analytics load cannot degrade the student experience. Raw events are retained for a bounded window; aggregates are retained long-term.

At the scales in §R this needs no external analytics infrastructure. Revisit only if a genuine need appears.

### Q.9 What is deliberately not collected

No precise location. No contacts, calendar or device inventory. No advertising identifiers. No third-party ad or profiling SDKs. No free-text student input beyond problem reports. No school or class affiliation until class features exist and are consented to. No date of birth beyond the age band. No behavioural data sold or shared, ever.

---

## SECTION R — SCALABILITY

### R.1 Scale tiers and what changes

| Students | Stage       | Infra                                                          | Monthly infra cost | The real constraint                                |
| -------- | ----------- | -------------------------------------------------------------- | ------------------ | -------------------------------------------------- |
| 100      | Closed beta | Supabase Free/Pro, Vercel Hobby                                | ~US$25             | Content volume                                     |
| 1,000    | Launch      | Supabase Pro, Vercel Pro                                       | ~US$50–75          | Content volume and review throughput               |
| 10,000   | Growth      | Supabase Pro + compute add-on, read replica optional           | ~US$150–400        | Query tuning, support load                         |
| 50,000+  | Scale       | Larger compute, read replica, CDN tuning, partitioned attempts | ~US$800–2,000      | Support and content operations, not infrastructure |

The consistent theme: **infrastructure is never the binding constraint on this product.** Content and people are. At 50,000 students the infrastructure bill is roughly 1% of revenue.

### R.2 Load characteristics

The read/write ratio is heavily read-dominated and the read set is small, highly cacheable, and identical for every student — the same 3,000 questions served repeatedly. Writes are small, append-only attempt rows. This is close to the easiest possible workload for Postgres.

Traffic is _extremely_ peaky by season, and peaky by hour within a day (evenings). Peak-to-trough across the year may be 10:1. Provision for the April–May peak; do not right-size for the August trough.

Estimating at 50,000 students, 20% daily active, 20 questions each: 200,000 attempt writes per day, concentrated into perhaps six evening hours — roughly 10 writes per second average, with peaks well inside what a single well-indexed Postgres instance handles comfortably.

### R.3 Database scaling

- **Index deliberately** for the selection function's filter chain (§E.4) — status, curriculum links, difficulty, and the student's recent-attempt lookup are the hot paths.
- **Denormalised question payloads** (§E.2) so the read path is a single indexed row fetch, not a multi-table join.
- **Partition the attempts table** by time once it passes tens of millions of rows. Plan the partition key now; implement when needed.
- **Materialised views** for all analytics and for mastery rollups above skill level, refreshed on a schedule rather than computed per request.
- **Incremental mastery updates** on attempt write (§J.4), with a scheduled full recomputation available for algorithm changes.
- **Connection pooling** via Supabase's pooler from the outset — a mobile client base opens far more connections than a web app, and this is the most common way a Supabase-backed mobile product falls over.
- **Read replica** at the 10,000+ tier if analytics or admin load becomes visible in student latency. Probably unnecessary before then.

### R.4 Content and CDN scaling

Diagrams are static, immutable and CDN-cached with long TTLs — the cache hit rate should approach 100% and bandwidth cost stays trivial. Pre-rendered LaTeX SVGs likewise. Client-side caching of practice content on device means a returning student re-downloads almost nothing, which matters on metered connections as much as it does for cost.

### R.5 Client scaling

Practice payloads are materialised and cached per session; the client keeps recently-used topics locally and invalidates by `content_version` (§E.12). Attempts queue offline and sync in batches. As the bank grows, nothing about the client's working set grows — it only ever holds the current topic.

### R.6 AI cost scaling

**AI cost does not scale with students at all** (§L). It scales with content volume, which is a business decision under direct control. At 50,000 students the AI line is the same as at 100.

### R.7 Operational scaling

The things that actually get harder:

- **Support volume** grows linearly. Plan for self-service help, a good problem-report flow, and a support role in admin (§M.9) before it becomes urgent.
- **Content review** is the permanent constraint (§K.7). Scaling means more qualified reviewers and better tooling, and the tooling investment has better returns.
- **Content freshness** — each new sitting produces new past papers; each syllabus change produces re-mapping work.
- **Territory expansion** brings payment, currency and calendar variation (§A.5).

### R.8 What would need re-architecting, and when

Honestly: very little, and not soon.

- Beyond ~200,000 students, consider separating analytics into a dedicated store.
- If real-time class features arrive (V2+), evaluate Supabase Realtime capacity properly rather than assuming.
- If AI ever moves onto the student path — which this blueprint recommends against — the entire cost model changes and would need rebuilding. This is the strongest practical argument for holding the line on B-6.

---

## SECTION S — DEVELOPMENT ROADMAP

Eight phases. Phases 0–4 deliver MVP; 5–6 deliver V1; 7 is V2. Durations assume a small team (1–2 engineers, 1 designer part-time, 1–2 qualified content reviewers) and are indicative.

### Phase 0 — Foundation and decisions _(2 weeks)_

**Objective:** eliminate the unknowns that could invalidate the build.

**Work:** resolve the content-rights position (§V R-01) with legal input — _this gates everything_; inspect the legacy JSON and close all fourteen **[VERIFY-JSON]** items; transcribe the V2027 Specific Objectives from the official PDF **[VERIFY-CXC-02]** and confirm the assessment weightings **[VERIFY-CXC-01]**; confirm Google Play merchant availability per territory **[A-04]**; obtain brand assets **[A-06]**; decide the under-13 policy **[A-07]**; secure reviewer capacity **[A-08]**; set up repository, environments, CI, and secret management.

**Deliverables:** rights decision memo; legacy data assessment with a migration plan; complete V2018 + V2027 taxonomy source files; environment and CI skeleton; confirmed assumptions register.

**Completion criteria:** every assumption in §0.3 is either confirmed or has an owned mitigation. **No code is written before this phase completes** — the rights answer can change what gets built.

### Phase 1 — Data foundation and spikes _(3 weeks)_

**Objective:** the schema and the two risky technical unknowns.

**Work:** implement the full data model (§F, §G, §J.2) with migrations; RLS policies for every table plus the RLS test suite (§O.3); seed the curriculum taxonomy including the V2018↔V2027 mapping; **spike: LaTeX rendering on React Native** against 200 real expressions on a low-end Android device (§G.8); **spike: deterministic answer validation**, including the shared normalisation package and its cross-platform property tests (§I.3); pilot the content pipeline on 50 real questions end to end and measure actual per-question AI cost (§L.7).

**Dependencies:** Phase 0.

**Deliverables:** migrated schema; passing RLS test suite; seeded taxonomy; two spike decision memos; 50 pilot questions through the full pipeline; measured cost-per-question.

**Testing:** RLS negative tests for every role; validation unit tests; LaTeX corpus render test.

**Completion criteria:** a question can be created, validated, reviewed, published and read by a student-role client, entirely through the database, with correct authorisation — and the two spikes have written answers.

### Phase 2 — Content pipeline and admin _(4 weeks, overlapping Phase 3)_

**Objective:** the machine that makes the product's actual value, and enough tooling to run it at throughput.

**Work:** ingestion and extraction (§K.3); classification and mapping with human confirmation (§K.4); solution/explanation/common-error drafting (§K.5); the full deterministic validation suite (§K.6) including CAS answer verification; duplicate detection (§E.10); admin authentication and roles; question editor with live preview and the answer-spec test harness (§M.4); review queue with keyboard flow (§M.5); curriculum management (§M.7); audit logging (§M.11).

**Dependencies:** Phase 1.

**Deliverables:** working pipeline; admin console; legacy JSON migrated into staging; **content review begins and does not stop**.

**Testing:** pipeline integration tests; golden-set regression (§K.9); validator unit tests; admin role authorisation tests.

**Completion criteria:** a reviewer sustainably reviews 30+ questions per day using the tool. **This number is the gate**, because it determines whether MVP content is reachable.

### Phase 3 — Student app core _(5 weeks)_

**Objective:** the practice loop, complete and fast.

**Work:** app scaffolding, navigation, design tokens; authentication including the age gate and consent flow; onboarding through to first question (§C.1); topic browsing; practice setup; **the question flow** — question, all MVP answer types, local validation, result with common-error matching, solution, explanation, next; session results; offline queue and sync (§E.9); the selection function (§E.4).

**Dependencies:** Phase 1; content from Phase 2 as it lands.

**Deliverables:** a working practice loop against real content.

**Testing:** answer-validation test suite across every type with adversarial inputs; offline/sync tests; performance tests against §P.11; device matrix testing on low-end Android.

**Completion criteria:** a student completes a 10-question session, offline, with correct validation and correct mastery updates on reconnection.

### Phase 4 — Progress, entitlement, MVP close _(3 weeks)_

**Objective:** the retention loop and the commercial architecture.

**Work:** mastery computation (§J.4) with incremental update and full recompute; progress screens; weak/strong areas; recommended practice (§J.8); entitlement model and server-authoritative free-tier limits (§N.5); paywall placement; bookmarks; problem reporting; crash reporting and analytics events (§Q.8).

**Deliverables:** feature-complete MVP.

**Testing:** mastery correctness against hand-computed fixtures; entitlement enforcement tested at the RLS layer, not just the UI; end-to-end journey tests.

**Completion criteria:** §W.1 (internal testing) satisfied, and **≥1,200 published questions with coverage across all nine sections** (§T.4).

### Phase 5 — Beta _(4 weeks)_

**Objective:** find out what is actually wrong.

**Work:** closed beta with 50–100 real students, ideally through one or two schools; instrument everything; daily triage of problem reports; content correction sprint driven by real wrong-answer distributions (§Q.3); performance tuning on real devices and real networks; iterate on the paywall and the free limit.

**Deliverables:** beta report; prioritised defect and content-correction backlog; tuned free-tier limit.

**Completion criteria:** §W.2. Specifically: no unresolved mathematical accuracy defect, crash-free rate above 99%, and at least 60% of beta students completing three or more sessions unprompted — that last one is the real signal.

### Phase 6 — V1 launch _(6 weeks)_

**Objective:** a paid public product.

**Work:** Google Play Billing with server-side validation and RTDN (§N.6); past paper system (§H) — _if and only if rights permit_; timed exam mode; diagnostic assessment (§J.9); push notifications; account deletion and data export; store listing, privacy policy, terms, non-affiliation notice; expand the bank to ≥3,000 questions; admin analytics dashboard.

**Completion criteria:** §W.3–§W.5.

### Phase 7 — V2 _(ongoing, 4–6 months post-launch)_

Full V2027 modular support; iOS release; adaptive practice and item calibration (§J.10); profile-dimension analytics; class/teacher accounts; variant generation at scale; continued content growth toward 6,000+.

### S.1 Critical path

```
Rights decision ──► Content pipeline ──► REVIEWED CONTENT VOLUME ──► Launch
                         │
   App development ──────┘  (runs in parallel; finishes earlier)
```

**The application will be finished before the content is.** This is the single most important scheduling insight in this document, and it inverts the usual instinct to staff engineering first. Content review capacity should be secured in Phase 0 and reviewing should start the day the admin tool is usable — not when the app is ready.

---

## SECTION T — MVP DEFINITION

### T.1 The MVP question

_What is the smallest thing that a Fifth Form student would pay US$4/month for?_

Answer: **enough correctly-worked practice questions, mapped to their syllabus, that they can practise any topic and always see how it is done — plus an honest picture of where they stand.**

Everything else is elaboration.

### T.2 In scope

Android only. Anonymous first-run practice; email and Google authentication with the age gate. All nine V2018 sections, tagged to V2027. Topic and subtopic browsing. Practice sessions of 5/10/20 with difficulty selection. Multiple-choice, numeric, decimal and fraction answers with deterministic local validation. Worked solutions with progressive reveal; explanations; common-error matching. Attempt recording with offline support. Per-skill and per-topic mastery. Session results with mastery delta. Progress screen with weak areas and history. Single recommended practice. Free tier with a daily limit; premium entitlement enforced (billing stubbed). Admin console: editor, review queue, curriculum, publish, audit. Content pipeline with deterministic validation and human review. **≥1,200 published questions.**

### T.3 Out of scope — binding

The following are **not** built for MVP, and a request to add one is a scope change requiring an explicit decision, not a judgement call:

iOS. Past paper library and paper mode. Timed exam mode. Diagnostic assessment. Real payment processing. Annual plan. Push notifications. Algebraic-expression answers beyond Tier 1 (§I.9). Structured multi-part questions. Adaptive difficulty beyond the three modes. Spaced repetition. Profile-dimension analytics. Offline topic packs. Class, teacher, school or parent accounts. Leaderboards, achievements, streaks beyond a simple weekly count. Social features. Sharing. Certificates. Referrals. Multi-language. Web application for students. Variant generation at scale. Any student-facing AI, in any form.

### T.4 The real MVP gate

**1,200 published, human-reviewed questions with adequate coverage of all nine sections.**

Not "the app works". A practice app with 200 questions is a demonstration, not a product — a motivated student exhausts it in a week and churns, and the churn is unrecoverable because they have concluded the product is thin.

Coverage matters as much as volume: 1,200 questions concentrated in three sections is worse than 900 spread properly. Minimum per section: roughly 100 questions spanning at least difficulty bands 1–4. Sections carrying more examination weight get proportionally more.

At 30–60 reviewed questions per reviewer-day, 1,200 questions is 20–40 reviewer-days. **Plan it, staff it, start it early** (§S.1).

### T.5 MVP success criteria

| Metric                                             | Target           |
| -------------------------------------------------- | ---------------- |
| Beta students completing 3+ sessions unprompted    | ≥60%             |
| Questions per active student per week              | ≥30              |
| Week-2 retention (beta cohort)                     | ≥40%             |
| Mathematical accuracy defects reaching students    | **0 unresolved** |
| Crash-free sessions                                | >99%             |
| Question render time                               | <400ms (p90)     |
| Stated willingness to pay US$4/month (beta survey) | ≥30%             |

The accuracy row is the only one with a target of zero, and it is the only one that is non-negotiable.

---

## SECTION U — FUTURE ROADMAP

Directional, deliberately uncommitted, and constrained by one rule: **nothing here may complicate MVP architecture.** Each item below is reachable from the architecture as specified without re-platforming, which is the test that was applied in choosing them.

**Additional CXC subjects.** The taxonomy is rooted at SUBJECT (§F.7) and the content model is subject-agnostic except for answer types. Physics, Chemistry, Biology and Additional Mathematics are the natural extensions — all quantitative, so the deterministic answer system carries over. Subjects with essay answers are a genuinely different product and should be treated as such.

**CSEC Additional Mathematics.** Smallest extension, most similar content, and a natural upsell to exactly the students most likely to already be subscribers.

**CAPE Mathematics (Units 1 and 2).** Follows the same students forward, extending lifetime value into the years after CSEC. Requires calculus notation in the LaTeX allowlist and richer expression validation, both of which are extensions rather than rewrites.

**Wider territory coverage.** Already architecturally supported (§A.5). Work is commercial and operational, not technical.

**School and class accounts.** A teacher creates a class, assigns practice, sees aggregate performance. Deliberately _aggregate_ — individual surveillance of students changes the product's relationship with its users and should be resisted. Requires class entities, invitation flows, and careful consent handling for minors.

**School licensing.** The entitlement model is already source-agnostic (§N.5), so a school licence is a new entitlement source rather than new architecture. Commercially attractive: higher contract value, lower churn, and the account-sharing signal in §O.12 is the lead-generation mechanism.

**Competitions and leaderboards.** Class- or school-scoped only, never global (§D.7). Time-bounded events rather than permanent rankings.

**Certificates.** Topic mastery certificates as a motivational artefact. Cheap; must not imply CXC accreditation, which would be both false and legally exposed.

**Sophisticated adaptive practice.** Item calibration and knowledge tracing (§J.10), enabled by accumulated attempt data. The data model already supports it.

**Step-level solution help.** "I'm stuck at step 3" — precomputed sub-explanations per solution step. Notably, this delivers most of what students want from an AI tutor while remaining fully precomputed and free at runtime. It is the right answer to the inevitable "why can't they just ask the AI?" pressure.

**Parent progress summaries.** Weekly email digest. Requires consent and careful framing — a report that reads as surveillance damages the student relationship.

**Accessible mathematics.** Proper screen-reader support for mathematical content (§P.10). Difficult, valuable, and honest to defer rather than half-do.

**Printable worksheets.** Teachers ask for these constantly. Low effort given the content model, high goodwill, and a genuine acquisition channel.

---

## SECTION V — RISK REGISTER

Scored as Likelihood (L) × Impact (I), each 1–5. Ordered by severity. Every risk has a named mitigation and an early-warning signal, because a risk without a detection mechanism is a surprise waiting to happen.

### R-01 · Copyright and licensing of CXC past papers — **L4 × I5 = 20 · CRITICAL**

**The risk.** CXC past papers, mark schemes and syllabus documents are the copyright of the Caribbean Examinations Council. Reproducing past-paper questions in a commercial product without a licence is infringement. Exposure includes takedown demands, removal from Google Play, damages, and the loss of a large share of the question bank — potentially after launch, when students have paid.

This is the risk most likely to end the product, and it is worth being blunt: the fact that many regional revision products do this anyway is not a defence, and a takedown after launch is far worse than a constraint before it.

**Mitigation, in order:**

1. **Obtain a written legal opinion in Phase 0, before building content.** This is the highest-value two weeks in the whole project.
2. **Approach CXC directly about licensing.** CXC does license content commercially. A licence would be a genuine competitive moat, not merely a compliance measure.
3. **Design the fallback now and make it good.** Original questions authored to the syllabus, in authentic CSEC style, correct format, correct difficulty distribution — a legitimate and well-established publishing model. §K.5's variant generation makes this economically viable at a scale that would have been impossible manually.
4. **Provenance is a first-class field** (§E.7) so that any affected content can be identified and withdrawn in a single query, and §M.8 provides the withdrawal control.
5. Never reproduce mark schemes, syllabus text verbatim beyond fair dealing, or CXC branding.

**Early warning:** any communication from CXC; a competitor receiving a takedown.

**Owner:** founder/legal. **Gate:** Phase 0 must not close without a decision.

### R-02 · Trade mark and implied endorsement — **L3 × I4 = 12 · HIGH**

CXC®, CSEC® and CAPE® are trade marks. Using them in a way suggesting affiliation invites action and may breach store policies.

**Mitigation:** descriptive nominative use only ("practice for CSEC Mathematics"), never as a leading brand element; a clear non-affiliation disclaimer on the store listing, About screen and website; no CXC logos, colours or document styling; legal review of the store listing before submission.

### R-03 · Mathematical inaccuracy reaching students — **L4 × I5 = 20 · CRITICAL**

A wrong answer or a flawed worked solution destroys trust disproportionately. One screenshot in a class WhatsApp group reaches three hundred students, and the correction never travels as far as the error.

**Mitigation:** the layered gates in §K.6 (deterministic validation, with independent CAS verification of the final answer as the highest-value single check) and §K.7 (qualified human review); wrong-answer-distribution monitoring (§Q.3) as the empirical detector; one-click suspension (§E.11) with a strong bias toward suspending immediately and investigating afterwards; in-app student reporting (§E.13); a rolling audit of published content; a golden-set regression suite for any prompt or model change (§K.9).

**Early warning:** a spike in reports on a question; an accuracy outlier; a wrong answer given by more than half of students.

**This is the risk that most justifies the architecture in this blueprint.** Precomputed, reviewed, versioned content is defensible; per-attempt generation is not.

### R-04 · AI-generated content quality and hallucination — **L4 × I4 = 16 · HIGH**

Models produce plausible, confident, wrong mathematics — including solutions whose steps look right and whose answer is not.

**Mitigation:** AI never publishes; validation is deterministic and of a _different kind_ than generation (§L.3); CAS-verified answers with automatic rejection on disagreement; bounded regeneration attempts; per-batch approval-rate monitoring with the ability to stop a bad run; prompt versioning and golden-set regression; reviewer quality measurement. Above all: **the review gate is never relaxed** (B-14), including for "high-confidence" items.

### R-05 · Content volume insufficient at launch — **L4 × I4 = 16 · HIGH**

A thin bank produces immediate churn among exactly the motivated students the product needs, and that churn is not recoverable.

**Mitigation:** treat 1,200 reviewed questions as the launch gate, not the app (§T.4); secure reviewer capacity in Phase 0; begin reviewing the moment the admin tool works, months before the app is ready (§S.1); measure reviewer throughput weekly against the plan; use variant generation to multiply approved questions; monitor coverage gaps continuously (§Q.4) and direct effort by examination weight.

**Early warning:** review queue draining slower than planned in any single week. Act on the first week, not the fourth.

### R-06 · Legacy JSON quality below expectation — **L3 × I4 = 12 · HIGH**

The seed dataset may contain OCR-mangled mathematics, wrong answers, inconsistent LaTeX, missing diagrams or duplicates (§G.9).

**Mitigation:** assess it in Phase 0 before planning around it; **have a human read a random sample of 50 records in full before any assumption of quality is made**; run every record through the same validation and review gates as new content — no exceptions for legacy data, however tempting given volume; keep legacy IDs for traceability; be prepared to discard records whose repair costs more than authoring fresh.

### R-07 · Syllabus transition (V2018 → V2027) mishandled — **L3 × I4 = 12 · HIGH**

Content mapped only to V2018 becomes progressively worthless from 2027; students sitting the new syllabus are mis-served, and re-tagging thousands of questions by hand is a project in itself.

**Mitigation:** the dual-version taxonomy and mapping table (§F.6), built in Phase 1 rather than retrofitted; exam sitting captured at onboarding; new content authored against V2027 by default once mapping exists; **[VERIFY-CXC-02]** transcription by a qualified human, never inference.

**Opportunity, not just risk:** being ready for V2027 before incumbents is a real, time-limited advantage.

### R-08 · Student engagement and retention below viability — **L4 × I4 = 16 · HIGH**

Students install, try it twice, and stop. The most common outcome for education apps.

**Mitigation:** value before registration (§C.1); the mastery loop as the return reason (§J); a single explained recommendation rather than a menu; a fast, rhythmic question flow (§P.11); restrained, non-manipulative engagement mechanics; measure honestly and by exam cohort (§Q.5); beta-gate on 60% of students completing three or more sessions unprompted (§T.5) — if that number is not met, the problem is the product, and shipping harder will not fix it.

### R-09 · Over-promising on outcomes — **L3 × I4 = 12 · HIGH**

A "predicted grade" or an implied guarantee that the app improves results is a claim EdMar cannot substantiate, will be held to publicly, and may face consumer-protection exposure over.

**Mitigation:** never present a predicted CSEC grade (§J.1, §D.7); frame progress as coverage and mastery; state marking limitations plainly (§H.7); marketing claims reviewed for substantiability; testimonials only where genuine and attributable.

### R-10 · Google Play policy and payment availability — **L3 × I4 = 12 · HIGH**

Rejection or removal over: minors' data handling, subscription disclosure, misleading claims, or IP complaints. Separately, Play billing may not be workable in some target territories **[A-04]**.

**Mitigation:** Families-policy compliance designed in from Phase 0 (§O.9); clear subscription disclosure and easy cancellation; no misleading claims (R-09); territory-by-territory billing verification in Phase 0; a fallback plan for payment where Play billing is unavailable; account deletion and data export built before submission, not after.

### R-11 · Subscription economics weaker than modelled — **L3 × I3 = 9 · MEDIUM**

Free-to-paid conversion below expectation, or seasonal churn steeper than planned.

**Mitigation:** free-tier limit tunable server-side without a release (§N.3); paywall placed at the moment of demonstrated need (§C.13); annual plan promoted in January–February to convert seasonal users; a cost structure with 95% contribution margin that tolerates a wide range of conversion outcomes (§L.7); cohort-based measurement so seasonality is not mistaken for failure.

### R-12 · Security breach involving minors' data — **L2 × I5 = 10 · MEDIUM–HIGH**

Low likelihood given data minimisation, severe impact given the population.

**Mitigation:** the whole of §O, with emphasis on data minimisation as the primary control — data not collected cannot be breached; RLS as the enforcement boundary with a dedicated test suite; service-role key discipline and CI secret scanning (§O.8); MFA on all admin accounts; tested backups; a written incident-response plan including notification obligations.

### R-13 · Bulk content extraction by a competitor — **L3 × I3 = 9 · MEDIUM**

**Mitigation:** no bulk endpoint exists (§O.6); session-scoped delivery; rate limiting and volume anomaly detection; free-tier limits. Accept partial exposure as unavoidable and compete on the growth and verification of the bank rather than on secrecy.

### R-14 · LaTeX rendering failure on real devices — **L3 × I3 = 9 · MEDIUM**

Mathematics that renders incorrectly, slowly, or as raw source makes the product look amateur instantly.

**Mitigation:** the Phase 1 spike against 200 real expressions on low-end hardware (§G.8); a restricted command allowlist; render-verification in CI for every published expression; **pre-rendered SVG fallback so raw LaTeX can never be shown to a student**; a device test matrix weighted toward low-end Android.

### R-15 · Scalability or cost surprise — **L2 × I3 = 6 · LOW–MEDIUM**

**Mitigation:** the architecture is read-dominated and cheap (§R); hard AI spend caps with a circuit breaker (§L.6); per-job cost estimates requiring confirmation; monthly cost review against §L.7's model; no per-student marginal AI cost by construction.

### R-16 · Key-person dependency on content reviewers — **L3 × I3 = 9 · MEDIUM**

A single qualified reviewer is a single point of failure for the product's core asset.

**Mitigation:** contract at least two from the start; document review standards so the role is transferable; measure and compare reviewer quality; build reviewer tooling that reduces the expertise required for routine confirmations while preserving it for judgement.

### V.1 Risk summary

| Severity             | Risks                                                                                                                      |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Critical (16–25)** | R-01 rights · R-03 mathematical accuracy · R-04 AI quality · R-05 content volume · R-08 engagement                         |
| **High (10–15)**     | R-02 trade mark · R-06 legacy data · R-07 syllabus transition · R-09 over-promising · R-10 store policy · R-12 data breach |
| **Medium (6–9)**     | R-11 economics · R-13 extraction · R-14 rendering · R-15 cost · R-16 key person                                            |

Two of the five critical risks — R-01 and R-06 — are resolved by _investigation_ rather than by building, which is the argument for Phase 0 existing at all.

---

## SECTION W — DEFINITION OF DONE

Each gate is cumulative: nothing passes a later gate without having passed the earlier ones.

### W.1 Ready for internal testing

**Product:** the complete practice loop works end to end — onboarding, authentication, topic selection, session, all MVP answer types, result, solution, explanation, session results, mastery update, progress screen. Offline practice and sync work. The free-tier limit is enforced server-side.

**Content:** ≥300 published questions across at least five sections. Every one has passed deterministic validation and human review. Zero known mathematical errors in published content.

**Engineering:** all migrations apply cleanly from empty; RLS test suite passes with negative tests for every role; answer-validation suite passes including adversarial inputs; client and server normalisation are property-tested against each other; LaTeX corpus renders without failure; CI green; no secrets in any client bundle (automated check).

**Operations:** staging environment with synthetic data; admin console usable by a reviewer; audit logging active; crash reporting active.

### W.2 Ready for beta testing

Everything in W.1, plus:

**Product:** feature-complete against §T.2. Recommended practice works and gives a reason. Problem reporting works and reaches admin. Paywall and upgrade flow work with entitlement enforced (billing may be stubbed).

**Content:** ≥1,200 published questions with ≥100 per section spanning difficulty bands 1–4, plus common-error data on all multiple-choice questions.

**Quality:** performance targets met on a low-end Android device (§P.11); crash-free rate >99% in internal use; no critical or high defects open; end-to-end journey tests passing.

**Compliance:** age gate and under-13 consent flow implemented and tested; privacy policy and terms drafted; non-affiliation notice present.

**Operations:** beta cohort recruited; feedback channel live; daily triage scheduled; rollback procedure documented and tested.

### W.3 Ready for production

Everything in W.2, plus:

**Validated:** beta success criteria met (§T.5) — in particular ≥60% of beta students completing three or more sessions unprompted, and **zero unresolved mathematical accuracy defects**.

**Product:** all beta-identified critical and high defects resolved; free-tier limit tuned against observed conversion; onboarding refined against observed drop-off.

**Content:** ≥3,000 published questions for a V1 launch; coverage gaps closed against examination weighting; content correction backlog cleared.

**Engineering:** load tested at 10× expected launch traffic; database backups verified by a **tested restore**; monitoring and alerting on error rate, latency, crash rate, sync failure and AI spend; incident response documented with an on-call owner.

**Legal:** **rights position resolved and documented** (R-01); trade mark and disclaimer review complete; privacy policy and terms legally reviewed and published; data-protection obligations across launch territories confirmed.

### W.4 Ready for Google Play launch

Everything in W.3, plus:

Store listing complete with accurate, substantiable description, screenshots and feature graphic. Content rating completed honestly. **Data safety section completed accurately and matching actual behaviour** — mismatches here are a common cause of rejection. Families policy compliance confirmed. Privacy policy URL live. Account deletion available both in-app and via a web URL (a Play requirement). Signed release build via EAS with a secured signing key. Staged rollout plan (5% → 20% → 50% → 100%) with defined abort criteria. Crash and ANR rates within Play's thresholds on the release build. Support channel staffed and responsive.

### W.5 Ready for paid subscriptions

Everything in W.4, plus:

Google Play Billing integrated with **server-side receipt validation** — never client-trusted. Real-Time Developer Notifications handled for purchase, renewal, cancellation, grace period, hold, refund and revocation. Restore purchases works after reinstall and across devices. Entitlement enforced at the database layer, verified by test. Subscription state reconciled correctly after network failure mid-purchase. Price, billing period, renewal terms and cancellation route clearly disclosed before purchase. Cancellation is easy and clearly signposted. Refund policy stated and operable. Support tooling exists for entitlement issues (§M.9). Revenue reporting reconciles against Play Console. **Tested end to end with real purchases in a closed testing track, including the failure paths** — a declined card, an expired subscription and a refund, each verified to produce the correct entitlement state.

---

## SECTION X — RECOMMENDED NEXT STEPS

### X.1 The next two weeks (Phase 0), in order

1. **Commission a legal opinion on CXC past-paper usage** (R-01). Everything else is provisional until this returns. If the answer is unfavourable, the fallback in §H.1 and §K.5 is viable — but it must be chosen deliberately, not discovered.
2. **Open a licensing conversation with CXC.** Even an unsuccessful approach clarifies the position, and a successful one is a moat.
3. **Inspect the legacy JSON** and close the fourteen **[VERIFY-JSON]** items in §X.2. Include a full human read of 50 random records — automated statistics will not reveal OCR-mangled mathematics.
4. **Transcribe the V2027 Specific Objectives** from the official syllabus PDF, by a qualified human **[VERIFY-CXC-02]**, and confirm the assessment weighting grid **[VERIFY-CXC-01]**.
5. **Secure content reviewer capacity** — at least two qualified CSEC Mathematics teachers **[A-08]**. This is the critical path (§S.1) and it has a hiring lead time.
6. **Confirm Google Play merchant and payment availability** in Jamaica and the next three target territories **[A-04]**.
7. **Decide the under-13 policy** and the consent mechanism **[A-07]**.
8. **Gather EdMar brand assets** **[A-06]**.
9. **Confirm the product name** and check trade mark exposure (R-02).
10. **Stand up repository, environments, CI and secret management.**

### X.2 Open verification items

**[VERIFY-JSON] — inspect the legacy dataset and confirm:**

1. Record count, and how many are distinct questions versus parts.
2. Whether topic labels map cleanly onto CXC sections, or are ad hoc.
3. Whether any Specific Objective mapping exists (expected: none).
4. The form of stored answers — display strings or structured values.
5. Whether worked solutions are step-structured or single blobs.
6. LaTeX consistency and whether it fits a restrictable allowlist.
7. Whether difficulty ratings exist and are consistent.
8. What "diagram information" actually contains — assets, descriptions or references.
9. The form of "common-error warnings" — prose or value-keyed.
10. Internal duplicate rate.
11. **Mathematical accuracy on a 50-record human-read sample** — the highest-priority item in this list.
12. Provenance and rights status of each record, if recorded at all.
13. Whether "concepts" maps usefully onto the proposed skill vocabulary (§F.4).
14. Paper/year/question-number completeness and reliability.

**[VERIFY-CXC-01]** Assessment weighting grid, read from the official PDF by a human.
**[VERIFY-CXC-02]** Full V2027 Specific Objective list, transcribed not inferred.

### X.3 What to hand the engineering agent

For the Technical Build Specification, this document plus:

- The Phase 0 outputs (rights decision, legacy data assessment, complete taxonomy source).
- Brand assets and the design token definitions.
- The two Phase 1 spike briefs (LaTeX rendering; answer validation), which should be treated as the first engineering work and whose outcomes belong in the Build Specification rather than being assumed by it.

The Technical Build Specification should cover, at minimum: the concrete database schema with indexes and RLS policies; API and RPC contracts; the shared normalisation and validation package specification; the content pipeline job architecture; the mobile application structure and state management; the admin application structure; the CI/CD pipeline; the test strategy; and the environment and secret-management topology.

### X.4 Three things worth restating

**The application is the easy part.** The content bank is the product, the cost, the risk and the moat. Staff and schedule accordingly — the app will be finished long before the content is (§S.1), and the instinct to hire engineers first is the wrong one here.

**Hold the line on AI.** Every future feature request will push toward putting a model on the student path. The economics (§L.7), the correctness argument (§I.1) and the pedagogy (B-3) all point the same way, and the architecture's coherence depends on that boundary holding. When the pressure comes, the answer is usually a precomputed version of the requested feature — as §U's step-level solution help demonstrates.

**Resolve the rights question before building content.** It is two weeks of work that determines whether the other six months are viable. Doing it after the bank is built is the most expensive possible ordering.

---

## APPENDIX — SOURCES

CXC syllabus and assessment facts in §0.4 were retrieved from:

- CXC, _CSEC Mathematics Syllabus, effective for examinations from May–June 2027_ — https://www.cxc.org/wp-content/uploads/2018/11/CSEC-Mathematics-Syllabus_EffectiveforExamsfrom2027.pdf
- CXC, _CSEC Mathematics Syllabus (amended October 2025)_ — https://www.cxc.org/wp-content/uploads/2018/11/CSEC-Mathematics-AmendedOct2025.pdf
- CXC, _CSEC Mathematics Syllabus, effective for examinations from May–June 2018_ — https://www.csecmathtutor.com/uploads/1/1/4/4/11440199/csec_mathematics_syllabus_exam_2018__.pdf

All syllabus content must be confirmed against the official CXC documents by a qualified human before it is encoded into the product taxonomy (**[VERIFY-CXC-01]**, **[VERIFY-CXC-02]**).

---

_End of Master Blueprint v1.0. No application code is contained in this document._
