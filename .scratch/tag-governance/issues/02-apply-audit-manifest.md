# 02 — 套用 19 篇文章與寬主題 audit manifest

**What to build:** 依已核准且獨立驗收的 audit manifest，逐篇套用 19 筆 before／after tag 建議，並同步窄修六個寬主題的 label 與 membership。完成後，文章 tag 與首頁寬主題必須同時符合 audit，不重新設計 taxonomy。

**Blocked by:** 01 — 建立 canonical tag registry 與驗證路徑

**Status:** completed

**Needs:** None — a worker can check every item unaided

**TDD:** required

**TDD seam:** 以 approved audit manifest 為外部分母的 corpus contract；第一個失敗測試必須比較 40 篇來源文章、19 篇變更集合、各篇 canonical tags 與六個寬主題落點。

- [x] 19 篇文章的 final tag set 與 approved audit manifest 一致，包含 `retire-vector-memory` 新增 `tool-adoption`。
- [x] 未列入 19 篇的文章除了 ticket 01 明列的機械性 canonicalization 外維持原 tag set。
- [x] `Review` 改為「品質與驗證」，並從該主題移除 `security`、`supply-chain` references；兩個 raw tags 保留。
- [x] `token-optimization` 從「工具」membership 移除，但 raw tag 保留。
- [x] `ai-agent`、`workflow-resume` 以 canonical ID 進入「工作流」。
- [x] `bumblebee-still-on-disk`、`retire-vector-memory` 透過 `tool-adoption` 進入「工具」，不把產品名或 `vector-db` 變成全域 topic alias。
- [x] 六個寬主題維持非互斥；40／40 篇至少命中一個主題。
- [x] 不建立 runtime 或 multi-commit legacy-alias compatibility layer；完整 final state 一次通過檢查。
- [x] Manifest contract、專案 content/type check、production build 均通過。

## Verification Log

- RED：focused manifest tests 為 3 failed／6 passed，抓到文章 final tags、registry 舊 ID 與六 topics 尚未套用。
- GREEN：`npm test` 9／9；`npm run check` 0 errors／0 warnings；`npm run build` 產生 42 pages。
- Corpus contract：40 篇來源、approved before／after 基準導出 19 篇 changed set、registry 54 entries、obsolete IDs 0、六 topics 覆蓋 40／40。
- Topic counts：工作流 13、模型 12、工具 16、記憶 4、品質與驗證 12、Hook 9。
- Review 修正：首頁與測試共用 `getTopicIds`；topic references 全部經 registry 驗證，canonical `FFF` 已補反例測試。
- Minor：frontmatter 測試 parser 只接受單行 JSON `tags: [...]`；本回合枚舉 40／40 篇符合此 repo 慣例。7 個既有 Astro hints 不在本 ticket 範圍。
