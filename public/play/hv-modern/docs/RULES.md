# VESPER 暮界紀行：規則與驗證紀錄

日期：2026-10-07。引擎版本：`persistent-0.91-training-v13`。存檔 schema：2。

## 範圍與誠實標示

這是原創的單人瀏覽器訓練原型，目標基準為 **HV Persistent 0.91 公開文件候選規格**。目前不是完整的 HV 還原，也不是原站登入、真正 Arena、官方伺服器或原站資產副本。原始程式、美術與怪物資料均未複製。

可玩的「裂隙演練」有兩波、每波三隻原創怪物。它是為了驗證戰鬥操作與排程而建立的測試遭遇；不是把 First Blood 或任何原有活動縮小。角色、裝備、數值、初始藥水都是明示的測試資料。勝利只累計本機演練通關紀錄，**不發 EXP、Credits、道具、GP、Hath 或原版活動獎勵**。

Isekai、Tower、賽季、原站連動都未實作。外部數量／加成為 0、乘數為 1、資格為 false，不以免費票、登入獎勵、加倍掉落或其他好處補償。

## 證據與狀態的意義

- **公開明述待原站案例驗證**：社群文件有相對明確描述；本機測試僅驗證採用的模型
- **社群估計／暫定**：存在問號、缺乏精確取整或原服結算次序
- **版本衝突**：來源互相矛盾，不能當成已確認原版數值
- **原創訓練差異**：為目前測試程式選定的數值或簡化，明確不主張原版相同
- **案例通過**：對此引擎規格的自動測試通過，不能推論原站 1:1 一致

EHWiki 是社群文件；2026-10-07 讀取到的頁面不代表每個段落都已按 0.91 重驗。原開發者更新公告未經本階段驗證。沒有原服 RNG、伺服器碼、怪物池或經濟快照。

## 規則登錄表

| ID | 適用範圍／狀態 | 本版採用行為與依據 | 驗收 |
|---|---|---|---|
| TIME-01 | Persistent 結構；公開明述 | 玩家行動 turn、100 time units 的 tick、怪物波次 round 各自計數；不能以點擊次數替代 tick | 快速行動累積、跨 tick、跨波測試 |
| TIME-02 | 公開明述；數值細節暫定 | 道具行動增加 turn，但不增加內部時間；不觸發定時敵方行動，不減少法術／技能冷卻，只推進其他道具冷卻 | 連用兩種藥水、冷卻家族分離 |
| TIME-03 | 排程結構有來源；抽樣與次序暫定 | 每波敵方初始偏移為 10–100 單位；只在有時間的行動後結算，單一玩家行動可容納多次敵方攻擊。採整數均勻抽樣與固定樣本間隔；同時點先 tick、後依 ID 排敵方 | 開波零時間道具、多次敵方行動 |
| TIME-04 | 估計／訓練採用 | 非道具時間限制 20–500 單位；攻擊按樣本速度修正，其他為 `ceil(100 × baseTime)`。攻擊、Scan、Defend、Focus=1；火焰=1.2；Cure、Spirit=0.2；Flee=0.5。精確法術／切換／撤退速度未確認 | 20 單位累積、攻擊速度與時間 |
| RES-01 | 公開明述；RNG 暫定 | 物理命中增加 5–10 OC，最大 250；本模型用整數均勻分布。初始 OC=0 是測試配置 | 命中資源與 seed 決定性 |
| RES-02 | 門檻與乘數有來源；次序／時間單位暫定 | 50 OC 且至少 1 SP 可啟動 Spirit；物理 ×2、MP ×0.75 並向上取整。啟動行動不扣維持，之後每個成功玩家行動（含道具與关闭）扣 10 OC / 1 SP。起始 OC≤30 先失效；結尾 OC≤20 或 SP=0 關閉 | 門檻、啟用／關閉、MP 預驗證 |
| RES-03 | 0.91 時期公開明述；原服案例待驗證 | 離開整個戰鬥系列後 HP/MP/SP 即時回至目前上限；最後生命另存 finalVitals。非最後一波不回復。恢復本身不改 OC、藥水、獎勵、時間或 RNG，重做無變化 | 勝利／敗北／撤退、跨波不回、重複與舊存檔 |
| INFO-01 | Scan 概念有來源 | 未 Scan 只提供名稱、造型和生命比例；精確生命、等級、抗性與攻擊值經 `getEnemyView` 在 Scan 後才回傳。任何情況都不回傳未來招式或隱藏排程 | 前後欄位比較、抗性物件隔離 |
| SKILL-01 | Defend 回血有版本衝突 | 保留 25% 傷害降低、本次及下次玩家行動。10% / 25% base HP 的回血衝突未解，因此本原型明示省略回血與相應 OC 消耗；不任選一個當成正式值 | 防禦不暗扣 OC／回血 |
| SKILL-02 | 公開明述；戰鬥判定簡化 | Focus 在足夠 OC 時扣 25，恢復 5% 基礎 MP。保留次回合命中改善及無法閃避；完整格擋／招架／抵抗尚未實作 | 恢復與資源保守測試 |
| SKILL-03 | 來源表格與明示候選，舊系列固定政策 | 新系列 Fire 6% level／CD0／3目標、Cure 20% level／CD5；Spirit ×0.75，最終 ceil。舊系列保留 6MP／CD2、10MP／CD3。新系列藥水 CD40、舊系列 CD4 相容 | COMBAT-RESOURCES、原子性、舊場重播 |
| COMBAT-01 | 部分公開公式，取整／敵方仍為樣本 | 新系列採公開對數攻擊基值、Fire ×4、80–120 整數百分比 roll；1.5 基礎暴擊倍率。命中／8% 單次暴擊機率、怪物與防禦仍是樣本；未實作多重暴擊 | COMBAT-OFFENSE、分層向量、實際 C12 重播 |
| CMD-01 | 有界保存可靠性政策 | 新行動使用 `{seq}` 與持久高水位；保留期內精確重試回傳原結果，過期重試拒絕，絕不重新執行。舊字串只接受仍保留的重試，不再開啟新動作；不是跨備份／跨分頁權威去重 | 序號、過期／衝突拒絕、跨遭遇、重載及字串遷移 |
| CHAR-01 | 公開公式 + 明示候選取整／帳本 | 新角色以 9,193 起始 EXP、六項 14 建立守恆帳本；按公開指數曲線，使用集中式累計 ceil 差額。支援 ±1/10/100 配置與對稱返還，不能在戰鬥中修改；累計 EXP 與等級不被花費。取整、返還對称性、上下限與 lifetime 模型均未原服核對 | 成本向量、批量一致、回退守恆、資金不足原子拒絕、舊角色不重配 |
| EQUIP-02 | 公開明述；未宣稱完整裝備生成 | 法杖占雙手，裝備時先卸下副手但保留物品；雙手武器下不能再裝盾。未指派的低品質裝備首次穿戴時固定為角色等級，已指派裝備不隨角色升級；高於角色等級拒絕穿戴 | 雙手互斥、無物品損失、首次等級指派、固定等級、超等級拒絕 |
| EQUIP-01 | 原創測試模型 | 七件固定裝備、weapon/body/offhand 三槽；非完整原版部位系統。戰鬥內禁止換裝或配點；不在戰鬥內換裝；戰外生命等資源遵循 RES-03；保護標記只屬本機整理 metadata；無綁定／Forge／IW 的虛假操作 | 配裝比較、拒絕、屬性點守恆 |
| SAVE-01 | 本機可靠性 | JSON 保存 seed 狀態、排程、冷卻、Scan、累計成果與有界近期收據。未知版本、缺欄、越界、非有限資料、危险鍵和結構損壞回傳 null，不默默重置原資料 | 回存重播、無效存檔集 |
| END-02 | 0.91 時期公開明述；原服案例待驗證 | 非最後一波清怪後停在 round-complete；按「繼續」／Space 才生成下一波。此等待不是玩家指令，不推進 turn、tick、冷卻或資源；仍在同一戰鬥系列，不能中途換裝或營地恢復 | 等待保存、重送、全資源保留及禁止跨波跳過 |
| END-01 | 結構採用／獎勵未實作 | 最後一波清空才通關；只結算一次。撤退消耗暫定時間，敵方可先致死；敗北結果先記錄、戰外三資源再即時恢復。完成波次不補資源或冷卻 | 跨波保留、勝利一次、撤退致死 |

### 衍生值與保留的舊場公式

新角色資源上限採 [VITALS.md](./VITALS.md) 公開候選式；舊角色明確保留原模型，戰外確認後才切換。下列舊資源式屬 legacy-vitals-fixture-v1。

新系列物攻／魔攻與輸出傷害改採 [COMBAT-OFFENSE.md](./COMBAT-OFFENSE.md) 的公開候選式。下列線性攻魔與 90–110% 輸出只適用舊系列相容分支；其餘仍保留的樣本項目不因新公式而變成已驗證規則。

`getStats`：

- HP = floor(150 + END × 9 + level × 5)
- MP = floor(30 + INT × 2 + WIS × 2)
- SP = floor(10 + WIS × 0.75)
- attack = floor(8 + STR × 1.4 + DEX × 0.5 + 裝備 attack)
- magic = floor(5 + INT × 1.6 + WIS × 0.4 + 裝備 magic)
- defense = floor(END × 0.3 + 裝備 defense)
- accuracy = clamp(88 + DEX × 0.25, 88, 98)，單位為百分點
- speed = clamp((AGI / level − 1) × 10, 0, 10) × clamp((130 − burden) / 90, 0, 1)，單位為百分點；負重線性部分尚未驗證
- 普攻 base = attack × Spirit 倍率；火焰 base = magic × 1.7
- 玩家傷害 = floor(base × [0.9, 1.1) 浮動 × (1 − 抗性) × 暴擊倍率)，至少 1
- 敵方傷害 = floor(attack × [0.9, 1.1) 浮動 × 100/(100 + defense×2) × 防禦倍率)，至少 1
- Cure 回復 floor(maxHP×0.3 + magic×0.4)；舊系列 HP 藥水回復 floor(maxHP×0.5)、MP 藥水 floor(maxMP×0.4)；C14 新系列改用下面的 baseHp100%／baseMp50%，皆封頂

這些公式只用於操作驗證，不能拿來宣稱原站傷害符合。Xorshift32 是本專案自選測試 RNG，不是原服 RNG。敵方攻擊命中 90%；玩家處於前一行動的 Focus 效果時為 100%。敵方目前沒有暴擊、技能、MP/SP、狀態或公開的下一步意圖。

### 結算順序

1. 查指令收據；重送不變更任何狀態
2. 檢查戰鬥狀態、目標、冷卻、資源、Scan 與恢復資格；失敗不留收據、不改 RNG
3. 增加玩家 turn；依所採用的時間解讀結算 Spirit 維持
4. 推進應當遞減的其他動作冷卻；扣魔力／道具，執行玩家動作
5. 開始本動作冷卻；推進內部時間，依時序執行 tick 與存活敵方行動；致死立即停
6. 減少玩家行動型效果剩餘次數，處理 Spirit 耗盡
7. 處理撤退、等待下一波或最後勝利；非最後一波停在明示 Continue 邊界。系列結束先記錄 finalVitals 與結果，再進行戰外恢復，每次結束只登記一次
8. 保存完整指令收據，供重送與重載後去重

此先後次序為本原型的固定、可測規格。所有涉及原版隱藏判定、同時事件優先、完整能力的對照仍待完成。對滿資源的治療／藥水，以及重複 Scan 的拒絕是明示的防誤觸訓練差異。自然 MP／SP tick 回復已按下列 C12 政策接入；尚未實作的藥劑 tick 效果不以任意數值替代。

## API 與保存契約

ES modules，入口 `src/engine.js`：

- `createGame(seed)` → 新 state
- `getStats(state)` → 面板（speed / accuracy 為百分點）
- `continueRound(state)` → 明示進入下一波；只生成該波敵人，不耗費戰鬥指令時間
- `startBattle(state)`、`performAction(state, actionId, targetId?, commandId?)`
- `setItemProtected(state, itemId, boolean)` → 本機保護標記；不得修改其他固定裝備欄位
- `equipItem(state, itemId)`、`spendAttribute(state, key)`、`selectTarget(state, targetId)`、`recoverOutOfCombat(state)`（`rest` 為相容別名）
- 以上動作原地修改 state，回傳 `{ok, events, error?}`；失敗完全不修改
- `listAvailableActions(state)` → 可用性、已知消耗、敘述與冷卻
- `getEnemyView(enemy)` → Scan 安全的 UI 資料；不要把 enemy 原始物件或 `_schedule` 直接畫在 UI
- `serializeGame(state)` → JSON string；`restoreGame(json)` → 合法 state 或 null
- `RULES`、`ACTIONS`、`ATTRIBUTE_KEYS` 供 UI 使用

本機存檔不是防作弊或權威多人服務；讀取驗證只防損坏與未支援結構，不能證明玩家未修改存檔。underscore 欄位是實作狀態，含未公開排程，不應渲染成免費戰術資訊。schema1 的 training-v1～v12 明示遷移至 schema2／training-v13：先驗證舊資料；保留進行中的資源與過往結果，缺少 phase 時補 combat。已結束系列依新採用的戰外恢復規則回滿三資源，並保留原來的 finalVitals；不補道具、不重發獎勵。其他未知版本仍拒絕。超過 5,000,000 UTF-8 bytes 的存檔拒絕載入。未做網路帳號、跨裝置同步、伺服器權威結算或原站資料存取。

## 驗證

執行 `node --test tests/engine.test.js`。2026-10-07：33 項通過、0 失敗。包括從開始到兩波通關的明示指令流程，且每次動作後都保存、重載與驗證。測試不提供無人值守遊戲按鈕或改動原版操作規則。

## 來源與待核對

- [HentaiVerse 版本基準](https://ehwiki.org/wiki/HentaiVerse)
- [Action Speed，固定修訂 64923](https://ehwiki.org/index.php?title=Action_Speed&oldid=64923)：TIME-01～04、道具冷卻家族、速度模型。採用內容短述；有問號的數值仍列為暫定
- [Skills，固定修訂 65273](https://ehwiki.org/index.php?title=Skills&oldid=65273)：Scan、Defend、Focus、Flee 的有限機制
- [Spirit Stance，固定修訂 65231](https://ehwiki.org/index.php?title=Spirit_Stance&oldid=65231)：門檻、乘數與耗盡文字；原文 round / turn 用詞需要實例核對
- [Overcharge](https://ehwiki.org/wiki/Overcharge)：上限與物理命中獲取範圍
- [Battles](https://ehwiki.org/wiki/Battles)、[Spells](https://ehwiki.org/wiki/Spells)、[Arena](https://ehwiki.org/wiki/Arena)：Defend、Fiery Blast、First Blood 衝突維持未解
- [The Armory](https://ehwiki.org/wiki/The_Armory)：0.91 改造鏈需求；本版不開放未驗證改造

其餘完整需求、原有衝突與依賴請見 [BACKLOG.md](./BACKLOG.md)。

## 波次規則增量來源（Checkpoint 04）

[Battles 固定修訂 64927 · Victory](https://ehwiki.org/index.php?title=Battles&oldid=64927#Victory) 於 2026-10-07 讀取：描述點擊 Continue 或按空白鍵進入下一波。這是 0.91 時期社群公開規則，並非原服案例比對。採用明示波次邊界，取代本原型之前的自動進波；沒有減少波數或補資源。HP/MP/SP 衍生公式頁自身有不確定性警告，HP 舊翻譯另有 50/500 常數差異，本次不冒充已確認而替換。

## 戰外恢復增量來源（Checkpoint 05）

[Battles 固定修訂 64927 · Recovering](https://ehwiki.org/index.php?title=Battles&oldid=64927#Recovering) 明述戰外生命、魔力和靈力立即全回復。本次以 max-resource assignment 實作，無百分比或取整猜測；上限公式本身仍為暫定，沒有因此冒稱已核對。來源未提及 OC 或藥水，因此恢復程序不重設 OC、不補道具。舊的手動營地恢復及順便清空 OC 假設已移除。

## 裝備資格增量來源（Checkpoint 08）

[Equipment Basics 固定修訂 65026](https://ehwiki.org/index.php?title=Equipment_Basics&oldid=65026) 記錄法杖為雙手武器、未指派裝備的首次穿戴等級、裝備等級限制及品質階序。本版用 Average 修正原創樣本先前誤用的 Fine 標籤。装備數值、生成、完整部位和等級縮放仍未冒充原版。舊存檔若已帶著不合法的法杖／盾組合進入戰鬥，保留該場裝備效果直到整場結束，再卸下副手；這是明示一次性相容處理，沒有刪除物品或補發資源。舊樣本缺少歷史等級時按原演練角色等級補齊，並在載入時提示規則升級。

## EXP 配置增量（Checkpoint 09）

公開屬性 EXP 曲線與集中式候選政策的來源、公式、數值和取整限制詳見 [PROGRESSION.md](./PROGRESSION.md)。新建角色以 Lv.20、9,193 起始 EXP、每項 14 配置，已分配 6,540、可用 2,653；這是內部一致的明示起始設定，不是演練戰鬥獎勵。既有角色不補發 EXP、不降屬性、不把原三點換成任意貨幣；保留 legacy-fixture 分支與剩餘點數。完整 EXP 獲取、升級與掉落仍未實作。

## 首三項競技場與升級（Checkpoint 10）

[ARENA.md](./ARENA.md) 分開來源規則與候選細節：完整波次／總敵數、前序清關、每日一次且敗北照計、UTC 入場日期、體力與獎勵帳本。EXP 按公開式逐波計算，取整仍標不確定；怪物本體與 PL100 是原創樣本。首次／重複通關 Credits 採表列數字，當時的保證裝備採七模板原創固定樣本池；C13 起新系列改用下列品質 roll 候選，舊系列保留原政策。隨機怪物掉落、Token、RiddleMaster 仍未完成。

[Leveling Up 修訂65211](https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211#Formula) 的曲線以累計最近整數候選政策計算（Lv1 明示0），與 Level Table 的1/2/3/20/21/30/100/500錨點相符；仍不宣稱原服取整已驗證。每次升級的 AP 與十級 Mastery 資格先記錄，能力系統未完成前不提供虛假效果。

訓練仍不發 EXP、Credits 或裝備；Arena 與訓練的結算路徑獨立。動畫開關不再改變最低輸入間隔；UI採250ms保守間隔，符合 Action Speed 公開的每秒不超過4次上限，但不是原服節流算法的重建。

## 軍械庫整理（Checkpoint 11）

[ARMORY-ORGANIZATION.md](./ARMORY-ORGANIZATION.md) 記錄置頂、保護／鎖定互斥、倉儲與資格。舊版 UI 名為保護但欄位名 locked 的標記，明示遷移為 protected；沒有把既有標記升級成較強的鎖定。所有新的裝備 ID DOM 綁定也使用編碼，延續 C10c 匯入防護。

## 法術消耗與 tick 回復（Checkpoint 12）

[COMBAT-RESOURCES.md](./COMBAT-RESOURCES.md) 記錄新戰鬥採用的等級百分比消耗、單次向上取整、來源冷卻／等級門檻／目標上限及 tick 型 MP／SP 回復。已進行中的舊存檔明示保留 legacy-training-v1 到整個系列結束；不在讀取途中改變其消耗、冷卻、目標或回復。新的來源政策沒有改變舊角色属性、生命／魔力上限、傷害或治療量公式。

## 輸出傷害與品質 roll（Checkpoint 13）

| ID | 狀態／來源 | 本版採用與限制 | 驗收 |
|---|---|---|---|
| COMBAT-02 | Character Stats 65166、Physical Damage 65271、Spell Damage 65272；公開候選 | 對數基值、Fire 基礎倍率、80–120 步進 roll；最終 floor 與均勻抽樣為自選政策，完整防禦／命中／多重暴擊仍待補 | 三端點向量、Spirit 物魔分離、舊場精確重播 |
| EQUIP-03 | Equipment Basics 65026、Detailed Equip Characteristics 64966、Armory 65341；部分來源結構 | 先定品質再逐項 roll；非獨立通道依未取整平均。僅 Average／Superior／Exquisite 以明示 50/35/15 樣本權重生成；三槽錨點數值投影不是原版縮放 | 七模板邊界、RNG 次序、投影驗證、整理／重載不重抽 |
| MIGRATE-13 | 本地相容契約 | active 舊系列保留輸出與固定掉落政策直到結束；舊物品數值、身分與整理標記不重写。下一場切換新政策 | 真實 C12a 原始碼產生的連續指令／獎勵 fixture |

公式與限制分別見 [COMBAT-OFFENSE.md](./COMBAT-OFFENSE.md) 與 [EQUIPMENT-GENERATION.md](./EQUIPMENT-GENERATION.md)。沒有完整部位、詞綴、Forge／IW／Fusion 或熟練度效果的完成宣稱；既有原創素材不變。

## 藥水與 NPC 補給（Checkpoint 14）

| ID | 狀態／來源 | 本版採用與限制 | 驗收 |
|---|---|---|---|
| ITEM-01 | Items 65165、Character Menu 64958；公開比例／CD，取整候選 | 新系列生命藥水為 100% baseHp、魔力藥水 50% baseMp，40 行動冷卻；零内部時間。base 與 max 明確分離；舊系列保留原效果 | 精確 C13 重播、上限、零時間／RNG、40 次邊界、跨波／存檔 |
| SHOP-01 | Bazaar 64945；明述 NPC 生命補給／價格 | 生命藥水每瓶 50 Credits，單次最多 99,999；原型保存上限 999,999。只有此已知常備 NPC 商品開放；無市場庫存、折扣、出售或魔力補給杜撰 | Arena 收益→確認購買→消耗、資金與數量守恆、取消／失敗原子性 |
| SHOP-02 | 本機可靠性政策 | 單調購買 revision 與最近收據；精確最近重試 no-op，更舊或異參數拒絕；不累積無界歷史。戰鬥／波次等待禁止購買；遷移只加空帳本 | 重送、重載、舊存檔原進度／錢包不變 |

[RESTORATIVES.md](./RESTORATIVES.md) 與 [SUPPLIES.md](./SUPPLIES.md) 記錄來源及候選邊界。道具配置槽、其他藥劑、完整商店與玩家供需仍在完整施工清單；沒有提供任何原站外部補償。

## 能力所有權與配置（Checkpoint 15）

| ID | 狀態／來源 | 本版採用與限制 | 驗收 |
|---|---|---|---|
| ABILITY-01 | Character/Abilities64563、Leveling Up65211；初始1點推定 | EXP 帳本角色以目前等級推定總 AP；每10級一項 Mastery資格。先核對 EXP／level，不重加歷史 levelRewards，不包含訓練或外部加成 | Lv20=20AP／2Mastery、升級邊界、重載、舊角色不轉換 |
| ABILITY-02 | Abilities64891；來源階級／成本，乘後floor候選 | HP／MP／SP Tank前兩階；擁有和裝配分離，五個Major槽。階級1成本1AP／+10%；階級2成本2AP／+20%，分別Lv25／30／40 | 成本守恆、條件、購買無效果、槽位效果、base與max分離 |
| ABILITY-03 | 公開重置文字，十次邊界為候選 | 卸下不退AP；單項重置清空該能力／槽位並退已投入AP，最多十次免費。付費／全重置及Mastery擴槽未開放 | 十次用盡、無能力拒絕、保存計数、戰中拒絕、失敗原子性 |

[ABILITIES.md](./ABILITIES.md) 記錄來源、Lv1起始點及重置文字／表格衝突。舊系列保留無能力影響到結束，遷移不自動學習／裝配；既有角色資源及物品不重寫。全部能力樹、Persona、熟練度與其賺取公式仍保留在後續範圍。

## 資源上限公式（Checkpoint 16）

| ID | 狀態／來源 | 本版採用與限制 | 驗收 |
|---|---|---|---|
| VITAL-01 | Character Stats65166；社群公式，最終floor候選 | HP=500+10L+6END；MP=10+L+WIS；SP=1+Σ屬性/5。先保留SP分數，再依合法已裝配Tank乘有理倍率，最後只floor一次 | 純數值端點、27,000 oracle組合、實際坦克／藥水／Cure整合 |
| VITAL-02 | 相容與明示模型選擇 | 新角色採來源候選；舊存檔保留原資源式及當下三資源。戰外預覽／確認才能一次切換；提示魔力上限可能下降、提供備份。無EXP／物品／屬性／外部補償 | 精確C15完整Arena重播、預覽無副作用、升級守恆、戰中及重送拒絕 |

[VITALS.md](./VITALS.md) 記錄原頁警告、舊翻譯50／500差異與取整政策。這是採用目前 canonical 公開候選式，不宣稱原服取整或全部衍生值已驗證。命中、怪物、防禦及治療量仍有各自未完成部分。

## 有界保存與明示轉換（Checkpoint 17）

[AUDIT-RETENTION.md](./AUDIT-RETENTION.md)、[COMMAND-LEDGER.md](./COMMAND-LEDGER.md) 與 [ARENA-RETENTION.md](./ARENA-RETENTION.md) 定義 schema2。指令結果最多128筆／256KiB、戰鬥摘要64場、紀事最多100行／128KiB；舊成果保留累計。Arena 最近入場／目前系列與 lifetime clears 分開，不會因舊明細移除而開放同日重複或重發獎勵。

原始舊檔在確認前不覆寫，UI 提供完整原檔下載及只讀預覽。最多20MB的已支援schema1舊檔可經獨立恢復路徑轉換；新格式普通存檔仍限5MB。所有內容增加的戰鬥操作先驗證draft、保存容量及摘要，再提交；序列化本身不截斷任何內容。

本版本不新增活動或改傷害規則。來源 Battles64927 明述紀事只顯示最近100行；工程 byte 上限、摘要與typed command協定為本地可靠性政策。詳見檢查點報告中的長期測試與已知單分頁限制。
