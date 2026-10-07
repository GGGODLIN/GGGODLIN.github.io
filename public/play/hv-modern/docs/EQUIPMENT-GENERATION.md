# 裝備品質與獨立數值 roll 候選模型

日期：2026-10-07。模組：`src/equipment-generation.js`。模型識別：`quality-roll-fixture-v1`。

## 範圍與原創邊界

這是**部分來源規則 + 明示原創投影**，不是完整 HV 裝備生成器。它讓新增的 Arena 樣本獎勵可以在品質先決定之後，為正值攻擊／魔力／防禦各自抽取 roll；七件原創模板的名稱、描述、部位、種類與手數保持不變。初始物品及舊 `arena-fixture` 獎勵不重新抽樣、不重算、不附加生成記錄，也不補發物品。

原始碼是本專案原創。沒有複製原站程式、介面、圖片、完整裝備池或玩家資料；沒有登入原站、接入帳號、加入外部資源或發布網站。模組不自行發獎、修改存檔或啟動戰鬥，接入時須由既有 Arena 的一次性獎勵結算呼叫。訓練遭遇仍不能因此獲得獎勵。

## 本次核對的公開來源

2026-10-07 讀取下列 live wiki 頁面；表內編號是讀取內容頁尾的 `oldid`。這份記錄**不等同另外成功取回歷史修訂端點，也不證明所有段落已與 Persistent 0.91 原服核對**。

| 來源 | live URL 與頁尾修訂 | 本次使用內容 |
| --- | --- | --- |
| Equipment Basics | [live](https://ehwiki.org/wiki/Equipment_Basics)，65026 | Exquisite 以上掉落時指定玩家等級；較低品質先保持未指派，首次穿戴才指定 |
| Detailed Equip Characteristics | [live](https://ehwiki.org/wiki/Detailed_Equip_Characteristics)，64966 | 現代規則先決定品質，再於品質範圍內生成數值；品質範圍與高階品質取得方式 |
| The Armory | [live](https://ehwiki.org/wiki/The_Armory#Stat_Fusion)，65341 | 有對應 Binding 的數值分別抽取；沒有 Binding 的數值由前者平均決定；Fusion 與 Limit Breaker 範圍 |

社群文件不是伺服器實作證據。以下分開列出來源結構與本專案自選數值，不把測試通過當成原服一致。

### 品質範圍

| 品質 | 基礎 roll 範圍（含端點） |
| --- | --- |
| Crude | 0–40 |
| Fair | 30–70 |
| Average | 60–100 |
| Superior | 90–130 |
| Exquisite | 120–160 |
| Magnificent | 150–180 |
| Legendary | 170–200 |
| Peerless | 200 |

`QUALITY_ROLL_RANGES` 保存上述範圍，不能據此認定所有品質都已加入本專案掉落池。

Peerless+ 的下界存在來源衝突：Detailed Equip Characteristics 為 201，The Armory 為 200；兩者上界都是 249。Ultimate 為 250。兩者涉及 Stat Fusion／Limit Breaker，**不自然掉落**，本模組也不實作 Fusion，不為衝突任選一個下界。它們不在本模組的範圍常數或掉落權重中；既有全品質顯示清單可以保留。

### Binding 與目前三種正值通道

- attack：以 Slaughter／物理傷害概念對應目前樣本 attack
- magic：以 Destruction／魔法傷害概念對應目前樣本 magic
- defense：以 Protection／物理防禦對應目前**通用 defense 是原型近似**；未建立完整物理／魔法防禦與減傷系統
- burden：沒有本模組的獨立 Binding roll，依本件所有正值通道 roll 的未取整平均投影

「分別抽取」有來源；**離散整數均勻分布、統計獨立性及實際抽樣算法未驗證**。零值通道保持零，不創造原模板沒有的能力，也不進入平均或消耗 RNG。

## 明示原創生成政策

1. 品質權重：Average 50%、Superior 35%、Exquisite 15%。這是 `authored-50-35-15`，不是 HV 品質掉率，也不由玩家等級、難度、Hath 或任何外部加成推導
2. 模板：傳入清單等機率選取；正式呼叫應傳入現有七件 `STARTER_ITEMS`。七模板等權是原創採用值，並非原站模板機率
3. 每個正值通道在品質範圍內使用 `min + floor(rng × (max − min + 1))`，是可重播的離散均勻候選
4. attack、magic、defense 使用以下**原創錨點投影**，不是已驗證的 HV 基礎值或等級縮放式：
   - `Math.round(templateStat × (0.5 + roll / 200))`
   - 零模板值直接為零
5. `meanRoll = 所有正值通道 roll 總和 / 通道數`，儲存並使用未取整值
6. burden 使用 `Math.round(templateBurden × (1.5 − meanRoll / 200))`。這個反向線性式及取整也都是原創採用值
7. Average／Superior 新物品的 `level` 為 null；Exquisite 為呼叫者傳入的目前等級。**等級只記錄資格，沒有捏造或宣稱已驗證的 level scaling coefficients**

完整類型池、全部部位、詞綴／後綴保證、PAB、命中／暴擊／格擋／干涉、原版屬性範圍、等級缩放、品質概率、難度／幸運修正及稀有模板權重均未完成。新樣本仍然保留原創名字與描述；例如來源中 Superior 的後綴保證尚未實作，不能把名稱原樣保留誤認為完整品質生成。

## API 與存檔契約

- `generateEquipment({ templates, id, level, rng })` 回傳新物品，不修改模板；options 必須完整且只有這四個鍵
- `id` 必須符合 `^reward-arena-[1-9]\d*$`，且不超過 200 字元。由結算呼叫者建立唯一 ID；本模組不配置序號或判定重複獎勵
- `level` 接受本引擎的 1–500 整數，所有品質都先檢查；即使預計抽中低品質也不能傳入壞值
- `rng` 每次回傳有限的 `[0, 1)` 數值。固定呼叫順序為品質 → 模板 → 正值 attack → 正值 magic → 正值 defense；沒有 burden 抽樣
- 可預先判定的壞輸入在 RNG 前拒絕：無效 ID／等級／清單、重複模板、非純資料物件、getter、危險鍵、負／非有限錨點、完全沒有正值通道等
- 無效 RNG 回傳值會拋出錯誤；抽樣函數已經消耗的外部 RNG 狀態無法由此模組回復。結算呼叫者負責合法 RNG 與交易原子性
- 新物品 `origin` 為 `quality-roll-fixture`、`templateId` 為原模板 ID；位置固定 inventory，pinned／protected／locked 固定 false
- 其餘模板欄位保留；目前 Binding、Forge、IW 不增加任何新功能

生成記錄只有以下四個鍵：

```json
{
  "model": "quality-roll-fixture-v1",
  "rolls": { "attack": 90, "magic": 130 },
  "meanRoll": 110,
  "distribution": "authored-50-35-15"
}
```

`validateGeneratedEquipment(item, templates)` 回傳 boolean，檢查精確物品／metadata／roll 鍵、純資料形狀、已支援品質、ID、模板、不可變模板 metadata、每個 roll 的範圍、未取整平均及重算結果。低品質物品首次穿戴後可保留合法已指派 level；Exquisite 不能是 null。容器、保護／鎖定互斥、是否已裝備及等級穿戴資格仍由引擎既有驗證負責，不因生成器通過而略過。

validator 不接受 `starter-fixture` 或舊 `arena-fixture`，也不將其遷移成新物品。引擎必須保留獨立的舊物品驗證分支。本機資料一致性檢查不是反作弊簽章，無法證明合法形狀的資料未曾被人重寫。

`summarizeRolls(item)` 只回傳簡短顯示文字，例如 `物攻 90 · 魔攻 130 · 平均 110`；顯示平均最多兩位小數，不回寫、不改計算，舊物品回傳空字串。顯示 helper 不替代完整存檔驗證。

## 已驗證向量與限制

`node --test tests/equipment-generation.test.js`：16 項通過，0 失敗。

- Superior 曙光長刃：attack roll 90、magic roll 130 → attack 28、magic 2、defense 0、burden 7；反向 130／90 → attack 33、magic 2、burden 7
- Exquisite 餘燼法杖：120／160 → attack 9、magic 46、defense 0、burden 2
- 專用 burden=200 測試錨點、60／61 roll → meanRoll 60.5、burden 240，確認平均未先取整
- 三個正式品質、全部七模板及兩端點，品質分段边界、零通道消耗次數、生成前失敗、不改模板、序列化重載及合法後續 level 指派
- 危險鍵、原型、accessor、未知 metadata、越界 roll、錯誤投影、舊 origin 和非法 RNG 拒絕

上述只驗證本文件的候選模型，不宣稱原服同 seed、同品質、同面板或同等級結果。
