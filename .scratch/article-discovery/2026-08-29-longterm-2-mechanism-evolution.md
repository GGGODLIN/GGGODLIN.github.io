# 長期機制大盤點：hook／skill／workflow 演化線（2026-08-29）

- 盤點模式：blog-topic-scan 模式 B 四線之一（hook／skill／workflow 演化），不設日期窗，以 2026-08-29 現況為終點
- 資料來源：`~/.claude/skills/INVENTORY.md`、相關 memory cluster（`_index_hook_experiment_discipline` 等）、`~/.claude` git 歷史（845 commits）、`~/Desktop/projects/.claude/trials/active.md`＋`archived.index.md`、題庫 v5（`blog-candidates-v5-2026-08-23.md`）、機制帳本（`docs/philip/blog-mechanisms.md`）、settings.json hooks 註冊現況、hooks/ 目錄存量普查
- 只整理與判斷資料，不替使用者拍板；不修改任何既有檔案
- 證據點計數：同一事件在 memory 與 git 重複記載只算一次

## 帳本比對與重提閘門（先決）

- **已否決 `rebuttal-calibration`**：重提條件＝「審查 finding 的發布動作成為預設流程（或另建可觀察點），且出現第一批真實作者回覆樣本」。本窗檢查：2026-08-20 `a177692` 的「enforce global report publishing」是把 pr-review 報告發布到全域稽核側，不是把 finding 貼到 PR 留言給作者；真實作者回覆樣本仍為 0（2026-07-30 第三輪 6 PR 留言全 0 之後無反例）。**重提條件未達，未提報。**
- **觀察中 8 項**：`cvs-handover`、`codex-claude-memory-bridge`、`trigger-ownership-split`、`single-truth-pointer-tombstone` 本窗無新證據，維持觀察中、未另行提報；`memory-state-ripple`、`plain-language-hard-gate`、`mechanism-decommission-decay`、`claude-config-activity-curve` 有本窗新證據，以下沿用原固定 slug 補證據，不換名另開。
- **已升格 16 項**：全部照原 slug 對齊，不重開；本窗新增證據如下，只補證據不改狀態：`rule-escalation-ladder`（#105）多了三連升階案例（見「已成熟」附註與「持續觀察」closeout-lifecycle）；`trial-review-lifecycle`（#106）多了 skill-eval-receipt／contract-test 兩閘 09-02 review 排程；`dcg-command-guard`（#93）有 dcg-0-11 trial KEEP（2026-08-23 已入題庫 #106 補強，不重複計）。

---

## 一、已成熟（4 項）

### 1. `t1-claim-detect-gate-iteration` — 宣告偵測判官三代演化：regex → LLM cascade → 純 code gate
- **證據點數**：6
- **生命史摘要**：同一偵測目標（「宣告沒附證據」的語境偵測）走完三代——2026-06-17 以 regex 版 dry-run 起案；06-22 regex KILL（7 天 11 hit、真陽 0、假陽 100%，語境概念 regex 結構性抓不到）；轉 T1 LLM cascade（本地 Qwen 8B → Groq），v5d 語感判官假陽 ~95%（07-06 KILL）；07-10 v7 zero-tool gate（G0 code gate 三層＋窄 prompt）雙軸零假陽零假陰、升 production；07-11 第二輪 fire 1.16／天、真陽 71%；07-17 全量親驗 28 天 trace 2,079 筆、organic fire 6 筆 jsonl 逐筆對帳（4 真／1 邊界／1 假陽）；08-05 再硬化合取閘。控制點從「LLM 判官」遷到「code gate 預篩＋窄判官」，是「LLM hook 判官可靠度」教訓的原型案例。
- **證據指針**：archived.index.md `claim-detect-hook-宣告無驗證偵測`（06-22 KILL）、`t1-claim-detect-llm-cascade-觀察期`（07-06）、`t1-claim-detect-v7-zero-tool-gate`（07-10/07-11 兩輪 KEEP）；`~/.claude` commits `0ea661a`（06-17）、`bffafed`（08-05）；v4 題庫 #117 素材（FC-079 全量親驗段）；memory `feedback_regex_cannot_detect_context_concepts`
- **題庫／帳本關係**：#117「判官生死」已把 T1 全演化史收為骨幹素材（v4 行 151）；#105（已升格）把「提醒→硬攔截階梯」的 T1 案例收走；帳本無此 slug，正確去向是既有題，不另開
- **可能成熟的理由**：三代結構性轉型、每代都有行為數據（假陽率／真陽率／jsonl 對帳），production 兩個月後仍以 code gate 形態存活；「regex 抓不到語境概念、判官要窄化、code gate 收緊後 LLM 全蓋章就砍層」三條教訓都已有跨機制複現
- **仍缺什麼**：無（題材已被 #117／#105 收走）；建議動作＝維持併入 #117、#105 素材，不新立題

### 2. `model-routing-mechanical-gate` — 派工模型路由：LLM judge 規格 → 純機械閘 → routed-* 定義檔釘死
- **證據點數**：5
- **生命史摘要**：06-21 T2-routing-gate 建立（原 5-9 小時 LLM judge 規格被質疑後改 30 分鐘純機械 escape-token gate）；06-29 KEEP 升 production（純機械 ~60ms／0 network，當 runtime guard＋audit baseline）；07-26 routed-* agents（model+effort 釘死）＋ sentinel gate；07-30 實測「fork 已從 CC 移除 9 天、白名單還寫著」＝白名單死碼案例；08 月 routed-agent-enforce trial 35 天 baseline 626 筆 KEEP 四 KPI，實戰四天 640 次派工擋 2 次。控制點從規則文字 → 機械閘 → 定義檔釘死 → 白名單閘門，每一層都有攔截或死碼證據。
- **證據指針**：`~/.claude` commits `425d6d4`（06-21）、`5e7fe7c`（07-26）；archived.index.md `t2-routing-gate`（06-29 KEEP）；memory `feedback_escape_token_gate_for_unreliable_judge`、`feedback_allowlist_capability_smoke_test_2026_07_30`；題庫 v5 #125（routed-agent-enforce 素材）
- **題庫／帳本關係**：#59（已成文第二十六篇 model-routing，2026-08-08 發布）＋#125 候選（白話已含「四天 640 次派工、擋下 2 次」）；帳本 `fable-routing-downgrade` 已升格（同事件線，不得另開）
- **可能成熟的理由**：五個時間點連續演化、每層有數字；已成文一篇、姊妹題 #125 已在活題池
- **仍缺什麼**：#125 已知限制：KPI 1 無自然樣本只靠 fixture、品質／成本增益未量；建議動作＝併入 #125，不另開

### 3. `skill-inventory-governance` — 第三方 skill 的來源、描述品質與退役治理線
- **證據點數**：6
- **生命史摘要**：05-13 建 INVENTORY baseline（49 個 global skill 一次性 provenance audit）→ 06-20 加 Audit 三值欄＋對接 daily-local `skill-desc-quality` channel（trial 11 天 13→0 fail 閉環、使用者 33 次 Read 真改 description）→ 07-28 fork provenance frontmatter 慣例（`upstream`／`upstream-pinned`，本窗實掃 18 個 skill 已帶欄位）→ 08-18 skill-evidence 檢討拍板殺兩 skill（ai-image-gen、game-hacking-techniques：90 天零 invoke、證據訊號 0/4 與 1/4）→ 08-25~28 SkillEvaluator guarded trial＋ Stop gate＋regression nudge（接受條件約束）。治理強度從「庫存盤點」長到「描述品質每日掃描」再到「回歸考卷收據閘」。
- **證據指針**：`~/.claude` commits `b1c47e1`（08-26 figma gate 非本項）、`46595f7`（08-28 SkillEvaluator trial）、`53c8e19`（08-25 acceptance constraints）；archived.index.md `t3-skill-desc-quality-daily-batch-health-check`（06-30 KEEP）；INVENTORY.md 全檔（Audit 欄、fork provenance 段、兩筆刪除線 row）；`~/.claude/skills/*/SKILL.md` frontmatter 18 檔
- **題庫／帳本關係**：撞 #106「獎工具很容易、結案才是工作」（工具生命週期框）；無獨立候選
- **可能成熟的理由**：六個時間點連續治理、有真實移除行為（兩 skill 刪除）、desc-audit 閉環有數字（13→0）、fork 來源追蹤已成常態慣例
- **仍缺什麼**：SkillEvaluator verdict（trial 09-04 review）；`skill-upstream-check-weekly` 的採用／命中率未量；建議動作＝合併重框進 #106 補強（庫存與來源治理是 #106 試用制度的下游），或視使用者意向另立「skill 庫存治理」題

### 4. `daily-topic-workflow-variants` — 同一 digest workflow 的變體管理（canonical → lean → minimal → vendor）
- **證據點數**：4
- **生命史摘要**：08-10 lean 變體升為預設、canonical 更名 full；08-19 minimal 變體（砍 FactCheck／Verify B／external-feeds、2 lens digest audit）＋ precheck；08-22 precheck 硬化；08-27 vendor 變體版；08-28 agent skills 納入 digest workflows＋theme contract 對齊修正。成本對照已有：minimal 省 53%（8 agent）換來五天五輪加固——「便宜版本的隱藏帳單」。
- **證據指針**：`~/.claude` commits `9195f1e`（08-10）、`e7e5b9d`（08-22）、`2b501db`（08-27）、`d4dac6e`（08-28）；題庫 v5 #118 🔧 補強（08-23，minimal 省 53% 數字）
- **題庫／帳本關係**：#118 已把變體成本收為 🔧 補強；skill descriptions（daily-topic-analysis 三變體）各自記載
- **可能成熟的理由**：變體管理已成制度（版本命名、precheck、vendor 隔離 chrome code），成本數字已進題庫
- **仍缺什麼**：minimal 變體長期穩定性追蹤（五輪加固後是否再漂移）；建議動作＝併入 #118（已完成），不另開

---

## 二、持續觀察（7 項）

### 5. `memory-state-ripple` — 狀態翻案後追查相關記憶（帳本既存，維持觀察中）
- **證據點數**：本輪新增 3（帳本既有 6 點不重算）
- **生命史摘要**：帳本已記第一輪到第五輪（07-05 起、雙判官、fake-green 根因等）。本窗新增：08-23 v3 Gemini-sync 重構（砍 Qwen／prewrite／deliver／reconcile 四條路、改單步同步 gemini-3.7-flash-high 12 秒單次、tests 165→100）；08-26 c068-async-answer-judge 共用同一 `memory-ripple-runtime.py`（48 行改動）；08-29 判官換 groq-qwen-3.8-27b，踩兩坑（secure_dir O_NOFOLLOW 對含 symlink 段路徑誤判 unsafe_directory、audit_result 靜默吞錯；test 斷言 jq 對 JSONL 多行檔 `.[0]` 不加 `-s` 是 indexing object、靜默 exit 5）。
- **證據指針**：`~/.claude` commits `c39a216`（08-23）、`4e983bd`（08-26）；friction `workflow-general.md` 08-29 段；trials active `memory-ripple hook`（review 2026-08-30）
- **題庫／帳本關係**：帳本 `memory-state-ripple` 觀察中（最後檢查 2026-08-23）；題庫 #32（可能合併方向）
- **可能成熟的理由**：第五輪修接線後 08-23 review 進行中，若 verdict 落檔且一週自然樣本過關，即達帳本升級條件原樣；判官 runtime 已被第二個 hook 共用＝基建成熟訊號
- **仍缺什麼**：08-23 review verdict 未落檔（review 日期 08-30 明天）；召回率母體從未算出；升級條件＝第五輪 verdict＋自然樣本

### 6. `plain-language-hard-gate` — 「聽得懂」升成硬閘的三維度演化（帳本既存，維持觀察中）
- **證據點數**：本輪新增 2
- **生命史摘要**：帳本已記白話簡介雙軌、外部淺白語言抽 4 組手法、zhtw 支語 gate 等。本窗新增：concise output style A/B 收場——08-24 已按帳本「切回 Explanatory 再觀察三天」，08-28 移除 Concise 輸出樣式（`a11dbf6`，刪 20 行、settings 改回），A 組白話請求 4.4% vs B 組前測 1.6% 的實驗正式結束；wait-what shape-first 分身整併——trial 結案、`/wait-wait-plus` 分身刪除、shape-first bullet 併入本體（`6a8f24e`），INVENTORY 記 60 天 334 次手動白話請求、retry 率 ~8%。
- **證據指針**：`~/.claude` commits `a11dbf6`（08-28）、`6a8f24e`、`10a3968`（08-24 切回 Explanatory）；INVENTORY wait-what row；trials `concise-output-style-a-b`
- **題庫／帳本關係**：帳本 `plain-language-hard-gate` 觀察中（最後檢查 2026-08-23）；#105 同形狀不同料
- **可能成熟的理由**：A/B 有正式收場而非懸置；wait-what 334 次實證需求
- **仍缺什麼**：帳本缺口未動——「採用率數字對不上帳」（親打「白話一點」0 場 vs /wait-what 54 場、批次評測污染、CLAUDE.md 自我污染）仍待重算；升級條件未達

### 7. `mechanism-decommission-decay` — 常駐機制的無聲死亡（帳本既存，維持觀察中；普查首跑）
- **證據點數**：本輪新增 2
- **生命史摘要**：帳本已記六病例＋對策正例。本窗補上帳本明列的「目前缺口＝沒有存量普查」之首跑：hooks/ 目錄 101 支非測試腳本，其中 13 支未在 settings.json 註冊；至少 4 檔疑似殘留或被取代——`claim-detect.sh`（06-17 regex 版，已被 T1-claim-detect-local-first 取代，全 repo 零非測試引用）、`mutation-testing-nudge.sh`（控制點已搬 pre-push 軟閘，nudge 檔殘留）、`write-needs-read.sh`（無任何註冊與引用，疑似死庫存）、`projects-tripwire.sh`（未註冊為 CC hook、有 log 殘留，可能由其他 harness 入口驅動，待對帳）。對照正例：08-23 semble-docs shadow route 拆 503 行後無同類殘留。
- **證據指針**：本盤點普查輸出（settings.json hooks 註冊 dump vs hooks/ 檔案清單）；`~/.claude` commits `152f1f4`（08-23 拆線正例）
- **題庫／帳本關係**：帳本 `mechanism-decommission-decay` 觀察中；題庫無（#106 管試用期結案、本項管畢業後腐爛）
- **可能成熟的理由**：帳本升級條件＝「跑一次全量活性普查，若翻出更多裝死案例即成題」——本輪普查已翻出 ≥3 個疑似殘留，方向命中
- **仍缺什麼**：普查只做到「註冊面」，未逐檔算「最後命中日」（行為面）；4 檔殘留中有 2 檔（write-needs-read、projects-tripwire）未確認死因；升級條件＝補計算全部常駐機制的最後命中日後重判

### 8. `claude-config-activity-curve` — 設定 repo 活動曲線（帳本既存，維持觀察中，低信心）
- **證據點數**：本輪新增 1
- **生命史摘要**：帳本已記 08-16 月 commit 數（4 月 31 → 8 月半個月 200）與 08-23 數字（HEAD 377／--all 417、日均 16.4）。本窗更新：至 08-29，8 月 HEAD 593（--all 672）、含 08-26 單日批次 30+ commits；日均約 20.4 vs 7 月 4.1（約 5 倍）；08-23→08-29 六天再 +216。活動加速趨勢確認，口徑疑慮（批次拆細、sync 習慣）未解。
- **證據指針**：`git -C ~/.claude log --format='%ad' --date=format:'%Y-%m'`（HEAD）與 `--all` 兩種口徑計數（本盤點實算）
- **題庫／帳本關係**：帳本 `claude-config-activity-curve` 觀察中（低信心統計項，非機制）；題庫無
- **可能成熟的理由**：趨勢連續三輪一致加速（200→377→593）
- **仍缺什麼**：計數口徑未驗、只是統計不是機制；升級條件＝驗過口徑後仍成立且接得上「AI 工作台演化速度」敘事

### 9. `self-verify-receipt-contract-line` — 自我驗證從散文自律到收據閘與契約測試閘（新候選）
- **證據點數**：6
- **生命史摘要**：07-06 skill-self-verify 三 skill 對照 KEEP（SKILL.md 內置 verify 指令採用率 100%）→ 08-06 skill-eval-receipt-gate（fail-closed Stop hook、收據從 eval-runs 檔案系統重算、不信 LLM 自報；waiver 兩層防連續誤擋）→ 08-26 contract-test-preflight-gate（PreToolUse 提示型）＋contract-test-receipt-gate（Stop fail-closed）＋共用 helper／runner（issue 06／07 驅動、664+ 行閘＋803 行測試）→ 08-26 c068-async-answer-judge（667 行 py＋348 行測試，非同步 LLM 判官＋共用 memory-ripple-runtime）→ 08-22~27 agent-contract-gate 家族（validator＋PreToolUse Bash 註冊＋parsing 硬化；33/33 fixture 綠、真環境 8 個必擋情境全放行＝#122 已收案例，修好後擋住修自己的 commit 掛 28 分鐘）→ 08-28 SkillEvaluator trial gate 上 Stop。共同形狀：threat model＋surface table＋bypass table 全部寫在檔頭（gate-authoring SSOT 套用）、收據一律從檔案系統重算、防漂移提示閘明列「不承諾完整語意」。
- **證據指針**：`~/.claude` commits `fb70134`（08-06）、`98e5733`＋`db8c2eb`（08-26，含 issues/06、07）、`4e983bd`（08-26 issues/08）、`c8d7fb6`＋`57bd420`＋`017a1f8`（08-22~27）、`c29c8ca`（08-22 擋自己案例）；archived.index.md `skill-self-verify-三-skill-對照`；題庫 v4 #105 補強段（收據閘引用）與 v5 #122 補強（agent-contract 案例已收）
- **題庫／帳本關係**：#121「契約測試是單一正本機制的測試面」（帳本 `single-truth-pointer-tombstone` 題庫關係明指）＋#105 收據閘補充（已升格，案例已併）；`verify-task` workflow 同族不同面
- **可能成熟的理由**：同一教訓（「全綠≠被覆蓋」「收據重算不信自報」）在 4 個 gate 重複落地，且每個都帶 threat model＋bypass table 契約；08-06→08-28 三週內從單閘長成家族
- **仍缺什麼**：全部閘都還在 trial 中（contract-test 兩閘 09-02、c068 09-09、task-verifier enforcement 08-29）；無任何結案行為數據（攔截數／誤擋數）；answer-judge 尚無真命中樣本；v3 Gemini-sync 的 12 秒同步判官延遲影響未量。升級條件＝至少一個閘結案 KEEP 且帶真實攔截數字，再評估併入 #105／#121 或重框成「AI 自我檢查的收據化」獨立題

### 10. `workflow-observability` — workflow 可觀察性：OBSERVABILITY contract 到 observer 收據（新候選）
- **證據點數**：5
- **生命史摘要**：07-23 workflow-hardening 加 metadata-only `OBSERVABILITY` contract（所有 dynamic Workflow 強制）→ 07-12 workflow-monitor-threshold-90 KEEP（90% 觸發、95% 以上未破百）→ 07-24 bruce-workflow-monitor presumptive thresholds KILL（26 天未用）→ 08-17 dead metric 案（healthPercent 釘 0、「低＝壞」gate 恆觸發，規則抽成 memory）→ 08-22 workflow-observer（enqueue launch receipt＋deliver 比較，`8013506`）＋trial（review 08-29）。演化方向：「後台跑完才知道」→ 「執行前強制掛觀察契約」→ 「發射與交付都有收據可比對」。
- **證據指針**：archived.index.md `workflow-monitor-threshold-90`、`bruce-workflow-monitor-presumptive-thresholds`；`~/.claude` commits `8013506`（08-22）、`fae8923`／`9b77804`（07-23）；memory `feedback_dead_metric_pins_low_is_bad_gate`、`_index_workflow_resume_internals`
- **題庫／帳本關係**：無直接候選；#113 subagent-boot-cost 只沾邊；帳本無此 slug
- **可能成熟的理由**：死的死、活的活，每階段都有 verdict 或數字；observer 是 07-23 contract 的執行面落地
- **仍缺什麼**：observer trial review 08-29 未落檔；OBSERVABILITY contract 遵循率從未量（只有「加了」的歷程）；升級條件＝observer verdict＋遵循率抽測

### 11. `closeout-lifecycle` — 收尾紀律從提醒到硬閘的兩條收尾線（personal closeout + git closeout）（新候選）
- **證據點數**：5
- **生命史摘要**：08-16 closeout hooks observe mode＋direct repo reminder＋synchronized policies（`2a4a1de`／`542dfd6`／`e8ba326`）→ 08-17 personal-main-closeout v1 被三個獨立審核角色判死（84% AMBIGUOUS、每次 Bash 約 6 秒稅、兩階段 ledger 用 0 次；總量 7,687 行）→ v2 968 行（約 1/8）拆線重建（`a52b6ef` 等）→ 08-25 blocking Git closeout hook（`ca269f0`）＋ SessionStart worktree nudge（`d016a78`）＋ progress-keyed Stop gate 釋放（`80f6282`：從無差別擋結案改成依進度鍵釋放、block reason sanitize）→ 08-28 git closeout command（`8a9bb96`）＋從 SessionStart 提醒連動（`f9b2331`）＋ python invoke 修正（`1549641`）。階梯：observe → remind → block → command＋startup 連動，12 天內完成三級。
- **證據指針**：題庫 v5 #133 重框素材段（v1 3,733 行 test、三個行為模式）；`~/.claude` commits `ca269f0`、`d016a78`、`80f6282`、`8a9bb96`、`f9b2331`、`1549641`、`a52b6ef`；trials active `personal-main-closeout-v3`（review 09-01）；memory `feedback_personal_projects_direct_main_default`
- **題庫／帳本關係**：#133「GPT-5.6 Sol 沒做錯，卻做了 7,700 行我不需要的東西」同源事件（v5 已收重框素材）；帳本無此 slug
- **可能成熟的理由**：v1 判死→v2 瘦身有完整驗屍數字（7,687→968 行）；git closeout 三級升階都是同月行為；progress-keyed Stop gate 是「硬閘不誤擋」的設計回應
- **仍缺什麼**：blocking gate 的攔截數／誤擋數／被繞次數全未量；v3 review 09-01 未落檔；升級條件＝closeout v3 verdict＋blocking gate 至少一輪行為數據；建議動作＝先當 #133 素材、觀察 v3，不另開

---

## 三、新發現／待校準（5 項，皆低信心）

### 12. `recall-before-answer-hook` — 「先查再答」紀律從規則長成 UserPromptSubmit hook
- **證據點數**：3（低信心：trial 未結）
- **生命史摘要**：查事實紀律（research-before-answer skill＋fact-check 13 條）→ 08-26 `9e0ebcf` persist recall and interview prompts→ UserPromptSubmit 掛 `recall-before-answer.sh`＋trial（review 09-02）。演化動機屬「規則→機制」階梯的又一例，但觸發面是使用者輸入掃描。
- **證據指針**：settings.json UserPromptSubmit 註冊；`~/.claude` commits `9e0ebcf`；trials active `recall-before-answer-hook`
- **題庫／帳本關係**：無；可能併入 #105 階梯案例
- **可能成熟的理由**：規則面已有長期實證（research-before-answer 是自寫並持續校準的 skill）
- **仍缺什麼**：hook 觸發率／誤觸率零數據；trial 未結
- **四種處置**：有潛力（等 trial verdict 再判）／搞錯了／已成熟／併入既有項

### 13. `semble-scope-gate-governance` — code search 的治理閘（registry＋consent test）
- **證據點數**：1（很低信心：單日、零行為數據）
- **生命史摘要**：2026-08-29 同日三 commit：`636334c` governed Semble search routing、`78b4cb8` refine governance、`430c8c7` bounded validation 記錄＋`test_semble_scope_gate_consent.py`；`semble-scope-gate.py`＋`semble-scope-registry.json` 存在。屬 code-exploration 治理的資格面（哪些 repo 可以搜、同意測試），第一天就帶測試。
- **證據指針**：`~/.claude` commits `636334c`／`78b4cb8`／`430c8c7`（皆 2026-08-29）；hooks/semble-scope-gate.py、semble-scope-registry.json
- **題庫／帳本關係**：無；semble 本體在 `_index_code_exploration_mcp`（雙 KEEP）
- **可能成熟的理由**：第一天就上契約測試（consent test 存在）
- **仍缺什麼**：機制行為零樣本；是否 live 註冊未確認（settings.json 未見直接註冊，可能由 wrapper 呼叫）
- **四種處置**：有潛力（需一輪真實使用樣本）／搞錯了／已成熟／併入既有項（可併 `_index_code_exploration_mcp` 家族口徑）

### 14. `codex-policy-drift-nudge` — Codex policy fallback 漂移偵測
- **證據點數**：2（低信心：trial 今天到期）
- **生命史摘要**：08-22 `8b6cf46` nudge when Codex policy fallback drifts from its sources→ trial `codex-policy-drift-nudge`（review 2026-08-29 今天）。監控 Codex 端 policy 快照與來源漂移，屬跨工具治理的探針。
- **證據指針**：`~/.claude` commits `8b6cf46`；trials active `codex-policy-drift-nudge`
- **題庫／帳本關係**：無；與 `codex-claude-memory-bridge`（帳本觀察中）不同面（policy 漂移 vs 記憶邊界）
- **可能成熟的理由**：有對應 trial 制度在追
- **仍缺什麼**：trial verdict 今天到期未落檔；真實漂移命中樣本
- **四種處置**：有潛力（等今天 verdict）／搞錯了／已成熟／併入既有項

### 15. `ledger-lifecycle-governance` — 跨 repo STATE 帳本生命週期制度（registry＋validate/migrate）
- **證據點數**：3（中低信心）
- **生命史摘要**：08-24 `4cdd949` ledger lifecycle management：`registry.json`（門檻正本）＋`ledger-index.py`／`migrate-active.py`／`validate-registry.py`＋各 contract test；SessionStart 掛 `ledger-bootstrap.sh`；08-28 前後 `init-project-docs`／`ledger-ignore` command 補指針；blog-topic-scan SKILL.md 已引用「帳本生命週期：規則見 `ledger-lifecycle.md`、門檻以 registry.json 為準」。屬「帳本本身也要有生命週期」的元機制。
- **證據指針**：`~/.claude` commits `4cdd949`；`~/.claude/references/ledger-lifecycle.md`；`~/.claude/scripts/ledger-lifecycle/`；blog-topic-scan SKILL.md 檔頭
- **題庫／帳本關係**：無直接；與帳本機制家族（blog-mechanisms 的「帳本」字義）同源但管 STATE.md 層
- **可能成熟的理由**：正本＋驗證＋測試三件套齊全，已有兩個 command 對接
- **仍缺什麼**：各 repo 實際採用數未量（registry 裡幾本 STATE）；bootstrap 每日觸發但無命中統計
- **四種處置**：有潛力／搞錯了／已成熟／併入既有項（可併 #106 trial 制度的帳本面）

### 16. `figma-context-budget-gate` — Figma 上下文物件管理規則 → skill → 強制 hook
- **證據點數**：2（低信心：trial 未結）
- **生命史摘要**：figma-context-budget skill（既有）→ 08-26 `b1c47e1` require Figma context budget：PreToolUse 掛 `mcp__figma*` matcher＋PostToolUse Skill matcher 雙點；trial `figma-budget-gate`（review 09-02）。規則→skill→hook 的升階完整走一遍，4 天前的機制。
- **證據指針**：`~/.claude` commits `b1c47e1`；trials active `figma-budget-gate`
- **題庫／帳本關係**：無；是 #105 階梯的又一現役案例
- **可能成熟的理由**：升階路徑完整（規則→skill→gate）、雙 matcher 設計
- **仍缺什麼**：零行為數據；trial 未結
- **四種處置**：併入既有項（#105 案例）／有潛力／搞錯了／已成熟

---

## 附錄

### 帳本觀察中項本輪無新證據（未提報，維持原狀）
- `cvs-handover`（離職已於 08-18 完成、接手結果未知）、`codex-claude-memory-bridge`（量測管道未建）、`trigger-ownership-split`（#94 切分未想清）、`single-truth-pointer-tombstone`——四項本盤點線內未見新事件，維持觀察中原條件。

### 已否決項檢查
- `rebuttal-calibration`：重提條件未達（見檔首閘門段），未提報。

### 已升格項本輪新證據一覽（只補證據、不換名另開）
- `rule-escalation-ladder`（#105）：本窗新增三連升階案例——figma gate 規則→hook（08-26）、git closeout 三級升階（08-16→08-28，見第 11 項）、contract-test 收據閘家族（08-06→08-26，見第 9 項）；控制點遷移維度再添「command → blocking hook」一例。
- `trial-review-lifecycle`（#106）：skill-eval-receipt／contract-test 兩閘排入 09-02 review、c068 排 09-09（trials active），結案語彙持續擴充。
- `dcg-command-guard`（#93）：dcg-0-11 trial KEEP（08-23 已入題庫補強，未重複計點）。

### 反晶晶體自查
- 本檔 hooks／skills／workflows／trial／verdict／gate／receipt／Stop / PreToolUse／UserPromptSubmit／contract / registry 等用字均在「不翻清單」或 Claude Code 生態術語範圍；其餘抽象詞（演化、生命史、收據、殘留、控制點、閘門、判官、階梯）皆已中文化。