# Medium：Codex 操作流程

下面的文字標籤是定位線索，不是固定 selector。每個 UI 動作仍要依主 skill 的 snapshot、唯一 locator、條件式等待規則執行。

## 平台硬規則

- 每個帳號 24 小時最多發布或排程兩篇；遇到限制就保留草稿並排隊，不要繞過。
- 預設手動建立新 story，不走 Import a story。Import 會回溯發布日期，且程式碼格式不可控。
- 發布前必須成功設定原站 canonical；發布後必須在瀏覽器 driver-side 再驗一次。
- Medium 對命令列抓取不穩定，公開頁 canonical 以瀏覽器渲染後的 `link[rel=canonical]` 為準。

## 建稿與內容注入

1. 在 Chrome 新分頁開 `https://medium.com/new-story`。若是登入頁，依主流程暫停。
2. 等編輯器出現後，從 snapshot 找標題欄。用 `fill()` 寫入 prep 的完整標題，立即讀回標題並等待 URL 變成 `/p/<id>/edit`。若值或 URL 未成立，重開一個新 story 分頁只重試一次；仍失敗就停止，不要以隨機字元反覆喚醒。
3. 重新用 `set-html-clipboard.swift` 載入 `paste.html`。從 snapshot 找唯一內文 surface，點擊後再取新 snapshot，以 CUA `Meta+V` 貼入。
4. 等自動儲存完成，核對標題、區塊、標題層級、外連、首尾、佔位符與錯誤 banner。第一段若被吸進標題，清理草稿並重新建稿，不要增量硬修。
5. 若有程式碼，以原生 code block 重建並核對語言；若有表格，使用已經使用者拍板的條列／段落版本替換。未完成逐塊驗證不得發布。

## canonical 硬閘

1. 從編輯器的三點選單進入 `More settings`。
2. 找頁面下方預設收合的 `Advanced Settings`，先展開，再找 `Customize Canonical Link`。
3. 勾選 `This story was originally published elsewhere`。
4. URL input 若 disabled，先按 `Edit canonical link`；可編輯後用 `fill()` 覆蓋成 prep 的 `canonicalURL`。
5. 按 `Save canonical link`，等待 `Canonical link successfully updated`，並讀回欄位值。未出現成功訊息就停在此處排查，不進發布。

## topics 與發布

1. 按 `Publish` 進發布設定。
2. 從 prep tags 選最多五個 Medium topics。技術文章優先考慮 `Claude`、`Artificial Intelligence`、`Software Development`、`Programming`、`Productivity`，但要依本文內容取捨。
3. 每個 topic 都個別填入、按 Enter，等待 chip 出現後才處理下一個。檢查自動完成沒有換成語義誤導的 topic。
4. 確認 canonical 提示仍在，再按最終 `Publish`。等待成功頁，取得 `/p/<id>` 或作者文章 URL。

## 公開驗證與紀錄

在公開頁 driver-side 讀取：

- `link[rel=canonical]` 必須完全等於原站 URL；
- H1、區塊數、標題數、外連數、首尾與佔位符狀態必須通過主流程硬閘。

canonical 不符時回到設定修正，不要留下 `canonical=ok` 紀錄。全部通過後立即寫：

```text
- YYYY-MM-DD | <slug> | <Medium URL> | canonical=ok
```

若 Medium 顯示 24 小時上限，把草稿 URL 與待發布日期記到 `docs/philip/medium-publish-queue.md`，並清楚回報尚未公開。
