# Tag governance — brainstorm residue, 2026-08-30

**The need, de-anchored:** 文章累積後，讀者需要看得出穩定的主題脈絡；作者也需要一套不靠當下直覺的分類判準。搜尋與可點擊 tag 讓既有命名直接影響閱讀路徑。

**Framing chosen:** raw tag 的首要用途是串聯同主題文章，搜尋價值其次。採用活詞彙表，記錄標準寫法、意思與近義詞，但不做封閉白名單。孤獨 tag 可以作為未來系列的種子；新 tag 允許加入，但發布前必須明確確認並登記。既有 40 篇文章的 raw tag 與首頁六個寬主題一起檢查，沒有明確問題就不重設分類。出口選擇為先做唯讀稽核，不修改文章或 code。

**Framings killed:**

- 依出現次數清理 tag：單次 tag 不等於錯誤，也可能是未來系列的種子。
- 把 raw tag 只當搜尋關鍵字：使用者已確認正式串聯同主題文章是必要用途。
- 完全維持現況：使用者選擇建立活詞彙表並盤點既有文章。
- 封閉白名單：新 tag 仍可加入，只要求發布前確認與登記。
- 只檢查 raw tag：六個寬主題與 alias 映射也納入同一輪稽核，但分開裁決。

**Audit decisions confirmed:**

- 資料 ID 與顯示名稱分離；frontmatter 使用穩定 ID，介面顯示可讀 label。
- `Review` 改為「品質與驗證」，並移除 `security`、`supply-chain` aliases；安全 raw tag 保留。
- `claude-code` 保留在既有產品專屬文章，但不再當新文章的預設 tag。
- raw tag 點擊代表同 tag／明列 alias 的閱讀關係；一般文字搜尋維持獨立入口。
- 稽核建議與完整證據見 `audit-report.md`；使用者於 2026-08-30 表示「看起來可以」，視為全照建議。

**Premises still open:**

- 活詞彙表、發布前檢查、既有文章遷移與 tag 點擊修正，應在進入 spec 時決定具體檔案與實作順序。
