---
title: 埋了 8 個 AI codebase 搜尋工具，前 7 個的採用率幾乎全是 0
description: 兩個月在工作 repo 連續裝了 7 個程式碼搜尋 MCP 工具，agent 一個都不用。一度以為是工具爛，後來才發現根本問題不在工具——採用率才是 agent 工具的真跑分。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫）
source: semble-adoption-MATERIAL.md
---

這幾個月在某電商團隊的工作 repo 埋了一串 AI codebase 搜尋工具，一個一個裝、一個一個測，然後幾乎一個都沒被用到。

一開始我以為是工具爛。後來才發現，是我搞錯問題了。

---

先省流把七個前作交代一下。

**claude-context**（`zilliztech/claude-context`，★11,640，Zilliz 向量搜尋）：拿 1206 個 session 的 jsonl 全量統計，`search_code` 共被呼叫 23 次，23/23 全回「No results found」，命中率 0%。後來又試了 12 次重試、10 次退回 Grep。索引本身是完整的，問題不在這。

**context-mode**（`mksglu/context-mode`，★16,011，FTS5/BM25 全文搜尋）：裝了 5 天、132 個 session，真實 tool_use 採用 0 次。附帶事故是跑出 18 個孤兒行程，兩對佔掉 98%/99% CPU，整機衝到 ~290%，移掉之後 load avg 1m 從 10.29 掉回 4.81。

**codegraph**（`colbymchenry/codegraph`，★33,927，AST 語法樹圖譜）：裸測 3 個 session 共 0/64，加了引導提示之後最佳場景拉到 8/55（~14%），ClojureScript 的場景還是 0/16。README 宣稱省 92% tool call，這個數字來自 graph 遍歷功能，而 graph 遍歷的被選用率是 0，所以等於完全沒有。

後面四個（**code-review-graph** `tirth8205/code-review-graph`，★17,707；**repomix** `yamadashy/repomix`，★25,756；**codebase-memory-mcp** `DeusData/codebase-memory-mcp`，★2,811；**repowise** `repowise-dev/repowise`，★2,100）在評估階段就否決了，沒有進到正式 trial——前三個是基於三戰三敗的結論直接放棄，repowise 裝起來測了三個 repo，decisions 全數為 0。

七個工具，採用率從 0% 到最高 14%，高星數也沒幫上什麼忙。

---

真正的原因是 agent 本身對陌生 MCP 工具天生保守。

Claude 看到工具清單，也不會主動拿起來用——呼叫不熟的工具有失敗成本（幻覺參數、卡住、亂碼輸出、白燒 context），反而是退回 grep + Read + Bash 安全很多。這是結構性瓶頸，不是個案。codegraph 加了引導提示之後天花板還是 14%，說明就算換成理論上更適合的 AST 範式、加了引導，這個瓶頸也還在。

換句話說：**工具的「能力」和「會不會被採用」是兩件事。**

這個區分在現在的跑分生態裡幾乎完全缺席。主流兩類評測——code retrieval（CodeSearchNet / CoIR）比 recall / MRR / NDCG、agent tool-use（BFCL / τ-bench）比呼叫正確率 / pass^k——都不把「可選工具的主動採用率」當被評測的維度。連 2026-05 arXiv 那篇「Is Grep All You Need?」也是在比 grep vs 向量檢索的檢索品質，不是在量 agent 會不會自己選工具。

semble 自己的 Show HN 標語是「比 grep 省 98% token」，工具也在用 token 數字行銷。採用率這個維度，主流跑分基本上都沒在量。

所以裝進去之後 agent 幾乎都不用、永遠退回 grep 這件事，並不是奇怪的個案——它是公認現象，ast-grep 維護者和 HN 社群裡都有記錄，根因是訓練熟悉度加上缺乏明確指令。

採用率才是 agent 工具的真跑分。

---

第八個工具是 **semble**（`MinishLab/semble`，★4,566，MIT，Python）。

semble 是七個前作之後第一個被自然採用的。全期 33 次 MCP 呼叫（32 次 `search` + 1 次 `find_related`）、8 個 session；排掉 A/B 控制組和 resume session，自然工作期（5/22–5/28）25 次呼叫 / 6 個 session，6 個 session 裡有 2 個是首選（first-move）直接拿 semble，沒有 session 完全略過它。餵進了一個合併進主線的 PR，處理的是某個跨前後端的篩選 bug。

突破靠的不是比前七個更強的演算法，是兩個成分：

一是工具效能夠輕。semble 用 model2vec 靜態嵌入（純 CPU 就能跑、不用養服務）+ BM25 fusion + ranking boosting，檢索品質到了某個夠用的門檻。

二是一句明確指令。寫進工作 repo 的本機指令檔，讓 Claude 知道應該優先用 semble 取代 grep。這才是採用的真正槓桿，不是換演算法。

三招全開的設計裡還有 subagent 那條路，實測是 0 次派工，已經砍掉了。原因很直接：subagent 和選 MCP 工具走同一個決策機制，Claude 對不熟的 subagent 更保守，加上派工是不可回收的 context 交接，門檻反而更高。subagent 不解採用問題。

---

誠實說一下 token 這件事。

semble dashboard 自報省了 96% token（對整檔讀進來的樂觀比較），約 1.4M 的省量。早期 A/B 實測是 $4.06 vs $5.93，換算下來大概 32%。兩個數字口徑不同，前者是自報最佳情境，後者是實測；96% 是行銷數字，32% 才是更接近真實的數字。另外 semble Show HN 講的 98%（對 grep 比）是第三個口徑，三個不要混。

真正的價值其實不在省 token——是多語言（polyglot）概念橋接這件事。

某電商團隊的工作 repo 是 ClojureScript 後端 + TypeScript 前端，兩個語言共存。一句自然語言概念查詢，semble 能一次撈到跨語言兩端相關的檔案——grep 要先知道確切的 symbol 名，還要分語言搜。

實戰案例：某個跨前後端的篩選 bug，semble 命中了前端查詢檔和後端核心檔，一次把兩端都找到，整個 semble → Read → 上線的鏈是真的跑通的，不是玩具用法。還有一個金流重試任務，literal 搜尋找不到（檔名裡沒有 "retry" 這個字），semble 靠語意命中，grep 抓不到的。中英混查也可以用（「上一頁 返回 覆蓋」加 popstate / pushState），對多語言 codebase 很實用。

`find_related` 只被呼叫了 1/33 次，graph / relation 功能的採用率基本上是 0，跟 codegraph 的 graph 遍歷完全沒被選到是同一個模式。工具設計越複雜，agent 越不碰。

---

評估這類工具，我後來學到要把三個軸分開：

**採用軸**：agent 會不會自發選這個工具。槓桿是 `CLAUDE.md` / `AGENTS.md` 裡的明確指令，「優先用 X 取代 grep」這種。

**脈絡效率軸**：搜尋的中間結果會不會污染主 context。槓桿是 subagent 包裝，讓中間結果留在 subagent 的 context 裡，主 session 只拿摘要。

**工具效能軸**：檢索品質 / 速度 / 索引成本。槓桿是工具本身的設計。

這三個軸獨立，不能互換。最常踩的坑是「提供了 subagent path 就解了採用問題」——不行，subagent 和採用是兩個軸，subagent 不解採用，semble 的 subagent leg 0 次派工已經實證這件事。

---

然後是自我打臉一下。

semble trial v0 的設計，我的基準組（baseline）只開 MCP 頂層工具——等於是在測「有工具但沒指令、會不會被採用」。這個假設在三戰三敗之後已經有答案了（不會），用這個當基準等於沒測任何東西，被使用者戳破之後才修成三招全開，正式測「指令」這個採用槓桿。

連設計實驗的人都會掉進「能力 ≠ 採用」這個坑，設計基準組的時候自己就搞混了三個軸。這件事還蠻常見的，不是只有我🤣

---

八個工具跑一輪下來，最後留下的重點是：

高星數是傳播訊號，不是採用訊號。codegraph 從我記憶裡的約 1,100 星暴漲到 33,927，這個漲法更坐實「高星 ≠ 採用」。README 的 recall / NDCG / 省 token 數字別當成「會被用到」的保證。採用率才是真的要量的那個維度，也幾乎是主流跑分都沒在量的那個維度。

破關靠的是兩個東西：夠輕的工具（檢索品質過門檻）+ 一句明確指令（採用槓桿）。演算法不是決定因素。

供大家參考。
