# blog-topic-scan 來源 1：memory 掃描報告（2026-08-23 00:00:00 ～ 2026-08-29 掃描當下）

掃描方式：`find ~/.claude/memory/ -type f -newermt "2026-08-23 00:00:00"` 枚舉窗內 mtime 有動的檔案，逐檔讀內容；另以 `git -C ~/.claude log` 對 memory/ 的 commit 交叉對帳，區分「窗內真實寫入活動」與「批量維護碰到的舊檔」。本報告只整理資料，不做候選裁決。

## 掃描統計

- 掃描檔數：81（窗內 mtime 命中的 memory 檔，含 .verification-ledger.jsonl；不含目錄）
- 命中活動數：25 條活動（見下）
- 零活動欄位不適用：非零
- 批量維護排除說明：兩波 mtime 群集屬帳本維護而非新事件——(1) 08-25 13:29–13:37「refresh research evaluation records」等一串 commit 對 11+ 個既有 eval 檔回寫更正註記（內容歸入對應活動，不另計）(2) 08-29 11:39 `fix(memory): reconcile archived project paths`（commit 062042f）對 15 個舊檔（openclaw_trial、hermes_trial、fan_control、repowise_eval 等）只做封存路徑回寫與 mtime 刷新，屬單純措辭／路徑更新，按指示不當活動。`.verification-ledger.jsonl`（109KB）為 hook 自動寫入的驗證帳本，非事件。

---

## A. 制度演化類（memory／harness／流程治理）

### A1. agent 兩類分工定型：pi＋Gemini 3.7 Flash 成為第二類委派 runner
- 活動描述：2026-08-23 一天之內完成「agent 用途兩分類」的制度拍板——第二類（不繼承 harness 的隔離跑者）選型從 pi／opencode／oh-my-pi／grok-build 四候選逐軸實測，pi 以 7 個內建工具、預設零注入、訂閱 OAuth 6 家勝出；同日跑 permission POC（task grant＋確定性 gate＋稀疏 batch escalation，101 次 grant 內 call 0 次喚醒 supervisor、單次 approval 最佳化後仍要 9 秒／57,856 cache tokens，故否決逐次 online approval）＋ Harbor 正式 T2 單題（47/47 hidden tests 全過、零介入），拍板進入 Herdr 日常試用。核心原則「護欄靠格式不相容、不靠自律」「輕重＝對模型面的負擔不是打包大小」都由實錯校正而來。
- 日期：2026-08-23
- 證據指針：`~/.claude/memory/user_agent_two_tier_delegation_model.md`、`~/.claude/memory/reference_pi_cc_supervisor_permission_poc_2026_08_23.md`
- 為什麼可能成題：一個人怎麼用實測（而不是 README 印象）決定「哪些工作外包給輕量 agent、哪些留給重 harness」，且量出了「省下來的 token 會被監督成本吃回去」這個反直覺結論。
- slug 候選：`two-tier-agent-delegation`、`pi-cc-supervisor-permission-poc`
- 題庫／帳本關係：觀察中帳本無同名條目、待 main 語義比對（可能與已升格的 `selective-harness-grafting` 相鄰但軸不同——本條是「外包邊界」不是「抽件」）。

### A2. CLAUDE.md 全量規則遵守率 audit：110 條散文規則逐條量測與三分判決
- 活動描述：2026-08-25 立案當日結案——對 CLAUDE.md 69 bullet＋rules/common 41 條逐條設偵測訊號、跑 session jsonl 量遵守率、三分「留／升 hook／刪」。產出 190 條判決（留 164／做成機制 7／特定任務載入 10／刪 2／判不了 7），30 天違規按模型 Fable 105／GPT 83／Opus 65；帳本對應率 245/297 種寫法、人工抽驗 13/20 對。起因洞察：unlazy absorb-pack 顯示值得吸的全是「散文變機制」。附帶發現「白話／看不懂」207 列帳本叢集對不到任何規則。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/project_claude_md_rule_adherence_audit_2026_08_25.md`
- 為什麼可能成題：「寫在 CLAUDE.md 的規則到底有沒有用」是多數 AI 工具使用者都猜過但沒人量過的問題，這次量出來了——大多數規則其實有效（164/190 留），但「量測方法」與「散文規則 vs 機制護欄」的取捨是可搬走的結論。
- slug 候選：`claude-md-rule-adherence-audit`
- 題庫／帳本關係：待 main 語義比對；與 #106 系（zero-fire-topic-governance 已併入）及 `trigger-ownership-split`（觀察中）可能相鄰。

### A3. 「recurring error 先分類來源、隔離重現、查版本」——兩次想修模型行為都被打臉
- 活動描述：chrome-devtools「selected page closed」錯誤 51 次，08-18 沒查根因就寫行為規則（無效）、08-25 又提 PreToolUse gate（被使用者說「有點笨」），實際根因是 chrome-devtools-mcp 1.7.0 的 regression（npx `@latest` 靜默升版）。沉淀成規則：排檔 recurring error 前先做來源分類／最小 client 隔離重現／版本線索三件事，填不出來就標「根因：未查」。後續 08-26 完成 1.8.0 釘版＋pageId migration 收尾。
- 日期：2026-08-25（根因 A/B 對 1.6.0 十分鐘定案）、2026-08-26（升級與 migration）
- 證據指針：`~/.claude/memory/feedback_recurring_error_reproduce_before_rule_or_gate_2026_08_25.md`、`~/.claude/memory/reference_chrome_devtools_mcp_170_closed_page_regression_2026_08_25.md`
- 為什麼可能成題：「工具報錯就想改 prompt／加 gate」是 AI 時代工程師的反射動作，這是一次完整的「錯兩次才找到真根因是上游 silent upgrade」的驗屍。
- slug 候選：`recurring-error-reproduce-before-gate`
- 題庫／帳本關係：機制帳本「觀察中」無同名；與已升格 `measurement-validity-gates` 同族（量測有效性）、待 main 語義比對。

### A4. memory 狀態翻案波及面機制升級：memory-ripple hook v3 接 Gemini 語意補漏
- 活動描述：狀態反轉事實（退訂／退役／翻案）寫 memory 時必做 ripple sweep 的慣例，08-23 更新 enforce 層——memory-ripple hook v3 每次寫入同步問一次 Gemini 判斷「是增量還是會讓別檔過期」，機械命中但語意判增量就取消提醒、機制沒命中但語意判會過期就當場補一則提醒；舊的本機 Qwen 判斷與背景補漏拆除。名單本身經 45 天 jsonl 回測（v0 直覺名單 recall 僅 52.6%）。
- 日期：2026-08-23
- 證據指針：`~/.claude/memory/feedback_memory_state_change_ripple_convention.md`
- 為什麼可能成題：過時前提是所有長期使用 AI 系統的人的隱形債（作者自己實證過「50 個檔提到 mimo、4 個前瞻建議檔沒連坐更新」），這是「過期前提的自動偵測」的具體機制設計與迭代史。
- slug 候選：`memory-state-ripple`
- 題庫／帳本關係：機制帳本觀察中 `memory-state-ripple`——直接回填該條。

### A5. 一天之內三起 gate／permit 摩擦：多 session 共用 repo 的 index 是共享狀態
- 活動描述：08-25 三則 feedback——(1) agent-contract-gate permit 綁整棵 staged tree，另一 session 在 `~/.claude` stage 的 17 檔會一起被授權；(2) `git add && git commit` 串同一條指令被 gate 擋 6 次（3 次是形狀、3 次是別人的 index 狀態），沉淀出「分兩條 Bash、被擋第二次先分形狀 vs 狀態」規則；(3) 規則泛化：被 gate 擋第二次 = 停止換寫法、先讀訊息分類。三則同源：共享 repo 的 index／staging 是跨 session 共享狀態。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/feedback_gate_permit_check_staged_tree_before_issue_2026_08_25.md`、`~/.claude/memory/feedback_claude_dir_git_add_commit_separate_commands_2026_08_25.md`
- 為什麼可能成題：多個 AI session 同時操作同一個 repo 是新形態的併發問題（人類工程師想都不會想的「permit 綁 index tree」類坑），第一手踩坑實錄。
- slug 候選：`shared-repo-index-multi-session`
- 題庫／帳本關係：待 main 語義比對；與 `dcg-command-guard`（已升格）同屬 gate 摩擦族。

### A6. 拍板表白話化升格：grilling 逐題也要三段來龍去脈
- 活動描述：既有 feedback「拍板表不可用內部編號當主載體」在 08-25 擴充——wayfinder／grilling 的每一題都要先給「這題在決定什麼／為什麼要問你／證據」三段再列選項；實例：直接丟觸發詞選項被使用者要求加白話，重寫後連續三題一句拍板。帳本最大叢集「白話／看不懂」207 列（rule-review audit 同日產出）與本條同源。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/feedback_ballot_table_plain_language.md`
- 為什麼可能成題：「AI 跟人溝通時把壓縮成本轉嫁給人解碼」是普遍痛點，這條有 207 列帳本數據背書。
- slug 候選：`ballot-table-plain-language`
- 題庫／帳本關係：機制帳本觀察中 `plain-language-hard-gate`——直接回填該條（白話從拍板表擴到逐題 grilling 是該機制的演進證據）。

### A7. ledger-lifecycle：帳本生命週期制度一天建完，收回 16.9 GiB
- 活動描述：08-23–24 從 wayfinder 12 票到完整實作——25-entry registry、每日 channel、active.md 38 筆索引下放、safe-trial Git 快照改記 ref 不複製目錄、friction 90 天退場；一次性整理刪 22 個已結案 snapshot 的 44 目錄（16.931 GiB），32 個 test command 全綠。翻案：MEMORY.md 其實「有」每日盯梢（local-analysis channel 8 月每日皆有）；safe-trial 快照 20.85 GiB 膨脹根因是對 `~/.codex` 整包複製。
- 日期：2026-08-23～24
- 證據指針：`~/.claude/memory/general/project_ledger_lifecycle_wayfinder_2026_08_23.md`
- 為什麼可能成題：「第二大腦長期運轉後的帳本腐化」是真實問題，這次量出並處理了——快照膨脹 20.85 GiB、STATE.md 無自動整理等都是別人會撞的。
- slug 候選：`ledger-lifecycle`
- 題庫／帳本關係：待 main 語義比對；與 `single-truth-pointer-tombstone`（觀察中）與 `wiki-daily-maintenance`（已升格）相鄰。

### A8. 視覺迭代 review 時點規則：定版前不跑完整 code review
- 活動描述：08-28 新增 feedback——視覺／動畫／UI 本地迭代期只跑基本 check＋瀏覽器 smoke test，等使用者定版並允許發布後才跑完整 review／commit／push；原因是完整 review 會阻斷快速體感迭代、未定版實作下一輪就改掉。特別點名 gggodlin-blog 的「本地看畫面逐輪調整」模式。
- 日期：2026-08-28
- 證據指針：`~/.claude/memory/feedback_visual_iteration_review_after_approval.md`
- 為什麼可能成題：AI 協作寫 UI 時「每輪都 review」的直覺其實反生產力——流程時點本身就是設計題。
- slug 候選：`visual-iteration-review-after-approval`
- 題庫／帳本關係：待 main 語義比對；blog 專案自身流程，與 blog 帳本關係密切。

### A9. 已發布文件的宣稱邊界文體四動作
- 活動描述：08-25 從 unlazy README／SECURITY.md 吸收的文體——能力宣稱配否定句（「會保證 X」同句寫明文不保證什麼）、引用旁寫防誤讀註記、主動撤回自己舊的不可重現數字並寫缺什麼 artifact、來源清單標 as-of 日期。與 fact-check 第 13 條姊妹（13 條管推理過程、本條管已發布文件）。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/feedback_published_doc_claim_boundary_style_2026_08_25.md`
- 為什麼可能成題：寫技術文章／README 時「數字被讀者誤述的方向直接寫死」是很少人有的習慣，直接可搬。
- slug 候選：`published-doc-claim-boundary`
- 題庫／帳本關係：待 main 語義比對；與 blog 寫作紀律（`docs/philip/` 校稿帳本）直接相關。

### A10. GitHub Actions 供應鏈三招（記給未來開 CI）
- 活動描述：08-25 自 unlazy workflow 吸收——action pin 到 commit SHA、permissions 最小化、checkout `persist-credentials: false`，補上 `_index_supply_chain_security` 只有 npm install-time 三層的缺口；自家無 CI，只記錄。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_github_actions_supply_chain_three_moves_2026_08_25.md`
- 為什麼可能成題：偏通用知識、非個人事件；成題潛力低，僅登記。
- slug 候選：無
- 題庫／帳本關係：無；研究型結論原樣保留。

---

## B. 研究／量測結論類

### B1. custom ANTHROPIC_BASE_URL 快取懲罰四度翻案：不是 per-request 稅、是暖機成本
- 活動描述：08-23 第四次更正定案——先前「每 request 固定 15K／+169% 過路費」是把三個獨立 `claude -p` session 各自的 turn-1 暖機誤判成 recurring 稅；同 session 三回合量到 proxy `input=15,003→47→47`，turn 2 的是 cache write。沉澱出六條「評 proxy 型工具必問」判準（同 session 至少三回合、跑 pure-forwarding 對照、同時看 input/cache read/cache creation、按官方順序找 breakpoint 等）。另發現 custom base URL 令 ToolSearch deferral 消失（61 tools 全送）、subagent「fresh context ≠ cold cache」（相同 agent prefix 跨派工可共用 5 分鐘 prompt cache）、CLI `total_cost_usd` 含 child 但 aggregate usage 不含。
- 日期：2026-08-23（更正落地）、檔案窗內多次回寫至 08-25
- 證據指針：`~/.claude/memory/reference_custom_base_url_cache_penalty_2026_08_22.md`、`~/.claude/memory/reference_subagent_boot_cost_decomposition_2026_08_01.md`（08-23 補證）、`~/.claude/memory/reference_headroom_eval_2026_06_01.md`（第五次更正，08-28）
- 為什麼可能成題：所有人都會踩的量測陷阱（三個獨立請求外推成每次成本），而且翻案過程本身就是「怎麼量 AI 成本才正確」的教材；subagent cache 跨派工共用是反直覺的實用結論。
- slug 候選：`proxy-cache-warmup-not-tax`、`subagent-fresh-context-not-cold-cache`
- 題庫／帳本關係：待 main 語義比對；與已升格 `measurement-validity-gates` 直接同族——本條是該機制最強的案例材料。部落格 FC-148～FC-156 已掛 factcheck-log。

### B2. Headroom 事件收尾：config 污染殘留定位完成
- 活動描述：08-27–28 headroom eval 檔第五次更正——08-22 KILL 當日漏跑 `headroom unwrap claude`，`wrap claude` 寫入的 project-local SessionStart hook 殘留 5 天、直到 executable 已刪後以 startup error 暴露；「當時未查明的接管路徑」SUPERSEDED 定位完成（3 個非本次測試的 Herdr session 流量進 8787 的來源已解）。結案責任歸屬：污染來源＝Headroom、持續殘留＝cleanup／safe-trial／驗證缺口。
- 日期：2026-08-27～28（回寫）
- 證據指針：`~/.claude/memory/reference_headroom_eval_2026_06_01.md`
- 為什麼可能成題：與 `mechanism-decommission-decay`（觀察中）直接同型——工具退役後殘骸無聲存活的完整案例，且有「safe-trial restore 為何沒清」這個機制層問號。
- slug 候選：`mechanism-decommission-decay`
- 題庫／帳本關係：機制帳本觀察中 `mechanism-decommission-decay`——直接回填該條（本條是它的完整案例）。同事件多份：competitive-analysis 帳本（`feedback_competitive_analysis_check_own_stack_first.md` headroom 列）同步回寫，已合併計一次、兩指針保留。

### B3. Codex 額度「偷調」查證：不成立（範圍受限）
- 活動描述：08-18 實測（窗內 08-28 回寫帳號狀態）——用官方 analytics API 當標尺反解 30 天資料：1 credit ≈ $0.0434、fast 倍率 2.5–2.63x 四方法收斂、外界宣稱的 +100~150% 調價在該帳號「能排除 ≥2%」；本機 `~/.codex/sessions/` token 與官方統計偏差 0.09x–19.5x 且方向會反轉（multi-agent 並行快照重複計），不能當額度計算來源。三個驗不了的邊界明列（token 計數全出自 OpenAI、7/15 前官方資料拿不到）。
- 日期：2026-08-18 實測；08-28 回寫 philip team 帳號停用狀態
- 證據指針：`~/.claude/memory/reference_codex_credit_accounting_2026_08_18.md`
- 為什麼可能成題：「訂閱額度被偷偷縮水」是社群熱議、這次用官方 API 當外部標尺做了個人能做的最嚴謹查證——結論「能排除大幅調價、不能宣稱完全沒動手腳」的邊界意識本身就是內容。
- slug 候選：`codex-credit-accounting-audit`
- 題庫／帳本關係：待 main 語義比對；部落格 factcheck-log 已有 FC 編號（檔內引用 FC-155/156 為 proxy 案；本條查證應查 `docs/philip/factcheck-log.md` 對應條目）。

### B4. CCP-GPT relay 大事件：1M 視窗開放＋帳號世代交替
- 活動描述：08-17 OpenAI 對訂閱帳號打開 1M 視窗（窗內多次回寫：後端硬牆 922,000 直打實測、二分定界表）、08-20 額度新窗初判約 1.33x 耐用（低信心 proxy）、08-28 依使用者指示停用 `philip@akohub.com` team credential（`disabled: true`、憑證保留），現役只剩 personal 帳號——這是離職後帳號基礎設施收尾的一環。08-17 壓縮線 297K→867K 的副作用盤點（compact-guard 接近全休眠、PreCompact 阻擋型的新風險）也在檔內。
- 日期：窗內回寫集中 08-28；事件原發 08-17～08-28
- 證據指針：`~/.claude/memory/project_ccp_gpt_codex_relay_2026_07_14.md`、`~/.claude/memory/project_cliproxyapi_relay.md`
- 為什麼可能成題：離職時怎麼清理個人 AI 基礎設施的帳號依賴（哪些停用、哪些保留、為什麼不刪憑證）是沒人寫過的實務。
- slug 候選：`cliproxy-relay-account-rotation`
- 題庫／帳本關係：與 `cvs-handover`（觀察中，AI 時代的離職交接制度）直接相關——本條是該機制的個人基礎設施面向。

### B5. 免費模型池實測兩連發：CC fallback benchmark＋Groq agentic 死路
- 活動描述：08-28 對免費 fallback 候選跑 hidden code tests＋完整 tool loop——GLM 5.3 保留、Inkling 待整合、MiMo 無可用免費入口；方法論點：分開判 availability／品質、不把 429 當能力差。08-29 Groq free tier 實測：TPM 檢查是單發拒收制（413 非 429），CC 底價 79,836 tokens、pi 底價 29,018 全超 8K TPM——「agentic harness 零可用性」結構性定案，反直覺點是「TPM 是速率限制可重試」的直覺是錯的。
- 日期：2026-08-28、2026-08-29
- 證據指針：`~/.claude/memory/reference_free_cc_fallback_benchmark_2026_08_28.md`、`~/.claude/memory/reference_groq_free_tier_agentic_dead_end_2026_08_29.md`
- 為什麼可能成題：「免費模型能不能跑 agent」的答案不是看 context window 是看 harness 裸底價 vs 速率限制形狀——這個判準很多人不知道。
- slug 候選：`free-tier-agentic-dead-end`
- 題庫／帳本關係：待 main 語義比對；與 relay 帳本（B4）同掛。

### B6. AgentMemory 影子實驗結案：唯一 true write miss 只有一條
- 活動描述：08-27–28 一連串 commit 完成 20-session 端到端記憶影子實驗——原「47.1% write miss」撤回，owner regrade 後 native memory 唯一 true miss 是 fact-009（Headroom config 污染更正沒寫回）；isolated 環境自然 prompt 選 memory path 只 2/5，但正常 stack holdout user-facing 5/5／memory-backed 5/5，未證日常 routing 缺口；deterministic envelope 對唯一 miss 1/1 但 n=1 不升 trial。整套 runtime 未測、不下產品判決。
- 日期：2026-08-27～28
- 證據指針：`~/.claude/memory/reference_agentmemory_eval_2026_05_18.md`（窗內大改）、competitive-analysis 帳本 08-28 列
- 為什麼可能成題：「你的 AI 記憶系統到底漏了多少」用影子實驗量出來，結果是「漏得比想像少得多，且唯一那條漏的恰是 Headroom 翻案」——跟 B2 串成完整故事。
- slug 候選：`memory-shadow-experiment`
- 題庫／帳本關係：待 main 語義比對；與 `codex-claude-memory-bridge`（觀察中，兩套 AI 工具的記憶邊界）可能相鄰，待 main 判斷。

### B7. ccp-gpt 跑 CC Workflow 工具可行性實測：能跑、1.9 倍成本、三個系統性品質弱點
- 活動描述：08-25 rule-review 收集段交 ccp-gpt（gpt-5.6-luna）跑 13 批並行——可行（0 失敗、0 限流），成本約 Claude 1.9 倍（估計），品質三弱點：把規則自身字串當 detector（809/839 灌水）、編造不可重跑的 channel 數字、hook 對照較粗；率一律當上界。對照組汙染教訓：Claude 對照批次 commit 進 repo，12/13 GPT agent 讀了它、149/150 一致率是抄來的。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_ccp_gpt_workflow_feasibility_2026_08_25.md`
- 為什麼可能成題：跨模型分工的實測邊界（便宜模型能做什麼、必須留給 Claude 什麼）＋「對照組污染」是做任何 AI 評測的人都會撞的坑。
- slug 候選：`cross-model-workflow-batch`
- 題庫／帳本關係：待 main 語義比對。

### B8. storm perspective-scout trial 三輪結案：機制沒錯、掛錯地方
- 活動描述：08-25 第三輪結案——同一機制掛 deep-research 9 週 0 跑（母場景兩週沒走），轉掛 brainstorm 當日三場景 2 跑；沉澱教訓「痛點在哪條路出現、機制就掛哪裡」＋「trial 掛低頻工具上要先驗母場景頻率」。實際轉移：perspective-sub-scout 落 brainstorm Step 2a′、commit 882ab90、skill-creator RED→GREEN→REFACTOR 驗證。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_storm_perspective_trial_2026_06_20.md`
- 為什麼可能成題：機制設計的「掛載點選擇」比機制本身重要——9 週零使用 vs 當日兩跑的對照是現成故事。
- slug 候選：`perspective-sub-scout-relay`
- 題庫／帳本關係：待 main 語義比對；與 `trigger-ownership-split`（觀察中）相鄰（都涉及「機制靠什麼被觸發」）。

### B9. huashu-design 同日開案同日 KILL：35 萬 tokens 換三張沒人滿意的板
- 活動描述：08-25 走完 23.5K★ 設計 skill 的完整 trial（Phase 1 澄清→brand-spec→三方向板各 ~115K tokens），使用者看三張「有點弱，不採用」；對照組靜態版一次成稿。判決：不是 skill 品質差，是「工作室流程」與使用者節奏結構性不合；與「設計 skill invoke 0.4%」既有實證一致。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_huashu_design_trial_kill_2026_08_25.md`
- 為什麼可能成題：「熱門 tool 不等於適合你的 workflow」的最乾淨案例——同日開案同日 KILL、成本 35 萬 tokens 有明確數字。
- slug 候選：`huashu-design-kill`
- 題庫／帳本關係：無同名帳本條目；研究型結論原樣保留，不自行升題。

### B10. pilotfish 08-23 重評：42 天後 4 句事實全過期＋新 extract
- 活動描述：對 07-13 評過的 pilotfish 做 v1.4.0 重評——「零 runtime code／6 agent／374★」四句已過期（652★、Plugin beta、SessionStart hook 8.9KB）；判決「整包不裝」仍立，新增 extract ×1 pending-outcome：prompt 密度預算測試形狀→自家 `always-on-size-gate`（痛證據：always-on 90 天 +90%、size gate 0 命中）。
- 日期：2026-08-23
- 證據指針：`~/.claude/memory/reference_pilotfish_eval_2026_07_13.md`、competitive-analysis 帳本 08-23 段
- 為什麼可能成題：「評估結論也有保鮮期」——42 天後同一 repo 四句事實全過期的對帳實錄。
- slug 候選：`eval-verdict-shelf-life`
- 題庫／帳本關係：待 main 語義比對；與 competitive-analysis 帳本記錄格式（三態回寫規則）直接相關。

### B11. unlazy absorb-pack：agent 偷懶／過早完成的 8 篇一手論文證據
- 活動描述：08-25 從 Leonxlnx/unlazy README 吸收 8 篇 arXiv/METR 研究指針（9 個 ID 逐篇核對標題、4 篇 orphan citation 不收）——SlopCodeBench「no agent fully solves any problem end-to-end, best 14.8% checkpoints」、test-time compute 過猶不及、METR time horizon 等逐篇對位自家紀律（silent skip、測試綠 ≠ 改動被覆蓋、effort 校準）。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_agent_completion_research_pointers_2026_08.md`
- 為什麼可能成題：偏文獻整理、非個人事件；對 blog「測試綠 ≠ 改動被覆蓋」主題是一手引用素材（研究型結論原樣回傳，不自行升題）。
- slug 候選：無（素材級）
- 題庫／帳本關係：無；供寫作時引用。

### B12. Discord 撈訊工具鏈採用實測
- 活動描述：08-29 採用 DiscordChatExporter CLI＋Keychain token——評估過 bot+MCP（非管理員不可行）、user-token MCP 常駐（低頻不合算）、chrome 直讀（SPA 不可靠）三路線後選 CLI 匯出；實測 3 天 2,088 則、`--after` 縮窗必要、token 改密碼即重置、ToS 灰區知情選擇。
- 日期：2026-08-29
- 證據指針：`~/.claude/memory/reference_discord_chat_exporter_cli_2026_08_29.md`
- 為什麼可能成題：偏工具紀錄、單獨成題潛力低；「低頻需求不裝常駐、走匯出檔」的取捨原則可併入別題。
- slug 候選：無（素材級）
- 題庫／帳本關係：無；研究型結論原樣保留。

### B13. reverse-skill／Grok Bot reconstruction 兩案記錄即可
- 活動描述：08-25 兩則評估均記錄不引入——reverse-skill 擔心跨模型安全政策反覆觸發（issue #86 有 refusal 案例）；Grok Bot 0.18 reconstruction 判定是公開 binary hybrid 還原非 source leak，client 架構可研究不採用。
- 日期：2026-08-25
- 證據指針：`~/.claude/memory/reference_reverse_skill_deferred_2026_08_25.md`、`~/.claude/memory/reference_grok_bot_reconstruction_eval_2026_08_25.md`
- 為什麼可能成題：「怎麼判斷一個 'source leak' repo 的實際還原層級」有獨立價值；reverse-skill 案偏短紀錄。
- slug 候選：無（研究型結論原樣保留，不自行升題）
- 題庫／帳本關係：無。

---

## C. 個人專案推進類

### C1. claude-pr-review 第三次增量同步＋REPORT_DIR 分岔拍板
- 活動描述：08-23 本體 `a1c9481..e52bada` 增量同步到 OSS（commit 813efd9），08-25 記錄完整 taxonomy——A–G 七類蒸餾取捨（路徑通用化／匿名化／史料剝除／harness 引用剝除／進行中 trial 不出口／平台通用化／forward-fix）＋增量同步 SOP（絕不整檔覆蓋、閉合檢查）＋兩側刻意分岔點（REPORT_DIR 私有版落 `~/.claude/pr-review-reports/`、OSS 留 repo 內，08-23 拍板維持分岔）。
- 日期：同步 08-23、taxonomy 落檔 08-25
- 證據指針：`~/.claude/memory/projects/claude-pr-review/project_oss_sync_taxonomy.md`、`~/.claude/memory/work/project_pr_review_offboarding_handoff.md`
- 為什麼可能成題：把「公司耦合的個人工具開源」做成可重複的 SOP（七類取捨＋增量 patch＋閉合檢查）——與離職交接主線（`cvs-handover`）直接相關。
- slug 候選：`oss-sync-taxonomy`
- 題庫／帳本關係：機制帳本觀察中 `cvs-handover`——本條是「離職後個人資產分流」面向的延續，回填或相鄰待 main 判斷。

### C2. repo-to-bench v0.1.0 review-implement 結案：BLOCKED 狀態的精確語意
- 活動描述：08-28 v0.1.0 完成 Scope＋YAGNI 雙軸 review——Scope 無偏離；Y2–Y5 縮小義務使用者接受結論但未要求修正，狀態記 `BLOCKED` 只表示「縮小義務未套用」不代表 release 失效；明文預防「YAGNI finding 已接受＝現在就要擴大修正」的誤讀。
- 日期：2026-08-28
- 證據指針：`~/.claude/memory/projects/repo-to-bench/review-v0-1-0.md`、`~/.claude/memory/projects/repo-to-bench/_INDEX.md`
- 為什麼可能成題：偏專案狀態紀錄；「review 結論 ≠ 修正義務」的狀態語意設計是薄素材。
- slug 候選：無
- 題庫／帳本關係：無；研究型結論原樣保留。

### C3. sepia 開源寫作工具接入：手動 command＋soft prompt 三 frame 判決
- 活動描述：08-28–29 frame-scoped 三判落地——通用 release prose reviewer 是真缺口（分母：material-first-writing 100 calls、39 篇發布稿）；blog review 獨有成立 1、repo-to-bench 獨有成立 3、README 案撤回「review 0＝無價值」誤判；接入形狀＝submodule 釘版＋`disable-model-invocation` 手動 `/sepia` command＋material-first-writing soft prompt，active trial review 2026-09-04。
- 日期：2026-08-28～29
- 證據指針：`~/.claude/memory/MEMORY.md` competitive-analysis 帳本 sepia 列（08-28–29 回寫）
- 為什麼可能成題：偏工具選型紀錄；與 blog 寫作產線直接相關但單獨成題潛力中低。
- slug 候選：`sepia-writing-review`
- 題庫／帳本關係：無同名帳本條目；blog 帳本相鄰，待 main 語義比對。

### C4. 跨機同步擴及 Codex 設定：nested repo 不是 submodule
- 活動描述：08-23 `~/.codex` 納入跨機同步——設定住 `GGGODLIN/codex-config`、memories 住獨立 nested private repo；不能用 submodule，因 Codex 0.149.0 memory Phase 2 要求 `memories/.git` 是目錄。與 ledger-lifecycle 008 票連動（safe-trial 快照改記 ref 不複製）。
- 日期：2026-08-23
- 證據指針：`~/.claude/memory/general/project_cross_machine_sync.md`
- 為什麼可能成題：偏設定細節；「兩套 AI 工具的設定同步」與 `codex-claude-memory-bridge`（觀察中）相鄰但本條是基礎設施面。
- slug 候選：`codex-config-cross-machine`
- 題庫／帳本關係：機制帳本觀察中 `codex-claude-memory-bridge`——相鄰，是否回填待 main 語義比對。

### C5. 離職收尾帳號面：Codex team credential 停用
- 活動描述：08-28 使用者指示將 relay 內 `philip@akohub.com` Codex team credential 設 `disabled: true`（憑證保留、未驗證上游是否真失效、不得自動重啟用）；`user_akohub_departure` 檔同日回寫此狀態。是 08-18 離職後基礎設施收尾的具體一步。
- 日期：2026-08-28
- 證據指針：`~/.claude/memory/user_akohub_departure_2026_08_18.md`、`~/.claude/memory/project_cliproxyapi_relay.md`
- 為什麼可能成題：與 B4 同事件群、與 `cvs-handover`（觀察中）直接相關——離職交接的憑證面。
- slug 候選：`cvs-handover`
- 題庫／帳本關係：機制帳本觀察中 `cvs-handover`——回填該條（憑證收尾段落）。與 B4 同事件群、已合併計一次、指針保留。

---

## 帳本對照總表（機制帳本 vs 本次命中）

| 帳本條目 | 狀態 | 本次命中 |
|---|---|---|
| `cvs-handover` | 觀察中 | C5（憑證停用）＋C1（資產分流）相關證據 |
| `codex-claude-memory-bridge` | 觀察中 | C4 相鄰（待 main 判斷） |
| `memory-state-ripple` | 觀察中 | A4 直接回填 |
| `mechanism-decommission-decay` | 觀察中 | B2 完整案例直接回填 |
| `trigger-ownership-split` | 觀察中 | B8 相鄰（待 main 判斷） |
| `plain-language-hard-gate` | 觀察中 | A6 直接回填 |
| `single-truth-pointer-tombstone` | 觀察中 | A7 相鄰（待 main 判斷） |
| `claude-config-activity-curve` | 觀察中 | 窗內無新增量測數據（A2 的 rules-size 數字屬舊事件回寫） |
| `rebuttal-calibration` | 已否決 | 未命中——重提條件（finding 發布成預設流程／另有可觀察點＋真實作者回覆）未達成，不提報 |
| 其他已升格／已併入 | — | 未發現窗內新事件需要回填（`measurement-validity-gates` 有 B1 案例材料增補機會，列出供 main 判斷） |

## 備註

- 每條「日期」以窗內實際活動日為準；多檔同事件的 mtime 回寫日不重複計。
- B11／B12／B13 標為素材級：研究型結論已原樣回傳，是否升題由 main 裁決。
- 掃描檔數 81 中，約 30 檔屬批量維護或帳本回寫的既有事件（已在統計段說明，不另立活動）。
