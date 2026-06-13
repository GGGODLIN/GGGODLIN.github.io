---
name: medium-syndicate
description: 把 gggodlin-blog 已在原站上線的文章「全文轉發」到 Medium 的代發標準流程——agent 從貼稿到按 Publish 全程操作，使用者只需必要時登入一次與發布後驗收（含 canonical 防護與轉發紀錄）。Trigger：「轉發到 Medium」「同步到 Medium」「把這篇或某 slug 發到 Medium」「cross-post to Medium」，或 /medium-syndicate 帶 slug。Do not use for：分享層貼文（LinkedIn / Threads / FB 只貼摘要＋連結，不是全文轉發）、轉發到 Medium 以外的平台（方格子 / dev.to 另案）、文章尚未在原站發布（先走正常發布流程）、修改已轉發的 Medium 文章。
---

# Medium 轉發標準流程

## 為什麼流程長這樣（讀完再動）

- **Medium API 已死**（2025 起停發新 integration token、不收新整合）——程式化發文不存在，流程走「本地準備 + claude-in-chrome 操作使用者已登入的真實瀏覽器代發」。使用者已授權代發含按 Publish（2026-06-13）；使用者只在兩個點出現：未登入時登入一次、發布後驗收。
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
5. **開瀏覽器**：`tabs_context_mcp` 看現況 → 新分頁開 `https://medium.com/new-story`。出現登入頁 → 停，請使用者登入 Medium 後說「好了」再從本步重來（不代登入，這是流程唯一需要使用者操作的點）。已登入看到編輯器 → 接 Step 6。
6. **內容注入（代發）**：
   1. 跑 `node .claude/skills/medium-syndicate/scripts/medium-paste-html.mjs <slug>`——抓已發布頁、剝 header/footer/H1、把程式碼區塊與表格換成 ⟦CODE-BLOCK-N⟧ / ⟦TABLE-N⟧ 佔位符，產出 `<outDir>/paste.html`
   2. 跑 `bash .claude/skills/medium-syndicate/scripts/clipboard-html.sh <outDir>/paste.html` 把 HTML 放進系統剪貼簿（輸出應含 «class HTML»）
   3. **標題用剪貼簿貼上、不要用 `type`**（`type` 對混中英數標題會丟英文段，2026-06-13 實撞 MEMORY.md/25KB 被吞）：`printf '%s' '<title>' | pbcopy` → JS 取 `.graf--title` 的 `getBoundingClientRect()` 拿實際座標（別猜，視窗大小會變）→ 真實 `left_click` 該座標取得鍵盤 focus → `cmd+a` 全選 → `cmd+v` 貼上 → JS 讀 `.graf--title` 比對（NBSP 差異可接受，用 `.replace(/ /g,' ')` 正規化後比）。不符 → 重貼一次
   4. 重新 `bash clipboard-html.sh <outDir>/paste.html` 載回內文 HTML → 游標移到標題下方（Down）→ `cmd+v` 貼內文 → JS 確認段落數與 paste.html 的 paragraphs 大致相符、無殘留 ⟦⟧ 佔位符、無「Something is wrong」存檔錯誤。明顯缺段 → 重貼一次；仍失敗 → 停，回報使用者
   完成 → 接 Step 7。
7. **佔位符重建**：每個 ⟦CODE-BLOCK-N⟧：點進該段選取整行刪除 → 打三個反引號觸發原生 code block → `cat <outDir>/code-block-N.txt | pbcopy` → cmd+V → 左上角下拉選語言（自動偵測常錯，必看）。每個 ⟦TABLE-N⟧：同法換成 Step 4 拍板的 `table-rewrites.md` 對應段落（pbcopy 純文字貼上）。全部換完 `read_page` 全文比對 `body-no-frontmatter.md`，確認無殘留佔位符、結尾段完整。接 Step 8。
8. **canonical 硬閘（發布前必做）**：編輯器右上三點選單 → **Customize canonical link**（舊版 UI 路徑：More settings → Advanced Settings → 勾「This story was originally published elsewhere」）→ 填 prep 輸出的 `canonicalURL` → Save。用 `read_page` 或截圖確認已儲存。設不成功 → 停在這裡排查，不進 Step 9。成功 → 接 Step 9。
9. **tags 與發布（代發）**：點 Publish 進發布設定 → 填最多 5 個 topics（從 prep 的 `tags` 對應，建議見 [references/medium-mechanics.md](references/medium-mechanics.md) 的 tag 段）→ 確認 canonical 提示仍在 → 點最終 Publish 送出（使用者已授權，2026-06-13）→ 從發布完成頁取得文章 URL。接 Step 10。
10. **發布後驗證**：對 Medium 文章 URL `curl -s | grep -o '<link rel="canonical"[^>]*>'`（或 view-source），確認指回原站。接 Step 11。
11. **轉發紀錄落檔**（副作用步驟，不可略過）：append 到 `docs/philip/syndication-log.md`（不存在先建，表頭：`# 轉發紀錄` + 欄位說明行）：

    ```
    - YYYY-MM-DD | <slug> | <Medium URL> | canonical=<驗證結果 ok/異常>
    ```

    寫完 grep 回讀確認該行存在 → 給使用者驗收回報：Medium 文章 URL、canonical 實際值與原站 URL 的比對、佔位符重建數、全文比對結果。流程結束。

## 踩過的坑（撞反例就補一行）

- **Medium API / integration token 2025 起停發**，所有走 API 的第三方跨發布工具 Medium 段全廢——不要再評估 API 自動化路線（2026-06-13 查證，來源見 references）。
- **Import a story 會 backdate**：匯入自動把發布日期改成原文日期，Medium 端分發吃虧。這是預設不走 import 的原因（2026-06-13 查證）。
- **Medium 編輯器不支援表格**——表格必須在 Step 4 先改寫，貼上後才發現會卡在編輯器裡很難救（2026-06-13 查證）。
- **`medium.com/p/import` 未登入直接 403**：import 入口要從個人 Stories 頁右上角按鈕進，別給使用者直連網址（2026-06-13 curl 實測）。
- **空白草稿直接貼內文＝第一段被升格成標題**：標題 type 可能靜默失敗，貼上前必驗標題已落欄（2026-06-13 首發實撞，Step 6.3 已加驗證）。
- **「Something is wrong and we cannot save」紅條出現就停手重載**：之後的所有編輯都只在客戶端、存不進伺服器，增量修補是白做（2026-06-13 實撞；重載後從伺服器最後存檔狀態修起）。
- **編輯器內選取單一區塊用 JS Range（`selectNodeContents`），不要 triple-click**：triple-click 會跨塊選取，替換時把相鄰段落黏進來（2026-06-13 實撞）。
- **Topic 下拉點選不可靠，type + Enter 穩**：輸入完整 topic 名後按 Return 即掛上 chip；點 dropdown 項目兩次都沒反應（2026-06-13 實撞）。
- **canonical 輸入欄有預填值**：進編輯模式後先 cmd+A 再打字，否則 URL 串接成垃圾值（2026-06-13 實撞）。
- **發布後驗證走瀏覽器內 `fetch(location.href)` 抓 server HTML**：Medium 對 curl 一律 403，Step 10 的 curl 路徑對 Medium 無效（2026-06-13 實撞）。
- **Medium 每帳號每 24 小時最多發布/排程 2 篇**（紅條原文 maximum of two stories in the past 24 hours；2026-06-13 第 3 篇實撞）——批次轉發要按 2 篇/日排程，別嘗試繞過。草稿可先備好（內容+canonical+topics），視窗開了只差按 Publish。
- **navigate 到編輯器後等 2 秒再打標題**：頁面初始化中打字會吞掉開頭字元（標題截斷 2 次實撞）；打完必驗，錯了用 JS Range 選取重打。
- **topics 欄連續 type+Return 會黏成一串**：發布設定頁剛開時尤其會；第一個 topic 提交後驗證 chip 存在再繼續，黏掉就 cmd+A Delete 清掉重來（2026-06-13 實撞）。
- **`type` 對混中英數標題會丟英文段**（MEMORY.md / 25KB 整段消失，比單純吞頭嚴重；2026-06-13 實撞）——標題一律走 Step 6.3 的剪貼簿貼上，不要用 `type`。
- **長時間 unattended 瀏覽器 run 會環境降級**（2026-06-13 夜批次實撞）：症狀＝截圖 CDP timeout 30s（renderer 凍）/ 新草稿 URL 卡 `/new-story` 不前進 / 編輯器停止接收鍵盤事件。對策＝關分頁開新的；連兩個分頁都降級就停，等環境恢復或換 fresh session。**別在使用者離線時硬撞**——短 burst（一次 2-3 篇）比一夜全跑可靠得多。
- **批次草稿模式**（量大時）：建草稿無 24h 限制，可一次把標題+內文都備好；**canonical 與 topics 留到發布時設**（草稿未公開不會被索引，發布前設即可，正好對齊 Step 8）。Draft 只做 Step 5-7、跳過 8-11；發布日再對每篇跑 Step 8-11。進度記在 `docs/philip/medium-publish-queue.md`。
