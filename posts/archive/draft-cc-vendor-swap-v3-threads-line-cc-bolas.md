---
title: Claude Code 換第三方模型兩個月，坑多到要列清單
description: 把 CC 接到 DeepSeek、Kimi、GLM、Qwen 加第三方中轉站的踩坑清單：WebSearch 四種死法、計費校準、context 隱形縮水、同 endpoint 三條呼叫路徑結論完全相反、中介層破口跟 repo 活躍不同步。
voice: v3-threads-line-cc-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: /Users/linhancheng/Desktop/projects/gggodlin-blog/posts/cc-vendor-swap-MATERIAL.md
---

前兩個月開始把 Claude Code 從官方 endpoint（對話送出的伺服器位址）陸續換到 DeepSeek、Kimi、GLM、Qwen，順便測了 [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router) 跟 [BerriAI/litellm](https://github.com/BerriAI/litellm) 兩個中介層。本來想保留 CC 生態（skill、MCP 外部工具接入口、hook 事件腳本、subagent 從主對話派出去的子代理）的同時省訂閱費，結果坑多到最後整理成一張清單。換 base URL 這層大部分時候真的只要改一個環境變數；協議通了之後還有功能層、生態層各一堆代價。下面是整理完的坑群，按共同類型排，不是按 vendor。

## WebSearch 死了四種，自己包了一個

WebSearch 是這輪踩最兇的工具。四種死法：

1. **GLM 打回 400 [1210]**：z.ai 的 GLM endpoint 對 WebSearch tool 直接回 HTTP 400，server 端格式驗證不過。
2. **MiMo、Kimi 給 schema reject**：model 根本不認 tool schema（資料格式定義），整個 tool call 被打回。
3. **第三方中轉站偽造 SERP**：這個最危險。某第三方中轉站宣稱修好了 WebSearch，實際上是模型自己編造搜尋結果，URL、日期、引用全是假的，HTTP 層完全正常回 200 OK。還模仿 Anthropic 官方 WebSearch 的「REMINDER: You MUST include the sources...」提示文字，光看 HTTP 層抓不到，要驗 tool_result body 內容。實測 3/3 prompt 全踩雷。
4. **DeepSeek 反而原生支援**：DeepSeek `/anthropic` endpoint 原生支援伺服器端 WebSearch，後端接 [BochaAI/bocha-search-mcp](https://github.com/BochaAI/bocha-search-mcp) 真實搜尋引擎，回傳真實 server_tool_use block。把 OpenAI 格式轉譯成 Anthropic 格式的代理到底支不支援 WebSearch，要看個別廠商有沒有真的接後端，不能一刀切。

現在做法是 wrapper 加 `--disallowed-tools WebSearch` 禁掉內建 WebSearch，改用自包進 [cc-vendor-bridge](https://github.com/GGGODLIN/cc-vendor-bridge) 的 [Exa Search API](https://exa.ai/)：本地 curl 打過去、30 秒上限、URL 去重保排序、輸出 markdown，重點是不吃 vendor 配額（不經過模型）。選 Exa 是免費 20K 次/月加語意索引，對得上「91% 英文 + 語意長句」的搜尋習慣。舊版 chrome SERP fallback（claude-in-chrome 開瀏覽器抓 Google）只當備援，慢、吃 context（對話能記得的長度）、也吃 vendor 配額。

## 跟協議無關、但換了第三方才浮上來的坑

這段是 vendor 協議之外、換了第三方模型才會踩到的隱形縮水：

- **zsh 把 model id 當 glob**：GLM 模型 id 寫 `glm-5.2[1m]`，zsh 預設 NOMATCH 開啟，unquoted export 直接噴「no matches found」整個指令中止；bash 不踩。fix 是單引號 quote 加 `setopt local_options no_nomatch`。任何 vendor model id 含 `[` `]` `*` `?` 都中。
- **z.ai 計費文件跟實測對不上**：官方文件寫「1 prompt = 15-20 model invocation」，但實際跑一個 CC turn 大約吃 5 到 6 個它所稱的 prompt 單位，兩者差約 5 倍，要自己校準才知道真實成本。
- **z.ai 尖峰時段配額燒 3 倍**：UTC+8 14:00 到 18:00 是中國上班尖峰，訂閱方案配額消耗 3 倍。長 workflow（CC 的多 agent 自動化編排）要挑離峰跑，不然一輪把一天額度燒光。
- **CC 對第三方 endpoint 一律當 200K context**：CC 內建 `isFirstPartyAnthropicBaseUrl()` gate，非官方 endpoint 一律當 200K context（對話能記得的長度上限）。DeepSeek V4-Pro 真實 1M context，CC 誤判 200K，AutoCompact（自動壓縮舊對話）在真實 context 的約 18.7% 處就觸發，根本沒到頂就開始壓。workaround 是 `DISABLE_COMPACT=1` 加 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` paired override。
- **effort 檔位被映射成 2 檔**：z.ai 把 CC 的 effort（思考深度檔位，5 檔 min/low/medium/high/xhigh）映射成 2 檔，5 檔差異被壓平。

prompt cache（提示詞快取）打不中也是普遍問題。其他家還沒驗；z.ai 有 90.5% cache hit rate 的正面數據但屬單一場景，不外推。沒打中 prompt cache 的話，成本可能按完整 prompt 重算（z.ai 單一場景實測差距可達 ×5 到 ×10）。

## 同一個 endpoint，三條呼叫路徑結論完全相反

這段是這輪最重要的反直覺發現。z.ai 同一個 endpoint，三條呼叫路徑結論可以完全相反：

- **main session 啟動時載入的工具正常**：CC 啟動就在 tool list 的工具，z.ai endpoint 接受。直接打 server-side tool、curl 直打也都正常。
- **subagent 透過 ToolSearch 動態載入 tool 撞 400 [1210]**：subagent（CC 從主對話派出去的子代理）跑的時候用 ToolSearch（CC 按需載入工具的機制）動態載入 tool，下一個 turn 的 request 就被 z.ai 打回 400 [1210]。跟 model 版本（4.7/5.2）無關，是 endpoint 對「tool 來源」的驗證邏輯差異。
- **workflow 一次派多個 agent，整批全滅**：CC 的 Workflow tool 派多個 agent、每個都走 ToolSearch 動態載入。在 z.ai (GLM) 之下整批 400 [1210]，跑深度研究任務的 workflow 因此全滅，要 fork 出禁用動態載入的變體才能跑完。

同 vendor 同 endpoint，三條路徑結論完全相反。只驗 main session 就放行會踩雷，測試要覆蓋到實際會用的呼叫模式。

## 換了 vendor，監控全變自己的事

官方 Anthropic endpoint 的 5h 額度（每 5 小時滾動的用量上限）、過熱降級、版本控管都是 Anthropic 的事。換到第三方，這些全變自己的：要自己寫 watcher 監控 z.ai 5h 上限加中國尖峰窗的配額消耗，要自己輪詢第三方中轉站的 status endpoint 看健康度，健康度掉下來要主動暫停 workflow。換了 vendor 之後沒人幫你看額度。

## 中介層 repo 活著，不代表破口被修了

[musistudio/claude-code-router](https://github.com/musistudio/claude-code-router)（CCR）現在是 v3.0.5、repo 7 月還在推 commit，看起來活躍。但下面四個破口 issue 全部還是 open：[#654](https://github.com/musistudio/claude-code-router/issues/654) tool use、[#670](https://github.com/musistudio/claude-code-router/issues/670) subagent 路由（超過一年沒動）、[#1348](https://github.com/musistudio/claude-code-router/issues/1348) MCP tool 名稱 64 字元限制、[#1238](https://github.com/musistudio/claude-code-router/issues/1238) extended thinking；[PR #1376](https://github.com/musistudio/claude-code-router/pull/1376) DeepSeek reasoning_content 保留仍未 merge。

[BerriAI/litellm](https://github.com/BerriAI/litellm) 這邊 [#25321](https://github.com/BerriAI/litellm/issues/25321) tool use streaming 跟 [#26625](https://github.com/BerriAI/litellm/issues/26625) prompt caching 都已關閉，[#26554](https://github.com/BerriAI/litellm/issues/26554) Bedrock system prompt 400 跟 [#26113](https://github.com/BerriAI/litellm/issues/26113) Tool Search defer_loading stripped 還 open。

判斷中介層健康度不能只看 repo 活躍，要看你會踩到的那幾個破口 issue 還在不在；健康度判斷本身有時效，引用的 issue 要自己重查。endpoint 對照表也會漂，Qwen 舊路徑被官方標「已過時」、新版換了 URL。[farion1231/cc-switch](https://github.com/farion1231/cc-switch)（endpoint 切換器）星數已經破 112K，這條需求還在上升。

## 換之前，先過這三層檢查

vendor swap 的代價分三層，每層各自驗證，不能驗完一層就假設全部沒事：

1. **協議層**：HTTP 200、schema 對上、model id 不被 shell 解析。最基本，通常一行環境變數就過。
2. **功能層**：prompt cache 真的打中？effort 檔位真的對應？WebSearch / ToolSearch / 動態載入 tool 在實際會用的呼叫模式下能不能跑？這層要 main session 加 subagent 加 workflow 三條都跑一次。
3. **生態層**：AutoCompact 在哪裡觸發？CC 認的 context 上限是不是廠商實際給的？要不要自架配額跟健康度監控？這層最容易被忽略，出事也最痛。

CC 當前 2.1.198，這些數字都還會變，自己跑一次 live 比抄部落格實在。
