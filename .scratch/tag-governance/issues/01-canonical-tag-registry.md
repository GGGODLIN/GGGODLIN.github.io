# 01 — 建立 canonical tag registry 與驗證路徑

**What to build:** 建立專案內單一、可讀可審的活詞彙表，讓文章以穩定 tag ID 儲存、介面以 label 顯示，並讓既有內容檢查拒絕未登記或解析衝突的 tag。這張票同時完成七組機械性 canonicalization，讓 registry 到文章、首頁與文章頁形成第一條可運作的完整路徑。

**Blocked by:** None — can start immediately

**Status:** completed

**Needs:** None — a worker can check every item unaided

**TDD:** required

**TDD seam:** registry 的公開解析與驗證介面；第一個失敗測試必須觀察未知 ID、重複 ID／alias、缺必要欄位，以及 ID 對 label 的渲染資料。

- [x] 活詞彙表包含本次 corpus 所需的 canonical ID、label、aliases、dimension、meaning、boundary，且不建立第二份人工維護的真相源。
- [x] 七組 audit 明列的格式變體完成 canonicalization；未明列的未來 tag 不套用額外全域命名法。
- [x] 文章 frontmatter 只接受已登記 canonical ID；未知 tag 的錯誤訊息點名問題值並說明「改用既有 ID／登記新 tag」兩條路。
- [x] 重複 ID、同一 alias 指向多個 tag、缺必要欄位時檢查失敗。
- [x] 首頁與文章頁顯示 registry label，不把 canonical ID 當讀者文案。
- [x] singleton 不因使用次數觸發錯誤或刪除。
- [x] `claude-code` 只保留 audit 核准的現有文章，且不再作為新文預設值。
- [x] Focused tests、專案 content/type check 均通過。

## Verification Log

- RED：registry module 尚不存在時，focused test 以 `ERR_MODULE_NOT_FOUND` 失敗；corpus probe 另抓到未 canonicalized tags。
- GREEN：`npm test` 6／6 通過；unknown ID、duplicate ID、alias 衝突、缺欄位、label lookup、不可變性與 40 篇 canonical corpus 均有覆蓋。
- V3：`npm run check` 為 0 errors／0 warnings；`npm run build` 產生 42 pages；unknown-tag fixture 真實使 content check 失敗並顯示 reuse／register 指引。
- Minor：7 個既有 Astro hints 不在本 ticket 範圍；Ticket 02 semantic manifest 與 Ticket 03 exact navigation 尚未執行。
