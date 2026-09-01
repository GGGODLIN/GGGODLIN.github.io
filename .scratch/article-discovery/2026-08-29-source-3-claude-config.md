# Source 3：~/.claude 設定 repo 掃描（2026-08-23 00:00 ～ 2026-08-29 當下）

- 掃描對象：`~/.claude` git repo 全部本機 refs（`git log --all`，作者日期 `%aI` 落窗，hash 去重）＋ worktree HEAD（`/private/tmp/review-implement-integration-v2` 的 `fix/review-implement-closeout-v2`）
- 未 fetch；窗內去重 commit 數：**259**
- 群聚活動數：**12**
- 本機／遠端邊界：遠端 `origin/main` 停在 `275b53f`（08-29 11:40），本機 `main` 領先 1 個未 push commit（`78b4cb8`）；窗內本機孤立分支：`fix/daily-topic-watch-contract-20260829`（`4778163`）、`fix/review-implement-{trial,y1,y2,closeout,closeout-v2}`（後者掛在 worktree `/private/tmp/review-implement-integration-v2`）、`refs/stash`（`0715ac1` 等）；窗內 PR merge：`#11`（ledger-lifecycle）、`#12`（personal-main-closeout-v3）、`#13`（daily-topic-writeback-handoff）

---

## 1. memory-ripple v3：Gemini-sync 全面重建

- **活動描述**：memory-ripple 從 Qwen/prewrite/deliver/reconcile 四段式，改成 gemini-3.7-flash-high 同步逐寫判斷（12 秒單次嘗試、fail-open），壓掉 Gemini 拒絕的機械性命中、Gemini 補寫 inline；測試 165→100。同日 wayfinder 關掉 010「C068 measure-first」、011「replay research」、012「pick」、013「async Gemini judge via relay + F8 prefilter」，並在 08-26 落地 async answer judge（c068-answer-judge.py 667 行＋prompt＋test），memory-ripple-runtime 48 行同步改動。判斷模型從自家 CC 換成外部 Gemini 並 bake-off，是這窗最大的一條機制生命史。
- **日期**：08-23（v3 重構）、08-25-08-26（wayfinder 010-013 收案 → 08-26 落地 async judge）
- **證據指針**：`c39a216`（hooks/memory-ripple-runtime.py、hooks/memory-ripple.sh、hooks/memory-ripple.test.sh、settings.json）；`4e983bd`（hooks/c068-answer-judge.py/.sh/prompt-v1.txt/.test.sh）；`bf9b139`；`b4584db`（.scratch/rule-mechanization/wayfinder/research-013-judge-bakeoff.md）；`f31b3cb`
- **為什麼可能成題**：自家 harness 的判斷環節外包給 Gemini 並以實測資料（12s、fail-open、165→100 tests）拍板，是「哪個模型當 judge」的罕見可讀決策記錄
- **slug 候選**：`memory-ripple-v3-gemini-sync`、`when-to-outsource-your-llm-judge`
- **題庫／帳本關係**：`memory-state-ripple`（觀察中）核心事件；`claude-config-activity-curve`（觀察中）加權

## 2. rule-mechanization：prose rules → hooks/commands 機械化遷移

- **活動描述**：wayfinder map（.scratch/rule-mechanization/）從 research 001/002 起跑，一路 close 003-013 共 11 個 research ticket，08-26 出 spec＋9 tickets：01 move/delete prose、02 改寫 decision/ballot prose、03 recall/interview hook、04 gate subagent session id、05~ 等；隨後實作滾動（persist recall/interview prompts、contract receipt gate、interview 誤觸修復、C068 turn selection、Figma connector 安全覆蓋、unsafe lock link 拒絕），`0325fc0` 宣告 rule mechanism rollout 收尾。決策模式：C033（prose rewrite 而非 hook）、C041（interview mode、ballot 改 overview-then-interview）、C055/C053（contract-test receipt＋preflight gate）、C133（Figma hard gate）、C068（measure-first → LLM judge）。
- **日期**：08-25 23:00 ～ 08-26 18:00 密集；08-26 15:00-17:00 收尾
- **證據指針**：`f2193cc`（.scratch/rule-mechanization/issues/01-09）、`347586f`（IMPLEMENT-PROMPT.md）、`b4584db`/`6a63fcf`/`477521b`/`074bfc6`/`770997e`/`89e3781`/`79099b9`/`f727452`/`ad81fc5`/`3feb1d6`/`5f99ecc`（wayfinder closes）、`9e0ebcf`/`17b961e`/`6d2f6f0`/`53adbe0`/`3322940`/`6e22203`/`fcaf701`/`e79a077`/`fb6d0e5`/`120526c`/`375a3f1`/`0325fc0`、`46c3caf`/`5e76001`（research evals 穩定化）
- **為什麼可能成題**：把 CLAUDE.md/rules 散文規則逐步機械化成 hook＋contract test 的完整遷移劇本，內含「散文 vs hook」的逐條裁決用例
- **slug 候選**：`rule-mechanization-prose-to-hooks`、`decommissioning-prose-rules`
- **題庫／帳本關係**：`mechanism-decommission-decay`（觀察中）正例；`plain-language-hard-gate`（觀察中）的 C033 裁決用例；`claude-config-activity-curve`（觀察中）

## 3. CLAUDE.md rule-adherence audit：190 verdicts + ccp-gpt 交叉對照

- **活動描述**：官方規則遵守度盤點做成正式 audit：四份 rule 檔拆成 213 row collection（`split-rules.py`）、297 條 ledger 拼法 mapping 到 rule id、30 天證據聚合、對照組用 ccp-gpt（CC 之外第二模型）收 13/13 batches 並 gate 為「可用但有 caveats」、overlay 75 行 Claude 資料、出 190 verdicts ＋人讀決策表、spot-check 20 mapping、低信心 mapping 排除；03-05 收到 26 條 actionable verdict 全部被使用者接受（`f7498ee`）。方法是「跨模型收 rule-adherence 證據」的首次公開對照。
- **日期**：08-25 18:00 ～ 08-26 00:00（spec/tickets/collect），08-25 21:00-22:00（ccp-gpt 13/13），08-25 22:37-23:10（verdicts）
- **證據指針**：`e57caf9`（spec）、`da87d1b`（8 tickets）、`c84cbd6`、`5af6207`、`25d3957`、`8d22427`、`cf1bdf6`、`28aa595`、`82fcf9e`、`c7fd97a`、`b4ebfc6`、`f7498ee`（rule-review/ 全目錄＋memory/project_claude_md_rule_adherence_audit_2026_08_25.md）
- **為什麼可能成題**：真實 repo 上跑跨模型 rule-adherence 對照盤點，且「第二模型同一份證據的判定要不要採信」有明確 gate 流程
- **slug 候選**：`rule-adherence-audit-with-two-models`、`190-verdicts-rule-audit`
- **題庫／帳本關係**：`claude-config-activity-curve`（觀察中）峰值來源；`rule-escalation-ladder`（已升格）的度量面延伸；題庫／帳本外新增項「跨模型證據採用 gate」

## 4. review-implement：post-implementation review 新 stage（trial）

- **活動描述**：新 skill `review-implement`（08-27 登錄 skills/INVENTORY.md + SKILL.md 153 行）補上 implement 後審查 stage，含 spec＋tickets（.scratch/review-implement/）、authorize mapped Fable reviewers、fresh retry invocation 要求（`e340c27` 補 failed-axis retry 測試）、handoff contract 去重（兩次 refactor `50835b8`/`1f41a1b`）、4 條試行分支（trial/y1/y2/closeout/closeout-v2）在 /private/tmp worktree 整合。
- **日期**：08-27 09:00 ～ 17:49
- **證據指針**：`640bd3f`（skills/review-implement/SKILL.md＋contract.test.sh）、`b5f7cff`、`a3ddc0c`、`54bc56f`、`3afa69f`/`4e79e59`（ignore local command records）、`82457ed`、`0e1944c`
- **為什麼可能成題**：把「implement 完要 review 才算 closeout」這個常被跳過的一步做成本機 gate tool，trial 化過程可見
- **slug 候選**：`post-implementation-review-stage`、`closeout-review-gap`
- **題庫／帳本關係**：`handoff-impl`（已升格）、`review-premise-inheritance`（已升格）的下一章

## 5. Blocking Git closeout + git-closeout command

- **活動描述**：checkpoint-judge 升級成 blocking Git closeout（commit/push 前阻擋、SessionStart worktree nudge、`LC_ALL=C` sanitize 修復），08-28 再抽成 `/git-closeout` command 並接上 startup reminder；08-28 晚修 CLI 呼叫方式（python 呼叫）並記錄。spec 在 .scratch/closeout-v3 兩輪（spec→blocking→v3）。
- **日期**：08-25 16:00（blocking 版本）、08-28 09:08（command）、08-28 22:01（python invoke 修正）
- **證據指針**：`ca269f0`（hooks/checkpoint-judge.sh＋.test.sh）、`82ff1ac`、`62f7134`/`96b24ed`（spec）、`8a9bb96`（commands/git-closeout.md＋contract test）、`f9b2331`、`1549641`/`357d40a`
- **為什麼可能成題**：「完成一段工作就 commit」從習慣變成 blocking 機制、再變成 handoff command 的完整演化
- **slug 候選**：`blocking-git-closeout`、`commit-discipline-as-gate`
- **題庫／帳本關係**：`trigger-ownership-split`（觀察中）——觸發從使用者記憶轉給機制；`claude-config-activity-curve`（觀察中）

## 6. ledger-lifecycle：wiki index 治理機制化

- **活動描述**：wiki index 從 111KB 壓到 31KB（TL;DR one-liners + changelog dedup）、新增 ledger lifecycle 管理（init-project-docs / ledger-ignore / state-archive 三個 command＋contract tests＋bootstrap settings test）、rollout 記錄、PR #11 merge。窗內接著 08-29 memory index audit 三連修（deterministic、archived paths、punctuated paths）。
- **日期**：08-24 00:00 ～ 02:00（lifecycle 主體）、08-24 10:08（index 壓縮）、08-29 11:40-11:45（audit 修復）
- **證據指針**：`4cdd949`（commands/ledger-ignore.md、commands/init-project-docs.md、commands/tests/ledger-ignore-contract.test.sh…）、`3899809`/`95d7f7e`、`ac27f50`、`18f18fe`、`d31e8b6`、`4fc628d`/`275b53f`/`062042f`、`5607958`（cluster index counts）
- **為什麼可能成題**：帳本類文件（wiki index、cluster index、ledger）開始有專屬 lifecycle 與 contract test，是「文件也是系統」的治理樣板
- **slug 候選**：`ledger-lifecycle-for-wiki`、`documents-as-systems`
- **題庫／帳本關係**：`single-truth-pointer-tombstone`（觀察中）鄰近；`wiki-daily-maintenance`（已升格）延續；與 `claude-config-activity-curve`（觀察中）

## 7. Semble search governance（consent + scope gate）

- **活動描述**：08-29 一次上五條 semble hook（sessionstart/userprompt/pretool/主 gate＋consent test 987 行）、加上 semble-scope-registry、bootstrap/disable-recovery scripts；同日 12:10 refine（撤掉三顆綁定 hook、改 adapters、lifecycle test 124 行）。整體＝把 code search 的 MCP 使用從自主改成 consented、scope-gated。
- **日期**：08-29 07:36、08-29 12:10
- **證據指針**：`636334c`（hooks/semble-scope-gate-*.py、scripts/semble-bootstrap.sh、scripts/semble-disable-recovery.sh）、`78b4cb8`（hooks/semble_scope/adapters.py、scripts/semble-lifecycle.test.sh）
- **為什麼可能成題**：搜尋工具使用從自由到 governed 的最小可讀案例（同一天內開 gate 又 refine、撤掉三顆綁定 hook）
- **slug 候選**：`semble-scope-consent-gate`
- **題庫／帳本關係**：`sem-push-adoption`（已升格）續章；`trigger-ownership-split`（觀察中）的 consent 面

## 8. daily-topic 工作流整治（watch contract + writeback relay 拆除）

- **活動描述**：daily-local/digest 系列：writeback probe relay 移除（payload 不再背歴史）、probe payload 壓縮、invalid envelope retry、annotated source counts 解析、writeback 前 review probe、PR #13 merge；08-29 修 watched topics 進 daily digst（fix/daily-topic-watch-contract-20260829 分支，尚未 merge）。wiki-refresher 順手接進 /wiki-actions 與 /daily-local digst 後自動跑（653e898）。
- **日期**：08-25 09:54 ～ 18:00（writeback 整治）、08-27 15:22-15:53（PR #13）、08-29 11:12（watched topics）
- **證據指針**：`b12311b`/`ec97c9d`/`7291575`/`553577e`/`8bbbdb3`/`122c6d5`/`da4de3d`、`2b501db`、`4778163`、`ed00792`/`5234fa5`、`653e898`、`cfdc75b`（chrome devtools MCP page ID 遷移）、`cb4d79d`（writeback 前 review probe）
- **為什麼可能成題**：地端 digst 的 payload 設計反覆（probe→writeback→watch）是小型工作流進化史
- **slug 候選**：`daily-topic-watch-contract`、`writeback-payload-redesign`
- **題庫／帳本關係**：`cvs-handover`（觀察中）若關（daily-local 與 cvs 交接）；`wiki-daily-maintenance`（已升格）續章
- 不確定處：`cvs-handover` 與 daily-topic 的關聯待 main 語意比對

## 9. Browser Harness accumulation trial（＋pi runner verdict）

- **活動描述**：08-23 開新 trial skill `browser-harness-trial`（log_run.py＋test）；同日 pi runner trial verdict 記錄、pi supervisor approval probe、safe trials 排除 amell snapshot 與 Codex IPC runtime；08-23 也 refine「delegated agent permission model」。這是本窗少數幾個「新 trial 開案」之一。
- **日期**：08-23 15:32 ～ 18:31
- **證據指針**：`513f04d`（skills/browser-harness-trial/SKILL.md）、`b226df9`、`6633516`、`91d7946`、`890765a`、`e7e5932`
- **為什麼可能成題**：browser 自動化累積型 trial 的開案結構（log+test+verdict 筆記）可讀
- **slug 候選**：`browser-harness-accumulation-trial`
- **題庫／帳本關係**：`trial-review-lifecycle`（已升格）新試行樣本；`mechanism-decommission-decay`（觀察中）若關

## 10. trial-review 溝通摩擦（2nd same-kind 模式）

- **活動描述**：08-23 記「trial-review multi-layer mechanism report 缺 flow-first shape」並標 2nd same-kind；08-27 記 trial review presentation friction（b521e94）、08-28 記 trial review communication friction（8db1177）。同一摩擦兩度記錄＝模式未改的訊號。同天 08-28 workflow friction review close（d567c0a）、08-27 friction close 兩批。
- **日期**：08-23 11:58、08-27 09:31、08-28 15:22
- **證據指針**：`74eb285`（friction/workflow-general.md）、`0b62e9d`、`8db1177`、`d567c0a`
- **為什麼可能成題**：同一摩擦二度出現＝機制生命史的未解分支，比單次事故更有敘事性
- **slug 候選**：`trial-review-friction-second-kind`、`same-kind-friction-repeat`
- **題庫／帳本關係**：`trial-review-lifecycle`（已升格）的負向資料點

## 11. Settings / config 預設調校 + safe-trial 防護強化

- **活動描述**：Fable medium defaults（4439e72）；default effor 調高（eb0da33）；Concise output style 客製（8eea6ce）且收 2 條 state-flow/term-map rules（91166d7）；safe-trial settings guard 簡化＋project settings restore 加固（4002acd/eb3e8a6/7aa2868）＋implementation review 記錄（30f6706）。
- **日期**：08-25 13:30-18:23、08-27 19:46-20:05
- **證據指針**：`4439e72`/`21b9143`、`eb0da33`、`9e82ba9`/`8eea6ce`/`91166d7`、`4002acd`/`eb3e8a6`/`7aa2868`/`30f6706`
- **為什麼可能成題**：預設枚型/effort 與輸出風格的逐日調整，是「config 演化」的微觀樣本
- **slug 候選**：`claude-config-daily-drift`
- **題庫／帳本關係**：`claude-config-activity-curve`（觀察中）；`selective-harness-grafting`（已升格）若關

## 12. 其他可注意但未成簇的單點

- **session backup 遷移修復**（`0b8d80e`/`99384c7`/`fcd9ce0`/`9b4f101`，08-25 19:35-21:11）：launchd 補 Git LFS、path flags、pipeline 復活；`b31・f74`（08-25）記錄 permit 綁 whole staged tree 的注意事項；`2066bdc`（08-25 git gate retrospective：staging/committing 分開）
- **pr-review C4 delta spec**（`e52bada`，08-23）：未 promote 的 openspec delta spec 也算 C4 authority；`69c76fe`（wait-wait 雙胞胎併回）；`24addf4`（opencli redline 更正）
- **visual architecture review trial**（`6b012f5`/`6510e92`，08-27-28）＋Plannotator architecture reviews 整合（`5b4b8e7`）
- **AgentMemory eval 一系列**（`8a19654`/`353eacc`/`679ed0a`/`17ff713`/`5e5290d`/`264f8cb`/`3e27f7b` 等，08-27-28）：native memory 實驗與 recall baseline，verdict 標 provisional——機制生命史未定案段落
- **0fbe9cb/2f6f2d8**（08-27 test 三角 redundant writeback coverage）

---

## 總計

| 項目 | 數值 |
|---|---|
| 窗內去重 commit 數 | 259 |
| 群聚活動數 | 12（含 1 個分散單點組）|
| 本機／遠端邊界 | 本機 `main` 領先 `origin/main` 1 commit（`78b4cb8` 未 push）；5 條窗內本機孤立分支＋1 個 stash＋1 個 worktree（/private/tmp/review-implement-integration-v2）|

零活動情形：無（窗內 08-23 00:00-09:45 之間無 commit，其餘全窗有活動，08-25-08-28 為高峰）。