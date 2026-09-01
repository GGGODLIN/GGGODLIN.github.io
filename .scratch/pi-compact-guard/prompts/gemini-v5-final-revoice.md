# 寫作任務：Gemini 3.7 Flash High × pi × V5 最終語感修復版

請重寫一篇繁體中文技術部落格文章，輸出到：

`/Users/linhancheng/Desktop/projects/gggodlin-blog/posts/compact-guard-v5-pi-gemini-revoice.md`

## 唯二內容輸入

你只能讀以下兩個檔案，不得讀其他 draft、MATERIAL、已發布文章或 voice profile：

1. 目前最終版：`/Users/linhancheng/Desktop/projects/gggodlin-blog/src/content/blog/compact-guard.md`
2. 完整 V5 文體規格：`/Users/linhancheng/Desktop/projects/gggodlin-blog/style/experiments/v5-threads-full-line-cc-bolas.md`

這次不是審稿，也不是局部潤飾。後段修正多由 GPT 驅動，句子逐步變得過度端正，作者語感被沖淡。請把目前最終版當成唯一事實與內容準據，把完整 V5 當成唯一語感準據，重新寫出一個完整版本。

## 內容硬約束

- 保留標題：`最危險的不是 AI 忘了，是你不知道它忘了`。
- 保留目前最終版的所有重要事實、因果、數字、限制與公開連結，不新增任何事實。
- 不得改變下列承重口徑：
  - 當年直接問題是 GPT 可用 context 較小，頻繁自動 compact。
  - `compact-guard` 是未公開、跨介面共用的機制，不綁特定 agent。
  - `PreCompact`、`SessionStart(source=compact)`、`PostCompact` 的資料流與職責不得寫錯。
  - 金鑰永久遮蔽，checkpoint 有長度上限。
  - 當時驗證的是 Claude Code 兩種模型接法，以及 OpenAI Codex CLI 與 Desktop，共四種介面；不得外推所有工具。
  - 八份重複內容發生於 Codex Desktop 長 session 連續 compact 八次。
  - 171 是自然派送的 hook 事件列，不是 171 次獨立壓縮。
  - 「沒有真漏」只指已完成壓縮中，沒有 checkpoint 應注入卻漏掉的事件；不代表原始對話逐句完整保留。
  - 1M context 是後來的發展，只能放在後記，不得搶走主軸。
- 可以重排句子與段落，也可以換掉目前的比喻與連接語，但不能刪掉上述內容。
- 不加入 private URL、repo、commit、本機路徑、內部識別碼、工作流程代號或個人敏感資訊。
- 第一次具名 Claude Code、OpenAI Codex、OpenAI API 費率時，沿用目前最終版已查證的公開連結。

## 語感目標

- 不是把 V5 特徵機械塞滿，而是讓文章重新像作者本人寫的。
- 開場維持具體事故，不用抽象宣言起手。
- 句子可更直、更有判決感，不必每段都解釋得四平八穩。
- 保留作者會用的虛詞、反諷、自嘲與畫面感；emoji 全篇最多 1 個，優先使用 🤣。
- 技術細節仍要讓圈內讀者看得懂，但不要寫成規格書、驗收報告或 AI 教學文。
- `##` 小標維持 5–8 個，使用口語陳述句。
- 收尾停在具體現況或作者態度，不總結全文，不用問句收尾。
- 禁止「不是 X，是／而是 Y」工整對偶。
- 破折號預設不用，全篇最多 1 個。
- 不要出現「這一段是核心」「本篇最重要」「反直覺」「值得一提」「綜上所述」等 AI 文章語氣。
- 不要為了看起來專業，把作者的直球語氣改成中性公文。

## 輸出格式

輸出檔 frontmatter 固定為：

```yaml
---
title: "最危險的不是 AI 忘了，是你不知道它忘了"
description: "記錄一次 GPT 自動壓縮丟失關鍵結論的事故，以及如何透過自製跨介面存證機制在自然事件中完成驗證與保留。"
voice: v5-pi-gemini-revoice
status: 實驗 draft（以最終版事實為準，重新套 V5 語感）
source: src/content/blog/compact-guard.md
---
```

frontmatter 後直接寫正文，不重複 H1。

## 反晶晶體 verbatim 規則塊

產出物本質是中文寫作，中文品質是第一級正確性；分析/書寫中文的文件本身有晶晶體 = 自我矛盾的嚴重缺陷。

> **不翻清單（最高優先，先查這條再查下一條）**：下列詞一律用原文，**不套用下面「能翻就翻」的判定方式**。
> - Claude Code 生態：hook / skill / agent / subagent / MCP / slash command / command / CLAUDE.md / workflow / harness / context / session / prompt / token / commit
> - 通用技術：API / PWA / cron / embedding / RAG / baseline / repo / PR
> - 為什麼不翻：本 blog 的讀者是這套工具的實際使用者，這些詞在他們的社群裡是原生詞彙，中譯版本沒有人在用。讀者看到「強制執行的掛載點」得先反推回 hook 才看得懂——硬翻在這裡是提高門檻，不是降低門檻。
> - 清單詞被翻成中文 ＝ 缺陷，改回原文。與下面任何規則衝突時，本清單優先。

> **用詞禁則：不用「判準」**。這是 AI 常見用語；依語境改用「判定」「判斷標準」「選用條件」等自然說法。

> 反晶晶體（**不翻清單以外**才適用）：能翻成中文的英文詞就翻，避免「中文裡塞英文當酷詞」。
> - 也可留英文：引用使用者本人用的英文詞；引用句裡的原文。
> - 該翻成中文：形容詞 / 動詞 / 抽象概念詞。範例：spark joy → 觸動、core → 核心、audience → 受眾、reframe → 重新定義、killer → 致命、nudge → 引導、explore → 探索、bootstrap → 啟動、critical mass → 臨界數量。
> - 判定順序分兩步：①這個詞在不翻清單裡嗎？在 → 用原文，到此為止。②不在 → 再問「翻了會不會更自然？」會 → 翻。
> - 量化下限：一個句子內夾三個以上「該翻沒翻」的英文詞 = 晶晶體，重寫。

> 台灣用語（繁中在地化，與反晶晶體並列的硬閘）：中國大陸用語一律改成台灣慣用語。
> - 必改（明確陸語）：質量→品質、數據庫→資料庫、軟件→軟體、硬件→硬體、調用→呼叫、緩存→快取、視頻→影片、默認→預設、信息→資訊、運行→執行、屏幕→螢幕、激活→啟用、智能→智慧、用戶→使用者、網絡→網路、字符→字元、接口→介面、文檔→文件、菜單→選單。
> - 看語境：「程序」指 process 用「行程」、指 procedure 用「程序」；「數據」台灣科技業可用但偏好「資料」（如「採用數據」→「採用數字 / 採用情況」）。
> - 判定方式：寫完反問「這個詞是台灣慣用還是中國大陸慣用？」陸語就改。
> - 背景：opus 4.8 起陸語滲透明顯變嚴重，繁中輸出（尤其 blog / 公開文件）務必逐句掃。

交付前自己掃一遍全文，違反處就地重寫。完成後只回報輸出路徑，以及你主動改掉的中英混用與台灣用語問題；不要在聊天回貼全文。