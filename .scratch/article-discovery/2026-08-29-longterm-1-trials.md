# 長期機制大盤點：trial 生命史線（2026-08-29 現況）

> 編制日期：2026-08-29；終點＝2026-08-29 帳本現況，不設歷史窗。
> 資料源：`~/Desktop/projects/.claude/trials/active.md`（50 H2）、`trials/active/*.md`（50 detail 檔，49 對應＋1 孤兒）、`archived.md`（253 結案段）、`archived.index.md`（149 索引行）、`docs/philip/blog-mechanisms.md`（機制帳本）。
> 只整理資料、不替使用者拍板；memory／markdown 狀態宣稱一律不當採用證據，找不到行為證據明標。
> 「證據點數」＝同一事件跨檔只算一次（trial 帳本、memory、git 同源事件只計 1）。

---

## 0. 帳本結構現況（先對帳再盤點）

| 檢查 | 結果 |
|---|---|
| active.md H2 數 | 50 |
| active.md detail 指針數 | 50 |
| 指針對應 disk 檔 | 50/50 全存在（detail-missing：0） |
| detail 檔前兩行 `detail-key`／`detail-title` 身分核對 | 50/50 相符（detail-mismatch：0） |
| disk 孤兒檔 | 1：`active/personal-main-closeout-v2-2026-08-17.md`——v2 已於 2026-08-25 以 SUPERSEDED 結案（archived.index.md 有列）、整段剪走後 detail 檔未搬，屬**畢業後殘留**（正是 mechanism-decommission-decay 形狀的實例） |
| archived.md 結案段 | 253（`###` 標題數） |
| archived.index.md 索引行 | 149（另有 104 筆舊式標頭未建立索引行，含 6 筆 UNKNOWN legacy） |
| 索引 VS 主檔 | 不一致：149 索引行 vs 253 結案段；早期（5–6 月）與部分 7 月 legacy 段缺索引行 |
| detail-missing 明列 | 0 筆 |
| detail-mismatch 明列 | 0 筆 |

**帳本生命史殘留面**（全部為「結構缺陷」類新發現，無一有行為證據）：`personal-main-closeout-v2` detail 檔殘留、`archived.index.md` 對 archived.md 覆蓋率 149/253、`zhtw-mcp`（7/03 KEEP）與 `semble-docs-mcp-cli-記憶體改造`（8/22 KEEP）皆「chapter 無對應 archive 資源目錄」無法對出。

---

## 1. 已成熟（2 項）

### 1-1. 機械巡守：claim-detect / memory-ripple 機械層 → 本地模型判官 → 外部同步判官 → 純 code gate 的移除求生記

- **slug 候選**：memory-ripple-regex-llm-sync-judge-evolution
- **顯示名稱**：記憶反轉提醒的機械→模型→同步判官演化線
- **證據點數**：4（第四輪雙判官 08-13、第五輪假綠根因 08-20、第六輪拆 Qwen 改同步 Gemini 08-23、v3 上線 commit c39a216 08-23；每輪只計一次、不含首輪）

  補充：Qwen 採用（08-13）＋Qwen「測出沒用」拆除（08-23）、Gemini unavailable 0%（08-23：28 次 API final unavailable 0%）、Gemini 真補 2 次（`9637`→commit 5314267 修 2 檔、`fe57` 高度可能）。memory-ripple 在機制帳本為 `memory-state-ripple`（觀察中，指 #32）。

- **生命史摘要**（memory-ripple-hook，start 07-05 → 至今 08-30 review）：
  - 首輪 07-20：15 天 255 寫入 / 119 fire（47%），sibling cap 20 飽和 83% → cap 8＋截斷＋措辭。
  - 第二輪 07-29：157 筆、餵第三判官（gemini）補漏，機械命中 63.1%。
  - 第三輪 08-06：機械 v2 只認明確完成式＋本機 LLM shadow（detect-only）；但 GLM/grok 判官回放 0 承接。
  - 第四輪 08-13：Qwen 限「PreToolUse 收據可證寫入前不存在」的 Write 才給取消權＋Gemini 非同步補漏（真漏網 8/13、153 次判定零漂移）。
  - 第五輪 08-20：根因「測試假綠」——fixture 給了真實 Write 不會提供的 `success:true` → 修正後 RED 156/6→GREEN 162/0。
  - 第六輪 08-23（使用者拍板「b＋同步＋3.7」）：72 筆自然寫入、Qwen 3/3 未取消 →「測出沒用」拆除；Gemini 25 scheduled→25 judged（28 次 API、final unavailable 0%）、11 positive（人工重評 10 真 1 措辭、1 新檔漏抓）、8/8 送達有 receipt，但**送達後對非觸發檔真補只有 1 確認＋1 高度可能**（13 筆 pending 殘 5 筆永停）。
  - 三模型離線回放 74 筆：gemini-3.7-flash-high（預備接手）vs 現役 3.5-low vs gpt-5.3-codex-spark（開 70 槍無鑑別力、與 07-29 archived 判官結論一致）→ v3 上線（拆 Qwen／prewrite／deliver／reconcile／llm-shadow；runtime 1087→481 行；每事件同步問 gemini-3.7-flash-high + MEMORY_RIPPLE_DISABLE_GEMINI kill switch、fail-open）。

  **機械→模型判官→同步＋kill-switch 的演化形狀**是完整「多次實作逐漸成熟」模版：每次 review 都帶真實事件母體與誤報／漏抓對帳，判官鑑別力不足會被拆掉而非增加閘門；目前 Gem 分型已被對帳證實可運作，只差「行為採用」與「配額消耗」兩個未竟項。08-30 review 門檻：(1) 送達後對非觸發檔 sibling 真修 ≥2 且 0 繞路；(2) Gemini 取消全量人工標註、錯擋 0；(3) Gemini unavailable ≤10%、p90 ≤8s；(4) `gemini_*` audit 對帳。已知殘留：`~/.claude/runtime/memory-ripple/` 測試目錄未搬（dcg 擋）、Gemini 配額消耗未量。

- **證據指針**：`trials/active/memory-ripple-hook-2026-07-05.md`（六輪全記）、`review-evidence/2026-08-23-80ee6d7b.md`、`~/.claude` commits（`4dfbfcf`、`f6db431`、`c39a216`、`5314267`）、blog-mechanisms `memory-state-ripple` 條目（證據列 07-25～08-22，錯誤指出「升級條件：第五輪後再決定是否併入 #32」——缺口已由 08-23 第六輪局部補上）
- **題庫／帳本關係**：blog-mechanisms `memory-state-ripple`（觀察中，最後檢查 2026-08-23）；題庫 #32（可能合併方向、#32 已收本項為 🔧 補強）。帳本標「目前缺口：整體召回率一次都沒算出（缺完整 should-fire 母體；影子觀測尚無一週資料）」——08-23 第六輪已把「子集對帳」做過、但仍無全面母體 recall。
- **可能成熟的理由**：六輪完整生命史從喜燒資料演化，機械層與 UI 已分離，Gemini 同步鏈有 25/25 judged＋真補 2 例；Qwen 被拆除而非被補強（判官鑑別力不足＝成熟過程而非失敗）；「拆除殘留機制」（Qwen、`memory-ripple-*` 目錄未搬）本身就是 mechanism-decommission-decay 的活案例。
- **仍缺什麼**：**行為採用證據只有 2 例**（送達後真修）；recall 母體未算過；Gemini 配額消耗未量；v3（同步）尚無自然事件計算「送達→真修」的完整閉環。→ 不能宣稱已成熟，只能算「機制多次實作、長期未結」。

### 1-2. evidence-level 七日抽驗線（rule-adherence-detectors → evidence-level weekly channel）

- **slug 候選**：evidence-level-weekly-offline-audit-lineage
- **顯示名稱**：證據級別七日離線抽驗鏈的「手動 detector → 定時抽驗 chain」演化線
- **證據點數**：3（首輪自然 run 08-13、第二輪 08-20、修正 c3fa4b6 已上 main 但尚未自然 run 08-28；含定期 08-06 receiver）

  補充：首輪改動「第一支 FAIL 直接 FAIL；第一支 PASS 才交全新 auditor；兩支 PASS 才正式 PASS」＋digest 只讀 finalizer Top 2；修正 commit `c3fa4b6` 已推 `origin/main`（但 08-28 re-audit preparer 讀 session 9,069,321 bytes > 8,388,608 上限回 0，尚未經自然 run）；08-20 首輪 auditor 2 PASS/18 FAIL、完整鏈續跑成功、正式產物 14/14 完整、digest 正確讀 Top 2。

- **生命史摘要**（start 08-06 → 至今 09-04 review，四輪 review 全延、修正都在「run 前」）：
  - 由 `rule-adherence-detectors` 結案（08-06 KILL 逐則偵測）後接棒：每天 preflight、滿七天抽 ≤20 筆，交僅有 Read 的 Opus auditor，第一輪 PASS 再第二支獨立 auditor，確定性 finalizer 產正式報告。
  - 四輪 review 都是「自然 run 出錯 → 修正 → 延輪」：首輪（08-13）單支 auditor 誤判 9/10 → 改 2-PASS 制＋P0 複審補 v2 `--audit-b64` 跳過洞；第二輪（08-20）re-audit preparer 回 0 未進第二支 auditor；第三輪（08-27）auditor Read offset=0 修為從實際 firstLine 重建（a0c744b）；第四輪（08-28）re-audit 超收上限回 0（c3fa4b6）。
  - 始終未達成「無人工介入完成完整鏈」；進度是修正越抓越細（offset、上限、雙 auditor），可歸因的採用證據是 **0**。
- **證據指針**：`trials/active/evidence-level-weekly-local-analysis-channel-2026-08-06.md`（含 review-log 08-28 延輪至 09-04）、`~/.claude/workflows/local-analysis.js`、`agents/evidence-level-auditor.md`、`~/code/social-info/scripts/local-analysis/`（rubric / weekly.sh / sample.mjs 與 tests）
- **題庫／帳本關係**：無專屬機制帳本條目；上游 `rule-adherence-detectors` 帶二偵測器（evidence-level 轉離線抽驗）；屬「evidence-level」線，題庫 #83（measurement-validity-gates → 已升格）的執行面延伸。
- **可能成熟的理由**：機制具「自動 run→雙 auditor→finalizer→digest」完整鏈、每輪修正都治到真實出錯（offset=0、超大 session 上限、fetch 後才比對 master），而且它到自己說的「無人工介入產正式報告」只有一步（c3fa4b6 尚未自然 run 驗證）。
- **仍缺什麼**：**無人工介入完成一次正式 run**（尚未達成）；PASS/FAIL 母體零採證據（12+ 場 audit 帳面人工續跑才有產物）；未 KEEP。→ 只能算「修正疊加、長期未結」、不是已成熟。

---

## 2. 持續觀察（9 項）

### 2-1. memory-ripple 家族（承 1-1 的未竟窗）
- **slug 候選**：memory-ripple-hook（沿用 H2 名）
- **顯示名稱**：memory 狀態反轉 ripple 提醒（可拆的六輪）
- **摘要取向**：行為採用只 2 例；recall 母體未算；Qwen 已拆、Gemini 同步鏈將在 08-30 第一輪正式驗。「升格」敘事保持延後。
- 合併進「已成熟」的橋段不再重複，此處列**待觀察窗**：08-30 review 五門檻、Gemini 配額、`memory-ripple-*` 測試目錄殘留、`memory-state-ripple` 帳本「併入 #32」仍需拍板。

### 2-2. T9 archive-reviewer-gate（四輪、環境消失）
- **slug 候選**：t9-archive-reviewer-gate（沿用）
- **顯示名稱**：openspec archive 前的 reviewer 強制 gate（環境退場案例）
- **證據點數**：3（首輪 08-10 採用率 2/5=40%、第二輪 08-17 走通 ask→receipt→allow、第三輪 08-25 環境拔除）；證明「採用率」有量、但該樣本對 gate 貢獻 0（08-18 Phase A reviewer 在 gate 首 fire 前 2.5 分鐘已跑完、屬 T7 debt 驅動）。
- **生命史摘要**：第一輪基線採用 1/20（5%）、加 gate 後 2/5（40%，不能歸因）；第二輪修正引號誤攔（5 天 5 次全為資料命中）＋維持強制 ask→receipt；第三輪環境事實重驗——使用者 08-18 離職、08-23 `git reflog` 顯示 `.claude/hooks/`／`settings`／`.worktrees`／`docs/philip/harness-friction.md` 全被手動 offboard、hook 已不存在、`~/.claude` 零接線、「T9 只認直接指令 + cwd 釘 worktree」兩個已知死穴。第四輪 focus：問新公司 repo 是否採 openspec → 是則重建（原檔已清空、無備份）、否則 KILL＋promote 三教訓（PreToolUse 被「請使用者手動跑」繞過、cwd 重設多 worktree 失效、環境退場未連動 trial ledger——**同 install point 的 t5-post-grep-nudge 08-28 KILL trial 已證環境消失**）。
- **證據指針**：`trials/active/t9-archive-reviewer-gate-phase-a-reviewer-採用率觀察-2026-07-10.md`、`review-evidence/2026-08-25-7f76f8a0.md`、akocommerce 原始 repo（已離職可讀性未知）
- **題庫關係**：機制帳本 `/`（無條目）；T9 的歷史採用率把「reviewer 流程歷史採用 1/20」寫成開案理由。
- **可能成熟的理由**：四輪全帶真實 archive 樣本＋環境退場實錘；「環境消失」這個死因本身是全帳本最乾淨的 mechanism-decommission-decay 素材。
- **仍缺什麼**：新條件（09-01 新工作）未知；若公司 repo 沒有 openspec，本線的「價值前提」消失、只能 KILL。→ 事件驅動 pending，直至新 repo 揭曉。

### 2-3. bruce-workflow-monitor（先 KILL 再返場）
- **slug 候選**：bruce-workflow-monitor-presumptive-thresholds（沿用）
- **顯示名稱**：Bruce 服務穩定度 presumptive 閾值門（返場案例）
- **證據點數**：2（07-24 archived KILL——health 軸一次考驗、26 天路徑未用；08-17 補登返場——死欄位 `healthPercent` 三次採樣恆 0 且同期 `serviceStabilityPercent` 99–100）。

  補充：07-24 KILL 時原 arch 已拆；08-17 以「補登」重新 anchor（被 `~/.claude/commands/bruce-workflow-monitor.md` 引用一個多月但 ledger 無 H2 = 原本整段觀察期沒接上 hook 提醒）。stability gate 已改顯式 `(( THRESHOLD > 0 ))`，pause ≤50 / resume ≥70（未校準推測值）。**08-25 延輪→事件驅動 backstop +30**（review-log：觀察窗 0 arm、health log 僅設定日 4 筆、command 0 invoke，到期跑「log 有無新樣本／healthPercent 是否復活」回顧性對帳）。
- **題庫關係**：無；開案理由引 `feedback_dead_metric_pins_low_is_bad_gate`（因為 healthPercent 釘 0 的「低＝壞」gate 死穴）。
- **可能成熟的理由**：KILL→返場→再延的三段生命史證明「0 觸發不是測出沒用」；stability 被唯一一次真實考驗（07-24）通過；返場後有明確回顧對帳點（09-24）。
- **仍缺什麼**：自 08-17 至今窗口 0 arm；「stability 觸發→需要暫停」的實戰從未發生；健康線只在設定日有 4 筆。→ 純事件驅動、樣本近零。

### 2-4. tob-spec-review-axis（四輪、自然門檻）
- **slug 候選**：tob-spec-review-axis（沿用）
- **顯示名稱**：/pr-review 的 formal spec-compliance-reviewer 軸（C4）
- **證據點數**：4（07-30 NEEDS_CHANGES 四缺口、08-06 首自然樣本 fail-closed、08-13 3/5 核心跑通＋兩交接漂移、08-20 3 案 SKIPPED）；「可用」「隔離」被證、但「自然 ELIGIBLE」樣本至今 0。

  補充：08-20 全量掃 2,817 主 session JSONL 找 3 個自然 /pr-review，三案全 SKIPPED（`NO_QUALIFYING_CLAUSES` 等）、formal dispatch 0；08-13 的 11 個自然 session 有 5 個 ELIGIBLE、dispatch 5/5 exactly-once（其中 3 個 BOUND＋C4_VALIDATED 固定 opus-5/xhigh/0 tools）；08-06 首個自然樣本 (#4877) 在「手抄 hash 抄錯」上 fail-closed，證明 reducer 是安全終點。08-23 使用者拍板（在 pr-review-c4-layer-trial-window 內）更放寬 C4 authority 到 change delta（新 reason code `C4_CHANGE_DELTA_AUTHORITY_RESOLVED`），並以 #4933 真實 commit 合成實跑一跳：BOUND＋0 finding（「本機史上第一次真實派工」）。
- **題庫關係**：無專屬機制條目；屬 `/pr-review` 層套、與 pr-review-self-verify-adoption、pr-review-c4-layer-trial-window 同源；#91（spec-review-round）與 #114 相關。
- **可能成熟的理由**：四輪全部「修接線→延輪」而非 KILL；dispatch-envelope／PreToolUse gate 已消除「手抄漂移」；C4 authority 已放寬到 change delta。
- **仍缺什麼**：**自然 ELIGIBLE 樣本 0**（KEEP 門檻 3/3 BOUND＋C4_VALIDATED、dispatch=1、tools=0、informal 誤派 0）；合規範本的核心「跳 BOUND＋admitted finding」從未自然發生。→ 09-07 backstop 前若新工作 repo 有 openspec+公司 PR 才有樣本。

### 2-5. pr-review 新層組合窗（self-verify＋C4＋report 發布 enforcement）
- **slug 候選**：pr-review-c4-layer-trial-window（沿用）
- **顯示名稱**：/pr-review 08-01 後新層（C4／Self-Verify／投影嚴格路徑）觀察窗
- **證據點數**：4（08-23 第 1 輪 review：3 場真實 run、Self-Verify 派 2/3 各抓 1 真缺口、投影 helper 2 場成功、C4 3/3 SKIPPED＋使用者拍板放寬＋合成實跑；另 pr-review-self-verify-adoption 08-20 補 1 筆「3 場中 1 場沒接上」（#2261、額度中斷後直接 Write main））。

  補充：`pub_report_pair` 發布由「無 enforcement」升成 PreToolUse Write|Edit gate（a177692）；TDD RED 2 failure/GREEN 15/15；真實 smoke 對 `/tmp/pr-999999-review.md` deny；projection helper 84/84。09-07 只對帳一題：新工作有沒有跑到帶 openspec spec 的 /pr-review、C4 有無 admitted finding。
- **題庫關係**：#91、#114（review-premise-inheritance 已升格併入 #114 補強）；pr-review-feedback-rules-outcome（已 KILL）。
- **可能成熟的理由**：上層窗判準已部分達標（Self-Verify 真抓 2 virus、helper 2 場成功）；C4 authority 已放寬到 change delta、有合成實跑。
- **仍缺什麼**：C4 自然 admitted finding 0；report 發布 enforcement 只在 fixture/smoke 驗；票 01–05 解凍狀態未收斂。→ 09-07 backstop 前樣本稀缺（09-01 換工作）。

### 2-6. task-verifier 雙路對照（direct Agent vs verify-task workflow）
- **slug 候選**：task-verifier-workflow-enforcement（沿用）
- **顯示名稱**：驗收員的 criteria 完整性交給純 JS 的 workflow enforcement（v1→v2 對照）
- **證據點數**：3（08-15 初始 evidence 27/27＋兩真實 run、08-22 首輪 review 自然 opt-in v2 0、08-25 unlazy 掛件摘要）。**結論目前是「沒接上」（適用場景 23 次但機制從未被叫起來），不是「沒出題」、不是「測出沒用」。**

  補充：08-15 後 43 個 wf_ 目錄 0 個 verify-task v2 run；direct Agent(task-verifier) 23 次 0 次帶 v2 marker；接線根因三層（description frontmatter 自動注入 vs workflows/ 無 context 可見、Workflow tool 自帶 opt-in gate、caller 啟動成本未排除）。RED→GREEN：RED 的 headless agent 全程不提 verify-task、自行想像 fan-out；GREEN 版組出完整 args 並停在「你說跑我就送」。08-25 掛件：unlazy absorb-pack 拍板「等本 trial 結案再吸」（criteria 靜態 lint＋需求修訂協議）。
- **題庫關係**：無專屬條目；接線文已落 `rules/common/dispatch-and-verify.md`（「驗收項 ≥3 先提 verify-task」）。
- **可能成熟的理由**：純 JS 導出 verdict（PASS→2-PASS、PARTIAL→漏項）已由 fixture 三型驗證；RED→GREEN 證明提醒能改變選路。
- **仍缺什麼**：**v2 自然採用 0**；若 08-29 再 0，需分辨「接線未命中」vs「啟動成本死因」，不得以「採用未驗證」延第三輪。→ 與 routing-ab 同屬「使用次數不足就可能 EXTEND」型。

### 2-7. routing-ab-current-policy（「目前政策」A/B 每日比對）
- **slug 候選**：routing-ab-current-policy（沿用）
- **顯示名稱**：/implement 的 inline-current vs subagent-resolved 路由 A/B
- **證據點數**：2（08-22 fresh smoke 006 兩臂 accept 4/4、position-swap 兩次一致判 routed_win；08-21 開案因 closeout review 抓到 snapshot／acceptance／cost／denominator 假綠而 preflight-blocked→修正後才 active）。

  補充：snapshot acceptance（兩臂各 4/4）、paired cost delta、Harbor 對帳（first=exported/second=duplicate）；smoke 成本 1.42 equivalent API cost（無 provider billing receipt）；fresh-001～005 timeout 等 failure artifacts 全保留、fresh-006 supersede；all smoke experiments 排除在 formal sample 分母外（formal sample 仍 0）；phase gate：active/extended 時 Tickets 11–17 保持 blocked，KEEP/MODIFY/KILL 才有 hash-bound receipt 解鎖 Changed-file phase。
- **題庫關係**：題庫 #140 系列（#133、#134？）——實際 `blog-candidates-v5` 08-23 把「routing A/B harness 接進 implement」掃進手稿的「hook/automation」系；有 routing-ab 素材手稿。
- **可能成熟的理由**：機制可重複、有明確 verdict 出口（KEEP／MODIFY／KILL／EXTEND）、smoke 已跳 BOUND；「formal sample 仍 0」是唯一未竟。
- **仍缺什麼**：**formal samples（非 smoke）0**；分母不足（window 新 session 派工 <50）一律 EXTEND；cohort 切換（模型／policy digest 變）會 reset。→ 08-29 review 很可能只到 EXTEND。

### 2-8. workflow-observer（自補登的 observer）
- **slug 候選**：workflow-observer（沿用）
- **顯示名稱**：Workflow 執行證據比對與 mismatch 偵測 observer
- **證據點數**：2（08-22 補登＋已知內部失敗 53/51/51、08-27 從 workflow-general.md 轉入兩個 exact key）。判斷：三大 key 08-22 07:54Z 仍持續累積、self-verify 複讀 58/56/56、08-27 再轉入 2 key；有內生噪音（同 run 三計、1 MiB stdin 上限、payload 過長 fail-open）。
- **題庫關係**：無專屬；與 friction-loop-protocol（通用摩擦協議）共用 `friction/workflow-general.md` 待折機制；`8023506` 落地時本 trial 沒登還自行寫進待折段。
- **可能成熟的理由**：observer 若把 Workflow 失敗都送進 friction ledger，會是「機制比 ledger 自己還誠實」的案例。
- **仍缺什麼**：**七天內是否仍每天累積／有新 key** 未定；若是（三大 key lastSeen 繼續前進）→ 修 enqueue 面、否則 KILL。→ 08-29 判讀。單一證據、low confidence。

### 2-9. gpt-convergence-reminder-hook（三臂分帳）
- **slug 候選**：gpt-convergence-reminder-hook（沿用）
- **顯示名稱**：GPT 主 session 的 → 實作收斂提醒（前測／A／B 三臂）
- **證據點數**：3（08-13 開案 baseline、08-20 改 finding-level、08-27 收窄 model resolver）。08-27 下輪只收修正後新樣本、至少 3 自然 GPT 實作 session；「已驗」= 送達（120/120＋compact 30/30＋`ZQX7741` marker probe）、「未驗」= 行為改善（review 重啟／無變更重跑／綠後尾巴）。

  補充：三臂對照（前測 7/14–8/12 無 hook＋會 compact、後測 A 8/13–8/16 有 hook＋會 compact、後測 B 8/17–8/20 有 hook＋幾乎不 compact）；指標歸屬：compact 補送達率只採後測 A、startup 送達與三項 behavior 三臂都採。08-20 finding-level 翻案：35 個 reviewer 輪中 22 有出題、120 findings（6 blocker 114 non-blocker）、fixed 15／user-explicit 16／not-fixed 88／uncertain 1；0 輪「confirmed functional 卻不動 non-blocker」但至少 2 輪留下已確認的功能性 HIGH。
- **題庫關係**：`blog-candidates-v5` 已把「#134 GPT 不是停不下來，是看不見停止線」列入（08-27 使用者拍板現在成文，trial 後測只作中間觀察、不等收案）。重要：**這題已成文路徑，trial 自身仍待 KEEP**。
- **可能成熟的理由**：找出「GPT 不是停不下來、是看不見停止線」的模型 observation 有獨特敘事；hook 送達 100%＋誤觸 0 已證；review-heavy 基準（12/12 session 至少 compact 一次、27/29 之後仍有 review）為行為地圖。
- **仍缺什麼**：**行為改善未達 KEEP 門檻**（至少 1 個修正後自然 reviewer-heavy session；「low-value findings 沒被逐條追修」＋「confirmed_functional 都有最小修正」）；green-tail 在無可靠 classifier 前維持 unknown（不進 verdict）；後測 B（大 context）指示未知。

---

## 3. 新發現／待校準（14 項）

### 3-1.「補登」模式——隔離的機制被帳本遺忘後返場（bruce／workflow-observer）
- **slug 候選**：retroactive-ledger-registration
- **證據點數**：2（bruce 被 command 引用一個多月但 ledger 無 H2；workflow-observer 於 08-22 08:00 落地但 08-22 摩擦 review 才補登、其內部失敗曾無主）。兩案都是「機制偷偷活著」而 ledger 沉默。
- **生命史摘要**：兩種都發生在同一條教訓——「引用機制當 anchor，但 ledger 沒開 H2」。bruce 版更糟：整段觀察期都在 hook 提醒範圍外。可配 `mechanism-decommission-decay` 的「反空窗」案例。
- **證據指針**：`trials/active/bruce-workflow-monitor-*.md`（補登註記）、`trials/active/workflow-observer-*.md`（補登）｜單一／雙一級證據，low confidence。

### 3-2.「同一變更既不 enroll 也不撤回」——子subagent 權限先被移除、測試「必須保持未註冊」反向斷言（agent-contract-gate）
- **slug 候選**：gate-unregister-reverse-assertion
- **證據點數**：1（`1a1250c` 蓄意移除、`e93fdfe` 測試斷言反轉成「必須保持未註冊直到有 bootstrap 路徑」）。三條路徑（bootstrap／update permit／recovery）已實作並重掛（`0dcd175`、43/43 套件）。已知未修：(a) permit 沒綁 session（跨 session 授權外洩實例）、(b) 裸 pathspec 可繞過。⚠️ 已兩度誤殺（`CLAUDE_CONFIG_DIR` symlink、locked 檔髒擋所有 commit）。這是機制「沒接上」卻又「沒 KILL」的極端案例——單一證據、low confidence。

### 3-3.「大而全的視覺設計工具連開成對」——archify＋plannotator 視覺 gate 對（同批開案、同 target 使用者、依賴同一個 architecture-visual 決策點）
- **slug 候選**：archify-plannotator-visual-gate-pair
- **證據點數**：2（archify 08-27、plannotator 08-27 各自 safe-trial + 契約 + 拆線）。兩者共用同一個 `architecture-visual-decision` 決策點（archify-visual-gate 的 KPI 目前：candidate exposure 1、接受 0、跳過 1、artifact 開啟 0、真實 use 0——單一事件 n=1）；plannotator 則完整接了 adapter＋real E2E（decision=annotated 的 receipt 真實回傳）。
- **生命史摘要**：同一批「視覺 gate」實驗，結果分叉：archify 只是「被展示（nudge）但沒被用」，plannotator 有真 adapter 走完整條路。事件對使用者＝archify 跳過 1、plannotator 同批接入。「跳過」這個事實（而沒被選用）是「0 出題」的另一種形狀。
- **證據指針**：`trials/active/archify-visual-gate-*.md`、`plannotator-visual-gate-*.md`；`architecture-visual-decision.json` 兩份｜雙證據、low confidence。

### 3-4.「還沒上線就準備退場」——safe-trial 大量 08-27～08-29 的探索（新物品線）
- **slug 候選**：safe-trial-probe-wave-0827
- **證據點數**：6（semble-lifecycle-v055-probe／zoekt-locator×2／new-api-docker-probe／9router-routing-tests／cliproxyapi-alias-probe）各 1 筆、多為「stage-0 跳過」或「未定論」。另有 codesearch-locator 實測（R@3 90% FAIL／semantic R@3 80% FAIL——COD 近似檢索「定位碼」這個方向被量測否決）。
- **生命史摘要**：一週內密集開 6–7 個「locator／probe」trial，全為泛用 explore（或 safe-trial 慣例），各自 sample 極少、多為 install/probe-stage 完成即掛觀察。這波開案密度本身就是「8-27~8-28 工具嚐鮮潮」的事件，但無一已達 review 日。
- **證據指針**：上述 7 個 detail 檔 | 單一探索型證據、low confidence（「尚未到 review 日」本身就是它為什麼還不算 new finding 的原因）。

### 3-5. candid 同主題多開案→ handle 不同 spec（chrome-devtools 系）
- **slug 候選**：chrome-devtools-mcp-1-8
- **證據點數**：1（08-25 pin-160 與 08-26 1.8.0 兩個 trial 對同一個 tool 但 handle 不同層：前者 pinned 1.6.0 因 1.7.0 closed-page regression、後者 probe 1.8.0 是否修復）。三個 goal：驗上游、驗新版本、防 regression；但它們 register 在同一天（08-25／08-26）、review 日也近（09-02／09-08），是同源連開。無任何 KEEP/KILL 已定。low confidence。

### 3-6. 「subject-scout 掛接 brainstorm」——storm-perspective-graft 轉接線後的第二段（perspective-sub-scout-brainstorm）
- **slug 候選**：perspective-sub-scout-brainstorm
- **證據點數**：2（08-25 由 storm-perspective-graft 第三輪結案「機制轉移 brainstorm Step 2a′」；08-25 authoring 當日 3 次實跑 152–282 秒、27–78k tokens、發現 framing 已定形時 skip 有理由）。它是「機制搬家後重開看守窗」的完整 Sample：storm 9 週 0 出題（8/25 KILL-原接點／機制轉移 brainstorm）→ brainstorm 2a′ 接手。
- **題庫關係**：storm-perspective-graft 結案的「機制轉移」本身就是帳本 cross-trial 依賴的案例（同一個機制在不同宿主出現兩次、第一次的結案不等於第二次的結案）；perspective-sub-scout（原 deep-research）還在。
- **可能成熟的理由**：搬宿主的手續有 complete install/rollback（`git revert 882ab90`）；「跑了」的證據已會收集（External archaeology 決策行）。
- **仍缺什麼**：真正「ran」的樣本（受測者 framing 用引文獻軸）0；「skip 理由濫用」未核。→ 09-01 review；純觀察。

### 3-7.「同一 broad target 連三年、但每次都砍到只剩 window」（sub-agent 分類線）
- **slug 候選**：agent-type-split-lineage（voltagent-absorb-agent-split 系）
- **證據點數**：4（blog-phase-runner 12/12＋skill-verify-auditor 37/37 皆 KEEP；wiki-refresher 三輪「0 出題→補接線→看分派」全未達標）。skill-verify-auditor 11 個改接入口 9 個出題、trial-review 誤用 1 次；wiki-refresher 08-21 有標準 memory eviction 事件（`claude statusline`）但 agent 沒被派到、真實 0 派。
- **題庫關係**：`cvs-handover`（#99）相關（離職交接的 wiki maintenance 線）；`_index_dispatch_execution_discipline` 派生。
- **可能成熟的理由**：agent 分類（route 到 worker）本身有固定 lifecycle（被 absorb 成 regular worker 或拆回 generic），像「子分類被證實有用就升 / 沒用就拆」的 marker。
- **仍缺什麼**：wiki-refresher 至今 0 派；第四輪判準「daily-local 觸發的 wiki-actions stale 路徑是否真的派到 wiki-refresher」要 09-08 才知道。

---

## 4. 帳本結構／生命史教訓（cross-cutting、不另立機制的資料側）

### 4-1. 「trial 生命史閉環」缺口（多案）
- **證據點數**：5（personal-main-closeout-v2 detail 殘留、archived.index 149/253、t9 環境消失未連動 ledger、t5-post-grep-nudge 因宿主消失 KILL、bruce 未登但被 command 引用）。這是 mechanism-decommission-decay 的帳本側投影：結案≠清理（v2 檔未搬）、召回機制不完整（索引缺口）、環境退場不通知 ledger。
- **題庫關係**：mechanism-decommission-decay（觀察中）整條。

### 4-2. codex-policy-drift-nudge（單一閃躲）
- **slug 候選**：codex-policy-drift-nudge
- **證據點數**：1（08-22 F8 開出、hook 契約 7/7 含三 fixture、實測 AGENTS.md 皆 in-sync）。0 事件、0 KPI——「極低頻的 drift 守門」就是這種「可能永遠 0 出題」的 trial。
- **生命史摘要**：改三份 CLAUDE.md Git 段落或兩份 AGENTS.md 產物之一時 post-write check、真 drift 才出聲；刻意不掛 PostToolUse Bash（太吵）。已知缺口：Bash heredoc／sed 改 CLAUDE.md 會漏。
- **仍缺什麼**：無真實「改來源」事件；無法驗到「有 drift 出聲」。→ 08-29 review（low confidence）。

### 4-3. implement-background-worker-guardrails（單一事件起跑）
- **slug 候選**：implement-background-worker-guardrails
- **證據點數**：1（08-24 ticket07：單支 worker 91.4 分鐘／350 tool call；三條口頭護欄只在此 window 套用，未改 SKILL.md）。20 分鐘 watchdog 是推定值，非量測；「護欄無效 vs 沒被套用」是主要變因。
- **仍缺什麼**：窗內第二個樣本尚未出現；三個對帳數字（等待時間 / tool call / 誤殺）0 事件。→ 08-31 若有 0 樣本即延一輪。low confidence。

### 4-4. gpt-harness-usage-injection（雙通道注入，量度未到）
- **slug 候選**：gpt-harness-usage-injection
- **證據點數**：2（08-22 poll-ratio 基準：claude 0.01 vs gpt 0.68 雙峰、44% session 比值 0；文字送達已驗：stub argv＋marker probe＋hook 契約 10/10）。行為未驗（「小錯→換執行路徑」沒有自動量尺、只能人工翻窗）；窗口派工 <50 → EXTEND。
- **仍缺什麼**：**行為改變未驗**；gpt 彙總比值 <0.68 且「比值 0 比例 >44%」才 KEEP；第二條規則只能人工。→ 08-29 review（很可能 EXTEND）。

### 4-5. 低信心新發現群（全部單一／低密度證據）

| slug 候選 | 證據點 | 一句話 |
|---|---|---|
| c068-answer-judge | 1 | Fable 回合的 async judge：只有真實 relay probe 1 次（08-26）、`returned_model` 修正確認、33/33 fixture。行為（judged/NO verdict）尚無自然樣本。「判決後不等待、不補 queue」的設計先決 |
| recall-before-answer-hook | 1 | 基線 C077 31 列糾正、C041 12 列；hook 以 14 組中文翻紀錄詞比對。行為採用尚未驗；KPI 「每週漏抓 ≤20%」尚未有首輪資料。單一探針 |
| figma-budget-gate | 1 | 基線 18/21（每次第一個 Figma call 前已 invoke skill）；設計成「防誤擋」優於「必擋」。行為採用（真實 known-bad deny）仍缺、只有 fixture |
| contract-test-preflight-gate | 1 | 基線 7/15 先查測試；設計成「第一次改有考卷檔必 deny」。行為採用尚缺、helper 只有 4 tests + source SHA 固定 |
| contract-test-receipt-gate | 1 | 基線 6 份 eval.yaml、23 支 .test.sh 無自動覆蓋；實際 wrapper 執行契測寫 receipt。行為採用尚缺 |
| sepia-readme-review | 1 | 08-28 已使用者批准雙語版並 publish（45549e4）；「使用者判 clear」是唯一 outcome（「我使用之後整個內容差非常多」）。keep 條件（使用者能解釋工具做什麼）已達——試用窗其實可結案 |
| sepia-vendor | 1 | 08-28 submodule checkout＋integration（command 契約 12/0、blog 契約 16/0）；單獨 review-only 接線。keep 條件「slash 與 blog yes 分支維持 pinned」已達；kill 條件「自動觸發」尚未發生 |
| skillevaluator | 1 | 08-27 大 poke：Tier1/Tier2/Tier3 全實測、Day0 production wiring（weekly channel、edit gate）；KPi 表格 5 格「待 review」（09-04）。極大量 Day0 證據、唯「自然 weekly run」尚無 |
| routing-ab / task-verifier | （見 2-6/2-7） | 屬「natural sample 0」類 |

---

## 5. 重提閘門對照（本輪不提報之理由）

| slug（機制帳本） | 狀態 | 為何本輪不重提 |
|---|---|---|
| cvs-handover | 觀察中 | 缺「接手方實際使用交接物」結果；升級條件＝交接完成並取得實際接手與導覽結果（08-23 使用者拍板不放寬） |
| codex-claude-memory-bridge | 觀察中 | 缺「被讀取／被引用」量測管道；升級條件＝取得跨工具記憶橋接自然採用資料（需先建量測管道） |
| memory-state-ripple | 觀察中 | 帳本原是「第五輪後再決定」；08-23 第六輪已達但帳本未更新；不屬「新發現」──同源 |
| mechanism-decommission-decay | 觀察中 | 升級條件＝跑一次全量活性普查；本輪只有零散案例側寫（t9 環境消失、v2 detail 殘留）非普查 |
| trigger-ownership-split | 觀察中 | 缺「靠人記得」的代價量、與 #94 分工未想清；升級條件未達 |
| plain-language-hard-gate | 觀察中 | 採用率數字對不上帳（「親打 0 場 vs /wait-what 54 場」矛盾、單日 89 檔形似批次評測污染、self-pollution）；升級條件＝重算採用率 |
| single-truth-pointer-tombstone | 觀察中 | 升級條件＝再出現一次帶代價數字的打架事故；本輪無此事故 |
| claude-config-activity-curve | 觀察中（低信心） | 升級條件＝驗過計數口徑（8 月口徑 377/417、日均 16.4 vs 7 月 4.1、21 分鐘 13 commit 批次疑慮未消） |
| rebuttal-calibration | 已否決 | 重提條件＝「審查 finding 發布成預設流程」＋「第一批真實作者回覆」；本輪無此樣本（pr-review 流仍在試用、未有外部 PR 留言數 >0 的自然證據） |

（#已否決欄之重提條件：`rebuttal-calibration` 是否決中唯一一個，其餘 8 個全為觀察中；本輪全數防空窗。）

---

## 6. 三分類計數

- **已成熟：2 項**——1-1 memory-ripple 機械→模型→同步判官演化線、1-2 evidence-level 七日抽驗線。
  - 警示框：這 2 項都是「機制多次實作、長期未結」，不是「機制已 KEEP 且行為採用已證」。若以「行為採用證據」為門檻，應歸「持續觀察」；若以「機制已演化成熟、只差行為採用樣本」為門檻，才列「已成熟」。此處採後者並在條文內明標未竟項。
- **持續觀察：9 項**——2-1 memory-ripple 家族、2-2 T9、2-3 bruce、2-4 tob-spec、2-5 pr-review 新層窗、2-6 task-verifier、2-7 routing-ab、2-8 workflow-observer、2-9 gpt-convergence。
- **新發現／待校準：14 項**——3-1 補登模式、3-2 gate-unregister 反向斷言、3-3 archify+plannotator 視覺 gate 對、3-4 safe-trial 探索波、3-5 chrome-devtools 連開、3-6 perspective-sub-scout 轉接線、3-7 agent-type-split 線、4-1 生命史閉環缺口、4-2 codex-policy-drift-nudge、4-3 implement worker guardrails、4-4 gpt-harness-usage-injection、4-5 低信心群（c068／recall／figma／contract-test×2／sepia×2／skillevaluator，計 8 筆但 slug 只列主項）。
- **空段**：以上三類皆非空，無 0 項段。
