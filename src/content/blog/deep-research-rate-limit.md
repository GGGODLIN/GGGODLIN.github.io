---
title: "官方 deep-research workflow，我用 Opus 跑一次掛一次"
description: "拿官方 deep-research workflow 密集跑研究，75 個 verify agent 一次湧入、直接頂破 Anthropic 的 acceleration limit。撞名、撞限、自己 fork 一支批次節流版的復盤。"
pubDate: 2026-06-03
tags: ["claude-code", "workflow", "deep-research"]
---

# 官方 deep-research workflow，我用 Opus 跑一次掛一次

最近把 [dynamic workflows](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)（2026-05-28 GA）拿來密集跑研究任務，功能怎麼運作我在另一篇「[ultracode workflow，別跑完就丟](https://gggodlin.github.io/blog/workflow-vs-skill/)」講過了，這篇聚焦一個我親身踩到的坑：官方 `deep-research` workflow 在 Opus 4.8 server 上跑，撞了 server-side burst 限流，75 個 verify agent 擠在同一波送出去，整支 workflow 直接 fail。

---

## 先踩的不是限流，是撞名

一開始根本不知道有撞限這回事，因為更早踩了另一個坑。

我自己寫過一支 `deep-research` skill（`~/.claude/skills/deep-research`），8 個階段的研究 pipeline，有 citation 追蹤、可以出 PDF 交付報告。Claude Code 二進位裡也有一支官方的 `deep-research` named workflow，是內建進去的，檔案系統找不到，只能用名字呼叫。

這兩個撞名了，但兩條通道完全獨立、互不感知——Skill tool 走 skill、Workflow tool 走 named workflow。我以為在叫官方版，實際上叫到哪一支要看怎麼設定。解法是在自己的 skill 裡加一道判斷，呼叫的時候先確認要走自寫的 skill 還是官方的 workflow，再往下跑。撞名問題修掉後，才正式開始密集用官方版，然後撞到真正的牆。

---

## 官方 deep-research 一次會展開多少 agent

先說架構。CC 內建的官方 deep-research workflow，跑起來大概是這個結構：

- Scope 階段：1 個 agent 分析研究範圍
- Search 階段：5 個 agent 並行搜尋
- Fetch 階段：15 個 agent 抓取內容
- Verify 階段：每個研究對象 25 個待驗 claim，每個 claim 3 票驗證，一次全部湧入，75 個 agent
- Synthesize 階段：1 個 agent 彙整

**場景說明：以下數字都是「官方 deep-research workflow + Opus 4.8」這個組合下的結果，換別家 server 或別的 workflow 可能差很多。**

第一次跑（逐 agent 核實）：

- 單題 agent 總數 101 個
- Verify 階段 75 個 agent 一次湧入
- 我這台 15 核機器，引擎並發上限 = 13
- 撞 429 的 agent：64 / 101
- 撞限集中在約 13 秒內爆發
- 整支 workflow fail，燒了約 2.09M token

限流訊息很直白：「temporarily limiting requests, not your usage limit」。這是 Anthropic 的 acceleration limit，組織用量陡增觸發的獨立 429 類別，不是一般的 RPM 或 ITPM 額度耗盡。

---

## 反直覺：撞不撞看你連哪家 server，不是腳本

這是我覺得最非直覺的地方。

官方腳本裡面 0 個 model override，所有 subagent 全部繼承 session 主模型。也就是說，在 Opus session 下跑，75 個 verify agent 全部打 Anthropic 的 Opus server。

同一支腳本、同一個題目，換到另一家公司的 server（mimo），跑了 66 分鐘、0 撞限。Opus session 版 7 分鐘跑完（但是 fail 的）。

關鍵不是模型貴不貴、快不快，是 server 端的限流政策。Opus 走的是 Anthropic 的 server，那邊有 acceleration limit 這種 burst 限流，一次展開的 agent 一多就撞；mimo 是完全不同公司的 server，限流政策不一樣，同一支腳本就不撞。撞不撞，看你 session 連到哪一家的 server。

同題跑了第二次當對照（fork paced 前的原版）：約 50/107 agent 撞、46 個 verify subagent 全滅、只跑完 2/7 研究對象。兩次同題都撞、撞限數在 50 到 64 之間浮動，不是偶發，是結構性的。

---

## 撞限之後，「已反駁」的 claim 都是錯的嗎

這個才是真正的代價。

Verify 階段的邏輯：每個 claim 3 個 verify agent 投票，沒搜到反證就支持，找到反證就反駁。撞限的 agent 直接 fail，得票數歸零，claim 預設被當成「已反駁」。

這不是 claim 真的被驗出有問題，是 verify agent 假死。

我做的那份研究（LLM 評估框架七方對比）裡，Phoenix v16.3.0 的版本資訊、Braintrust Pro 方案 249 美元的定價、Ragas v0.4.3 的架構說明，都被歸成「已反駁」。paced 版重跑後，這三條全部證實為真，是撞限造成的誤判，不是我的研究材料有問題。

正確性沒有損壞，但完整性被重創。如果你看到一份原版跑出來的 deep-research 結果，它的 refuted 清單裡有相當比例可能是假死。

---

## fork 一支批次節流版

解法不複雜，就是把 Verify 階段的並發壓下來。

我 fork 了一支 `deep-research-paced`，唯一改動：把原本一次全部湧入的 parallel(75) 改成每批 2 個 claim 序列跑，peak 並發從 13 降到 6。模型沒換、prompt 沒動、schema 逐字一致、驗證票數一票不少，就是把峰值並發切成小塊。

同題、同一個 Opus 4.8 server 重跑 paced 版，結果：

- 撞限次數：0
- 25/25 claim 全票完成
- findings 數量：11（原版因為大量假死只跑出 8）
- 研究對象完成率：7/7（原版 2/7）
- 時間代價：約 20 分鐘，原版約 8 分鐘，2.5 倍左右
- token 代價：相對同題原版，在這個 session 觀察到約 1.85 倍

時間變長了，但品質回來了。重點不是跑慢，是把峰值並發壓在限流線以下；批次大小看你連哪家 server 調整，2 不是通案。

---

## 為什麼從自寫 skill 轉向官方 workflow

我自己寫的 deep-research skill 功能不差，8 個階段、citation 追蹤、可以出 PDF、pipeline 清楚。但驗證只有單一條 pipeline，找到支持就過，沒有對抗性。

官方 deep-research workflow 的驗證設計不一樣：每個 verify agent 不只確認支持證據，還自己去跑 WebSearch 找反證，3 票裡只要有一票找到夠強的反證就被砍掉，約六成的 claim 在這個過程中被過濾。留下來的才進 findings。

這就是我主力換過去的理由：**對抗式驗證品質更高**。自寫 skill 的驗證對抗性比不上官方版，不是功能不完整，是設計目標不同。撞限是官方版唯一的痛，paced 解決之後就沒有理由繼續用品質較低的那支了。

自寫 skill 的角色現在是「要 PDF 可追溯交付」的場景，這個官方版本來就不做。

---

## 附帶：自己寫 workflow 的坑

如果你想自己寫 workflow 腳本，順便附帶提一下幾個會踩到的地方：

Determinism 檢查是字串級靜態掃描，prompt 字串只要字面上含有 `Date.now` 或 `Math.random` 就被攔，不是執行時才攔。Budget 迴圈如果沒加 `budget.total &&` guard，`remaining()` 在沒有目標時會回 Infinity，有機會跑到 1000 agent 上限。Parallel 和 pipeline 的結果記得先篩 null，不篩的話後面的邏輯會在邊界 case 出問題。Meta 欄位必須是純文字常量，不能動態運算。

---

## 最後

腳本確定性是 dynamic workflows 的賣點，但一次展開多少 agent 由腳本決定之後，burst 密度問題也跟著進來了。官方設計的 75 個 agent 一次湧入，落到有 acceleration limit 的 Anthropic server，就從一個編排問題變成了 server burst 問題。

解法不是降低品質（砍 claim 數或降票數），是把峰值並發壓低（paced）。品質一票不少，只是時間換空間。

功能現在還是 research preview（2026-05-28 GA、2026-06-03 測試），生產可用，但要自備限流處理。這也是 Claude 內部用無限 token 驅動的功能、直接放出來的經典坑：內部開發時不會撞的限流，端到外部就現形了。
