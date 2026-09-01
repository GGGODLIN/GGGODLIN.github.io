# 03 — 分離 exact tag 導覽與一般文字搜尋

**What to build:** raw tag 點擊改為依 canonical tag membership 顯示真正共享該 tag 的文章；一般搜尋維持標題、摘要與可見 tag label 的子字串搜尋。讀者可以清楚區分「沿同主題閱讀」與「找包含某個文字的文章」。

**Blocked by:** 02 — 套用 19 篇文章與寬主題 audit manifest

**Status:** completed

**Needs:** None — a worker can run focused tests and start the local app unaided

**TDD:** required

**TDD seam:** 首頁文章篩選的公開狀態轉換；第一個失敗測試必須證明點擊 `hook`、`skill`、`subagent`、`workflow` 時只回傳 canonical membership，而一般搜尋仍可命中標題、摘要與可見 label。

- [x] tag button 使用 canonical ID 作機器資料、registry label 作可見文字。
- [x] 點 tag 後啟用 exact tag filter，title／description substring 不得把額外文章混入。
- [x] 點 tag 後清除寬主題選擇；是否開啟搜尋面板不是 v1 契約。
- [x] 一般搜尋仍以大小寫不敏感的 substring 比對標題、摘要與可見 tag label。
- [x] v1 不承諾 canonical-ID-only 或 alias-only 搜尋。
- [x] 結果數、空狀態、全部重設、鍵盤操作與輔助技術語意維持可用。
- [x] `hook`、`skill`、`subagent`、`workflow` 四個既有碰撞案例的 exact result 與 frontmatter membership 一致。
- [x] Focused tests 與專案 content/type check 通過。

## Verification Log

- RED：公開 discovery seam 不存在時 focused test 以 `ERR_MODULE_NOT_FOUND` 失敗；review regression 另以缺少 ID 往返與 active-filter exports 失敗。
- GREEN：`npm test` 14／14；`npm run check` 0 errors／0 warnings；`npm run build` 產生 42 pages。
- Exact counts：hook 9、skill 3、subagent 3、workflow 7，均與 canonical frontmatter membership 一致。
- Rendered probe：40 篇、164 次 tag 指派；title、description、visible label 搜尋與 canonical button membership 全部 PASS。
- 狀態契約：tag 點擊清 query／topic、typing 清 tag、topic／reset／close 清 tag；相同 tag 可切換關閉。
- Minor：7 個既有 Astro hints 不在本 ticket 範圍；browser confirmation 留給 Ticket 04。
