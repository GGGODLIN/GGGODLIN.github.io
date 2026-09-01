# 04 — 驗收完整 tag governance 與發布路徑

**What to build:** 對完成後的 final state 做一次批次驗收，留下 corpus、registry、寬主題、搜尋、exact tag 導覽與 production build 的可重跑證據。這張票不再擴功能，只確認前三張票真正完成。

**Blocked by:** 01 — 建立 canonical tag registry 與驗證路徑；02 — 套用 19 篇文章與寬主題 audit manifest；03 — 分離 exact tag 導覽與一般文字搜尋

**Status:** completed

**Needs:** Local dev server and browser session — a worker can start and operate both unaided

**TDD:** waived

**TDD waiver:** non-executable-artifact

**TDD waiver approved:** ticket-breakdown-user-approved

- [x] **Confirmation:** 外部枚舉仍為 40 篇來源文章，所有文章只使用已登記 canonical IDs。
- [x] **Confirmation:** approved 19-article manifest、七組 canonicalization、registry entries 與六個寬主題逐項對帳，缺漏與重複都是 0。
- [x] **Confirmation:** content/type check 與 production build 通過；未知 tag fixture 能真實使檢查失敗並顯示可操作訊息。
- [x] **Confirmation:** 真實首頁瀏覽器驗證 exact `hook`／`skill`／`subagent`／`workflow` 結果，並驗證一般搜尋沒有退化。
- [x] **Confirmation:** 「品質與驗證」、其他五個寬主題、多重 membership、結果數、空狀態、重設、鍵盤操作與窄螢幕行為正常。
- [x] **Confirmation:** 文章頁顯示可讀 label，不顯示內部 ID。
- [x] **Confirmation:** 不存在 runtime legacy alias 層、額外 frontend test framework、global skill 修改或視覺改版。
- [x] **Contract:** Verification Log 記錄命令、計數與 browser 可觀察結果，供完成宣稱引用。

## Verification Log

- Static corpus：40 篇、19 篇 approved change set、54 registry entries、obsolete IDs 0、六 topics 覆蓋 40／40。
- Topic counts：工作流 13、模型 12、工具 16、記憶 4、品質與驗證 12、Hook 9。
- Full suite：`npm test` 14／14；`npm run check` 0 errors／0 warnings／7 existing hints；`npm run build` 42 pages；`git diff --check` 無輸出。
- Unknown-tag contract：真實 fixture 使 content check 失敗，錯誤點名 unknown value 並提示 reuse／register。
- Browser Harness receipt：`b24d7dc0-58bf-4831-b032-22e54187dc23`，telemetry disabled、recordings off、無 helper。
- Browser：首頁 40 篇；品質與驗證 12 篇；hook／skill／subagent／workflow exact counts 為 9／3／3／7；title／description／visible label 搜尋 PASS；topic reset、Enter／Escape focus、單一 polite live region PASS。
- Narrow viewport：360px 下 `scrollWidth=360`、所有 tag buttons 在 viewport 內、無水平溢出。
- Article page：`agent-tool-reach` 顯示 `Claude Code`／`MCP` labels，未洩漏 `claude-code`／`mcp` IDs。
- Browser route degradation：Chrome DevTools MCP 三次逾時後停止其 tasks，改用 Browser Harness；第一次 payload 把「全部」按鈕視為 active topic 而失敗，修正測試 selector 後同一路徑通過，product code 未改。
- Forbidden scope：無 runtime legacy alias layer、無 frontend test framework、無 global skill 修改、無視覺改版。
- Review HIGH：malformed `data-tags` 原會丟出未捕捉 `SyntaxError`；新增 RED fixture 後以 `try/catch → []` 修正，focused test 1／1。
- Review MEDIUM：registry 外層未 freeze；新增 runtime mutation RED fixture 後以 `Object.freeze` 修正，focused test 1／1。
- Review MEDIUM：測試 script 補 `--experimental-strip-types`，支援 Astro 接受的 Node 22 範圍；`npm test` 14／14。
- Review MEDIUM：新增 `prebuild = npm test && npm run check`，GitHub Pages 既有 `npm run build` 路徑會先執行 tests 與 check；final build 通過。
- Review MEDIUM：active tag 新增 accent＋underline 持續狀態。post-change Browser Harness 因 Chrome remote-debugging Allow popup 無法重跑 computed-style probe；既有 browser run 已驗證 runtime `aria-pressed=true`，final build CSS 則實際包含 scoped `[aria-pressed=true]` 的 color、underline、2px thickness 與 offset。
