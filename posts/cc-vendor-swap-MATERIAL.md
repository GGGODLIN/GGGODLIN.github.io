# MATERIAL：CC vendor swap 總綱——把第三方模型接進 Claude Code 的真實代價地圖

> 語氣中性素材骨架。合併三個子題：#6（五個 regression）／ #34（cc-vendor-bridge 三路徑）／ #81（ccp-glm tool schema 不相容、fork variant）。#15（中介層三類）經 review gate 拍板砍掉、留題庫改天獨立寫。
> 本檔只列事實、論證結構、證據、骨架，不成文、不帶語氣。之後會用 N 種文體各寫一版，任何一句讀起來像成稿即違規。

---

## 0. Review gate 定調（2026-07-02 使用者拍板，N 版一致，不可違）

1. **#15 中介層三類框架砍掉**：本篇是純 vendor swap 敘事，transparent / transformation / stateful swap 分類地圖不進文章（#15 留題庫、素材在 `reference_cc_i18n_proxy_design_pivot`）。§4.4 保留為背景素材、不寫進正文 beat。
2. **Bruce 案例改名「第三方中轉站」、寫概念**：silent fabrication 案例保留（「偽造比 4xx 更危險」論點），一律寫成「第三方中轉站」，不點名 ccp-bruce / Bruce、不附連結、不描述其服務細節。
3. **z.ai 中國節點上傳：加重警示**：明確警示措辭（不只中性知情）——本機檔案會被上傳到中國區節點、敏感檔案不要在此類 endpoint 下餵給 agent；但警示強度不得超出證據（事實仍是「vision 轉檔路徑、非惡意外洩」），必附對照事實「官方 Anthropic endpoint 不經此路徑」，不用「外洩 / 竊取」等指控字眼。
4. **自家 cc-vendor-bridge repo**：可附連結（已確認公開），正文只寫概念不貼 wrapper 原始碼。
5. **骨架採選項 C（共同坑驅動）**：2026-07-02 使用者校稿拍板（PR-060）——具體坑當 beat 主體、三層框架降級為收尾透鏡一段帶過，不當主軸。
6. **Claim liveness 呈現方式（2026-07-02 live 重查後補定調）**：現行狀態類事實（endpoint URL / 版號 / 星數 / 方案存在性）一律用 2026-07-02 live 核值、不寫「YYYY-MM-DD 的查證顯示」這種快照句式；行為觀察類（z.ai 五點行為 / silent fabrication 案例 / sidecar 使用經驗）重測成本高、以**帶日期敘事**呈現（「2026-06-20 實測時觀察到」），不寫成現在式通則。z.ai 訂閱**金額不寫死**（波動頻繁），只寫方案存在。
7. **內部資訊 / 記憶 / 研究過程不入文（2026-07-03 PR-061 補定調）**：作者自己的記憶判斷歷史（「我原本以為 X」「我之前記了 Y」「兩個月前我記了 CCR 主作者退場」）、內部實驗數據細節（636 樣本 A/B 驗證這類）、memory 舊值對照（cc-switch 57.9K→112K 只寫現值 112K 加兩個月翻倍、不寫舊值）、研究過程 meta（「live 查核推翻我先前判斷」的內部敘事）一律不寫進正文。改成讀者視角的現況陳述——CCR 反轉 beat 從「我兩個月前判錯」改成「中介層工具的 repo 活躍度跟具體破口 issue 狀態會不同步、健康度判斷本身有時效、引用的 issue 要定期重查」。判準：寫完反問「這是讀者需要知道的現況，還是作者的研究過程？」後者刪或改寫成現況洞察。
8. **白話化（2026-07-03 PR-061 補定調）**：技術詞首次出現用白話短語帶過用途，不堆著名詞假設讀者懂——endpoint（對話送出的伺服器位址）、context（對話能記得的長度上限）、schema（資料格式）、effort（思考深度檔位）、AutoCompact（自動壓縮舊對話）、ToolSearch（CC 按需載入工具的機制）等。技術專名仍可留英文（反晶晶體「可留英文」類），但第一次出現搭配白話短語。整體語氣偏「講給沒接過第三方模型的工程師聽」，不是「內行人對內行人黑話」。

---

## 1. 核心主張／thesis（中性陳述）

候選 thesis（依素材實際支撐強度排序，供後續文體階段挑選）：

1. **「換 base URL 就能跑」是簡化說法**：Anthropic-native endpoint（Path 0）在協議層確實只需要換一個環境變數；但協議相容（HTTP 200、格式對上）不等於功能相容（cache / thinking / tool schema 是否真的按 Anthropic 語意運作），功能相容也不等於生態相容（CC 內建機制如 ToolSearch deferred loading、subagent 派工、context window 偵測是否認得這個 endpoint）。三層代價各自獨立、各自需要驗證。
2. **中介層 router（Path 2 / CCR）在協定翻譯這層有結構性破口**：不是「這個工具有 bug」層級，是「翻譯 Anthropic ↔ OpenAI-compatible 協定」這件事本身在 tool use / prompt caching / subagent 路由等維度反覆出現失敗，且部分破口已存在超過一年（見 §4 CCR issue 追蹤）。
3. **同一個 vendor 家族內部，不同接入路徑（vendor-native endpoint vs 第三方 router vs 特定 CC 版本）行為並不一致**：DeepSeek 對 Anthropic server-side WebSearch tool 的支援、GLM 對 subagent 動態載入 tool 的拒絕，都是「這一個 vendor 這一條路徑」才成立的結論，換一條路徑結論可能整個翻案（DeepSeek WebSearch 案例本身就推翻了作者自己先前的假設，見 §4）。

**待拍板**：三個候選中，1 是最泛用的框架級主張，3 是最具體、最能落地在「查證會出錯」這個角度的主張。§7 會標出各自的素材厚度。

---

## 2. 目標讀者＋為什麼現在寫

- **目標讀者**：會自己接 CC 到非 Anthropic 模型的技術讀者（成本敏感、想省訂閱費、想測 CN 模型能力的工程師）；或想理解「vendor swap 到底值不值得」的旁觀者。
- **為什麼現在寫**：
  - 作者親身走過三條路徑（vendor-native / sidecar / CCR）超過兩個月，累積具體踩坑證據（非理論推演）
  - 素材橫跨「協議層 regression」「中介層破口」「vendor-specific tool schema 不相容」三個不同層次，適合整合成一份「代價地圖」而非單點踩坑紀錄
  - 2026-07-02 live 查核發現一個重要反轉：CCR（claude-code-router）主 repo 在作者原本判定「主作者退場」之後，實際上已恢復活躍開發（見 §4），這本身就是一個值得記錄的「舊結論要重查」案例

---

## 3. 論證骨架（section by section beat 清單）

### 骨架選項 A（#34 三路徑框架為主軸，時間序推進）

| Beat | 要點 | 支撐證據 | 在整篇的作用 |
|---|---|---|---|
| 1 | 起點：想用非 Anthropic 模型接 CC，同時不犧牲 CC 生態（skill / MCP / hook / subagent） | project_cc_vendor_bridge 目標陳述 | 建立動機，讀者對齊需求 |
| 2 | 三條路徑總覽：Path 0 vendor-native endpoint／Path 1 sidecar／Path 2 router（CCR/LiteLLM） | cc-vendor-bridge-toolkit wiki 三路徑對照表 | 給讀者一張路徑地圖，後面每段對應一條路 |
| 3 | Path 0 看似最乾淨：4 大 CN vendor 全部官方提供 Anthropic-native endpoint，純環境變數替換 | reference_cn_models_anthropic_native_endpoints_2026_05（9 個官方 endpoint URL） | 建立「協議層相容」的錯覺基準 |
| 4 | 但 CC client 對 Path 0 endpoint 有自己的隱藏假設，兩個具體 regression 案例 | CC 2.1.128 third-party endpoint regression（一天修復）／ context window 200K fallback（`isFirstPartyAnthropicBaseUrl()` gate，未修復、需 paired override） | 第一層代價：CC 生態相容 |
| 5 | Path 1 sidecar：靠 `claude -p` headless 模式繼承 Path 0 設定，5 行 wrapper 完成，但有自己的運作限制 | project_cc_vendor_bridge Stage 3／ccp-watch verdict（600s Bash 上限／黑盒進度／permission YOLO／cache miss） | 第二層代價：sidecar 模式本身的運作限制，不是 vendor 問題 |
| 6 | Path 2 CCR：中介層在協定翻譯這層的結構性破口，橫向對照矩陣 | reference_cc_model_swap_paths_breakage_matrix（tool use／prompt caching／subagent／MCP tool 名稱／Tool Search／extended thinking／system prompt 七維度） | 第三層代價：中介層協定翻譯的結構性破口 |
| 7 | CCR 專案健康度判斷曾經出錯：2026-05 判定「主作者退場」，2026-07-02 live 查發現已恢復活躍開發，但引用的 issue 全部仍是 open | live 查核結果，見 §4 | 反轉／自我修正 beat，示範「舊結論要重查」 |
| 8 | 縱深案例：即使選定 Path 0 vendor-native，同一 vendor 的不同呼叫模式（main session baseline tool vs subagent 動態載入 tool）行為不一致，ccp-glm 撞 400 [1210] | reference_ccp_glm_websearch_tool_schema_unsupported | 第四層代價：vendor-specific tool schema 不相容，需要 fork workflow variant 才能繞過（對應 #81） |
| 9 | 收斂：vendor swap 的代價分層總表（協議層／CC client 隱藏假設層／sidecar 運作限制層／中介層翻譯層／vendor-specific tool schema 層） | 全篇整合 | 給讀者一個判斷框架，而非「照抄 wrapper 就好」 |

### 骨架選項 B（失敗案例編年史，貼近「failure-as-content」偏好）

依時間序排列五個具體踩坑事件，每個事件講「原本以為 X，實際發現 Y」，最後收斂出分層框架。時間序：
1. 2026-05-06 CC 2.1.128 third-party endpoint regression（一天修復，示範「等一天可能比自己修划算」）
2. 2026-05 CCR 破口矩陣 + 健康度誤判（示範「工具健康度判斷本身會過期」）
3. 2026-06-19 z.ai 計費校準（示範「vendor 文件 claim 跟實測差 5 倍」）
4. 2026-06-20 z.ai endpoint 五點特殊行為，含兩條反證自己先前判斷的紀錄（示範「自我修正比一次到位更真實」）
5. 2026-06-22 ccp-glm 對 subagent 動態載入 tool 拒絕（示範「同一 vendor 不同呼叫路徑結論不同」）

### 骨架選項 C（共同坑驅動；**2026-07-02 使用者校稿拍板採用**，見 §0-5 / PR-060）

開場（為什麼換 + 三條路徑一段交代完）→ 主體 = 跨 vendor 共同坑逐個講（每坑：現象 + 哪幾家中招 + 解法或現狀）→ CCR 反轉 beat → 收尾把三層框架當總結透鏡一段帶過（不當主軸）。坑群 beat：

| Beat | 坑 | 支撐證據 |
|---|---|---|
| C1 | WebSearch 三種死法＋一個意外生還：GLM 400 [1210]／MiMo、Kimi schema reject／某帳號池服務偽造 SERP（200 + 假引用，最危險）／DeepSeek 反而原生支援（後端 Bocha）| §4.3 + §4.5 |
| C2 | WebSearch 解法演進弧線：chrome SERP fallback（慢、燒 context）→ 自包 Exa 進 bridge（`--disallowed-tools WebSearch` + nudge 指向 curl wrapper，不吃 vendor 配額）| §4.5 Exa 整合 |
| C3 | shell 把 model id 當 glob：`glm-5.2[1m]` unquoted 在 zsh 直接「no matches found」整個指令炸掉 | §4.5 |
| C4 | 錢包層兩坑：計費文件 claim 跟實測差 5 倍要自己校準／z.ai 尖峰時段（UTC+8 14:00–18:00）配額燒 3 倍、長 workflow 要挑時段跑 | §4.5 |
| C5 | 效能與容量的隱形縮水：prompt cache 打不中（成本可 ×5-10、多家未驗）／CC 對第三方 endpoint 一律當 200K context（`isFirstPartyAnthropicBaseUrl()` gate）／effort 5 檔被映射成 2 檔 | §4.1 / §4.3 |
| C6 | 同 vendor 三條呼叫路徑結論不同：main session 啟動時載入的工具正常、subagent 透過 ToolSearch 動態載入 tool 撞 400 [1210]、deep-research workflow 整批 fan-out agent 全滅要 fork 變體才活（workflow 內 agent 性質同 subagent、同樣吃動態載入的虧） | §4.3（#81） |
| C7 | 換了 vendor 就得自建監控：pool 健康度 watcher／配額 watcher（workflow-monitor 三兄弟）——官方生態的「不用想」在第三方全變成自己的事 | §4.5 |
| C8 | CCR 反轉 beat（讀者視角，去內部過程）：中介層工具的 repo 活躍度跟具體破口 issue 狀態會不同步——CCR repo 活躍（v3.0.5、35,511★），但四個破口 issue 全 OPEN；endpoint 表兩個月漂一家（Qwen）；cc-switch 星數兩個月翻倍到 112K＝需求證明。寫成「健康度判斷有時效、引用的 issue 要自己重查」的讀者洞察，不寫「我之前判錯」的內部過程 | §4 已修正段 + FC-070/073 + PR-061 |
| C9 | 收尾：三層透鏡（協議相容 ≠ 功能相容 ≠ 生態相容）一段總結 + 給讀者的檢查清單 | 全篇整合 |

**三個骨架的取捨**：~~A 框架主軸~~／~~B 編年史~~——**C 已拍板**（使用者 2026-07-02 校稿意見：抽象概念太多、具體踩坑點才是主角）。A 的框架降級為 C9 收尾透鏡；B 的「原以為 X 實際 Y」敘事節奏可在各坑內使用。

---

## 4. 關鍵事實清單

準據標記：**已修正**＝原判斷被後續證據推翻；**多來源一致**＝2+ 獨立來源同向；**單一來源未驗**＝僅一次觀察；**live 已核**＝本次 2026-07-02 用 gh CLI 即時查證。

### 4.1 CC client 對第三方 endpoint 的隱藏假設

- CC 2.1.128（2026-05-05 release）對所有非 first-party `ANTHROPIC_BASE_URL` 強制加 `[1m]` model name suffix 並 client-side reject（server 完全沒收到 request）。**多來源一致**（ccp-qwen-3.6-35B 與 ccp-deepseek 同時中招，兩個獨立 vendor 對照）。2026-05-06 CC 2.1.129 自動修復，regression 存在僅一天。
- Context window 偵測 fallback：`isFirstPartyAnthropicBaseUrl()` gate 導致所有非官方 endpoint 被 CC 認定為 200K context，不論 vendor 真實 context 多大（例：DeepSeek V4-Pro 真實 1M，CC 認 200K，AutoCompact 在真實 context 的 ~18.7% 就觸發）。**單一來源未驗（cc-vendor-bridge 自家 caveat，含 CC 原始碼行號引用，但未經第三方覆核）**。Workaround 為 `DISABLE_COMPACT=1` + `CLAUDE_CODE_MAX_CONTEXT_TOKENS` paired override，非官方修復。

### 4.2 CCR / LiteLLM 中介層破口（Path 2）

七維度破口矩陣（2026-04 GitHub-verified，來源見下表），**live 已核**於 2026-07-02：

| 元件 | 2026-04 判定 | 對應 issue | 2026-07-02 live 狀態 |
|---|---|---|---|
| Tool use（CCR） | BROKEN | [CCR #654](https://github.com/musistudio/claude-code-router/issues/654) | **open**（無更新自 2026-04-05） |
| Subagent 路由（CCR） | BROKEN | [CCR #670](https://github.com/musistudio/claude-code-router/issues/670) | **open**（無更新自 2025-09-19，一年以上未動） |
| MCP tool 名稱 64 字元（CCR） | DEGRADED | [CCR #1348](https://github.com/musistudio/claude-code-router/issues/1348) | **open**（最後更新 2026-04-21） |
| Extended thinking（CCR） | DEGRADED | [CCR #1238](https://github.com/musistudio/claude-code-router/issues/1238) | **open**（最後更新 2026-04-29） |
| DeepSeek reasoning_content 保留（CCR PR） | 待 merge | [CCR PR #1376](https://github.com/musistudio/claude-code-router/pull/1376) | **仍未 merge**（open，最後更新 2026-05-01） |
| Tool use streaming drop（LiteLLM） | BROKEN | [LiteLLM #25321](https://github.com/BerriAI/litellm/issues/25321) | **已 closed**（2026-05-09） |
| Prompt caching stripped（LiteLLM） | BROKEN | [LiteLLM #26625](https://github.com/BerriAI/litellm/issues/26625) | **已 closed**（2026-06-23） |
| Bedrock system prompt 400（LiteLLM） | DEGRADED | [LiteLLM #26554](https://github.com/BerriAI/litellm/issues/26554) | **open**（最後更新 2026-04-26） |
| Tool Search defer_loading stripped（LiteLLM） | DEGRADED | [LiteLLM #26113](https://github.com/BerriAI/litellm/issues/26113) | **open**（最後更新 2026-04-20） |

**已修正的重大判斷**：memory 原記「CCR 主 repo 2 個月沒動，主作者 2026-01-06 後退場，issue #1310 問是否還在維護作者從未回覆」（2026-05-03 判定）。**2026-07-02 live 查核推翻此判斷**：CCR repo `pushed_at: 2026-07-02T03:46:40Z`（即查核當天），近期 commit 包含版本號提升至 3.0.5、README 整理、routing 設定調整，repo 目前活躍（35,511 ★，978 個 open issue）。但**上表引用的 4 個 CCR issue 全部仍是 open 狀態**，也就是「repo 活著」跟「這幾個具體破口被修」是兩件不同的事——repo 復活不代表這篇文章引用的具體問題已解決。issue #1310（問維護狀態）8 則留言，最後更新 2026-05-09，未再查核是否有維護者後續回應（**缺口**）。

### 4.3 Vendor-native endpoint（Path 0）與 vendor-specific 行為

- 4 大 CN vendor（DeepSeek / Kimi / GLM / Qwen）全部官方提供 Anthropic-native endpoint（首查 2026-05-03、**2026-07-02 live 重查**）：DeepSeek `api.deepseek.com/anthropic`／GLM `api.z.ai/api/anthropic`／Kimi `api.moonshot.ai/anthropic`（三家 URL 未變；Kimi 文件網域改名 platform.kimi.ai、舊 platform.moonshot.ai 301 轉導、API base URL 本身不變）。**Qwen/dashscope 已漂移**：舊路徑 `dashscope.aliyuncs.com/api/v2/apps/claude-code-proxy` 被官方文件標「已過時」且僅支援 `qwen3-coder-plus`，新版為 `dashscope.aliyuncs.com/apps/anthropic`（陸）/ `dashscope-intl.aliyuncs.com/apps/anthropic`（國際）+ Coding Plan 專屬 `coding.dashscope.aliyuncs.com/apps/anthropic`。**這條漂移本身是論點素材**：endpoint 對照表兩個月就漂了一家，「換 base URL」的 base URL 自己會過期。各家 env var pattern 互不相容（DeepSeek 8 個變數含獨家 `CLAUDE_CODE_SUBAGENT_MODEL`；Kimi 3 個；GLM 用 OPUS/SONNET/HAIKU 三段 tier mapping；Qwen 單一 `ANTHROPIC_MODEL`）。【準據：live 已核 2026-07-02，FC-073】
- **已修正**：DeepSeek `/anthropic` endpoint 對 Anthropic server-side WebSearch tool（`web_search_20250305` / `web_search_20260209`）原本假設「OpenAI-Responses translation proxy family 全部 schema-reject」，2026-05-25 一手實證＋2026-05-26 官方文件更新推翻此假設——DeepSeek 實際原生支援，後端接 Bocha 博查真實搜尋引擎，回傳真實 `server_tool_use` block。**多來源一致**（第三方一手實證＋官方文件隔日確認）。判斷邏輯需從「proxy 架構是否相容 schema」改成「per-vendor 是否真的接了後端」。
- z.ai (GLM) endpoint 對 subagent 透過 `ToolSearch` 動態載入 tool 後的 next-turn request 回 400 [1210]，但 main session baseline tool（啟動就在 tool list）與直接 curl 打 server-side tool 都正常。**多來源一致**（workflow subagent 失敗案例＋main session 正常案例＋curl 直打正常案例，三方對照同一 session 內完成）。跟 GLM 模型版本（4.7/5.2）無關，是 endpoint 對「tool 來源」的驗證邏輯差異，非 model 能力差異。第三條呼叫路徑 workflow：CC 的 Workflow tool fan-out 多個 agent、每個 agent 同樣走 ToolSearch 動態載入，在 ccp-glm 下整批撞 400 [1210]、deep-research workflow 因此全滅，要 fork 出禁用動態載入的變體才能跑完。三條路徑（main session / subagent / workflow）同 vendor 同 endpoint 結論可以完全相反，測試要覆蓋到實際會用的呼叫模式。
- **需要特別小心的反證紀錄**：z.ai endpoint 曾被懷疑「在回應注入配額 widget 圖」，作者自我核實後確認是**誤判**——該圖是使用者自己貼的截圖經 CDN 轉檔，並非 endpoint 注入。真正的注入只有工具結果尾端的 soft injection 文字（`REMINDER: You MUST include the sources...`），這條本身是模仿 Anthropic 原生 WebSearch 的行為模式。**單一來源（作者自我核實），已記錄為「先別腦補是注入，先確認是否使用者自己貼的」教訓**。
- **Silent fabrication 案例**（風險最高但需脫敏處理，見 §8）：某第三方 proxy 宣稱修好了原本 schema-reject 的 WebSearch tool，實際上是模型自己編造搜尋結果、包含假 URL 與假日期，且模仿 Anthropic 官方的來源引用提示文字，HTTP 層完全正常（200 OK），使用者若只看 transport 層完全無法察覺。**單一來源（作者自測 3/3 prompt 全踩雷），需驗 tool_result body 內容而非只看 HTTP 狀態碼**。

### 4.4 中介層兩層架構（背景素材，§0 拍板不進正文 beat）

- CCR 破口矩陣的 Layer A／Layer B 兩層架構：「CC binary 永遠 work 的部分」（hooks / slash commands / statusline / settings / MCP lifecycle / CLAUDE.md cascading / subagent dispatch 基礎建設）vs「proxy 翻譯會破的部分」（tool schema / cache_control / thinking block / multi-block system prompt / 含圖片與平行工具呼叫的對話歷史）。可支撐 §3 beat 的破口矩陣段，寫作時當背景理解用。#15「三類」框架（transparent / transformation / stateful swap，出處 `reference_cc_i18n_proxy_design_pivot`）已拍板不進本篇。

### 4.5 跨 vendor 共同坑補充事實（2026-07-02 校稿後補進，支撐骨架 C）

- **Exa 整合弧線**（C2）：vendor-swap WebSearch 在多 vendor 上行為不一致（帳號池服務偽造 SERP／GLM 400 [1210]／MiMo、Kimi schema reject／DeepSeek 原生 Bocha 正常）。第一代解法 = wrapper 加 `--disallowed-tools WebSearch` + nudge 指向 chrome SERP fallback，缺點：慢、context 重、燒 vendor token render 頁面。第二代（2026-06-22，commit `e7933f1`）= 自寫 `bin/exa-search.sh` curl wrapper（Exa Search API、macOS keychain 存 key、URL 去重保排序、LLM-ready markdown 輸出、`--max-time 30s`），ccp-bruce + ccp-glm 的 nudge 改指向它——快、context 省、不吃 vendor 配額；ccp-deepseek 不動（原生 WebSearch 工作）。選 Exa 理由：免費 20K 次/月 + neural 索引對使用者「91% 英文 + 語意長句」搜尋習慣對位。**多來源一致**（memory 條目 + commit 紀錄，`reference_cc_vendor_bridge_exa_integration_2026_06_22`）。
- **zsh 把 model id 當 glob**（C3）：`[1m]` 是 zsh 字元集 glob pattern、zsh 預設 NOMATCH 開啟——unquoted `export ANTHROPIC_MODEL=glm-5.2[1m]` 或 `claude --model glm-5.2[1m]` 直接「no matches found」整個指令中止；bash 不踩。fix = 單引號 quote + `setopt local_options no_nomatch` 防呆。任何 vendor model id 含 `[` `]` `*` `?` 都中招。**多來源一致**（`reference_zsh_bracket_glob_abort_model_id`，2026-06-19）。
- **計費校準**（C4）：z.ai 計費文件 claim 與實測差 5 倍、需自行校準（2026-06-19，`reference_zai_glm_cc_billing_calibration_2026_06_19`）。**單一來源未驗**（單 vendor 單次校準）。
- **尖峰時段配額 3×**（C4）：z.ai 訂閱在尖峰時段（UTC+8 14:00–18:00）配額消耗 3 倍——**live 已核 2026-07-02**（z.ai 訂閱頁明載）；長 workflow 因此要挑時段跑。
- **自建監控**（C7）：換 vendor 後官方生態的「不用想」全變自己的事——為配額 / 健康度各寫 watcher：Anthropic 5h 額度用 workflow-monitor、z.ai 5h 上限 + 尖峰窗用 glm-workflow-monitor、帳號池健康度用 pool status endpoint 輪詢（2026-06-20 636 樣本 A/B 驗證 healthPercent 是先行指標；服務名依 §0-2 匿名化）。**多來源一致**（三個 monitor skill 實際存在 + 驗證紀錄）。
- **effort 檔位映射**（C5）：z.ai endpoint 把 CC 的 effort 5 檔映射成 2 檔（2026-06-20 實測，屬 z.ai 五點行為之一，帶日期敘事呈現）。

---

## 5. 數據／證據庫

### 5.1 具體數字

- CCR：35,511 ★（2026-07-02 live）、978 個 open issue（2026-07-02 live）
- CCR 4 個引用 issue（#654 / #670 / #1348 / #1238）：2026-07-02 live 查核**全部 open**
- CCR PR #1376（DeepSeek reasoning_content fix）：2026-07-02 live 查核**仍未 merge**
- LiteLLM 5 個引用 issue：2 個已 closed（#25321 tool_use drop、#26625 prompt caching）、3 個仍 open（#26554、#26113、#26535）
- 9 個官方 Anthropic-native endpoint URL（DeepSeek 1 / Kimi 3 / GLM 2 / Qwen 3）
- Context window fallback：DeepSeek V4-Pro 真實 1M context，CC 誤判 200K，AutoCompact 在約 18.7% 處觸發
- z.ai (GLM) Coding Plan billing 校準：1 次 CC turn ≈ 5-6 個 z.ai 文件所稱的「prompt」單位，與官方文件 claim「1 prompt = 15-20 model invocation」實測差 5.6 倍
- deep-research claude-code-degradation 報告：102 agents／17 confirmed／8 killed／0 rate-limit 429（2026-05-30）

### 5.2 涉及工具／repo（第一次具名須附連結，依專案規則）

- [musistudio/claude-code-router](https://github.com/musistudio/claude-code-router)（CCR）
- [BerriAI/litellm](https://github.com/BerriAI/litellm)
- [farion1231/cc-switch](https://github.com/farion1231/cc-switch)（endpoint switcher，非 transformer router，112,159★ 2026-07-02 live 核；memory 舊值 57.9k（2026-05-03）、兩個月翻倍，可當「這條需求有多熱」的量化素材）
- [BochaAI/bocha-search-mcp](https://github.com/BochaAI/bocha-search-mcp)（DeepSeek WebSearch 後端）
- [GGGODLIN/cc-vendor-bridge](https://github.com/GGGODLIN/cc-vendor-bridge)（作者自家專案，**已公開**，2026-07-02 live 確認 `private: false`，最新 commit 2026-06-22）
- DeepSeek 官方文件：https://api-docs.deepseek.com/zh-cn/quick_start/agent_integrations/claude_code
- z.ai (GLM) 官方文件：https://docs.z.ai/scenario-example/develop-tools/claude
- Kimi 官方文件：https://platform.kimi.ai/docs/guide/agent-support
- Qwen 官方文件：https://www.alibabacloud.com/help/en/model-studio/claude-code

### 5.3 時間錨

- 2026-05-03：4 大 CN vendor Anthropic-native endpoint 確認、CCR 健康度首次判定
- 2026-05-05／06：CC 2.1.128 regression 發生與修復
- 2026-05-25／26：DeepSeek WebSearch 支援一手實證與官方文件確認
- 2026-05-30：deep-research claude-code-degradation 報告完成
- 2026-06-19：z.ai billing 校準
- 2026-06-20：z.ai endpoint 五點特殊行為紀錄
- 2026-06-22：ccp-glm subagent tool schema 400 [1210] 發現
- 2026-07-02：本次 MATERIAL 撰寫、CCR/LiteLLM issue live 查核 + 四家 endpoint / DeepSeek WebSearch / cc-switch / CC 版號 live 重查（**今日**）
- 補充 live 核值（2026-07-02）：CC 最新版 **2.1.198**（npm registry；文章提「當前版本」用此值，不用本機 2.1.139）；DeepSeek 官方文件仍列 `web_search_tool_result` Supported（快照 2026-05-25 結論不變）；z.ai GLM Coding Plan 訂閱仍在售（金額依 §0-6 不寫死）

---

## 6. 收尾要傳達的 takeaway（中性陳述）

候選（供後續文體階段挑選一個或組合）：

1. Vendor swap 決策應該按「協議層／CC 隱藏假設層／中介層翻譯層／vendor-specific tool 層」分開驗證，而不是驗證一層就假設全部相容。
2. 工具健康度判斷本身有時效性，「repo 沒人維護」這類結論需要定期重查——本篇寫作過程中就抓到一個自己兩個月前的判斷已經過期。
3. 中介層 router（CCR/LiteLLM）近期改善的是傳輸層 bug（tool_use streaming、prompt caching），但架構性的路由/翻譯問題（subagent 路由、MCP 工具名稱長度）仍未解決，這類問題可能需要架構重寫而非增量修補。
4. 同一個 vendor 不同呼叫路徑（主 session vs subagent、baseline tool vs 動態載入 tool）可能有完全不同的相容性結果，測試需要覆蓋到實際會用到的呼叫模式，不能只驗證最簡單的路徑。

---

## 7. 素材完整度／缺口報告

| 段落 | 狀態 | 說明 |
|---|---|---|
| Path 0 vendor-native endpoint 機制 | **紮實可寫** | 9 endpoint URL、env var pattern、多方驗證，來源明確 |
| CC 2.1.128 regression | **紮實可寫** | 時間線完整、多 vendor 對照、有 resolution |
| CCR 破口矩陣 | **紮實可寫 + 已 live 更新** | 7 維度矩陣、issue 連結全部 live 查核 |
| CCR 健康度判斷的自我修正 | **紮實可寫，是本篇最強的「反轉」beat** | 有明確的「舊判斷 vs live 查核」對照，適合當結構性轉折點 |
| DeepSeek WebSearch 支援 | **紮實可寫** | 有一手實證＋官方文件雙重來源，且本身是一次「推翻自己假設」的案例 |
| ccp-glm tool schema 不相容 | **紮實可寫** | 三方對照（main session／curl／subagent）證據完整 |
| z.ai 五點特殊行為 | **紮實可寫，但需篩選** | 五點中「本機檔案上傳中國節點」需脫敏處理，見 §8 |
| Silent fabrication (Bruce) 案例 | **偏薄 + 高風險，需拍板** | 只有單一來源、且涉及需要脫敏的第三方帳號池服務，見 §8 |
| Sidecar (Path 1) 運作限制 | **紮實可寫** | ccp-watch verdict 完整記錄五個限制點，且有明確的「不適合什麼場景」結論 |
| CCR per-route 混合路由 | **偏薄** | 只有機制描述（可依 route 分配模型），沒有作者自己的使用案例或驗證 |
| Prompt cache 在 vendor-native endpoint 是否真的生效 | **缺漏** | caveats.md 明確列為 5 個待驗維度之一，多個 vendor（Kimi/GLM/Qwen）都還沒驗證完成；z.ai 案例有 90.5% cache hit rate 的正面數據但屬單一 vendor 單一場景 |
| Extended thinking 在 vendor-native endpoint 的 schema 對應 | **缺漏** | 除 Qwen 已知限 Max 系列外，其餘三家未明 |

**整體判斷**：素材足以支撐 1 篇完整文章，若要拆成 2-3 篇系列（例如「Path 0 vs Path 2 對照」單獨一篇、「vendor-specific 踩坑編年史」單獨一篇），現有素材對前者紮實、對後者需要再補 1-2 個案例才夠厚度。#15 缺口已由 review gate 解決（拍板砍掉、留題庫），其餘缺口屬於「可以承認未驗證」的正常研究邊界。

---

## 8. 脫敏風險點清單（給 review gate 用）

| # | 風險點 | 評估 |
|---|---|---|
| (a) | ccp-bruce 是第三方帳號池轉售服務，公開寫涉及使用者既有偏好「灰色 API 寫概念不放 code」 | **已拍板：寫概念、匿名化（見 §0-2）**。素材中 silent fabrication 案例的主角是 ccp-bruce（reference_bruce_pool_health_endpoint_2026_06_20 / feedback_silent_fabrication_worse_than_4xx），文中若要引用這個案例，需要決定：(1) 完全略過 Bruce 案例，只用 DeepSeek/GLM 案例 (2) 寫成「某第三方 proxy」不點名 (3) 確認 GitHub 上 cc-vendor-bridge repo 的 README 描述文字尺度是否已經是使用者能接受的公開程度（README description 目前寫「ccp-glm / ccp-bruce / ccp-deepseek wrappers」，已在 repo description 公開點名 bruce，可能表示使用者已接受某種程度的公開）|
| (b) | z.ai 上傳本機檔案到中國節點（CDN cn-wlcb）的表述尺度 | **已拍板：加重警示、不超出證據（見 §0-3）**。事實本身（Read 本機圖片時上傳到 UCloud 中國節點 cn-wlcb）已被作者自己記錄為「非惡意，是 vision API 需要 URL 的合理轉檔，但要知情」，建議沿用這個中性框架，避免用「資料外洩」等會被誤讀成安全警訊的字眼；若要寫，應同時附上「用真 Claude／Anthropic endpoint 不經此路徑」這個對照事實 |
| (c) | 公司／工作專案代號是否有洩漏需泛化 | **本主題風險低**。素材全部來自個人專案（cc-vendor-bridge）與個人 CC 使用紀錄，未見 akocommerce / ako 等工作代號滲入。唯一需要注意的是 memory 條目 `reference_opus48_creepy_failure_modes` 等交叉引用連結若被帶入文章需檢查是否牽涉工作場景（目前判斷不需要引用這條） |
| (d) | 自家 cc-vendor-bridge repo 是否公開、可否附連結 | **已確認公開**。2026-07-02 live 查核 `gh api repos/GGGODLIN/cc-vendor-bridge` 回傳 `private: false`，repo description 為「CC vendor session toolkit: ccp-glm / ccp-bruce / ccp-deepseek wrappers + workflow monitors + caveats」。依專案規則可附連結，但文章內容仍應遵守「寫概念不放 code」的個人偏好——連結到 repo 本身（讀者可自行查看程度）與在文章正文貼出 wrapper 原始碼是兩件事，建議只做前者 |

**待作者拍板的兩項（依優先序）**：(a) Bruce 案例引用尺度、(b) 中國節點上傳表述用詞。其餘兩項評估後風險偏低，可在正式寫作階段沿用本檔判斷，不需要每個文體版本重新確認。
