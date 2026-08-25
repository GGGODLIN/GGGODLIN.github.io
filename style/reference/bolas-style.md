---
status: v1
last_updated: 2026-05-17
sources:
  - codex-goal-notes: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/codex-goal-notes/index.md
  - agents-md-writing-principles: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/agents-md-writing-principles/index.md
  - my-ai-coding-journey: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/my-ai-coding-journey/index.md
  - refactor-with-ai-agents: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/refactor-with-ai-agents/index.md
  - astro-migration-6th-anniversary: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/astro-migration-6th-anniversary/index.md
  - stop-fixing-code-start-completing-tasks: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/stop-fixing-code-start-completing-tasks/index.md
  - value-of-engineer-with-ai: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/value-of-engineer-with-ai/index.md
  - ai-frontend-development-flow: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/ai-frontend-development-flow/index.md
  - ai-amplifies-output-but-not-validation: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/ai-amplifies-output-but-not-validation/index.md
  - claude-code-first-use: https://raw.githubusercontent.com/BolasLien/blog/master/src/content/posts/claude-code-first-use/index.md
corpus_note: "AI 協作 cluster only（10 篇），單一外部作者參考，**非使用者本人 voice**，定位研究借鑑/對照組"
---

# Bolas 寫作風格 Profile（研究借鑑用）

> ⚠️ 這份文件是對外部作者 Bolas（BolasLien）的風格分析，**不是 @gggodlin 的 voice**。
> 定位：借鑑組 / 對照組。末段「可借鑑 vs 該避免」是核心。

---

## Identity

從 10 篇語料的內證推斷：

- **職涯軌跡**：前端工程師，2020 年初學者建 blog，2023 年開始 AI 輔助開發，2025–2026 年幾乎不手寫程式碼，工作重心移向「說清楚需求、驗收 AI 產出」。曾任職 PChome 相關職位，後換公司，接手重構遺留代碼的任務。
- **自我定位**：技術轉型期的記錄者，不把自己定位成佈道師，而是「我試了，分享給你參考」的實踐者語氣。
- **主題範圍**：10 篇幾乎全落在 AI 協作 cluster（Claude Code、Codex、Gemini CLI、AGENTS.md、重構實驗、工程師思維轉型），無明顯跨 topic（無生活/政治/飲食），和 @gggodlin 的跨 topic 廣度形成強對比。
- **立場向**：對 AI 工具整體正面，但不盲目，會講失敗（ai-frontend-development-flow 的翻車紀錄）和限制（value-of-engineer-with-ai 的驗證缺口）。
- **讀者預設**：台灣前端 / 全端工程師，有使用 AI 工具的基本基礎，不需要解釋「什麼是 Claude Code」。

---

## Tone（語氣）

| 標籤 | 原文照引（來源） | 特徵 |
|---|---|---|
| 實踐報告 | 「這一次，我幾乎沒碰到程式碼，只測試 AI 改完的東西，花了幾個小時就把整個專案遷移完了。因為這次重構的體驗太好了，想特地記錄下來」（refactor） | 行動先行、有據可查，不抽象立論 |
| 反省誠實 | 「老實說，到現在還是會歪掉。但這幾個禮拜下來，問題的輪廓有比較清楚了。」（ai-frontend） | 承認失敗，但轉向「輪廓清楚了」而非棄坑 |
| 觀察切入 | 「最近帶同事用 Claude Code，發現大多數人用 AI 的方式都是：找到程式碼，叫 AI 改那幾行。」（stop-fixing） | 用自身觀察引入論點，不直接宣告命題 |
| 職場敘述 | 「最近與主管進行面談時，聊到了團隊成員的技術成長與 AI 協作的現況。這引發了我的一連串思考」（value） | 日常場景錨定，讓抽象命題有落地點 |
| 教學導向 | 說清楚至少要有三個東西：**你要達成什麼目的**、**相關的 context（截圖、error、檔案位置）**、**你期望的結果長什麼樣**。（stop-fixing） | 結構化拆解，偏教學 handout 語氣 |
| 謹慎推測 | 「我想說就當作用 Claude Code 做實驗，看看能不能不介入程式碼也能完成遷移，結論就是：完全可以！」（astro） | 先設框再揭果，保留「我的情況」脈絡 |

整體語氣是**溫和實踐型**：不是導師說教，不是社群八卦，不是 hype 宣傳——是一個工程師在記錄「我這樣試了，有沒有用我告訴你」。和 @gggodlin 的「直球評斷 + 黑色幽默 + PTT 語感」形成明顯差異。

---

## 句型 patterns

### 高頻可辨識句型

#### 1. 「我發現 X，後來才知道 Y」（認知轉折）

典型：「我一開始以為是模型還不夠強，後來才發現 AI 看設計稿是在讀 Figma 的節點結構，不是真的「看到」畫面長怎樣。」（ai-frontend）

Signal：10 篇中 6 篇出現類似結構（i-one-thought, then-discovered）。是他最強的論點推進方式，比直接宣告更有說服力。

#### 2. 「這兩種方式最大的差別在於…」（對比定義）

典型：「這兩種方式最大的差別在於，我的出發點是：**把需求描述給 AI，讓 AI 理解我的意圖，它才能像工程師一樣寫程式。**」（stop-fixing）

Signal：出現 4 篇。用來收斂對比段落、點出關鍵差異，語氣比「就是 A 而已」更中性、更適合說理型文章。

#### 3. 「XX，但 YY 還是要靠人」（AI 邊界確立）

典型：「AI 做不到的是：幫你想清楚你要什麼。」（stop-fixing）；「AI 會放大輸出，但掩蓋不了驗證能力的缺失」（ai-amplifies，作為標題）

Signal：出現 5 篇。他建立邊界的慣用句式，結構公式是「AI 放大了 X，但 Y 還是要人」。

#### 4. 引言 blockquote 做場景設定

典型：「> 過去一年多以來一直有這種感覺：在沒有 AI 之前，明明知道結果會長什麼樣…」（codex-goal-notes）；「> 我的觀察：積極的人輕輕一推就能衝得很遠」（value）

Signal：出現 6 篇。用 markdown blockquote 來放較濃縮的感悟或觀察，和主文的敘述 + 論點平行存在，不是主線但強化主線。和 @gggodlin 幾乎不用 blockquote 的習慣完全不同。

#### 5. 步驟拆分 + 粗體關鍵詞

典型：codex-goal-notes 的 `/goal` 操作、agents-md 的 9 項原則、refactor 的「Step 1/Step 2」流程、stop-fixing 的「Before → After」

Signal：出現 9 篇（除 astro 有段落結構但無明確步驟列）。幾乎是他最核心的組織邏輯：任何有教學意圖的段落都會拆步驟 + **粗體** 關鍵詞。

#### 6. 自我質疑 + 再回答

典型：「一行程式碼都沒碰，那前端工程師的價值在哪？」（refactor 小標）；「公司需要的是工程師，還是只是把工作做完的人？」（value 標題）

Signal：出現 4 篇（多作為 H2 標題）。用疑問句做小標，正文回答，像是有意識設計 reader journey。和 @gggodlin 在 anti-pattern 裡標記的「假對話偽蘇格拉底」有本質差異——Bolas 的疑問句是他自己真的在回答的問題，不是修辭擺設。

---

## Lead 開場

| 類型 | 例 | 來源 |
|---|---|---|
| 場景直入（觀察觸發） | 「最近帶同事用 Claude Code，發現大多數人用 AI 的方式都是：找到程式碼，叫 AI 改那幾行。」 | stop-fixing |
| 時間錨 + 情緒轉折 | 「從 2023 年第一次用 ChatGPT，到現在幾乎不手寫程式碼，我把這段轉變寫下來了」 | my-ai-coding-journey |
| 技術背景 + 情境說明 | 「最近知道 codex 有發布 `/goal` 的功能，看官方介紹是可以做比較長的任務」 | codex-goal-notes |
| 個人舊事 + 問題意識 | 「這是一個我多年前在職訓局上課時寫的番茄鐘小專案。⋯⋯這幾年來，我心裡一直有個聲音想把它徹底重構，但每次打開專案、評估完那龐大的時間成本後，就又默默地把它埋回 GitHub 的角落。」 | refactor-with-ai-agents |
| 失敗預告 | 「老實說，到現在還是會歪掉。但這幾個禮拜下來，問題的輪廓有比較清楚了。」 | ai-frontend |
| 職場情境錨定 | 「最近與主管進行面談時，聊到了團隊成員的技術成長與 AI 協作的現況。這引發了我的一連串思考」 | value |

共同特徵：**開場必有具體錨點**（人物 / 時間 / 工具名 / 場景），不以命題 / 宣言起手。和 @gggodlin 的時間錨（「最近 X」「前兩天」）類似，但 Bolas 更多是「情境描述 + 引出問題」，@gggodlin 更常是「時間錨 + 直接給結論 / 評論」。

---

## 文章長度 / 結構

實測 10 篇：

| 篇 slug | 概估字數（繁中） | 結構特徵 |
|---|---|---|
| codex-goal-notes | ~2,500 字 | 概念介紹 → 操作說明 → 適用時機 → /goal vs /plan → 格式說明 → 實作案例 → 附加工具 |
| agents-md-writing-principles | ~2,800 字 | 背景 → 定義 → 兩種層級 → 9 項原則（通用 + 使用者 + 專案層） → 小技巧收尾 |
| my-ai-coding-journey | ~1,800 字 | 年份分段敘事（2023/2024/2025/2026）→ 職業重心問句收尾 |
| refactor-with-ai-agents | ~1,600 字 | 背景（舊專案恐懼）→ 轉折（換工具）→ 步驟流程 → 重切版 → 思想轉變收尾 |
| astro-migration-6th-anniversary | ~1,200 字 | 時間導覽（關於這個 blog）→ 問題描述 → 遷移過程 → 成果（PageSpeed）→ 週年感悟 |
| stop-fixing-code-start-completing-tasks | ~1,400 字 | 場景觀察 → 核心心法 → 說清楚的定義 → AI 擅長場景 → AI 不擅長 → Before/After 框架 |
| value-of-engineer-with-ai | ~1,200 字 | 職場觸發 → 問題意識 → 「內心小劇場」對比 → Ownership 定義 → 三項自覺列表 |
| ai-frontend-development-flow | ~1,300 字 | 問題描述（AI 切版為何歪）→ 第一次進展 → 翻車 → 他人方法調研 → 無答案但有方向 |
| ai-amplifies-output-but-not-validation | ~1,100 字 | 場景描述（調教到位還不夠）→ 驗證缺口診斷 → 公司角度 → 工程師不可取代點 → 產品思維延伸 |
| claude-code-first-use | ~700 字（最短） | 猶豫 → 試用 → 爆 token → 學到 → 心態轉變 → 課程推薦 |

長度區間：**700–2,800 字，中位數約 1,300–1,500 字**。比 @gggodlin 的 800-1,500 字上限略高，主要因為他多寫教學型文章（codex-goal-notes 和 agents-md 均超過 2,500 字，但含大量 code block / table 撐字數）。

**結構慣性**：
1. 幾乎每篇都有 H2 小標（最少 3 個，多則 7-8 個），小標通常是問題 / 觀察的轉折點
2. 最後一個 H2 常是「工程師的反思 / 接下來的方向 / 結論」，提升到思維層
3. 無「省流」排序句，不做 TL;DR，讀者需要從頭看
4. code block 使用頻繁（agents-md 有大量 shell/markdown code block，codex-goal-notes 有 toml / text block）

---

## emoji / 標記使用

**幾乎無 emoji**（10 篇合計 emoji 數量極少）：
- claude-code-first-use 開頭用 `📌` 做系列文提示（1 個）
- 其餘 9 篇正文均無 emoji 出現

**無 emoji marker，與 @gggodlin 的 🤣 核心 marker 形成強對比**。@gggodlin 的 🤣 是情緒錨點 / 諷刺標記，每篇 1-2 個，已成為個人 fingerprint；Bolas 文章讀起來完全沒有這個視覺節奏。

Bolas 的「標記」手法是 **markdown 粗體** `**keyword**`：幾乎每個關鍵主張都加粗（每篇平均 5-10 處）。這是他替代 emoji 的「注意力錨點」工具。

---

## Anti-pattern（從 @gggodlin voice 角度看）

Bolas 文章出現、但 @gggodlin voice-profile.md 會 flag 的模式：

| Bolas 的寫法 | 為什麼在 @gggodlin 框架裡是 Anti-pattern |
|---|---|
| 教科書結語：「祝大家都有很好的開發體驗。」（agents-md） | voice-profile.md 明列「請參考 / 歡迎指教 / 希望本文對您有所幫助」為禁止句型 |
| 疑問句小標設計：「你在用 AI 改程式碼，還是完成任務？」 | 雖不完全是偽蘇格拉底，但頻繁使用問句小標帶教學框架，接近 voice-profile 的「假對話」anti-pattern |
| 全文幾乎無強情緒詞（無爛咖/就這/啊/啦） | @gggodlin 強情緒口語詞是核心 marker；Bolas 的中性語氣若套在 @gggodlin 身上，讀起來像換人了 |
| 無量化偏好：「花了幾個小時」「花了一週」「一個多月後」（模糊時間錨） | @gggodlin 語料顯示「必帶具體數字」：不寫「幾個小時」，要寫「1.5 小時」「6 天」 |
| blockquote 作為反思容器（6 篇使用） | @gggodlin 無此結構。blockquote 在 @gggodlin 文章等同放鬆語感的中斷，與其節奏不合 |
| 課程推薦段落（claude-code-first-use 末段） | @gggodlin 完全沒有廣告植入語氣，此段若出現會打破「直接評斷 + 不帶促銷感」的整體基調 |

---

## 可借鑑 vs 該避免（防污染）

| 值得借鑑（結構/論證手法，非 voice 層） | 中性差異（風格不同，無對錯） | 該避免（會污染 @gggodlin voice，因為⋯） |
|---|---|---|
| **「先描述失敗，再給方向」結構**：ai-frontend 整篇不給解法、只給輪廓，這種誠實比硬給答案更有公信力 | Bolas 偏長篇教學（2,500 字），@gggodlin 偏短打收尾（1,500 字） | **blockquote 作為感悟容器**：@gggodlin 沒有這個節奏元素，加進去會讓文章讀起來像另一個人寫的 |
| **認知轉折句式**（「我原本以為 X，後來才發現 Y」）：讓讀者跟著思考路徑走，比直接宣告更有說服力，可用在 @gggodlin 的技術評比段落 | Bolas 無 emoji，@gggodlin 核心 marker 是 🤣 | **教科書收尾語**（「祝大家都有很好的開發體驗」、「也歡迎大家一起討論」）：會淡化 @gggodlin 的直球語感，讀起來像 LinkedIn post |
| **失敗/翻車當成 content 主體**（ai-frontend 整篇以「還沒答案」收尾）：和 @gggodlin 的 failure-as-content 精神吻合，可強化而非借用 Bolas 的框架 | Bolas 主題集中在 AI 協作，無跨 topic；@gggodlin 技術+生活+政治都寫 | **問句小標**（「你在用 AI 改程式碼，還是完成任務？」）：頻繁使用問句小標帶教學框架，感覺像在對讀者說話；@gggodlin 的語氣是「講給自己聽、你要聽就來聽」，方向相反 |
| **「AI 邊界確立」段落結構**：明確指出「AI 做不到什麼」比只說「AI 很厲害」有更強分析性，適合 @gggodlin 在工具評比文章中補上同等分量的限制段落 | Bolas 無口語助詞（無「啊」「啦」「喔」）；@gggodlin 有明顯 PTT 語感 | **步驟型教學慣性**（所有主張都拆步驟+粗體）：適合教學文，但若所有文章都這樣排版，會把 @gggodlin 的「直接評斷」voice 稀釋成「課程講義」感 |
| **具體場景做開場錨**（觀察同事、職場面談、翻出舊 GitHub 專案）：錨點比純抽象命題更有畫面感，可學的是「找一個真實場景切入，不要直接宣告主題」 | Bolas 文末常用疑問標題問自己，再在正文回答；@gggodlin 用直球斷言 | **無強情緒詞**：若 @gggodlin 參考 Bolas 語調時不小心「文雅化」，移除了「爛咖/就這/降智/爆衝」這類詞，整篇文章的個性 fingerprint 就消失了 |

---

## Signal 強弱評估

**Signal 最強段落**：

- **句型 patterns（認知轉折 + AI 邊界確立 + 步驟拆分）**：幾乎每篇都可以找到對應例子，高頻且可回溯原文
- **Tone 的「實踐報告 vs 教學導向」對比**：在 stop-fixing、ai-amplifies、refactor 三篇都有一致展現
- **可借鑑 vs 該避免**：差異夠具體，每條都有原文支撐

**Signal 最弱段落**：

- **Lead 開場**：雖有整理出 6 種類型，但重疊度高（「場景直入」和「職場情境錨定」本質類似），10 篇中只有 3-4 篇開場有強可辨識性，其餘比較平
- **emoji 使用**：語料太稀，10 篇合計不到 5 個 emoji，只能報告「幾乎無 emoji」，無法進一步分析分布或使用邏輯

---

## 讀取狀況

10 篇均讀取成功，無失敗。所有 slug 均可透過 `gh api repos/BolasLien/blog/contents/src/content/posts/<slug>/index.md` 取得。
