# 方格子（vocus）：Codex 操作流程

下面的文字標籤是定位線索，不是固定 selector。每個 UI 動作仍要依主 skill 的 snapshot、唯一 locator、條件式等待規則執行。

## 平台硬規則

- 不讀取 localStorage token，也不逆向呼叫內部 API；只操作使用者已登入的 Chrome UI。
- `啟用整合網址 Beta` 仍要勾並填原站 URL，但公開頁 canonical 預期會指回方格子自己。這是已知限制，不要因此重複發布或無限排查。
- AI／工具／Claude Code 類文章分類預設選 `軟體開發`；泛科技文章才選 `科技`。
- 沒有圖片的文章選 `不使用縮圖`，避免平台預設圖。

## 建稿與內容注入

1. 在 Chrome 新分頁開 `https://vocus.cc/`。首頁出現 `註冊/登入` 就暫停；出現使用者頭像與 `創作` 才繼續。
2. 點 `創作`。若跳出手機驗證，請使用者自行完成；不要代填簡訊碼。
3. 在 `creatordesk` 選 `文章`，不要選 `貼文`。等待 URL 變成 `/new-editor/<id>`；第一下只進 hover 態時，取新 snapshot 後最多再點一次。
4. 找 `請輸入文章名稱` textbox，用 `fill()` 填完整標題，讀回值並確認分頁標題更新。
5. 以 `set-html-clipboard.swift` 載入 `paste.html`。找唯一 `[contenteditable="true"]` 內文區，點擊後再取新 snapshot，以 CUA `Meta+V` 貼入。
6. 等自動儲存，核對區塊、段落、H2、外連、首尾與佔位符。所有 href 必須是預期的絕對 URL。

## 程式碼與表格

- 程式碼：刪除單一 `⟦CODE-BLOCK-N⟧`，用編輯器的程式碼工具建立 code block，再貼入對應 `code-block-N.txt`。核對換行與全文位置。
- 表格：從已發布原站 HTML 提取對應 `<table>` 到獨立暫存檔，使用清理版剪貼簿腳本載入，選取單一 `⟦TABLE-N⟧` 後貼上。核對列、欄與表頭。
- 貼錯時先 `Meta+Z` 復原，不要 triple-click；triple-click 可能污染純文字剪貼簿或跨區塊選取。
- 完成後再次確認沒有任何 `⟦...⟧`。

## 三步發佈設定

1. 點 `準備發佈`，等待 URL 變成 `/publish-v2/<id>`；不要因第一個 snapshot 還在編輯器就重複點擊。
2. 基本設定：確認標題、選 `軟體開發` 或本文適合的分類、保留 150 字內自動摘要；無圖時選 `不使用縮圖`。
3. 進階設定：勾 `啟用整合網址 Beta`，用 `fill()` 填 prep 的 `canonicalURL`，讀回完整值。
4. 權限和狀態：保持 `免費公開`，選 `公開發佈`。
5. 點 `確認發佈`，等待 `發佈成功`；再點 `前往內容頁`，取得 `https://vocus.cc/article/<id>`。

## 公開驗證與紀錄

1. 在公開頁 driver-side 通過主流程內容硬閘。
2. 用 `curl` 把公開 HTML 下載到 `/tmp`，用 `rg` 確認標題、末段片段與 canonical。
3. canonical 預期為 vocus self；只要 UI 已存整合網址且內容完整，就視為成功。
4. 立即寫：

```text
- YYYY-MM-DD | <slug> | <vocus URL> | canonical=vocus-self（已知 Beta 不生效，全文照轉）
```
