# Source 6：STATE 與 probe 掃描報告（2026-08-23 ~ 2026-08-29）

- 掃描窗：2026-08-23 00:00:00 至 2026-08-29 當下（起訖皆含）
- 掃描範圍：`~/Desktop/projects/` 與 `~/Desktop/work/` 下各專案 `docs/philip/STATE.md`，以及窗內更新的 probe／驗收結果檔
- 角色：資料整理，不做候選裁決，不修改既有檔案（只建立本報告檔）

---

## 窗內活動清單

### 1. 部落格站台互動層迭代（Jelly 搜尋＋editorial motion）＋三篇文章發布

- **活動描述**：gggodlin-blog 窗內密集發布：3 篇文章（`ai-report trust`、`Sol overimplementation`、`proxy warmup cost`、`GPT review tunnel vision` 共 4 篇，見 commit 清單），佐以站台本體功能迭代——首頁 editorial motion、文章入場動畫復原、Jelly 搜尋互動、窄手機畫布修正，並一次 Pages 部署 retry 後 success。STATE 自述「無 active work」，next_action 為下一篇選題（轉發由使用者以 codex 自理，CC 不接手）。
- **日期**：2026-08-23 00:54（`63e940f`）至 2026-08-28 16:42（STATE 更新）
- **證據指針**：
  - STATE：`/Users/linhancheng/Desktop/projects/gggodlin-blog/docs/philip/STATE.md`（last_session 2026-08-28）
  - commits（`git log --since=2026-08-23 --until=2026-08-30`）：`63e940f` feat: publish AI report trust article；`bd8af78` docs: promote STATE decisions to CLAUDE.md（syndication 政策、設計／部署決策落 CLAUDE.md）；`23f1b6e` feat: publish Sol overimplementation article；`317d1b6` feat: publish proxy warmup cost article；`c57d86c` feat: publish GPT review tunnel vision article；`721c670` feat: add article search and tag filters；`cacffa9` feat: add subtle site animations；`31050a8` chore: retry pages deployment；`cd7c499` feat: add editorial homepage motion；`2765167` fix: restore article entrance animation；`cc3ccee` feat: add jelly search interactions；`843b438` fix: prevent jelly overflow on narrow screens（Pages run 33155977439 success，STATE 宣稱、有 run id 但 run log 未存檔，未獨立抓取 run 內容）
  - 文章素材檔：`posts/*-MATERIAL.md`（sol-overimplementation、proxy-warmup-cost、gpt-review-tunnel-vision、ai-report-two-lies 等）
- **為什麼可能成題**：部落格以「一個人把 Claude Code 工作流玩到極致」的多主題長尾模式，窗內同時有「功能發布節奏」與「文章發布」雙軌，可當個人站台經營／發布節奏的案例。
- **slug 候選**：`personal-blog-shipping-cadence`（待 main 語義比對既有題庫）
- **題庫／帳本關係**：`docs/philip/blog-candidates-v5-2026-08-23.md` 存在（窗內新增版本）；本來源與 blog 選題庫語義重疊，待 main 比對未重複即接回。此為 blog 自身產線，非機制帳本清單成員。

### 2. mbr 專案「Model–Harness 共同演化體系 v1」state-archive 收尾

- **活動描述**：memory-backlog-research 2026-07-26 驗收的 coevolution 體系 v1 於窗內正式 state-archive：方法論 promotion 到 `~/.claude/memory/projects/memory-backlog-research/project_reflow_methodology_and_collision_check.md`（實體存在，25 Aug 13:36）、待辦落 CHECKLIST G 段、STATE 重置為 idle。一次 checkpoint 在 08-25 帶「pre-governance working state」字樣（窗內多 repo 同步發生，見第 9 條）。
- **日期**：2026-08-24（archive commits）～ 2026-08-25（checkpoint）
- **證據指針**：
  - STATE：`/Users/linhancheng/Desktop/projects/memory-backlog-research/docs/philip/STATE.md`（last_session 2026-08-24，自述 idle）
  - commits：`a0ab73c` chore: commit final STATE before archive reset（+36/-4 行）；`2855c16` docs: state-archive — promote methodology to memory, backlog to CHECKLIST G, rewrite stale README, reset STATE；`77eeab9` chore: checkpoint pre-governance working state
  - 落地檔：`~/.claude/memory/projects/memory-backlog-research/project_reflow_methodology_and_collision_check.md`（2.5k，存在）
  - 附帶更新：`CHECKLIST-deepresearch.md`（08-24 22:17）、`README.md`（08-24 window）改寫
- **為什麼可能成題**：一個長跑研究專案的「state-archive」流程——methodology 進 memory、backlog 進 CHECKLIST、STATE 重置——本身就是「工作記憶收尾」的方法論素材。
- **slug 候選**：`research-project-state-archive-runbook`
- **題庫／帳本關係**：屬「memory ／機制」題材，待 main 於題庫語義比對。非機制帳本清單既有成員。

### 3. repo-to-bench v0.1.0 公開發布（harbor-3arm 衍生，整段 window 內）

- **活動描述**：harbor-3arm 的 PR-bench 公開化專案（`repo-to-bench`）於窗內從零長成並發布：Tier 2 架構 review（10 findings，9 大改動全採納、1 CI 取捨由使用者拍板）、YAGNI review（82/82 全審，judge 降 6 項、授權決策交使用者，採 MIT＋外部 Apache-2.0 Harbor 相依）、review-implement 全軸跑完，最後以 `bffe2a6` 發布 v0.1.0 並通過 release verification（fresh clone＋isolated HOME＋無 private repo 洩漏，Python 3.11/3.13 分軌驗證）。
- **日期**：2026-08-23 至 2026-08-28（release verification 檔 2026-08-28；github Actions run 33144285266）
- **證據指針**：
  - STATE：harbor-3arm STATE 為 08-17 結案（窗外），窗內活動全在 `.scratch/harbor-pr-bench-public/` 與新 repo `repo-to-bench/`
  - `.scratch/harbor-pr-bench-public/spec.md`＋`2026-08-27-harbor-pr-bench-public-review.md`（Tier 2）、`2026-08-27-harbor-pr-bench-public-yagni-review.md`（82/82）、`review-implement.md`（run 1，base_sha 4b825dc6 空樹、head_sha 90d2999，fable-5 邏輯模型、gpt-5.6-sol resolve）、`2026-08-28-release-verification.md`（PASS，`bffe2a67226e9edf2547abdebde68c1341789228`）
  - repo commits：`repo-to-bench` 窗內 08-28 一連串 feat（`e44c0c3` 隔離 CI home、`a00411a` 加固 Harbor task 驗證、`0aeb6fb6` 更名 repo-to-bench 等）
  - CI：https://github.com/GGGODLIN/repo-to-bench/actions/runs/33144285266（PASS，Python 3.9/3.11/3.14＋harbor-e2e 全綠）
- **為什麼可能成題**：把一個 private 研究專案的正當子集「煉」成可公開 repo 的完整流程——安全邊界（公有 repo 不得依賴 private repo、wrapper-first 模糊承諾的收斂）、雙 reviewer 架構（Gemini+judge）、YAGNI 降載、release 前 fresh-clone 驗證——是「私有→公開程式碼發布」的完整 case study。
- **slug 候選**：`privatizing-a-public-codebase`（待 main 比對）
- **題庫／帳本關係**：非機制帳本清單成員；未見對應既有機制條目，待 main 語義比對題庫。

### 4. ccp-free 免費層路由建立與迭代（free-tier 電力供應）

- **活動描述**：窗內 `cc-vendor-bridge` 大量 free-tier 路由工作：08-23 建 ccp-free cold-start route、route ccp-free 到 Ox Alpha、驗證 listener ownership；08-25 解鎖 Skill(claude-api)（CC 2.1.243 漸進載入）；08-27 起 ccp-gpt 快速路由 Opus→Sol；08-28 新增 ccp-free→CLIProxyAPI glm-free（經 cline2api）、Sol main＋free(max) failover 混合 tier wrapper、context window 360K→480K。配套 `fcc-free-setup` 專案（08-23 初始化，FCC 安裝＋localhost smoke，pin upstream commit＋SHA-256）與 cliproxyapi-setup 的 FreeLLMAPI 增量分析。
- **日期**：2026-08-23 至 2026-08-29
- **證據指針**：
  - `cc-vendor-bridge` commits：`38fa1cf`（ccp-free cold-start）、`f89e635`、`3c6ac84`（Ox Alpha）、`50e0be1`、`f1ce8f2`（Skill unblock，~19k tokens measured）、`b3fd501`／`ab4c74b`／`de642f1`（ccp-gpt Sol）、`41f8d1b`（glm-free via cline2api）、`b9a2b14`（mixed-tier wrapper，+56 行）、`c8d2b66`（480K）
  - `fcc-free-setup` commits：`29991bd`、`7f4e8b0`、`1f9ab55`、`2c2c4ca5`、`3881d9c`（FCC job 註冊）、`865b8af`（route through Ox Alpha）；README pin upstream `f405a929f7c14b168554528c54ffec46bf303faf`＋SHA-256
  - `cliproxyapi-setup`：`.scratch/freellmapi-vs-cliproxyapi-increment.md`（08-28：FreeLLMAPI 增量＝free-tier catalog curation，非本質新路徑）、`freellmapi/RECIPE.md`＋`.scratch/freellmapi-safe-trial/`（08-29 stage 0，pin arm64 digest、127.0.0.1:3001）
  - probe：`.claude/trials/active/cliproxyapi-alias-probe-2026-08-28.md`（v7.2.75 只讀 clone＋go test）；`.claude/trials/active/new-api-docker-probe-2026-08-28.md`（new-api relaykit docker `--network none` probe）
- **為什麼可能成題**：把免費模型池（glm-free、Ox Alpha、free(max)）接成正式 free tier，含混 tier 的 failover 鏈與 context window 調整——「免費推理電力供應鏈」是零成本 AI 開發的具體工程。
- **slug 候選**：`free-model-tier-failover-chain`（待 main 比對）
- **題庫／帳本關係**：此為長期 free-tier 電網（見 active trials `ccp-free-fcc-v3` 等）的窗內進度；可能對應既有 free-tier 題材，待 main 語義比對。

### 5. harbor-3arm 窗內結案後遺緒（pi 委派、exam2 arm、捨棄 dealt）

- **活動描述**：harbor-3arm 全案 08-17 已結案，但窗內 08-23 有兩筆新增 commit：`7fa30dc`（staged pi Gemini exam2 arm）與 `1e13ab4`（validate pi Gemini formal delegation）——後續追認。pi-supervisor-trial 同步 08-23 記錄 formal pi delegation 結果（provider-probe：gemini-3.7-flash-high 回 `PI_GEMINI_OK`，exitCode 0）。
- **日期**：2026-08-23
- **證據指針**：
  - `harbor-3arm` commits：`7fa30dc`、`1e13ab4`
  - `pi-supervisor-trial` commits：`8afa1cd`、`e93cb10`；`.trial/artifacts/provider-probe-summary.json`（08-23 16:45，回 model gemini-3.7-flash-high、token 492、cost 0）；`.trial/live-smoke/audit.jsonl`（08-23 16:41）
- **為什麼可能成題**：已結案 benchmark 的「委派驗證」尾聲——把正式委派與 probe 結果補登記，是實驗完整性的收尾（含 cost 0 的免費委派量測）。
- **slug 候選**：`delegation-receipt-practice`（待 main 比對）
- **題庫／帳本關係**：可能對應既有 agent-delegation 題材；待 main 比對。

### 6. evaluation 工具評估系列（skill-up vs SkillEvaluator、agentmemory 重評、Archify、Sepia、webcmd）＋ paperthin 吸收判定

- **活動描述**：窗內 `.scratch/` 有連續的 research-before-answer 型評估：`skillevaluator-vs-skill-up`（08-27，結論：SkillEvaluator 暫不導入）、`agentmemory-reeval`（08-27，理由換了仍不採用）、`archify-stack-fit`（08-27，watch-defer）、`sepia-stack-wiring`（08-28，翻案：先前判「不接」是錯的，接線改三部分＋pinned vendor）、`webcmd-vs-opencli-niche`（08-23）、`github-repo-research-*` 系列（lilmgenius/paperthin、zhaoxuya520、yusufkaraaslan、laude-institute、mastra-ai、ai-dynamo、backnotprop、b-nnett、nvidia、Nanako0129 等）；`reports/BENCHMARK.md`（skill-creator benchmark FAIL 現況）；`paperthin-absorb/`（08-29，45 件全量重評、帳本對帳平、Tier 升／降拍板表、final-root-validation & final-eval-validation 兩份 VERDICT PASS）。
- **日期**：2026-08-23 至 2026-08-29
- **證據指針**：
  - `.scratch/agentmemory-reeval-2026-08-27.md`、`.scratch/skillevaluator-vs-skill-up.md`、`.scratch/archify-stack-fit-2026-08-27.md`、`.scratch/sepia-stack-wiring-2026-08-28.md`、`.scratch/paperthin-absorb/final-root-validation.md`、`final-eval-validation.md`、`absorb-pack-paperthin-2026-08-29.md`（45/45 對帳、STACK_RECEIPT v1、47 active trials 全新格式、4 筆 detail-mismatch 如實標）
  - `reports/BENCHMARK.md`（08-28 17:03；Tier 1 FAIL 20 findings、Tier 2/3 NOT RUN）
  - 相關 commit：`claude-pr-review` `813efd9`（08-23 同步 upstream increments：Self-Verify advisory、C4 change-delta authority、optional web adversarial axis）；social-info 08-28～29 skills radar 系列
- **為什麼可能成題**：週期性「外部 repo 是否收編進個人 harness」的取捨方法論——固定用 adoption 證據（invoke 數、probe）而非 README 宣傳，且 08-29 paperthin 對先前判決整批重驗並產生明白的 Tier 拍板表，是工具評估紀律的完整樣本。
- **slug 候選**：`tool-eval-revisit-practice`（待 main 比對）
- **題庫／帳本關係**：skill 評估題材與現有題庫可能重疊（待 main 比對）；非機制帳本清單成員。

### 7. proxy 生態主題 audit（cache warm-up 問題是否有人做過）

- **活動描述**：`.claude/trials/proxy-cache-body-probe-v4/` 的 `popular-proxy-issue-audit.json`（08-23 23:36）記錄對 7 大 proxy 工具 repo（pxpipe 等）的 issue/PR 掃描：搜「custom-base ToolSearch、prompt-cache warm-up、cache-cost regression」證據。pxpipe 有強相鄰證據（#177 每輪 billing line 弄髒 cache prefix、#161 cache read 近零→90%+、#180 剝離 volatile billing line；#141 custom base 讓 remote-control 消失）。
- **日期**：2026-08-23
- **證據指針**：`/Users/linhancheng/Desktop/projects/.claude/trials/proxy-cache-body-probe-v4/evidence/run-jz63kc_d/popular-proxy-issue-audit.json`（schema_version 1，含 7 repo 的 issue/PR 計數與逐條 finding URL）
- **為什麼可能成題**：proxy 工具的 prompt cache 損耗（billing line 在 cached prefix 內）是真實社群的 shared pain，且已有人修（#161/#180）——「cache warm-up 被誰做過」是有時效的 ecosystem 調查。
- **slug 候選**：`proxy-cache-warmup-ecosystem-audit`（待 main 比對）
- **題庫／帳本關係**：與既有 proxy 系列文章（如已發布 proxy-warmup-cost）可能同族，待 main 語義比對避免重複。

### 8. mock-interview 題庫新增（親身面試題入庫）

- **活動描述**：mock-interview 08-25 新增 `prepaid-spot-trading-ledger` 系統設計題（儲值制現貨交易平台 OMS＋錢包帳本），附白話說明與期望答案；來源是 2026-06-08 使用者親身被問的題（原題股票、改加密貨幣現貨），原始推演 session 落 `stock-trading-ledger/openspec/changes/core-order-ledger/`。
- **日期**：2026-08-25
- **證據指針**：commits `39962e3`（feat: add mock interview question bank）、`bfe7746`（docs: add plain-language explanations and expected answers）；`questions/system-design/prepaid-spot-trading-ledger.md`
- **為什麼可能成題**：把面試被問的題目改編成可複用題庫，並反芻「帳本題三層次」——個人面試經驗的知識固化。
- **slug 候選**：`ledger-question-bank`（待 main 比對）
- **題庫／帳本關係**：interview-tour-2026 面試題材可能已在題庫；待 main 語義比對。

### 9. 批量 checkpoint「pre-governance working state」（2026-08-25）

- **活動描述**：2026-08-25 22:09–22:54 間，大量個人 repo 同步出現 `chore: checkpoint pre-governance working state` 空 commit（gggodlin-blog、memory-backlog-research、cc-vendor-bridge、cc-i18n-proxy、cc-skill-doctor、claude-code-unpoison、codex-claude-memory-bridge、comfyui-local、harbor-3arm、hook-llm-bench、hv-clone、idea-brainstorm、interview-tour-2026、life-game-lab、session-log-miner、social-info 等），疑似某 governance 變革（paperthin absorb / review-spec 升級）前的統一快照動作。
- **日期**：2026-08-25
- **證據指針**：各 repo `git log` 同時間戳 commit 字樣一致；未見該「governance」變革的單一源頭文件（可能是窗內 review-spec／paperthin 升級的準備），為「STATE 之外的機制性現象」。
- **為什麼可能成題**：「同一時間對全部專案打 checkpoint」是值得敘述的版本管理習慣（rollback 保險栓）。
- **slug 候選**：`checkpoint-before-governance`（待 main 比對）
- **題庫／帳本關係**：無對應機制帳本成員；可能呼應 `mechanism-decommission-decay` 前的一次全景快照，但未見明文。

### 10. 公司 repo（~/Desktop/work）窗內活動：純 debug，降個案

- **活動描述**：`akocommerce` 08-26～27 有 platform-connect（invoice-widget、debug 狀態模擬面板、sync-open ticket 流程）與 code-review 修正 commit。均為產品 feature／debug 工作，非方法論級。
- **日期**：2026-08-26～27
- **證據指針**：`akocommerce` commits `9bbb7c61`、`0e281a68`、`324c8fb5`、`152d6d7c`、`2969e103`、`7eee95f7`、`0d03b449` 等（無 STATE 檔）
- **為什麼可能成題**：無（純 debug，依任務規則降成個案，不保留）。
- **slug 候選**：無
- **題庫／帳本關係**：無

---

## 機制帳本精簡對照

窗內未見對「觀察中」九個機制（cvs-handover、codex-claude-memory-bridge、memory-state-ripple、mechanism-decommission-decay、trigger-ownership-split、plain-language-hard-gate、single-truth-pointer-tombstone、claude-config-activity-curve）的新進展，亦未見 `rebuttal-calibration` 重提條件達成（無 finding 發布成預設流程、無真實作者回覆的可觀察點）。`codex-claude-memory-bridge` README 於 08-25 更新，但僅維持既有狀態、無翻案。窗內最接近機制進展的是：
- `memory-state-ripple` 間接呼應：第 1 條 mbr STATE archive 把 methodology 寫入 memory、STATE 重置為 idle（ripple 的狀態清洗樣板）；待 main 語義比對是否為該機制續作。
- 第 9 條 checkpoint 空提交為一次全 repo 快照，不指向單一帳本條目。

## 掃描統計

- 掃過 STATE 數：15 個（projects 下 15 個 `docs/philip/STATE.md`；work 下 0 個）
  - 組成：8 個真實專案（gggodlin-blog、memory-backlog-research、harbor-3arm、hook-llm-bench、cc-vendor-bridge、hv-clone、stock-trading-ledger、agent-deck、interview-tour-2026、cli-foundry、claude-skills 等）+ 3 個 `_archive` fixture（`docs-philip-fixture.olIsMy`、`ledger-fixture.StA4OT`、`init-project-docs-green.JwyteR`，皆測試 sentinel，無真實活動）+ 1 個 archived trial（`_archive/openclaw-trial`，窗外）
- 窗內有活動數：2 個 STATE（gggodlin-blog 2026-08-28、memory-backlog-research 2026-08-24）；另 3 個 fixture STATE 窗內更新但屬測試產物，非真實活動
- probe 數：窗內檢視的 probe／驗收／量測檔 19 個（semble-lifecycle-v055-probe、cliproxyapi-alias-probe、new-api-docker-probe、proxy-cache-body-probe-v4 audit、pi-supervisor provider-probe-summary、harbor-pr-bench-public 三件（Tier2 review、yagni review、release-verification）、review-implement、paperthin-absorb 三件（final-root-validation、final-eval-validation、absorb-pack）、reports/BENCHMARK.md、freellmapi-vs-cliproxyapi-increment、agentmemory-reeval、skillevaluator-vs-skill-up、archify-stack-fit、sepia-stack-wiring、skill-up-cli iteration-75 benchmark、mock-interview 題庫）
- 未獨立驗證數：1 處（blog STATE 宣稱「Pages run 33155977439 success 並完成正式站驗收」——有 run id、但 run 內容與正式站 DOM 驗收未在本窗重新抓取，標「STATE 宣稱，未獨立驗證」；其他各條皆有 commit 或 probe 檔接住）