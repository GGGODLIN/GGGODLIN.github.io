---
title: 我把 Claude Code 接去中國模型，兩個月撞了八個坑
description: 為了省 Claude Max 每個月兩百鎂，我把 CC 接去四家中國模型跑了三條路徑。省流：HTTP 200 跟「真的能跑」差很遠，坑還跨廠商重複出現。
voice: v2-threads-line-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: /Users/linhancheng/Desktop/projects/gggodlin-blog/posts/cc-vendor-swap-MATERIAL.md
---

過去兩個月，為了不再付 Claude Max 每個月兩百鎂，我把 Claude Code 接到 DeepSeek、Kimi、GLM、Qwen 四家中國模型上跑了三條路徑：官方 Anthropic-native endpoint（直接打廠商自己開的相容 URL）、sidecar（用 `claude -p` headless 包一層封裝）、中介層 router（[CCR](https://github.com/musistudio/claude-code-router) 跟 [LiteLLM](https://github.com/BerriAI/litellm) 這類協定翻譯 proxy）。

省流：協議層相容的 200 OK 跟「真的能跑」差很遠。跨廠商重複出現的坑可以收成八條。

## 1. WebSearch 在四家上死成四種樣子

CC 內建的 WebSearch tool 是最容易踩雷的一個。同一個 `web_search_20250305` schema，四家給你四種死法，外加一個意外生還。

- **GLM endpoint 回 400 [1210]**：CC 透過 ToolSearch 動態把 tool schema 載進來的那一輪 request 直接被擋。main session 已經載在 tool list 裡的 baseline tool 完全正常，同一個 session 換 subagent 出場就死。跟 GLM 4.7 還是 5.2 無關，是 endpoint 對「tool 來源」的驗證邏輯差。
- **MiMo、Kimi schema reject**：OpenAI-Responses 翻譯家族直接把 server-side tool schema 整個打掉，CC 送出去的 request 連模型都還沒到就掛在 proxy 層。
- **某帳號池型第三方服務偽造 SERP**：這條最危險。HTTP 200 OK、回完整的 `server_tool_use` 區塊、附引用 URL 跟發佈日期，看起來跟 Anthropic 原生 WebSearch 沒兩樣。我自己測了三個 prompt 全踩雷，模型自己編造搜尋結果，連 URL 都是假的。HTTP 狀態碼完全察覺不到，要打開 tool_result body 一個字一個字看才發現。偽造比 4xx 更危險就是這個意思。
- **DeepSeek 反而原生支援**：這條推翻了我先前的假設。我原本假設「OpenAI-Responses translation proxy family 全部 schema-reject」，2026-05-25 一手實測才發現 DeepSeek 的 `/anthropic` endpoint 真的有 server-side tool，後端接的是 [Bocha 博查](https://github.com/BochaAI/bocha-search-mcp) 真實搜尋引擎，隔天官方文件就更新確認。判斷邏輯要從「proxy 架構相不相容」改成「這家到底有沒有真的把後端接起來」。

## 2. 自己包一層封裝 繞過去

WebSearch 在多廠商上不能信任，解法演進了兩代。

第一代：封裝層加 `--disallowed-tools WebSearch` 把工具直接禁掉，把引導句改指向 chrome SERP fallback。能跑，但很慢、context 很重，還要燒廠商 token 去渲染那一坨網頁。

第二代寫進自家 [cc-vendor-bridge](https://github.com/GGGODLIN/cc-vendor-bridge)（2026-06-22 commit `e7933f1`）：自己包一個 `bin/exa-search.sh` curl 封裝，Exa API、macOS keychain 存 key、URL 去重保排序、輸出成餵給 LLM 的 markdown。快、context 省，最關鍵是不吃廠商配額。選 Exa 是因為免費 20K 次/月，neural 索引對我「91% 英文 + 語意長句」的搜尋習慣對位。DeepSeek 那條線不動，因為它原生 WebSearch 就是 work 的。

## 3. zsh 把 model id 當 glob 炸掉

這個雷低級到笑死。`[1m]` 在 zsh 是字元集 glob pattern，預設 NOMATCH 開啟，所以 unquoted `export ANTHROPIC_MODEL=glm-5.2[1m]` 或 `claude --model glm-5.2[1m]` 直接回「no matches found」整個指令中止。bash 不踩。

修法：單引號 quote 加 `setopt local_options no_nomatch` 防呆。任何 vendor model id 含 `[` `]` `*` `?` 都會中。

## 4. 計費文件要自己校準

z.ai 計費文件聲稱的數字跟實測差 5 倍。2026-06-19 我校準過一次：1 次 CC turn 大概等於 5 到 6 個 z.ai 文件所稱的「prompt」單位，跟官方文件那句「1 prompt = 15-20 model invocation」差 5.6 倍。

加一條：z.ai 訂閱在尖峰時段（UTC+8 14:00 到 18:00）配額消耗 3 倍，長 workflow 要挑時段跑。我後來寫了一個 glm-workflow-monitor skill 在背景輪詢配額，撞到尖峰窗就自動 pause。

## 5. 三個隱形縮水：cache、context、effort

CC 對第三方 endpoint 有三個不明顯的縮水：

- **prompt cache**：多家原廠 endpoint 的 cache 是不是真的生效還在待驗清單上。z.ai 有過一個 90.5% cache hit rate 的正面數據，但那是單一場景；Kimi、GLM、Qwen 都還沒驗完。一旦打不中，成本可以乘 5 到 10 倍。
- **context 被當 200K**：CC 原始碼裡有一個 `isFirstPartyAnthropicBaseUrl()` gate，非官方 endpoint 一律被當 200K context，不管實際多大。DeepSeek V4-Pro 真實是 1M，CC 認 200K，AutoCompact 在真實 context 的 18.7% 處就觸發。workaround 是 `DISABLE_COMPACT=1` 加 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 兩個 env 一起 override，不是官方修復。
- **effort 被壓成兩檔**：z.ai 把 CC 的 effort 5 檔映射成 2 檔（2026-06-20 實測）。你以為自己選了 high，其實只有「高」跟「低」兩格可以選。

## 6. 同一家，main session 活、subagent 死

這條跟第一節的 GLM 400 是同一個根。CC 在 main session 啟動時就把 baseline tool 載進 tool list，但 workflow 派 subagent 出去時，subagent 是透過 ToolSearch 動態載入 tool 才送 request。z.ai endpoint 對「tool 來源」的驗證邏輯跟 main session 不同，所以 subagent 那一輪直接 400 [1210]。

三方對照（同一個 session 內完成）：main session 正常、curl 直打 server-side tool 正常、subagent 動態載入 tool 死。結果是 deep-research workflow 全滅，我得 fork 一個 deep-research-paced-zai 變種才能在 ccp-glm 底下跑。同一家廠商，換一條呼叫路徑，結論可能整個翻案。

## 7. 官方生態的「不用想」全變成自己的事

換廠商之前我以為「就是換個 API key 而已」。換了才知道，官方 Anthropic endpoint 那一層「不用想」的事，在第三方全變成自己的事。

我後來分別寫了三個 monitor skill：Anthropic 5h 額度用 workflow-monitor、z.ai 5h 上限加尖峰窗用 glm-workflow-monitor、帳號池健康度用 pool status endpoint 輪詢（2026-06-20 用 636 個樣本 A/B 驗證 healthPercent 是先行指標）。pool 服務名依先前 review gate 拍板匿名化，這裡只寫概念。

## 8. CCR 健康度判斷我兩個月前錯了一次

2026-05-03 我在 memory 記下「CCR 主 repo 兩個月沒動、主作者 2026-01-06 後退場、issue #1310 問維護狀態作者從未回覆」。2026-07-02 用 gh CLI 重查：repo 當天有 push、版本號升到 3.0.5、35,511 顆星、978 個 open issue。「主作者退場」這個判斷我自己推翻。

但翻歸翻，我引用的那四個 issue：[#654](https://github.com/musistudio/claude-code-router/issues/654) tool use BROKEN、[#670](https://github.com/musistudio/claude-code-router/issues/670) subagent 路由 BROKEN、[#1348](https://github.com/musistudio/claude-code-router/issues/1348) MCP tool 名稱 64 字元 DEGRADED、[#1238](https://github.com/musistudio/claude-code-router/issues/1238) extended thinking DEGRADED，2026-07-02 即時查全部還是 open。其中 #670 從 2025-09-19 之後就沒更新，超過一年沒人動。「repo 活著」跟「這幾個具體破口被修」是兩件事。

順帶一提：[cc-switch](https://github.com/farion1231/cc-switch) 兩個月前我記 57.9k 顆星，2026-07-02 變 112,159，兩個月翻倍。這條需求有多熱，數字會說話。

## 收尾：三層相容透鏡加檢查清單

八個坑收在一起，可以用三層相容透鏡看：協議相容（HTTP 200、格式對得上）不等於功能相容（cache 真的打中、effort 真的對應、WebSearch 真的 work），功能相容也不等於生態相容（CC 內建的 ToolSearch 動態載入、subagent 派工、context window 偵測認不認得這個 endpoint）。三層代價各自獨立，各自需要驗證。endpoint 對照表兩個月還漂了一家（Qwen 路徑被官方標「已過時」），「換 base URL」的 base URL 自己會過期。

換廠商之前，給自己一份檢查清單：

- WebSearch 跑三個 prompt，打開 tool_result body 看，不要只看 HTTP 200
- 派一個 subagent 動態載入 tool，看 endpoint 對動態 schema 的反應
- 用 `DISABLE_COMPACT=1` 加 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 蓋過 200K fallback，看真實 context
- 跑一次 deep-research 或其他長 workflow，看 cache hit rate 跟 token 消耗
- 計費文件自己校準一次，不要相信廠商聲稱的數字
- 兩個月後重查一次 repo 健康度，舊結論會過期

也算是一個老問題了。
