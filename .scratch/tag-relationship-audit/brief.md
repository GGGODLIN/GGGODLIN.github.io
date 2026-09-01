# Tag relationship audit brief

## Goal

找出「從文章內容與作者意圖看起來應屬同一系列，但讀者無法透過具辨識力 tag 互相走到」的問題。

## Confirmed decisions

- 所有 tag 都可以維持 clickable。
- singleton 或孤島本身不是缺陷；獨立題材與未成熟系列種子可以合理存在。
- 不以消滅孤島或提高全站連通率為目標。
- `claude-code`、`methodology` 等泛用 tag 不足以單獨證明系列關係。
- 應先從文章內容、明文系列、互相引用與作者意圖建立「預期關係圖」，再與現有 tag 導覽圖比較。
- 真 finding 是：預期有關係，但沒有共享具辨識力 tag，或只靠泛用 tag 相連。
- 修正候選可以是合併語意重疊 tag、替文章補中層連接 tag，或保留合理孤島不處理。
- 關係圖先作為內部 audit 與 tag 品質 gate，不是公開網站功能。

## Required outputs

1. 預期系列分組，來源不能只靠現有 tag。
2. 實際 tag 關係圖，泛用 tag 必須排除或降權。
3. 預期與實際的 mismatch 清單。
4. 每個 mismatch 的根因：缺共同 tag／tag 過窄／近義詞碎裂／合理孤島。
5. 修正建議與反證條件。
6. 本地 HTML 關係圖與可排序資料表。
