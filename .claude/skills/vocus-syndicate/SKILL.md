---
name: vocus-syndicate
description: 把 gggodlin-blog 已在原站上線的文章「全文轉發」到方格子（vocus，vocus.cc）的 claude-in-chrome 代發流程。Trigger：「轉發到方格子」「同步到 vocus」「把這篇或某 slug 發到方格子」「cross-post to vocus」，或 /vocus-syndicate 帶 slug。Do not use for：轉發到 Medium（走 medium-syndicate）、分享層貼文（LinkedIn / Threads / FB 只貼摘要＋連結）、文章尚未在原站發布（先走正常發布流程）、修改已轉發的 vocus 文章。
---

# 方格子（vocus）轉發標準流程

## 為什麼流程長這樣（讀完再動）

- **方格子沒有可用的程式化發文路徑**（2026-06-13 查證 FC-064/065）：官方零公開 API、零開發者文件；內部 `PATCH api.vocus.cc/api/articles/{id}/status/2` 才是真正的「發佈」呼叫，但要 Bearer JWT（localStorage `id_token`，會過期）＋內容得轉成 **Lexical JSON**（非 HTML/MD）＋整串序列（建文章→存稿→改 metadata→mentions→改狀態），對手動量 ROI 不划算。所以走「本地準備 + claude-in-chrome 操作真實瀏覽器代發」。API 配方細節留在 [references/vocus-mechanics.md](references/vocus-mechanics.md)（哪天要走 API 路線再讀）。
- **prep 階段直接複用 medium-syndicate 的腳本**——`medium-prep.mjs` / `medium-paste-html.mjs` / `clipboard-html.sh` 都是平台無關的（產 title/desc/tags/canonical/HTML、載剪貼簿），名字有 `medium-` 前綴只是它們先寫在那個 skill 底下，功能與平台無關，vocus 直接呼叫同一份不複製，避免兩份漂移。
- **canonical 在 vocus 實測是壞的，但仍照填**（FC-065）：「啟用整合網址」Beta 勾選＋填原站 URL，編輯器設定存得住，**但發佈後 server HTML 的 `<link rel=canonical>` 仍指 vocus 自己、沒指原站**（normal UA / Googlebot UA / 重新發佈三測皆同）。使用者 2026-06-13 知悉「SEO 可能被高權重 vocus 蓋過原站排名」後仍選擇全文照轉（觸及 > 排名顧慮）。所以 canonical 這步是「填了 future-proof，若 vocus 哪天修好 Beta 已設的文章受惠」，**不是硬閘、別當它會生效、別為它沒生效停下排查**。此前提建立在原站 github.io 低權重上，若日後買自訂網域養起權重應重新評估是否續轉全文。
- **編輯器是 Lexical（Meta 框架），吃 clipboard HTML 貼上良好**：clipboard-html.sh 載 HTML + cmd+v，外連 href、標題層級都保留（check-my-stack 11 外連零損實證）。含程式碼/表格的文章保真度尚未實測，見「踩過的坑」。

## 流程

slug = `src/content/blog/` 下的檔名（不含 .md）；`posts/` 是寫作草稿區，與本流程無關。使用者給的名字對不上時 `ls src/content/blog/` 對照確認，不要猜。

1. **防重複**：`grep "| <slug> |" docs/philip/syndication-log.md`（完整欄位格式，避免前綴重疊誤命中；檔案不存在視為無紀錄）。`## 方格子（vocus）` 段下已有該 slug → 停，回報既有 vocus URL，結束。無紀錄 → 接 Step 2。
2. **跑 prep script**（repo root）：`node .claude/skills/medium-syndicate/scripts/medium-prep.mjs <slug>`，讀 JSON 輸出（title / description / tags / canonicalURL / outDir / risks）。outDir 在 /tmp，隔夜可能被清，Step 6 要用時不在就重跑本步。接 Step 3。
3. **原站上線確認**：對 prep 輸出的 `canonicalURL` 跑 `curl -sI` 確認 200，再 `curl -s | grep 'rel="canonical"'` 確認自我 canonical 存在。任一失敗 → 停（文章沒上線，先走發布流程），結束。通過 → 接 Step 4。
4. **風險處理（開瀏覽器前在對話裡先做完）**：`risks.tableLines > 0` 或 `risks.codeBlocks` 非空 → vocus 編輯器對表格/程式碼的保真度尚未實證（見踩過的坑），先列出哪幾塊、預告 Step 6 貼上後要逐塊目視驗證；表格比照 medium 先改寫成條列較保險。`risks.externalLinks` 僅供參考（貼渲染版自動保留連結）。處理完 → 接 Step 5。
5. **開瀏覽器 + 進編輯器**：`tabs_context_mcp` 看現況 → 新分頁開 `https://vocus.cc/`。
   - 未登入 → 停，請使用者登入後說「好了」再從本步重來（不代登入）。
   - 已登入 → 點右上「創作」。**若跳「請完成手機驗證」彈窗** → 停，請使用者自己完成手機簡訊驗證（帳號級一次性前置，驗證碼只進使用者手機、輸入它是使用者的帳號安全動作，不代填）；驗證後通常會落到 `vocus.cc/creatordesk`。
   - 在 creatordesk 選「**文章**」（完整編輯功能；不要選「貼文」）→ 自動建草稿、URL 變 `vocus.cc/new-editor/{id}`、編輯器出現 → 接 Step 6。
6. **內容注入（代發）**：
   1. 跑 `node .claude/skills/medium-syndicate/scripts/medium-paste-html.mjs <slug>` 產 `<outDir>/paste.html`（抓已發布頁、剝 header/footer/H1、程式碼與表格換 ⟦CODE-BLOCK-N⟧ / ⟦TABLE-N⟧ 佔位符）。
   2. **標題**：點標題區（placeholder「請輸入文章名稱」）→ `type` 貼上 prep 的 `title`（vocus 標題用 `type` 實測穩，不像 Medium 會吞英文段；打完看分頁標題已更新即確認）。
   3. **內文**：`bash .claude/skills/medium-syndicate/scripts/clipboard-html.sh <outDir>/paste.html`（輸出含 «class HTML»）→ 點內文區（placeholder「開始創作你的精彩內容」）→ `cmd+v`。
   4. JS 驗證：`document.querySelectorAll('a').length` 對上 paste.html 外連數、標題層級在、無殘留 ⟦⟧ 佔位符。明顯缺段重貼一次。完成 → 接 Step 7。
7. **佔位符重建**（若 Step 4 有 code/table）：逐塊比照 [references/vocus-mechanics.md](references/vocus-mechanics.md) 的編輯器工具列處理；無 code/table 直接接 Step 8。
8. **進發佈設定**：點右上「準備發佈」（已發佈過的文章顯示為「調整發佈設定」）→ 三步精靈：
   1. **基本設定**：標題已帶入；**分類**必填，AI/工具/技術文選「軟體開發」（或「科技」），完整分類清單見 references；摘要系統自動擷取（150 字內，可留 auto）。點「下一步」。
   2. **進階設定**：往下找「**啟用整合網址** Beta」→ 勾選 → 下方 URL 欄填 prep 的 `canonicalURL`（future-proof，見上「為什麼」段，不是硬閘）。點「下一步」。
   3. **權限和狀態**：內容收費＝「免費公開」（預設）；發佈狀態＝選「**公開發佈**」。接 Step 9。
9. **發佈（代發）**：點「確認發佈」（使用者已授權代發含按發佈，2026-06-13）→ 出現「發佈成功」→ 點「前往內容頁」→ `tabs_context_mcp` 取公開 URL（形如 `vocus.cc/article/{id}`）。接 Step 10。
10. **發佈後驗證**：`curl -s "<vocus URL>" | grep -o '<link[^>]*rel="canonical"[^>]*>'`（vocus 吃 curl，不像 Medium 會 403）。**預期 canonical=vocus 自己**（FC-065 已知，不是新失敗、不需排查）；只確認文章公開可取、內容完整即可。接 Step 11。
11. **轉發紀錄落檔**（副作用步驟，不可略過）：append 到 `docs/philip/syndication-log.md` 的 `## 方格子（vocus）` 段（段不存在先建）：

    ```
    - YYYY-MM-DD | <slug> | <vocus URL> | canonical=vocus-self（已知 Beta 不生效，全文照轉）
    ```

    寫完 grep 回讀確認該行存在 → 給使用者驗收回報：vocus 文章 URL、內容保真度（外連/標題/佔位符）、canonical 現況。流程結束。

## 踩過的坑（撞反例就補一行）

- **方格子沒有可用的 agent 發文 API**（FC-064/065）：官方零 API；內部 `POST/PATCH /api/articles*` 要 Bearer JWT（localStorage `id_token`，會過期）＋ Lexical JSON 內容 ＋ 多支序列呼叫。不要再評估「打一支 API 就發布」——它是序列、且 ROI 對手動量不划算。配方在 references 供未來參考。
- **canonical「啟用整合網址」Beta 實測不改 server tag**（FC-065，2026-06-13 親測）：勾選＋填原站、編輯器存得住，但發佈後 curl server HTML（含 Googlebot UA、含重新發佈）canonical 仍指 vocus 自己，讀取 API 也無此欄位。**照填但別期待它生效、別為它停下排查**。Step 10 看到 canonical=vocus-self 是預期值。
- **發文前置＝帳號級手機簡訊驗證**：未驗證帳號點「創作」會跳「請完成手機驗證」，驗證碼只進使用者手機。**不代填**——請使用者自己完成（一次性，完成後該帳號之後免再驗）。
- **vocus 標題用 `type` 實測穩**：不像 Medium 的 `type` 會吞混中英數標題的英文段，vocus 標題直接 `type` 即可（仍建議打完看分頁標題確認）。
- **分類是必填、且沒有「AI」專屬類**：最貼近 AI/工具/技術的是「軟體開發」或「科技」。完整 31 類清單見 references。
- **vocus 每日發文上限未驗證**：Medium 是 24h 兩篇，vocus 試發一篇沒撞到限制，但**批次量產時是否有上限尚未實證**——撞到再補這行。
- **瀏覽器 env session 級降級（沿用 medium-syndicate 實證）**：同 session 跑 ~4 篇後 CDP/輸入管道會壞，減載無法恢復，要 fresh CC session ＋ 完整重啟 Chrome 行程（cmd+Q）。**運維鐵則：每個 fresh session 只排一批 ~4 篇**，別同 session 連跑兩批。並行使用 Chrome（使用者同時操作）會搶焦點/蓋剪貼簿，代發開始前請使用者放著別動。
- **code/table 在 vocus Lexical 編輯器的保真度尚未實測**：check-my-stack 白老鼠無 code/table。含這些的文章貼上後務必目視驗證；Medium 的「`<pre>` 直接貼」捷徑在 vocus 是否成立未知，先逐塊驗。
- **「文章」卡片要點兩下才導航**（2026-06-13 實測）：creatordesk 的「文章」卡第一下只進 hover 態（標籤變「開始文章創作」）、第二下才跳 new-editor。這是正常 hover 機制不是降級。但若 **3 下以上都只 hover、URL 不變 new-editor，且 `find`→ref click 也不 fire ＝ session 級輸入降級**（見下條）。
- **單分頁紀律避免前景焦點洩漏**（2026-06-13 實測）：開多個編輯器分頁後，coordinate click 會洩漏到「別的分頁」（實測點 A 分頁、結果 B 分頁導航了），症狀像降級其實是焦點混亂。對策＝**每篇做完複用同一個分頁 `navigate` 回 creatordesk，別累積編輯器分頁**；雜散分頁先 `tabs_close_mcp` 關掉。清到單分頁後輸入即恢復——這跟下條真降級不同。
- **單分頁下仍會在 ~4 篇後 input 降級（不可逆，呼應 medium）**（2026-06-13 實測）：即使單分頁，做到第 4-5 篇時「文章」卡 click（coordinate 與 ref 兩種點法）都只 hover 不 fire navigation。這是 CDP/輸入管道 session 級降級，**減載/換點法都救不回**，要 fresh CC session ＋ 完整重啟 Chrome（cmd+Q）。**運維鐵則：一個 session 穩做 ~4 篇就主動收手**，別硬撞到降級才停。
