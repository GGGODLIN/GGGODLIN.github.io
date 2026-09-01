# 02 — 建立系列連通 contract 與 after 關係圖

**What to build:** 把 13 個作者預期系列與各自有效 connector 寫成 deterministic corpus contract。每次 tag 變更都要證明系列在排除泛用 tag 後仍可透過有效 chain 互連；合理孤島不受此 gate 約束。完成後重生 after JSON／HTML，讓修正前後可對照。

**Blocked by:** 01 — 套用系列 connector tags

**Status:** completed

**Needs:** Local browser session for final HTML interaction check — a worker can start and operate it unaided

**Validation method:** 先寫 13-series graph test 並觀察修正前至少 7 個 series 失敗；套用 Ticket 01 後要求 13／13 connected。執行完整 tests、content check、production build，再從 current source 產生 distinct after JSON／HTML 並做 browser verification。

**Evidence required:** RED 列出 disconnected series IDs／components；GREEN 顯示 13／13 connected、generic connector violations 0、intentional islands 2；after artifact 列出 40 nodes、13 series、0 disconnected findings，browser 驗證 filters／network／tables 可用且 external requests 0。

**TDD:** required

**TDD seam:** expected-series connectivity contract over the public 40-article frontmatter corpus

- [x] Test manifest 包含 S01–S13 的 members 與核准 valid connector allowlist，來源獨立於 current tag co-occurrence。 — Source: Story 12
- [x] 每個系列只要求 connected，不要求 complete graph。 — Source: Story 14
- [x] `claude-code`、`methodology` 不得出現在任何 valid connector allowlist。 — Source: Story 13
- [x] weak cross-dimension tag 只有在特定系列明列為 valid 時才能計入連通。 — Source: Story 13
- [x] 13／13 series 在 final corpus 以 valid connector chain 連通，失敗訊息列 series ID、components 與 allowlist。 — Source: Story 2、12
- [x] `ai-report-two-lies`、`matt-philosophy` 保留為合理孤島，不被強制加入 series。 — Source: Story 11
- [x] 原始 before audit artifacts 保留；after graph 使用 distinct filenames，不能覆寫前態收據。 — Source: Further Notes
- [x] After JSON／HTML 使用 current frontmatter，顯示 40 nodes、13 series、7 個 before findings 已修正為 0 disconnected findings，且 merge verdict 不被改寫。 — Source: Story 15
- [x] HTML filters、edge layers、finding／series tables、keyboard 與 table view 可用；external requests 0。 — Source: Story 15
- [x] 完整 tests、content check、production build 通過，production source 除 registry／frontmatter／tests 外沒有變更。 — Source: Story 15；Out of Scope

## Verification Log

- RED：connectivity helper 尚不存在，focused run 為 13 pass／1 fail，`ERR_MODULE_NOT_FOUND`。
- GREEN：connectivity focused 4／4；`npm test` 17／17；`npm run check` 0 errors；`npm run build` 42 pages。
- Contract：S01–S13 全部 1 component；40 articles、60 memberships、2 intentional islands；forbidden generic connector occurrences 0。
- Negative seam：S99 fixture 會輸出 components 與 connector allowlist；chain fixture 證明不要求 clique。
- After artifacts：40 nodes、13 series、13 healthy、0 disconnected、F01–F07 resolved；6 個 do-not-merge verdict 保留。
- Determinism：JSON／HTML 連跑兩次逐 byte 相同；after source receipt 與 current frontmatter 一致。
- Browser：13 series、7 resolved findings、6 merge rows、2 islands；filters／edge layers／keyboard PASS；external requests 0；console errors／warnings 0。
- Lighthouse：Accessibility、Best Practices、SEO、Agentic Browsing 均 1.00，42 pass／0 fail。
- Review corrections：edge 來源改共用 connectivity helper；只有指定 connector 與 connected series 才標 resolved；intentional islands 反向驗算；generic tag 單一來源。
- Review HIGH 修正：抽出共用 recursive corpus reader，與 production `**/*.md` loader 對齊；nested／non-ASCII fixtures 通過且排序不依 locale。
- Review MEDIUM 修正：獨立 approved expected-series fixture 逐項鎖 S01–S13 members／validConnectors；connector 全部經 canonical registry fail-closed 驗證，generator 共用相同檢查。
- Review LOW 修正：反向 members、Map insertion、tag order 產出完全相同 components 與 failure message。
- Final after artifacts：JSON `0b721645…a62463`、HTML `80680e5c…9a24b`，兩次逐 byte 相同。
- Minor：7 個既有 Astro hints 不在本 ticket 範圍。
