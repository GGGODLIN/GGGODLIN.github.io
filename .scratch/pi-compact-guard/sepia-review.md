# Sepia Review — technical article / blog post

```
SEPIA REVIEW — technical article / blog post（原站 blog / 實驗 draft）
Loaded:
  - posts/compact-guard-v5-pi-gemini.md（標的，62 行）
  - style/experiments/v5-threads-full-line-cc-bolas.md（作者 V5 voice，Venue corpus）
  - sepia/skills/sepia/SKILL.md
  - references/professional-pass.md
  - references/domains/tech-articles.md
  - references/discourse-pass.md §1–3
  - references/style-pass.md（跳過 fiction-slop table）
  - references/model-fingerprints.md（作為先驗、不硬套）
Venue corpus: v5-threads-full-line-cc-bolas.md — 作者 V5 已驗證習慣優先於 Sepia 通用規則。
  已套用判準：單一 🤣（§7 主文 78.8% 含 emoji、🤣 佔 68.1%）＝真實習慣，不計為 AI 味；
  第一人稱、口語、技術術語（hook / session / compact / checkpoint / prompt / subagent）＝值原樣保留；
  段落長度不均＝作者長文特徵，不誤判。
```

## Failed

### F1 — 對偶框架「不是 X，是／而是 Y」簇 — cluster（中重度，段落層級處理）

命中規則：style-pass §2 syntax templates（*it's not X, it's Y*，LLM 2–5× 過度使用）+ professional-pass #8 templatedness（同一句框回收）+ **作者自己的 V5 blog 硬閘 §12.1「禁止『不是 X，是 Y』工整對偶」**。

證據（全文同一反義對偶框架 5 次）：

- 標題：「最危險的不是 AI 忘了，是你不知道它忘了」
- L17：「模型忘了東西其實不可怕，可怕的是它給出看似完整的回答時，根本沒人知道中間少了一塊。」
- L17：「現在回頭看，最危險的從來不是它忘了，而是人根本不知道它把什麼丟了 🤣」
- L53：「這個零是「恢復事件沒有真漏」，不是「原始對話每一句都完整保留」。」
- L61：「……而不是單純祈禱 AI 能在摘要後替你記住所有細節。」

為何構成 cluster：5 處命中的是同一個語法骨架，且 L17 一段之內連續兩句各自用對偶框重述同一個主張（「不可怕 vs 可怕的是」＋「不是 X 而是 Y」），兩句加標題在約 200 字內把同一反題講了三次——這是語意重複的「強調式精修」，不是主題變奏。命中 V5 自己明文禁止的硬閘，排除「作者習慣」護欄。

建議處理深度：**段落層級**。L17 收斂成一次反題陳述（三句變一句敘述句），L53／L61 兩處若保留其一、把另一處換成直述；標題保留（對偶是標題鉤子，且標題只出現一次）。不需整篇重寫。

### F2 — 收尾複述全文（reflection tail）— cluster 的一部分（中等，收尾句層級）

命中規則：professional-pass #7 conclusion residue（結尾重述）+ discourse-pass §1 reflection tail（末段回答 "what does this mean now"）+ tech-articles 表格「both-sides conclusion + future outlook」+ **V5 blog 硬閘「禁止收尾複述全文」**。

證據：

- L61：「但不管 context 變得多大，防護的核心概念都一樣：只要壓縮是不可逆的，關鍵的決策與脈絡就該有獨立存證，而不是單純祈禱 AI 能在摘要後替你記住所有細節。」

說明：「後記」段本身的素材是新的（1M context、費率連結、保留 vs 壓縮的選擇權），不是問題；問題是最後一句把全篇主張（標題的「人不知道它丟了什麼」→「獨立存證」）換句話講了一遍。句型還疊上 F1 的「而不是……」框，兩條失敗在此交會。模型指紋先驗（model-fingerprints：Gemini「tidiest endings + extended denouements」）——按指示只當待核對先驗，本篇「後記＋書本式收尾」與該先驗一致，作佐證、非新證據。

建議處理深度：**句級**。保留後記的新事實，末句落在具體狀態（例如：這套機制目前驗證到哪、什麼場景還沒驗）或真實開放問題，不再重述主張。

### F3 — 小標被首句重述 — 孤立命中（輕，免處理或微調）

命中規則：professional-pass #6 formatting tells（a heading restated by its first sentence）。

證據：

- 「## 171 次自然事件驗收，證據足夠才拍板保留」→ L51 首句「修好之後，結案前那段觀察期累積了 171 次自然事件。」
- 近命中：「## 真實流量一來，八份重複資料直接灌入」→ L43「……連續 compact 八次……一口氣灌入八份相同的恢復內容。」

為何孤立：兩處都是「小標給結論、首句帶數字/情境」，屬 announce-then-tell 的弱形式，非全文規律（§2、§3 的小標未被首句重述）。這在有自然樣本的事件型文章中是可接受的過場。

建議處理深度：免處理，或不改。若要動，只需 §5 那一句換成動作開頭（「結案前，我把觀察期資料逐一對過……」），不必全面調整。

### F4 — 節奏均勻化 — 弱命中（輕，可選）

命中規則：professional-pass #9 sameness of rhythm（段落與句子長度過於均勻）。

證據：全文 21 段中絕大多數為 2–3 句（2 句段約 12 段）；無任何一句成段的短句段；§2 五段全為同一 expository register 連續陳述。

為何孤立（弱）：相較典型 LLM 均質，本篇已有幅度（§2 最長、§3–§5 明顯縮短、最後一段極長），未達「每段等長」的機器形。但「慣性 2–3 句成段、無一句成段」是缺失的人味質地。

建議處理深度：可選。若加強，把 L43 之後某一資訊點獨立成一句段，或把 §2 其中一段切成一句；不處理不影響 verdict。

## Passed

- **#1 Chatbot residue** — 無客服腔、無問候開場、無「Let's dive in」類。
- **#2 Density** — 每段都帶具體資訊（八次、171 次、1M、JSONL、密鑰遮蔽）；無「in today's fast-paced world」級空泛句。
- **#3 Relevance** — 機制細節（PreCompact／SessionStart(source=compact)／PostCompact）是本文讀者來找的內容本身，無 scope tour。
- **#4 Stance** — KEEP 決定、零的詮釋、觀察期規矩都是明確第一人稱判斷。
- **#5 Specificity** — 數字附帶條件（171 次：排除中止與延後事件後）；泛化界線明講（「不能直接外推成所有 AI 工具都支援」）；連結（Claude Code／OpenAI Codex／OpenAI pricing）真實存在。數字本身來自 MATERIAL、為內文一致，未外查。
- **#6 Formatting（其餘）** — 無 emoji 裝飾除單一 🤣（作者 V5 確認習慣）；小標皆陳述式口語（V5 §8.5 合規）；無列表化掩飾。
- **#10 Fluency** — 全文口語可讀、可唸出；「這個零是……」為輕度抽象主語但可解析，屬 F1 對偶框的一環，不另判。

tech-articles domain rules：規則 1 開場即事故（PASS）、規則 2 有立場＋有適用界線但無讀者側 disagreement condition（部分 PASS）、規則 3 深度不均（PASS）、規則 4 數字帶條件、主張帶連結（PASS）、規則 6 第一人稱＋口語＋asides（PASS）。

## Outline / QUD 收據

**每段首句縮略清單（21 段）**
1. GPT session 推翻舊判定又 compact 後搬回舊做法
2. 不是我當場指出矛盾，結論就蒸發，靠 JSONL 關鍵句搜回
3. 直接痛點：GPT context 小、頻繁自動 compact
4. 模型忘了不可怕，可怕的是沒人知道中間少一塊
5. 不能賭運氣，動手壓縮前買保險（compact-guard）
6. PreCompact 只留使用者與助理文字，排除工具結果／subagent／系統資料
7. 接著遮掉密鑰，依六類排序去重，寫入有上限的 checkpoint
8. 原生 compact 照常執行；SessionStart(source=compact) 在 Codex 排到下一回合
9. 恢復 hook 驗四項後標「證據非指令」注入
10. PostCompact 只記數與雜湊；恢復讀壓縮前 checkpoint，不依賴執行順序
11. 邏輯共用、各 agent 接轉接層；驗過四種介面、前提是有 compact 前後 hook、不外推
12. 最易犯的毛病：捏假資料跑過就宣布大功告成
13. 開案立規矩：真實觀察期、自然樣本不足不下結論
14. 這個原則很快就發揮了作用（無人值守連 compact 八次，灌入八份）
15. 放著不管會占空間，但這是觀察期的目的
16. 修正：注入後標已使用，後續事件只留稽核紀錄
17. 結案前累積 171 次自然事件，雜湊配對，排除後無漏
18. 這個零是「沒真漏」，不是「每句都保留」
19. 不代表永遠不丟資料；但 171 次足夠做 KEEP
20. 後來用 1M context，compact 頻率大降；費率高、壓縮仍有價值
21. 不管 context 多大，核心一樣：決策與脈絡該獨立存證

**每段隱含問題序列**
發生什麼事 → 怎麼撿回證據 → 為什麼這是問題 → 真正的危險是什麼 → 那怎麼辦 → 機制怎麼運作（六步）→ 能在哪些工具上用 → 怎麼驗證才算數 → 驗證抓到了什麼 → 怎麼修 → 最後站得住嗎 → 現在還有必要嗎 → 總之（takeaway）

**機器形狀判定**
- 整體弧線 = 事發 → 意義 → 機制 → 驗證 → 反思，是 tech-articles rule 5 警告的 what→why→how→conclusion 變體，且頭尾互相書本化（L17 重述標題、L61 重述主張）。
- 首句清單幾乎構成全文乾淨摘要（outline test 機器形）；僅兩處稱代開頭（¶14「這個原則」、¶18「這個零」）脫離上下文讀不懂——這是全文僅有的人味 raggedness，其餘首句每一步都工整推進劇情。
- 缺少的 move types：無「比較」段（兩輪觀察、修前修後沒有並排對照段）、無「岔題／記憶」digression、一次「驗證／自我校正」move（¶18 對零的詮釋校正）。
- 中段（§2 五段）為單一 expository register，節奏無落差；唯一不被開場預測的事件是八份重複灌入（§4），落在中後段，是本文救節奏的關鍵。

## 非 Sepia 側註（不影響 verdict）

- L25／L29「密鑰」：台灣慣用偏向「金鑰」，建議交給專案 zhtw 支語 gate 複核，非 Sepia 判定範圍。
- V5 量化偏好（§6）：「171 次」「八次」「1M」皆精確到可驗證，符合作者語料；未見模糊時間錨。

## Verdict ######

`Verdict: cluster → refactor`