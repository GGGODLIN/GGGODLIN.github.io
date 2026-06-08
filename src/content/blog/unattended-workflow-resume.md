---
title: "讓額度不大的帳號，也能掛機過夜跑完大型研究 workflow"
description: "想讓一個跑上百 agent 的重型研究在我睡覺時自己跑完，連額度不大的帳號也扛得起。難點是它幾十分鐘就燒爆一段每 5 小時的額度，得靠 pause→resume 跨段續跑。而 resume 能不能省 token，卡在一個官方沒明說的前提：workflow 夠不夠確定性。"
pubDate: 2026-06-08
tags: ["claude-code", "workflow", "resume"]
---

# 讓額度不大的帳號，也能掛機過夜跑完大型研究 workflow

我想讓一個會展開成上百個 agent 的重型研究，在我睡覺的時候自己跑完，就算用的是額度不大的帳號也一樣。這是我一開始想搞這套 resume 機制的出發點。

難點在這種 workflow 跑幾十分鐘就把一段「每 5 小時的額度上限」燒爆，接著只能停下來等下一段恢復。它的因果順序是「幾十分鐘燒爆、然後等」，從頭到尾經過的時間拉到數小時甚至跨夜，大半都在等，不是 CPU 一直在跑。想讓它無人值守跑完，就得有個東西看著額度、撞上限自動暫停、等額度恢復自動接著跑，跨好幾段才行。

這其實是上一篇的續集。[第二篇](https://gggodlin.github.io/blog/deep-research-rate-limit/) 處理的是另一種壓力：75 個 agent 同時湧入、撞上伺服器 429，用自建的批次節流版搞定；節流之後，額度這道牆才浮出來。

而整件事成不成立，全卡在一個問題：resume 真的能重用跑過的 agent 嗎？

---

## 官方說的「理所當然」

[Claude Code Workflow 官方文件](https://code.claude.com/docs/en/workflows) 對 resume 的說法是這樣：

> agents that already completed return their cached results, and the rest run live

（[#resume-after-a-pause](https://code.claude.com/docs/en/workflows#resume-after-a-pause)）

讀起來很直觀。跑過的會從快取回來，沒跑完的繼續跑。理所當然，對吧。

官方同一份文件的 [#cost](https://code.claude.com/docs/en/workflows#cost) 段寫：「Runs count toward your plan's usage and rate limits like any other session」、「stop the run … without losing completed work」。官方的賣點是「不丟已完成的工作」，「省 token」那個推斷是讀者腦補的，官方沒這樣說。

---

## 第一次 resume 幾乎全重跑

照這個理所當然的預期實際跑了一次。pause 的時候，100 個 agent 裡已經有 83 個跑完、記錄了下來，想說 resume 大半會直接從快取回來。

結果：replay 只有 6 個（Scope + Search），其餘 94 個幾乎全部重新執行，重燒了 5.5M token，跟從頭跑沒什麼兩樣。

---

## 機制真相

resume 的運作方式是把腳本從頭到尾重新執行一遍，過程中對照一份「進度紀錄」（workflow 把每個跑完的 agent 結果寫到磁碟的檔案，英文叫 journal）：每個 agent 用它的 prompt 字串當鑰匙存快取。命中快取的條件是這個 agent 的 prompt 在兩次執行之間一個字元都不差。第一個 prompt 不一樣的 agent 起，後面全部 cache miss、重新執行。

LLM 自己每次回答不完全一樣沒關係，進度紀錄凍結了上次的輸出、重跑時直接讀。要確定的是「把 agent 串起來的那段膠水程式碼，從相同的輸入每次都產生相同的 prompt」，也就是 workflow 的確定性。

這正是官方「completed / cached」那句話沒說出來的前提。誤判的根源是官方文字給了一個合理但不完整的預期，讀者照字面理解完全沒錯。

---

## 非確定性在哪裡

根因在 Fetch 階段，而且這是官方 `/deep-research` 本來就有的設計，不是我 fork 出來才有的，我用的 paced 版只是直接繼承了它。

官方的 search→fetch 是一條沒有「等結果到齊」關卡的 pipeline：Fetch 在 Search 結果陸續回來時就開始跑，靠一個共用的計數器和一份清單追蹤哪些 URL 已經被選走。問題是 pipeline 的完成順序不固定，五個 Search angle 哪個先回來每次都不一樣。這個共用狀態在不固定的順序下被改寫，選出的 URL 集合和排序每次執行就可能不同，Fetch 的 prompt 跟著變。Fetch 一變，下游抽出來的主張、Verify 的 prompt 全部跟著變。從 Scope + Search 之後，所有 agent 的 prompt 跨次對不上，快取全部 miss。

換句話說，你直接用官方原版 `/deep-research`、跑到一半 pause 再 resume，會踩到一模一樣的事。

---

## 我怎麼修

修法是在 Fetch 前加一道 barrier，也就是一道「等全部 Search 結果到齊」的關卡，收齊之後再以固定順序選 URL（先按 angle 的順序、同一個 angle 內按相關性）。這樣不管 Search 結果誰先誰後回來，選出的 URL 集合和排序每次都一樣，Fetch 的 prompt 就穩定了，下游全部跟著穩定。

代價是 Fetch 要等最慢的那個 Search 完成，失去 pipeline 邊跑邊接的好處。但我這個 paced 版本本來就在分批節流、不差那點時間，這個延遲可以接受。

---

## 怎麼確認 resume 真的重用了

不能靠感覺，要有硬數字。方法是數各段啟動的 transcript 新增了多少 agent-*.jsonl，對照 journal 的 agentCount 增量。從快取 replay 的 agent 不產生新的 jsonl；真正重花 token 重新執行的才會產生。

確定性修後的三段 resume 實測（2026-06-07）：

帳號 A（Team 5x 訂閱）跑第一段，帳號 B（Max 20x 訂閱）接第二、三段。數字攤成一張表，不用心算：

| 段 | 新產生 jsonl | journal 增量 | 重跑浪費 |
|---|---|---|---|
| 第一段 | 52 | +52 | 0 |
| 第二段 | 60 | +54 | 6 |
| 第三段 | 11 | +4 | 7 |
| 合計 | 123 | 110 | 13 |

第二段是關鍵：新跑 60 個 agent，journal 只加 54。前一段那 52 個重量級 agent（Scope / Search / Fetch，包含抓了 27 份完整來源）已經在 journal 裡，這次只從快取 replay，不會再產生新 jsonl，所以不算在這 60 裡、也不再花 token。

有人會問：第二段這 60 個不也很多嗎？這 60 個不是重跑，是第二段本來就輪到要做的新工作，幾乎全是 Verify 驗證。前一段那些重的（帶完整來源的 Scope / Search / Fetch）已經 replay 掉、不用再做了；真正白做的重跑，只有那 6 個邊界 agent。

重跑浪費怎麼算：每段「新產生 jsonl 減 journal 增量」就是那段的邊界重跑，第一段 52−52=0、第二段 60−54=6、第三段 11−4=7，合計 13。這些是 pause 剛好落在 Verify 批次中段、還沒寫進 journal 就被中斷、resume 後重跑的 agent，都很輕。

沒有確定性修的對照：第二段不會只新增 60，而會接近第二段該完成的 106 個，因為已 journal 的前綴之後幾乎全部重跑。

---

## token 效益

確定性修後，pause→resume 全流程合計 0.96M token，大比例是便宜的快取讀取。沒修前同等工作燒了 5.5M，這次降了 83%。完整一次性執行的原始吞吐是 63M（其中 60% 是快取讀取），輸出 token 265K。

---

## 為什麼這才是重點

省 token 只是副產物，主線是：低額度帳號也能在無人值守下跑完重型 workflow。

官方其實有手動的 pause/resume：在 `/workflows` 進度視圖選中那個 run，按 `p` 就能暫停或繼續。問題是這要人在電腦前盯著、自己按。我要的是跨好幾段額度、人去睡覺它自己跑完，手動按鍵做不到，才自建一套自動的。

自建的 workflow-monitor 掛一個 watch 監控額度，接近上限就觸發 TaskStop 暫停（門檻設在 85% 不是 100%，留緩衝給延遲和快取更新），等下一段「每 5 小時的額度上限」恢復後自動喚醒 resume。額度是滾動恢復的，不是固定時間重置；有一次 pause 剛好卡在快重置的時間點，等大概 3 分鐘整段額度就歸零、自動接著跑。整個迴圈不需要人在旁邊。

確定性是這條路成立的前提。照機制推，若 resume 不確定性、每次喚醒幾乎全重跑，很可能跨了好幾段額度還卡在原地，同時把 7 天週額度一直燒在重跑上。這個推論我沒真遇過，但機制是這樣走的，官方 #cost 段也寫明重跑吃額度。修了確定性，低額度帳號才扛得起這種規模的研究。

附帶一個個人小妙招：不想等額度自然恢復，pause 後用 /login 切到一個用量還很低的帳號，watch 讀到它還有額度就自動 resume 繼續跑，費用計到新帳號。

---

## resume 不傳 args 會毀掉快取

有一個坑要特別記一下：resume 一樣是把腳本由上到下重跑。若腳本開頭要讀 args（例如研究題目）但 resume 時沒傳進去，腳本會在開頭的檢查處直接結束，這次「完成」會用「0 個 agent」覆寫掉那份進度紀錄，整個快取前綴就消失了。

解法：pause 的時候先從進度紀錄裡撈出原始 args 存起來，resume 時原封不動傳回去。

---

## 回到出發點

一開始我想要的很簡單：讓重型研究在我睡覺的時候自己跑完。

現在這件事成了，而且不需要一個額度很大的帳號。關鍵不是什麼取巧的招，是把 Fetch 那段不確定性修掉，讓 resume 真的能重用跑過的 agent。有了這個，額度小的帳號也扛得起以前只能看著它撞牆的研究規模：掛著、人去睡覺，隔天就跑完了。
