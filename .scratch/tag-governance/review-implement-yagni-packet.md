# review-implement YAGNI packet

## Stable target

- repo: `/Users/linhancheng/Desktop/projects/gggodlin-blog`
- base_sha: `050baf553d3e2df31cdf728b10e2ae28583dd520`
- head_sha: `df81f94095c6b1aa908f0188f558bb917aa7d16c`
- inspect with: `git diff 050baf553d3e2df31cdf728b10e2ae28583dd520..df81f94095c6b1aa908f0188f558bb917aa7d16c`

## Confirmed requirements

- R1 — Clicking a tag returns exact canonical membership, not title／description substring matches.
- R2 — General search remains separate and preserves title, description, and visible tag label search.
- R3 — The project owns one human-readable registry with ID, label, aliases, dimension, meaning, and boundary.
- R4 — Article frontmatter stores canonical IDs while homepage and article pages render labels.
- R5 — Unknown or ambiguous tag definitions fail the repo content／build path with an actionable error.
- R6 — Apply the independently verified 19-article audit manifest and seven canonicalization groups.
- R7 — Keep six non-exclusive broad topics; rename Review to 品質與驗證 and apply only the audited topic membership changes.
- R8 — Singleton tags remain valid; usage count never causes deletion or validation failure.
- R9 — Do not add a runtime legacy-alias layer, frontend test framework, global skill modification, article prose rewrite, or visual redesign.
- R10 — Final tests, content check, production build, and browser behavior must pass.

## Acceptance clauses

- A1 — Registry entries are unique, required fields are present, aliases resolve deterministically, and the exported registry cannot drift from internal lookup state.
- A2 — All 40 article tags are registered canonical IDs.
- A3 — Approved before／after manifests derive exactly 19 changed articles.
- A4 — Registry has 54 final entries and no obsolete canonical IDs.
- A5 — Every article belongs to at least one broad topic.
- A6 — Final topic counts are workflow 13, models 12, tools 16, memory 4, quality 12, automation 9.
- A7 — Homepage and article pages display labels rather than canonical IDs.
- A8 — Exact browser results are hook 9, skill 3, subagent 3, workflow 7.
- A9 — General search finds a title-only, description-only, and visible-label-only match.
- A10 — Tag click clears broad-topic state and never becomes a general query.
- A11 — Topic, reset, close, and typing transitions cannot leave stale exact-tag state.
- A12 — Active tag exposes `aria-pressed=true` and a persistent visual indicator.
- A13 — Result count, empty state, keyboard Enter／Escape behavior, focus, and one polite live region remain functional.
- A14 — 360px viewport has no horizontal overflow.
- A15 — Unknown tag fixture fails with the unknown value and reuse／register guidance.
- A16 — `npm run build` runs tests and content check before Astro build.
- A17 — `npm test` works across the supported Node 22 range through explicit TypeScript stripping.
- A18 — No files outside package config, source, article frontmatter, and tests are committed in the stable diff.

## YAGNI-only instructions

Do not read raw sessions, previous review findings, author explanations, or implementation reports. Review only the requirements, acceptance clauses, and stable diff.

Find code or files that can be removed or replaced by a materially smaller implementation while still satisfying every referenced acceptance clause. Each finding must include:

- `Y#` ID;
- exact diff hunk or file:line;
- the smaller substitute;
- the acceptance IDs that remain satisfied;
- concrete deleted complexity, not a style preference.

Do not propose removing registry content merely because it is data-heavy when R3／R6 require the full reviewed vocabulary. Do not report test coverage additions as excess when they directly prove an acceptance clause. If no smaller diff satisfies the same requirements, return `NO_YAGNI_FINDINGS` and identify the largest components checked.
