---
title: "MEMORY.md 撞 25KB 上限：三類解法的取捨與「降 size ≠ 縮敘述」"
description: "當 Claude Code 的自動記憶檔超過注入上限，有三類應對路徑。本文釐清三類解法的定義、取捨依據與決策順序，並用一次實際整理的量化數字，說明「降低檔案大小」和「削減描述」是兩個不同的操作。"
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/memory-cap-reframe-MATERIAL.md
---

# MEMORY.md 撞 25KB 上限：三類解法的取捨與「降 size ≠ 縮敘述」

撞牆當下的完整脈絡在上一篇；本篇直接進三類解法的分析。

---

## 問題是什麼

Claude Code 的自動記憶系統在每個 session 開頭把 MEMORY.md 注入 context。官方文件明訂：超過前 200 行或前 25KB（先觸發者），超出部分不載入。系統警告原文的格式如下：

```
WARNING: MEMORY.md is XX.XKB (limit: 24.4KB) — index entries are too long. Only part of it was loaded.
```

2026-05-07 實際撞牆時，MEMORY.md 是 34.7KB、118 條，超過 24.4KB 注入上限 42%。超出部分在每個 session 開頭靜默缺席，不會提示缺了哪些。

這個事實確立了後面三類解法的前提：真的有上限，超過的部分真的被截。

---

## A 類：真突破上限——不存在

最直覺的想法是「調高上限」。調查結果：這條路不通。

官方設定文件裡的三個 toggle（`autoMemoryEnabled`、`autoMemoryDirectory`、`CLAUDE_CODE_DISABLE_AUTO_MEMORY`）控制的是「開關」和「路徑」，沒有任何 size override 選項——`autoMemoryMaxSize`、`autoMemoryMaxLines` 這類設定不存在。用 `autoMemoryDirectory` 指向組合檔或符號連結（symlink），無效：上限作用在讀取 MEMORY.md 之後的截斷，符號連結只是讓一個大檔被截。

Anthropic 的態度有紀錄可查：

- GitHub issue #40614（hierarchical memory）於 2026-05-11 標記為 `CLOSED/NOT_PLANNED`
- GitHub issue #41283（orphaned memory）同樣 `CLOSED/NOT_PLANNED`
- 二進位檔裡有硬寫的提示「keep MEMORY.md under 200 lines」

以上確認：25KB 上限是刻意設計的常數，不是 bug，官方不會調整。A 類解法不存在，不需要等。

---

## B 類：旁路注入——有選項，但有明確代價

既然無法擴大上限，另一條路是繞過去：用 SessionStart hook 在每個 session 開頭把額外內容注入 context。實際載入量就變成「25KB MEMORY.md + 旁路注入的內容」。

機制上，SessionStart hook 的 `additionalContext` 欄位確實能把內容真正注入 context（而非只顯示在 terminal）。社群在 issue #40614 留言串裡也有人分享過具體工具，包含主動旁路注入設計的方案。

但這條路有幾個副作用需要正視：

**靜默截斷**：旁路能注入多少，官方沒有文件說明，我也沒有實測過；若注入量超過上限，尾段會無聲消失——本質上是把原本 25KB 的問題搬到旁路那一邊，沒有解決。

**每個 session 都生效**：包含不需要脈絡的 headless 執行（例如 `claude -p` 的本機自動化腳本），每次都注入一段脈絡，形成不必要的開銷。

**版本耦合**：hook 走哪條路徑是某個特定 Claude Code 版本的觀察結果；CC 約每兩天更新一次，機制可能靜默失效。

**失效無警示**：hook 掛掉時只有 stderr 第一行會有訊息，主流程不會感知到，需要自己另寫守護機制。

**prompt cache 破壞**：hook 輸出若夾入任何動態資訊（時間戳、git 狀態等），每次都會破壞 prompt cache；要維持 cache 命中，注入內容只能是純讀固定檔案。

B 類的結論是：有可用選項，但副作用不是小問題——靜默截斷和版本耦合兩項，等於把維護成本轉移到使用者身上，而且失效時沒有警示。在 C 類真的走完之前，B 類不值得先上。

---

## C 類：縮小需求——同樣 25KB，塞更多資訊

C 類的出發點不同：上限不變，但讓 MEMORY.md 在同樣的空間內承載更多有效資訊。

做法是群集重組：把 MEMORY.md 從平鋪條目改成「主索引 + 主題檔」的兩層結構。主索引只放指向各主題的入口（pointer），細節移到各自的主題檔（topic file）。Claude 需要時用 Read 工具按需讀入對應主題檔，不在 session 開頭一次全載。

這不是自創的做法。官方文件原文：

> Claude keeps MEMORY.md concise by moving detailed notes into separate topic files. Topic files... are not loaded at startup. Claude reads them on demand.

主題檔沒有注入上限；25KB 的空間全部留給導航索引，細節按需取用。

2026-05-07 那次整理的量化結果：

| | 整理前 | 整理後 |
|---|---|---|
| 大小 | 34.7KB | 17.7KB |
| 條目數 | 118 條 | 69 條 |
| 行數 | 132 行 | 83 行 |
| 距上限緩衝 | — | 7.3KB / 117 行 |

降幅 -49%。關鍵是：**降幅主要來自 L4 群集重組，不是 L3 改短描述的字數**。整理分四個階段，L3 是重寫 28 條過長描述（去掉冗餘、保留錨點），L4 是建 10 個群集索引並把細節下放；從各階段的 KB 變化看，貢獻最大的是 L4，不是 L3。

---

## 重新定義：降 size ≠ 縮敘述

常見的錯誤推論是：上限 25KB → 要塞更少 → 每條描述要更短。

這個推論的隱含前提是「所有資訊都必須留在 MEMORY.md 主索引裡」。一旦改成兩層結構，這個前提就不成立。

兩個操作要分清楚：

- **縮敘述**：每條 entry 字數減少，資訊本身損失
- **降 size**：整體檔案大小下降，透過把細節移位到主題檔達成

「移位」和「截斷」是不同的事。群集化之後，25KB 的空間用來放導航指針（「這個主題在哪個主題檔」），細節按需讀入。資訊總量不減，主索引變小是因為它的角色從「儲存所有細節」變成「導航到細節」。

-49% 的降幅是這個重新定義的實證：那次整理沒有刪掉任何仍在使用的知識，只是把知識的存放位置從主索引移到主題檔。

---

## 決策規則：先走 C，C 真的用盡再評估 B

「C 類用盡」的判準：

1. 同主題群的條目都已做群集抽取，細節下放到主題檔
2. 仍有超過 25KB 的條目是真的每個 session 都必須載入，而非按需讀入就夠

兩個條件都滿足，才算 C 類走完，才需要認真評估 B 類。

若真的走到 B：先實測旁路注入的實際容量（官方沒有文件，需要自己量）；加截斷守護和守護哨；設計成只對需要脈絡的 session 觸發，跳過 headless 執行；注入內容只讀固定檔案，不夾動態資訊。

A 類不考慮：窮舉確認不存在，等不到官方調整。

---

## 小結

三類解法的結論：

1. **A 類不存在**：25KB 上限是刻意設計常數，官方不修，不需要等
2. **B 類有選項，但有代價**：靜默截斷、版本耦合、失效無警示，C 類走完前不宜先上
3. **C 類是正確起點**：群集重組讓同樣 25KB 承載更多導航指針，細節按需讀入

更重要的是釐清一個前提：降低 MEMORY.md 的 size，不等於把每條描述寫短。降 size ≠ 縮敘述——前者可以透過重組結構達成，後者才是截斷資訊。這個區別決定了面對上限時，第一步該往哪走。
