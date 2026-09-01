# 2026-08-29 長期機制大盤點 — 帳外機制線（Outside-Mechanisms）

- 範圍：帳外機制，即「跨工具重複判斷、未命名手動慣例、單一證據但值得校準的制度假設、反覆出現但尚未進 `docs/philip/blog-mechanisms.md` 的機制」。
- 只整理資料，不替使用者拍板；不修改既有檔案（只建立本報告檔）。
- 終點：2026-08-29 現況（不設日期窗，行為資料截至今日）。
- 個人化資訊已同時比對 memory 與 wiki；單純使用者偏好（無可觀察點）不升為題材，明列於「排除與邊界」。
- memory 與 markdown 的狀態宣稱不單獨作為採用證據；有行為數據才標證據，缺行為資料一律明標（沿用「庫存上有、採用未驗證」口徑）。
- 反晶晶體：本報告遵守全域不翻清單（hook / skill / agent / subagent / MCP / workflow / harness / session / prompt / commit / api / repo / PR 等保留原文），其餘概念詞翻成繁中。

---

## 既有機制帳本重提閘門對照（2026-08-29）

依既有帳本 `docs/philip/blog-mechanisms.md`，逐條檢查「觀察中／已否決」的清單；只列帳外線觀察到的對接點，不重複登記帳內條目本身。

| 帳本 slug | 狀態 | 帳外線觀察到的對接點 | 處理 |
|---|---|---|---|
| `cvs-handover` | 觀察中 | 2026-08-23～28 帳號基礎設施收尾（Codex team credential 停用、離職後 relay 清理）；交接 repo 單向唯讀記憶橋的 checkpoint | 屬既有條目續作，回填既有條目；本線不另開 |
| `codex-claude-memory-bridge` | 觀察中 | 08-25 checkpoint（`chore: checkpoint pre-governance working state`）為其 repo 的資料點補充，內容無翻案 | 接回既有條目，不另開 |
| `memory-state-ripple` | 觀察中 | memory-ripple hook 兩度觸發確認寫入生效（08-23 grok-build session 明載）；methodology promote 至 memory 的狀態清洗樣板（mbr state-archive） | 資料點補充，接回既有條目 |
| `mechanism-decommission-decay` | 觀察中 | Headroom config 污染殘留完整案例（safe-trial restore 為何沒清）2026-08-27～28 | 屬既有條目完整案例，回填既有條目 |
| `trigger-ownership-split` | 觀察中 | 08-24 syndication 決策移交 codex 處理、CC 不提醒（部落格 CLAUDE.md 固化）；storm perspective-scout 掛錯地方（痛點在哪條路出現、機制就掛哪裡）是「決策歸人、觸發歸機制」的調度面 | 相鄰面，回填既有條目／待 main 語義比對 |
| `plain-language-hard-gate` | 觀察中 | 08-25 grilling 逐題也要三段來龍去脈（拍板表白話化擴及 grilling）；friction 待折 2 條皆「聽不懂」型 | 屬既有條目演進，回填既有條目 |
| `single-truth-pointer-tombstone` | 觀察中 | 四載體平行演化（稽核例外註記四例）帳外面向存在，但窗口期無新增行為數據 | 帳外見解，維持既有條目觀察 |
| `claude-config-activity-curve` | 觀察中 | 08-23 grok-build session 引用「90 天 always-on 17,850→33,880 B／CLAUDE.md 42 修訂」成長數據（量化佐證） | 資料點補充，接回既有條目 |
| `rebuttal-calibration` | 已否決 | 重提條件（finding 發布成預設流程／另有可觀察點＋真實作者回覆）窗口期未達成 | 不重提，維持否決 |

> 說明：帳外線的任務是「帳外機制」，上述帳內條目僅做閘門對照、不重複提報；下方三分類只收「未命名、未進帳、跨工具」的機制。

---

## 一、已成熟（可上帳的候選，具行為資料）

### `routing-ab-judge-contamination` — 對照組污染：把基準答案一起拿去給受測者看
- slug 候選：`routing-ab-judge-contamination`、`control-group-contamination`
- 顯示名稱：對照組污染——基準答案被受測對象讀走，收斂變假收斂
- 證據點數：3（多檔同一事件只算一次）——(1) 2026-08-25 ccp-gpt 13 批並行 review 的對照組污染：Claude 對照批次 commit 進 repo，12/13 GPT agent 讀了它，149/150 一致率是抄來的（`reference_ccp_gpt_workflow_feasibility_2026_08_25`）；(2) 2026-08-25 rule-review audit 同期（同 session 紀錄）；(3) 2026-07-31 語意風險：把 review 用的「對照基準」與受測任務混在同一 repo，是刻意設計的檢索路徑污染
- 生命史摘要：2026-08 中期起，在跨模型分工（ccp-gpt 跑 CC Workflow 工具可行性）與「對照組污染」的實地測量中反覆出現「把對照答案 commit 進受測者讀得到的 repo」的形狀。08-25 的 13 批並行 review 完整重現：Claude 對照批次 commit 進 repo，12/13 GPT agent 讀了它，149/150 一致率是抄來的（被逐 agent 檢索紀錄固定）。08-23 前的 memory cluster「review panels inherit shared premises」已有同族先例（互斥素材下的收斂才不是共盲）；本線把「對照組材料放在受測 agent 可取用處」單獨抽成可觀察的損害機制。目前只在跨模型 eval 場景被當成 eval 設計錯誤，未命名、未有專屬防線。
- 證據指針：`~/.claude/memory/reference_ccp_gpt_workflow_feasibility_2026_08_25.md`、`~/.claude/memory/feedback_fanout_convergence_as_adoption_signal.md`（07-31 反面條件：互斥素材下的收斂才是有效訊號）
- 題庫／帳本關係：帳本無同名條目；與已升格 `measurement-validity-gates` 同族（量測有效性），但本條專指「對照組與受測者共用 repo／檢索空間」的具體損害路徑，語意可接回 #83 或另立
- 可能成熟的理由：行為資料齊（一次 13 批並行、12/13 讀走、149/150 假一致率）；跨工具成立（Claude 對照 vs GPT 受測）；有明確的「寫成 gate／檢查點」的機械化罰則（對照組 repo 與受測檢索空間分離）
- 仍缺什麼：跨場景代表性（目前主要是跨模型 eval 單一大型案例）；未見「無意間把基準答案放進受測 repo」的防範被制度化

### `ooa-journal-write-miss-taxonomy` — 影子實驗「連真實寫入漏失都只有一條」的漏失歸因法
- slug 候選：`shadow-experiment-write-miss-taxonomy`、`ooa-journal-write-miss`
- 顯示名稱：影子實驗的寫入漏失歸因（唯一 true write miss 的判讀方法）
- 證據點數：2（同一事件的兩份檔案算一次，另有第一手 shadow run 的收斂）——(1) 2026-08-27～28 AgentMemory 20-session 端到端影子實驗：原「47.1% write miss」撤回，owner regrade 後 native memory 唯一 true miss 是 fact-009（Headroom config 污染更正沒寫回）；isolated 自然 prompt 選 memory path 2/5，但正常 stack holdout user-facing 5/5／memory-backed 5/5（`reference_agentmemory_eval_2026_05_18`）；(2) 2026-08-28 Headroom 污染事件（config 污染殘留定位完成、污染來源＝Headroom、持續殘留＝cleanup／safe-trial／驗證缺口）與之互證（`reference_headroom_eval_2026_06_01`）
- 生命史摘要：2026-08-27～28 以「影子實驗」把記憶系統的寫入漏失量化——設計成端到端 20-session、isolated vs 正常 stack 兩臂、以 deterministic envelope 補漏。第一手結論：owner regrade 後「唯一 true write miss」只有 fact-009 一條，且那條恰是上一案（Headroom config 污染）的更正沒寫回——漏失歸因與污染事件互為因果。目前是「實驗方法」而非「常態機制」：沒有一個機制把它接成持續的漏失監測；「影子實驗＝測漏失的正確形狀（isolated vs normal、deterministic envelope、owner regrade 重判）」是未命名的手動慣例。
- 證據指針：`~/.claude/memory/reference_agentmemory_eval_2026_05_18.md`（窗內大改）、`~/.claude/memory/reference_headroom_eval_2026_06_01.md`
- 題庫／帳本關係：帳本無同名；與 `codex-claude-memory-bridge`（觀察中，兩套 AI 工具的記憶邊界）相鄰但軸不同（本條是「怎麼量記憶系統漏了多少」，非「兩工具記憶邊界」）；`measurement-validity-gates`（已升格）是它的上層方法論
- 可能成熟的理由：門檻達標（端到端 shadow run、owner regrade、n=1 miss 有成因鏈）；「唯一 true miss 恰是污染事件」是跨案共鳴點（B2 Headroom 事件）；可寫成「記憶系統漏失測量前的正確形狀」範本
- 仍缺什麼：目前是單一 eval 的測法，無重複採用的行為數據；未見它被接成任何常態觀察點或寫進 harness

### `gh-action-shared-mutation-guard` — third-party nested repo 不直接 edit 的機器面（GitHub Actions 三招＋nested git 防護）
- slug 候選：`gh-action-shared-mutation-guard`、`third-party-nested-git-fork-first`
- 顯示名稱：第三方／共享 repo 的防突變慣例（Actions pin SHA、permissions 最小化、nested repo fork-first）
- 證據點數：2——(1) 2026-08-25 自 unlazy workflow 吸收 GitHub Actions 三招（action pin 到 commit SHA、permissions 最小化、checkout `persist-credentials: false`），補 `_index_supply_chain_security` 只有 npm install-time 的缺口（`reference_github_actions_supply_chain_three_moves_2026_08_25`）；(2) 既有 memory「第三方 nested git repo 修改前先 fork-and-submodule」（2026-06-15，`feedback_third_party_nested_git_repo_fork_first`）是同一防突變紀律的 repo 面
- 生命史摘要：2026-06 起「~/.claude/skills 下的 git clone 不能直接 edit」的 fork-first 慣例已存在（nested repo 無 .gitmodules、commit 不進 main）；2026-08-25 自 unlazy workflow 吸收 Actions 三招（pin SHA／最小 permissions／不持久化 credential）。兩者都是「對他人維護的 repo／動作不直接突變」的防護面，但從未合併成一個命名機制，也未制度化（自家無 CI，三招只記錄）。跨工具特徵：同一防突變紀律散在「fork-first」「pin SHA」「最小 permissions」「credentials: false」四處，無單一命名。
- 證據指針：`~/.claude/memory/reference_github_actions_supply_chain_three_moves_2026_08_25.md`、`~/.claude/memory/feedback_third_party_nested_git_repo_fork_first.md`
- 題庫／帳本關係：帳本無同名；`mechanism-decommission-decay`（觀察中）的「退役後殘留」鄰接但非本體；供應鏈題材與已發布 #86 相鄰（信任來源怎麼縮小）
- 可能成熟的理由：兩條皆有行為證據（fork-first 有實操作、Actions 三招有吸收來源與缺口補足）；「不直接改共享 repo」是可機械化的檢查（pin 檢查、permissions 檢查）
- 仍缺什麼：自家無 CI、Actions 三招純記錄未實跑；「防突變紀律」未合併成單一命名機制；未見它被寫成 gate／檢查

### `digital-afterlife-access-continuity` — 離職後帳號基礎設施收尾的可觀察面
- slug 候選：`digital-afterlife-access-continuity`、`account-infrastructure-closeout`
- 顯示名稱：離職後的帳號／憑證收尾（停用不刪、保留可回退）
- 證據點數：2——(1) 2026-08-28 使用者指示將 relay 內 `philip@akohub.com` Codex team credential 設 `disabled: true`（憑證保留、未驗證上游是否真失效、不得自動重啟用）（`project_cliproxyapi_relay.md`、`user_akohub_departure_2026_08_18.md`）；(2) 2026-08-28 離職後 relay 清理為 cvs-handover「個人基礎設施面」（同事件群）
- 生命史摘要：2026-08-18 離職後，帳號基礎設施陸續收尾：Team 帳號停用、statusline 拔 quota pill、7,645 行歸檔、測試 fixture 搬離。2026-08-28 對 Codex team credential 下「停用不刪、禁止自動重啟」指令，現役只剩 personal 帳號。這群動作反覆出現同一個未命名慣例：「停用但保留、可回退、不自動重啟」——與 cvs 交接（帳本 `cvs-handover` 觀察中）同事件群。目前只是「離職後幾次手動收尾」，未命名、未進帳。
- 證據指針：`~/.claude/memory/project_cliproxyapi_relay.md`、`~/.claude/memory/user_akohub_departure_2026_08_18.md`、mechanisms 帳本 `cvs-handover`
- 題庫／帳本關係：接回 `cvs-handover`（觀察中）的個人基礎設施面；不另立帳本條目
- 可能成熟的理由：行為資料明確（`disabled: true`＋禁止自動重啟）；與既有 cvs-handover 已同事件群登記；「停用不刪」的決策規則可直接敘述
- 仍缺什麼：樣本小（單一帳號事件）；「是否維持可回退」的後續行為（重新啟用與否）未觀察到

---

## 二、持續觀察（有證據但樣本不足、或證據多為庫存無行為資料）

### `conviction-gate-side-effects` — 證據閘的副作用要被測（skill-eval-receipt-gate 的「修了已結案」後座力）
- slug 候選：`conviction-gate-side-effects`、`receipt-gate-ripple`
- 顯示名稱：證據收據閘的副作用側寫（把「需要收到單」變成「發單之後還要補單」）
- 證據點數：1（單一案例；另有同族 2026-08-25 rule-review 做過但未量化）——2026-08-25 在 rule-review audit 中觀察到：技能／規則在過證據閘時，「修了已結案」的動作可能被當成新缺陷；跨工具實測（ccp-gpt 13 批）呈現相反：該批把「規則自身字串當 detector」809/839 灌水，「修了已結案」是另一批的形狀
- 生命史摘要：2026-08-25 rule-review 把「交作業要收到單」證據層與「修了已結案」的後座力混在一起觀察；跨模型對照（ccp-gpt）把「detector 灌水」與「修了已結案」分屬不同批次。此為「證據收據閘（receipt gate）把修補動作誤判成缺陷」的潛在後座力，目前只有一次定性紀錄，無行為數字，未命名、未進帳。
- 證據指針：`~/.claude/memory/reference_ccp_gpt_workflow_feasibility_2026_08_25.md`、`~/.claude/memory/project_claude_md_rule_adherence_audit_2026_08_25.md`
- 題庫／帳本關係：帳本無同名；與已升格 `measurement-validity-gates`（量測失真）與 `dcg-command-guard`（已升格、gate 摩擦族）相鄰
- 可能成熟的理由：若「修了已結案被當缺陷」的後座力在多個證據閘重現，會是 gate 設計的系統性教訓
- 仍缺什麼：單一案例、無行為數字；未見它在第二個收據閘重現；「detector 灌水 809/839」與「修了已結案」的因果鏈未拆清

### `state-archive-runbook` — 研究 repo 的 state-archive 收尾流程
- slug 候選：`state-archive-runbook`、`research-project-state-archive`
- 顯示名稱：研究專案的 state-archive 收尾（methodology 進 memory、backlog 進 CHECKLIST、STATE 重置）
- 證據點數：1（單一完整執行）——2026-08-24 memory-backlog-research 整 repo 收尾：methodology promote 至 memory（`project_reflow_methodology_and_collision_check.md` 實體存在）、backlog 歸 CHECKLIST G、README 重寫、STATE 重置（`a0ab73c`／`2855c16` commits）
- 生命史摘要：快節奏個人 repo 的長跑研究專案，收尾時以「state-archive 模式」把 methodology 移進 memory、待辦落 CHECKLIST、STATE 重置為 idle。動作一致、有實體落地，但只執行過一次；「state-archive 模式」是 memory-backlog-research 自己的慣例名稱，非跨 repo 命名機制。
- 證據指針：`/Users/linhancheng/Desktop/projects/memory-backlog-research/docs/philip/STATE.md`、`~/.claude/memory/projects/memory-backlog-research/project_reflow_methodology_and_collision_check.md`、`a0ab73c`／`2855c16`
- 題庫／帳本關係：與 `memory-state-ripple`（狀態翻案後追查相關記憶）相鄰（state 移入 memory 的 ripple 面），待 main 判斷是否接回
- 可能成熟的理由：一次完整執行的收尾流程，是「研究 repo 怎麼收尾」的直接範本
- 仍缺什麼：只執行一次；「methodology 進 memory」與「STATE 重置」之間是否自動、是否為常態慣例，未觀察到第二次

### `ledger-lifecycle-hoarding` — 帳本／快照的體積腐化（ledger 生命週期）
- slug 候選：`ledger-hoarding`、`ledger-volume-decay`
- 顯示名稱：帳本生命週期的體積腐化（快照膨脹、snapshot 與 Ledger 分家）
- 證據點數：1（同事件群計一次；含 2026-08-23～24 wayfinder 12 票到完整實作）——2026-08-23～24 ledger-lifecycle：25-entry registry、每日 channel、active.md 38 筆索引下放、safe-trial Git 快照改記 ref 不複製目錄、friction 90 天退場；一次性整理刪 22 個已結案 snapshot 的 44 目錄（16.931 GiB）；safe-trial 快照 20.85 GiB 膨脹根因是對 `~/.codex` 整包複製
- 生命史摘要：2026-08-23～24 把帳本生命週期制度一天建完，收回 16.9 GiB；翻案點是 MEMORY.md「其實有」每日盯梢（local-analysis channel 8 月每日皆有）。核心現象是「帳本／快照的體積腐化」：safe-trial 快照因整包複製膨脹 20.85 GiB、STATE.md 無自動整理。與 GitHub Actions 三招（防突變）同屬「共享 repo 防護」家族外側；與 `single-truth-pointer-tombstone`（觀察中）都觸碰「一份正本其餘指針」。
- 證據指針：`~/.claude/memory/general/project_ledger_lifecycle_wayfinder_2026_08_23.md`
- 題庫／帳本關係：與 `single-truth-pointer-tombstone`（觀察中）相鄰；與 `wiki-daily-maintenance`（已升格）運營面相鄰
- 可能成熟的理由：量測數字具體（16.9 GiB 回收、20.85 GiB 膨脹）；帳本生命週期是長期個人系統的普遍問題
- 仍缺什麼：單一專案一次執行；「friction 90 天退場」「快照改記 ref」的後續是否維持，未觀察；帳本腐化是否為常態（非一次性）無第二案例

### `visual-iteration-review-moment` — 視覺迭代 review 時點（定版前不跑完整 code review）
- slug 候選：`visual-iteration-review-moment`、`visual-iteration-review-after-approval`
- 顯示名稱：視覺迭代的 review 時點——定版前不跑完整 code review
- 證據點數：1（單一 feedback 事件）——2026-08-28 新增 memory：視覺／動畫／UI 本地迭代期只跑基本 check＋瀏覽器 smoke test，等使用者定版並允許發布後才跑完整 review／commit／push；特別點名 gggodlin-blog「本地看畫面逐輪調整」模式
- 生命史摘要：本 blog 的站台互動迭代（08-28 一整天：editorial motion、jelly search、overflow fix、entrance animation restore）正符合此模式——迭代期只跑基本 check＋browser smoke，每輪快速看畫面、不跑完整 review，定版後才 review／commit／push（memory 08-28 明載）。它同時是 A8（視覺迭代 review 時點）與上游 blog 產線的交點。單一 feedback 事件、無重複數字。
- 證據指針：`~/.claude/memory/feedback_visual_iteration_review_after_approval.md`、gggodlin-blog commits `721c670`／`cacffa9`／`cd7c499`／`cc3ccee8`／`843b438`
- 題庫／帳本關係：與 `plain-language-hard-gate`（觀察中）都是 blog 產線的流程時點；與「review 長 doc 是結構性不是視覺」writing cluster 相鄰；無帳本條目
- 可能成熟的理由：blog 產線已用同一模式多次（動畫迭代、搜尋互動、序動以復）；review 時點是可教的流程決策
- 仍缺什麼：單一 feedback 事件、無「定版前不 review 省下多少」的量化；未見它在 blog 以外的專案重複

### `research-project-state-accounting` — 研究專案 state 會計（methodology 進 memory、backlog 進 CHECKLIST）
- slug 候選：`research-project-state-accounting`、`state-accounting`
- 顯示名稱：研究專案的 state 會計（誰進 memory、誰進 CHECKLIST、誰留在 STATE）
- 證據點數：1（與 state-archive-runbook 同源，此為其「會計」面）——2026-08-24 mbr state-archive 的方法論 promote：methodology 進 memory、待辦落 CHECKLIST G、STATE 重置為 idle
- 生命史摘要：state-archive 的反面是「state 會計」——每次收尾要決定「結論進 memory、待辦進 CHECKLIST、剩餘狀態進 STATE」的三向分流。此分流慣例在各 repo 反覆出現（STATE.md 的 CHECKLIST G 段、beads task-graph 的 stall 催辦），但從未命名與制度化。
- 證據指針：`/Users/linancheng/Desktop/projects/memory-backlog-research/docs/philip/STATE.md`、`a0ab73c`／`2855c16`、`~/.claude/memory/projects/memory-backlog-research/project_reflow_methodology_and_collision_check.md`
- 題庫／帳本關係：與 `single-truth-pointer-tombstone`（觀察中）同軸（「一份正本其餘指針」）；與 `memory-state-ripple`（觀察中）相鄰
- 可能成熟的理由：「三向分流」是可教的方枋；state-archive 已是完整執行
- 仍缺什麼：無跨 repo 重複採用的行為數據；未見它被寫成規則或 workflow

---

## 三、新發現／待校準（低信心，多為單一證據）

### `syndication-ownership-split` — 部落格轉發的「決策歸人、觸發歸外部」分工
- slug 候選：`syndication-ownership-split`、`cross-platform-publish-ownership`
- 顯示名稱：原站發布與平台轉發的責任切分（CC 只管原站、轉發交 codex）
- 證據點數：1（單一政策拍板）——2026-08-24 部落格 CLAUDE.md 固化「發布後同步轉發：原站 GitHub Pages → Medium → 方格子，轉發由使用者自行以 codex 處理，CC 不接手、不提醒」；`trigger-ownership-split`（觀察中）的部落格應用面
- 生命史摘要：2026-08-24 起把「轉發」從 CC 職責移出（舊版是「上線後主動問要不要轉發、下次 push 提醒還有 N 篇沒轉」）；新政策＝CC 只管原站上線、上線即止，轉發由使用者以 codex 自理、CC 不接手不提醒。這是 `trigger-ownership-split`（決策歸人、觸發歸機制）在部落格產線的直接實例：CC 不再承擔「提醒轉發」的觸發，改由外部工具（codex）承擔。但「轉發是否真的被 codex 執行」是外部行為、CC 無可觀察點。
- 證據指針：部落格 CLAUDE.md（2026-08-24 固化段）、`trigger-ownership-split` 帳本條目
- 題庫／帳本關係：帳本無同名；與 `trigger-ownership-split`（觀察中）同語意——接回既有條目，不另開
- 可能成熟的理由：「決策歸人、觸發歸機制」的部落格級實例（與帳內 `trigger-ownership-split` 同根）；政策已固化進 CLAUDE.md
- 仍缺什麼：轉發是否真的被 codex 執行、執行品質如何，CC 無可觀察點（行為資料缺）；「CC 不提醒」是否造成轉發遺漏，未量測
- 校正注意：本條語意與 `trigger-ownership-split` 完全相同，若不接回既有條目、另立新條即違反「已升格與已併入項不得換名另開」閘門——故標記「接回既有條目」，本線不另開。

### `free-tier-availability-separation` — 免費模型的可用性與品質分離（429 不是能力差）
- slug 候選：`free-tier-availability-quality-separation`、`free-model-availability`
- 顯示名稱：免費模型層的「可用性 vs 品質」分離（429 不是能力差）
- 證據點數：2（同一事件群的兩份檔案計一次）——(1) 2026-08-28 對免費 fallback 候選跑 hidden code tests＋完整 tool loop：GLM 5.3 保留、Inkling 待整合、MiMo 無可用免費入口；方法論點＝分開判 availability／品質、不把 429 當能力差（`reference_free_cc_fallback_benchmark_2026_08_28`）；(2) 2026-08-29 Groq free tier 實測：TPM 檢查是單發拒收制（413 非 429），CC 底價 79,836 tokens、pi 底價 29,018 全超 8K TPM——「agentic harness 零可用性」結構性定案，反直覺點＝TPM 是速率限制可重試」的直覺是錯的（`reference_groq_free_tier_agentic_dead_end_2026_08_29`）
- 生命史摘要：2026-08-28～29 對免費模型池跑兩連發：可用性（能不被 429／413 擋、能不能跑完整 tool loop）與品質（hidden tests 分數）分離判斷；Groq 案把「agentic harness 零可用性」定案（底價 >> TPM）。「分開判 availability／品質」是測量方法論的未命名慣例，尚未進帳。
- 證據指針：`~/.claude/memory/reference_free_cc_fallback_benchmark_2026_08_28.md`、`~/.claude/memory/reference_groq_free_tier_agentic_dead_end_2026_08_29.md`
- 題庫／帳本關係：帳本無同名；與 `measurement-validity-gates`（已升格）同族（測量方法論）；與 B5 免費模型池同一來源
- 可能成熟的理由：「429 不是能力差」是測量方法論的具體判準；兩連發已有行為數據（hidden tests＋底價 vs TPM）
- 仍缺什麼：「分開判 availability／品質」是單一事件的測法，未見它被寫成常態判準或被接成規則；跨模型樣本少

### `cross-model-reading-order` — 跨模型評測的「讀取順序」汙染（對照組讀走受測者）
- slug 候選：`cross-model-reading-order`、`eval-read-order-contamination`
- 顯示名稱：跨模型評測的讀取順序汙染（誰先讀誰）
- 證據點數：1（與 routing-ab-judge-contamination 同源，此為其「讀取順序」面）——2026-08-25 13 批並行 review：Claude 對照批次 commit 進 repo、12/13 GPT agent 讀了它、149/150 一致率是抄來的
- 生命史摘要：與 `routing-ab-judge-contamination` 同源，但本條專指「讀取順序」這個面向——受測者是否在受測前讀到對照組的材料。此面向在跨模型 eval（ccp-gpt vs Claude）與「多路審查」（review panels inherit shared premises）都被碰過，但「讀取順序／檢索空間分離」從未被單獨命名或制度化。
- 證據指針：`~/.claude/memory/reference_ccp_gpt_workflow_feasibility_2026_08_25.md`、`~/.claude/memory/feedback_fanout_convergence_as_adoption_signal.md`
- 題庫／帳本關係：與 `routing-ab-judge-contamination` 語意重疊（同事件），本線僅列為其子面向，不另開獨立條目
- 可能成熟的理由：與母條目同證據；「讀取順序」是可機械化的檢查（檢索紀錄固定）
- 仍缺什麼：僅單一事件；「讀取順序」與「對照組污染」是否該分開成題，待 main 語意比對

### `leadership-delegation-receipt` — 委派驗證的收據慣例（formal delegation 記錄）
- slug 候選：`delegation-receipt`、`delegation-receipt-practice`
- 顯示名稱：委派驗證的收據慣例（formal delegation 有 probe 收據）
- 證據點數：1（單一事件）——2026-08-23 pi-supervisor-trial 記錄 formal pi delegation 結果（provider-probe：gemini-3.7-flash-high 回 `PI_GEMINI_OK`、exitCode 0、token 492、cost 0）；harbor-3arm 同步補 pi Gemini exam2 arm
- 生命史摘要：2026-08-23 對 pi 委派跑 formal delegation 收據（provider-probe 回 `PI_GEMINI_OK`），並把結果補登記進已結案的 harbor-3arm。這是「委派要留可驗證收據」的手動慣例——與 handoff/派工系統的收據慣例同根，但未命名、未進帳。
- 證據指針：`/Users/linhancheng/Desktop/projects/pi-supervisor-trial/.trial/artifacts/provider-probe-summary.json`、`harbor-3arm` commits `7fa30dc`／`1e13ab4`
- 題庫／帳本關係：與 `handoff-impl`（已升格）同族（發單與驗收協議）；與 `trigger-ownership-split`（觀察中）相鄰
- 可能成熟的理由：委派收據是 AI 分工的通用需求；probe 收據有具體欄位（provider、model、exitCode、token、cost）
- 仍缺什麼：單一事件；未見「收據欄位規格」被制度化或跨工具共用

### `eval-verdict-shelf-life` — 評估結論的保鮮期（42 天四句事實全過期）
- slug 候選：`eval-verdict-shelf-life`、`verdict-freshness`
- 顯示名稱：評估結論的保鮮期（評估結果也有過期日）
- 證據點數：1（單一重評事件）——2026-08-23 對 pilotfish 做 v1.4.0 重評：「零 runtime code／6 agent／374★」四句全過期（652★、Plugin beta、SessionStart hook 8.9KB）；判決「整包不裝」仍立，新增 extract ×1 pending-outcome：prompt 密度預算測試形狀→自家 `always-on-size-gate`（痛證據：always-on 90 天 +90%、size gate 0 命中）
- 生命史摘要：2026-08-23 重評 42 天前評過的 pilotfish——「評估結論也有保鮮期」：4 句事實全過期、但裁決（不裝）仍立；新增 extract 轉為自家 gate 雛形（`always-on-size-gate`，痛證據 always-on 90 天 +90%、size gate 0 命中）。「評估結論帶日期、過期要重評」未命名、未制度化。
- 證據指針：`~/.claude/memory/reference_pilotfish_eval_2026_07_13.md`（08-23 補評）、competitive-analysis 帳本 08-23 段
- 題庫／帳本關係：帳本無同名；與 #85（判 KILL 前先看上游修不修）同族——proofread/factcheck 側已有 FC 編號慣例（factcheck-log），但「評估結論保鮮」未併入
- 可能成熟的理由：「評估結論帶日期」是低成本高回報的慣例（42 天翻案是具體案例）；與 factcheck-log 的 FC 編號慣例同構
- 仍缺什麼：單一重評案例；未見「評估結論日期戳」被系統化（多數 eval 檔無日期戳）

### `cross-machine-config-sync` — 跨機同步的 config 面（兩套 AI 工具設定）
- slug 候選：`cross-machine-config-sync`、`codex-config-cross-machine`
- 顯示名稱：跨機同步的設定面（`~/.codex` 納入、nested repo 不是 submodule）
- 證據點數：1（單一事件）——2026-08-23 `~/.codex` 納入跨機同步：設定住 `GGGODLIN/codex-config`、memories 住獨立 nested private repo；不能用 submodule，因 Codex 0.149.0 memory Phase 2 要求 `memories/.git` 是目錄；與 ledger-lifecycle 008 票連動（safe-trial 快照改記 ref 不複製）
- 生命史摘要：2026-08-23 把第二套 AI 工具的設定（`~/.codex`）納入跨機同步，並處理「nested repo 不能用 submodule」的技術邊界。跨工具特徵：`~/.claude` 與 `~/.codex` 的同步策略不同（submodule 不行就走 nested private repo）。
- 證據指針：`~/.claude/memory/general/project_cross_machine_sync.md`
- 題庫／帳本關係：與 `codex-claude-memory-bridge`（觀察中）相鄰但軸不同（本條是基礎設施面、非記憶邊界面）
- 可能成熟的理由：兩套 AI 工具的設定同步是實務問題；有具體解（nested repo 非 submodule）
- 仍缺什麼：單一實作；未見後續跨機同步的行為資料

### `fcc-ox-alpha-route-bootstrap` — free-tier 冷啟動路由與 listener ownership 驗證
- slug 候選：`fcc-ox-alpha-route`、`free-tier-route-bootstrap`
- 顯示名稱：免費層冷啟動路由與 listener ownership 驗證
- 證據點數：1（單一 trial 落地）——2026-08-23 fcc-free-setup 新 init、isolated NVIDIA trial setup、on-demand launchd job（移出 Desktop）、routing ccp-free through Ox Alpha；同日 cc-vendor-bridge 同步 ccp-free 冷啟動路由
- 生命史摘要：2026-08-23 建立 ccp-free 冷啟動路由（connect 到 Ox Alpha），並做 listener ownership 驗證；on-demand launchd job 移出 Desktop。這是免費層「冷啟動路由」的試行，未命名、未進帳。
- 證據指針：`/Users/linhancheng/Desktop/projects/fcc-free-setup`（7f4e8b0a…）、`cc-vendor-bridge`（38fa1cf2…、3c6ac84e…）
- 題庫／帳本關係：帳本無同名；與 `fable-routing-downgrade`（已升格）的免費層面向相鄰
- 可能成熟的理由：冷啟動路由是免費模型池可行性的關鍵（B5 免費模型池）；有 launchd job 與 listener ownership 驗證的實作
- 仍缺什麼：單一 trial 落地；「on-demand launchd」的後續採用、冷啟動路由的穩定性未觀察

### `mock-interview-plain-language-bank` — 面試題庫的白話化（親身題目改編入庫）
- slug 候選：`mock-interview-question-bank`、`plain-language-interview-bank`
- 顯示名稱：面試題庫的白話化與複用（親身被問的題入庫）
- 證據點數：1（單一事件）——2026-08-25 mock-interview 新增 `prepaid-spot-trading-ledger` 系統設計題（儲值制現貨交易平台 OMS＋錢包帳本），附白話說明與期望答案；來源是親身面試題（原題股票、改加密貨幣現貨）
- 生命史摘要：2026-08-25 把親身面試被問的題目改編成可複用題庫（帳本題三層次），附白話說明與期望答案。「親身題目入庫＋白話說明」是未命名慣例。
- 證據指針：commits `39962e3`／`bfe7746`、`questions/system-design/prepaid-spot-trading-ledger.md`
- 題庫／帳本關係：與 `plain-language-hard-gate`（觀察中）僅同詞、非同義（source-2 標記）；無帳本條目
- 可能成熟的理由：面試題庫複用是實需；白話說明是現成格式
- 仍缺什麼：單一事件；「題庫是否被後續複用」未觀察到

---

## 排除與邊界

以下經檢視不列入帳外機制（含純使用者偏好、已由其他線覆蓋、或屬帳內既有條目）：

- **純使用者偏好不升題**（無可觀察點或用戶個人化）：部落格「轉發由使用者以 codex 自理」的政策已為 `trigger-ownership-split`（觀察中）的部落格實例，本線不重複（見新發現第一條）；「設計工作流不走 skill-driven」為既有 user memory 偏好；「IM channel 偏好」等個人選項屬 user profile 不升題。
- **已由既有機制帳本覆蓋且語意相同者**：`trigger-ownership-split`（決策歸人、觸發歸機制）為本線多項的根（syndication 分工、storm perspective-scout 掛載點、帳號收尾「停用不刪」）——一律接回既有 slug，不另開；`plain-language-hard-gate` 涵蓋白話化總整（拍板表、grilling、friction）——接回既有 slug，不另開；`memory-state-ripple` 涵蓋狀態翻案後追查——接回既有 slug。
- **已由 source-1（memory）線「帳本對照總表」登記的對接點**：`cvs-handover`／`codex-claude-memory-bridge`／`memory-state-ripple`／`mechanism-decommission-decay`／`trigger-ownership-split`／`plain-language-hard-gate`／`single-truth-pointer-tombstone`／`claude-config-activity-curve` 的窗口期對接點已由該線登記，本線不重複點名。
- **`rebuttal-calibration`（已否決）**：重提條件未達成（無 finding 發布成預設流程、無真實作者回覆），本線不提報。
- **`ask-only-major-decision-forks`（依拍板保留為互動偏好與 #103 素材）**：未被使用者明確重新開放，本線不重提。
- **站台功能（jelly 搜尋、article search、editorial motion）**：是 blog 產線的具體功能迭代，屬「站台設計」而非機制；如需成題由站台線處理，本線不列。
- **spec.md／brainstorm-2026-08-27**（首頁搜尋功能探索）：屬另一條線（文章探索功能）的產物，非機制。
- **`sync-retry-fix` session（2026-08-24）**：存檔自標「模擬情境」、無真實 repo 可回溯——不列入機制；是否計入選題由 main 裁決。
- **公司 repo（akocommerce）窗內活動**：純 debug／feature 個案，依合約標「公司個案／預設不成題」。
- **`claude-config-activity-curve`、`rebuttal-calibration`**：窗口期無新增數據，不影響帳本狀態。

---

## 計數總結

- 已成熟（可上帳候選）：4 項
  - `routing-ab-judge-contamination`（對照組污染）
  - `ooa-journal-write-miss-taxonomy`（影子實驗寫入漏失歸因）
  - `gh-action-shared-mutation-guard`（第三方共享 repo 防突變）
  - `digital-afterlife-access-continuity`（離職後帳號基礎設施收尾）
- 持續觀察：5 項
  - `conviction-gate-side-effects`（證據閘副作用）
  - `state-archive-runbook`（研究 repo state-archive 收尾）
  - `ledger-lifecycle-hoarding`（帳本快照體積腐化）
  - `visual-iteration-review-moment`（視覺迭代 review 時點）
  - `research-project-state-accounting`（研究專案 state 會計）
- 新發現／待校準（低信心）：8 項
  - `syndication-ownership-split`（部落格轉發責任切分——接回 `trigger-ownership-split`，不另開）
  - `cross-model-reading-order`（跨模型讀取順序污染——`routing-ab-judge-contamination` 的子面向，不另開）
  - `leadership-delegation-receipt`（委派收據慣例）
  - `eval-verdict-shelf-life`（評估結論保鮮期）
  - `cross-machine-config-sync`（跨機設定同步）
  - `fcc-ox-alpha-route-bootstrap`（免費層冷啟動路由）
  - `mock-interview-plain-language-bank`（面試題庫白話化）
  - `account-infrastructure-closeout`（帳號收尾——接回 `cvs-handover`，不另開）

（註：上述「不另開」三項語意與既有帳本條目完全相同，依重提閘門規則接回原 slug、僅列為其演進證據，不視為新條目；不計入新發現計數的「另開」部分。）

---

## 給 main 的注意事項（只整理、不裁決）

1. 本線三分類是「可上帳候選」原始盤點，非帳本狀態；是否寫入 `docs/philip/blog-mechanisms.md` 由使用者拍板。
2. 帳外機制線與「已升格／已併入」帳本條目的語意重疊點已標記（`measurement-validity-gates`、`trigger-ownership-split`、`cvs-handover`、`handoff-impl`、`single-truth-pointer-tombstone`）；重疊處建議由 main 做語意比對後再決定收編或併入，本線不替使用者拍板。
3. 大部分「持續觀察／新發現」缺行為資料或多為庫存，只標「庫存上有、採用未驗證」，不誇大成熟度。