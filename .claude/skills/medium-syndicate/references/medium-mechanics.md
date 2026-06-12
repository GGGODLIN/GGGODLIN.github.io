# Medium 轉發機制查證紀錄（2026-06-13）

事實基準與兩路徑對照。查證細節同步在 `docs/philip/factcheck-log.md` FC-055～061（多管道發布主題）。

## 兩條轉發路徑對照

| 面向 | 手動貼上（預設） | Import a story |
|---|---|---|
| canonical | 手動設（三點選單 → Customize canonical link） | 自動設 |
| 發布日期 | 當天 | 回溯成原文日期（backdate） |
| Medium 端分發 | 正常 | 吃虧（演算法偏好新文） |
| 程式碼區塊 | 自己重建，品質可控 | 第三方解析，大概率變形仍要重建 |
| 入口 | medium.com/new-story | 個人 Stories 頁右上角 Import a story 按鈕 |
| 每篇人工成本 | 約 10-15 分鐘 | 約 5-10 分鐘（但分發代價持續） |

預設走手動貼上；使用者明說要 import 才走右欄。

## 事實基準（含來源）

- **API 停發**：官方明文「Medium will not be issuing any new integration tokens for our API and will not allow any new integrations. All existing tokens will continue to work.」
  https://help.medium.com/hc/en-us/articles/213480228-API-Importing（updated 2024-12-17，2026-06 仍現役）
- **Import 自動 canonical + backdate**：「Using the import tool will automatically backdate the post to the original date, as well as add a canonical link」
  https://help.medium.com/hc/en-us/articles/214550207-Importing-a-post-to-Medium（updated 2026-06-05）
- **Import 走第三方解析、可能整頁失敗**：「Medium uses a third-party service to handle the technical side of importing… If the import tool is not able to interpret the page, you may see a blank page」
  https://help.medium.com/hc/en-us/articles/360033931713-Trouble-importing-content-using-the-import-tool（updated 2026-06-05）
- **手動 canonical 官方路徑**：https://help.medium.com/hc/en-us/articles/360033930293-Set-a-canonical-link（edited 2025-05）。兩篇官方文件選單路徑不一致（UI 改版中）：新版「Customize canonical link」、舊版「More settings → Advanced Settings」。驗證法＝發布後 view-source 搜 canonical。
- **原生 code block 含語法高亮**：2022 年底上線，``` 觸發、左上角選語言、無行號。支援 Bash / JS / TS / Python / Go / JSON / YAML / SQL 等主流語言。
  https://medium.com/blog/code-blocks-with-syntax-highlighting-53343df53c4f
- **編輯器不支援表格**：轉條列、段落或截圖。

## tag 對照建議

部落格 tags → Medium topics 沒有一對一映射，Medium 上五個常用且有讀者群的候選：`Claude`（或 `AI`）、`Programming`、`Artificial Intelligence`、`Software Development`、`Productivity`。繁中文章在 Medium 也可掛中文 tag（如「人工智慧」），但英文 topic 的分發池大得多。每篇從 prep 輸出的 tags 對應挑，上限 5 個。

## 已知未驗證項

- 繁中內容經 Import 工具的破損情況沒有專門報告（手動貼上路徑不受影響）
- Medium 對「貼上渲染 HTML 時 `<pre>` 是否自動轉 code block」行為不穩定，實際操作以 Step 7 重建為準
