---
title: Claude Code 換第三方模型，換到的是有條件的韌性
description: 換掉 Claude Code 的模型供應商，真正換到的是額度韌性。但這個韌性的備用方案會踩到中國模型的內容審查、靜默降級成 200K 的舊模型而爆炸——有條件的韌性。
pubDate: 2026-07-08
tags: ["claude-code", "vendor-swap", "llm"]
---

# Claude Code 換第三方模型，換到的是有條件的韌性

上一篇[代價篇](https://gggodlin.github.io/blog/cc-vendor-swap/)列了一堆坑：WebSearch 四死法、協議／功能／生態三層代價、中介層破口。讀者自然的追問是，那到底為什麼還換？

表面答案是省錢。我在 [threads 早期五模型評測](https://www.threads.com/@gggodlin/post/DYJ3TRdgdm0)寫過省流排序：deepseek V4 pro >> GLM 5.1 >= Kimi 2.6 > mimo > MiniMax 2.7，總結「年初中國模型撐不起 agent，才到年中放進調教很久的 claude code cli 裡都撐得起大部分場景了，重點是便宜到不行」。那是 GLM 5.1／200K 的舊評測世代（本篇是 GLM 5.2／1M 世代），排名不套用到現在——後面會講 mimo 在深度研究這條線反而是我現在的主力。但只是為了省錢的話，我不會多做下面這件事。

## 行為透露的偏好

先說最硬的行為證據。我為了跨 vendor 的額度韌性，額外投資了工程時間去監控備用方案的健康狀態——不只是把換 vendor 當成一次性設定、跑起來就算數。

光是為了省錢的人不會做到這一步。這是行為透露的偏好（revealed preference）：留下來的理由是額度用完不會死，省錢是副產品。

## 額度用完不會死的實際場景

額度韌性的實際意義是什麼？官方 Anthropic endpoint 的 5h 額度（每 5 小時滾動用量上限）撞牆時，備用 vendor 讓長 workflow 不中斷；官方偶爾在服務吃緊時把回應降級成較弱的模型，這時 CN 備用能撐住原本要的品質。額度用完還有東西可用，這是額度韌性承諾的全部。

## 但備用方案自己也會死

額度韌性的備用方案是 CN 模型。CN 模型容易因關鍵字或政治因素觸發內容審查被拒答。我在 [threads 公開寫過](https://www.threads.com/@gggodlin/post/DYMccP8gfhw)：「終究是渾身 G 點的牆國模型，我猜是台灣國觸發了關鍵字被拒答了，真有你的 mimo🤣」。

這是額度韌性上一個沒人事先警告你的漏洞：備用方案自己也會死。

## 審查的紅利與代價一體兩面

同一個 CN 模型審查政策有兩面。代價面是審查無所不在、踩雷後果比想像嚴重。紅利面是 CN 模型道德紅線低，能做 Claude 加錢都不做的灰色地帶。

灰色地帶（道德紅線）這一類任務是 Claude 加錢都做不到的。某付費開發工具的授權，Claude 拒絕幫忙繞，CN 模型能做。灰色地帶這一類任務的不可替代性最強。

紅利跟代價是同一個機制的兩面。

## 靜默降級瀑布

拒答只是表面的麻煩，真正陰險的代價在靜默降級瀑布——備用方案不只是可能拒答，還可能悄悄換一個弱模型繼續服務，讓你以為它還在正常幹活。

我實際踩到的一次是這樣（送出去的封包 + 觀察到的回應可以確認，接下來的因果鏈是我的推論，不是 z.ai 公開的服務行為）：

1. 我叫 Claude Code 用 glm-5.2（1M context 版本，才裝得下多篇 raw 內容）去讀兩篇台灣關鍵字的 threads 正文
2. z.ai 回 HTTP 400 [1301]「偵測到潛在不安全／敏感內容」，明顯是內容審查觸發
3. 這時 Claude Code 換了一個 model 名字（`claude-opus-4-7`）重送——它應該要照我設定的 model，但看起來 fallback 邏輯忽略了我的環境變數
4. z.ai 收到它不認識的 `claude-opus-4-7` 沒報錯、直接用一個舊版 GLM（`glm-4.7`）服務。glm-4.7 是同 vendor 200K context 的舊 flagship（GLM-5.2 是同系列 1M 的新 flagship，z.ai 官方有 migrate guide 從 4.7 遷到 5.2）
5. 我原本累積的 context 快接近 200K，加上系統與工具開銷超過 glm-4.7 的 200K，畫面就跳出「context window limit」
6. 每次重試走同一條路，session 就永久卡死

這鏈裡每一步我都只確認了行為（送什麼、收什麼），沒去挖 CC 或 z.ai 為什麼要這樣接。但表象很清楚：**「買了 1M context 卻只給 200K」**——1M 的兌現取決於內容有沒有踩雷，那是條件機率、不是合約保證。

這個瀑布有兩種失敗面。**大 session 卡死在牆上**，畫面很明顯；**小 session 靜默被舊模型回答**，使用者根本不會發現——回應看起來正常，只是模型悄悄換了。後者更陰險，因為你不知道自己在跟弱模型講話。

修復很土：把 fallback 也釘在同一個 GLM 版本（[cc-vendor-bridge commit 6c5dbbc](https://github.com/GGGODLIN/cc-vendor-bridge/commit/6c5dbbc)），至少換也是換到我指定的那版、不是被服務端隨便挑一個舊的。

關鍵澄清：撞審查的是 **CC 現抓敏感 URL** 的抓取層（去 fetch 那兩篇 threads 正文），不是本文論述本身。把論述內容直接貼進 prompt 餵 glm-5.2 不觸發審查、能正常讀寫——這篇文章其實就是 GLM 寫的，前提是別讓它去現抓敏感 URL。

## GLM 套 voice 後潤色贏 Opus 4.7

CN 模型不只是備用，某些環節正面贏。我現在用 GLM 套上 voice profile（文體規格）寫部落格，比 Opus 4.7 還好一點，贏在潤色／語感環節。

這跟 [steal-determinism-layer](https://gggodlin.github.io/blog/steal-determinism-layer/) 那次形成反轉。那次我讓 GLM 也套上同一份 voice profile 跟 Claude 對打，Claude 勝在語感精準；GLM 模仿作者語氣的能力意外強，但寫出來會夾帶一些中國用語習慣（本體／配置／對口）。

反轉機制是陸味後來被工程化清除，主要靠 [sysprog21/zhtw-mcp](https://github.com/sysprog21/zhtw-mcp) 這個台灣用語檢測工具（教育部 1100+ 詞庫）。清除後 GLM 套 voice 的條件性優勢浮現。

條件性很關鍵：套上 voice 後 GLM 才贏，前提是陸味先用工具清掉。裸寫並不會贏。

## 深度研究外包給便宜模型

成本結構的回報是把活分流給便宜模型，而非在貴模型上硬省 token。我現在把大量深度研究外包給 [MiMo](https://mimo.mi.com/)（小米的 API 服務）——便宜非常多，深度研究這條線的實際體感跟 Opus 幾乎沒差、workflow 執行也穩。

一次深度研究 workflow 用 Claude Max 20x 訂閱跑會吃掉可觀比例的 5 小時額度；同一份研究外包給 MiMo，成本幾乎可以忽略——等於把訂閱的算力從「跑深度研究」釋放出來，留給貴模型該做的事。

這是同一個方向：把包月額度花在其他 vendor 才撐得久。

## 有條件的韌性

換 vendor 換到的是有條件的韌性：額度用完有備用，但備用自己也有破口。CN 模型的審查加靜默降級，就是這個韌性的真實成本：備用方案踩雷時那個沒料到的連鎖降級。
