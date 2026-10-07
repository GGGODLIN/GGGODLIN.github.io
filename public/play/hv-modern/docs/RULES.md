# VESPER 暮界紀行：規則與驗證紀錄

日期：2026-10-07。引擎版本：`persistent-0.91-training-v3`。存檔 schema：1。

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
| SKILL-03 | 原創訓練採用 | Fire 6 MP、冷卻 2；Cure 10 MP、冷卻 3；藥水冷卻 4。法術冷卻以後續非道具行動推進。MP 折扣使用當前有效 Spirit 狀態，先驗證後扣費 | 不足／冷卻失敗原子性 |
| COMBAT-01 | 原創訓練採用 | 全部敵方數值、命中、8% 玩家暴擊、1.5 暴擊倍率、浮動、抗性和傷害公式皆為樣本；沒有假裝重建 HV 的複合減傷與多重暴擊 | 決定性重播、完整通關 |
| CMD-01 | 現代化可靠性 | 接受的 `commandId` 在整份存檔中只執行一次；同 ID 不同動作／目標拒絕。重送回傳已完成事件與 `duplicate: true`；UI 不应再次播放。所有失敗不變更 turn、RNG、冷卻或資源 | 當場／跨波／跨遭遇／重載重送 |
| EQUIP-01 | 原創測試模型 | 七件固定裝備、weapon/body/offhand 三槽；非完整原版部位系統。戰鬥內禁止換裝或配點；不在戰鬥內換裝；戰外生命等資源遵循 RES-03；保護標記只屬本機整理 metadata；無綁定／Forge／IW 的虛假操作 | 配裝比較、拒絕、屬性點守恆 |
| SAVE-01 | 本機可靠性 | JSON 保存 seed 狀態、排程、冷卻、Scan、結果與收據。未知版本、缺欄、越界、非有限資料、危险鍵和結構損壞回傳 null，不默默重置原資料 | 回存重播、無效存檔集 |
| END-02 | 0.91 時期公開明述；原服案例待驗證 | 非最後一波清怪後停在 round-complete；按「繼續」／Space 才生成下一波。此等待不是玩家指令，不推進 turn、tick、冷卻或資源；仍在同一戰鬥系列，不能中途換裝或營地恢復 | 等待保存、重送、全資源保留及禁止跨波跳過 |
| END-01 | 結構採用／獎勵未實作 | 最後一波清空才通關；只結算一次。撤退消耗暫定時間，敵方可先致死；敗北結果先記錄、戰外三資源再即時恢復。完成波次不補資源或冷卻 | 跨波保留、勝利一次、撤退致死 |

### 已知公式（全部為訓練樣本）

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
- Cure 回復 floor(maxHP×0.3 + magic×0.4)；HP 藥水回復 floor(maxHP×0.5)；MP 藥水回復 floor(maxMP×0.4)，皆封頂

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

此先後次序為本原型的固定、可測規格。所有涉及原版隱藏判定、同時事件優先、完整能力的對照仍待完成。對滿資源的治療／藥水，以及重複 Scan 的拒絕是明示的防誤觸訓練差異。未實作的自然戰鬥回復、藥劑 tick 效果不能用任意數值代替。

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

本機存檔不是防作弊或權威多人服務；讀取驗證只防損坏與未支援結構，不能證明玩家未修改存檔。underscore 欄位是實作狀態，含未公開排程，不應渲染成免費戰術資訊。schema 1 明示支援 training-v1/v2 → training-v3：先驗證舊資料；保留進行中的資源與過往結果，缺少 phase 時補 combat。已結束系列依新採用的戰外恢復規則回滿三資源，並保留原來的 finalVitals；不補道具、不重發獎勵。其他未知版本仍拒絕。超過 5,000,000 UTF-8 bytes 的存檔拒絕載入。未做網路帳號、跨裝置同步、伺服器權威結算或原站資料存取。

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
