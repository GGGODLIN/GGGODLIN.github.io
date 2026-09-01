# 01 — 套用系列 connector tags

**What to build:** 依核准的 7 個 relationship findings，替 20 篇文章補 24 個中層 connector tag，新增 4 個有明確意思與邊界的 registry entries，讓預期系列能以內容關係互連，同時保留全部窄 tag 與 clickable 行為。

**Blocked by:** None — can start immediately

**Status:** completed

**Needs:** None — a worker can check every item unaided

**Validation method:** 先用 final 40-article manifest 與 registry contract 寫 failing tests，再套 tag additions；執行 focused tests、完整 tests、content check、production build，並比較 UI source diff 為空。

**Evidence required:** RED output 指出缺少 connector IDs／article tags；GREEN 輸出包含 40 articles、188 assignments、58 registry／used tags、20 affected articles、topic counts 13／12／16／4／13／12、unknown／unused 0，以及 UI source 未修改的 diff 收據。

**TDD:** required

**TDD seam:** canonical registry 與 40-article final manifest contract

- [x] Registry 新增 `report-vs-reality`、`review-governance`、`scope-control`、`trial-review`，每項具 label、dimension、meaning、boundary，且 aliases 唯一。 — Source: Story 7、8、9、10
- [x] F01：`workflow-vs-skill`、`unattended-workflow-resume` 補 `deep-research`。 — Source: Story 4
- [x] F02：`exit-0-illusion`、`protocol-model-dependency`、`websearch-misses-official-docs` 補 `report-vs-reality`。 — Source: Story 7
- [x] F03：`local-llm-hook-judge`、`checker-layoff` 補 `verify`。 — Source: Story 5
- [x] F04：`model-routing`、`steal-determinism-layer`、`test-theater` 補 `automation`，不新增 `rule-enforcement`。 — Source: Story 6
- [x] F05：`model-routing`、`one-model-not-enough`、`sem-blast-radius`、`spec-review-round` 補 `review-governance`。 — Source: Story 8
- [x] F06：`gpt-review-tunnel-vision`、`sol-overimplementation` 補 `scope-control`。 — Source: Story 9
- [x] F07：8 篇 trial lifecycle 文章補 `trial-review`。 — Source: Story 10
- [x] Final manifest 只增加 24 次指派、影響 20 篇，沒有刪除或合併任何既有 tag。 — Source: Story 1、3、11
- [x] Final counts 為 40 articles、188 assignments、58 registry entries／used tags，unknown／unused 0。 — Source: Story 15
- [x] 六 topics 維持原結構；final counts 為工作流 13、模型 12、工具 16、記憶 4、品質與驗證 13、Hook 12。 — Source: Story 15
- [x] Homepage、article layout、exact click 與 search code 無變更。 — Source: Story 1；Out of Scope

## Verification Log

- RED：focused tests 3 failures，分別抓到 registry 54≠58、`local-llm-hook-judge` 缺 `verify`、4 個 connector IDs 不存在。
- GREEN：focused 13／13；`npm test` 13／13；`npm run check` 0 errors；`npm run build` 42 pages。
- Final corpus：40 articles、188 assignments、58 registry／used tags、unknown／unused 0、24 additions、20 affected articles、0 removals。
- Topic counts：工作流 13、模型 12、工具 16、記憶 4、品質與驗證 13、Hook 12。
- Scope：只改 registry、20 篇 frontmatter 與 manifest／registry tests；UI、layout、search、exact click、topic group source diff 皆為 0。
- Review correction：final manifest 由完整 pre-connector manifest＋核准 additions 推導；4 個新 connector metadata 有完整 assertions。
- Minor：7 個既有 Astro hints 不在本 ticket 範圍。
