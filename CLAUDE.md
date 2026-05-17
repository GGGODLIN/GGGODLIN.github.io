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
