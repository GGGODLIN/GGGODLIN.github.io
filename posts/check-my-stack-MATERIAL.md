---
doc: MATERIAL（語氣中性素材骨架）
article: 工具評估方法論總綱：inventory-first ÷ 既有成熟度框架
status: voice-neutral skeleton — 之後 N 個文體版本的單一共同起點
series_role: 「工具評估系列」總綱——框架先行，個案細節留給已發布與後續文章
fact_authority:
  primary:
    - "方法本體：~/.claude/skills/check-my-stack/SKILL.md（流程 6 步、治理鐵律、anti-pattern、與兩個姊妹判準的分工）"
    - "輸出契約：~/.claude/skills/check-my-stack/references/output-template.md（四區塊+判決、表格寬度紀律）"
    - "個人先例紀錄：~/.claude/memory/feedback_competitive_analysis_check_own_stack_first.md（precedent log 19 條 + 7 段可泛化校準洞察 + skill TDD meta 發現，2026-06-11 讀取時點）"
  secondary:
    - "~/.claude/memory/_index_tool_eval_outcomes.md（具體工具否決負結果 cluster，與 precedent log 部分重疊、範圍不同）"
    - "~/.claude/memory/_index_tool_adoption_discipline.md（姊妹紀律：裝不裝 / agent-in-loop / revealed adoption 等）"
    - "docs/philip/blog-candidates-v3-2026-05-29.md：#33 主條目與升級段、#63 撤回復盤（2026-06-04）"
    - "docs/philip/factcheck-log.md：FC-015（星數動態、查證日紀律）、FC-016/FC-025（宣稱 vs 實測差量級，屬第七篇主軸、本篇僅引口徑）"
---

# 工具評估方法論總綱：inventory-first ÷ 既有成熟度框架 — 純素材骨架

> 硬約束：本檔語氣中性。只有事實、論證結構、證據、骨架。任何一句像成稿／帶情緒 = 違規，改回大綱式。
> 本篇是系列總綱：案例不逐個展開，挑代表案撐論點，其餘清單帶過，給後續文章留空間。

---

## §0 定調（N 版共同起點，牴觸時以本段為準）

### 本篇定位（鎖死）

- 主軸 = 評估方法論本身：先盤點自己已有什麼（inventory-first）→ 把工具賣點逐點除以既有成熟度 → 多數商數塌縮到零，因為個人 stack 已是這些工具的超集。
- 本篇是「工具評估系列」的總綱。框架是主角，個案是配角：
  - 代表案固定 2-3 個（見 §3 Beat 1 / 5 / 6），其餘以清單一筆帶過。
  - 採用率（agent 會不會主動用工具）深講留給已發布第六篇 code-search-adoption，本篇只在「盤點要看採用率」處點到。
  - 省 token 工具的宣稱 vs 實測細節留給已發布第七篇 token-saving-tools。
  - mempalace 親手退役的完整故事是已發布第一篇 retire-vector-memory，本篇不重講，只當「親手案例稀少」的註腳。
  - 「否決後拆什麼帶走」（偷確定性層、三題篩選法）是登記中的候選 #74，本篇只在殘值段點概念、不展開三案。
  - 「怎麼量 revealed adoption」是登記中的候選 #73，本篇不展開量法。

### 誠實界定（必入正文，三條）

1. **這套方法多數時候是「紙上評估」紀律**：讀文件、讀原始碼、查 repo 健康度後判斷，不裝。多份評估 memory 明文「Do not install」。親手裝過再下結論的是少數例外（見 §4 F-09）。不可把「否決 N 個」寫成「踩坑 N 次」——這正是 #63 撤回的教訓（§4 F-12）。
2. **「我的 stack 已是超集」這個前提不是人人成立**：SKILL.md 的解釋是——通用工具解決的是大眾市場的痛點「沒有紀律化的個人基礎設施」。對基礎設施還在起步的讀者，除數（既有成熟度）小，商數就大，同一個工具可能真的有用。框架本身（先盤點、再相除的順序）仍然適用，只是結論分布會不同。
3. **框架不是否決機**：收斂判決有三種——可改變 stack 的候選 / 只剩薄殘值 / 競品觀察。先例裡存在非塌縮案（部分採用、偷架構、條件採用），見 §4 F-08。

### 計數紀律（N 版一律遵守）

- 任何「否決了 N 個工具」的數字必須帶範圍定義與時點：
  - precedent log（feedback_competitive_analysis_check_own_stack_first 內表格）= 19 條（2026-06-11 讀取時點）。
  - blog 候選檔 #33 升級段寫「14 個」是 2026-06-04 時點快照，且其名單混入了 precedent log 以外的 outcomes cluster 條目（如 supermemory、awesome-harness）——兩個清單範圍不同，不可互相充數。
  - 建議寫法：用帶時點的明確範圍（「截至 2026-06-11，先例紀錄累積 19 案」），或量級描述（「近二十個」），不可揀大數字。
- 「LLM 整併式記憶工具同軸否決次數」在各條 memory 裡隨時間遞增（4 次 → 6 次 → 8 次 → 12/13 次），引用必須帶該條的評估日期，不可拿最新計數安在舊案上。
- 星數是動態值：precedent log 記載的星數是各評估日的時點值（且 FC-015 實證 codegraph 三週 1,110→33,927 量級漂移）。寫作用「評估當時約 X 星」或量級描述，發佈前不另行重查就不寫精確當前值。

### Review gate 定調（2026-06-11 使用者拍板，N 版一律遵守）

- **鉤子＝誠實版**：「絕大多數塌縮到零＋少數薄殘值」，不寫「全部否決」；「框架不是否決機」本身當論點用（Beat 9）。
- **計數＝量級描述為主**：正文用「近二十案」，全文只在一處關鍵點帶精確數＋時點（「截至 2026-06-11 共 19 案」），發佈前重數一次 precedent log 當日條目再定稿該數字。
- **check-my-stack skill＝發佈前開源**：文章具名提到時附真連結。發佈前工項：(1) skill 內個人路徑／公司資訊脫敏 (2) 推上 GitHub 公開 repo (3) 文內連結以實際 repo URL 為準（寫作階段可用佔位 `https://github.com/gggodlin/check-my-stack`，發佈前以實際開源位置覆核）。
- **G-3 四工具 URL**：走查證補齊路線（查證結果見 §5 連結段更新與 factcheck-log），查不到實際 repo 的該案在正文不具名展開。

### Phase 1.5 校稿定調（2026-06-11，N 版一律遵守）

- **計數三層口徑（FC-053＋FC-054，寫錯＝嚴重錯誤）**：「近二十案」**不是評估總量**，是金字塔最深一層。三層：(1) 日常快篩——每天數次、多數第一眼出局不留紀錄；(2) 留檔深評——約五週 60+ 個具名工具（含 landscape 成員破百）；(3) 走完整 check-my-stack 框架——precedent log 19 案。正文寫計數必帶層名限定詞；三層金字塔結構本身可入文（高頻快篩正是需要這套框架的原因），可用對比「五週留檔六十多個、值得走完整框架的不到二十個」。
- **白話鐵律（PR-038）**：「商數／除數／分子／塌縮」是本骨架的內部分析術語，**正文禁用**。概念改日常語言：「先看你手上已經有什麼，工具剩下能給你的往往不多」「你已經有的越多，新工具能給的越少」「剩不到什麼」。若文體需要可重複的記憶點，允許第一次出現處用白話定義一次再沿用，預設整篇白話。MATERIAL 各 beat 內的術語照舊（分析精確用），寫作 agent 轉譯。

### Phase 5 校稿定調（2026-06-11 V3 拍板時新增，後續修潤一律遵守，牴觸前面各段以本段為準）

- **星數不著墨（PR-039）**：具體星數、星數打折規則、成長駭客訊號、星數漂移案例（F-11／F-12、graphify 六週、codegraph 1,110→33,927）全部不入文——避免「暗示專案刷星」的得罪人風險。健康度訊號保留 commit 集中度、商業漏斗。反面清單刪「星數當能力證據」條。
- **用詞（PR-040）**：「硬閘」→「硬性門檻」。
- **#63 不入文（PR-041）**：選題登記／撤回／候選編號是私人規劃，不提。Beat 10 改寫成「差點把同軸否決計數寫成戰績」的第一人稱反省。
- **TDD 術語白話（PR-042）**：「紅綠測試／紅燈基線」改對照實驗講法（「把 skill 拿掉看會不會退回老路，測不出差別」）。

### Phase 6 localhost 校稿定調（2026-06-11，PR-043 九點，正稿已套）

- 用詞：「錨定→吸引」「剩不到什麼→不剩什麼」「常駐控制平面→背景常駐的管理服務」；刪「省流：」（與標題重複）與「鐵律一句話：」（名實不符）前綴；小標「先例紀錄→紀錄」。
- 結構：「真缺口兩個彎」與「數字要誠實」兩段整段重寫——一個論點一段、因果完整句講滿，不用「第一…第二…」單段擠壓；「數字要誠實」開頭改第一人稱現場、刪「同軸否決次數定性描述」旁支。
- 連結：提及自己已發布文章（第一篇 retire-vector-memory）必附內部連結。
- 標題定稿：「你已經有的越多，新工具能給的越少」。

### 脫敏邊界（發佈前必過）

- 工作專案一律泛化為「主力工作 repo」，不寫公司名 / 專案代號 / PR 編號。
- precedent log 內個別案的公司業務細節（若引用）同樣泛化。
- OSS 工具名與公開 repo 可點名（同 FC-015 既定邊界：脫敏只針對公司內部）。
- check-my-stack skill 已拍板發佈前開源（見 Review gate 定調），文內用佔位連結、發佈前覆核實際 repo URL。

---

## §1 核心主張

- 核心命題：評估熱門工具的正確順序是「先盤點自己已有什麼、各自多成熟」→「再把工具賣點逐點映射上去」。每個借鑑候選的真實價值 = 工具能力 ÷ 自己既有等價物的成熟度。順序顛倒（先看工具亮點、再找對接點）是這個領域最常見、也最早踩過的錯。
- 結構性結論：對一個已有紀律化個人基礎設施的人，多數熱門 plan / memory / session / hook / codebase 工具的商數塌縮到零附近——因為這些通用工具解決的痛點是「沒有紀律化個人基礎設施」，而這個痛點已經不存在；個人 stack 已是它們的超集。
- 商數有三種值，不是二分：
  - ≈0：已有更整合的等價物（超集）。
  - <0：工具重新翻案一條自己已經反覆否決、結案的路線（例：LLM 整併式記憶）。
  - 非零殘值：少數真材實料——但殘值多半是「偷架構、不裝工具」的獨立工作，極少是引入工具本身。
- 行銷訊號不是能力證據：星數、徽章、贊助漏斗、i18n 都要打折；星數異常成長（短週期高星）按成長駭客訊號處理。
- 誠實一層：這套紀律多數時候是紙上評估，不是親身踩坑 N 次；前提（stack 已超集）對起步中的讀者不一定成立——但「先盤點再相除」的順序對任何人都成立，差別只在商數的分布。
- 一句帶走（中性陳述）：工具的價值從來不是絕對的，是相對於「你已經有什麼」算出來的商數；先把除數列清楚，多數熱門工具會自己除成零。

---

## §2 目標讀者 + 為什麼現在寫

- 目標讀者：重度使用 Claude Code（或同類 agent）、已經累積了一定個人配置（skill / hook / memory / 自動化）、每週都會在時間軸上刷到新高星工具、反覆面對「這個要不要看一下」決策的人。次級讀者：stack 還在起步、想知道怎麼評估工具的人（對他們，§0 誠實界定 2 是必要前提聲明）。
- 為什麼現在寫：
  - 先例已累積到足以支撐方法論：截至 2026-06-11，precedent log 19 案，星數從 13 星到 191K 星，跨 plan / memory / orchestrator / code review / 上網 / 第二大腦等多個領域，收斂模式一致。
  - 方法已固化：2026-05-15 從 memory 條目升級成 check-my-stack skill（流程、輸出契約、anti-pattern 全部成文），有明確的起源案與固化時點可講。
  - 系列位置：blog 已發布 11 篇，其中第一、六、七篇各自是這個框架下的單案深寫；總綱補上「它們共用的方法」這一層，並為後續案例文（#69 / #73 / #74 等已登記候選）提供掛載點。

---

## §3 論證骨架（beat 清單）

### Beat 1 — 起源案：第一輪就把順序做反（planning-with-files）

- 要點：2026-05-15 評估 planning-with-files（評估當時約 21K 星）。第一輪分析先列出工具的 8 個借鑑點、其中一項（B2）被誤標為最高優先；深查後，四個招牌點（SHA-256 attestation / 5-Q test / session-catchup / template self-doc）全部塌縮。
- 根因：順序錯——先讀工具 README 列亮點、再回頭找自己哪裡可以對接，會被亮點錨定。
- 支撐證據：precedent log 第一列（feedback_competitive_analysis_check_own_stack_first）。
- 作用：開場鉤子 + 框架的誕生現場。框架不是憑空設計的，是從一次具體誤判修出來的。

### Beat 2 — 框架陳述：順序鐵律 + 商數公式

- 要點：治理鐵律 = 「先列舉自己既有 stack 的成熟度 → 再把工具逐點映射上去」，順序強制。每個借鑑候選的真實價值 = 能力 ÷ 既有等價物成熟度，結論欄是商數不是描述。
- 成熟度分級（輸出模板用詞）：成熟 / 成熟且自動化 / 試用中 / 否決已移除 / 想要但還沒有。
- 支撐證據：SKILL.md governing rule 段、output-template Block 1/2。
- 作用：全篇的公式核心，一段講完。

### Beat 3 — 為什麼多數塌縮到零：超集論

- 要點：通用工具解的是大眾痛點「沒有紀律化的個人基礎設施」。已自建紀律化基礎設施的人，除數大、商數小；多數熱門工具收斂成「競品觀察，不是 stack 變更的輸入」。
- 支撐證據：SKILL.md governing rule 原理句；precedent log 19 案中絕大多數收斂為「競品觀察 / 不裝 / 薄殘值」。
- 誠實附註（接 §0 誠實界定 2）：這是「對我成立」的結構性結論，不是普遍真理；除數小的讀者商數分布不同。
- 作用：回答「為什麼結論幾乎都是不裝」——不是偏見，是算式。

### Beat 4 — 商數的三種值（≈0 / <0 / 非零殘值）

- 要點：
  - ≈0 = 你的更整合（超集）。
  - <0 = 工具重新翻案你已結案的否決——比零更糟，因為評估它等於重付一次已付過的研究成本。
  - 非零殘值 = 少數真材實料，且多半是「偷架構、不裝工具」：殘值是一個獨立工作項，不是引入工具的理由。
- 支撐證據：SKILL.md Step 3 / Step 5；output-template Block 2 商數欄用語。
- 作用：把框架從「裝/不裝」二分升級成三值光譜，為 Beat 6 的 <0 示範鋪路。

### Beat 5 — 代表案 A：ECC，唯一親手裝過再移除的案（超集論最強證據）

- 要點：affaan-m/ECC（評估當時約 191K 星），2026-04-24 親手移除（有 commit 紀錄）。2026-05-25 競品重評確認三件事：
  1. 現有 stack 有一部分**蒸餾自它**（規則目錄源自 ECC、多個自製指令對得上 ECC 舊版 changelog）——不只超集，而且同源，借鑑已經做完一輪。
  2. 新版比當年裝的更大包（skill 數 119→232、agent 數 28→60、外加常駐控制平面），方向與「流程固化成 skill、不蓋 harness」的既定姿態相反。
  3. 主打的自動萃取功能撞上已多次否決的 LLM 整併式記憶路線（<0）。
- 健康度訊號（順帶示範 Step 2 的「實質 vs 行銷」）：單一維護者主導（commit 數 1415 vs 第二名 47）、重商業漏斗（付費方案 + 贊助 + 多通路）、191K 星對一個配置大包異常高 → 按星數打折規則處理。
- 支撐證據：precedent log ECC 列；feedback_ecc_framework_removed（移除紀錄）。
- 作用：超集論的最強單案——「曾經從它學到東西」與「現在不需要它」同時成立；也是「親手案例稀少」中最完整的一個。

### Beat 6 — 代表案 B：商數 <0 的示範（obsidian-second-brain 與記憶整併軸）

- 要點：eugeniughelbur/obsidian-second-brain（評估當時約 1.9K 星），43 個指令把筆記庫變成自我改寫的 AI 第二大腦。兩面同時塌：
  - 非差異化周邊功能（研究 / 行事曆 / session 管理等）各自被既有 skill 超集 ≈0。
  - **差異化賣點本身**（筆記自我改寫、自動整併、夜間 agent）正是已被反覆否決的「LLM 整併式記憶」軸（該次評估時點記為同槽第 13 案）→ 商數 <0。
- 可泛化校準（precedent log 原句結構）：「自我改寫 / 自動整併筆記」型工具的差異化賣點，正好是這套系統刻意對抗的承重牆——**差異化越強、商數越負**。
- 同軸先例清單（帶過不展開）：mempalace（唯一親手用過再退役，已寫成第一篇）、MemOS、honcho、claude-soul、AutoResearchClaw 的自學習模組、ECC 的自動萃取等。
- 支撐證據：precedent log obsidian 列；_index_tool_eval_outcomes 各條。
- 作用：示範 <0 不是修辭——同一條已結案的軸被不同包裝重複撞上，框架讓每次重撞的成本趨近於零（直接套結論）。

### Beat 7 — 流程機械：六步 + 硬閘 + anti-pattern

- 要點（六步，照 SKILL.md）：
  1. **盤點既有 stack（硬閘，先做）**：在讀工具 README 之前，先列舉自己在該領域已有什麼、各自多成熟；其中「試過又移除的工具與記錄在案的理由」是最強訊號。
  2. 抽出工具的真實價值主張與健康度：機制、發行模式、授權、活躍度、維護者集中度；星數 / 徽章 / 贊助漏斗不算能力。同時撈個人先例校準——只引用實際查到的先例，查不到就寫「沒有先例」，禁止虛構先例填格子。
  3. 逐點映射：每個賣點對「我已有的等價物 + 成熟度」算商數。
  4. 真缺口檢查：盤點會浮出自己在該領域唯一的真缺口；直問工具補不補**那個**缺口，不補就不能用「補缺口」當理由。
  5. 殘值清單：只列商數真的非零的，並區分「偷架構不裝工具」vs「真採用候選（罕見）」；殘值多半很薄，不灌水。
  6. 收斂判決：三類之一 + 指名結構性根因 + 用實際撈到的先例校準。
- anti-pattern（SKILL.md 明列六條，可濃縮）：先列亮點再找對接、不除成熟度的裸借鑑清單、盤點前就標優先級、星數當能力證據、沒對到真缺口就喊補缺口、虛構先例校準。
- 支撐證據：SKILL.md Step 1-6 + anti-patterns 段；output-template 四區塊契約。
- 作用：方法論的可操作層。寫作時不必逐步流水帳，可壓成「一個硬閘 + 一個公式 + 一張反面清單」。

### Beat 8 — 真缺口檢查的細節：absence ≠ pain

- 要點：工具補的空白不等於你的痛點。兩個校準（均出自先例復盤，可泛化）：
  - 先把缺口歸對類再判工具補不補（qiaomu 案：使用者口述的缺口與工具實際補的缺口不是同一個）。
  - 「沒覆蓋」不等於「有痛」：一個來源在自己管線裡壞了很久也沒人修，這個「沒覆蓋」本身就是「不重要」的訊號（Agent-Reach 案的時間維度證據）。
- 順帶一條（評「宣稱 N 層 / N 階段」類賣點通用）：宣稱的層數要讀控制流驗證——qiaomu 案宣稱 6 層級聯、讀原始碼發現兩層是到不了的死碼，實際約 4 層。
- 支撐證據：precedent log qiaomu 兩條洞察、Agent-Reach 洞察 (4)。
- 作用：防止框架被「它有我沒有」這句話繞過。

### Beat 9 — 框架不是否決機：非塌縮案存在

- 要點：收斂判決三類中前兩類也真實發生過。清單帶過（每案一行，細節留給後續文章）：
  - Agent-Reach：本體不裝，但抽出其中一個零依賴的公開 API 端點寫進自家管線（罕見的部分採用案）。
  - alibaba/open-code-review：本體不採用，但「確定性工程層」（純資料 + 規則、無 LLM 依賴）可偷，已衍生出自家工具的增強試用。
  - brooks-lint：只偷 6 個分類學詞彙，嫁接進既有 reviewer。
  - last30days：罕見的條件採用案——真缺口是「使用模式」不是能力（隨選深掘 vs 排程摘要）。
  - headroom：罕見的親手 dry-run 量化案，否決理由是整合架構風險、不是壓縮品質（細節屬第七篇）。
- 支撐證據：precedent log 各列、_index_tool_eval_outcomes 各條。
- 作用：證明框架輸出的是商數不是立場；同時給 #74（否決後拆什麼帶走）留掛載點。

### Beat 10 — 計數誠實：#63 撤回的教訓

- 要點：曾登記過候選題「我連續否決了 13 個 AI 記憶工具」，2026-06-04 復盤撤回。原因：真正親手裝過、用過、再否決的記憶工具只有 mempalace 一個（且已寫成第一篇）；其餘全是紙上評估、連裝都沒裝。「否決 13 個」是灌數字——同槽否決計數 ≠ 親身踩坑數。
- 引申（接 §0 計數紀律）：這套方法論文章自己必須先過這一關——所有計數帶範圍與時點，紙上評估就寫紙上評估。
- 支撐證據：blog-candidates-v3 #63 撤回段（2026-06-04 增補）。
- 作用：方法論文章的自我一致性——評估工具講究誠實除法，講方法論的文章對自己的數字同樣誠實。是「誠實界定」的敘事化版本。

### Beat 11 — 固化與 meta 發現：skill 的正當理由

- 要點：2026-05-15 方法本體固化成 check-my-stack skill（canonical），原 memory 條目降級為指標 + 先例紀錄。固化時跑寫 skill 的 RED/GREEN 測試，發現 RED（無 skill 基線）在這台機器上無法乾淨隔離——因為紀律已經滲進常駐記憶，強模型在這個環境本來就會做先盤點再相除。
- meta 結論：skill 的正當理由是**可靠性**（memory 會被裁切 / 誤刪 / 沒載入）+ 可維護可分享 + 策展層級，不是「教 agent 它本來不會的事」。
- 支撐證據：precedent log「Skill TDD 測試的 meta 發現」段。
- 作用：收尾前的反身一筆——方法固化這個動作本身，也經過了同一種「值不值得」的檢驗。

### Beat 12 — 收尾：除數才是你的資產

- 要點（中性陳述，takeaway 見 §6）：框架的副產品是把「自己有什麼」變成一份隨時可用的清單；每次評估都在複利這份清單。評估工具最大的成本不是裝錯，是每次都從零開始研究——先例紀錄讓同軸的第 N 次重撞接近零成本。
- 作用：把全篇從「怎麼說不」轉成「除數（既有 stack + 先例紀錄）是會增值的資產」。

---

## §4 關鍵事實清單

> 標記：【準據：已修正】= 曾寫錯後修正，寫作特別小心；【多來源一致】；【單一來源未驗】。

- F-01【多來源一致】框架公式：借鑑候選真實價值 = 工具能力 ÷ 既有等價物成熟度；順序強制為先盤點後映射。來源：SKILL.md governing rule + output-template Block 1/2。
- F-02【多來源一致】流程六步與四區塊輸出契約、六條 anti-pattern。來源：SKILL.md + output-template。
- F-03【單一來源未驗】起源案：2026-05-15 planning-with-files 第一輪列 8 借鑑點、B2 誤標最高優先、深查後 4 個招牌點全塌、根因 = 順序錯。來源：precedent log 第一列（單一私有紀錄；該次 session 細節無第二來源，但屬自家紀錄的第一手事件）。
- F-04【單一來源未驗】固化時點：2026-05-15 使用者拍板 Option A（skill 當 canonical、memory 降為指標 + 先例紀錄）。來源：feedback_competitive_analysis_check_own_stack_first frontmatter + 正文。
- F-05【準據：已修正→計數紀律】precedent log 條目數：**19 條（2026-06-11 讀取）**。blog 候選檔 #33 升級段的「14 個工具全否決」是 2026-06-04 時點快照，且名單混入 precedent log 以外條目（supermemory、awesome-harness 在 outcomes cluster 不在 precedent log 表格）。錯法：拿 14 或 19 不帶時點互換、或兩清單互相充數。正解：帶時點帶範圍，或用量級描述。
- F-06【準據：已修正】#63 撤回（2026-06-04）：「否決 13 個 AI 記憶工具」不成獨立題——親手裝過用過再否決的只有 mempalace 一個（已是第一篇）；其餘（supermemory / everos / obsidian / memos / honcho / gbrain 等）全是紙上評估連裝都沒裝。「否決 13 個」= 灌數字。素材歸 #33（本篇）當案例群，且本篇必須以「紙上評估紀律」的誠實姿態使用它們。
- F-07【準據：小心使用】「LLM 整併式記憶同軸否決次數」是隨時間遞增的計數：claude-soul 評估時記 4 次、AutoResearchClaw 時記第 7 次、ECC 重評時記 8 次、obsidian 時記第 13 案。引用必須綁該案評估日期；本篇若引用建議用定性描述（「反覆否決、已結案的軸」）避免數字打架。
- F-08【多來源一致】非塌縮案存在：Agent-Reach（抽單一 API 端點部分採用）、open-code-review（偷確定性層）、brooks-lint（嫁接 6 個詞彙）、last30days（條件採用）、bumblebee（試用結案留用，屬第十篇）。來源：precedent log + _index_tool_eval_outcomes + blog-candidates #68 段。
- F-09【多來源一致】親手案例清單（用於誠實界定）：ECC（裝過、2026-04-24 移除，有 commit 紀錄）、headroom（親手 dry-run 量化）、superset（裝了當天否決）、mempalace（用 2-3 週後退役，第一篇）、RTK（試用 1.5 天退役，第七篇）。其餘 precedent log 條目為紙上評估。
- F-10【多來源一致】ECC 案三件事：stack 部分蒸餾自它（規則目錄源自 ECC、自製指令對上其舊版 changelog）；新版更大包（119→232 skill、28→60 agent）+ 常駐控制平面；維護者集中（1415 vs 47 commits）+ 重商業漏斗。來源：precedent log ECC 列 + feedback_ecc_framework_removed。
- F-11【單一來源未驗】星數打折規則的起源：graphify 案（48K 星 / 6 週）定為成長駭客訊號要全打折；後續 opencode（高星但 star/active 比例異常）、coral（2.4K 星 / 6 週）、ECC 都引用此規則。來源：precedent log。
- F-12【準據：已修正（FC-015 註記）】星數是動態值：codegraph 在 memory 舊記約 1,110、三週後查證為 33,927（暴漲或當初誤記，無法分辨）。紀律：文章用查證日值 + 標日期，或量級描述；不可釘死舊值。本篇 precedent log 的星數全是各評估日時點值，照 §0 計數紀律處理。
- F-13【單一來源未驗】qiaomu 案兩條可泛化校準：宣稱 N 層級聯要讀控制流驗證（宣稱 6 層、實際約 4 層，兩層是死碼）；先把真缺口歸對類再判工具補不補。來源：precedent log 洞察段。
- F-14【單一來源未驗】Agent-Reach 案校準（本篇取其中一條）：「沒覆蓋 ≠ 有痛」+ revealed-preference 時間證據（壞了沒人修 = 不在乎）。來源：precedent log 洞察段。
- F-15【單一來源未驗】skill TDD meta 發現：RED 基線無法在已內化此紀律的環境隔離；skill 正當理由 = 可靠性 + 可維護分享 + 策展層級，非行為教學。來源：precedent log meta 段。
- F-16【多來源一致】姊妹判準分工（本篇只點名不展開）：「裝不裝」（Path A/A'/B）是一個獨立判準；「agent-in-loop vs 背景抓取適用性」是另一個；本框架管「競合 / 借鑑順序與價值折算」。三條互補不重疊。來源：SKILL.md 分工段 + precedent log sibling 段 + _index_tool_adoption_discipline。
- F-17【單一來源未驗】超集論的原理句：通用工具解決的大眾痛點是「沒有紀律化的個人基礎設施」。來源：SKILL.md governing rule（方法作者自述，非外部驗證的論斷——寫作時以「我的解釋是」級別陳述，不寫成業界共識）。
- F-18【多來源一致】Step 1 盤點清單裡「試過又移除的工具 + 記錄在案的理由」被定為最強訊號。來源：SKILL.md Step 1 + output-template Block 1 governing lesson 段。

---

## §5 數據 / 證據庫

### precedent log 19 案總表（星數 = 各評估日時點值，照 §0 計數紀律使用）

| 工具 | 星數（時點值） | 收斂結果 |
|---|---|---|
| planning-with-files | 21K | 競品觀察（起源案） |
| compound-engineering | 16.6K | 不裝 |
| graphify | 48K | 競品觀察（星數打折規則起源） |
| qiaomu-anything-to-notebooklm | 2.7K | 薄殘值，抽件不裝 |
| claude-soul | 37 | 不裝 |
| pi（earendil-works） | 50K | 競品觀察 + 3 條偷架構 |
| opencode | 161K | 競品觀察 |
| skillkit | 1.1K | 競品觀察 |
| coral | 2.4K | 競品觀察 |
| oh-my-pi | 5.6K | 競品觀察 + 2 條偷架構 |
| AutoResearchClaw | 12.5K | 競品觀察 |
| ECC | 191K | 親裝→移除→結案（唯一） |
| claude-devtools | 3.5K | 薄殘值→不裝 |
| scaffold-docs | 13 | 薄殘值→不裝 |
| headroom | 3,090 | 不裝（親手 dry-run） |
| obsidian-second-brain | 1,923 | 競品觀察（<0 示範） |
| Agent-Reach | 21.8K | 部分採用（抽 1 個端點） |
| open-code-review | 3,160 | 競品觀察 + 偷確定性層 |
| brooks-lint | 877 | 競品觀察 + 嫁接詞彙 |

### 工具連結（第一次具名出現附連結用；標注來源狀態）

- 來源檔含完整 URL（factcheck-log / 候選檔已查證）：
  - headroom：https://github.com/chopratejas/headroom （FC-024）
  - open-code-review：https://github.com/alibaba/open-code-review （reference 檔名含 slug；FC 系列同主題已查證 alibaba/open-code-review）
  - impeccable（若引用）：https://github.com/pbakaus/impeccable （候選檔 #65）
- 來源檔僅含 owner/repo slug、URL 由 slug 組成（發佈前驗證連結活著）：
  - earendil-works/pi → https://github.com/earendil-works/pi
  - sst/opencode → https://github.com/sst/opencode
  - rohitg00/skillkit → https://github.com/rohitg00/skillkit
  - withcoral/coral → https://github.com/withcoral/coral
  - can1357/oh-my-pi → https://github.com/can1357/oh-my-pi
  - aiming-lab/AutoResearchClaw → https://github.com/aiming-lab/AutoResearchClaw
  - affaan-m/ECC → https://github.com/affaan-m/ECC
  - matt1398/claude-devtools → https://github.com/matt1398/claude-devtools
  - dbreunig/scaffold-docs → https://github.com/dbreunig/scaffold-docs
  - eugeniughelbur/obsidian-second-brain → https://github.com/eugeniughelbur/obsidian-second-brain
  - Panniantong/Agent-Reach → https://github.com/Panniantong/Agent-Reach
  - hyhmrright/brooks-lint → https://github.com/hyhmrright/brooks-lint
  - DomDemetz/claude-soul → https://github.com/DomDemetz/claude-soul
- URL 由查證確認（2026-06-11 WebSearch + GitHub API 驗證，星數量級與評估時點吻合）：
  - planning-with-files：https://github.com/OthmanAdi/planning-with-files （FC-049）
  - compound-engineering：https://github.com/EveryInc/compound-engineering-plugin （FC-050）
  - graphify：https://github.com/safishamsi/graphify （FC-051；建立 2026-04-03，「6 週 48K 星」時間線精確吻合）
  - qiaomu-anything-to-notebooklm：https://github.com/joeseesun/qiaomu-anything-to-notebooklm （FC-052）
- 來源檔無 slug，**URL 待查證**：mattpocock skills（若提及）。
- check-my-stack skill 本身：私人 skill，無公開連結（§7 G-2）。

### 評估活動全貌清點（FC-053＋FC-054 三層口徑的證據，2026-06-11 實際清點）

- **三層金字塔（寫作引用各層必帶層名，不可用任一層代表全部）**：
  1. 日常快篩：每天數次、看一眼出局，**結構性不留紀錄**，唯一來源是使用者自述（FC-053）。
  2. 留檔深評：memory 內 eval/trial/rejected/retired/landscape 檔案 58 個（2026-06-11 實跑清點）＝**具名工具約 60 個**（單一工具獨立檔約 42＋precedent log 獨有約 13＋程式碼探索 cluster 數個）；landscape 型檔案成員未拆，拆開破百。時間窗集中 2026-05-07～06-09 約五週（FC-054）。
  3. 走完整 check-my-stack 框架：precedent log 19 案（2026-06-11 時點）——金字塔最深的一層。
- 可用對比寫法（誠實且有衝擊力）：「五週留檔評估六十多個工具，其中值得走完整框架深評的不到二十個」。
- 周邊紀錄群（範圍互有重疊，不可加總）：工具否決結論 cluster 24 條／試用中 cluster 8 條／CLI 雷達 8 條。

### 可引用的具體數字（均帶來源時點）

- 起源案：8 個借鑑點 → 4 個招牌點塌縮（2026-05-15，precedent log）。
- ECC：移除日 2026-04-24；重評日 2026-05-25；skill 數 119→232、agent 數 28→60；commit 集中度 1415 vs 47（precedent log）。
- qiaomu：宣稱 6 層級聯、實際約 4 層有效（precedent log）。
- codegraph 星數漂移：約 1,110 → 33,927（三週，FC-015，2026-05-30 查證）。
- 時間錨：skill 固化 2026-05-15；#63 撤回 2026-06-04；precedent log 19 條讀取時點 2026-06-11；blog 已發布 11 篇（截至 2026-06-11）。

---

## §6 收尾要傳達的 takeaway（中性陳述）

1. 工具價值是商數不是絕對值：能力 ÷ 你既有等價物的成熟度。先列除數，再看分子。
2. 順序是方法的全部：先盤點自己、後讀工具亮點；反過來就會被亮點錨定（起源案的教訓）。
3. 多數塌縮到零有結構性原因：通用工具解的是「沒有紀律化個人基礎設施」這個大眾痛點；前提是你已經有——沒有的讀者，同一套除法會算出不同分布，框架照用、結論自負。
4. 商數 <0 的案要顯式標出：重新翻案已結案的否決，比沒用更糟。
5. 殘值多半是「偷架構、不裝工具」——當成獨立工作項，不當成引入理由。
6. 計數要誠實：紙上評估寫紙上評估，同軸否決計數不冒充親身踩坑數；所有數字帶範圍與時點。
7. 先例紀錄是複利資產：同一條軸第 N 次被不同包裝撞上時，評估成本趨近於零。

---

## §7 素材完整度 / 缺口報告

### 逐項評級

| 區塊 | 評級 | 說明 |
|---|---|---|
| 框架本體（公式 / 六步 / anti-pattern） | 紮實可寫 | SKILL.md + output-template 成文完整 |
| 起源弧線（planning-with-files → 固化） | 紮實可寫 | 誤判細節、修正、同日固化決策、TDD meta 發現俱全 |
| 代表案 A：ECC | 紮實可寫 | 唯一親裝案 + 同源蒸餾 + 健康度訊號，三層俱全 |
| 代表案 B：obsidian / <0 軸 | 紮實可寫 | 但同軸否決計數須照 F-07 處理，別讓數字打架 |
| 非塌縮案清單（Beat 9） | 紮實可寫（清單級） | 一行一案足夠；深寫屬 #74 / 後續，不在本篇 |
| 誠實界定三條 | 紮實可寫 | #63 撤回復盤是現成素材 |
| 計數（19 案 / 14 案） | 偏薄需補 → 已用紀律補強 | 兩清單範圍不一致是結構性的；照 §0 計數紀律寫可避開，但若 N 版想喊單一精確總數，發佈前要重新數一次 precedent log 當日條目 |
| 星數 / URL | 星數仍時點值；URL 已解 | 星數全是時點值（照 §0 計數紀律）；原 4 個無 slug 工具 URL 已查證補齊（FC-049~052，見 §5）；slug 組成的 URL 發佈前仍逐一驗活 |
| 超集論原理句（F-17） | 偏薄需補 | 只有方法作者自述，無外部佐證；寫成個人解釋安全，寫成普遍規律就越界 |
| 「對起步讀者」的另一面 | 缺漏 | 沒有任何「除數小的人用此框架」的實證案例——只能寫成推論 / 前提聲明，不能寫成觀察 |

### 明確缺口

- G-1【起源弧線之前的史前史】：2026-05-15 之前有沒有更早的「順序錯」案例（框架萌芽期）——來源檔沒有記載，找不到。只能從 planning-with-files 起講。
- ~~G-2~~【已決 2026-06-11】check-my-stack skill 發佈前開源、文章附真連結（Review gate 定調）；發佈前工項＝脫敏＋推 GitHub＋覆核 URL。
- ~~G-3~~【已解 2026-06-11】四工具 URL 已查證補齊（FC-049~052，§5 已更新）：OthmanAdi/planning-with-files、EveryInc/compound-engineering-plugin、safishamsi/graphify、joeseesun/qiaomu-anything-to-notebooklm。
- G-4【「14 案全否決」與「19 案含例外」的敘事張力】：若 N 版想用「全部否決」當鉤子，事實上不成立（19 案含部分採用 / 偷架構 / 條件採用案）。正確鉤子是「絕大多數塌縮 + 少數薄殘值」，鉤子強度略降但誠實——這是寫作取捨點，素材面已備齊兩面。
- G-5【外部視角佐證】：「個人 stack 超集論」全部出自自家紀錄，無任何外部（社群 / 他人）同型觀察的查證——若 N 版想寫「不只我這樣」，目前無素材，需另行查證或不寫。

### 總評

夠寫 N 個完整版本。框架本體、起源弧線、兩個代表案、誠實界定、計數紀律五大支柱全部紮實；風險集中在「數字與連結」（星數時點、計數範圍、四個無 slug 工具的 URL）——已在 §0 / §4 / §5 設下統一處理規則，N 版照規則寫即可互相一致。最大的寫作取捨是 G-4（鉤子誠實度），素材支持誠實版寫法。
