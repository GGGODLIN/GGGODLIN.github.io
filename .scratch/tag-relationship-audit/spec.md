## Problem Statement

目前所有文章 tag 都能精確點擊，但「技術上會過濾」不等於「系列文容易互相走到」。從 40 篇正文獨立推導出的 13 個預期系列中，只有 6 個能靠具辨識力 tag 連通，7 個被拆成多個 component。原始 tag 圖有大量邊，但 543 條只靠 `claude-code` 或 `methodology` 等泛用 tag，相連不代表同一閱讀目的。

問題不在 singleton、合理孤島或 clickable 行為。真正缺口是：文章已有明文承接或共同問題家族，卻缺少能表達該系列閱讀目的的中層 connector；或只靠模型、工具、hook 等交叉維度 tag 看似相連。

## Solution

保留所有現有窄 tag 與 clickable 行為，不合併已證明具有不同閱讀目的的 tag。依已通過驗證的 7 個 relationship findings，替相關文章補上既有 connector，並新增 4 個具明確邊界的中層 tag：`report-vs-reality`、`review-governance`、`scope-control`、`trial-review`。

新增 repo 內 deterministic expected-series connectivity test。測試從 40 篇 final frontmatter 建圖，排除泛用 tag，並針對 13 個系列各自使用已核准的有效 connector allowlist；每個系列只要求 connected，不要求 complete graph，也不要求合理孤島接入任何系列。

完成後重新產生 post-repair 關係圖與表格，確認 13 個預期系列都能靠有效 connector 互通，且 production source 沒有 UI 或文章正文變更。

## User Stories

1. As a reader, I want every tag to remain clickable, so that narrow product names and future series seeds still have direct entry points. [user: "clickable可以全做"]
2. As a reader, I want articles in an expected series to share a meaningful navigation path, so that I do not need a generic tag to move between related posts. [user: "重點是要抓出我們以為的系列文卻不容易互連的問題"]
3. As a reader, I want narrow tags preserved alongside a connector tag, so that specificity and series navigation do not compete. [user: "一篇文章同時有多個涵蓋範圍低的tag"]
4. As a reader, I want `deep-research` to connect the workflow definition, rate-limit, and resume articles, so that the engineering chain is explicit. [evidence: relationship finding F01]
5. As a reader, I want completion-monitoring articles to share `verify`, so that checker, watchdog, failure-report, and model-judge posts form one path. [evidence: relationship finding F03]
6. As a reader, I want defense-strength articles to share `automation`, so that enforcement location and strength can be read as one series. [user: "可以按照你建議"]
7. As a reader, I want report／reality mismatch articles to share one connector, so that completion claims, silent model behavior, and source verification form one family. [evidence: relationship finding F02]
8. As a reader, I want review perspective, evidence, trigger, and impact articles connected through `review-governance`, so that code review and spec review remain distinct but navigable. [user: "可以按照你建議"]
9. As a reader, I want the YAGNI／review stop-line pair connected through `scope-control`, so that model identity is not mistaken for the reason those articles belong together. [user: "可以按照你建議"]
10. As a reader, I want trial lifecycle articles connected through `trial-review`, so that evaluation windows, scorecards, KEEP／KILL decisions, and narrowing decisions form one route. [evidence: relationship finding F07]
11. As an author, I want reasonable islands to remain allowed, so that independent essays and series seeds are not forced into artificial relationships. [user: "也許真的有合理的孤島"]
12. As a maintainer, I want a deterministic connectivity contract for expected series, so that future tag changes cannot silently split a known series. [user: "可以建構關係圖，然後確認他們之前真的可以按照關係互連"]
13. As a maintainer, I want generic tags excluded from series connectivity evidence, so that `claude-code` or `methodology` cannot make a broken series look healthy. [user: "最好不是透過那種爛大街的tag才能達成互連"]
14. As a maintainer, I want connectivity validated as a chain rather than every pair sharing a tag, so that useful multi-stage series can use different connector subsets without becoming a clique. [evidence: relationship audit — S01 is healthy through an alternate valid chain]
15. As a maintainer, I want the final 40-article manifest, registry, topic counts, and relationship graph regenerated after repair, so that completion uses current source rather than the pre-repair audit. [evidence: relationship audit input receipts]

## Implementation Decisions

- Keep the current exact tag filtering and clickable UI unchanged. This change modifies registry data, article frontmatter, tests, and local audit artifacts only. [user: "clickable可以全做"]
- Add `deep-research` to `workflow-vs-skill` and `unattended-workflow-resume`. [evidence: relationship finding F01]
- Add `report-vs-reality` to `exit-0-illusion`, `protocol-model-dependency`, and `websearch-misses-official-docs`. [evidence: relationship finding F02]
- Add `verify` to `local-llm-hook-judge` and `checker-layoff`. [evidence: relationship finding F03]
- Add `automation` to `model-routing`, `steal-determinism-layer`, and `test-theater`. Do not create `rule-enforcement` in v1. [user: "可以按照你建議"]
- Add `review-governance` to `model-routing`, `one-model-not-enough`, `sem-blast-radius`, and `spec-review-round`. [user: "可以按照你建議"]
- Add `scope-control` to `gpt-review-tunnel-vision` and `sol-overimplementation`; keep this as a narrower series than general GPT behavior. [user: "可以按照你建議"]
- Add `trial-review` to `absorb-awesome-list`, `bumblebee-still-on-disk`, `checker-layoff`, `dcg-safety-lock`, `local-llm-hook-judge`, `prose-exams`, `sem-blast-radius`, and `trial-review-system`. [evidence: relationship finding F07]
- Add four registry entries with stable IDs and readable labels. Their dimensions are subject; their meanings and boundaries must distinguish them from existing `verify`, `fact-check`, `code-review`, `spec-review`, `tool-adoption`, `workflow`, and `gpt`. [evidence: relationship mismatch report]
- Keep all existing tags; this repair has 24 tag additions across 20 unique articles and no removals or merges. [evidence: approved F01–F07 recommendations]
- Leave all four new connector tags unmapped from broad topics. They exist for specific series navigation, not as substitutes for the six topic filters. [inferred]
- Allow existing mapped tags to change topic membership naturally: `verify` adds one article to 品質與驗證, and `automation` adds three articles to Hook; `deep-research` additions do not change topic membership because both articles already belong to 工作流. [evidence: current topic-group mapping]
- Update the final topic contract to 工作流 13、模型 12、工具 16、記憶 4、品質與驗證 13、Hook 12. [evidence: deterministic projection of approved additions]
- Update the full 40-article final tag manifest rather than preserving the prior 19-change count as the current final-state contract. Historical audit counts remain in scratch reports. [inferred]
- Add an expected-series test manifest for S01–S13. Each series declares members and valid connector tags; the test constructs an undirected graph using only allowed shared tags and requires one connected component. [user: "可以建構關係圖，然後確認他們之前真的可以按照關係互連"]
- Exclude `claude-code` and `methodology` from every series connector allowlist. Weak cross-dimension tags such as `hook`, `workflow`, or `gpt` count only where the approved series explicitly lists them as valid. [user: "最好不是透過那種爛大街的tag才能達成互連"]
- Do not require intentional islands to join a series. `ai-report-two-lies` and `matt-philosophy` remain valid outside the 13 series contract. [user: "也許真的有合理的孤島"]
- Regenerate a local post-repair graph and table from current frontmatter after tests pass; do not publish graph UI to the site. [user: "可以建構關係圖"]

## Testing Decisions

- Extend the existing 40-article manifest contract with the 24 approved additions and verify all current final tag sets.
- Add registry tests for the four connector IDs, labels, required fields, uniqueness, and actionable unknown-tag behavior.
- Add one deterministic expected-series connectivity test file. Its expected series list comes from the verified expected-series audit, not from current tag co-occurrence.
- For each series, the first failing assertion must identify the disconnected series ID, components, and valid connector allowlist.
- Verify all 13 series become connected through valid connectors after the frontmatter changes.
- Verify `claude-code` and `methodology` never appear in a connector allowlist.
- Verify the two intentional islands are present in the 40-article corpus but are not required series members.
- Verify the new final counts: 40 articles, 188 tag assignments, 58 used and registered tags, no unknown or unused registry IDs, and topic counts 13／12／16／4／13／12.
- Run the existing test suite, content check, and production build.
- Regenerate local relationship JSON／HTML and verify it reports 13 healthy series, 0 disconnected findings, while preserving the pre-repair audit as historical evidence.

## Out of Scope

- Disabling click behavior for singleton or narrow tags.
- Deleting or hiding reasonable islands.
- Merging `code-search` with `mcp`, `llm` with `vendor-swap`, `code-review` with `spec-review`, `automation` with `hook`, `fact-check` with `verify`, or `tool-adoption` with `tool-evaluation`.
- Replacing the six broad topics.
- Adding the relationship graph to the public site.
- Rewriting article titles, descriptions, dates, bodies, or prose.
- Adding analytics, similarity search, embeddings, or runtime graph computation.

## Further Notes

The pre-repair artifacts remain the evidence that identified the seven gaps. Post-repair artifacts must use distinct filenames or clearly state that they represent the after state; they must not overwrite the before-state audit receipts.

The relation contract is intentionally curated. It tests known author-intended series and their valid reading-purpose connectors; it does not infer future series from frequency, graph density, or generic similarity.

## Implementation Findings

- Final corpus：40 articles、188 tag assignments、58 used／registered tags、24 additions across 20 articles、0 removals、unknown／unused 0。
- Final topic counts：工作流 13、模型 12、工具 16、記憶 4、品質與驗證 13、Hook 12。
- S01–S13 all pass the deterministic connectivity contract with one component each; `claude-code`／`methodology` appear in zero connector allowlists。
- The contract accepts valid chains without requiring a clique and reports series ID、components、allowlist for disconnected fixtures。
- `ai-report-two-lies`、`matt-philosophy` remain intentional islands outside required series membership。
- Post-repair artifacts use distinct `relationship-graph-after` filenames and report 13 healthy、0 disconnected; pre-repair artifacts remain unchanged。
- Browser verification passed all series filters、edge layers、tables、keyboard interaction, with external requests 0 and no console errors／warnings。
- No production UI、article prose、broad-topic structure, global skill, or public graph page changed。
