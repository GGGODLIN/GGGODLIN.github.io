# blog-topic-scan 來源 5：session 存檔掃描（2026-08-23 ~ 2026-08-29）

掃描窗：2026-08-23 00:00:00 起、2026-08-29 當下止（起訖皆含）。掃 `~/.claude/sessions/` 窗內新建或更新的 session 存檔。

## 窗內檔案盤點

- 內容存檔（`*-session.tmp`）：3 份——`2026-08-23-grokbuild-agent-eval-session.tmp`、`2026-08-24-sync-retry-fix-session.tmp`、`2026-08-29-discord-dce-cli-adopt-session.tmp`
- 數字檔名 json（`12273.json`、`21051.json`、`27909.json`、`34016.json`、`47279.json`、`58911.json`、`70390.json`，各帶 `.key`）：7 份。這些是執行中 session 的 process registry（欄位只有 pid / sessionId / cwd / status 等，無任務內容），status 全為 busy、起於 08-28~08-29，其中 `70390` 即本次掃描自己的 session。**不列入活動、不計入合併數**
- 窗內無「檔名不帶窗內日期、但 mtime 在窗內更新」的存檔（`find -newermt` 交叉確認，僅命中上列 10 個檔）
- 三份存檔分屬三個不同工作，無需合併；亦無重複續接摘要檔

---

## 活動 1：Grok Build 三度重評收斂出「第二類委派 agent」選型框架，判 pi trial

- **活動描述**：從評估 `xai-org/grok-build`（SpaceXAI 的 Rust terminal coding agent）開始，使用者三度收窄 frame（整包取代 CC → 模型原生 agent → 通用 BYOK），最終落成一個根本問題：把 agent 用途分成「主互動 agent（CC）」與「委派跑者（headless 派任務、不繼承 harness）」兩類，為第二類選型。實測層面：讀 gb 原始碼確認它直接讀 `~/.claude/` 六個 surface（skills / rules / agents / mcps / hooks / sessions 預設全開）、量化出 28 個 hook 檔吃 CC 的 snake_case stdin 而 gb 用 camelCase（「讀得到 ≠ 行為等價」的斷點）、修正初判「gb hook 全 fail-open」（exit 2 在 PreToolUse 是 explicit deny）、量出四候選內建工具數（gb 25 / gb_concise 3 / pi 7 / opencode 約 18）。裁決：gb 與 oh-my-pi 因「預設自動吸走 `~/.claude/`」出局；opencode 因平台化包袱出局；pi 判 provisional trial（容器化為前置條件、headless 可靠度零實測）。使用者拍板兩條必留：「輕重＝agent 本身有多少功能、對模型表現的影響，不是打包大小」與「不維護乾淨 CC，怕控制不了自己又搬過去」
- **日期**：2026-08-23
- **證據指針**：`~/.claude/sessions/2026-08-23-grokbuild-agent-eval-session.tmp`（證據副檔在 `/private/tmp/claude-501/...4699eb50.../scratchpad/grok-build-eval-2026-08-23.md` 與 `second-class-agent-candidates-2026-08-23.md`，tmp 重開機即消失）
- **為什麼可能成題**：兩類 agent 的分工框架 + 「輕重＝模型面負擔」的定義 + 「護欄靠格式不相容而非自律」是經過四工具實測對照才長出來的選型方法論，跟「AI 時代工程師怎麼組 agent 軍團」的受眾痛點直接對上
- **slug 候選**：`two-tier-agent-delegation`、`lightweight-delegation-runner`、`second-class-agent-selection`
- **題庫／帳本關係**：memory 帳本已回寫多處（新建 `user_agent_two_tier_delegation_model`、`feedback_competitive_analysis_check_own_stack_first`、`_index_tool_eval_outcomes` 等），MEMORY.md User 段已有索引行——已進帳本，題庫關係待 main 語義比對。**未進帳本的尾巴**（成題素材）：pi trial 尚未登記 trials ledger、opencode 帳本星數未回寫（161K → 200,423）、兩件 gb extract pending（Bash allow rule 逐段 checklist → gate-authoring 坑段；harness 完整性 deny-first → settings deny）、`grok_build_concise` 3 工具變體的啟用方式未知。另兩筆觀察佐證：session 明載「memory-ripple hook 兩度觸發確認寫入生效」（`memory-state-ripple` 觀察中的行為資料點）、引用了 90 天 always-on 17,850→33,880 B / CLAUDE.md 42 修訂的成長數據（`claude-config-activity-curve` 觀察中的量化佐證）

## 活動 2：scripts/sync.js retry backoff 無上限 bug 修復（存檔自標「模擬情境」）

- **活動描述**：修 `scripts/sync.js` 的 retry 邏輯缺陷——backoff 無上限導致重試風暴。存檔記載 bug 已修、backoff 上限 500ms 尚未套入、驗證指令 `node --test tests/sync.test.js --grep "retry"`。**注意檔頭明寫「模擬情境：scripts/sync.js 所屬 repo 絕對路徑未提供，無法解析」**，即這份存檔的場景是模擬的，不是真實專案工作；無使用者拍板、無決策、無真實 repo 可回溯
- **日期**：2026-08-24
- **證據指針**：`~/.claude/sessions/2026-08-24-sync-retry-fix-session.tmp`
- **為什麼可能成題**：若為真實工作，backoff 上限 / 重試風暴屬通用工程教訓；但存檔自標模擬情境、無真實事故與數據背書，作為選題素材的可信度存疑——列出供 main 判斷是否直接剔除
- **slug 候選**：`retry-backoff-cap`（僅在確認非模擬時才有意義）
- **題庫／帳本關係**：無 memory 回寫、無 ledger 對應；與既有帳本零交集。待 main 語義比對（含「這是什麼性質的 session」本身）

## 活動 3：Discord 頻道訊息撈取工具鏈採用（DCE CLI + Keychain token），三輪路線評估後定案

- **活動描述**：使用者要讓 Claude 讀取他人 Discord server 的頻道討論（低頻需求）。三輪路線評估：bot+MCP 排除（非管理員、邀不了 bot）→ user-token MCP 排除（低頻不值得常駐 MCP，且「tool schema 載入 context 的成本」無數據前不推薦）→ 定案 [DiscordChatExporter CLI](https://github.com/ThaTiemsz/DiscordChatExporter)（11,867 stars、2026-08-27 仍在 push）匯出 JSON 後讀檔分析。全鏈路實測跑通：3 天 2,088 則匯出 + 昨晚話題摘要。token 存 macOS Keychain（`discord-user-token`），不落明文。踩坑：前景跑大匯出必撞 2–3 分鐘 timeout（exit 143、JSON 寫一半被切），必須背景跑；`mv` 到 sensitive path 被 dcg hook 擋（判定為「跨段遞迴刪除繞道」）；Discord Developer Policy 頁 WebFetch 403，ToS 細則始終未取得、灰區主張已標未經官方確認。使用者拍板「把工具保留下來，寫個採用記憶，下次撈 DC 訊息直接用」
- **日期**：2026-08-29
- **證據指針**：`~/.claude/sessions/2026-08-29-discord-dce-cli-adopt-session.tmp`（採用記憶：`~/.claude/memory/reference_discord_chat_exporter_cli_2026_08_29.md`，已在 MEMORY.md Standalone reference 段）
- **為什麼可能成題**：一條完整的「灰區工具採用決策鏈」——bot 路線為何失效、為何寧可 CLI 也不裝常駐 MCP、token 為何進 Keychain 不進檔案、ToS 灰區的知情風險管理，是「使用者（非管理員）怎麼合法又務實地讀取社群資料」的具體案例
- **slug 候選**：`discord-user-token-greyscale`、`cli-over-mcp-for-low-frequency`、`discord-channel-export-toolkit`
- **題庫／帳本關係**：採用記憶已落 memory 帳本（standalone reference），題庫關係待 main 語義比對。**帳本佐證**：`mv` 被 dcg hook 攔下並改走 `cp -a + rm -rf`，是已升格 `dcg-command-guard` 機制的一次真實命中（行為證據，非僅庫存）。未進帳本的尾巴：token 曾明文貼在對話中（transcript 有留底）、使用者未決定是否重置；`--filter` / `-p 20M` / `exportguild` / 多頻道匯出皆未實測

---

## 帳本機制對照（僅記窗內出現的對接點，不另開新條目）

- 觀察中：`memory-state-ripple`（活動 1 hook 觸發佐證）、`claude-config-activity-curve`（活動 1 引用的成長數據佐證）——兩筆皆為資料點補充，非新活動
- 已升格：`dcg-command-guard`（活動 3 真實攔截命中）——佐證補充，非新活動
- 已否決：`rebuttal-calibration`——窗內無重提條件（無 finding 發布成預設流程、無真實作者回覆）
- 已併入各條目：窗內無新對接點

## 計數

- 窗內 session 檔數：10（3 份內容存檔 + 7 份執行中 process registry，後者無內容、不列入活動）
- 合併後活動數：3（活動 1、2、3；同一工作多份存檔合併需求 = 0，三份各屬獨立工作）
- 疑似剔除候選：活動 2（存檔自標模擬情境，是否計入由 main 裁決；若剔除則實質活動 = 2）
