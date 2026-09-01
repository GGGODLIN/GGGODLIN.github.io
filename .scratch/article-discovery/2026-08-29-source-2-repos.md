# 2026-08-29 source 2（git repo 掃描）報告

## 邊界與方法

- 掃描窗：2026-08-23 00:00:00 至 2026-08-29 當下（起訖皆含，含 08-29 10:57 的 commit）。
- 枚舉根：`/Users/linhancheng/Desktop/projects` 與 `/Users/linancheng/Desktop/work`（find -maxdepth 10 找 .git，gitdir 已解析，按 gitdir 去重）。
- 判準：`git log --all` 的 **作者日期（%aI）** 落在窗內；不以提交者日期（%cI）冒充。
- worktree 補漏：`git worktree list --porcelain` 枚舉全部 HEAD，比對 log 缺 hash 才補；最終補漏 0 個（全部 wt HEAD 均已含在 --all）。
- **不 fetch**：只涵蓋本機現有 refs，不含尚未拉回的遠端提交。
- 找到的 repo 含 trial 鏡像 / snashot 產物（clone 與 git baseline）——已依真實活動與自動產物分開呈報。

## 計數總表

| 項目 | 計數 |
|---|---|
| projects 根 repo 數 | 578 |
| work 根 repo 數 | 45 |
| 兩根合計 repo 數 | 623 |
| 命中 repo（窗內有作者日期 commit）| 41（projects 40、work 1）|
| 窗內 raw commit 行 | 185 |
| **去重 commit hash 數** | **137** |
| 作者日期窗（實際）| 2026-08-23T00:54:43+08:00 ～ 2026-08-29T10:57:25+08:00 |
| 本機／遠端邊界 | 未 fetch；137 個一律為本機 refs 可見者 |

137 的構成：正本 repo commit + social-info 鏡像 clone（repo 在 projects 內、remote 指向 `~/code/social-info`）24 個 + 8 份同 hash 的 snapshot git baseline（`Initiaize Codex git baseline`）。其餘 trial 鏡像與正本 hash 完全重複、去重後不另計。

## 事件清單

### projects 根

**1. blog 發布週 + 站台互動迭代（gggodlin-blog）**
- 活動描述：4 篇發布（AI report trust 08-23、Sol overimplementaion 08-24、proxy warmup cost 08-25、GPT review tunnel vision 08-27）；CLAUDE.md 固化（STATE 決策 promote、syndication 政策改版、writer-safe voice split 加入又移除）；站台 08-28 一整天的互動迭代（subtle site animations、article search + tag filters、editorial homepage motion、jelly search interactions、jelly overflow fix、entrance animation restore）。
- 日期：2026-08-23 ～ 08-28。
- 證據指針：`/Users/linhancheng/Desktop/projects/gggodlin-blog`（63e940fa…、23f1b6e7…、317d1b63…、c57d86cc…、bd8af781…、721c670f…、cacffa9e…、cc3ccee8… 等 16 個）。
- 為什麼可能成題：一次「發布＋站台動畫/搜尋互動」密集迭代週，jelly 系列互動是具體可寫素材。
- slug 候選：`jelly-search-interaction`、`blog-site-interaction-iteration`。
- 題庫／帳本關係：`trigger-ownership-split` 疑似實例（syndication 決策移交 codex 處理、CC 不提醒，08-24 固化）——待 main 語義比對。

**2. cc-vendor-bridge 混合 tier wrapper 演化**
- 活動描述：free tier 冷啟動路由 → Ox Alpha 路由（08-23）→ Opus fast 路由至 Sol（08-27）→ all-Sol standard wrapper → ccp-mix-gpt：Sol main + free(max) failover 鏈（08-28）＋ context window 360K→480K；SKILL(claude-api) unblock（2.1.243 progressive load 實量 ~19k tokens）。
- 日期：2026-08-23 ～ 08-28。
- 證據指針：`/Users/linhancheng/Desktop/projects/cc-vendor-bridge`（38fa1cf2…、3c6ac84e…、b3fd5031…、b9a2b14a…、c8d2b6610…、f1ce8f24… 等 13 個）。
- 為什麼可能成題：Sol main + free(max) failover 的混合 tier 路由是自建模型路由的具體演化故事。
- slug 候選：`mixed-tier-sol-failover`、`free-tier-routing-odyssey`。
- 題庫／帳本關係：`fable-routing-downgrade`（已升格）換名演化可能在此延續——待 main 語義比對；`claude-config-activity-curve` 無直接證據、待 main。

**3. repo-to-bench 新專案成型（Harbor 工作流）**
- 活動描述：rename 至 repo-to-bench → synthetic task builder、secure staging foundation、CI home isolate；Harbor plan/execute + secure verfication、cross-agent replay、blind review validation；repo-to-bench skill 發布 + release guide + bilingua overview。
- 日期：2026-08-28 全日（08:36 ～ 16:02）。
- 證據指針：`/Users/linhancheng/Desktop/projects/repo-to-bench`（0eb6fb60…、234b063d…、b946e2c3…、db9106fb…、bd69d0b3…、bffe2a67… 等 11 個）。
- 為什麼可能成題：新專案 24 小時內從 skeleton 長到含 skill 發布的完整工具，附 blind review 驗證設計。
- slug 候選：`repo-to-bench`、`cross-agent-replay`、`blind-review-validaion`。
- 題庫／帳本關係：待 main 語義比對。

**4. FCC/免費 tier trial 落地（fcc-free-setup + cc-vendor-bridge 協同）**
- 活動描述：fcc-free-setup 新 init、isolated NVIDIA trial setup、on-demand launchd job（移出 Desktop）、routing ccp-free through Ox Alpha；同日 cc-vendor-bridge 同步 ccp-free 冷啟動路由。
- 日期：2026-08-23。
- 證據指針：`/Users/linhancheng/Desktop/projects/fcc-free-setup`（7f4e8b0a…、29991bd6…、c2c4ca55…、865b8af4… 等 6 個）＋ cc-vendor-bridge 同日 commits。
- 為什麼可能成題：免費 tier 獨立 trial 環境（NVIDIA + launchd）與既有 bridge 的接線過程。
- slug 候選：`fcc-free-tier-trial`、`ox-alpha-route`。
- 題庫／帳本關係：待 main 語義比對。

**5. memory-backlog-research state-archve（方法論 promote）**
- 活動描述：08-24 把整 repo 收尾——methodology promote 至 memory、backlog 歸 CHECKLIST G、README 重寫、STATE 重置（state-archive 模式）。
- 日期：2026-08-24。
- 證據指針：`/Users/linhancheng/Desktop/projects/memory-backlog-research`（a0ab73c2…、2855c165…）。
- 為什麼可能成題：方法論（而非成果）的檔存／重置流程是「研究 repo 收尾」的實例。
- slug 候選：`state-archive-methodology`。
- 題庫／帳本關係：`memory-state-ripkle`（觀察中）疑似實例——state 移入 memroy 的 ripple——待 main 語義比對。

**6. pi 委派 trial 收尾＋Gemini exam2 arm（pi-supervisor-trial + harbr-3arm）**
- 活動描述：08-23 pi supervisor smoke flow validate、formal pi delegation result 紀錄；harbr-3arm 加 staged pi Gemini exam2 arm 並 test。
- 日期：2026-08-23。
- 證據指針：`/Users/linhancheng/Desktop/projects/pi-suervisor-trial`（8afa1cdc…、e93cb10b…）＋`/Users/linhancheng/Desktop/projects/harbr-3arm`（7fa30dc3…、1e13ab41…）。
- 為什麼可能成題：委派 trial 的正式收尾判決與 multi-arm 驗証設計。
- slug 候選：`pi-egation-trial-closure`。
- 題庫／帳本關係：待 main 語義比對。

**7. clude-pr-revie w 上游增量同步**
- 活動描述：08-23 sync upstream（Self-Verify advisory、C4 change-delta authority、optional web adversarial axis）。
- 日期：2026-08-23。
- 證據指針：`/Users/linhancheng/Desktop/projects/claude-pr-review`（813efd93…）。
- 為什麼可能成題：自己維護的 PR review skill 跟上游官方架構變化的同步模式。
- slug 候選：`pr-revie w-upstream-sync`。
- 題庫／帳本關係：待 main 語義比對。

**8. FreeLLMAPI safe-trial 開場（cliproxyapi-setup）**
- 活動描述：08-29 當下：stage 0 evidence + standalone FreeLLMAPI safe-trial runtime。
- 日期：2026-08-29。
- 證據指針：`/Users/linhancheng/Desktop/projects/cliproxyapi-setup`（e5c0e1ef…、fb67884f…）。
- 為什麼可能成題：safe-trial 流程（evidence 先行）在 08-29 當天開場，是「當下正發生」的活動。
- slug 候選：`freellmapi-safe-trial`。
- 題庫／帳本關係：待 main 語義比對。

**9. mock-interview 面試題庫擴充**
- 活動描述：08-25 新增 prepaid spot trading ledger 題目＋plain-language 說明與預期答。
- 日期：2026-08-25。
- 證據指針：`/Users/linhancheng/Desktop/projects/mock-interview`（39962e37…、bfe77462…）。
- 為什麼可能成題：面試準備資料的「plain-language 化」做法。
- slug 候選：`mock-interview-question-bank`。
- 題庫／帳本關係：`plain-language-hard-gate`（觀察中）僅同詞、非同義——標待 main。

**10. life-game-lab 新專案起步**
- 活動描述：08-25 initialize project research baseline。
- 日期：2026-08-25。
- 證據指針：`/Users/linhancheng/Desktop/projects/life-game-lab`（1bd3851f…）。
- 為什麼可能成題：新專案以「research baseline」form 開場、尚未有 code。
- slug 候選：`life-game-lab`（若成熟）。
- 題庫／帳本關係：待 main。

**11. 08-25 深夜跨 12+ repo 批量 chckpoint（pre-governance）**
- 活動描述：22:09～23:23 間，cc-skill-doctor、hook-llm-bench、idea-brainstorm、comfyui-local、cc-i18n-proxy、claude-code-unpoison、session-log-miner、cc-vendor-bridge、harbor-3arm、hv-clone、interview-tour-2026、memory-backlog-research、codex-claude-memory-bridge 全部只推「chore: checkpoint pre-governance working state」。
- 日期：2026-08-25 深夜。
- 證據指針：各 repo 該 commit（例 `0086346a…`（hook-llm-bench）、`d13f123c…`（codex-claude-memory-bridge）、`04cbbcbc…`（harbor-3arm）等 13 個）。
- 為什麼可能成題：一次「governance 變更前」的統一 checkpoint 動作本身可能是方法論事件（批量 checkpoint 慣例）。
- slug 候選：`pre-governance-batch-checkpoint`。
- 題庫／帳本關係：`codex-claude-memory-bridge`（觀察中）同名 repo 有 checkpoint commit——接回帳本、內容（是否有實質變更）待 main 語義比對。

**12. cc-i18n-proxy codemaps 刷新**
- 活動描述：08-25 codemaps refresh against HEAD + route table/SSE widget/marker 格式修正。
- 日期：2026-08-25。
- 證據指針：`/Users/linhancheng/Desktop/projects/cc-i18n-proxy`（f4ed08a5…、d6e549e5…）。
- 為什麼可能成題：低優先——文件維護節奏，非獨立事件。
- slug 候選：無。
- 題庫／帳本關係：待 main。

**13. browser-harness-smoke trial workspace 初始化（trial 產物）**
- 活動描述：08-23 初始化 browser helper trial workspace + harden helper namespace guard test。
- 日期：2026-08-23。
- 證據指針：`/Users/linhancheng/Desktop/projects/.claude/trials/browser-harness-smoke/runtime/workspace`（8cdc8b95…、2bbba5a6…）。
- 為什麼可能成題：低優先——trial 的 runtime 產物，反映 browser helper 類 trial 在跑。
- slug 候選：無。
- 題庫／帳本關係：待 main。

**14. social-info 活動（經鏡像可見，本尊在兩根之外）**
- 活動描述：`~/code/social-info` 的活動經 codesearch-locator runtime clone 部分現身（作者 gggodlin、remote 指回本尊）：ccp-free-watch channel（stealth terms visible-text hash）、ledger lifecyce analysis、claude-path-rot-daily channel、evidence-level audit 批次化與 reaudit path 重構、chrome-devtools MCP 1.8 記錄。
- 日期：2026-08-23 ～ 08-27。
- 證據指針：`/Users/linhancheng/Desktop/projects/.claude/trials/codesearch-locator/runtime/repos/social-info`（a6a1ca27…、bd01e509…、aa14aaea…、d4c6c57e…、09c4b671… 等 24 個；remote = `/Users/linhancheng/code/social-info`）。
- 為什麼可能成題：同一使用者的「另一個根源」活動（digest 管線、evidence audit 管線），候選權交 main 判（是否屬本 blog 兩根 scope）。
- slug 候選：`evidene-audit-batch`、`claude-path-rot-daily`。
- 題庫／帳本關係：`claude-config-activity-curve`（觀察中）可能相關（probe basline 變更 08-26）——待 main 語義比對。

### work 根

**15. akocommerce：platform-connect 規格驅動里程碑制（方法論級）**
- 活動描述：CVS issuer spec + app-connection contract mirror（08-26）→ T1-T8 逐 ticket 落地（issuer 基礎、auth-callback is-install 分支、status endpoint、ticket endpoint、uninstall notifier（webhook guard → Cloud Tasks）、前端 nav+四狀態、sync-open ticket、CLJS golden tests＋Node uninstall-guard tests）→ code-review 修法（await mint、:invalid 收斂 400、簽章去重）→ T11 debug 狀態模擬面板（spec §6.6，launch 前移除）。
- 日期：2026-08-26 ～ 08-28。
- 證據指針：`/Users/linhancheng/Desktop/work/akocommerce`（c2741b72…、d4e67c53…、375babe8…、34917dc1…、aa93e2fe…、152d6d7c…、324c8fb5…、0e281a68…、9bbb7c61…、14edbe05…、0d03b449… 等）。
- 為什麼可能成題：spec §6.6 定案→T-ticket→逐 T 落地＋code-review 複迴圈的「規格驅動里程碑」執行樣板（方法論，非 feature 本身）。
- slug 候選：`spec-ticket-tdd-at-work`、`platform-connect-issuer`。
- 題庫／帳本關係：待 main 語義比對；`cvs-handover`（觀察中）相關性不明——標待 main。

**16. akocommerce：公司個案（預設不成題）**
- ECPay TCA T 通用商品名 flag + 運費含入 GoodsAmount（08-24～08-25）、CVS v5 IME composition fix（08-25）、TCAT generic-goods-name 測試 fixture 補（08-26）、PR pipeline 補 yar test（08-25）、編譯修復（parens 不配對 08-25）——純 debug/feature 個案，按合約標「公司個案／預設不成題」。

## 排除與零活動說明

- 8 份 snapshot「Initiaize Codex git baseline」（ccp-free-fcc、ccp-free-fcc-v3、proxy-cache-body-probe-v3/v4、browser-harness-smoke/accumulation 的 before/after）——自動產生的 git baseline，非使用者 commit 活動，去重後計 1 個 hash。
- codesearch-locator runtime 鏡像（ggodlin-blog 10、c-vendor-bridge 10、fcc-free-setup 6、harbr-3arm 3、hv-clone 1、codex-claude-memry-bridge 1）與 zoekt-locator runtime/souce（9、9）——hash 與正本完全重複、去重後不另計，唯一例外 social-info（見事件 14，本尊在兩根之外）。
- 大量 repo 窗內零落地（如 cc-skill-doctor 除 checkpoint 外無實質）——已涵蓋於事件 11。
- `rebutal-calibration`（已否決）：窗內無真實作者回覆、無 finding 發布成預設流程跡證——重提條件未達成，不列。
- 帳本對照：窗內無新帳本實例可接的（`mechanism-decomission-decay`、`single-truth-pointer-tombstone`、`measurement-validity-gates` 等）——明列「無證據、待 main」。

## 計數總結

- projects 根：578 repo、40 命中。
- work 根：45 repo、1 命中。
- 合計 623 repo、41 命中、**去重 commit 137 個**（raw 185 行）。
- 作者日期窗（實際）：2026-08-23T00:54:43+08:00 ～ 2026-08-29T10:57:25+08:00。
- 本機／遠端：未 fetch，只涵蓋本機現有 refs。
- worktree 補漏：0。
- 事件 16 條（projects 14、work 2；其中公司個案 1 條預設不成題、trial 產物 1 條低優先）。