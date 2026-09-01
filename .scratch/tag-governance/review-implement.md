# Tag governance review-implement

## Run 1

### Input

- target: gggodlin-blog tag governance implementation
- base_sha: `050baf553d3e2df31cdf728b10e2ae28583dd520`
- head_sha: `df81f94095c6b1aa908f0188f558bb917aa7d16c`
- spec: `.scratch/tag-governance/spec.md`
- tickets: `.scratch/tag-governance/issues/01-canonical-tag-registry.md` through `04-confirm-tag-governance.md`
- raw_session_paths: `/Users/linhancheng/.claude/projects/-Users-linhancheng-Desktop-projects-gggodlin-blog/987ee95d-717f-41ab-ae5b-5326b5375242.jsonl`
- selected_axes: `scope`, `yagni`
- logical_model: `claude-fable-5`
- resolved_models: scope=`gpt-5.6-sol`; yagni=`gpt-5.6-sol`
- started_at: `2026-08-30T07:00:20Z`
- session_count: 1
- total_raw_bytes: 5166591
- elapsed_time: 15m26s
- token_use: not reported

### Axis status

- scope: completed
- yagni: completed

### Events

- `2026-08-30T07:00:20Z` — top-level user selected `all`.
- Stable target confirmed: production diff is committed at `df81f94`; working tree contains only unrelated untracked scratch artifacts and `tokscale-2025-wrapped.png`.
- Scope reviewer `a2def8f1d15f197aa` completed with one CONFIRMED finding.
- YAGNI reviewer `a6ee19fdb8a656ecb` completed with two findings.
- Repair commit `fef88f443b1872a422f8b27f09b09a39716c558e` completed all three obligations.
- Targeted rechecks passed for S1, Y1, and Y2.
- Final suite passed against `fef88f4`: 12／12 tests, 0 check errors／warnings, 42-page production build.

### Findings

#### S1 — CONFIRMED：registry 登記不能取代 top-level user 核准

- Authority: raw transcript line 326, user quote「可以」，承接「遇到新 tag 時，發布流程先停下來等你確認」。
- Evidence: `src/content.config.ts` 只檢查 ID 是否已登記；`src/data/tag-registry.ts` 對已登記 ID 直接放行；project workflow 沒有新 tag 人類核准停點。
- Scope mismatch: agent 可同時修改 registry 與文章，未經 user 核准仍通過 build。

#### Y1 — 重複的 tag JSON 傳輸層

- Evidence: `data-tags` 與每篇文章既有的 `[data-tag]` buttons 同時保存相同 canonical IDs。
- Smaller substitute: discovery 初始化直接從文章內 tag buttons 讀取 `dataset.tag`，刪除 serialize／parse helpers、attribute 與 round-trip tests。
- Acceptance preserved: A1–A18。

#### Y2 — 九篇 mechanical fixture 與完整 manifest 重複

- Evidence: `tests/tag-registry.test.ts` 的九篇 `expectedMechanicalTags` 全部被 40 篇 `expectedFinalTags` 與 approved before／after contract 包含。
- Smaller substitute: 刪除重複 fixture 與測試，保留完整 manifest 及全 corpus canonical-ID test。
- Acceptance preserved: A1–A18。

### Main decisions

- S1: CONFIRMED，accept。
- Y1: accept；移除雙重 DOM 表示比保留 malformed JSON 容錯更小，文章 membership buttons 是同一 SSR 來源。
- Y2: accept；完整 manifest 已提供更強且獨立的 40 篇 contract。

### Repair obligations

- [x] S1：project `CLAUDE.md` 新增 top-level user 核准停點；unknown-tag 錯誤明示先取得核准，再登記；registry entry 本身不算核准。
- [x] Y1：移除 `data-tags` JSON serialization／parsing 與專用 tests，改由 article 內 canonical tag buttons 建立 discovery membership。
- [x] Y2：移除九篇重複 mechanical fixture／test。

### Targeted rechecks

- S1 PASS：`CLAUDE.md` 明文要求 registry 新 ID 先取得當回合 top-level user 核准；production error 與 test 同步要求 approval-before-register。
- Y1 PASS：repo grep 找不到 `serializeArticleDiscoveryIds`、`parseArticleDiscoveryIds`、`data-tags`；首頁改從 `.tag-filter[data-tag]` 建立 membership。
- Y2 PASS：repo grep 找不到 `expectedMechanicalTags` 或舊 Ticket 01 fixture test；完整 40 篇 manifest 與全 corpus canonical-ID test 保留。
- Focused verification：9／9 tests、`astro check` 0 errors／warnings、`git diff --check` 無輸出。
- Final suite：`npm run build` 自動跑 12／12 tests、`astro check` 0 errors／warnings，再完成 42-page build。

### Summary

- final_head_sha: `fef88f443b1872a422f8b27f09b09a39716c558e`
- scope: completed, S1 repaired and targeted recheck PASS
- yagni: completed, Y1／Y2 repaired and targeted recheck PASS
- final_suite: PASS
- Run status: PASS

### Architecture visual decision

- candidate: yes — final diff adds registry、topic、discovery modules and new module edges inside the Astro app.
- top-level user decision: `b`（這次不用）
- outcome: waived
- feature_base_sha: `050baf553d3e2df31cdf728b10e2ae28583dd520`
- final_head_sha: `fef88f443b1872a422f8b27f09b09a39716c558e`
- Archify invocations: 0
- Plannotator invocations: 0
