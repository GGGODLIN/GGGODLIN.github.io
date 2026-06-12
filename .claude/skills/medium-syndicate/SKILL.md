---
name: medium-syndicate
description: 把 gggodlin-blog 已在原站上線的文章「全文轉發」到 Medium 的半自動標準流程（含 canonical 防護與轉發紀錄）。Trigger：「轉發到 Medium」「同步到 Medium」「把這篇或某 slug 發到 Medium」「cross-post to Medium」，或 /medium-syndicate 帶 slug。Do not use for：分享層貼文（LinkedIn / Threads / FB 只貼摘要＋連結，不是全文轉發）、轉發到 Medium 以外的平台（方格子 / dev.to 另案）、文章尚未在原站發布（先走正常發布流程）、修改已轉發的 Medium 文章。
---

# Medium 轉發標準流程

## 為什麼流程長這樣（讀完再動）

- **Medium API 已死**（2025 起停發新 integration token、不收新整合）——程式化發文不存在，流程必然是「本地準備 + 瀏覽器半自動 + 人工收尾」。
- **預設走「手動貼上 + 手動 canonical」而不是 Import a story**：Import 會把發布日期回溯成原文日期，Medium 分發演算法偏好新文，觸及吃虧；且 Import 走第三方解析，程式碼區塊大概率變形。使用者明說「用 import」才改走匯入（兩路徑對照見 [references/medium-mechanics.md](references/medium-mechanics.md)）。
- **canonical 是整個轉發的存在理由**：Medium 網域權重遠高於個人站，不設 canonical 等於把原站排名讓給 Medium 副本。所以 Step 8 是硬閘。

## 流程

slug = `src/content/blog/` 下的檔名（不含 .md）；`posts/` 是寫作草稿區，與本流程無關。使用者給的名字對不上時 `ls src/content/blog/` 對照確認，不要猜。

1. **防重複**：`grep "| <slug> |" docs/philip/syndication-log.md`（完整欄位格式，避免前綴重疊的 slug 誤命中；檔案不存在視為無紀錄）。已有紀錄 → 停，回報既有 Medium URL，結束。無紀錄 → 接 Step 2。
2. **跑 prep script**（repo root）：`node .claude/skills/medium-syndicate/scripts/medium-prep.mjs <slug>`，讀 JSON 輸出（title / description / tags / canonicalURL / outDir / risks）。注意 outDir 在 /tmp，macOS 重開機或隔夜可能被清——Step 7 要用時若檔案不在，重跑本步即可。接 Step 3。
3. **原站上線確認**：對 prep 輸出的 `canonicalURL` 跑 `curl -sI` 確認 200，再 `curl -s` 抓頁面 grep `rel="canonical"` 確認自我 canonical 存在。任一失敗 → 停（文章沒上線，先走發布流程），結束。通過 → 接 Step 4。
4. **風險處理（開瀏覽器前在對話裡先做完）**：
   - `risks.tableLines > 0` → Medium 編輯器不支援表格：把每個表格改寫成條列或段落，貼給使用者過目，**等拍板才繼續**；拍板後把定稿寫進 `<outDir>/table-rewrites.md`（Step 6 取用；/tmp 被清就重跑 Step 2 並重存）
   - `risks.images` 非空 → 列出哪幾張圖要在編輯器手動上傳，列完即續行
   - `risks.codeBlocks` 非空 → 列出區塊編號與語言，預告 Step 7 要逐塊重建，列完即續行
   - `risks.externalLinks` 僅供參考——貼渲染版會自動保留連結，不需處理
   全部處理完 → 接 Step 5。
5. **開瀏覽器**：`tabs_context_mcp` 看現況 → 新分頁開 `https://medium.com/new-story`。出現登入頁 → 停，請使用者登入 Medium 後說「好了」再繼續（不代登入）。已登入 → 另開一個分頁載原文頁。接 Step 6。
6. **內容搬運（人工最穩的一步）**：請使用者在原文頁全選文章內文複製、貼進 Medium 編輯器——貼渲染版會保留標題層級、粗體與連結。標題欄填 `title`、副標填 `description`。表格段落貼進來的是 Step 4 拍板的改寫版（使用者貼原版的話，提醒換成改寫版）。貼完 → 接 Step 7。
7. **程式碼區塊重建**：對照 `outDir` 裡的 `code-block-N.txt`，逐塊在編輯器中打三個反引號觸發原生 code block、貼入內容、左上角下拉選語言（自動偵測常錯，必看）。重建完用 `read_page` 抽草稿全文，跟 `body-no-frontmatter.md` 比對段落數與結尾段是否完整。接 Step 8。
8. **canonical 硬閘（發布前必做）**：編輯器右上三點選單 → **Customize canonical link**（舊版 UI 路徑：More settings → Advanced Settings → 勾「This story was originally published elsewhere」）→ 填 prep 輸出的 `canonicalURL` → Save。用 `read_page` 或截圖確認已儲存。設不成功 → 停在這裡排查，不進 Step 9。成功 → 接 Step 9。
9. **tags 與發布**：從 prep 的 `tags` 挑最多 5 個填入 Medium topics（對照建議見 [references/medium-mechanics.md](references/medium-mechanics.md) 的 tag 段）。**Publish 按鈕由使用者自己按**，不代發。使用者按完說發布了 → 接 Step 10。
10. **發布後驗證**：對 Medium 文章 URL `curl -s | grep -o '<link rel="canonical"[^>]*>'`（或 view-source），貼出實際 canonical 值給使用者比對是否指回原站。接 Step 11。
11. **轉發紀錄落檔**（副作用步驟，不可略過）：append 到 `docs/philip/syndication-log.md`（不存在先建，表頭：`# 轉發紀錄` + 欄位說明行）：

    ```
    - YYYY-MM-DD | <slug> | <Medium URL> | canonical=<驗證結果 ok/異常>
    ```

    寫完 grep 回讀確認該行存在，回報使用者，流程結束。

## 踩過的坑（撞反例就補一行）

- **Medium API / integration token 2025 起停發**，所有走 API 的第三方跨發布工具 Medium 段全廢——不要再評估 API 自動化路線（2026-06-13 查證，來源見 references）。
- **Import a story 會 backdate**：匯入自動把發布日期改成原文日期，Medium 端分發吃虧。這是預設不走 import 的原因（2026-06-13 查證）。
- **Medium 編輯器不支援表格**——表格必須在 Step 4 先改寫，貼上後才發現會卡在編輯器裡很難救（2026-06-13 查證）。
- **`medium.com/p/import` 未登入直接 403**：import 入口要從個人 Stories 頁右上角按鈕進，別給使用者直連網址（2026-06-13 curl 實測）。
