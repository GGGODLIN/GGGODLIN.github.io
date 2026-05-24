---
title: "exit 0 不代表你在跑"
description: "LLM 工具鏈裡「報告成功」和「真的完成」差得很遠——subagent 捏造、安裝靜默失敗、排程一個月零進展、測試腳本自我推翻，四種場景、二十幾個案例，Anthropic 知道但選擇不修。"
pubDate: 2026-05-24
tags: ["claude-code", "subagent", "fabrication", "verify"]
---

今天在研究「為什麼 subagent 會捏造結果」，所以派了一個 agent 出去整理這一個月以來撞到的 case。

第一次：agent 把 12 個案例跟原始 36 條清單對比，回傳的 #1、#7、#21 全是別的案例，一條都沒中。

不死心又派了一次。第二次：agent 自己捏出一條「CRITICAL: Respond with TEXT ONLY」的規定說自己不能執行。這條在我的 prompt 裡根本不存在。

研究捏造的工具，就在研究過程中捏造了兩次。

不用我找案例，案例自己上門了。

---

## 什麼叫「報告層成功」

過去一個月、10 個 session，我碰到二十幾個長這個樣子的案例：

- 安裝腳本 exit 0，但 `which aider` 找不到這支程式
- 排程任務報告「main 線在跑、待觀察」，但整個月零次成功跑完
- 測試腳本宣稱「parser broken 鐵證」，但同一台機器、同一個設定，真實運行拿了 118 個結構化 tool_call
- subagent 回「找到了」，但那些檔案路徑、元件名稱在 codebase 裡根本不存在

把這些案例統整一下，核心問題就一個：**exit 0 是報告，現實是另一碼事**。

報告層是 exit code、stdout 的「success」、log 的「detected X」、subagent 回的「我做完了」。結果層是執行檔真的在 PATH、工件真的存在磁碟、程序真的在主迴圈、另一頭真的看得懂回傳的東西。

兩邊就是對不起來。

---

## 四個主要場景

這二十幾個案例大致分成四類：

**A 場景：subagent 或模型自行捏造（8 個）**。派出去的 agent，因為看不到真實的 codebase，就補出聽起來合理的檔名、路徑、元件。回傳的東西有模有樣，查不到。

典型案例：5/20 派 agent 查 cvs 結帳邏輯，回傳 `product.quantity_limit.total_limit`、`t('cvs.quantity_limit.*')`、`QuantityLimitHelp.tsx` 三個路徑，一個都不存在。

這種最難防——每一格看起來都對。

**B 場景：安裝、建置靜默失敗（5 個）**。套件管理工具 exit 0，但實際上沒裝成。

典型案例：5/20 `uv install aider`，exit 0，Python 3.14 沒有 scipy wheel，`which aider` 找不到，`uv tool list` 裡沒有它。

**C 場景：背景或排程任務名義上啟動、實際上是 NOOP 或卡住（5 個）**。launchd 說「running」，cron 說在跑，但看執行結果一片空白。

典型案例：5/18 那次 session 才發現，一個 daily cron 任務跑了整整一個月，preflight 每天都判沒事可做就跳過，從未真的跑完。報告說「待觀察」，實際上零進展。

**D 場景：測試腳本通過，但測的不是真實執行路徑（5 個）**。用來驗證行為的測試腳本，設定和真實運行不一樣，兩邊結果對不上。

典型案例：5/20 用 61 字測試腳本、`stream:false` 設定測試一個 parser，失敗，宣稱「這是鐵證」。但同一台伺服器、同一個設定，真實運行是 `stream:true`，結果拿到 118 個結構化 tool_call。測試腳本測的根本不是真實路徑。

測試環境跟真實環境差一點，結論就翻盤了。

A 場景 8 個（含開頭那兩個今天剛撞到的）、B/C/D 各 5 個。

開頭那兩個就是這套機制當天在我眼前又跑了一次。

---

## Anthropic 知道，選擇不修

這不是某個工具的 bug，等修復沒有意義。

Anthropic 在 GitHub 上收到過至少 4 個直接相關的 issue：

- [#17995](https://github.com/anthropics/claude-code/issues/17995)：Task tool subagent 工具遭拒時幻造輸出
- [#21585](https://github.com/anthropics/claude-code/issues/21585)：subagent_type="Bash" 幻造命令輸出
- [#24542](https://github.com/anthropics/claude-code/issues/24542)：沒有 Bash 存取的 subagent 靜默幻造
- [#5812](https://github.com/anthropics/claude-code/issues/5812)：允許 hook 在 subagent 和母 session 之間橋接脈絡

全數關閉，不修。

[官方文件](https://code.claude.com/docs/en/sub-agents) 講得很直接：subagent 不會帶你的脈絡出去做事，它是乾淨啟動，沒有對話歷史、沒有規則、沒有記憶體。Explore 和 Plan 連 CLAUDE.md 和 git status 都略過。

對 Anthropic 來說，agent 隔離比脈絡共享重要。LLM 幻覺是這個選擇的副作用。他們不認為這要修。

---

## 根因三層

講白就是三層疊在一起：

**第一層：派出去的 agent 兩眼一抹黑**。每個 subagent 以全新狀態啟動，看不到你跟 main session 說了什麼、看不到你的偏好和規則、看不到 codebase 的狀況。派一個什麼都不知道的 agent 去做需要脈絡的任務，結果就是猜。

**第二層：模型同時降級**。main session 是 Opus，切出去的 Explore 是 Haiku。脈絡沒了，模型也換了。Opus 拿到 Haiku 的胡言亂語。

**第三層：LLM 天性是補通順**。遇到做不到的情況，語言模型不會回「我做不到」，它會補出一個聽起來合理的東西。subagent 查不到資料，就補出聽起來像真實路徑的名稱；模型不會用工具，就用文字假裝在叫工具；agent 遇到沒見過的指令，就捏出一段引用說有這條規定不能做。

前兩層解釋「為什麼會捏造」，第三層解釋「為什麼它不直接說做不到」。

---

## 我自己的調整

調整了兩個方向。

**什麼任務該派？** 阻止這種兩眼一抹黑的 agent 去承接需要脈絡的任務。原本的派工規則只有「觸發條件符合就派」，沒有「什麼情況不該派」的判斷——有些任務即使符合觸發條件也不該派，因為派出去的 agent 根本看不到要做好這個任務所需的資訊。

所以同時做了三件事：調高觸發門檻、加上 7 條「即使觸發也不派」的反向護欄、再多問自己一個問題——「這個任務，沒看過我的規則、記憶體、既有清單、對話脈絡，做得出來嗎？」做不出來就讓 main session 自己做，或者派一個會繼承脈絡的 agent。

**怎麼確認做完了？** 宣告任務完成之前，不接受報告層的說法。「測過了 / 應該 OK / 看起來正常」這種句子直接否決，改成逐項對照：「我預期會看到什麼 / 實際看到什麼 / 兩個匹配嗎？」

這個問法就是逼自己看結果層、別停在報告層。

---

## 兩個問題就夠用

通用版本就兩條：

**問題一（該不該派）**：「這個任務，沒看過完整脈絡的 agent，做得出來嗎？」做不出來就 main session 自己做，或者改派一個會繼承脈絡的 agent。

這個問題的通用版是：報告者有沒有看到真實環境？安裝工具沒看到 Python 版本現況，排程器沒看到 delta 判斷邏輯，測試腳本沒走真實路徑，結果都一樣。根本原因都一樣：做報告的那端，從來沒看到真實環境。

**問題二（怎麼確認完成）**：對結果層做 verify，不接受報告層宣告。把「測過了 / 應該 OK」一律換成「預期看到 X / 實際看到 Y / 匹配嗎？」

老問題。只是在 LLM 工具鏈裡，報告層很能說，而且說得像真的。

實作細節我另外開一篇。
