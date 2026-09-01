# Tag governance YAGNI review — 2026-08-30

## 三句結論

1. 這輪審的是「值不值得做」，不是功能是否正確。
2. Gemini 與 fresh reviewer 都認為核心方案成立；兩席唯一共同要求刪除的是單次原子遷移用不到的 legacy alias 過渡層。
3. 使用者不需要再拍板：重複 story、未定價搜尋承諾與過渡機制已直接縮掉；audit manifest 缺席造成的 false flag 則改正來源標註後保留。

## 席位驗收

| 席位 | 覆蓋 | 結果 | 狀態 |
|---|---:|---|---|
| Gemini 3.7 Flash | 44／44 | keep 42、demote-v2 2 | valid |
| fresh stories | 20／20 | keep 14、demote-v2 5、kill 1 | valid |
| fresh decisions | 24／24 | keep 16、demote-v2 7、kill 1 | valid |

原始報告：

- [Gemini 完整輸出](file:///private/tmp/claude-501/-Users-linhancheng-Desktop-projects-gggodlin-blog/987ee95d-717f-41ab-ae5b-5326b5375242/tasks/bcov9uyod.output)
- [fresh stories 報告](file:///Users/linhancheng/.claude/.scratch/yagni-c-stories-987ee95d-717f-41ab-ae5b-5326b5375242.report.md)
- [fresh decisions 報告](file:///Users/linhancheng/.claude/.scratch/yagni-c-decisions-987ee95d-717f-41ab-ae5b-5326b5375242.report.md)

## 44 項逐條收斂

### User Stories

| # | 條目 | 來源類 | Gemini | fresh | 分類與作者處理 |
|---:|---|---|---|---|---|
| US1 | 精確 tag 關係 | a-user | keep | keep | 保留 |
| US2 | 搜尋涵蓋 title／description／label／alias | a-user | keep | demote-v2 | actionable：縮成維持既有 title、description、可見 label；不承諾 ID-only／alias-only |
| US3 | ID／label 可讀顯示 | b-evidence | keep | keep | 保留，來源改指 approved audit |
| US4 | 七組格式變體合流 | b-evidence | keep | keep | 保留，來源改成完整 audit manifest |
| US5 | 六寬主題只窄修 | a-user | keep | keep | 保留 |
| US6 | `Review` 改「品質與驗證」 | b-evidence | keep | keep | 保留，改用使用者已拍板來源 |
| US7 | 活詞彙表 | a-user | keep | keep | 保留 |
| US8 | 詞彙表開放作為獨立 story | a-user | keep | demote-v2 | actionable：刪除重複 story；US9／US10 與 singleton story 已涵蓋 |
| US9 | 每個 tag 有意思與邊界 | a-user | keep | keep | 保留 |
| US10 | 未登記 tag 暫停發布 | a-user | keep | keep | 保留 |
| US11 | 合法新 tag 可登記 | a-user | keep | keep | 保留 |
| US12 | 限縮 `claude-code` | a-user | keep | keep | 保留 |
| US13 | tag 與寬主題一起驗證 | a-user | keep | keep | 保留 |
| US14 | 遷移期保留 legacy aliases | b-evidence | demote-v2 | kill | actionable：刪除；最終狀態同批驗證即可 |
| US15 | 19 篇綁成單一 migration story | a-user | keep | demote-v2 | actionable：改成依 approved manifest 套用與驗算，不要求「單一遷移」 |
| US16 | singleton 不因頻率刪除 | a-user | keep | keep | 保留 |
| US17 | 產品 tag 永久與寬主題分離 | b-evidence | keep | demote-v2 | actionable：刪除獨立 story；保留 audit 指定的逐案修正，不設永久禁令 |
| US18 | 保留既有文字搜尋 | b-evidence | keep | keep | 合併進縮小後 US2 |
| US19 | 外部分母驗收 | b-evidence | keep | keep | 保留 |
| US20 | 不停在 audit | a-user | keep | demote-v2 | actionable：移到 Further Notes，因為它是執行指令而非產品行為 |

### Implementation Decisions

| # | 條目 | 來源類 | Gemini | fresh | 分類與作者處理 |
|---:|---|---|---|---|---|
| D1 | 專案 canonical registry | a-user | keep | keep | 保留 |
| D2 | 全域 kebab-case＋單數政策 | a-user | keep | demote-v2 | actionable：縮成只採 audit 明列 canonical IDs；不制定全域未來命名法 |
| D3 | frontmatter 存 ID、UI 顯示 label | a-user | keep | keep | 保留 |
| D4 | 未登記 tag 不通過 | a-user | keep | keep | 保留 |
| D5 | ID／alias 唯一解析 | c-inferred | keep | keep | 保留；移除會直接破壞精確關係 |
| D6 | dimension 只描述不改比對 | a-user | keep | keep | 保留 |
| D7 | 不設頻率與固定 tag 數 gate | a-user | keep | keep | 保留 |
| D8 | 七組格式正規化 | b-evidence | keep | demote-v2 | 題目誤讀：packet 未附 manifest；spec 改指 approved audit 完整 before／after 後保留 |
| D9 | 19 篇 article migration | a-user | keep | demote-v2 | 題目誤讀：packet 未附 19 rows；改成 evidence provenance 後保留 |
| D10 | 預設保留 singleton | a-user | keep | keep | 保留 |
| D11 | topic label／alias 窄修 | a-user | keep | demote-v2 | 題目誤讀：完整 audit 已驗證四項決策；改成 evidence provenance 後保留 |
| D12 | raw tag 不因 topic 調整消失 | b-evidence | keep | demote-v2 | 題目誤讀：完整 audit 已逐項驗證；改正來源後保留 |
| D13 | 限縮 `claude-code` | a-user | keep | keep | 保留 |
| D14 | legacy alias 相容階段 | c-inferred | demote-v2 | kill | actionable：刪除 |
| D15 | tag button 帶 ID 與 label | a-user | keep | keep | 保留 |
| D16 | tag click 精確 membership | a-user | keep | keep | 保留 |
| D17 | 搜尋擴張到 ID／label／aliases | b-evidence | keep | demote-v2 | actionable：縮成 title、description、可見 label；ID-only／alias-only 不列 v1 |
| D18 | 清 topic＋強制開搜尋區 | b-evidence | keep | demote-v2 | actionable：保留 exact tag state 與清 topic；是否開搜尋面板不列契約 |
| D19 | broad topics 非互斥 | b-evidence | keep | keep | 保留 |
| D20 | 驗證留在 repo | c-inferred | keep | keep | 保留；這是可被 build 強制的最小邊界 |
| D21 | 接進既有 content check | a-user | keep | keep | 保留 |
| D22 | 錯誤點名未知 tag 與修法 | c-inferred | keep | keep | 保留；否則 gate 不可操作 |
| D23 | 詞彙表可讀可審 | c-inferred | keep | keep | 保留；符合活詞彙表的人工治理目的 |
| D24 | 不動視覺 | b-evidence | keep | keep | 保留 |

## 分母檢查

已定價：40 篇文章、156 次指派、62 種 raw tag、40 個 singleton、54 個候選 canonical tag、7 組格式變體、19 篇受影響文章、15／62 種點擊集合不符、六個寬主題與 19 篇多主題文章。

未定價：讀者實際點擊頻率與離站影響、維護 tag 的工時、未登記 tag 造成的發布延遲、ID-only／alias-only 搜尋需求，以及遷移中間態部署風險。

結論：量測足以支撐 registry、精確 tag 點擊、既有語料遷移與 repo validation；未定價部分不足以支撐過渡相容層、擴張搜尋契約或全域未來命名法。

## 最簡版

1. 一份 repo 內人工可讀的 tag registry，包含本次必要欄位，不建立第二份人工維護真相源。
2. 依 approved audit manifest 同批更新文章與 topic references。
3. UI 從 canonical ID 取 label；點 tag 只比對 exact ID。
4. 一般搜尋保留 title、description 與可見 label，不擴張 ID／alias 搜尋保證。
5. required fields、registered IDs、ID／alias uniqueness 與 topic references 接進既有 content check。
6. 以 40 篇、19 篇變更集、canonical registry 與六 topics 驗算，再跑 browser、check、build。
7. 不建 legacy compatibility、frontend test framework、global skill 修改或視覺改版。

## 寫回 spec 的變更

- User Stories 從 20 條收斂為 15 條。
- 刪除 legacy alias 過渡 story／decision。
- 將「不停在 audit」移回 Further Notes。
- 搜尋範圍縮成 title、description、可見 label。
- 不再承諾 ID-only／alias-only 搜尋。
- 全域 kebab-case／單數政策縮成只採本次 audit manifest。
- 19 篇 migration、七組變體與 topic 窄修改成 audit evidence provenance。
- tag click 保留 exact state 與清 topic，不要求自動開搜尋面板。
- Out of Scope 明列不建 legacy compatibility layer。

## Dispute

無。所有負 verdict 都可由不改使用者核心行為的方式直接縮減；packet 缺 audit manifest 造成的 findings 已透過來源更正處理，不需要使用者重新拍板。
