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

## 專案 / 套件 / 工具連結規則（固化）

發佈正稿提及具體**專案 / 套件 / 工具 / repo** 時，**第一次具名出現必附完整可點擊連結**（GitHub repo 或官網），用 markdown link 形式 `[owner/repo](https://github.com/owner/repo)`。讀者看到工具名要能一鍵查證，這是讀者體驗硬要求（與全域「連結格式」規則一致，本專案落實到發佈文章內容層）。

- 連結 URL 以該篇 `factcheck-log` / MATERIAL fact-authority 已查證的為準，**不臨時編**
- 同一工具後續再提不必重複附，只在第一次具名介紹處附
- MATERIAL fact-authority 段本就帶 repo URL，寫作 agent 直接取用；Phase 2 模板 B 寫作要求已含此條
- **歸檔版不回溯補**（歷史快照）；只在發佈正稿與之後新文落實

## 發布後同步轉發（固化）

本 blog 走「原站發布 + 多平台全文轉發」三平台策略：**GitHub Pages（canonical 原站）→ Medium → 方格子（vocus）**。`material-first-writing` skill 的 Phase 6 + localhost gate 只負責原站上線，**轉發是上線後的下一步**，main session 主動接續、不要停在 push 上線後等使用者另外發起。

- **觸發點**：`git push` 觸發 GitHub Actions deploy 成功（curl 原站 URL 200 + 內容對）後，main session 主動問：「文章上線了，現在要轉發到 Medium / 方格子嗎？」
- **預設兩平台都問、使用者拍板執行哪幾個**：Medium 24h 限發 2 篇（撞限就排隊隔天）、方格子無限制可立即走。不要自動連跑——使用者每次點頭才走
- **轉發直接 trigger 既有 skill**，不要在 main session 自己重寫流程：
  - Medium → `medium-syndicate` skill（trigger「轉發到 Medium」或 `/medium-syndicate <slug>`）
  - 方格子 → `vocus-syndicate` skill（trigger「轉發到方格子」或 `/vocus-syndicate <slug>`）
- **防重複、canonical、轉發紀錄**由兩個 skill 自己處理（已內建 grep `docs/philip/syndication-log.md` 防重發、canonical 填入、發布後 append log）；main session 不重複這些檢查
- **使用者說「不轉」或「之後再說」**：尊重決定，把該篇 slug + 暫緩理由記到 `docs/philip/syndication-log.md` 的隊列段（或 `docs/philip/medium-publish-queue.md` 既有 Medium 排隊檔）以免遺忘，下次發新文 push 後 main session 提醒「還有 X 篇沒轉」
