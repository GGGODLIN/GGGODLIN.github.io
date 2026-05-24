---
title: 研究 subagent 為什麼會捏造，研究工具當場捏造了兩次
description: 在 LLM 工具鏈裡，「報告說完成了」跟「結果真的完成」之間有一道系統性落差，一個月橫跨約 30 個案例、四種機制，Anthropic 知道但不修。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/exit-0-illusion-MATERIAL.md
---

最近在整理一個月以來撞到的奇怪問題，派了一個代理去幫我研究「為什麼 subagent 會捏造」。

研究工具當場捏造了兩次。

第一次：我叫它從 36 條清單裡抽 12 個對應案例，它回傳的原 #1、#7、#21 全是別的案例的內容，整包對應關係全錯位。第二次：再派一次，它自己編了一條「CRITICAL: Respond with TEXT ONLY」，用這個它自己創造的 constraint 拒絕執行任務。這條指令在我的 prompt 裡根本不存在。

我原本以為這是偶發的工具怪癖，後來才發現這只是大問題的最新兩個案例。

---

一個月下來我有了大概 ~30 個類似的案例，跨了 10 個 session。把它們整理分類之後，四個主要的機制浮出來。

**A 子家族：subagent 直接捏造**。最戲劇性的一個是 5/20 的 cvs 案例。那次派出去的代理回報找到了 `product.quantity_limit.total_limit`、`t('cvs.quantity_limit.*')` 跟 `QuantityLimitHelp.tsx`——這三個完全不存在。檔案名、key 路徑、元件，全是它捏的，而且捏得很像那麼回事。

**B 子家族：安裝靜默失敗**。5/20 叫 uv 幫我裝 aider，`uv install aider` 執行完，exit code 0、沒有任何錯誤訊息。但 Python 3.14 沒有 scipy 的 wheel，aider 根本沒裝進去。`which aider` 找不到、`uv tool list` 沒有這個項目。工具說「裝好了」，但裝好了的只是 exit code 0 這個信號，不是可以用的執行檔。

**C 子家族：排程 job 名義上在跑**。5/18 的 medistill 案例是這裡時間跨度最長的：每天的 cron 都有執行、log 都有輸出、preflight 每次都正確回報「沒有要處理的 delta，NOOP」——但「沒有 delta 就 NOOP」是這個流程原本的設計，只要真的有內容要處理的時候它就會 rollback。整整一個月，daily cron 零次成功跑完，零進展，全程安靜。

**D 子家族：探針的測試路徑跟真實路徑不同**。5/20 的案例更離譜：我自己寫了個 61 字的 probe 用 `stream:false` 去測，失敗了，宣稱「鐵證，parser 壞了」。然後發現同一台伺服器、同樣的設定，真實執行環境跑的是 `stream:true` 加上 40K 字的脈絡和 12 個工具，一次拿到 118 個結構化的 tool_call。探針測的不是真實路徑，真實路徑完全沒有問題。

---

這四種機制表面上看起來不一樣，但有個共同的形狀：**報告層說成功，結果層不存在**。

exit code 0、log 印出「done」、subagent 說「我做完了」、排程顯示「running」——這些都是報告層的信號，它們描述的是「這個動作有被執行」，不是「你想要的結果真的在那裡」。

一個月前我以為這是工具的 bug，後來發現 Anthropic 的 GitHub 上有 4 個直接相關的 issue（[#17995](https://github.com/anthropics/claude-code/issues/17995)、[#21585](https://github.com/anthropics/claude-code/issues/21585)、[#24542](https://github.com/anthropics/claude-code/issues/24542)、[#5812](https://github.com/anthropics/claude-code/issues/5812)），全數關閉，不修。[官方文件](https://code.claude.com/docs/en/sub-agents)明白寫著：subagent 以全新脈絡啟動，沒有對話歷史、沒有 CLAUDE.md、沒有記憶體。Anthropic 把這個隔離行為定性為設計選擇，不是 bug。

---

根因有三層。

第一層：**零脈絡工作者**。每個 subagent 啟動時什麼都沒有，看不到你跟主 session 的對話、看不到你的規則檔、看不到你的記憶體。Explore 跟 Plan 這兩個代理還有額外的規格：它們是唯一連 CLAUDE.md 跟 git status 都略過的，也沒有任何前端設定可以改這個行為。

第二層：**模型同時降級**。Anthropic 預設的 Explore 跑的是比較小的那個模型，主 session 同時跑著比較大的那個。派一次 Explore 等於把同一個任務從高階模型切到低階模型，還是帶著零脈絡去做——兩件事同時發生。

第三層：**LLM 的天性是補通順，不是承認做不到**。寫不到的資料它會補一個聽起來合理的；不會用工具的時候它會用文字模擬看起來像在呼叫工具；不認識某個 constraint 的時候它會「引用」這個 constraint 然後說「因為這個 constraint 我不能做」。前兩層解釋「為什麼會捏造」，第三層解釋「為什麼不是回我做不到」。🤣

---

知道根因之後，我自己做了兩個方向的調整。

一個是在**派工側**：把零脈絡工作者擋在需要脈絡的任務前面。原本我的派工判準只有「什麼情況下該派誰」，但沒有「什麼情況下根本不該派」這一側。補上之後，多了幾條「即使命中觸發條件也要自己做」的情況，判準很直接：這個任務，一個沒看過我所有脈絡的工作者，做得出來嗎？做不出來，就換一條繼承完整脈絡的路徑去做，或者主 session 自己處理。

另一個是在**結果確認側**：停止接受報告層的宣告。「測過了」「沒問題」「應該 OK」——這些宣告對應的永遠是報告層，不是結果層。現在的規矩是：逐項列出「我預期會看到 X，實際看到 Y，匹配嗎？」，不對就繼續，不接受「差不多 OK」。

前者擋住捏造的來源，後者確保就算捏造了也能被發現。

---

這兩個判準說起來是工具鏈的實作問題，但換個角度看跟 B/C/D 三個子家族是同一件事：B 是安裝工具說 OK 你沒驗 binary 存不存在；C 是排程說在跑你沒驗它有沒有真的完成一輪；D 是探針說壞了你沒驗它測的是不是真實路徑。

不管哪個機制，報告層和結果層之間的那道縫隙都在，差別只在誰在報告、縫隙多寬。

也算是老問題了，只是在 LLM 工具鏈裡每層都有自己的版本，而且都很安靜。
