---
title: CC 接第三方模型兩個月，坑多到自己畫地圖
description: 把 Claude Code 接去 DeepSeek / GLM / Kimi / Qwen 的三條路徑與共同坑地圖，從 WebSearch 偽造到 prompt cache 失效，兩個月實測的真實代價。
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: /Users/linhancheng/Desktop/projects/gggodlin-blog/posts/cc-vendor-swap-MATERIAL.md
---

最近兩個月都在搞一件事：把 Claude Code（以下簡稱 CC）接到非 Anthropic 的模型上跑。動機很實際，Anthropic 訂閱貴、5 小時 quota 卡很兇，而中國那批模型（[DeepSeek](https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code) / [z.ai 的 GLM](https://docs.z.ai/scenario-example/develop-tools/claude) / [Kimi](https://platform.kimi.ai/docs/guide/agent-support) / [Qwen](https://www.alibabacloud.com/help/en/model-studio/claude-code)）官方都開了 Anthropic-native endpoint，看起來換個 base URL 就能跑。

三條路徑很快就盤出來了。Path 0 直接打 vendor-native endpoint（最乾淨）；Path 1 sidecar 用 `claude -p` headless 包一層 wrapper；Path 2 走中介層 router 像 [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router)（CCR）或 [BerriAI/litellm](https://github.com/BerriAI/litellm)。我自己寫了 [GGGODLIN/cc-vendor-bridge](https://github.com/GGGODLIN/cc-vendor-bridge) 把三條路徑都讓 CC 跑過一輪。三條路徑各自會踩進什麼坑，下面逐項講。

## WebSearch 的四種結局

CC 的 server-side WebSearch tool 在第三方 endpoint 上死法很有創意。GLM 在 subagent 動態載入 tool 時直接回 400 [1210]；MiMo 和 Kimi 是 schema 拒絕；最離譜的是某帳號池型第三方服務，回 200 OK 但內容是模型自己編的，假 URL、假日期，還模仿 Anthropic 原生的來源引用提示文字，HTTP 層完全正常，只看狀態碼根本察覺不到。這種靜默偽造比 4xx 危險太多，4xx 至少你知道要修。

意外生還的是 DeepSeek。我原本假設「OpenAI-Responses translation proxy 全家都 schema 拒絕」，2026-05-25 自己實測直接打臉：DeepSeek `/anthropic` 原生支援 server-side WebSearch，後端接 [BochaAI/bocha-search-mcp](https://github.com/BochaAI/bocha-search-mcp) 博查真實搜尋引擎，回傳真實 `server_tool_use` block。這條推翻了我自己前一版的判斷。

死法太多，解法就演進了兩代。第一代是 wrapper 加 `--disallowed-tools WebSearch`，把 agent 引導到 chrome SERP 退路，缺點是慢、context 重、還燒廠商配額渲染頁面。第二代（2026-06-22）我改包一個 Exa Search API 的 curl wrapper，macOS keychain 存 key、URL 去重保排序，重點是不吃廠商配額。選 Exa 是因為免費 20K 次/月，neural 索引對我那 91% 英文加語意長句的搜尋習慣對位。

## zsh 把 model id 當 glob

這個最啼笑皆非。`glm-5.2[1m]` 在 zsh 是字元集 glob pattern，預設 NOMATCH 開啟，unquoted export 直接「no matches found」整個指令炸掉。bash 不踩。fix 就是單引號 quote 加 `setopt local_options no_nomatch`。任何 vendor model id 含 `[` `]` `*` `?` 都會中。

## 錢包兩坑

第一坑：z.ai 計費文件的宣稱跟實測差 5 倍。2026-06-19 校準下來，1 次 CC turn 約等於 5-6 個 z.ai 文件所稱的「prompt」單位，跟官方文件宣稱「1 prompt = 15-20 model invocation」對不上，差 5.6 倍。第二坑：z.ai 訂閱在尖峰時段（UTC+8 14:00–18:00）配額消耗 3 倍，長 workflow 要挑時段跑。兩坑都是廠商文件不會告訴你的事，得自己花錢測出來。

## 效能與容量的隱形縮水

CC 對所有非官方 endpoint 一律當 200K context（`isFirstPartyAnthropicBaseUrl()` 這個 gate），不管真實 context 多大。DeepSeek V4-Pro 真實 1M context，CC 認 200K，AutoCompact 在真實 context 的約 18.7% 處就觸發，根本還沒滿就開始壓。effort 5 檔也被 z.ai endpoint 映射成 2 檔（2026-06-20 實測）。prompt cache 打不中是成本會 ×5-10 的等級，多家廠商都還沒驗證完成，是我目前最大的未驗項目。

## 同一個 vendor，不同路徑不同結局

GLM 同一個 endpoint，main session 啟動就載入的 tool 正常、直接 curl 打 server-side tool 也正常，但 subagent 透過 ToolSearch 動態載入 tool 後 next-turn request 回 400 [1210]。三方對照同一 session 內完成，跟模型版本（4.7/5.2）無關，是 endpoint 對「tool 來源」的驗證邏輯差異。我的 deep-research workflow 在 GLM endpoint 下全滅，最後 fork 一個變體改用 curl 加 server-side tools 才活。

## 換了 vendor 就得自建監控

Anthropic 官方生態「不用想」的部分，換到第三方全變自己的事。配額要自己盯：Anthropic 5h 用一個 monitor、z.ai 5h 加尖峰窗用另一個、帳號池健康度用 pool status endpoint 輪詢（2026-06-20 用 636 個樣本 A/B 驗證 healthPercent 是先行指標）。三個監看器都得自己寫。

## CCR 健康度判錯了，但破口還在

CCR 健康度這條我兩個月前判錯了。原本記「主作者 2026-01-06 後退場、repo 沒動」，2026-07-02 即時查推翻：repo 當天還在 push、v3.0.5、35,511 ★、978 個 open issue。但 repo 活著不代表我引用的破口被修。[CCR #654](https://github.com/musistudio/claude-code-router/issues/654)（tool use）、[#670](https://github.com/musistudio/claude-code-router/issues/670)（subagent 路由）、[#1348](https://github.com/musistudio/claude-code-router/issues/1348)（MCP tool 名稱 64 字元上限）、[#1238](https://github.com/musistudio/claude-code-router/issues/1238)（extended thinking）四個 issue 全部還是 open，最舊的 #670 從 2025-09-19 就沒動過。LiteLLM 那邊相對有進展：[#25321](https://github.com/BerriAI/litellm/issues/25321) tool_use streaming drop 跟 [#26625](https://github.com/BerriAI/litellm/issues/26625) prompt caching 都已經 closed，但 [#26554](https://github.com/BerriAI/litellm/issues/26554) 跟 [#26113](https://github.com/BerriAI/litellm/issues/26113) 還開著。另外 endpoint switcher [farion1231/cc-switch](https://github.com/farion1231/cc-switch) 星數從兩個月前的 57.9k 翻到 112,159 ★，需求熱度量化在這。

## 三層代價分開驗證

跑完這兩個月，最大的收穫是把「換個 base URL 就能跑」這句話拆成三層：協議相容（HTTP 200、格式對上）、功能相容（cache / thinking / tool schema 真的按 Anthropic 語意運作）、生態相容（CC 內建如 ToolSearch deferred loading、subagent 派工、context window 偵測認得這個 endpoint）。三層各自獨立、各自會踩雷、各自需要驗證。

要接第三方模型進 CC 的話，這是我跑過一遍的檢查清單：

- WebSearch 在這個 endpoint 上是 200 OK 還是靜默偽造？驗 tool_result body，不只看狀態碼
- subagent 動態載入 tool 會不會跟 main session 行為不一致？
- prompt cache 真的打中了嗎？成本差 5-10 倍
- CC 認定的 context window 是真實值還是 200K fallback？
- 計費文件的宣稱跟實測差幾倍？尖峰時段配額怎麼算？
- 用 zsh 的話 model id 有沒有被當 glob？
- 那家廠商的 endpoint 對敏感檔案怎麼處理？

最後一條補一句：z.ai endpoint 在 Read 本機圖片時會把檔案上傳到中國區 CDN 節點做 vision 轉檔，這是合理的轉檔路徑、不是惡意外洩，但敏感檔案不要在這類 endpoint 下餵給 agent。官方 Anthropic endpoint 不經此路徑。知情同意而已。
