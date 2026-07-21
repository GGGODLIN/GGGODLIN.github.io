---
title: 接得上，不代表合得來：把 GPT 接進 Claude Code 的三顆雷
description: 把 ChatGPT 訂閱額度接進 Claude Code，協議通了只是開始。真正難搞的是內建生態錯配、設定靜默蓋值，還有三個意思完全不同的上下文視窗數字。
pubDate: 2026-07-20
tags: ["claude-code", "vendor-swap", "gpt", "llm"]
---

# 接得上，不代表合得來：把 GPT 接進 Claude Code 的三顆雷

最近日常主力模型 Claude Fable 的額度實在不太夠用，剛好手上 ChatGPT Pro 方案的額度多很多，我就想把 GPT-5.6 Sol（GPT-5.6 家族的旗艦檔）接進 Claude Code，當主力的替補。

OpenAI Codex 負責人 Tibo Sottiaux 貼了一份[半官方配方](https://x.com/thsottiaux/status/2076119366647894371)，一週左右累積 250 萬瀏覽。做法大致是把 Codex OAuth 經過 [router-for-me/CLIProxyAPI](https://github.com/router-for-me/CLIProxyAPI) 中繼，再把 Claude Code 的模型槽位映射到 GPT。

這是模型供應商系列第三篇；前兩篇談過[換第三方模型的代價](https://gggodlin.github.io/blog/cc-vendor-swap/)和[換完留下的回報](https://gggodlin.github.io/blog/vendor-benefit/)，這次直接跨到 OpenAI 訂閱。

我原本以為協議接通就差不多了，後來才發現後面還有三顆雷，而且最大顆根本不在協議層。

## 最大顆的雷藏在內建生態

最致命的是 `claude-api` skill。

它是一份完整的 Claude API 參考文件，觸發條件非常寬：提到 Claude、Anthropic，甚至一般 LLM 任務都可能觸發，一觸發就把整包文件塞進對話。接入當天的 session 快照裡，這一包大約 808KB，換算約 20 萬 token（體積是接入當天的快照值、後來沒有重新量測；觸發條件倒是重新確認過，還是一樣寬）。

當時 Claude Code 的環境 baseline已有 56.8k token，加上這一大包、再算上 session 裡既有的對話，直接撞穿當時沿用配方設定的 272k 視窗，只剩一句 `Prompt is too long`。

拿同一個問題「你是什麼模型」做過一組對照：跑 Claude 模型的 session 會自己判斷不必查 Claude API，直接跳過；跑 Sol 的 session 看到觸發條件就照字面執行，然後一腳踩下去。同一份快照掃過其他 90 多個 skill，單發都在 29KB 以下，只有它大到能一擊送走 session。

問題也不只是一個 skill 太肥。Claude Code 的內建元件帶著對 Claude 判斷習性的預期，外來模型照同一份規則做事，扣扳機的方式卻不一樣。所以，協議相容，生態不一定相容。

最後在我啟動 GPT 用的包裝腳本（下稱 GPT 入口）裡停用 `claude-api` skill，另外把 MCP 單次輸出限制在 25,000 token，Bash 輸出超過 30,000 字元就截斷留標記。這類保險做得好，就是讓人徹底忘記它存在：之後視窗再也沒被單發撐爆過。

## settings 會讓模型悄悄跑錯棚

我的全域 `settings.json` 原本把模型釘在 `claude-fable-5[1m]`，GPT 入口則用 `ANTHROPIC_MODEL` 環境變數指定 Sol。

實際上 settings 裡的 `model` 欄位會蓋掉環境變數。中繼層不認得 Fable，卻把它模糊匹配到另一個供應商池裡的 claude-sonnet-4-6。結果 Claude Code 表面正常、回答也正常，背後跑的卻既不是 Sol，也不是 Fable。

這次沒有任何錯誤訊息，最後是翻中繼服務自己的用量紀錄、看每筆請求實際被哪個上游模型服務，才對出帳來。修法是啟動時明確傳入 `claude --model`，因為命令列旗標的優先順序高於 settings。能回話不代表接對模型；靜默錯配才最難抓。

## 272k、372k、1.05M 是三件事

一開始照 Tibo 的配方，把 272k 當成 GPT-5.6 的模型上限。後來查官方資料才發現，272k 是長上下文計價門檻：輸入超過後，輸入價格變成兩倍、輸出價格變成 1.5 倍。它不是 GPT-5.6 的硬上限。

1.05M 才是官方模型視窗，但那是 API key 計價路徑的數字。Codex OAuth 經中繼服務又是另一個結果：用二分逼近夾邊界，輸入 371,831 個 token 可以過、再多 33 個就被拒，實測上限就在約 372k。偏偏 Codex 快取的模型目錄標的是 272000，跟實測結果繼續打架。

省流：272k 是計價門檻，約 372k 是 Codex OAuth 中繼的實測邊界，1.05M 是 API key 計價路徑的官方模型視窗。三個數字都是真的，只是在回答不同問題。這種時候我會信邊界測試，不信目錄裡的一行數字。

## fast 回報 default，實際上有加速

三顆雷之外，fast 模式還附贈一個反直覺發現。不管請求有沒有開 fast，API 回應裡的 `service_tier` 都是 `default`。[openai/codex#30413](https://github.com/openai/codex/issues/30413)和[openai/codex#32191](https://github.com/openai/codex/issues/32191)也有人回報相同情況。

但控制實測顯示 fast 確實有效：先拿官方明列支援加速的 GPT-5.5 驗證、約快 1.38 倍，再測 GPT-5.6 Sol、約快 1.30 倍。額度消耗接近 2.5 倍，跟[官方 Speed 文件](https://learn.chatgpt.com/docs/agent-configuration/speed)寫的 2.5 倍額度對得上；速度就比官方宣稱的 1.5 倍低一些，實測為準。

任務還得夠大。輸出約 650 token 時幾乎看不到訊號，拉到約 1,500 token 才看出生成階段變快；首個 token 等待時間（TTFT）沒有明顯差異。`service_tier: default` 只能證明不能靠這個欄位判斷 fast 有沒有被服務，不能據此認定 fast 無效。

## 接進來了，但還沒取代 Fable

GPT 的實作能力很強，這點沒什麼好拗。問題是純實作交給 Codex CLI 就好，我把 GPT 接進 Claude Code，真正想補的是研究、討論和長任務的額度韌性，偏偏以目前的使用體感，這塊還是 Fable 比較強。

Codex OAuth 中繼約 372k 的視窗，比 Fable 的 1M 小得多；長對話經過自動壓縮後，規劃與討論也更容易漏細節。我推測和 compact 過程丟失資訊有關，但這是工作流體感，沒有獨立實驗。

現在還是按任務分流：實作交給 GPT，需要長脈絡研究與討論時回 Fable。這次橋接沒有換出全面更強的主力，倒是多了一條額度備援，也留下很實用的量測紀律。

協議通了，只能證明兩邊會說話。內建生態怎麼判斷、設定到底聽誰的、視窗數字在描述哪一層，這些才決定它能不能真的留下來。
