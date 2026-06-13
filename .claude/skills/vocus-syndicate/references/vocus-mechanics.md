# 方格子（vocus）機制細節

> 2026-06-13 用 check-my-stack 親測逆向（claude-in-chrome 側錄 + curl 驗證）。SKILL.md 走瀏覽器路線就夠，這份是給「要走 API 路線」「碰到編輯器細節」「選分類」時 drill。

## 目錄
- [內部發文 API 配方（未來 API 路線用）](#內部發文-api-配方未來-api-路線用)
- [編輯器機制（Lexical）](#編輯器機制lexical)
- [發佈精靈三步細節](#發佈精靈三步細節)
- [分類完整清單（31 類）](#分類完整清單31-類)
- [canonical 實測 FAIL 細節](#canonical-實測-fail-細節)

## 內部發文 API 配方（未來 API 路線用）

方格子是 Next.js SPA，前端打 `https://api.vocus.cc/api/*`。**官方零公開 API/文件**，以下是側錄真實登入帳號發文流程逆向出來的（無官方背書、改版即可能壞）。

- **Auth**：`Authorization: Bearer <JWT>` + `credentials: "omit"`（**純 token、不靠 cookie**）。token = 登入後 localStorage 的 `id_token`（HS256 JWT，payload 含 fullname / loginID / level / `exp`）。**有過期時間**，過期要重新登入刷新（Google/Firebase 登入流程產生）。
- **發佈是一串序列、不是單支**（皆帶 Bearer + credentials omit）：
  1. 建文章：在 creatordesk 點「文章」即自動建 article 並配 `{id}`（前端動作；對應後端建立）。
  2. `PATCH /api/articles/{id}/draft` — 存內容。body：`{title, lexicalObj, articleId, draftType:"desktop", commandLogs:"[]", createdAt}`。**`lexicalObj` 是 stringified Lexical JSON**（Meta Lexical 編輯器的 node tree），不是 HTML 也不是 Markdown——走 API 路線要先把文章轉成 Lexical node 結構，這是最大成本。
  3. `PATCH /api/articles/{id}` — 更新 metadata（標題/分類/摘要/整合網址等）。
  4. `PATCH /api/articles/{id}/mentions` — body `{mentionArticleIds, mentionUserIds}`。
  5. **`PATCH /api/articles/{id}/status/2`** — body `{status}`。**這支才是「發佈」狀態變更**（status=2=公開）。
- **讀取 API（公開、無需 auth）**：`GET /api/article/{id}`、`/api/articles`、`/api/top5-contents`、`/api/search`。RSSHub 即靠 `/api/article/{id}` 抓 RSS。注意讀取 API **不回傳 canonical/整合網址欄位**。
- **為何仍走瀏覽器**：Lexical 轉換 + token 過期刷新 + 五支序列 + 無文件易壞，對手動量級 ROI 不划算。瀏覽器代發（編輯器自己把 HTML 轉 Lexical）省掉轉換成本。

## 編輯器機制（Lexical）

- 入口：右上「創作」→ creatordesk →「文章」（完整編輯，URL `vocus.cc/new-editor/{id}`）；「貼文」是輕量短文不走本流程。
- **自動儲存**：打字即 debounce 存稿（`PATCH .../draft`），左上顯示「HH:MM 已自動儲存」。
- **貼上**：標題區點一下用 `type`；內文點一下 `cmd+v` 貼 clipboard HTML。Lexical 吃 HTML 貼上會轉成對應 node——實測 `<a>` href、`<h2>` 標題層級、段落都正確保留（check-my-stack 11 外連零損）。
- 工具列（內文上方）：目錄 / + / Tt（字級）/ 引言 / 程式碼 / 對齊 / 清單 / 編號 / @ / undo-redo / 深色。**code/table 保真度尚未實測**——含這些的文章貼上後逐塊目視，必要時用工具列的「程式碼」鈕重建。

## 發佈精靈三步細節

點右上「準備發佈」（已發佈過顯示「調整發佈設定」），URL `vocus.cc/publish-v2/{id}`：

1. **基本設定**：標題（帶入）、**分類**（必填，紅星，下拉選）、摘要（系統自動從內文擷取，上限 150 字，可改可留）、縮圖（預設 vocus 品牌圖，可選「文章內沒有圖片」/「不使用縮圖」/自行上傳）。
2. **進階設定**：上/下篇、允許自動目錄（預設勾）、內含成人內容、標記 AI 輔助、內含投資理財、**啟用整合網址 Beta**（canonical，見下）、個人化網頁標題 Beta、社群分享圖片顯示。
3. **權限和狀態**：內容收費（免費公開 / 付費限定）、內容分類（沙龍/房間）、發佈狀態（**公開發佈** / 私密發佈〔僅取得連結可見〕）。底部「確認發佈」。

## 分類完整清單（31 類）

政治與評論、Web3、國際、電影戲劇、投資理財、職場、閱讀書評、創作、ACG 動漫遊戲、文化生活、圖文插畫、旅行美食、音樂藝文、寵物、親子與教育、學習、色格子、運動、設計、美妝保養、BL、小說、百合、健康、商業、**軟體開發**、情感、自我成長、神秘力量、**科技**、烹飪。

→ AI / 工具 / Claude Code / 技術評估類文章選「**軟體開發**」最貼切，泛科技選「科技」。沒有「AI」專屬分類。

## canonical 實測 FAIL 細節

- UI：進階設定 →「啟用整合網址 Beta」勾選框 + URL 欄。官方文案「系統已預設以方格子為主要網址。如果你希望改為另一個主要網址，請在下方輸入該網址」。
- Beta 說明（__NEXT_DATA__ 內）：「此功能即將轉為付費，僅於 Beta 期間開放免費試用」——目前免費。
- **實測結果（2026-06-13，check-my-stack）**：勾選＋填 `https://gggodlin.github.io/blog/check-my-stack/`，編輯器重開設定仍在（存得住），但發佈後：
  - `curl` server HTML → `<link rel="canonical" href="https://vocus.cc/article/{id}"/>`（指 vocus 自己）
  - Googlebot UA curl → 同上
  - 重新發佈一次 → 同上
  - `GET api.vocus.cc/api/article/{id}` → 無 canonical/整合網址欄位
- **結論**：vocus「整合網址」Beta 不會改 server 端 `<link rel=canonical>`（可能走延遲/out-of-band 機制未及驗，但即時服務的 canonical 訊號就是錯的）。全文轉 vocus = 有「高權重 vocus 蓋過原站 github.io 排名」的真實 SEO 風險。使用者 2026-06-13 知情後選擇全文照轉（觸及 > 排名）；canonical 照填當 future-proof。
