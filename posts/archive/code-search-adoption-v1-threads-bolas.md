---
title: "8 個程式碼搜尋工具埋進 codebase，agent 幾乎都不用——採用率才是真跑分"
description: "7 個前作全踩坑、第 8 個 semble 才破關。工具沒爛，卡在 agent 對不熟的 MCP 工具天生保守——能力跑分量不到這件事。"
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫）
source: semble-adoption-MATERIAL.md
---

兩個月，某電商團隊的工作 repo，一連串程式碼搜尋 MCP 工具一個接一個埋進去。前 7 個採用率幾乎全 0。第一直覺是工具爛。

後來才發現根本搞錯問題了。

---

## 三戰三敗，裸測採用率 0%

先講慘況。

**claude-context**（`zilliztech/claude-context`，★11,640）：semantic embedding + Zilliz 向量搜尋，聽起來很強。實際跑 1,206 個 session，`search_code` 呼叫 23 次，23/23 全回「No results found」，命中率 0%。索引沒問題（489 個檔 / 5,566 個 chunk 全部建好），就是查不到東西，後來直接清掉。

**context-mode**（`mksglu/context-mode`，★16,011）：子程序沙盒 + FTS5/BM25 全文檢索 + 輸出壓縮。5 天 132 個 session，真實工具採用 0 次。附帶事故——留下 18 個孤兒行程（9 對），2 對跑到 CPU 98%/99% spin loop，整機 ~290% CPU、耗電 1.27%/min。移除後整機 load avg 1m 從 10.29 降到 4.81。工具沒裝上，還多了個除錯副本🤣

**codegraph**（`colbymchenry/codegraph`，★33,927）：AST 語法樹圖譜，tree-sitter 解析 → SQLite + FTS5 → 確定性圖遍歷。裸測 0/64（3 個 session）。加了引導提示後，最佳場景約 8/55（14%），ClojureScript 那邊 0/16。README 宣稱省 92% tool call——那個數字全來自 graph 遍歷，而 graph 遍歷被選用 0 次。能力指標跟實際採用完全脫鉤。

後 4 個（`tirth8205/code-review-graph` ★17,707、`yamadashy/repomix` ★25,756、`DeusData/codebase-memory-mcp` ★2,811、`repowise-dev/repowise` ★2,100）評估後直接否決，沒啟 trial——基於前三個的結論，沒有理由認為換個演算法範式就會不同。

---

## 瓶頸在採用，不在工具

原本以為是工具不行，測了才知道問題在別的地方。

Claude 對不熟的 MCP 工具預設保守。看到工具清單，也不會主動拿起來用，永遠退回 grep + Read + Bash——因為對已知工具的失敗成本低（至少不會因為參數幻覺或奇怪輸出浪費預算）。

三戰三敗（0% / 0% / ~14% 天花板）在不同 repo、不同技術範式（向量搜尋 / FTS5 / AST 圖）、不同引導強度下重複同樣的模式，這是結構性的。codegraph 裝了 7 個小時當天就拔掉，星數還從 ~1,100 暴漲到現在 33,927——高星數只是傳播訊號，跟採用率無關。

「agent 對不熟的 MCP 工具退回 grep」不是我一個人的觀察。ast-grep 維護者、HN 上的討論、arXiv 2605.15184「Is Grep All You Need?」都記錄了同樣的現象，根因 = 訓練熟悉度不夠 + 沒有明確指令。

---

## 採用率才是 agent 工具的真跑分

主流兩類評測：code retrieval benchmark（CodeSearchNet / CoIR）比 recall、MRR、NDCG；agent tool-use benchmark（BFCL / τ-bench）比 function call 正確率、pass^k。連 2026-05 的 arXiv「Is Grep All You Need?」也是比 grep 和向量搜尋的檢索品質——這些主流跑分都不把「agent 會不會主動拿起一個可選工具」當被評測的維度。

semble 的 Show HN 標語寫「比 grep 省 98% token」。codegraph README 寫「省 92% tool call」。codebase-memory-mcp arXiv 預印本自稱 31 個 repo 83% 答對率。這些數字都很亮眼，然後採用率 0%。

工具的「能力」跟「會不會被 agent 採用」是兩件事。README 能力跑分量不到這個。

---

## 第 8 個，semble 怎麼破關的

semble（`MinishLab/semble`，★4,566，MIT，Python）是這條失敗脊裡第一個被自然採用的工具。

全期 33 次 MCP 呼叫（32 次 search / 1 次 find_related）、8 個 session；排除 A/B 控制組和 resume session 後，自然工作期 25 次呼叫 / 6 個 session（5/22–5/28）。6 個 session 裡 2 個首選直接拿 semble，沒有一個 session 完全忽略。這是前 7 個工具從來沒出現過的數字。

餵進了一個合併進主線的 PR——一個跨前後端的篩選 bug，semble 找到前端查詢檔和後端核心檔（ClojureScript），直接進 PR，不是玩具用法。

**破關靠兩個成分，演算法強不強不是重點**：

1. **工具效能夠好**：model2vec 靜態嵌入 + BM25 fusion + ranking boosting。純 CPU 也快、不用養服務。一句自然語言概念查詢，能一次撈到 ClojureScript 後端和 TypeScript 前端兩端——grep 要先知道確切 symbol 名，且要分語言搜。polyglot 的跨語言概念橋接，是這裡真正補不上的缺口。

2. **一句明確指令**：寫進該 repo 本機指令檔（CC 原生 load 路徑，附加在 CLAUDE.md 之後）。這才是採用的真槓桿。沒有這句，semble 就是前 7 個的結局。

三招全開（MCP + 指令 + subagent）的設計裡，subagent leg 總共 0 次派工，已砍。這也回答了一個常見的直覺錯誤——subagent 不解採用。它和選 MCP 工具走同一個決策機制（看 description 判斷要不要 invoke），對不熟的 subagent 還更保守，門檻反而更高。

---

## 誠實看省 token 的數字

dashboard 自報省 96% token（對「整檔直接 read 進來」的樂觀比較），累計約省 1.4M。

早期 A/B 實測的真實數字是 ~32%（$4.06 vs $5.93）。

兩個值的口徑根本不同，不要混。semble 對外 Show HN 標語「比 grep 省 98% token」是第三個口徑（對 grep 比）。三個數字都是真的，但來源不同。

實測 32% 是真實數字，但更坦白說——省 token 是其次，真價值在多語言（polyglot）的概念橋接。grep 補不上跨語言的語意查詢，這個才是它的位置。

---

## 三軸要分開評，我自己也踩坑了

評估這類工具要把三件事分開：

- **採用軸**（agent 會不會自發選用）：槓桿是 `CLAUDE.md` / `AGENTS.md` 裡的明確指令，沒有指令這軸永遠是 0。
- **脈絡效率軸**（搜尋過程會不會污染主 context）：槓桿是 subagent 包裝，中間結果留在 subagent 的 context，主 session 只拿摘要。
- **工具效能軸**（檢索品質 / 速度 / 索引成本）：槓桿是工具本身的演算法設計。

小丑竟是我自己。semble trial v0 設計時，我自己也犯了三軸混淆：基準組（baseline）只開 MCP 頂層工具，等於根本沒測「採用率」這個假設（前三戰三敗已驗過 0%），測了個假問題。被使用者戳破後才改成「三招全開」，去測指令這個採用槓桿。

連設計實驗的人都會掉進「能力 ≠ 採用」的盲點。「semble 提供 subagent path 所以解了採用問題」是三軸混淆的典型錯誤——subagent 不解採用這軸，那條路自然 0 派工。

---

看 README 跑分（recall / NDCG / 省 token）別當成「裝了就會被用」的保證。這條失敗脊花了兩個月、7 個工具、採用率幾乎全 0 才說清楚這件事。
