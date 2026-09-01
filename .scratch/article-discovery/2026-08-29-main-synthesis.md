# 2026-08-29 部落格選題掃描收斂報告

## 掃描範圍

- 模式：B，增量掃描＋長期機制大盤點
- 日期窗：2026-08-23～2026-08-29，起訖皆含
- 題庫準據：`docs/philip/blog-candidates-v5-2026-08-23.md`
- 遠端邊界：git 來源未逐 repo fetch，只涵蓋本機現有 refs

## 七來源收據

| 來源 | 掃描結果 |
|---|---|
| memory | 81 個窗內 mtime 檔，收斂 25 組活動；兩波批量維護未冒充新事件 |
| 個人＋工作 repo | 623 個 repo，41 個命中日期窗；137 個去重 commit；worktree 補漏 0 |
| `~/.claude` 設定 repo | 259 個去重 commit，收斂 12 組活動 |
| 試用帳本 | 49 個 active H2；窗內開案 29、結案 20、延輪 8、量測翻案／層級 KILL 3 |
| session 存檔 | 3 組內容活動；其中 1 組自標模擬情境，剔除 |
| STATE／探針 | 保留 9 組方法論級活動，1 組公司純除錯剔除 |
| workshop | commit 0、更新檔 0、活動 0 |

## 題庫實況校正

- `src/content/blog/*.md` 實際有 39 篇。
- #133 `sol-overimplementation` 已於 2026-08-24 發布。
- #132 `proxy-warmup-cost` 已於 2026-08-25 發布。
- #134 `gpt-review-tunnel-vision` 已於 2026-08-27 發布。
- #114 已於 2026-08-27 併入 #134，不再單獨成文。
- v5 翻版時有 39 條活題；扣除 #132／#133／#134 成文與 #114 併入後，實際活題為 35 條。
- 下一號仍為 #135；題庫大小 65,544 bytes，未達 100KB 翻版門檻。

## 增量新候選

### A1．AI agent 分兩種：一個跟我工作，一個只接單跑完

- 群／難度：工作流方法論／中深
- 建議：收錄，不立時機鎖，先登記不寫
- 白話：我原本在找一套更輕的 Claude Code，後來發現問題問錯了。真正需要的不是第二個主力工作台，而是一個不繼承整套設定、收到任務就獨立跑完的委派執行者；四套工具實測後，連「怎麼保護它」的答案都從規則自律改成格式根本不相容。
- 核心素材：`user_agent_two_tier_delegation_model.md`、`reference_pi_cc_supervisor_permission_poc_2026_08_23.md`、`2026-08-23-grokbuild-agent-eval-session.tmp`、pi／Harbor 委派收據
- 與既有題關係：#59 講模型路由；#103 講跨 session 發單；#125 講把模型與思考深度釘死。本題講主互動 agent 與隔離執行者的用途分層，不重複。

### A2．我把 110 條 CLAUDE.md 規則逐條量過，再決定哪些該變成 hook

- 群／難度：enforce／確定性／深
- 建議：收錄，不立時機鎖，先登記不寫
- 白話：規則寫進 CLAUDE.md，不代表它有用，也不代表都該改成硬攔截。我把 110 條規則逐條找行為證據，最後不是「全部刪掉」或「全部做成 hook」，而是分成保留散文、改成機制、只在特定任務載入、刪除與暫時判不了五種去向，再把其中一批真的落地。
- 核心素材：`project_claude_md_rule_adherence_audit_2026_08_25.md`、`~/.claude/.scratch/rule-mechanization/`、`e57caf9`／`f2193cc`／`0325fc0`
- 與既有題關係：#105 已寫規則升級階梯；本題是把整套階梯用在全量規則存量，屬實戰續篇。#120 提供「規則從單一事故長歪」的反面材料。

### A3．第二大腦不會自己整理：我替 25 本帳本補上生命週期

- 群／難度：個人系統／中深
- 建議：收錄，不立時機鎖，先登記不寫
- 白話：我替 AI 留了很多狀態檔、試用紀錄與安全快照，卻只設計「誰寫、誰讀」，沒有人負責它何時變太大、何時該整理。一次普查找到 20.85 GiB 快照膨脹，最後用登錄表、門檻、索引下放與退場規則收回 16.931 GiB，也讓新帳本出生時必須先回答「怎麼長、怎麼退」。
- 核心素材：`general/project_ledger_lifecycle_wayfinder_2026_08_23.md`、`~/.claude/references/ledger-lifecycle.md`、`~/.claude/scripts/ledger-lifecycle/`、commit `4cdd949`
- 與既有題關係：#79 講記憶索引；#98 講知識庫每日維護；#106 講試用結案。本題管所有帳本與殘留物的容量、索引與退場，不重複。
- 邊界：當時使用者要求先專心處理 wayfinder、不在解題途中扯寫文章；沒有留下永久否決。若原意是永久不寫，本題應剔除。

### A4．把私人工具開源，不是刪掉公司名就好

- 群／難度：工具／工作流方法論／中
- 建議：收錄，不立時機鎖，先登記不寫
- 白話：把自己環境裡長大的工具公開，真正難的不是搬檔案，而是找出私有路徑、公司耦合、歷史包袱與外人永遠拿不到的前提。我用兩個專案做出一套七類拆分法，再從全新 clone、隔離 HOME、不同 Python 版本一路驗到公開 release 真的能跑。
- 核心素材：`project_oss_sync_taxonomy.md`、repo-to-bench `review-v0-1-0.md`、release verification、commit `bffe2a6`
- 與既有題關係：#99 講離職交接；本題講私人工具轉公開產品的耦合拆除與發布驗證。可把 #99 的資產分流當動機，不重講接手流程。

### A5．免費模型跑不了 agent，不是模型太笨，是額度連開場都付不起

- 群／難度：AI 用量經濟學／模型／中
- 建議：收錄，不立時機鎖，先登記不寫
- 白話：免費模型看起來不用錢，但 agent 還沒開始解題，工作台本身就先塞進一大包內容。實測 Groq 免費額度單次只收 8K tokens，Claude Code 開場要 79,836、輕量 pi 也要 29,018；問題不是模型品質，而是連進場都過不了。我也把「能不能呼叫」和「答得好不好」拆成兩張成績單，避免拿 429／413 當模型能力差。
- 核心素材：`reference_free_cc_fallback_benchmark_2026_08_28.md`、`reference_groq_free_tier_agentic_dead_end_2026_08_29.md`、ccp-free／mixed-tier wrapper commits
- 與既有題關係：#118 講訂閱單價；#64 講包月額度怎麼用；#127 講本地模型與 harness。本題講免費供應商的速率限制形狀與 harness 裸成本，不重複。

### A6．背景 agent 跑了 91 分鐘、呼叫 350 次工具，卻沒有前進

- 群／難度：工作流／agent 控制／中
- 建議：收錄但加時機鎖，等 2026-08-31 防護試用首輪判讀
- 白話：背景 agent 顯示一直在工作，實際上卻自己生出 reviewer、被拒絕後繼續換路，控制器只看「還在跑」就放任它耗掉 91.4 分鐘與 350 次工具呼叫。這篇要等下一批真實樣本，確認 20 分鐘逾時監控、禁止 child 與遭拒即回報三條防護到底有沒有用。
- 核心素材：`trials/active/implement-background-worker-guardrails-2026-08-24.md`
- 與既有題關係：#134 講 review finding 變成下一輪工作；本題講背景 agent／控制器架構如何讓失控不可見。若試用沒出第二個樣本，降成 #134 發布後補強。

## 既有候選補強

| 目標 | 本輪補強 |
|---|---|
| #32 | memory-ripple 第六輪：Qwen 層測出沒用後拆除，改同步 Gemini 判官；AgentMemory 影子實驗把原先宣稱的 47.1% 寫入漏失翻成唯一 1 條真漏失 |
| #39 | 題庫仍寫「opus5-model-review 結案條件未到」，實際 2026-08-13 已 KEEP 結案，需更正 |
| #83 | 自訂 API 位址的三個獨立 session 被誤判成每次請求都收稅；對照答案被 12/13 GPT agent 讀走；skill-verify 解析器因工具行為改版低估；evidence-level 讀到 9,069,321 bytes、超過 8 MiB 後靜默回 0；Qwen 接線修好後仍 3/3 無效而拆層 |
| #85／#130 | pilotfish 42 天後四句事實全過期，但「不安裝」裁決仍成立；Chrome DevTools MCP 1.7 退化先釘回 1.6，再開 1.8 驗證接力 |
| #93 | Discord 匯出搬檔時 dcg 真實封鎖命中，成為已升格機制的新行為收據 |
| #99 | Codex team credential 停用不刪、個人工具資產分流與開源同步分類；仍缺接手方實際使用結果，時機鎖不動 |
| #105 | recall-before-answer、Figma 預算、契約測試收據、git closeout 都新增「散文／command → hook／封鎖」升階案例 |
| #106 | 本週 29 開案、20 結案、8 延輪；skill 庫存治理、環境消失連動 KILL、同日開案同日 KILL 等新結局形狀 |
| #120 | Chrome DevTools 反覆報錯先被錯誤寫成規則、再想加閘門，最後才用 A/B 定位到 1.7.0 上游退化 |
| #122 | 多 session 共用 git index，讓 permit 授權範圍超出原意；收據閘門「測試綠」與真實接線仍可不同 |
| #123／#124 | wait-what 的結構優先試用收案後併回本體；60 天 334 次手動需求；Concise A/B 失敗收場；規則稽核找到 207 列「白話／看不懂」摩擦群 |
| #125 | 路由從文字規則→60ms 機械閘門→routed-* 定義釘死→白名單；四天 640 次派工擋 2 次 |
| #126 | v2 首輪 review 節點已達，v3 已改成 blocking Git closeout＋SessionStart 提醒；建議解除原時機鎖，但把 09-01 review 當後續材料 |
| #132 | proxy 生態 issue 稽核與 30 天回本模型已成文；只修題庫狀態，不再開續題 |
| #133 | 已於 08-24 成文，closeout v1→v3 當發布後補強 |
| #134 | 已於 08-27 成文；背景 agent 失控先當發布後補強，除非 A6 試用產生第二組獨立樣本 |

## 機制帳本更新建議

| ID | 固定 slug | 原狀態 | 新證據 | 建議處置 |
|---|---|---|---|---|
| M1 | `memory-state-ripple` | 觀察中 | 第六輪拆 Qwen、改同步 Gemini；25/25 judged、真補約 2 例；08-30 review 未到 | 維持觀察中，更新證據與最後檢查日 |
| M2 | `mechanism-decommission-decay` | 觀察中 | Headroom 殘留 5 天；active detail 孤兒檔 1；hooks/ 101 支中 13 支未註冊、至少 3 支疑似殘留 | 維持觀察中；升級條件只完成「註冊面」，仍缺全部常駐機制最後命中日 |
| M3 | `plain-language-hard-gate` | 觀察中 | Concise A/B 已收案並移除；wait-what 60 天 334 次；207 列「白話／看不懂」群 | 維持觀察中；原採用率污染仍未重算 |
| M4 | `trigger-ownership-split` | 觀察中 | storm 掛錯 deep-research 9 週 0，搬到 brainstorm 當日兩次；轉發責任改交 codex | 維持觀察中；仍缺與 #94 的清楚分工 |
| M5 | `cvs-handover` | 觀察中 | Team credential 停用、statusline／fixture 拆線、個人工具 OSS 分流 | 維持觀察中；接手方實際使用結果仍未知 |
| M6 | `claude-config-activity-curve` | 觀察中、低信心 | 08-29 HEAD 593／`--all` 672；六天再增 216 | 維持觀察中；批次 commit 與拆分習慣仍污染口徑 |
| M7 | `rebuttal-calibration` | 已否決 | finding 發布仍非預設，真實作者回覆仍 0 | 不重提、不改檔 |

## 長期機制大盤點三分類

### 已成熟／可動作

1. #83 `measurement-validity-gates`：案例已超過「缺素材」階段，建議列入下一篇熱區。
2. #106 `trial-review-lifecycle`：四輪補強＋整季結案資料，建議列入下一篇熱區。
3. #126 `personal-main-closeout`：原時機鎖條件「v2 首輪 review 後」已達，建議解除；v3 的 09-01 review 只作後續材料。
4. A1／A2／A3：若使用者收錄，對應新機制可直接標「已升格」到新題號；A4／A5 是文章題材，不必另建機制帳本。

### 持續觀察

- `memory-state-ripple`：08-30 review、全面召回率與 Gemini 配額未齊。
- `mechanism-decommission-decay`：已有普查雛形，但缺最後命中日全量對帳。
- `plain-language-hard-gate`：需求數字充分，採用率口徑仍污染。
- `trigger-ownership-split`：有掛載點搬家量化，與 #94 的分工仍未收斂。
- #99、#102、#112：各自原時機鎖或收案條件未完整達成。
- `self-verify-receipt-contract-line`、`workflow-observability`、A6 背景 agent 防護：試用尚未產生可下判決的自然樣本。

### 新發現／待校準

| ID | 機制假設 | 信心／證據 | 建議處置 |
|---|---|---|---|
| N1 | `two-tier-agent-delegation` | 高；四工具實測＋權限概念驗證＋正式委派 | 已成熟；若收 A1，升格到新題號 |
| N2 | `rule-mechanization-audit` | 高；110 條規則全量稽核＋後續實作 | 已成熟；若收 A2，升格到新題號 |
| N3 | `ledger-lifecycle-governance` | 中高；完整 wayfinder、登錄表、契約測試、16.931 GiB 整理成果；跨 repo 採用率未量 | 已成熟但明標採用未驗；若收 A3，升格到新題號 |
| N4 | `workflow-observability` | 中；可觀察性契約、observer 收據與死指標案例，試用判決未落 | 有潛力，留觀察 |
| N5 | `self-verify-receipt-contract-line` | 中；四個閘門家族，但攔截／誤擋行為數字未收 | 有潛力，留觀察 |
| N6 | `background-agent-runaway` | 低中；91.4 分／350 次工具呼叫的單一事件 | 有潛力，等 08-31 試用；對應 A6 時機鎖 |

## 剔除／併入清單

- 模擬 `sync.js retry` session：自標模擬情境，無真實 repo，剔除。
- DiscordChatExporter：低頻工具採用紀錄，降素材；dcg 命中補 #93。
- 視覺迭代「定版前不跑完整 review」：單一流程回饋，降素材。
- 對照組污染、AgentMemory 影子實驗、evidence-level 靜默回傳 0：併 #83。
- pilotfish 42 天事實過期、Chrome 釘版／升級接力：併 #85／#130。
- Headroom 清理殘留、T9 環境消失、試用明細孤兒檔：併 `mechanism-decommission-decay`。
- storm perspective 掛載點搬家、轉發責任切分：併 `trigger-ownership-split`。
- skill 庫存治理、safe-trial 探索波：併 #106。
- closeout 生命週期：先併 #133／#126，不另立。
- Semble 範圍同意閘門：併 #70 工具採用續篇素材，單日零行為樣本不立題。
- repo 站台 Jelly／動畫迭代：屬站台設計功能，不進選題。
- 公司 repo 純除錯／功能：依 topic-taste 剔除。
- workshop：本窗零活動。
