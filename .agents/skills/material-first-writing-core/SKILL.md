---
name: material-first-writing-core
description: Manually run a material-first Traditional Chinese article workflow that creates a neutral evidence skeleton, obtains author approval, produces isolated style variants, compares them locally, and gives the selected draft a fresh-reader review. Use only when the user explicitly invokes `$material-first-writing-core` for a substantial article or multi-voice comparison; do not use for publishing, syndication, minor copyedits, translation, or formatting-only work.
---

<!-- 本檔在契約測試底下：.claude/skills/material-first-writing/scripts/tests/publication-boundary.test.sh -->

# Material-First Writing Core

把語氣中性的 MATERIAL 當內容單一真相源，再從同一份 MATERIAL 各自生成文體版本。不要把已發布文章、舊稿、校稿稿或任何一個文體版本當成另一版的寫作來源。

## 邊界

- 只處理目前專案與使用者明確指定的本機來源。不要讀寫 Claude memory、session、wiki 或其他隱藏個人紀錄。
- 預設只產生素材、草稿、比較頁、審閱結果與本機預覽。不要發布、轉貼、commit、push、建立 PR、覆蓋線上文章或更新任何外部服務。
- 將所有工作產物寫到使用者指定或專案既有的草稿目錄；路徑不明時先確認。不要自行移動、歸檔或刪除既有文章。
- 只把使用者指定的文章、訪談回答、專案檔案及獲准查核的第一手來源當證據。可能隨時間變動且未即時查核的主張，要標出來源日期與「未重驗」，不要寫成現況。
- 不要複製來源文章的散文句子來製造新稿。舊稿或已發布文章若獲准作參考，只抽取可追溯的事實、決策與論證結構。

## 1. 建立中性 MATERIAL

1. 盤點已授權來源，分開記錄：已驗證事實、作者陳述、推論、待查缺口與可能過時的主張。
2. 題材缺少「為什麼做、何時改變想法、取捨順序或個人體感」時，先訪問作者。只問現有證據答不出的問題；一次問一個或一小組，覆述理解並取得確認。
3. 把確認後的訪談摘要直接納入 MATERIAL，標示日期與「作者陳述」。不要另寫入 memory、session 或私有歷史檔。
4. 複製 [MATERIAL-template.md](assets/MATERIAL-template.md) 到獲准的草稿位置並填寫。保持條列、表格與中性陳述；任何有文風、情緒鉤子或成稿節奏的句子都改回素材形式。
5. 對每個事實保留來源與狀態。找不到的資訊明列缺口，不要補寫。

MATERIAL 是後續唯一內容來源。任何新確認的事實、風險處理或作者決定，都要先回填 MATERIAL，再改草稿。

## 2. 等待使用者 review gate

把以下內容呈給使用者，取得明確放行後才寫文體版本：

- 素材是否足以支撐完整文章；
- 未驗證、矛盾或敏感的主張；
- 只有作者能回答的剩餘問題；
- 所有版本都必須一致採用的取捨；
- 要比較的版本數與每版文體規格。

把使用者的拍板寫回 MATERIAL「0. 共通定調」。未放行時停在素材階段，不要先寫一版試水溫。

## 3. 產生互相隔離的文體版本

每個版本都使用使用者在 review gate 指定的完整文體規格；不要自行建立或改用摘要版、瘦身版、衍生版。文體規格只提供語氣、句型、register 與 anti-pattern，文章事實只能取自 MATERIAL。

每個版本使用一個 fresh Codex subagent；不指定固定模型。只傳給它：

1. 完整 MATERIAL；
2. 使用者指定的該版本完整文體規格；
3. 該版本的輸出路徑。

不要讓任何版本讀取已發布文章、舊稿、其他版本或先前產生的中性可讀稿。要求每版完整覆蓋 MATERIAL 的核心論證、遵守共通定調、不新增事實，並獨立回報取捨。可並行執行，輸出到不同檔案。

若 fresh subagent 不可用，先告知使用者隔離強度會降低；仍要逐版只依 MATERIAL 與當版規格寫作，不能參考已完成版本。

## 4. 比較並由使用者選版

使用內附的離線工具生成自包含 HTML：

```bash
python3 <skill-dir>/scripts/build_review_html.py \
  --root <current-project-root> \
  --out <new-local-preview.html> \
  --title "<article title>" \
  --doc "v1|<label>|<path-within-root>|primary" \
  --doc "v2|<label>|<path-within-root>|primary"
```

工具只使用 Python 標準函式庫，不要為它安裝套件。輸入文章必須位於 `--root` 內；預覽頁不使用 CDN 或網路資源。提供本機 HTML 路徑讓使用者閱讀，並等待使用者選定單一版本或明確指定混合方式。不要自行把建議版本視為最終選擇。

## 5. Fresh-reader review

使用者選版後，派一個 fresh Codex subagent 做唯讀審閱。它只能讀選定稿，不能讀 MATERIAL、文體規格、其他版本或專案背景。給它目標讀者輪廓，要求只列出：

- 看不懂或未定義的內容；
- 指涉或因果模糊；
- 不通順或資訊順序不合理；
- 前後矛盾或數字不一致。

要求每項 finding 附短片段與讀者疑問，不要直接重寫。主 agent 逐項裁決：先查 MATERIAL 與已授權來源；沒有依據就詢問作者，不要憑印象圓故事。成立的新事實先回填 MATERIAL，再依使用者授權修正選定稿。

## 6. 本機最終預覽

更新比較頁，至少並列選定稿與修訂稿，供使用者再次閱讀。若專案已有可用的本機 preview command，只有在使用者要求時才執行；不要安裝依賴，也不要把本機預覽延伸成 commit、push 或發布。

## 交付

回報 MATERIAL、各版本、比較頁與選定稿的路徑；列出 review gate 的拍板、fresh-reader findings 的處置，以及仍未驗證的主張。明確確認沒有發布、外部貼文、commit、push 或 Claude memory/session 寫入。
