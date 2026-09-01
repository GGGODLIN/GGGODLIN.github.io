# 寫作任務：Claude Code＋Gemini Flash × V5

用指定文體規格，從語氣中性素材骨架整篇重寫一篇繁體中文文章。

輸出：`/Users/linhancheng/Desktop/projects/gggodlin-blog/posts/compact-guard-v5-cc-gemini.md`

## 兩個內容輸入

1. 唯一內容來源：`/Users/linhancheng/Desktop/projects/gggodlin-blog/posts/compact-guard-MATERIAL.md`
2. 完整文體規格：`/Users/linhancheng/Desktop/projects/gggodlin-blog/style/experiments/v5-threads-full-line-cc-bolas.md`

只能從 MATERIAL §3「文章脊柱」與 §3.1「事實護欄」取正文內容。§5 證據庫與 §5.1 旁支發現禁用；§5.2 只供取已查證公開連結，不構成新增內容。

禁止讀已發布成稿、任何舊 draft、`compact-guard-v0-pure-ai.md`、採訪檔、factcheck-log、repo 原始資料或其他 voice 版。你是從 MATERIAL 骨架重寫，不是改寫現成文章。

完整 V5 裡的 Identity、LINE、CC 與原始引文只供判斷文體，不是文章素材。`[群內限定]`、`[AI 對話限定]` 與散文式「blog 套法：不適用」全部禁搬；未標示可公開的 LINE／CC 條目預設禁用。正文事實只能取 MATERIAL §3／§3.1。

## 內容定調

- 標題：`最危險的不是 AI 忘了，是你不知道它忘了`
- 開場從事故現場開始：模型已推翻判準，compact 後卻重新採用舊判準。
- 哪個 agent 實作不重要，不形成段落。
- 共用機制不綁特定 agent，但只驗證四種介面。
- 當年直接動機是頻繁自動 compact；「人不知道自己失去了什麼」是今日回看，時點分開。
- `compact-guard` 名稱已核准公開；第一次出現明寫是作者自製的 private 機制，不附 repo URL。
- 重複恢復缺陷沒有使作者動搖；作者將它視為觀察期抓到真問題。
- 當日結案理由是證據已足夠。
- 1M context 只在結尾短提，不展開產品比較。
- pricing 只可寫「long context 的 API 費率較高」，不得寫倍率，不得推論 ChatGPT 或 Codex 訂閱額度。
- 「真實恢復內容遺失為零」只指當時封存觀察窗，不是永久保證。

## 數字

正文只准使用 MATERIAL §3 核准的精確值：171、八份、1M。不得使用 90/90、84/84、commit 數、時間戳、現行 audit 數字、pricing 倍率或其他精確數字。

## 公開資訊邊界

- 官方文件、公開 repo 與公開文章可具名並附 MATERIAL §5.2 已查證連結。
- compact-guard 是 private 機制，只保留名稱，不附 URL。
- private URL、commit、本機路徑、內部檔名、branch、ticket、FC／PR／Phase 代號一律不得出現在正文。
- Frontmatter 的 `source` 可保留 MATERIAL 相對路徑。

## 第一人稱分離

「我」只能是做判斷、記得結論、決定建立機制與拍板 KEEP 的作者。搜尋、讀檔、執行測試、寫 code 等 agent 行為不要冒充作者親手做；素材沒有指定執行者時，用中性句型。

## 反晶晶體與台灣用語

不翻清單：hook / skill / agent / subagent / MCP / slash command / command / CLAUDE.md / workflow / harness / context / session / prompt / token / commit / API / PWA / cron / embedding / RAG / baseline / repo / PR，一律保留原文。

不翻清單以外，形容詞、動詞、抽象概念詞能自然翻成中文就翻；一句內三個以上該翻未翻的英文詞必須重寫。

中國大陸用語改成台灣慣用語：質量→品質、數據庫→資料庫、軟件→軟體、硬件→硬體、調用→呼叫、緩存→快取、視頻→影片、默認→預設、信息→資訊、運行→執行、屏幕→螢幕、激活→啟用、智能→智慧、用戶→使用者、網絡→網路、字符→字元、接口→介面、文檔→文件、菜單→選單。

## 寫作要求

- 嚴格使用 V5 的開場、句型、段落、小標、語氣、收尾與 anti-pattern。
- 涵蓋 MATERIAL §3 七項文章脊柱；§3.1 只在相關主張出現時壓成一句護欄。
- 不因篇幅還有空間，就從 §5 或 §5.1 補內容。
- 作者原始 prompt 不逐字入文，只改寫轉述。
- 每個概念在被倚靠前先接地；讀者不知道作者內部工具。
- 自然長度，不灌水，不用收尾複述前文。

## Frontmatter

```yaml
---
title: "最危險的不是 AI 忘了，是你不知道它忘了"
description: "請依完成文章寫一句不誇大的摘要"
voice: v5-cc-gemini
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/compact-guard-MATERIAL.md
---
```

## 執行與回報

先完整 Read 兩個輸入，再用 Write 建立輸出檔。不得停在「準備寫」。完成後回報：輸出路徑、字數、七項脊柱對帳、使用的 §3.1 護欄、使用數字與承重理由、反晶晶體修正、公開資訊邊界自檢、是否讀到禁止來源或取用 §5／§5.1（應為無）。
