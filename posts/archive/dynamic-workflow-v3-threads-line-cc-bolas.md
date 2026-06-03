---
title: "官方 deep-research workflow 撞牆記：75 個 agent 一次湧入是什麼感覺"
description: "拿 Claude Code 內建的 deep-research workflow 密集跑研究，然後撞上了 server-side burst 限流。記一下怎麼撞、撞了什麼、怎麼繞過去。"
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫）
source: posts/dynamic-workflow-MATERIAL.md
---

最近幾天密集拿 [Claude Code 內建的動態工作流](https://claude.com/blog/introducing-dynamic-workflows-in-claude-code)跑研究，然後撞牆了。功能背景和三種觸發方式在先發篇「[ultracode workflow，別跑完就丟](https://gggodlin.github.io/blog/workflow-vs-skill/)」裡都有講，這篇不重複，直接寫撞到什麼。

---

撞的是官方的 `deep-research` workflow，一個 Claude Code binary 內建的 named workflow。不是我自己寫的腳本，是官方設計的那支。

架構大概是：一個 Scope agent 確定研究範圍，5 個 Search agent 找資料，15 個 Fetch agent 抓全文，然後 Verify 階段 25 個 claim 每個都要投 3 票，也就是 75 個 agent 一次全部湧出去，最後 Synthesize。整支跑下來大概 100 個 agent 出頭。

我原本以為腳本寫死就等於行為確定，後來才發現腳本管不了 server-side burst 限流。

---

**撞名坑先記一下**：我之前自己寫了一個 deep-research skill，結果跟官方 named workflow 同名。兩條通道（Skill tool 和 Workflow tool）是獨立的，互不感知、互不蓋掉。直接點名 `deep-research` 才能叫到官方那支，否則 CC 看你的表達方式決定要走哪條。這個我後來用 engine routing gate 處理掉了（commit af429ac），但當初發現這個洞的時候確實傻了一秒。

---

**撞限核心。** 在 Opus 4.8 的 session 下跑官方 deep-research，Verify 階段 75 個 agent 在大概 13 秒內全部湧進去，直接頂破 Anthropic 的 acceleration limit。

首次發現是 session `ae6ffbbc`：101 個 agent、64 個撞 429、整支 workflow fail。Token 燒了大概 210 萬，時間 7 分鐘，然後結果是一片廢墟。

錯誤訊息很直白：「temporarily limiting requests, not your usage limit」。不是你的帳號額度燒光了，是 server-side burst 限流，Anthropic 偵測到你的組織用量陡增觸發的獨立類別 429，跟一般的 RPM/ITPM rate limit 不是同一回事。

我以為是偶發，後來同題跑第二次（session `2d626635`），這次約 50/107 個 agent 撞、46 個 verify subagent 全滅、只完成 6 個研究對象裡的 2 個。兩次都撞、撞限數在 50 到 64 之間浮動，算是結構性的，不是運氣不好。

---

**撞了之後的代價很具體。** Verify 失敗的 claim 被歸類為「已反駁」，不是「未驗證」，是直接當反駁處理。

拿 LLM 評估框架那次舉例：Phoenix v16.3.0、Braintrust Pro 每月 249 美元定價、Ragas v0.4.3 這三個全被歸進「反駁」清單。paced 版重跑以後，這些全部證實為真。Verify 沒跑完不是「少幾個 claim」，是「假死的 claim 被當垃圾丟掉」，影響的是結果的完整性，不是準確度。

---

**解法是什麼。** Fork 了一支批次版，叫 `deep-research-paced`。唯一的改動是 Verify 從一次 parallel 75 個，改成每批處理 2 個 claim（6 個 agent）序列跑。峰值並發從 13 降到 6。

結果：0 撞限、25 個 claim 全部跑完足票、findings 從 8 個增加到 11 個、7 個研究對象全到（原版只完成 2/6）。品質一票沒少，只是時間變成大概 20 分鐘，原版是 8 分鐘，大約 2.5 倍。Token 代價在這個 session 觀察到的是大概 1.85 倍，這個數字是單一 session，供參考。

固化這支之後，engine routing 裡的「官方 workflow」選項現在預設指向 paced 版。

---

**一個值得細想的地方：端點決定撞不撞，不是腳本決定。**

官方腳本裡 0 個 model override，所有 agent 全部繼承 session 主模型。Opus session 就是全部 Opus，然後撞。同題同腳本拿另一個端點跑：66 分鐘、0 撞限。

所以撞不撞這件事，說到底取決於你開的是哪個 session，不是腳本本身有沒有問題。越貴的端點越快撞，這個結果有點反直覺。

---

**為什麼最後主力用官方 workflow 而不是自己的 deep-research skill。** 這個問題值得講一下，因為我自己的 skill 其實功能不差：8 個 phase 的管線、有 citation 追蹤、可以出 PDF。

但官方 workflow 是 3 票對抗式驗證，每個 verify agent 還自己再跑 WebSearch 找反證，把站不住的 claim 砍掉。這個砍除率大概 60%，留下來的 finding 純度很高。

我自己的 skill 驗證是單管線，對抗性就是比不上。撞限是官方版唯一的問題，paced 解決以後，沒有理由不用品質更高的那支。自己的 skill 就留給「要 PDF 可追溯交付」的場景用。

---

**給自己要寫 workflow 的人附帶一提。** 幾個容易踩的地方：parallel 和 pipeline 的結果記得先篩 null；budget 迴圈如果漏加 guard，remaining() 會回 Infinity，跑到 1000 個 agent 上限才停；determinism 是字串級靜態檢查，prompt 字串只要字面上含 `Date.now` 或 `Math.random` 就被攔，不是真的執行才攔；meta 欄位必須是純文字常量。

---

結論是：腳本確定性很好，但 fan-out 規模由腳本決定之後，burst 密度問題也繼承進來了。官方的 75 agent 一次湧入，設計上沒有問題，但 Opus 端點跑不過去。解法不是少跑幾個 claim，是把峰值並發壓到限流線以下。

功能目前是 research preview（GA 日期 2026-05-28，我測試的時間是 2026-06-02），行為還可能變動，供大家參考。
