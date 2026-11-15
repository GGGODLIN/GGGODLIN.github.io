---
name: medium-syndicate
description: 把 gggodlin-blog 已在原站上線的文章「全文轉發」到 Medium 的代發標準流程——agent 從貼稿到按 Publish 全程操作，使用者只需必要時登入一次與發布後驗收（含 canonical 防護與轉發紀錄）。Trigger：使用者要把原站已上線的文章全文轉發到 Medium（含 `/medium-syndicate` 帶 slug）。Do not use for：分享層貼文（LinkedIn / Threads / FB 只貼摘要＋連結，不是全文轉發）、轉發到 Medium 以外的平台（方格子 / dev.to 另案）、文章尚未在原站發布（先走正常發布流程）、修改已轉發的 Medium 文章。
---

# Medium 轉發標準流程

## 為什麼流程長這樣（讀完再動）

- **Medium API 已死**（2025 起停發新 integration token、不收新整合）——程式化發文不存在，流程走「本地準備 + LCU MCP（`mcp__lcu__js`）操作使用者已登入的日常 Chrome 代發」。使用者已授權代發含按 Publish（2026-06-13）；使用者只在兩個點出現：未登入時手動登入一次、發布後驗收。
- **預設走「手動貼上 + 手動 canonical」而不是 Import a story**：Import 會把發布日期回溯成原文日期，Medium 分發演算法偏好新文，觸及吃虧；且 Import 走第三方解析，程式碼區塊大概率變形。如果要比對匯入與手動貼上路徑或查對應的建議標籤，就在執行對應步驟前讀 [references/medium-mechanics.md](references/medium-mechanics.md)。
- **canonical 是整個轉發的存在理由**：Medium 網域權重遠高於個人站，不設 canonical 等於把原站排名讓給 Medium 副本。所以 Step 8 是硬閘。
- **LCU 單分頁＋CDP 事件注入比系統剪貼簿穩**：依 context 裡已有的瀏覽器路由規範，只操作自建分頁，不呼叫 `cua.getState()` 傾印全機分頁、不呼叫 `tab.playwright.evaluate`／`tab.evaluate`（本機政策禁止）。在 `cua_repl` 內直接由 Node `fs.readFileSync` 讀取 `<outDir>/paste.html`，經 `tab.capabilities.get("cdp")` 的 `Runtime.evaluate` 派發 `ClipboardEvent('paste', { clipboardData: DataTransfer })`，既不會搶使用者系統剪貼簿與前景焦點，也不會因模型複述長字串產生錯字。

## 流程

slug = `src/content/blog/` 下的檔名（不含 .md）；`posts/` 是寫作草稿區，與本流程無關。使用者給的名字對不上時 `ls src/content/blog/` 對照確認，不要猜。

1. **防重複（兩個檔都要查）**：
   - `command grep "| <slug> |" docs/philip/syndication-log.md`（完整欄位格式，避免前綴重疊的 slug 誤命中；檔案不存在視為無紀錄）→ 已有紀錄代表**已發布**，停，回報既有 Medium URL，結束。
   - `command grep "<slug>" docs/philip/medium-publish-queue.md`（批次草稿模式的進度落點）→ 命中代表**草稿已建、只差發布**，跳過 Step 2–7，直接從 Step 8 對既有草稿續做。
   - 兩邊都無紀錄 → 接 Step 2。怎樣算做完：兩個檔案皆完成查詢且無命中紀錄（或已依命中分支停下／跳步）。

   為什麼要查第二個檔：草稿模式只做 Step 5–7、不會寫 syndication-log，只查那一個檔會判成「沒轉過」而重建一份草稿，同一篇文章在 Medium 留下兩個草稿。
2. **跑 prep script**（repo root）：`node .claude/skills/medium-syndicate/scripts/medium-prep.mjs <slug>`，讀 JSON 輸出（title / description / tags / canonicalURL / outDir / risks）。注意 outDir 在 `/tmp`，macOS 重開機或隔夜可能被清——後續步驟要用時若檔案不在，重跑本步即可。怎樣算做完：拿到完整 JSON 欄位與 `outDir` 路徑。完成後接 Step 3。
3. **原站上線確認**：對 prep 輸出的 `canonicalURL` 跑 `curl -sI` 確認 HTTP 200，再 `curl -s` 抓頁面確認含 `rel="canonical"` 指向原站自己。任一失敗 → 停（文章沒上線，先走發布流程），結束。怎樣算做完：HTTP 狀態為 200 且自我 canonical 存在。通過後接 Step 4。
4. **風險處理（開瀏覽器前在對話裡先做完）**：
   - `risks.tableLines > 0` → Medium 編輯器不支援表格：把每個表格改寫成條列或段落，貼給使用者過目，**等拍板才繼續**；拍板後把定稿寫進 `<outDir>/table-rewrites.md`（Step 7 取用；`/tmp` 被清就重跑 Step 2 並重存）。
   - `risks.images` 非空 → 列出哪幾張圖要在編輯器上傳，列完即續行。
   - `risks.codeBlocks` 非空 → 列出區塊編號與語言，預告 Step 7 要逐塊重建，列完即續行。
   - `risks.externalLinks` 僅供參考——貼渲染版會自動保留連結，不需處理。
   - 接著在本地先跑 `node .claude/skills/medium-syndicate/scripts/medium-paste-html.mjs <slug>` 產出 `<outDir>/paste.html`（抓已發布頁、剝 header/footer/H1、把站內相對連結轉成絕對並回報 `relativeLinksAbsolutised`、程式碼與表格換成 `⟦CODE-BLOCK-N⟧` / `⟦TABLE-N⟧` 佔位符）。
   怎樣算做完：四項 `risks` 皆已核對處置，且 `<outDir>/paste.html` 非空落地。完成後接 Step 5。
5. **開瀏覽器與檢查登入狀態（LCU 入口）**：
   - 若本回合 `cua_repl` 尚未初始化，第一發 `mcp__lcu__js` 呼叫只能單獨執行一行入口（不可夾帶其他呼叫、等待或讀檔，否則違反 LCU 啟動協定）：
     ```js
     let tab = await cua.createBrowserTab("chrome", "https://medium.com/new-story", { sessionName: "📝 Medium Syndicate" });
     ```
     若同回合已有自建 `tab`，直接用 `await tab.goto("https://medium.com/new-story")` 導航。不呼叫 `cua.getState()`，不碰使用者既有無關分頁；若 LCU 未載入、未連線或遭拒絕授權，立即停下回報阻塞，不自行改切 `claude-in-chrome`、`chrome-devtools` 或其他工具。
   - 讀回首次呼叫附帶的說明文件與初始 AX 狀態：若畫面落在登入頁（無編輯器輸入區），先呼叫 `await tab.markHandoff()`（避免回合結束自動清理關掉使用者的登入分頁），再送出 `mcp__lcu__js({ completion_summary: "Requested Medium login" })` 後停下，請使用者手動登入後說「好了」再續做（不代填帳密）。
   - 已登入看到編輯器 → 呼叫一次 `nodeRepl.write(await agent.documentation.get("capabilities/tab/cdp"));` 解鎖 `cdp` 能力文件。怎樣算做完：確認已登入 Medium 編輯器且 `capabilities/tab/cdp` 文件已讀取。完成後接 Step 6。
6. **內容注入與逐塊比對（CDP `ClipboardEvent`）**：
   在 `mcp__lcu__js` 中取 `let cdp = await tab.capabilities.get("cdp")`，用 `await import("node:fs")` 從磁碟直接讀 `<outDir>/paste.html`（不手貼長字串或 base64，避免模型複述漂移）：
   1. **標題注入**：透過 `cdp.send("Runtime.evaluate", ...)` 選取 `.graf--title`，建立 `DataTransfer` 寫入 `text/plain` 標題並派發 `new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })`，等待約 2.5 秒。
   2. **內文注入**：選取 `.postArticle-content` 下第一個 `.graf--p`，建立 `DataTransfer` 同時寫入 `text/html`（`pasteHtml`）與 `text/plain` 純文字備援，對 `.postArticle-content` 派發 `ClipboardEvent('paste')`（`dispatched: false` 代表 draft-js 已攔截消化事件，URL 會自動升為 `https://medium.com/p/<id>/edit`），等待約 3.5 秒供草稿自動存檔。
   3. **逐塊完整比對（不可省略）**：在瀏覽器內用 `DOMParser` 解析 `pasteHtml` 展開頂層區塊（`UL`/`OL` 展開為各 `li`）的正規化文字陣列，與 `.postArticle-content` 下所有非 `.graf--title` 的 `.graf` 文字逐塊比對，同時檢查 `.graf--title` 文字、連結數與是否出現 `"Something is wrong"` 錯誤紅條。若尾段被 draft-js 壓縮合併（45+ 塊長文偶發），提取尾段 HTML 選取最後一個錯合 `.graf` 補貼修復，再重跑逐塊比對。
   怎樣算做完：URL 已變成 `/p/<id>/edit`、標題完全一致、`mismatchCount === 0`、外連數吻合且 `errorBanner === false`。完成後接 Step 7。
7. **佔位符重建**：
   - 無 `⟦CODE-BLOCK-N⟧` 與 `⟦TABLE-N⟧` 佔位符時，直接跳接 Step 8。
   - 純文字 code 不需語法高亮時，可在 `paste.html` 先把 `⟦CODE-BLOCK-N⟧` 換成 `<pre>...</pre>` 一起貼（Medium 會轉成原生 `graf--preV2`）。需語法高亮或含表格改寫稿時，用 JS `Range.selectNodeContents` 選取目標佔位符段落並以 `ClipboardEvent('paste')` 或原生區塊替換，全部換完後重跑全文比對確認 0 個 `⟦` 殘留且結尾完整。怎樣算做完：佔位符殘留數為 `0` 且全文末段吻合。完成後接 Step 8。
8. **canonical 硬閘（發布前必做）**：
   - 用 `await tab.goto("https://medium.com/p/<id>/settings")` 進入該草稿設定頁，等待載入後用 `cdp.send("Runtime.evaluate", ...)` 點擊 `#advanced_settings button` 展開預設收合的 **Advanced Settings** 區段。
   - 勾選 `#advanced_settings input[type="checkbox"]`（「This story was originally published elsewhere」）。
   - 檢查區塊內是否出現「Edit canonical link」按鈕（新草稿首次勾選與舊文補設常預設 `disabled`，需先 `.click()` 該按鈕才會進入可編輯態）→ 對 canonical URL `input` 用 React native input setter（`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(canonInput, canonicalURL)`＋派發 `input` 與 `change` 事件）寫入原站 `canonicalURL` → 點擊「Save canonical link」。
   - 等待 2 秒後回讀該 `input.value` 與 `input.disabled`，確認值精確等於原站 `canonicalURL` 且已鎖定儲存；不符就停在這裡排查，不進 Step 9。怎樣算做完：`canonValue === canonicalURL` 且已儲存成功。完成後接 Step 9。
9. **topics 與發布（代發）**：
   - `await tab.goto("https://medium.com/p/<id>/edit")` 回到編輯器 → 點擊右上 `Publish` 按鈕開啟發布設定對話框。
   - 依 prep 的 `tags` 對應填入最多 5 個 topics（聚焦 `input[placeholder*="topic" i]` → `cdp.send("Input.insertText", { text: topic })` → 等約 1.4 秒點選相符下拉建議項或派發 `Enter` 鍵建立 chip，逐個確認後再填下一個，避免黏成一串）。
   - 點擊對話框內的最終 `Publish` 按鈕送出（使用者已授權，2026-06-13），等待約 7 秒跳轉至公開文章頁。怎樣算做完：頁面跳轉至公開文章 URL 且取得 `article:published_time`。完成後接 Step 10。
10. **發布後 driver-side 驗證與 LCU 收尾**：
    - Medium 對外部 `curl` 一律回 403，因此直接在已跳轉的公開文章頁透過 `cdp.send("Runtime.evaluate", ...)` 讀取 `document.querySelector('link[rel="canonical"]')?.href` 與 `location.href`（去掉 `?postPublishedType=initial` 查詢參數即乾淨公開 URL），確認 `canonical` 精確指回原站 `canonicalURL`。
    - **LCU 收尾硬規則**：如果同一輪緊接著還要用同一個 `tab` 跑方格子轉發，就保留 `tab` 續跑並在雙平台都驗完後才送收尾；如果瀏覽器操作到此全部結束，**下一個工具呼叫必須單獨呼叫 `mcp__lcu__js` 並只傳 `completion_summary`**（2–4 個英文字、過去式動詞開頭，如 `"Published Medium story"`，不帶 `code`），送完才可呼叫本地檔案工具進入 Step 11。怎樣算做完：`link[rel="canonical"]` 已確認指回原站，且（若瀏覽器任務結束）已送出單獨的 `completion_summary`。完成後接 Step 11。
11. **轉發紀錄落檔**（副作用步驟，不可略過）：append 到 `docs/philip/syndication-log.md` 的 `## Medium` 段（含 `publishedAt` ISO 時間以供 24 小時兩篇上限對帳）：

    ```
    - YYYY-MM-DD | <slug> | <Medium URL> | publishedAt=<ISO+08:00>｜canonical=ok（driver-side 精確指回 <canonicalURL>）｜title=<標題>｜content=<區塊統計>｜逐塊比對=<N>/<N>（mismatchCount=0）｜topics=<topics>
    ```

    寫完用 `command grep "| <slug> |" docs/philip/syndication-log.md` 回讀確認該行存在。**該 slug 若在 `docs/philip/medium-publish-queue.md` 有條目，同時把它標成已發布（或移除）**——留在佇列裡會讓下次 Step 1 誤判成「草稿待發布」而跳過 Step 2–7。怎樣算做完：`syndication-log.md` 回讀命中新紀錄、佇列檔無殘留待發條目，並向使用者回報公開 URL、canonical 比對結果與逐塊驗證結果。流程結束。

## 踩過的坑（撞反例就補一行）

- **不加常駐 `skill-verify-auditor`**：本流程的正確性由瀏覽器內逐塊字串比對（`mismatchCount === 0`）、driver-side `link[rel="canonical"]` 實讀與 `syndication-log.md` 回讀決定性把關，派唯讀文字審稿員無法重讀 Medium 受保護 DOM。
- **Medium API / integration token 2025 起停發**，所有走 API 的第三方跨發布工具 Medium 段全廢——不要再評估 API 自動化路線。
- **Import a story 會 backdate**：匯入自動把發布日期改成原文日期，Medium 端分發吃虧，預設不走 import。
- **Medium 編輯器不支援表格**：表格在 Step 4 先改寫成條列並經使用者拍板，貼上後才處理很難救。
- **Medium 對外部 `curl` 一律回 403**：發布後的 `canonical` 驗證必須在已渲染的瀏覽器頁透過 CDP 讀 `document.querySelector('link[rel="canonical"]').href`，不能靠終端機 `curl`。
- **Medium 每帳號每 24 小時最多發布/排程 2 篇**（紅條原文 `maximum of two stories in the past 24 hours`）：批次轉發按 2 篇/日排程；量大時可走**批次草稿模式**（建草稿無 24h 限制，只做 Step 5–7 備好標題與內文並記 `docs/philip/medium-publish-queue.md`，發布日再跑 Step 8–11）。
- **「Something is wrong and we cannot save」紅條出現就停手重載**：出現紅條後的所有編輯都存不進伺服器；注意 `execCommand('insertHTML')` 會觸發此紅條並洗掉標籤，內文一律走 `ClipboardEvent('paste', { clipboardData: DataTransfer })`。
- **禁止模型手貼長字串或 base64 進評估腳本**：模型複述數千字元 base64 必然單字漂移（實測「就」變「面」）；在 `cua_repl` 直接 `fs.readFileSync("<outDir>/paste.html", "utf8")` 變數傳遞，或讓瀏覽器跨源 `fetch` 原站（GitHub Pages 具 `access-control-allow-origin: *`），並強制執行逐塊比對（`dispatched: false` 只代表事件被消化，不保證尾段未被壓縮）。
- **draft-js 一次貼入 45+ 塊長文時偶發尾段壓縮**：前段完全吻合但最後 4–5 塊被合成單一塊時，提取尾段 HTML 對最後一個 `.graf` 用 `Range.selectNodeContents` 選取後補派一次 `ClipboardEvent('paste')` 並清除錯合殘塊，再重驗 `mismatchCount === 0`。
- **Advanced Settings 預設收合且 canonical 欄位常預設 `disabled`**：`/p/<id>/settings` 裡的 `#advanced_settings` 未點擊展開前 DOM 內無子節點；勾選 checkbox 後無論新舊草稿都先檢查有無「Edit canonical link」按鈕（有就先點開），再用 React native input setter 寫值並點「Save canonical link」。
- **LCU 協定三個硬邊界**：首次呼叫只能單獨一行 `cua.createBrowserTab(...)`、首次使用 `tab.capabilities.get("cdp")` 前須先讀 `agent.documentation.get("capabilities/tab/cdp")`、瀏覽器階段一結束切回本地工具前須單獨送一發只含 `completion_summary` 的 `mcp__lcu__js`（未登入交棒則先 `await tab.markHandoff()`）。
