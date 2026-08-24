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

## 支語檢查 gate（固化）

material-first-writing **Phase 4 外審後、Phase 6 收斂前**加一道支語檢查——抓中國大陸用語味道。這跟上面「反晶晶體 HARD GATE」是**不同維度**的中文品質閘：反晶晶體只管「該翻沒翻的英文詞」、支語 gate 管「中國用語 vs 台灣用語」（檔次→等級、視頻→影片）。反晶晶體那道靠自律會洩漏，支語 gate 改用工具決定性檢測補這個弱點。

- **時機**：對 Phase 5 拍板的那一版（單一稿）跑，不是 N 版都跑。外審修正套回後、收斂前
- **怎麼跑**：main session 接續執行 `tools/zhtw-check.sh <該版 md>` → lint（[sysprog21/zhtw-mcp](https://github.com/sysprog21/zhtw-mcp)、教育部標準、1100+ 詞彙規則）→ render 命中報告網頁 → 開瀏覽器本地 review
- **人在迴圈、不 auto-fix**：報告網頁分兩區。**「中國用語」區**（cross_strait / 字形 / 大小寫）是支語核心、逐筆人工確認改不改；**「翻譯腔」區**（AI 句式：定語堆疊、的的不休）是 advisory 第二維度、可改可整段忽略。命中是「候選」不是「判決」
- **預設不過濾、誤判 review 時略過**：report 忠實呈現 zhtw-mcp 所有命中，**不預設任何白名單 / borrow 詞**（用套件原本設定）。誤判（如「轉發」被建議成「轉寄」，但轉發台灣通用、本 blog 拿它當術語）review 時人工略過即可
- **之後要自訂過濾 / 借詞（user 自己慢慢加、非預設）**：建 repo root `.zhtw-mcp.toml`（lint 從 cwd 往上探測）。誤判白名單填 `ignore_terms`、借詞填 `overrides` 指向的 JSON（schema_version 3、`spelling[]`）。**坑**：zhtw CLI lint 不吃 `ignore_terms`／`suppressions`（只 MCP 模式吃），白名單要靠 `zhtw-report.py` render 層自己過濾。借詞來源可參考 [Qmo37/localization-tw](https://github.com/Qmo37/localization-tw)（但整包別裝：詞庫實際比 zhtw 少、增量多為生活詞）
- **修正併回**：user 確認要改的，比照「校稿紀錄」——用語修正 fold 回該篇 `posts/<slug>-MATERIAL.md`（永久真相源）再進 Phase 6
- **本機工具、不進 repo**（`tools/` 已 gitignored）：binary 自 source build（`cargo build --release --no-default-features --features native`、排除連網 translate feature）裝在 PATH；script 為 `tools/zhtw-check.sh` + `tools/zhtw-report.py`。重建步驟見 `~/Desktop/projects/.claude/trials/` 內 zhtw-mcp trial 紀錄
- **AI 八股味維度另有工具**：`tools/humanize-chinese`（既有、但未接流程）專做 AI 八股味去痕（賦能 / 全方位 / 綜上所述），跟支語不同維度。要認真治 AI 味再評估接它，本 gate 只管支語

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

## 發布後同步轉發（固化；2026-08-24 依使用者拍板改版）

本 blog 走「原站發布 + 多平台全文轉發」三平台策略：**GitHub Pages（canonical 原站）→ Medium → 方格子（vocus）**。

**轉發由使用者自行以 codex 處理，CC 不接手、不提醒**（使用者拍板的常設政策，取代舊版「上線後 main session 主動問要不要轉發、下次 push 提醒還有 X 篇沒轉」行為）。`material-first-writing` skill 的 Phase 6 + localhost gate 只負責原站上線，上線即止。

- 使用者若明確要求 CC 轉發，才 trigger 既有 skill：Medium → `medium-syndicate`（`/medium-syndicate <slug>`）、方格子 → `vocus-syndicate`（`/vocus-syndicate <slug>`）；防重複、canonical、轉發紀錄由 skill 自理（grep `docs/philip/syndication-log.md`）
- Medium 24h 限發 2 篇的排隊檔仍在 `docs/philip/medium-publish-queue.md`，供使用者側流程查閱
