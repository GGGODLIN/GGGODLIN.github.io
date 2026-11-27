# gggodlin-blog 專案規則

> 這是個人技術部落格 + voice 蒸餾專案。產出物本質是**中文寫作**，所以「中文品質」是第一級正確性，不是風格偏好。

## 反晶晶體 = 硬性品質閘（HARD GATE）

正式定義在全域 output style `~/.claude/output-styles/Explanatory.md` 的「不翻清單」與「反晶晶體」兩條，**不在此重複**。本專案把它升級成硬閘：

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
- **部署 = GitHub Pages 自訂網域 `https://blog.gggodlin.com`**——沿用既有 `GGGODLIN.github.io` 儲存庫、部落格上 `main` 分支、透過 GitHub Actions 部署、舊 2020 骨架留 `master` 分支不刪；自訂網域 `https://blog.gggodlin.com` 已於 2026-10-29 正式上線（GitHub Pages + `CNAME` + 舊網址 301 轉址）。
- Astro 6 publishing 三 trap 見 memory `feedback_astro6_publishing_traps_2026_05_17`。

## 文章標題長度（固化）

- 發佈正稿標題（`title` 與正文 `# ` 大標）預設控制在**兩行左右**（依文章頁 `.container` `632px` 寬度配 `h1` `50px` 字級實測，約 **18～25 字內**，不寫成帶冒號長副標的四、五行標題）。
- 實驗分母、補充數據與背景限定交給 frontmatter `description` 與首段承載，不塞進大標。

## 文章頂部摘要（`tldr`）規則（固化）

- 每篇發佈正稿的 YAML frontmatter 都附選填欄位 `tldr`，由 `BlogPost.astro` 渲染在大標題正下方的「先講結論」卡片中，讓讀者一眼抓到文章核心（與 SEO 用的 `description` 分開，不影響首頁卡片與搜尋結果）。
- **內容邊界**：只寫**核心理念與方法論骨架**（為什麼這樣做、核心看法與做法脈絡），若文章有明確的主角開源專案或站內核心頁，可在句末順帶 1–2 個 `[名稱](URL)`（URL 必須取自該篇正文已查證的公開連結）；**不寫具體實驗數據、百分比、分數、次數、金額、耗時、日期、個案細節或除錯過程**，也不復讀大標題。
- **格式與長度**：單一段落、1–2 句、約 **55～90 字**（硬上限 95 字），禁破折號 `——`、emoji 與套話（「本文將」「反直覺」「總而言之」），須通過反晶晶體與台灣用語檢查。
- 標竿範本：`不看公開跑分，改拿真實私有 PR 當考卷，並把「模型能力」「判官漂移」「供應壽命」分開量。這篇拆完整評測與考場校準方法，附開源工具 [repo-to-bench](https://github.com/GGGODLIN/repo-to-bench) 與公開[模型 Tier 表](https://blog.gggodlin.com/tier/)。`

## 敘事紀律：不寫踩坑情節（固化）

- 部落格的大綱提案、開場角度、標題與正文，一律採冷靜的方法論與實證對照敘事，不把失誤、除錯過程或條件校準鋪陳成「踩坑／翻車／防雷」戲劇化情節。
- 單次實作或除錯小踩坑不進大綱與 `MATERIAL §3` 文章脊柱；正文留用的技術案例（例如自建 hook 上線前重放或規則條件調整）同樣以「事前校準、條件比對或實證驗證」呈現，聚焦「待驗問題 → 方法 → 對照結果 → 決策邊界」。

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
- `src/data/series-catalog.ts`（由 `tests/support/series-connectivity-contract.ts` 重新匯出）：把新 slug 加進一個系列的 `members`，且文章 tag 要含該系列 `validConnectors` 之一，否則會被判成未歸屬孤島
- `tests/tag-audit-manifest.test.ts`：`expectedPreConnectorTags` 加新篇完整 tag、`expectedTopicMemberships` 加新篇所屬 topic（依 `src/data/topic-groups.ts` 對照）、`assignmentCount` 加上新篇 tag 數、對應 topic 計數 +1、兩處文章總數 +1
- `tests/article-discovery.test.ts`：只在新篇帶 hook／skill／subagent／workflow 任一 tag 時，加進對應清單

做法：改完本地跑 `npm test` 全綠再 push。這段在 material-first-writing 的 localhost gate 之後、commit 之前執行。

## 發布後同步轉發（固化）

本 blog 走「原站發布 + 多平台全文轉發」三平台策略：**GitHub Pages（canonical 原站）→ Medium → 方格子（vocus）**。

原站 push 上線並驗證 `HTTP 200` 與自我 `canonical` 通過後，由 CC 主動依序接續 `medium-syndicate`（`/medium-syndicate <slug>`）與 `vocus-syndicate`（`/vocus-syndicate <slug>`）完成雙平台全文轉發，不停在原站上線等使用者另行發起（若使用者本次明確表示只推原站或不轉發，則尊重單次指令跳過）。

- **發布授權邊界**：原站 `git push` 與後續雙平台全文轉發同屬對外發布，一律在 localhost gate 過目並取得使用者放行後才執行，不在原站發布確認前偷跑轉發
- **Medium 24 小時上限**：發 Medium 前先核對 `docs/philip/syndication-log.md` 內近 24 小時帶 `publishedAt` 的成功發布數；未滿 2 篇就正常發布並落檔，已滿 2 篇就依 `medium-syndicate` 批次草稿模式建好草稿、記進 `docs/philip/medium-publish-queue.md`（不硬發撞紅條），並照常完成方格子發布；防重複、canonical、轉發紀錄由兩支 skill 自理
