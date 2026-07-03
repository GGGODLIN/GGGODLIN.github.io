---
title: 把非 Anthropic 模型接進 Claude Code，代價分成幾層？
description: 「換一個環境變數就能跑」是簡化說法。協議相容、功能相容、生態相容是三件各自需要驗證的事，本文用兩個多月的實測整理出一張代價地圖。
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/cc-vendor-swap-MATERIAL.md
---

# 把非 Anthropic 模型接進 Claude Code，代價分成幾層？

## 起點：不想犧牲既有生態

想把 Claude Code 接到非 Anthropic 的模型上，動機通常很直接：省訂閱費，或是想測試中國模型的實際能力。但多數人真正在意的不只是「模型能不能回話」，而是「換了模型之後，Claude Code 原本的一整套生態——skill、MCP、hook、subagent 派工——還能不能正常運作」。

這篇文章整理的，是作者本人走過三條不同的接入路徑、累積兩個多月的實測紀錄。素材橫跨三個不同層次：協議層的 regression、中介層 router 的結構性破口，以及同一個模型供應商內部不同呼叫路徑的行為不一致。整合起來看，會發現「換 base URL 就能跑」這句常見說法，遠不足以描述真實的代價結構。

## 三條路徑總覽

把非 Anthropic 模型接進 Claude Code，大致有三種做法：

- **Path 0：vendor-native endpoint。** 模型供應商自己提供一個相容 Anthropic API 格式的 endpoint，使用者只需要替換 `ANTHROPIC_BASE_URL` 等環境變數，不需要額外的中介程式。
- **Path 1：sidecar。** 透過 Claude Code 的 headless 模式（`claude -p`）包一層自己的執行流程，繼承 Path 0 的環境變數設定。
- **Path 2：router（中介層）。** 透過像 [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router)（下稱 CCR）或 [BerriAI/litellm](https://github.com/BerriAI/litellm) 這類工具，在 Claude Code 與模型供應商之間做協定翻譯，通常用於串接多家不同協定的模型。

這三條路徑代表由淺入深的整合方式，也對應著由淺入深的代價層次。

## Path 0 看似最乾淨，但這只是表象

2026 年 5 月 3 日的查證顯示，DeepSeek、Kimi、GLM（z.ai）、Qwen 這四家中國模型供應商，全部都官方提供 Anthropic-native endpoint，總共九個官方 endpoint 網址。各家的環境變數設計互不相容：DeepSeek 用八個變數，其中包含一個獨家的 `CLAUDE_CODE_SUBAGENT_MODEL`；Kimi 用三個；GLM 用 OPUS／SONNET／HAIKU 三段式分層對應；Qwen 只用單一的 `ANTHROPIC_MODEL`。這四家官方文件各自可查證，屬於多來源一致的事實。

在協議層面，這確實只是換一個環境變數的事。但這正是問題所在——「協議相容」（HTTP 請求打得通、格式對得上）不等於「功能相容」（cache、thinking、tool schema 是否真的按 Anthropic 的語意在運作），功能相容也不等於「生態相容」（Claude Code 內建的機制，例如 ToolSearch 延遲載入、subagent 派工、context window 偵測，是否真的認得這個 endpoint）。這三層代價彼此獨立，任何一層驗證通過，都不代表另外兩層也沒問題。

## 第一層代價：Claude Code 對 Path 0 有自己的隱藏假設

即使選擇看起來最單純的 Path 0，Claude Code 這個客戶端本身對「第三方 endpoint」也帶著沒有明講的假設，實測中踩到兩個具體案例。

第一個是版本 regression。2026 年 5 月 5 日發布的 Claude Code 2.1.128，對所有非官方（non-first-party）的 `ANTHROPIC_BASE_URL` 強制加上 `[1m]` 這個模型名稱後綴，並且在客戶端直接拒絕請求——伺服器端完全沒收到這個請求。這個問題在兩個獨立的模型供應商（Qwen 與 DeepSeek）上同時出現，屬於多來源一致的證據。所幸這個 regression 只存在一天：隔天（5 月 6 日）發布的 2.1.129 就自動修復了。這個案例本身也提示一件事——面對客戶端的 regression，有時候等一天觀察官方是否修復，會比自己動手修更划算。

第二個是 context window 的偵測邏輯，目前仍未修復。Claude Code 內部有一個 `isFirstPartyAnthropicBaseUrl()` 的判斷（gate），只要偵測到不是官方 endpoint，就一律把 context window 認定為 200K，不論這個模型供應商的實際 context 上限是多少。舉例來說，DeepSeek V4-Pro 的實際 context 是 1M，但 Claude Code 誤判成 200K，導致自動壓縮機制（AutoCompact）在真實 context 用量大約只有 18.7% 的時候就提早觸發。這個案例來自作者自家專案（cc-vendor-bridge）的紀錄，雖然附有 Claude Code 原始碼行號作為依據，但尚未經過第三方獨立覆核，屬於單一來源未驗的等級。目前的因應方式是搭配設定 `DISABLE_COMPACT=1` 與 `CLAUDE_CODE_MAX_CONTEXT_TOKENS` 兩個環境變數，屬於非官方的手動修正，不是官方修復。

## 第二層代價：Path 1 sidecar 有自己的運作限制

Path 1（sidecar）利用 `claude -p` 的 headless 模式繼承 Path 0 的設定，實作上大概五行 wrapper 程式就能完成。但這條路徑本身也有一組運作上的限制，跟模型供應商是誰無關：Bash 執行有 600 秒上限、執行進度是黑盒（看不到中間狀態）、權限模式偏向 YOLO（缺乏細緻控管）、cache 容易 miss。這些是 sidecar 這個做法本身帶來的代價，不是模型端的問題，選擇這條路徑之前需要先確認場景是否能接受這些限制。

## 第三層代價：Path 2 中介層在協定翻譯這件事上有結構性破口

Path 2（CCR / LiteLLM 這類 router）承擔的工作，是把 Anthropic 協定跟 OpenAI-compatible 協定互相翻譯。這件事本身，在 tool use、prompt caching、subagent 路由等多個維度上反覆出現失敗，而且部分問題已經存在超過一年。

下表是 2026 年 4 月做的七維度破口矩陣，並在 2026 年 7 月 2 日重新做了一次即時查證：

| 元件 | 2026-04 判定 | 對應 issue | 2026-07-02 live 狀態 |
|---|---|---|---|
| Tool use（CCR） | 壞掉 | [CCR #654](https://github.com/musistudio/claude-code-router/issues/654) | 仍開啟（自 2026-04-05 無更新） |
| Subagent 路由（CCR） | 壞掉 | [CCR #670](https://github.com/musistudio/claude-code-router/issues/670) | 仍開啟（自 2025-09-19 起超過一年未動） |
| MCP 工具名稱 64 字元限制（CCR） | 品質下降 | [CCR #1348](https://github.com/musistudio/claude-code-router/issues/1348) | 仍開啟（最後更新 2026-04-21） |
| Extended thinking（CCR） | 品質下降 | [CCR #1238](https://github.com/musistudio/claude-code-router/issues/1238) | 仍開啟（最後更新 2026-04-29） |
| DeepSeek reasoning_content 保留（CCR PR） | 待合併 | [CCR PR #1376](https://github.com/musistudio/claude-code-router/pull/1376) | 仍未合併（最後更新 2026-05-01） |
| Tool use streaming 遺失（LiteLLM） | 壞掉 | [LiteLLM #25321](https://github.com/BerriAI/litellm/issues/25321) | 已關閉（2026-05-09） |
| Prompt caching 被剝除（LiteLLM） | 壞掉 | [LiteLLM #26625](https://github.com/BerriAI/litellm/issues/26625) | 已關閉（2026-06-23） |
| Bedrock system prompt 400 錯誤（LiteLLM） | 品質下降 | [LiteLLM #26554](https://github.com/BerriAI/litellm/issues/26554) | 仍開啟（最後更新 2026-04-26） |
| Tool Search 延遲載入被剝除（LiteLLM） | 品質下降 | [LiteLLM #26113](https://github.com/BerriAI/litellm/issues/26113) | 仍開啟（最後更新 2026-04-20） |

從這張表可以看出一個粗略的規律：LiteLLM 這邊，兩個屬於「傳輸層」的 bug（tool use streaming、prompt caching 被剝除）已經修好；但 CCR 這邊，幾個更接近「架構性」的問題（subagent 路由、MCP 工具名稱長度限制、extended thinking）都還沒解決。這暗示中介層目前改善的重點放在傳輸層修補，架構性的翻譯問題可能需要更大幅度的重寫，而不是增量修補能解決的。這一點屬於觀察歸納，本文未進一步驗證修補團隊的實際規劃。

補充一點：CCR 目前支援「per-route 混合路由」，也就是可以依不同任務把請求分配給不同模型。但這部分素材偏薄——只有機制描述，沒有作者自己實際使用的案例或驗證紀錄，這裡誠實標記為未驗證，不展開評論。

## 一個需要重查的判斷：CCR 是不是已經沒人維護

這篇文章寫作過程中，發生了一次值得記錄的自我修正。

作者原本在 2026 年 5 月 3 日的記錄裡判斷：CCR 主 repo 已經兩個月沒有動靜，主要作者在 2026 年 1 月 6 日之後退場，社群裡有 issue（#1310）詢問專案是否還在維護，作者從未回覆。

但這次（2026 年 7 月 2 日）用 GitHub CLI 重新即時查證，這個判斷被推翻了：CCR repo 的 `pushed_at` 時間戳是 2026-07-02T03:46:40Z，也就是查核當天，最近的提交包含版本號提升到 3.0.5、README 整理、路由設定調整。目前這個 repo 有 35,511 顆星、978 個開啟中的 issue，看起來是活躍的。

但這裡有一個容易被忽略的區分：**「repo 活著」跟「上面那張表引用的四個具體破口被修好」是兩件不同的事**。即使 repo 恢復了活躍開發，上表引用的 CCR #654、#670、#1348、#1238 這四個 issue，在 2026-07-02 查核時全部仍是開啟狀態。至於那個詢問維護狀態的 issue（#1310），目前有八則留言，最後更新在 2026-05-09，本文沒有進一步查核維護者後續是否有回應，這是一個明確的缺口。

這個反轉本身有一個更一般的意義：工具的健康度判斷有時效性，「這個 repo 沒人維護了」這類結論需要定期重新查證，不能當成一次寫定就永遠成立的事實。

## 第四層代價：同一個 vendor，不同呼叫路徑，結論可能整個翻案

即使選定 Path 0（vendor-native endpoint），同一個模型供應商在不同的呼叫模式下，行為也不一定一致。這一層代價比前面三層更隱蔽，因為它意味著「測過一種呼叫方式沒問題」不能直接推論到「所有呼叫方式都沒問題」。

第一個案例是一次自我推翻。作者原本假設，凡是走「OpenAI-Responses translation proxy」這種架構的中間層，一律沒辦法正確處理 Anthropic 的 server-side WebSearch 工具（`web_search_20250305` 與 `web_search_20260209`），會被 schema-reject。但 2026 年 5 月 25 日的一手實測，加上隔天（5 月 26 日）官方文件的更新，共同推翻了這個假設：DeepSeek 的 `/anthropic` endpoint 其實原生支援這個工具，後端接的是 [BochaAI/bocha-search-mcp](https://github.com/BochaAI/bocha-search-mcp)（博查）這個真實搜尋引擎，回傳的是真正的 `server_tool_use` 區塊。這件事讓判斷邏輯需要改寫：不是「這種 proxy 架構是否相容某個 schema」的問題，而是「這一家供應商是不是真的把後端接上了」的問題，必須逐一供應商驗證，不能用架構類別一概而論。

第二個案例更直接地指出「同一 vendor、不同呼叫路徑」的落差。z.ai（GLM）的 endpoint，在 subagent 透過 ToolSearch 動態載入某個工具之後，下一輪請求會回傳 400 錯誤（錯誤碼 [1210]）。但如果是主要 session 一開始就在工具清單裡的基礎工具（baseline tool），或是直接用 curl 打伺服器端工具，都能正常運作。這是在同一次 session 內完成的三方對照（workflow subagent 失敗、main session 正常、curl 直打正常），屬於多來源一致的證據。這個差異跟 GLM 模型本身的版本（4.7 或 5.2）無關，是這個 endpoint 對「工具來源」的驗證邏輯本身的差異，不是模型能力的差異。實務上，這意味著要在這條路徑上跑 workflow subagent，需要另外做一個分支變體版本才能繞過這個限制。

這兩個案例合起來說明：測試一個 vendor 的相容性，不能只驗證最簡單的呼叫路徑，必須覆蓋到實際會用到的呼叫模式（主 session、subagent、直接呼叫），因為結論可能因為呼叫路徑不同而完全不一樣。

## z.ai 的兩個補充案例：一個要加重警示，一個是誤判

在整理 z.ai 的行為紀錄時，有兩件事值得分開處理。

第一件事需要明確警示：讀取本機圖片檔案時，z.ai 的 endpoint 會把檔案上傳到中國區節點（CDN 為 cn-wlcb）。這件事本身的性質是「vision API 需要把圖片轉成 URL 才能處理，所以需要一個轉檔上傳的中繼步驟」，不是惡意行為，也不是資料外洩。但無論動機如何，本機檔案確實會經過中國區節點，這是使用者應該知情的事實。建議是：透過這類 endpoint 使用 agent 時，不要餵入敏感檔案。作為對照，官方的 Anthropic endpoint 不會經過這條路徑。這裡刻意不使用「外洩」或「竊取」這類指控性字眼，因為證據只支持「會上傳到中國節點」這個事實陳述，不支持惡意行為的指控。

第二件事是一次誤判的修正記錄：z.ai 的 endpoint 曾經被懷疑「在回應裡注入了配額用量的圖片」，作者事後自行核實，確認這是誤判——那張圖其實是使用者自己貼上的截圖，經過 CDN 轉檔後看起來像是被注入的內容。真正存在的注入，只有工具結果尾端的一段提示文字（大意是「你必須附上來源」），這段文字本身是模仿 Anthropic 原生 WebSearch 工具的行為模式，並非惡意內容。這裡的教訓記錄下來：遇到看起來像異常注入的內容，先確認是不是自己貼上去的東西，不要先入為主當成惡意行為。這屬於單一來源（作者自我核實）的紀錄。

## 一個需要脫敏處理的高風險案例：沉默造假

素材中還有一個風險最高、但證據相對薄弱的案例，屬於「偽造回應比明確的錯誤代碼更危險」這個論點的支撐。為了避免點名特定第三方服務，這裡把它寫成「某帳號池型第三方服務」，不附連結、不描述其服務細節。

這個服務曾經宣稱修好了原本會被 schema-reject 的 WebSearch 工具。但實際測試（三次提示詞全部踩雷）發現，這其實是模型自己編造出來的搜尋結果——包含假的網址、假的日期，而且模仿了 Anthropic 官方的來源引用提示文字。整個過程 HTTP 層完全正常（回傳 200 OK），如果只看傳輸層的狀態碼，完全無法察覺這是編造出來的內容。這件事的教訓是：驗證這類第三方接入是否可靠，必須實際檢查工具回傳結果（tool_result）裡的內容，不能只看 HTTP 狀態碼有沒有回 200。這屬於單一來源、且尚未在多個提示詞情境之外驗證的紀錄，證據強度偏薄，但風險等級足夠高，值得記錄下來。

## 沒驗完的部分：誠實標記的缺口

以下幾點屬於素材裡明確承認的缺口，本文不假裝已經驗證完成：

- **Prompt cache 在 vendor-native endpoint 是否真的生效**，目前是缺漏狀態。多個供應商（Kimi、GLM、Qwen）都還沒驗證完成。z.ai 這一個案例有 90.5% 的 cache 命中率這個正面數字，但這只是單一供應商、單一場景下的觀察，不能推論到其他供應商。
- **Extended thinking 在 vendor-native endpoint 上的 schema 對應**，除了已知 Qwen 限定 Max 系列模型才支援之外，其餘三家的情況目前不明。
- **CCR 的 per-route 混合路由能力**，前面提過，只有機制描述，缺乏實際使用案例。

## 收尾：把驗證拆成分層，而不是驗過一層就假設全部相容

整理這兩個多月的紀錄，可以歸納出幾個帶得走的判斷：

第一，vendor swap 這個決策應該按「協議層、Claude Code 隱藏假設層、sidecar 運作限制層、中介層翻譯層、vendor-specific 工具層」分開驗證，而不是驗證了其中一層就假設其他層也沒問題。這五層代價彼此獨立，前面幾個案例已經證明，任何一層通過測試都不能保證另一層也安全。

第二，工具健康度的判斷有時效性。「這個 repo 已經沒人維護了」這類結論需要定期重新查證——這篇文章寫作過程中，就抓到一個自己兩個月前做的判斷已經過期，而且過期的方向出乎意料（不是變得更差，而是變得更活躍，只是活躍不等於具體問題被解決）。

第三，中介層 router 近期改善的多半是傳輸層的 bug（例如 tool use streaming、prompt caching），但架構性的路由與翻譯問題（subagent 路由、MCP 工具名稱長度限制）仍未解決，這類問題可能需要架構層級的重寫，而不是增量修補能處理。

第四，同一個模型供應商，不同的呼叫路徑（主要 session 對 subagent、一開始就在清單裡的工具對動態載入的工具），可能得到完全不同的相容性結果。測試需要覆蓋到實際會用到的呼叫模式，不能只驗證最簡單的那一條路徑。

這四點合起來，大概就是「換一個 base URL 就能跑」這句話背後，真正需要拆解的代價地圖。
