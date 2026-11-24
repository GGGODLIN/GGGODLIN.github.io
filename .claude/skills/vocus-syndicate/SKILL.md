---
name: vocus-syndicate
description: 把 gggodlin-blog 已在原站上線的文章「全文轉發」到方格子（vocus，vocus.cc）的瀏覽器代發流程。Trigger：「轉發到方格子」「同步到 vocus」「把這篇或某 slug 發到方格子」「cross-post to vocus」，或 /vocus-syndicate 帶 slug。Do not use for：轉發到 Medium（走 medium-syndicate）、分享層貼文（LinkedIn / Threads / FB 只貼摘要＋連結）、文章尚未在原站發布（先走正常發布流程）、修改已轉發的 vocus 文章。
---

# 方格子（vocus）轉發標準流程

## 為什麼流程長這樣（讀完再動）

- **方格子沒有可用的程式化發文路徑**（2026-06-13 查證 FC-064/065）：官方零公開 API、零開發者文件；內部 `PATCH api.vocus.cc/api/articles/{id}/status/2` 才是真正的「發佈」呼叫，但要 Bearer JWT（localStorage `id_token`，會過期）＋內容得轉成 **Lexical JSON**（非 HTML/MD）＋整串序列（建文章→存稿→改 metadata→mentions→改狀態），對手動量 ROI 不划算。所以走「本地準備 + LCU MCP（`mcp__lcu__js`）操作使用者已登入的日常 Chrome 代發」。如果要重建程式碼與表格區塊、查完整 31 個分類清單或評估內部 API 序列，就在執行對應步驟前讀 [references/vocus-mechanics.md](references/vocus-mechanics.md)。
- **prep 階段直接複用 medium-syndicate 的腳本**——`medium-prep.mjs` / `medium-paste-html.mjs` / `clipboard-html.sh` 都是平台無關的（產 title/desc/tags/canonical/HTML），名字有 `medium-` 前綴只是它們先寫在那個 skill 底下，功能與平台無關，vocus 直接呼叫同一份不複製，避免兩份漂移。
- **「啟用整合網址」Beta 照填並依實測結果誠實記錄**：早期（2026-06 FC-065）勾選並填入原站 URL 後，公開頁 server HTML 的 `<link rel="canonical">` 仍自指 `vocus.cc`；近期（2026-10 起多篇實測）方格子 SSR 已正常輸出 `<link rel="canonical" href="<原站 URL>" data-next-head=""/>` 精確指回原站。由於該功能仍標 Beta，Step 8.2 固定勾選並填入原站 URL，Step 10 用 `curl -s` 實測回讀：指回原站就記 `canonical=ok`，若偶發退回自指則如實記 `canonical=vocus-self`、不因此卡死收尾。
- **LCU 單分頁＋CDP 事件注入比系統剪貼簿穩**：依 context 裡已有的瀏覽器路由規範，只操作自建分頁，不呼叫 `cua.getState()` 傾印全機分頁、不呼叫 `tab.playwright.evaluate`／`tab.evaluate`（本機政策禁止）。Lexical 編輯器的 paste handler 不檢查 `event.isTrusted`，在 `cua_repl` 內直接 `fs.readFileSync` 讀 `<outDir>/paste.html` 並派發 `ClipboardEvent('paste', { clipboardData: DataTransfer })` 即可完整保留標題層級、清單與外連，免搶系統剪貼簿。

## 流程

slug = `src/content/blog/` 下的檔名（不含 .md）；`posts/` 是寫作草稿區，與本流程無關。使用者給的名字對不上時 `ls src/content/blog/` 對照確認，不要猜。

1. **防重複**：`command grep "| <slug> |" docs/philip/syndication-log.md`（完整欄位格式，避免前綴重疊誤命中；檔案不存在視為無紀錄）。`## 方格子（vocus）` 段下已有該 slug → 停，回報既有 vocus URL，結束。無紀錄 → 接 Step 2。怎樣算做完：確認 `## 方格子（vocus）` 段無該 slug 紀錄。
2. **跑 prep script**（repo root）：`node .claude/skills/medium-syndicate/scripts/medium-prep.mjs <slug>`，讀 JSON 輸出（title / description / tags / canonicalURL / outDir / risks）。outDir 在 `/tmp`，隔夜可能被清，後續步驟要用時不在就重跑本步（若同輪剛跑過 Medium 轉發且 `<outDir>/paste.html` 已存在可直接沿用）。怎樣算做完：取得完整 JSON 欄位與 `outDir`。完成後接 Step 3。
3. **原站上線確認**：對 prep 輸出的 `canonicalURL` 跑 `curl -sI` 確認 HTTP 200，再 `curl -s | command grep 'rel="canonical"'` 確認自我 canonical 存在。任一失敗 → 停（文章沒上線，先走發布流程），結束。怎樣算做完：HTTP 200 且自我 canonical 存在。通過後接 Step 4。
4. **風險處理與產出貼上檔（開瀏覽器前先做完）**：
   - `risks.tableLines > 0` 或 `risks.codeBlocks` 非空 → 先列出哪幾塊將在 Step 7 重建與核對；`risks.externalLinks` 僅供對帳參考。
   - 若 `<outDir>/paste.html` 尚未產生，跑 `node .claude/skills/medium-syndicate/scripts/medium-paste-html.mjs <slug>` 產出 `<outDir>/paste.html`（剝 header/footer/H1、把站內相對連結轉絕對並回報 `relativeLinksAbsolutised`、程式碼與表格換成 `⟦CODE-BLOCK-N⟧` / `⟦TABLE-N⟧` 佔位符）。
   怎樣算做完：`<outDir>/paste.html` 已存在且非空。完成後接 Step 5。
5. **開瀏覽器＋進編輯器（LCU 入口）**：
   - 若同回合剛跑完 Medium 轉發且自建 `tab` 仍在，直接複用同一個分頁呼叫 `await tab.goto("https://vocus.cc/")`（單分頁紀律避免累積編輯器分頁）。若本回合尚未初始化 `cua_repl`，第一發 `mcp__lcu__js` 呼叫只能單獨執行一行入口（不可夾帶其他呼叫、等待或讀檔）：
     ```js
     let tab = await cua.createBrowserTab("chrome", "https://vocus.cc/", { sessionName: "📝 Vocus Syndicate" });
     ```
     不呼叫 `cua.getState()`，不碰使用者既有無關分頁；若 LCU 未載入、未連線或遭拒絕授權，立即停下回報阻塞，不自行改切 `claude-in-chrome`、`chrome-devtools` 或其他工具。
   - 檢查登入與手機驗證狀態：
     - **未登入**（右上出現「註冊/登入」而非使用者頭像與右上「創作」按鈕）或點擊右上「創作」後跳出 **「請完成手機驗證」彈窗** → 先呼叫 `await tab.markHandoff()`（保留該分頁跨回合不被自動關閉），再送出 `mcp__lcu__js({ completion_summary: "Requested Vocus verification" })` 後停下，請使用者手動完成登入或手機簡訊驗證後說「好了」再續做（不代填帳密或驗證碼）。
   - 已登入 → 若尚未讀過 `cdp` 文件，先呼叫 `nodeRepl.write(await agent.documentation.get("capabilities/tab/cdp"));`，再取 `let cdpVocus = await tab.capabilities.get("cdp")`（跨網域導航後重新取得 `cdp` handle）。點擊頂欄右上角的「創作」`button`（注意區分頁尾或導覽列連往 `/composition` 主題頁的 `<a>` 連結；從冷狀態直接 `goto("https://vocus.cc/creatordesk")` 常被導回首頁，點右上「創作」按鈕才會進 `vocus.cc/creatordesk` 面板）→ 找文字含「文章」與「完整的編輯功能」的卡片連點兩下（第一下只進 hover 態、第二下才導航）→ 等待約 4.5 秒確認 URL 變為 `vocus.cc/new-editor/{id}`。怎樣算做完：URL 已進入 `vocus.cc/new-editor/{id}` 且標題與內文編輯區皆已渲染。完成後接 Step 6。
6. **內容注入與逐塊比對（Playwright `locator.fill`＋CDP `ClipboardEvent`）**：
   1. **標題注入（走 Playwright `locator.fill` 並等自動儲存）**：以 `await tab.playwright.locator('textarea[placeholder="請輸入文章名稱"]').fill(TITLE)` 輸入標題（LCU MCP 拒絕 raw CDP 的 `Input.insertText`；單純用 React setter 改 `textarea.value` 不會觸發標題自動存檔，進發佈精靈時標題會變空），並等待約 3.5 秒讓方格子觸發自動儲存。確認 `document.title` 已更新為文章標題。
   2. **內文注入**：在 `cua_repl` 用 `fs.readFileSync("<outDir>/paste.html", "utf8")` 讀取 HTML（不手貼長 base64），在 `Runtime.evaluate` 聚焦 `.ContentEditable__root`、將選取範圍收合至首節點開頭，建立 `DataTransfer` 寫入 `text/html` 與 `text/plain` 後對 `.ContentEditable__root` 派發 `new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true })`（`dispatched: false` 代表 Lexical 已消化事件），等待約 5 秒讓 Lexical 完成解析與自動儲存（頂欄出現「已自動儲存」）。
   3. **逐塊完整比對（不可省略）**：在 `Runtime.evaluate` 用 `DOMParser` 解析 `pasteHtml` 取全部 `p, h2, li` 正規化文字陣列，與 `.ContentEditable__root` 內全部 `p, h2, li` 逐項比對，同時核對 `a[href]` 連結數（確認無殘留相對路徑被解析成 `vocus.cc/blog/...`）與無殘留未預期佔位符。
   怎樣算做完：`titleVal === TITLE`、頂欄顯示已自動儲存、`mismatchCount === 0` 且外連數完全吻合。完成後接 Step 7。
7. **佔位符重建**（若 Step 4 有 code/table）：逐塊比照 [references/vocus-mechanics.md](references/vocus-mechanics.md) 重建程式碼或表格區塊並重驗無 `⟦` 殘留；無 code/table 直接接 Step 8。怎樣算做完：0 個 `⟦` 佔位符殘留。
8. **進發佈設定三步精靈**：點擊右上「準備發佈」（已發佈過的文章顯示為「調整發佈設定」）進 `vocus.cc/publish-v2/{id}`：
   1. **基本設定**：文章無圖時點擊 `#coverSource-clear`（或對應「不使用縮圖」label）避免預設底圖，點完用 `Runtime.evaluate` 讀回 `#coverSource-clear` 的 `checked` 記為 `coverCleared`（讀不到記 `unknown`），Step 11 依它填縮圖欄；對分類 combobox 外層控制容器依序派發 `mousedown` → `mouseup` → `click` 展開選單，找到文字為「軟體開發」（或「科技」）的葉節點 `scrollIntoView({ block: 'center' })` 並 `.click()`；點「下一步」。
   2. **進階設定**：勾選 `#openCanonical`（或 `label[for="openCanonical"]`，「啟用整合網址」Beta）→ 對顯示出來的網址 `input` 用 React native input setter（`Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(inp, canonicalURL)`＋派發 `input` 與 `change` 事件）寫入原站 `canonicalURL` → 點「下一步」。
   3. **權限和狀態**：內容收費維持「免費公開」；勾選 `#publishMethod-public`（或 `label[for="publishMethod-public"]`，「公開發佈」）。怎樣算做完：`pubChecked === true` 且底部按鈕變為「確認發佈」。完成後接 Step 9。
9. **發佈與公開頁確認（代發）**：
   - 點擊「確認發佈」（選了「公開發佈」後按鈕文字會從「確認」變成「確認發佈」；使用者已授權代發，2026-06-13），等待約 8–10 秒（「發佈中 ...」完成後編輯器會出現指往 `/article/{id}` 的「前往內容頁」連結）。
   - 用 `await tab.goto("https://vocus.cc/article/<id>")` 開啟公開文章頁，呼叫 `await tab.markDeliverable()` 保留成品分頁供使用者檢視，並透過 `Runtime.evaluate` 確認 `__NEXT_DATA__` 文章 `status === 2`（公開發佈）與頁面 `link[rel="canonical"]`。
   - **LCU 收尾硬規則**：確認瀏覽器部分已全部完成後，**下一個工具呼叫必須單獨呼叫 `mcp__lcu__js` 並只傳 `completion_summary`**（2–4 個英文字、過去式動詞開頭，如 `"Published Vocus article"` 或雙平台同輪收尾 `"Published Medium and Vocus"`，不帶 `code`），送完才可呼叫 `Bash` 或檔案工具進入 Step 10。怎樣算做完：公開頁 `status === 2`、已呼叫 `tab.markDeliverable()`，且已送出單獨的 `completion_summary`。完成後接 Step 10。
10. **發佈後伺服器端驗證**：在終端機跑 `curl -sI "<vocus URL>"` 確認 HTTP 200，並跑 `curl -s "<vocus URL>" | command grep -o '<link[^>]*rel="canonical"[^>]*>'` 實測 server HTML 的 `canonical` 值：
    - 若 `href` 精確等於原站 `canonicalURL` → 判定為 `canonical=ok`。
    - 若 `href` 指回 `vocus.cc` 自身 → 判定為 `canonical=vocus-self`（屬整合網址 Beta 已知波動，不需停下排查）。
    怎樣算做完：拿到 HTTP 200 與明確的 server HTML `canonical` 實測判定。完成後接 Step 11。
11. **轉發紀錄落檔**（副作用步驟，不可略過）：依 Step 10 實測結果 append 到 `docs/philip/syndication-log.md` 的 `## 方格子（vocus）` 段（段不存在先建）：

    ```
    - YYYY-MM-DD | <slug> | <vocus URL> | canonical=<ok（公開 DOM 與 server HTML 精確指回原站） 或 vocus-self（整合網址 Beta 已填原站，公開頁仍自指）>｜title=<標題>｜content=<區塊統計>｜逐塊比對=<N>/<N>（mismatchCount=0）｜分類=軟體開發｜免費公開／公開發佈｜縮圖=<依 Step 8.1 的 coverCleared：true 寫「不使用縮圖」、false 寫讀到的實際設定、unknown 寫「未驗」>｜server HTML=200
    ```

    寫完用 `command grep "| <slug> |" docs/philip/syndication-log.md` 回讀確認該行存在 → 給使用者驗收回報：vocus 文章 URL、內容保真度（區塊比對/外連/佔位符）、server HTML canonical 實測結果。怎樣算做完：回讀命中新紀錄並完成驗收回報。流程結束。

## 踩過的坑（撞反例就補一行）

- **不加常駐 `skill-verify-auditor`**：本流程由編輯器葉節點逐塊比對（`mismatchCount === 0`）、`__NEXT_DATA__` `status === 2`、`curl` HTTP 200／canonical 實測與 `syndication-log.md` 回讀決定性把關，無需額外派文字審稿員。
- **方格子沒有可用的 agent 發文 API**（FC-064/065）：內部 `POST/PATCH /api/articles*` 需 Bearer JWT＋Lexical JSON＋多支序列呼叫，對單篇或小批轉發 ROI 不划算；細節留 [references/vocus-mechanics.md](references/vocus-mechanics.md) 備查。
- **發文前置＝帳號級手機簡訊驗證**：未驗證帳號點「創作」會跳「請完成手機驗證」，驗證碼只進使用者手機；先 `await tab.markHandoff()`＋送 `completion_summary` 後交給使用者本人完成，不代填。
- **冷導航直連 `/creatordesk` 常被導回首頁，且頁內有兩個「創作」**：導覽／主題區的 `<a href="/composition">創作</a>` 是主題分類頁；必須點擊頂欄右上角的「創作」`button` 才會開啟創作者後台面板，且「文章」卡片要連點兩下才導航進 `new-editor`。
- **標題只走 React setter 不會觸發自動儲存**：`new-editor` 標題 `textarea` 若只用 `HTMLTextAreaElement.prototype.value` setter 寫值，進 `publish-v2` 精靈時標題會變空白並跳「請輸入標題」警告；改用 `tab.playwright.locator('textarea[placeholder="請輸入文章名稱"]').fill(TITLE)`（LCU MCP 不支援 raw CDP `Input.insertText`）並等 3.5 秒讓草稿自動儲存即可一次到位。
- **分類 combobox 不吃單純 `.click()`**：React Select 監聽 `mousedown`＋`mouseup`，需對控制容器依序派發 `mousedown` → `mouseup` → `click` 才會展開選項清單。
- **選「公開發佈」後確認鈕會改名**：底部按鈕文字會從「確認」變成「確認發佈」，精確匹配時須優先找「確認發佈」，按完等約 8–10 秒讓伺服器完成狀態轉換。
- **相對內部連結會被 Lexical 解析成 `vocus.cc/blog/...`**：`medium-paste-html.mjs` 已在產檔階段將站內相對連結轉為原站絕對連結；貼上後核對 `a[href]` 清單確認無誤即可。
- **禁止模型手貼長 base64，且逐塊比對不可省**：長 base64 經模型複述會單字漂移；在 `cua_repl` 直接 `fs.readFileSync("<outDir>/paste.html", "utf8")` 注入，並逐塊核對 `p, h2, li` 文字完全一致。
- **LCU 協定三個硬邊界**：首次初始化 `cua_repl` 只能單獨一行 `cua.createBrowserTab(...)`、跨網域進 `vocus.cc` 後重新取 `tab.capabilities.get("cdp")`（首次使用前先讀 `agent.documentation.get("capabilities/tab/cdp")`）、瀏覽器階段結束切回終端機與檔案工具前必須單獨送一發只含 `completion_summary` 的 `mcp__lcu__js`。
