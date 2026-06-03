---
title: "官方 deep-research workflow 撞 server burst 限流：踩坑與 fork 解法"
description: "Claude Code 內建的 deep-research workflow 在 Opus 4.8 端點跑到 verify 階段，75 個 agent 一次湧入直接觸發 server-side burst 限流。這篇記錄撞限過程、影響性質、fork 出批次節流版的解法，以及給想自寫 workflow 的人幾個常踩的坑。"
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從收窄版 MATERIAL 寫，無 voice）
source: posts/dynamic-workflow-MATERIAL.md
---

# 官方 deep-research workflow 撞 server burst 限流：踩坑與 fork 解法

動態工作流（dynamic workflows）讓 Claude Code 能用腳本編排一批 subagent、帶來可重現的流程，細節已在先發篇[《ultracode workflow，別跑完就丟》](https://gggodlin.github.io/blog/workflow-vs-skill/)完整交代。這篇是系列後發，聚焦一個第一手踩坑：用 CC 內建的官方 `deep-research` workflow 跑研究，在 Opus 4.8 端點直接撞上 server-side burst 限流，verify 階段 75 個 agent 一次湧入、整支 workflow 失敗。

---

## 撞名：自寫 skill 和官方 named workflow 同名共存

在踩到限流之前，先遇到另一個問題：我自己寫過一支 `~/.claude/skills/deep-research`，用來做小規模的多來源查詢。CC 裡面同時存在兩條通道：Skill tool 叫出自寫的 skill、Workflow tool 叫出官方的 named workflow，兩者獨立運作，互不感知也不互蓋。

這裡需要說明一個前提：CC binary 本身內建了幾支官方 named workflow，`deep-research` 是其中之一。這些 workflow 編在程式裡，在檔案系統找不到它們，只能用名字點名叫出來。它們不是公告文章附帶的腳本，而是 CC 的一部分。

有了這個認識，問題就清楚了：使用者說「幫我做 deep-research」，CC 到底叫哪條？如果不明確指定通道，行為會取決於觸發方式。這個撞名問題的解法是在 skill routing 層加一道引擎閘，確保明確點名 named workflow 時不會落到自寫 skill。解法已實作（commit `af429ac`）。

---

## 撞限：verify 階段 75 個 agent 一次湧入

把範圍收窄到「官方 `deep-research` workflow 在 Opus 4.8 端點」這個特定組合，才是主軸。

官方 `deep-research` 的架構大致是：Scope 建立研究範圍（1 個 agent）、Search 抓資料（5 個）、Fetch 撈全文（15 個）、Verify 交叉核實（25 個 claim，每個 claim 3 票投票，共 75 個 agent）、Synthesize 彙整（1 個）。整支跑下來約 97 到 105 個 agent，視題目規模略有增減。

在 15 核機器上，引擎並發上限公式取「16」和「核心數減 2」兩者的較小值，得出上限為 13。前幾個階段的 agent 數不超過這個上限，能順排。到 Verify 階段，腳本設計是一次把全部 75 個 claim 驗證 agent 全部丟進去。在 Opus 4.8 端點，這個瞬間湧入觸發了 Anthropic 的 acceleration limit（server-side burst 限流），不是帳號額度耗盡。限流訊息的原文是「temporarily limiting requests, not your usage limit」，兩者是不同的機制。

第一次發現這個問題是在 session `ae6ffbbc`（workflow ID `wf_807b9402`）。逐 agent 核實的結果：101 個 agent 裡有 64 個撞上 429，主要發生在約 13 秒的爆發視窗內，整支 workflow 失敗，消耗了約 2.09M token。

---

## 非直覺：端點決定撞不撞，不是腳本

這個結果有一個非直覺的地方：撞不撞不取決於腳本本身，而是取決於 session 跑在哪個端點。

官方 `deep-research` 腳本裡沒有任何 model override，所有 subagent 繼承 session 的主模型。Opus session 就全部跑 Opus，整體速度快，但正因為快，burst 密度也高。把同一題、同一支腳本換到 mimo 端點（模型推論速度不同），結果是跑了 66 分鐘、0 個 agent 撞限。

換句話說，**跑越貴、越快的模型，反而越容易在這個設計下撞限**。這不是腳本設計問題，是端點特性和腳本 fan-out 規模的交互影響。

---

## 撞限的影響性質：正確性無損，完整性重創

光說「失敗」不夠精確，需要說清楚失敗的性質。

`deep-research` verify 階段的設計是：每個 claim 由 3 個 agent 分別投票（confirmed / refuted / insufficient evidence），最後看得票數判斷 claim 的可信度。如果投票的 agent 失敗了、沒有回應，那個 claim 預設被歸為「已反駁（refuted）」，是假死而非真的驗證否定。

在 session `ae6ffbbc` 發生的就是這種情況。同一題後來做了第二次原版對照（session `2d626635`），結果約 50/107 個 agent 撞限，46 個 verify subagent 全數失敗，只跑完 6 個研究對象裡的 2 個，findings 8 條，refuted 15 條。

兩次同題都撞、撞限數隨 burst timing 浮動在 50 到 64 之間——這不是偶發，而是結構性問題。

paced 版（後面說明）重跑後，把之前被歸為「已反駁」的 claim 一一核實，發現全部都是真實的。其中幾個具體例子：Phoenix v16.3.0、Braintrust Pro $249、Ragas v0.4.3，這些在撞限版裡被標為 refuted，paced 版全部核實為正確。

---

## 解法：fork 一支批次節流版

官方腳本在 verify 階段把 75 個 agent 一次全部丟進去。改法直接：不要一次全丟，改成每批處理 2 個 claim，序列跑完再跑下一批。每批 2 個 claim、每個 claim 3 票，peak 並發從 75 降到 6。

這支 fork 叫做 `deep-research-paced`，除了 verify 批次大小這一個改動，其他地方逐字保留官方版：3 票投票、25 個 claim、prompt 和 schema 一字不改，也不換模型。

實測結果（官方 `deep-research` workflow + Opus 4.8 端點，2026-06-02 測試，功能目前仍處於 research preview 階段）：

- 撞限：0 個
- claim 完成率：25/25（全部足票）
- findings 數量：11 條（原版撞限版 8 條）
- 研究對象完成率：7/7（原版 2/6）
- 時間代價：約 2.5 倍（約 20 分鐘對比 8 分鐘）
- token 代價：約 1.85 倍（此數字來自單一 session 實測觀察）

fork 的副作用只有時間變長和 token 增加，正確性和完整性沒有妥協。`deep-research-paced` 已固化為 global named workflow，路徑在 `~/.claude/workflows/deep-research-paced.js`，綁回 skill routing 當預設的細節見先發 B 篇。

批次大小為 2 是針對 Opus 4.8 端點的實測值，其他端點的合適值未系統實測，建議視端點調整批次大小。

---

## skill 還是 workflow：為何主力轉向官方 workflow

撞限解掉之後，還有一個更根本的選擇問題：我自己本來就寫過一支 deep-research skill，為什麼最後主力用官方 workflow？

兩者定位不同。自寫的 skill 是一條 8-phase 結構化管線，有 citation 追蹤、證據持久化，能輸出 PDF 交付報告、可追溯，但它的驗證是單管線跑下來的。官方 workflow 不一樣：它的 verify 階段是 3-vote 對抗式驗證，每個 claim 由三個 agent 分別投票，而且每個 verify agent 還會自己跑 WebSearch 找反證、主動嘗試推翻 claim。站不住的 claim 會在這關被砍掉（實際跑下來約六成的 claim 被對抗式驗證砍除，留下的是高純度 finding）。

最後主力用官方 workflow 的理由就是這個：對抗式驗證的品質更高，自寫 skill 的驗證對抗性比不上。撞限是官方版唯一的痛，paced fork 解決之後，就沒有理由不用品質更高的那一支。自寫的 skill 則留給「要 PDF、要可追溯交付報告」的場景。

這也呼應先發 B 篇講的「workflow 是繼 skill 之後第三種固化載體、跟 skill 競爭」：這裡是一個第一手實例，我自己從 skill 轉向了 workflow，理由是驗證品質。

---

## 給想自己寫 workflow 的人：幾個常踩的坑

自寫 workflow 腳本有幾個地方容易出問題，簡單列出：

第一，parallel 和 pipeline 的結果記得先過濾空值再往下傳，否則下游步驟可能拿到預期之外的輸入。

第二，budget 迴圈如果漏掉判斷目標是否存在的保護條件，`remaining()` 可能回傳無限大，導致腳本一路跑到 1000 個 agent 的總上限才停。

第三，determinism 機制是字串層級的靜態檢查：只要 prompt 字串裡面包含 `Date.now` 或 `Math.random` 這樣的字面值，就會被攔下來，不是等到執行時才判斷。

第四，`meta` 區塊只接受純文字常量，不能放運算式。

---

## 小結

動態工作流把「派哪些 agent、以什麼順序、怎麼彙整」從模型臨場決定移到腳本層，帶來可重現性。但腳本確定了 fan-out 規模，也就把 burst 密度問題一起鎖進了腳本——官方設計的 75 agent 一次湧入，在 Opus 端點直接頂破 server-side burst 限流。

解法不是降低品質（砍驗證票數或減少 claim 數量），而是把峰值並發壓在限流線以下（批次節流）。品質一票不少，代價只是時間。

功能目前仍是 research preview 狀態（以 2026-05-28 GA、2026-06-02 測試為時間錨），生產環境可用，但需要自備限流處理。
