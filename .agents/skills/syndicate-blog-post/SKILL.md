---
name: syndicate-blog-post
description: Publish an already-live gggodlin-blog article as a full-text cross-post to Medium, vocus, or both through the user's authenticated Chrome, then verify canonical and content integrity and update docs/philip/syndication-log.md. Use when the user says 分發, 轉發, 同步到 Medium or 方格子, cross-post, or invokes $syndicate-blog-post after the GitHub Pages original is live. Do not use for initial publication, social-summary posts, editing an existing cross-post, or without current-turn authorization to publish externally.
---

# 部落格全文分發

把已在 GitHub Pages 上線的文章全文分發到 Medium、方格子或兩者。這是 Codex 的執行版本；只共用 `.claude/skills/medium-syndicate/scripts/` 下三支平台無關腳本，不要把 `.claude/**/SKILL.md` 當本流程的操作指令。

## 授權與渠道

- 只在使用者本回合明確要求分發，或對「現在要轉發到 Medium／方格子嗎？」明確回答同意後發布。這個 skill 不擴張外部寫入權限。
- 使用者只指定一個平台時只做該平台；在本專案只說「分發」「都發」時，依專案慣例做 Medium 與方格子。
- 使用者只問狀況、流程或可行性時維持唯讀，不建立草稿、不發布。
- 不修改原站文章、不走社群摘要貼文、不用 Import a story，除非使用者明確改變要求。

## 1. 解析目標並防重複

1. 從目前對話取得 slug；slug 必須對應 `src/content/blog/<slug>.md`。只有篇號而上下文不足時，查正式文章與近期 commit 後確認，不要猜。
2. 按平台分別檢查 `docs/philip/syndication-log.md` 的 `## Medium` 與 `## 方格子（vocus）` 段。已記錄的平台直接回報既有 URL，只執行缺少的平台。
3. 在建立任何 Medium 草稿前，讀取 `docs/philip/syndication-log.md` 的 `## Medium` 段，執行本機 24 小時發布 gate：
   - 只計算含 `publishedAt=<ISO-8601 timestamp with offset>` 的成功紀錄；只有日期的歷史紀錄不回推、不猜時間。
   - 計算目前時間往前 24 小時內的 Medium 成功發布數。
   - 若已有 2 篇，停止 Medium 流程，不建立或按下新的最終發布；回報 `MEDIUM_COOLDOWN`、兩筆 `publishedAt` 與 `cooldownUntil`。`cooldownUntil` 是這兩筆中最早時間戳加 24 小時，因為那時第一篇才離開窗口。
   - 若少於 2 篇，照常繼續；方格子流程不因 Medium gate 自動取消。
4. 先跑一次：

   ```bash
   node .claude/skills/medium-syndicate/scripts/medium-prep.mjs <slug>
   ```

   保留輸出的 `title`、`description`、`tags`、`canonicalURL`、`outDir` 與 `risks`。
5. 用 `curl` 確認 `canonicalURL` 回應 200，並把 HTML 下載到 `/tmp` 後用 `rg` 確認 server HTML 的 canonical 自指。網路在 sandbox 失敗時，依權限規則直接重跑 escalated，不要把 DNS 失敗誤判成原站下線。
6. 任一上線檢查失敗就停止；不要先建外部草稿。

## 2. 準備貼上內容

執行：

```bash
node .claude/skills/medium-syndicate/scripts/medium-paste-html.mjs <slug>
```

記下 `paste.html` 的段落數、標題數、佔位符數與檔案路徑。再從 `paste.html` 取得最上層內容區塊數、外連數、首段與末段，形成發布前後都要比對的內容簽章；`paragraphs + headings` 只適用於沒有引用等其他區塊的簡單文章。

- Medium 有表格時，先把表格改寫成條列或段落並讓使用者拍板；未拍板不要發布。
- 有程式碼、表格或圖片時，先說明要逐塊重建或上傳；沒有這些風險就直接繼續。
- 檢查所有 `<a href>`。相對連結先轉為 `canonicalURL` 所在原站的絕對 URL，避免方格子解析到自己的網域。
- 不要為分發改寫原始 Markdown；平台專用改寫只存在 `/tmp`。

把 HTML 載入系統剪貼簿時優先使用本 skill 的清理版腳本：

```bash
swift .agents/skills/syndicate-blog-post/scripts/set-html-clipboard.swift <outDir>/paste.html
```

它同時清除舊內容並設定 HTML 與一個空白純文字 fallback。Swift 不可用時才退回：

```bash
bash .claude/skills/medium-syndicate/scripts/clipboard-html.sh <outDir>/paste.html
```

## 3. Chrome 執行契約

1. 使用 `chrome:control-chrome`，依該 skill 建立或重用 Chrome browser-client。不要改用 in-app browser、獨立 Playwright server、Chrome DevTools MCP 或讀取 cookie／localStorage。
2. 開始前告知使用者暫時不要操作 Chrome 或複製內容，避免焦點與剪貼簿被搶走。
3. 每次 `click`、`fill`、`press` 或 CUA 鍵盤動作前都要：
   - 取得新的 DOM snapshot；
   - 從 snapshot 建立 locator；
   - 查 `count()`；
   - 只有 count 恰好為 1 才動作。
4. 標題、canonical、摘要等一般欄位優先用 locator `fill()`，填完立即讀 DOM 驗證完整值。不要把原 CC 流程的 raw `type` 當預設。
5. 富文字內文才使用系統剪貼簿：先點唯一的編輯區，再取一次新 snapshot，最後用 CUA `Meta+V`。`locator.press("Meta+V")` 不等同作業系統貼上，不要使用。
6. 每次導航或發布都等待 URL、成功文案或按鈕狀態改變；固定 sleep 只能當短暫 settling，不能當完成證據。
7. 只用 driver-side evaluate 讀取 title、canonical、區塊、連結與文字；不要用 evaluate 模擬 UI 寫入。
8. 遇到登入、CAPTCHA、手機簡訊或一次性驗證時停止，請使用者在 Chrome 完成後回覆。不要代填帳密或驗證碼。

## 4. 內容完整性硬閘

在編輯器內與公開頁各驗一次：

- 標題完全相同；
- 最上層內容區塊數與 `paste.html` 相符；段落與標題數另做 sanity check，引用或平台包裝造成的差異要逐項說明；
- 標題層級數、外連數與 `paste.html` 相符；
- 首段與末段完整；
- 所有內部連結仍指原站；
- 沒有 `⟦CODE-BLOCK-N⟧`、`⟦TABLE-N⟧`；
- 沒有存檔錯誤或截斷。

Medium 自動把數字範圍換成 en dash、替破折號加細空格等純排版正規化可以接受，但要在驗證結果中說明。任何內容缺漏都先修正；修不好就保留草稿並停止，不發布殘稿。

## 5. 平台流程

- 執行 Medium 時完整讀取 [medium.md](references/medium.md)。Medium canonical 是發布成功的硬閘。
- 執行方格子時完整讀取 [vocus.md](references/vocus.md)。方格子整合網址要填，但公開頁 canonical 自指是已知 Beta 限制，不是硬閘。
- 兩平台都做時按 Medium → 方格子順序。每個平台公開驗證完成後立刻寫紀錄，不要等另一平台也成功才落檔。

## 6. 暫停與續接

- 預期要請使用者登入前，先在 commentary 記錄平台、slug、草稿 URL／ID（若已存在）與最後完成的步驟。
- 新回合不要信任舊 tab handle。重用既有 browser binding，重新列出分頁；找不到就開新分頁並導航到紀錄的 URL 或平台首頁。
- 續接時先重跑該平台的防重複檢查，再確認登入與目前頁面狀態。已公開且已記錄的平台永不重發。
- 如果只完成 Medium，就先記 Medium；方格子登入後從方格子步驟開始，不重建 Medium 草稿。

## 7. 紀錄、收尾與回報

使用 `apply_patch` 更新 `docs/philip/syndication-log.md`，再用 `rg` 回讀。不要 stage、commit 或 push；這個個人紀錄可能被 gitignore。

- Medium 成功發布並完成公開頁驗證後，該筆 Medium 紀錄必須追加 `publishedAt=<目前時間，含時區 offset>`；只有完成這個紀錄才算本機 gate 的成功發布。

完成所有瀏覽器驗證後，保留公開文章頁為 deliverable 並執行 Chrome tab finalization；finalize 後不要再呼叫瀏覽器。

最後回報：原站、各平台可點擊 URL、每個 canonical 的實際值、區塊／標題／外連／佔位符驗證、跳過或暫停的平台，以及分發紀錄是否已寫入。
