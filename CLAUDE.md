# gggodlin-blog 專案規則

> 這是個人技術部落格 + voice 蒸餾專案。產出物本質是**中文寫作**，所以「中文品質」是第一級正確性，不是風格偏好。

## 反晶晶體 = 硬性品質閘（HARD GATE）

正式定義在全域 `~/.claude/CLAUDE.md`「語言偏好 > 反晶晶體」，**不在此重複**。本專案把它升級成硬閘：

- 任何生成的 md（voice profile / 草稿 / 貼文 / 對照表）交付前**必過**反晶晶體：一句內三個以上「該翻沒翻」的英文詞 = 缺陷，重寫，不是風格意見
- 本專案產出是「分析中文寫作的中文文件」——文件自身有晶晶體 = 自我矛盾的嚴重 bug，比一般專案嚴重十倍
- **每一個 dispatch 出去的 subagent prompt 必須把全域反晶晶體規則原文嵌進去**。不能假設 subagent 繼承全域 CLAUDE.md——歷史洩漏點就在這（使用者反覆手動提醒 = subagent 沒套用）
- 交付前自問那一句：「這英文詞能翻嗎？翻了更自然嗎？」能翻就翻

## Voice 語料方法論（load-bearing，新 session / subagent 必讀）

- `style/voice-profile.md` = threads 公開寫作 register（blog 主基準）
- `style/voice-profile-cc.md` = CC AI-對話 register；`style/voice-profile-line.md` = LINE 私聊 register
- **cc / line 是 register catalog，不是 blog writing template**——用來查核語感真實性，**不可直接搬進 blog**（指令語氣 / 群內梗 / 即時碎片會污染）
- `style/reference/` = 外部作者借鑑（如 `bolas-style.md`），對照組，**絕不覆蓋使用者自己的 voice**
- 重蒸時若使用者要「從原始資料」，從 `style/*-raw/` 重做，不從穩定 `voice-profile*.md` 疊加

## 選題候選白話簡介（固化）

介紹或登記部落格選題候選時，**題目必附白話簡介**——2-3 句、不帶術語、講給圈外人也聽得懂的版本（說清楚發生什麼事、為什麼值得寫），不是把候選條目的技術描述換句話說：

- **對話層**：向使用者列候選、報增補結果、提下篇選題時，每題附白話簡介，不能只給標題 + 分類
- **題庫檔層**：`docs/philip/blog-candidates-*.md` 新增候選條目時，固定加一行 `> **白話**：...`（2026-07-02 增補起生效；歷史條目不回溯補）
- 判準：讀完白話行的非工程師朋友能答出「這篇在講什麼、哪裡有趣」

## 事實查核紀錄（固化）

對某主題做過事實查核就要記錄，不要查完即丟、下篇重查：

- 每條記四欄：宣稱 / 判定（成立 / 部分成立 / 否 / 未驗）/ 來源（URL 或工具）/ 查核日期
- 落點：`docs/philip/factcheck-log.md`（gitignored 個人空間，跨文章累積，**不進公開 repo**）；與單篇相關的同時餵進該篇 `posts/<slug>-MATERIAL.md` 的 fact-authority 標記
- 用途：MATERIAL fact-authority 標記直接引用、跨文章免重查、寫作 agent 引數據時可回溯來源
- 時機：寫作流程 Phase 1 素材收集查證當下就記，不等寫完才補

## 校稿紀錄（固化）

material-first-writing Phase 1.5 純 AI 校稿閘——使用者校純 AI 版時：

- **事實型**修正（數字 / 來源 / 準據錯）→ 記 `docs/philip/factcheck-log.md`（FC-NNN，見上節）
- **編輯·語氣·結構型**校稿（順序 / 冗詞 / beat 取捨 / 收尾 / 語氣）→ 記 `docs/philip/proofread-log.md`（PR-NNN，格式見該檔頭，gitignored，跨文章累積）
- 兩類都**同步 fold 回該篇 `posts/<slug>-MATERIAL.md`**，Phase 2 voice 版只從校正後 MATERIAL 寫，**永不讀純 AI 校稿稿**
- 純 AI 版保留當 Phase 3 對照標本，維持原樣不回溯套修正

## 站台設計與部署決策（固化；2026-08-24 由 STATE.md state-archive promote）

- **視覺 = Anthropic warm editorial baseline，LOCKED**——對照 5 套（含 UIUXPROMAX 3 套）後使用者拍板「還是 Anthropic warm 最好」，是經得起對照的定案、不是沒比過的預設。不要再提改版。
- **Theme switcher 永久留站當 demo**——不是比完就砍的暫時物。
- **部署 = GitHub Pages user-page（Option B-修正）**——沿用既有 `GGGODLIN.github.io` repo、blog 上 `main`、Pages 走 Actions、舊 2020 scaffold 留 `master` 不刪。此為過渡期權宜；**域名遷移（gggodlin.com → CF Pages + `blog.gggodlin.com`）仍未做**，ready 後回歸 hub。
- Astro 6 publishing 三 trap 見 memory `feedback_astro6_publishing_traps_2026_05_17`。

## 專案 / 套件 / 工具連結規則（固化）

發佈正稿提及具體**專案 / 套件 / 工具 / repo** 時，**第一次具名出現必附完整可點擊連結**（GitHub repo 或官網），用 markdown link 形式 `[owner/repo](https://github.com/owner/repo)`。讀者看到工具名要能一鍵查證，這是讀者體驗硬要求（與全域「連結格式」規則一致，本專案落實到發佈文章內容層）。

- 連結 URL 以該篇 `factcheck-log` / MATERIAL fact-authority 已查證的為準，**不臨時編**
- 同一工具後續再提不必重複附，只在第一次具名介紹處附
- MATERIAL fact-authority 段本就帶 repo URL，寫作 agent 直接取用；Phase 2 模板 B 寫作要求已含此條
- **歸檔版不回溯補**（歷史快照）；只在發佈正稿與之後新文落實

## Tag 治理（固化）

- 新文章只能使用 tag registry 內的 canonical ID；既有 tag 優先沿用。
- 如果文章需要 registry 尚未存在的新 tag，**先停止發布流程，向 top-level user 說明新 tag 的 ID、label、維度、意思與邊界，取得當回合明確核准後，才可修改 registry 與文章 frontmatter**。
- 修改 registry 本身不算使用者核准；不得在同一輪先自行登記，再用 content check 通過當成已確認。
- 使用者核准後，新 tag 正常加入活詞彙表；這不是封閉白名單。

## 發布 checklist：corpus 契約測試（固化）

GitHub Pages 部署前會跑 `npm test`，其中四份測試把文章總數與每篇 tag 寫死成契約。**新文章放進 `src/content/blog/` 後、push 前，必須同一個 commit 一起改，否則部署紅燈**：

- `tests/tag-registry.test.ts`：文章總數 +1
- `tests/series-connectivity.test.ts`：測試名與斷言的文章總數 +1
- `tests/support/series-connectivity-contract.ts`：把新 slug 加進一個系列的 `members`，且文章 tag 要含該系列 `validConnectors` 之一，否則會被判成未歸屬孤島
- `tests/tag-audit-manifest.test.ts`：`expectedPreConnectorTags` 加新篇完整 tag、`expectedTopicMemberships` 加新篇所屬 topic（依 `src/data/topic-groups.ts` 對照）、`assignmentCount` 加上新篇 tag 數、對應 topic 計數 +1、兩處文章總數 +1
- `tests/article-discovery.test.ts`：只在新篇帶 hook／skill／subagent／workflow 任一 tag 時，加進對應清單

做法：改完本地跑 `npm test` 全綠再 push。這段在 material-first-writing 的 localhost gate 之後、commit 之前執行。

## 發布後同步轉發（固化；2026-08-24 依使用者拍板改版）

本 blog 走「原站發布 + 多平台全文轉發」三平台策略：**GitHub Pages（canonical 原站）→ Medium → 方格子（vocus）**。

**轉發由使用者自行以 codex 處理，CC 不接手、不提醒**（使用者拍板的常設政策）。`material-first-writing` skill 的 Phase 6 + localhost gate 只負責原站上線，上線即止。

- 使用者若明確要求 CC 轉發，才 trigger 既有 skill：Medium → `medium-syndicate`（`/medium-syndicate <slug>`）、方格子 → `vocus-syndicate`（`/vocus-syndicate <slug>`）；防重複、canonical、轉發紀錄由 skill 自理（grep `docs/philip/syndication-log.md`）
- Medium 24h 限發 2 篇的排隊檔仍在 `docs/philip/medium-publish-queue.md`，供使用者側流程查閱
