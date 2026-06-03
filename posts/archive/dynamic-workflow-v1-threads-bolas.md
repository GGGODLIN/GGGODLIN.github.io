---
title: "官方 deep-research workflow 撞限，我自己 fork 了一支"
description: "拿 Claude Code 內建的 deep-research workflow 跑 Opus 4.8，verify 階段 75 個 agent 同時湧入，server burst 限流直接讓整支流程 fail。記錄撞限原因、影響範圍、還有我最後 fork 出 deep-research-paced 的過程。"
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫）
source: posts/dynamic-workflow-MATERIAL.md
---

這幾天密集拿 CC 內建的動態工作流跑研究，撞了一個我原本以為不會撞的東西。

動態工作流（[dynamic workflows](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)）是什麼、三種觸發方式、怎麼跟 skill 競爭固化載體這些，前篇「[ultracode workflow，別跑完就丟](https://gggodlin.github.io/blog/workflow-vs-skill/)」已經完整講過，這裡不重複。這篇只記一件事：拿官方 `deep-research` named workflow 搭 Opus 4.8 跑，在 verify 階段被 server burst 限流 fail 掉，兩次。

## 先踩到的坑：撞名

正式談撞限之前，有個前情提要。

我本來就自己寫了一個 `deep-research` skill，在 `~/.claude/skills/deep-research`，8 個階段、有 citation 追蹤、能出 PDF。CC 也有一支官方的 `deep-research` named workflow，是 CC binary 內建的，不是公告附帶的、檔案系統裡也找不到，只能用名字點名呼叫。

這兩個名字一模一樣，但走的是兩條完全不同的通道：skill 走 Skill tool、workflow 走 Workflow tool，兩邊獨立、互不感知、也不會互蓋。我在搞清楚這件事之前，一直以為我在測官方 workflow，結果跑的是自己的 skill。摸清楚邊界之後，才真正讓官方版跑起來，然後撞限。

## 75 個 agent 一次衝，Opus 端點直接頂破

官方 `deep-research` workflow 的架構大概是這樣：Scope（1 個）→ Search（5 個）→ Fetch（15 個）→ Verify（25 個 claim 每個 3 票 = 75 個）→ Synthesize（1 個），單題大約 97-105 個 agent。

verify 階段是高潮，也是雷。75 個 agent 設計上一次並行全部湧入，而我這台機器的引擎並發上限是 min(16, 15-2) = 13，這 75 個會在 13 秒內以每批 13 個的速度爆發出去。

在 Opus 4.8 端點下跑，這個爆發密度直接頂破了 Anthropic 的 acceleration limit——server-side 的 burst 限流，錯誤訊息明說「temporarily limiting requests, not your usage limit」，是組織用量陡增觸發的獨立 429，跟帳號額度沒關係。

首次發現是在 session `ae6ffbbc`：101 個 agent 裡 64 個撞到 429，13 秒內爆發，燒掉 2.09M token，workflow 直接 fail。

這個反直覺的點在於：撞不撞取決於 **session 端點**，不是腳本寫得好不好。官方腳本沒有任何 model override，所有 agent 繼承 session 主模型，用 Opus session 就全跑 Opus，burst 密度就高。同一支腳本換 mimo 端點跑，66 分鐘、0 撞限。

為了確認不是偶發，同題又跑了一次原版（session `2d626635`）：約 50/107 agent 撞、46 個 verify subagent 全滅、只完成 2/6 研究對象。撞限數在 50-64 之間浮動，視 burst timing 而定，但次次都撞。

## 撞限的代價不是「比較慢」，是「結論錯」

這邊要特別說一下。撞限不是讓結果品質下降，是讓結果**正確性坍塌**。

verify 階段設計的邏輯是：每個 claim 3 個 agent 各自找反證投票，要過得了這一關才算 verified。verify agent 撞了 429 沒執行，那個 claim 就自動被歸為 refuted（已反駁），得票 0-0。

第二次原版的跑法裡，46 個 verify agent 全滅，46 個 claim 全部「假反駁」。我拿 paced 版重跑同一題之後，那些被歸反駁的全部都通過了。具體案例：Phoenix v16.3.0 的版本號、Braintrust Pro 的 $249 定價、Ragas v0.4.3 的版本——全部被誤殺，全部在 paced 版確認正確。🤣

如果沒有拿對照組驗過，你會拿著一份 findings 8 條、refuted 15 條的結果去用，但事實上那 15 條裡面有一堆是真的。

## fork 出 deep-research-paced

解法其實很直白：把 verify 從一次 parallel(75) 改成每批 2 個 claim 序列跑，peak 並發從 13 降到 6（2 個 claim × 3 票），burst 密度降下來，限流就消失了。

官方的 prompt、schema、驗證邏輯、3 票機制全部一字不動，改的只有並發節奏。

paced 版的實測：0 撞限、25/25 claim 全票通過、findings 從 8 長到 11、7 個研究對象全部完成（原版 2/6）。代價是時間約 2.5 倍（20 分鐘 vs 8 分鐘），token 大約 1.85 倍（這是單 session 觀察到的數字）。

現在 `deep-research-paced` 已經固化成我這邊的 global named workflow，放在 `~/.claude/workflows/deep-research-paced.js`，engine routing 預設指向它。Opus 端點才需要 paced，其他端點視情況調整每批並發數，沒有「最佳並發數 = 2」這種通案。

## 為什麼沒有繼續用自己寫的 skill

我原本的 `deep-research` skill 不是沒有優點：8 個階段的管線設計、citation 可追溯、能輸出 PDF 交付。

但切到官方 workflow（paced 版）之後，沒再切回去。理由只有一個：**官方版的對抗式驗證品質更高**。

每個 verify agent 不只是贊成或否決，它自己會跑 WebSearch 去找反證。25 個 claim 跑完，實測大約 60% 的對抗率（意思是官方版主動砍掉六成沒站穩的 claim，留下來的純度很高）。自寫 skill 的驗證沒有這個對抗性，比不上。

撞限是官方版唯一的痛。paced 把那個痛解掉之後，就沒理由不用品質更高的那支。自寫 skill 我留著，專門用在「要 PDF 可追溯交付」的場景。

## 給想自己寫 workflow 的人

順帶一提幾個腳本坑，不展開：parallel/pipeline 結果記得先篩 null、budget 迴圈要加 `budget.total &&` guard 否則無目標時 remaining() 回 Infinity 直衝 1000 agent 上限、determinism 是字串級靜態檢查（prompt 字串只要字面含 `Date.now`/`Math.random` 就攔，不管有沒有執行到）、meta 欄位只能放純文字常量。

## 腳本確定性的新限制軸

`deep-research` workflow 是 CC 2026-05-28 隨 Opus 4.8 一起 GA 的（research preview），到今天（2026-06-02）功能還在 preview 階段，行為仍可能調整。

動態工作流把「哪些 agent、什麼順序、怎麼彙整」從模型臨場決定移到腳本層，帶來可重現性。但 fan-out 規模由腳本決定之後，burst 密度也是腳本繼承的。官方設計的 75 agent 一次湧入，在 Opus 端點下剛好頂破那條線。

解法不是砍驗證票數或砍 claim 數，是把峰值並發壓在限流線以下，品質一票不少。
