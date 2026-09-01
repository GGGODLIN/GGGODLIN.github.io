# 2026-08-29 source-4（trial 帳本）掃描報告

- 掃描窗：2026-08-23 00:00:00 至 2026-08-29 當下，起訖皆含
- 掃描對象：`~/Desktop/projects/.claude/trials/active.md`（49 條 H2）＋ `archived.index.md`（151 行）＋ `trials/active/` 50 個 detail 檔
- 方法：先讀 active.md 全部 H2 與 started/status/detail 欄位，再逐檔核對 detail-key／detail-title 前兩行；archived.index.md 以最後一欄標題 anchor 比對窗內 verdict／結案日
- 角色：只做資料整理與候選提示，不做候選裁決，未修改任何既有檔案

## 計數總覽

| 項目 | 數 |
|---|---|
| 掃過的 active H2 | 49 |
| 窗內開案（started 08-23～08-29） | 29 |
| 窗內結案（archived 結案日 08-23～08-28） | 20 |
| 窗內延輪事件（7 條 trial、evidence-level 二次） | 8 |
| 窗內量測翻案／層級 KILL 事件 | 3 |
| detail-missing | 0 |
| detail-mismatch | 1（skillevaluator started 欄位差一日）＋ 1 殘留檔備註 |
| 機制帳本同名對應 | 0（全數待 main 語義比對，見伍節） |

---

## 壹、窗內開案（29 條）

每條欄位：活動描述｜日期｜證據指針｜為什麼可能成題｜slug 候選｜題庫／帳本關係

### 08-23 開案（2）

1. 活動描述：Browser Harness 跨任務 helper／domain-skill 累積觀察開案——trial-only global skill 路由，隔離 browser 執行，KPI 至少 2 個 helper 跨 session 真實重用｜日期：2026-08-23｜證據指針：active.md L194-197、`active/browser-harness-accumulation-2026-08-23.md`｜為什麼可能成題：browser 自動化工具選型的 token 成本實測對照（310 vs 819 payload estimate）是具體數字素材｜slug 候選：待 main 語義比對（初步 `browser-automation-tool-cost`）｜題庫／帳本關係：無既有條目
2. 活動描述：ccp-free-fcc-v3 驗證 nvidia_nim 免費模型冷啟動路徑——首發失敗（exit 126、launchd Operation not permitted）後修正 rerun PASS；此為「免費 LLM gateway」主題第三版試探｜日期：2026-08-23｜證據指針：active.md L199-202、`active/ccp-free-fcc-v3-2026-08-23.md`｜為什麼可能成題：免費大模型供應商（nvidia nemot-ron-3-super）從零搭起與失敗鑑識的完整案例｜slug 候選：待 main 語義比對（初步 `free-llm-route-proving`）｜題庫／帳本關係：無

### 08-24 開案（1）

3. 活動描述：implement 背景 worker 失控事件開案——單支 worker 累積 91.4 分鐘、350 次 tool call、child reviewer 無限展開、tool deny 後不結束、controller 只信狀態標記；三條暫行護欄（禁 child、deny 即報、20 分鐘 watchdog）觀察｜日期：2026-08-24｜證據指針：active.md L205-208、`active/implement-background-worker-guardrails-2026-08-24.md`｜為什麼可能成題：「背景 agent 看起來在跑其實卡死」的事件鑑識與護欄設計，真實數據（91.4 分／350 call）很刺眼｜slug 候選：`background-agent-runs-away`｜題庫／帳本關係：無
   （註：與 wait-what-upstream-har（08-27 結案）同源不同判準，detail 內已明示）

### 08-25 開案（5）

4. 活動描述：personal-main-closeout-v3 開案（SUPERSEDED 前身 v2 同日結案）——Stop block 強制 read-only Git closeout，SessionStart 留 worktree nudge；同檔補「非 git repo 開 session 結構性收不到 nudge」的觸發盲區｜日期：2026-08-25｜證據指針：active.md L91-94、`active/personal-main-closeout-v3-2026-08-25.md`｜為什麼可能成題：「結案儀式」如何被強制成自動化、以及觸發點的結構性盲區，既是工作流故事也是介面設計討論｜slug 候選：`closeout-automation-trigger-design`｜題庫／帳本關係：與 `claude-config-activity-curve` 疑似同脈絡（都量 ~/.claude 的 git 活動），待 main 比對
5. 活動描述：claude-api-skill-unblock 開案——拿掉 ccp-gpt／ccp-bruce 對 `Skill(claude-api)` 的禁擋；近 7 天 86 次 `Skill execution blocked` 每次白費一個 tool call；實測 CC 2.1.243 漸進式載入已解掉舊版 800KB 一次注入問題｜日期：2026-08-25｜證據指針：active.md L210-213、`active/claude-api-skill-unblock-2026-08-25.md`｜為什麼可能成題：「gate 擋了三年、工具其實已經長大」——過時防禦的解除決定流程，86 次 blocked 是實打實的浪費數字｜slug 候選：`stale-gate-stale-cost`｜題庫／帳本關係：無
6. 活動描述：chrome-devtools-mcp-pin-160 開案——1.7.0 regression（關選定分頁後全 API 回 selected page has been closed）釘回 1.6.0；上游 #2033 重現、#2588 已 merge 未發版；同日補 mcp-npx manager 每日比對釘版｜日期：2026-08-25｜證據指針：active.md L215-218、`active/chrome-devtools-mcp-pin-160-2026-08-25.md`｜為什麼可能成題：MCP 工具版本 regression 的 A/B 重現方法與釘版策略｜slug 候選：待 main 語義比對（初步 `mcp-version-ressing-regression`）｜題庫／帳本關係：無
7. 活動描述：perspective-sub-scout-bransform 開案（storm-perspective-graft 結案接力）——perspective sub-scout 轉掛 brainstorm Step 2a′「外部 archaeology」，每次與跑收據 2a 報告一行 `External archaeology: ran/skipped(...)`｜日期：2026-08-25｜證據指針：active.md L220-223、`active/perspective-sub-scout-bransform-2026-08-25.md`｜為什麼可能成題：brainstorm 流程如何用外部文章做 framing 校準——寫作方法論題材｜slug 候選：待 main 語義比對（初步 `external-archaeology-framing`）｜題庫／帳本關係：與 storm-perspective-graft 結案（08-25）是接棒關係
8. 活動描述：unlazy-absorb-looppguad-paht-rot 開案——absorb-pack 落地的 Stop gate 兩層指紋（same>3／total>6）與新 path-rot channel（掃寫死的 ~/.claude 路徑）；首跑 baseline 152 檔、201 路徑、1 真腐化｜日期：2026-08-25｜證據指針：active.md L226-229、`active/unlazy-absorb-looppguad-paht-rot-2026-08-25.md`｜為什麼可能成題：設定檔路徑腐化（config-path rot）的偵測與修復——工程維護主題｜slug 候選：`config-path-rot-detecton`｜題庫／帳本關係：無

### 08-26 開案（6）

9. 活動描述：recall-before-answer-hook 開案——翻紀錄提醒與訪談模式合一支 UserPromptSubmit hook，KPI 漏抓率 ≤20%｜日期：2026-08-26｜證據指針：active.md L60-63、`active/recall-before-answer-hook-2026-08-26.md`｜為什麼可能成題：提示型 hook 的詞表覆蓋邊界（14 組翻紀詞）與「不保證清單」寫法本身｜slug 候選：待 main 語義比對（初步 `reminder-hook-limit-words`）｜題庫／帳本關係：無
10. 活動描述：figma-budget-gate 開案——第一個 Figma MCP call 前強制 invoke figma-context-budget skill，18/21 baseline｜日期：2026-08-26｜證據指針：active.md L65-68、`active/figma-budget-gate-2026-08-26.md`｜為什麼可能成題：context 預算 gate 的設計（dispatch 前先扣預算）——cost 治理題材｜slug 候選：待 main 語義比對（初步 `contex-budget-efore-tool`）｜題庫／帳本關係：無
11. 活動描述：contract-test-preflight-gate 開案——改有考卷的 command/SKILL.md 前強制先查契約測試，15 個既有 session 7 個有查、8 個沒有｜日期：2026-08-26｜證據指針：active.md L70-73、`active/contract-test-preflight-gate-2026-08-26.md`｜為什麼可能成題：散文檔在測試底下、改前先查考卷——「文件也有契約測試」本身是好題目｜slug 候選：`doc-unde-conract-test`｜題庫／帳本關係：無
12. 活動描述：contract-test-receipt-gate 開案——Edit/Write 後自動跑命中契約測試並寫 receipt，recept 綁 target＋test hash、malformad state 會 block｜日期：2026-08-26｜證據指針：active.md L75-78、`active/contract-test-receipt-gate-2026-08-26.md`｜為什麼可能成題：測試收據（receipt）機制的設計——「跑過」要有證據才算了｜slug 候選：`test-receipt-evidence-runn`｜題庫／帳本關係：無
13. 活動描述：c068-answer-judge 開案——Fable 回合的離線判官（gemini-3.7-flash radio）、relay 判決寫 state；real relay 已驗證 status=judged／verdict=NO｜日期：2026-08-26｜證據指針：active.md L80-83、`active/c068-answer-judge-2026-08-26.md`｜為什麼可能成題：「模型自評」用另一支便宜模型做 judge 的架構與失敗率對帳｜slug 候選：待 main 語義比對（初步 `cross-model-answer-udging`）｜題庫／帳本關係：無
14. 活動描述：chrome-devtools-mcp-1-8 開案（safe-trial）——試 1.8 版是否修掉 p-in-160 的 closure regression｜日期：2026-08-26｜證據指針：active.md L231-234、`active/chrome-devtools-mcp-1-8-2026-08-26.md`｜為什麼可能成題：版本 pin 與升級判決的雙 trial 接力（pin-160 → 1-8 驗證）｜slug 候選：待 main 語義比對｜題庫／帳本關係：與 chrome-devtools-mcp-pin-160（08-25）同家族

### 08-27 開案（6）

15. 活動描述：review-implement-stage 開案——review-implement 接在 implement closeout 後、使用者四選一（all/scope/yagni/skip），量 Scope/YAGNI review 是否帶 decision-changing unique contribution｜日期：2026-08-27｜證據指針：active.md L236-239、`active/review-imlement-stage-2026-08-27.md`｜為什麼可能成題：review 的邊際價值量測（多一次 review 到底改不改變決定）——方法論題材｜slug 候選：`review-incremental-value`｜題庫／帳本關係：無
16. 活動描述：semble-lifecycle-v055-probe 開案（safe-trial）——probe semble 0.5.5 打包從 read-only clone 編譯 30 檔成功，Docker `--network none` 被 setuptools 缺件擋住｜日期：2026-08-27｜證據指針：active.md L246-249、`active/semble-lifecycle-v055-probe-2026-08-27.md`｜為什麼可能成題：工具生命週期管理（v0.5.0 是否還可裝）與 packae 變質偵測｜slug 候選：待 main 語義比對（初步 `tool-lifecycle-verion-rott`）｜題庫／帳本關係：無
17. 活動描述：archify-visual-gate 開案（safe-trial，commit 釘 v2.15.0）——產圖自動 surface 進 post-implement 視覺 gate（RED/GREEN 三段驗證），raw CLI 全面 deny 只走 wrapper 7/7；真實候選 exposure #1 使用者 waive｜日期：2026-08-27｜證據指針：active.md L251-254、`active/archify-visual-gate-2026-08-27.md`｜為什麼可能成題：「AI 產圖要過視覺 gate 才准進 repo」——視覺工作流 gate 化設計；且本掃描 session 自身的 Bash loop 就真實被此 gate fail-closed 擋下（見柒節備註）｜slug 候選：`visual-gate-for-ai-artifacs`｜題庫／帳本關係：無
18. 活動描述：plannotator-visual-gate 開案（safe-trial）——plannotator（已 KILL 的 diagram 工具）殘留品轉視覺 gate 試用，macOS arm64 binary 首發執行被 safe-trial snapshot 包住｜日期：2026-08-27｜證據指針：active.md L256-259、`active/plannotator-visual-gate-2026-08-27.md`｜為什麼可能成題：已退役工具留下來的產物該怎麼處置（gate 而非復活）｜slug 候選：待 main 語義比對（初步 `retired-tool-artifact-gate`）｜題庫／帳本關係：與 plannotator KILL（archived 2026-07-11）續緣
19. 活動描述：zoekt-locator 開案（safe-trial）——sourcegraph/zoekt（Go）當 code search locator 的試探｜日期：2026-08-27 23:52｜證據指針：active.md L261-264、`active/zoekt-locator-2026-08-27.md`｜為什麼可能成題：code search 工區（semble/sem 外的第三、四軌）的擴建——工具題材｜slug 候選：待 main 語義比對（初步 `code-search-tool-lansdscape`）｜題庫／帳本關係：無
20. 活動描述：zoekt-locator [run-2] 開案（safe-trial 同名 run-2 後綴 例）——同一探針的重跑，trusted-publisher 例外（pin commit + Go 1.26.5 checksum 驗）｜日期：2026-08-27 23:56｜證據指針：active.md L266-269、`active/zoekt-locator-2-2026-08-27.md`｜為什麼可能成題：safe-trial 同名 twin-run 機制本身（同名第二 run 如何不覆蓋）——流程題材｜slug 候選：待 main 語義比對｜題庫／帳本關係：與 zoekt-locator 同體

### 08-28 開案（7）

21. 活動描述：skillevaluator 開案（safe-trial，nvida/SkillEvaluator 釘 commit 009aa300）——skill 評估工具試用｜日期：2026-08-28（ledger started；detail 檔名與 install 日為 08-27）｜證據指針：active.md L241-244、`active/skillevaluator-2026-08-27.md`｜為什麼可能成題：skill 品質評測工具的引入與安全評估（nvidia 發行方、uv tool install）｜slug 候選：待 main 語義比對（初步 `skill-eval-orools`）｜題庫／帳本關係：無（⚠️ 見陸節 mismatch）
22. 活動描述：codesearch-locator 開案（safe-trial，flupkede/codesearch 釘 commit）——rust code search 當 locator 試探，`--network none` 只因 crates.io 不通而敗｜日期：2026-08-28｜證據指針：active.md L271-274、`active/codesearch-locator-2026-08-28.md`｜為什麼可能成題：同 19/20，code search 工具擴建；另有「離線 build 與真 build 的 sandbox 邊界」細節｜slug 候選：待 main 語義比對（初步 `code-search-tool-lansdscape`）｜題庫／帳本關係：無
23. 活動描述：new-api-docker-probe 開案（safe-trial）——new-api（LLM gateway 聚合面板）relaykit 測試在 golang 1.25.1 容器跑 refereeConverter/advancedcustom｜日期：2026-08-28｜證據指針：active.md L276-279、`active/new-api-docker-probe-2026-08-28.md`｜為什麼可能成題：自建免費 LLM gateway 主題的延續（與 ccp-free-fcc 同族）——「自己架免費模型閘道」可以成一篇操作文｜slug 候選：`self-hosted-llm-gateway-patch`｜題庫／帳本關係：無
24. 活動描述：sepia-readme-review 開案——把 Nanako0129/sepia v0.2.0 的寫作規則套到 repo-to-bench README（english README 改良＋新 README.zh-TW 草稿），不裝 skill 不改 production code｜日期：2026-08-28｜證據指針：active.md L281-284、`active/sepia-readme-review-2026-08-28.md`｜為什麼可能成題：第三方寫作規則「借文」評估（不安裝、只借規則）——open-source 寫作規範鑑定法｜slug 候選：`borrow-writing-rule-not-skill`｜題庫／帳本關係：無
25. 活動描述：9router-routing-tests 開案（safe-trial）——router-for-me 的 9router routing 測試在 npm --no-audit 下跑 vitest combo/session-manager｜日期：2026-08-28｜證據指針：active.md L286-289、`active/9router-routing-tests-2026-08-28.md`｜為什麼可能成題：LLM router 的投測（routing tests 是決策工具品質證據）｜slug 候選：待 main 語義比對（初步 `model-router-verificon`）｜題庫／帳本關係：與 routing-ab-current-policy 鄰近、待 main 比對
26. 活動描述：cliproxyapi-alias-probe 開案（safe-trial）——CLIProxyAPI v7.2.75 的 sdk/cliproxy 與 config 測試在 clone 後跑｜日期：2026-08-28｜證據指針：active.md L291-294、`active/cliproxyapi-alias-probe-2026-08-28.md`｜為什麼可能成題：自家日常用的 proxy 工具的 aliase 機制驗證——「每天都在用的東西怎麼驗」｜slug 候選：待 main 語義比對（初步 `daily-tool-verificon`）｜題庫／帳本關係：無
27. 活動描述：sepia-vendor 開案（safe-trial）——sepia 以 submodule 進 ~/.claude/vendor（純 markdown 來源、不跑 install.sh）｜日期：2026-08-28｜證據指針：active.md L296-299、`active/sepia-vendor-2026-08-28.md`｜為什麼可能成題：第三方 skill 來源以 vendor submodule 管理（供應鏈治理）｜slug 候選：待 main 語義比對（初步 `vendored-skill-supply-chain`）｜題庫／帳本關係：與 sepia-readme-review 同源

### 08-29 開案（2）

28. 活動描述：semble-search-governance-bloking 開案即 paused——review 修復完成 675/675 綠，等 reactivaton window；狀態欄本身示範「開案即暫停」型｜日期：2026-08-29｜證據指針：active.md L301-304、`active/semble-search-governance-blocking-2026-08-29.md`｜為什麼可能成題：搜尋治理（搜尋前先查單一來源？）的 blocking 設計——RAG/搜尋治理題材｜slug 候選：待 main 語義比對（初步 `search-governance-blocking`）｜題庫／帳本關係：無
29. 活動描述：freellmapi-safe-trial 開案（safe-trial，docker compose up）——free-llm-api 容器試用，免費模型聚合主題第四個節點（ccp-free-fcc／new-api 同族）｜日期：2026-08-29｜證據指針：active.md L306-309、`active/freellmapi-safe-trial-2026-08-29.md`｜為什麼可能成題：免費 LLM API 聚合工具的試用與安全評估（自架 vs 聚合）——可成「免費模型的路徑地圖」｜slug 候選：`free-llm-api-landscape`｜題庫／帳本關係：無

---

## 貳、窗內結案與 verdict（20 條，archived.index.md 結案日 08-23～08-28）

「為什麼可能成題」重點標 verdict（結案 verdict 是強訊號）。

### 08-23 結案（3）

30. opencli｜KEEP｜「82 次真實呼叫、跨 4 repo、寫進 3 個常駐 command/skill」畢業成常規工具｜證據指針：archived.index.md L132、`### ✅ [結案 2026-08-23 · KEEP：…] opencli (原 review 2026-08-23)`｜為什麼可能成題：第三方 CLI（opencli＝OpenCode？）從試用到常駐的採用判準——「用 82 次才敢說喜歡」｜slug 候選：待 main 語義比對（初步 `cli-tool-graduate-rubric`）｜題庫／帳本關係：無
31. wait-what-shape-first｜UNKNOWN｜形狀 bullet 併回 wait-what、分身刪除——「形狀優先」呈現法評估收案｜證據指針：archived.index.md L133｜為什麼可能成題：分身工具整合（bulle 併回主工具）的決策記錄｜slug 候選：待 main 語義比對｜題庫／帳本關係：無
32. proxy-cache-bod-probe-v3-v4｜UNKNOWN｜12-call raw-bod 對照坐實 custom base URL request-mode 變化——prompt cache 在自建 proxy 下被打爛的續篇（headroom 08-22 KILE 同脈絡）｜證據指節：archived.index.md L134｜為什麼可能成題：「換了自己主機的 API 端點，prompt cache 就沒了」——cache 機制與 depoy 位置的關係是好科普題｜slug 候選：`custom-endpoint-prompt-cache`｜題庫／帳本關係：與 headroom（08-22 KILE）同族、與 claude-config-activity-curve 無涉

### 08-25 結案（5）

33. storm-perspective-graft｜KILE-原接點／機制轉移 brainstorm｜9 週 0 出題但合成案例證能力，機制轉移 Step 2a′（→ perspective-sub-scout-bransform 接力）｜證據指針：archived.index.md L135｜為什麼可能成題：「沒人用的好功能」該殺還是該搬家——機制轉移決策的完整case（0 出題＋能力證明雙證據）｜slug 候選：`kill-or-relocate-unused-feature`｜題庫／帳本關係：與 perspective-sub-scout（08-25 開案）為接棒
34. output-style-plain-languge｜KEEP｜借殼機制（output style）成立、KPI 移交 concise-output-style-a-b｜證據指針：archived.index.md L136｜為什麼可能成題：plain-language 輸出風格的借殼實測——寫作風格的機械化比較｜slug 候選：待 main 語義比對｜題庫／帳本關係：與 plain-language-hard-gate 同族（待 main 比對）；KPI 移交目標 08-28 結案見 #39
35. huashu-design｜KILE｜三方向板品質「有點弱」、流程重、與設計 skill 0.4% 採用率一致——AI 配圖設計工具評估｜證據指針：archived.index.md L137｜為什麼可能成題：AI 生圖工具評測的「品質不夠就殺」case（配 blog 插圖需求）｜slug 候選：`ai-image-tool-verdict`｜題庫／帳本關係：無
36. yagni-axis-seat｜KEEP｜6 場真實觸發、砍除全落地、席們收斂預設 b+c 保留自選——YAGNI review 軸的選席機制｜證據指針：archived.index.md L138｜為什麼可能成題：「多餘功能審查（YAGNI）本身的軸線設記」——review 方法論｜slug 候選：待 main 語義比對（初步 `yagni-review-axis-design`）｜題庫／帳本關係：無
37. personal-main-closeout-v2｜SUPERSEDED｜user-only delivry 未被消費、v3 改 agent-readable block 接手（→ 08-25 同日開案 v3）｜證據指針：archived.index.md L139｜為什麼可能成題：交付格式的假設失敗（「寫給人看」vs「寫給 agent 看」）——訊息設計題材、與 #4 連讀｜slug 候選：`user-only-delivry-week`｜題庫／帳本關係：同 #4

### 08-26 結案（2）

38. read-path-preflight｜KILE｜與原生缺檔錯誤重複、增量價值未證——預讀路徑檢查評估後殺｜證據指針：archived.index.md L140｜為什麼可能成題：重複造輸（duplicave rail）工具評估的乾淨 case｜slug 候選：待 main 語義比對（初步 `duplicave-toil-not-needed`）｜題庫／帳本關係：無
39. 2026-08-19-tol-updates-uv｜KILE｜合併 uv tool install 語法無效且 0 changes；拆分 trial 已接手——uv 安裝 tool 的正確寫法研究收案｜證據指針：archived.index.md L141｜為什麼可能成題：「文檔上的安裝方法其實無效」的實測翻案（uv tool install 合併語法）｜slug 候選：`uv-tool-install-syntax-reality`｜題庫／帳本關係：無

### 08-27 結案（4）

40. 2026-08-19-tol-updates-notebooklm｜KEEP｜0.9.12 安裝成功並完成一次實際影片研究流程（與使用者 NotebookLM Pro 習慣對上）｜證據指針：archived.index.md L142｜為什麼可能成題：NotebookLM CLI 版實際研究流程採用——影片研究工具鏈的延續題材｜slug 候選：待 main 語義比對（初步 `notebooklm-cli-workflow`）｜題庫／帳本關係：無
41. 2026-08-19-tol-updates｜KEEP｜保留 rolling CLI 更新、接受 Codex/Qwen 功能證據缺口——工具批量更新的採用決策｜證據指針：archived.index.md L143｜為什麼可能成題：上遊 CLI 更新的「接受證據缺口」決策——工具治理｜slug 候選：待 main 語義比對｜題庫／帳本關係：無
42. wait-what-upsteram-hardening｜KEEP｜保留現有呈現、接受少量 controller 漂移；同日「第四刀轉向 implement」（與 implement-background-worker-guardrails 同源判準分開）｜證據指針：archived.index.md L144、`active/implement-background-worker-guardrails-2026-08-24.md` 起始事件段｜為什麼可能成題：上游機制（wait-what）頻繁出事件的匯總與轉向決策｜slug 候選：待 main 語義比對（初步 `upstream-ic-friction-gahere`）｜題庫／帳本關係：無
43. 2026-08-19-tol-update-graphifyy｜KEEP｜保留 0.9.50、current API smoke 過並接受 0 次自然核心使用缺口——卡片工具版本評估｜證據指針：archived.index.md L145｜為什麼可能成題：0 使用仍 KEEP（缺證缺口明示）的決策正反例——工具治理題材｜slug 候選：待 main 語義比對｜題庫／帳本關係：無

### 08-28 結案（6）

44. concise-output-style-a-b｜KILE｜custom Concise 只保住短度、白話 hit 6.49% 未過 A 門檻——plain-language 干預的量化失敗｜證據指針：archived.index.md L146、`### ✅ [結案 2026-08-28 · KILL C：…]`｜為什麼可能成題：「把話講白」的干預實測只到 6.49%——寫作風格干預的量測方法與門檻設計；強訊號（KILE 帶數字）｜slug 候選：`measureing-plain-language-intervention`｜題庫／帳本關係：與 plain-language-hard-gate 同族（待 main 比對）
45. t5-post-grep-nudge｜KILL trial｜原觀察宿主（akocommerce 環境）與未追蹤接線消失、正式收案但不判死 Semble 引導機制——環境退場連動 ledger 缺口的實例｜證據指針：archived.index.md L147、T9 detail 第三輪（同行受影響）｜為什麼可能成題：環境消失（離職→repo 清光）吞掉正在觀察的機制——offboarding 與觀察體係的缺口｜slug 候選：`env-disappearance-kills-trial`｜題庫／帳本關係：與 T9 第三輪教訓 (c) 同源、待 main 比對
46. pipestatus-zsh-gate｜KEEP｜12 次真陽保留、唯一誤攔 15 秒自愈且 0 人工介入——zsh pipestatus 誤寫偵測｜證據指針：archived.index.md L148｜為什麼可能成題：shell 腳本錯誤模式（pipestatus 漏寫）的 gate 化——工程細節題｜slug 候選：待 main 語義比對（初步 `zsh-pipestatus-gate`）｜題庫／帳本關係：無
47. repeat-verify-reminder-hook｜KEEP｜pure sleep 0 誤提醒、有效提醒 68 多於 noise 47，保留窄版 advisory——重複驗證提醒 hook 評估｜證據指針：archived.index.md L149｜為什麼可能成題：提醒型 hook 的「有效 vs 噪音」配額實測（68 vs 47）｜slug 候選：待 main 語義比對（初步 `reminder-noise-ratio`）｜題庫／帳本關係：無
48. review-spec-vendor-role-mapping｜KEEP｜4/4 vendor pair exact 驗收、現行契約 457/457——review-spec 的 vendor 角色對應驗收｜證據指針：archived.index.md L150｜為什麼可能成題：多模型 review 的角色分工地圖（誰評誰）——方法論題材｜slug 候選：待 main 語義比對（初步 `vendor-role-mapping-review`）｜題庫／帳本關係：無
49. sops-age-plugin-se｜KEEP｜Secure Enclave 路徑已採用、13/13 測試過、第二台 Mac 由獨立 handoff 承接——密鑰管理工具評估｜證據指針：archived.index.md L151｜為什麼可能成題：密鑰管理（sops+age+Secure Enclave）的採用與跨機 handoff——安全工具題材｜slug 候選：待 main 語義比對（初步 `sops-secure-enclave-adopt`）｜題庫／帳本關係：無

---

## 參、窗內延輪（7 條 trial、8 事件）

50. memory-ripple-hook｜2026-08-23 第六輪 review 延至 08-30（使用者拍板「b＋同步＋3.7」）——本窗最重要的一條：Qwen 層「測出沒用」拆除、Gemini 改同步＋3.7-flash-high、v3 上線、08-30 四門檻；三模型離線回放 74 筆評比（本地 Qwen vs API Gemini vs gpt-5.3）是難得的評測對照組｜證據指針：active.md L107-110、`active/memory-ripple-hook-2026-07-05.md` 第六輪段｜為什麼可能成題：同一批 6.65 天真實事件（118 筆）給三支模型判官打分、一層被判「沒用」拆除——LLM 評測方法論的誠實案例（含量測更正史）｜slug 候選：`llm-judge-real-dta-bench`｜題庫／帳本關係：與 memory-state-ripple（機制帳本觀察中）疑似同名異寫、待 main 比對
51. gpt-convergence-reminder-hook｜2026-08-27 收窄 model resolver 後延輪 7 天——120/120 送達、raw target 誤觸違反目標 0、model precedence 重設計（input→最後 assistant→cache→CC_VENDOR）｜證據指針：active.md L97-100、`active/gpt-convergence-reminder-hook-2026-08-13.md` 🔧段｜為什麼可能成題：session 的 model 判別（誰在跑）是不少機制的前提——誤判成本與「權威訊號優先」設記｜slug 候選：待 main 語義比對（初步 `session-model-precedence`）｜題庫／帳本關係：無
52. pr-review-c4-layer-trial-window｜2026-08-23 第 1 輪 review 延至 09-07（使用者拍板 a）——KEEP 判準已達（Self-Verify×2、helper×2）但 C4 鏈 3/3 SKIPPED 根因＝reducer 只收 openspec/specs live；8.2 放寬後首次合成真實派工全鏈 0 finding（本機史上第一次）｜證據指針：active.md L163-166、`active/pr-review-c4-layer-trial-window-2026-08-16.md`｜為什麼可能成題：「規格在 change 目錄時 C4 鏈抓不到」→ reducer 放寬的修正案例；形式規格 review 的實務落差｜slug 候選：`formal-spec-gate-reality-gap`｜題庫／帳本關係：無
53. model-harness-coevolution-mechanism｜2026-08-25 第一輪 review 轉事件驅動 +30 天 backstop——第二次換代事件未發生、0 fire、staleness 8 數字全漂｜證據指針：active.md L127-130、`active/model-harness-coevolution-mechanism-2026-07-25.md`｜為什麼可能成題：「機制自己的觀察開案」開在第一輪就 0 出題——事件驅動 backstop 設計（0 出題再延不殺）｜slug 候選：待 main 語義比對（初步 `event-driven-backstop-design`）｜題庫／帳本關係：無
54. bruce-workflow-monitor-presumptive-thresholds｜2026-08-25 延輪→事件驅動 backstop +30（觀察窗 0 arm、health log 僅設記日 4 筆）——「沒出題非測出沒用」的又一例｜證據指針：active.md L168-172、`active/bruce-workflow-monitor-presumptive-thresholds-2026-08-17.md`｜為什麼可能成題：presumptive 門檻（health ≥50/70）從命名推測、從未真實觸發——「推測值沒被考驗」的透明記紀錄｜slug 候選：待 main 語義比對（初步 `presumptive-threshold-unested`）｜題庫／帳本關係：無
55. T9 archive-reviewer-gate｜2026-08-25 第三輪 review 延到 09-07——本窗最有故事性的一條：真實 archive 走不通（cwd 釘 feat worktree）、gate 被「! bash 手動輸入」合法繞過、08-23 20:34 環境整包消失（離職 offboarding）→ hook 目前不存在；三條教訓（ask 型 gate 繞行邊界／多 worktree cwd reset／環境退場未連動 ledger）都 promote 待辦｜證據指針：active.md L112-115、`active/t9-archive-reviewer-gate-phase-a-reviewer-採用率觀察-2026-07-10.md` 第三輪段｜為什麼可能成題：gate 與環境生命週期——hook 在 repo 被清掉那天就死了，ledger 還掛著；「繞行邊界要算進去」是防禦設計好素材｜slug 候選：`gate-vs-die-envionment`｜題庫／帳本關係：與 t5-post-grep-nudge（08-28 KILL）同受環境退場影響、待 main 比對
56. evidence-level-weekly-local-analyis-channel｜2026-08-27 第三輪延至 08-28（修正 offset=0 renew 重建 bug）；2026-08-28 第四輪再延至 09-04（re-audit preparer 讀 9,069,321 bytes 超過 8,388,608 上限回 0、正式 report 不存在）——修正 commit c3fa4b6 已上 origin/main 但未經自然 run｜證據指針：active.md L132-136、`active/evidence-level-weekly-local-analysis-channel-2026-08-06.md`｜為什麼可能成題：自動化 audit 鏈的「chain 斷在 byte 上限」與「修好但還沒自然跑過」的真實運營細節——自動評測管線題材；連兩輪延輪是運營風險實例｜slug 候選：`an-to-flow-fail-reai-sy`｜題庫／帳本關係：無

---

## 肆、窗內量測翻案／層級 KILL 事件（3）

57. memory-ripple Qwen 層「測出沒用」KILE（2026-08-23）：Qwen binding 修好（6/6 新建檔正確偵測）但 3 筆真噪音到達取消分支 3/3 未取消→該層拆除、Gemini 改同步 3.7——「修好了但行為沒改變」的翻案型 | 證據指針：`active/memory-ripple-hook-2026-07-05.md` 第六輪段｜為什麼可能成題：同上 #50、層級 KILE 是評測誠實性的強案例｜slug 候選：`llm-judge-layer-kill`｜題庫／帳本關係：同上
58. skill-verify-tri-state 第三輪量測更正（2026-08-22 拍板、饋入 08-29 review；窗緣外一日記，附註）：CC harness 08-14 起 Task 改 async launch、verdict 落 sidecar——前兩輪解析器只讀 tool_result 造成樣本低估（報告 5 筆→實際 16 筆）——「量測誤差不是事實」的再現｜證據指針：`active/skill-verify-tri-state-2026-08-01.md` ⚠️ 段｜為什麼可能成題：評測量測被打翻案的完整案例（工具行為改了、解析器沒跟）——meta 評測題材，與 #50 連讀成姊妹篇｜slug 候選：`meague-tool-drift-in-verdict`｜題庫／帳本關係：無
59. evidence-level re-audit preparer 0 筆（2026-08-28）：9,069,321 bytes 超 8 MiB 上限——「chain 的一環靜默回 0」的運營翻案（連兩輪）｜證據指針：同上 #56｜為什麼可能成題：靜默 0 回傳是自動化鏈最難抓的失敗模式｜slug 候選：`silent-zero-in-pipeline`｜題庫／帳本關係：無

---

## 伍、機制帳本精簡對照結果

觀察中 8 條：cvs-handover、codex-claude-memory-bridge、memory-state-ripple、mechanism-decommission-decay、trigger-ownership-split、plain-language-hard-gate、single-truth-pointer-tombstone、claude-config-activity-curve——窗內 active.md／archived.index.md 均無同名 H2，也無明確換名重開的 trial；鄰近疑似對應（都非同名、不敢斷言）：memory-ripple-hook ↔ memory-state-ripple、concise-output-style-a-b／output-style-plain-language ↔ plain-language-hard-gate、personal-main-closeout-v* ↔ claude-config-activity-curve。全部標「待 main 語義比對」。

已否決 rebuttal-calibration：窗內無任何重提跡象（無 finding 發布成預設流程、無真實作者回覆）。

已升格 15 條／已併入 10 條：窗內無反向（被升格的機制沒有重新以 trial 名出現）。

## 陸、detail 檢查結果

- 50 個 detail 檔全數存在、49 條 H2 指針全數解析成功；detail-key 行與檔案路徑全部一致
- detail-title 與 H2 名稱全部一致（含 zoekt-locator [run-2] 的 duplicate suffix 對照）
- mismatch 1 筆：skillevaluator——active.md H2 `started: 2026-08-28` vs detail 檔名／檔內 install 日 `2026-08-27`（slug+started 主鍵差一日，屬輕度不符，未代讀、未覆寫）
- 殘留備註 1 筆：`active/personal-main-closeout-v2-2026-08-17.md` 存在但 active.md 已無對應 H2（SUPERSEDED 08-25 結案、長段未按 SOP 剪走）——archived.md 該結案段是否含完整長段待 main 對照（本掃描只讀 index 欄位、未假設 archive 內文）
- detail-missing：0

## 柒、零活動明示與備註

- 窗內無任何活動的 active trial：c068-answer-judge（review 09-09、無中介事件）、implement-background-worker-guardrails（08-31 到期、尚未見 review 紀錄）、routing-ab-current-policy（started 08-21 窗外、今日 08-29 到期、formal sample 仍 0——窗內無新樣本）、codex-policy-drift-nudge（08-29 到期、無延輪紀錄）、agent-contract-gate-reregistered（08-29 到期；窗內只有 08-25「補登檔」待辦三項，無 review 紀錄）、wokflow-observer（08-29 到期；窗口 note 三大 key 可能仍在累積，08-29 review 以現場數字為準）、ast-grep-cvs-piolt／wizar-skill／frction-loop／voltagent／tob-sepec／skil-verify／task-verifier（皆到期或在窗內無事件；後三者的 review 在 08-29 當日，ledger 無延輪紀錄）
- 備註：本掃描 session 自身曾被 archify-visual-gate 的 raw CLI gate 真實 fail-closed 擋下（Bash loop 檔名含 "archify" 字樣、hook 不判執行就 deny）——不計入窗內活動數，但可作該 trial「fail-closed 觸發」的側面實例證據；因該 hook 設計上即 fail-closed、屬預期行為，不列異常
- 零活動窗在 08-24 除了 implement-guardrails 開案外無結案／延輪；08-26 無結案（6 開案）；08-29 當日自前（含）無結案 entry——結案集中在 08-25／08-27／08-28 三波

## 附、最後計數（給 main）

- 掃過 active H2：49
- 窗內開案：29
- 窗內結案：20（KEEP 11／KILL 5／UNKNOWN 2／SUPERSEDED 1／KILL-機制轉移 1）
- 窗內延輪事件：8（7 條 trial；evidence-level 二次）
- 窗內量測翻案／層級 KILL：3
- detail-missing：0；detail-mismatch：1（skillevaluator 主鍵日期差一日）；殘留檔備註：1（personal-main-closeout-v2）
- 機制帳本同名對應：0（全部待 main 語義比對）