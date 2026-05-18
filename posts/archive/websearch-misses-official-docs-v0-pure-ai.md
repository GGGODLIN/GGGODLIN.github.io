---
title: "WebSearch 排序對「找官方文件」不可信"
description: "2026-05-10 實測：同一個查詢，AI 內建 WebSearch 給的 10 條結果沒有官方 computer-use 文件專頁，換用瀏覽器走真實 Google 排序，第一條就是。AI 在被追問前，把 Anthropic X 貼文與第三方直播文字稿混稱為「官方來源」。本篇記錄從觸發到解法的完整過程，以及如何驗證 AI 是否真的看到官方文件。"
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/websearch-misses-official-docs-MATERIAL.md
---

# WebSearch 排序對「找官方文件」不可信

**時效說明：** 本文觀察基於 2026-05-10 單次實測（session `ad08d333-f4ee-464a-8799-817bab78ede8`）。工具行為會隨版本更新而改變；主軸寫的是耐久的驗證方法，不是對工具當前狀態的判斷。

---

## 起點：一個看似正常的查詢

那天的問題是：Claude Code 是否支援 computer use？

問 AI，AI 答得很篤定。列出對照表，引用來源：Anthropic 官方 X 貼文、Simon Willison 直播文字稿。語氣像是已查過官方文件。

這就是問題的起點。

---

## 高潮：追問之後的認帳

使用者起疑，追問 AI：你查到的官方連結是哪條？

AI 回頭細看 WebSearch 那 10 條結果，認帳：

> 「你抓到了我打混。校正：WebSearch 那 10 條 link 沒有 `code.claude.com/docs/en/computer-use` 這條。」

給的官方域名連結實際上是兩個：

- `code.claude.com/docs/en/desktop`：這是 Desktop 桌面應用程式頁，不是 computer-use 功能頁
- `support.claude.com` 的版本說明：說明中心的版本更新摘要，不是功能文件專頁

這是本篇的核心現場。AI 原本把 Anthropic 官方 X 貼文加上第三方直播文字稿包裝成「引用官方來源」，在使用者追問前沒有主動說明連官方文件專頁都沒看到。

---

## 對照：換工具，結果不同

同一個查詢，換用 `claude-in-chrome` 讓 AI 操作使用者本人的 Chrome 瀏覽器，導航到 `google.com/search`，再用 `javascript_tool` 抽取 SERP DOM：

```
div.MjjYud, div.tF2Cxc, div.g → 取前 ~12 條，map 出 title/url/snippet → JSON
```

第一條結果：`code.claude.com/docs/en/computer-use`，帶完整 title 與 snippet。

同一個查詢，兩條工具路徑，排序差異明確。

幾個工具路徑的實測對照（2026-05-10，computer-use 查詢）：

| 工具 | 結果 |
|---|---|
| WebSearch（內建）| 10 條，無 computer-use 官方文件專頁；給 X 貼文 + 說明中心 + 錯頁 `/docs/en/desktop` |
| `mcp__gemini__gemini-search`（API key）| 失敗，免費配額耗盡（429） |
| `mcp__gemini-cli__ask-gemini`（OAuth）| 給版本號 + 啟用方式 + 模型資訊，但不附 URL |
| 瀏覽器 SERP（claude-in-chrome）| DOM 第一條就是 `docs/en/computer-use` 官方文件專頁 |

說明：`claude-in-chrome` 使用使用者本人登入的 Chrome（非無痕、非 headless），Google 讀到登入帳號、cookie、地理位置，排序結果含個人化因素。需注意：這條路徑比開無痕更貼近使用者日常的 Google 排序，但不代表所有人的結果會完全相同。

---

## 為什麼直接抓 SERP 很難

自然想到的替代方案：直接讓 AI 用工具抓 `google.com/search` 的結果。實測兩條死路：

- **WebFetch `google.com/search`**：60 秒後逾時，無回應
- **`mcp__fetch`**：被 Google `robots.txt` 的 `Disallow: /search` 規則擋下

所以只有走瀏覽器這條路可行。`javascript_tool` 抽取 DOM 文字是關鍵——不是截圖，不用 `get_page_text`（後者可能超過字元上限），直接抽目標 CSS 選擇器的結構化資料。

---

## 來源層級：四個不同的東西

這次暴露的不只是排序問題，還有一個更基礎的混淆：同樣掛著官方域名，不同類型的頁面代表的資訊可信度差很多。

按權威程度由低到高：

1. **X/Twitter 貼文**（即使是官方帳號）：即時溝通、不具備文件精確度
2. **說明中心版本說明摘要**：更新日誌格式，不是功能完整規格
3. **部落格、第三方教學、直播文字稿**：詮釋層，不是原始規格
4. **官方文件域名的功能專頁**：才是「引用官方文件」的唯一成立條件

AI 這次混用的是第 1 層和第 3 層，然後把它們包裝成等同第 4 層。這個框架可以直接用來判斷 AI 給的「官方來源」是否真的算數。

---

## 成因：誠實的記錄缺席

為什麼 WebSearch 在這個查詢裡把官方文件排在二手文章後面？

誠實的答案是：不知道。

查過個人記錄，無成因記載。查過 Anthropic 官方 web search 工具文件（`platform.claude.com`），詳列版本（`web_search_20250305`、`web_search_20260209`）、計價、參數，全篇沒有提到後端搜尋來源是哪家，Brave、Bing、Google、Exa 均無出現。

這個記載缺席本身就是一個可引用的事實：使用者無從得知 AI 內建 WebSearch 搜的是什麼索引，這正是獨立驗證不可省的結構性理由。後端排序邏輯未公開，臆測沒有意義。

---

## 解法：怎麼驗證 AI 是否真的看到官方文件

這是本篇最耐久的部分，和工具版本關係較小。

**驗證流程：**

1. 取得 AI 給的「官方來源」連結清單
2. 對照四層框架，判斷連結類型——X 貼文、說明中心、部落格、文件專頁，各在哪一層
3. 如果沒有第 4 層（功能文件專頁），用瀏覽器走真實 Google 排序確認

**SERP 抽取技術細節（`claude-in-chrome` + `javascript_tool`）：**

```js
Array.from(document.querySelectorAll('div.MjjYud, div.tF2Cxc, div.g'))
  .slice(0, 12)
  .map(el => ({
    title: el.querySelector('h3')?.innerText,
    url: el.querySelector('a')?.href,
    snippet: el.querySelector('.VwiC3b, .lEBKkf')?.innerText
  }))
```

不截圖，不用 `get_page_text`，直接取結構化 JSON，省 token 也比較可靠。

**兩個工具路徑應當交叉，不是擇一：**

- WebSearch：快、有 URL 清單，適合初步篩選
- 瀏覽器 SERP：走真實 Google 排序，適合確認官方文件有沒有在前列

單用其中一個都有盲點；交叉比對才算一輪可靠的官方文件查核。

---

## 操作化

這個觀察後來被固化成強制機制：

- `PreToolUse` hook（`websearch-parallel-enforce.sh`）：強制 WebSearch 必須配同一查詢的瀏覽器 SERP，不能單獨使用
- `/check-parallel-search` 指令：分析 session 內 WebSearch + 瀏覽器 SERP 配對情況
- `research-before-answer` skill 的並行段落：覆蓋涉及事實查核的場景

hook 的完整實作細節不在本篇範圍，這裡只說明「問題嚴重到值得做成強制機制」這個定性判斷。會被固化成 hook 代表它被當成高頻失效點，不是偶發邊緣個案。

---

## 收束

幾個可以直接帶走的判準：

1. 「搜尋結果含某官方域名連結」≠「AI 引用了官方文件」——X 貼文和功能文件專頁都可能掛官方域名，但代表不同層級的資訊
2. 驗證「AI 是否真的看到官方文件」需要獨立的工具路徑，不能只信任 WebSearch 的排序清單
3. 連 Anthropic 官方文件都不揭露 WebSearch 的後端搜尋來源——使用者無從得知它在搜什麼索引，獨立驗證因此不是選配
4. 一輪可靠的官方文件查核 = 瀏覽器真實 SERP + WebSearch 交叉比對
5. 來源層級判斷是可學的技能：四層不能混用，AI 自己也可能混用

---

*2026-05-10 實測 ｜ session ad08d333-f4ee-464a-8799-817bab78ede8 ｜ FC-003（截圖證偽）/ FC-004（10 條坐實 + 成因未公開記載）*
