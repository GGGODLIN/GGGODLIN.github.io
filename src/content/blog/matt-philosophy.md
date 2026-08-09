---
title: 半年 20 萬星的祕密是「少」：Matt Pocock 的哲學，我信六條、不信一條
description: 拆解 Matt Pocock 的 skill 設計哲學（觸發歸人、認知負擔是主導權的價格、spec 是會過時的快取、流程主導權不外包），用我在大量吸收他之前先取樣的九軸立場當對照：六軸同構、三軸對立，而三個對立收攏成同一條分歧：稀缺的人類注意力該花在哪。那一條，就是我不信的那一條。
pubDate: 2026-08-09
tags: ["claude-code", "skills", "matt-pocock", "philosophy"]
---

# 半年 20 萬星的祕密是「少」：Matt Pocock 的哲學，我信六條、不信一條

前陣子在看 AI 寫程式的工具鏈，注意到 [Matt Pocock](https://github.com/mattpocock) 開源的那套 [mattpocock/skills](https://github.com/mattpocock/skills)。

他以前是職業聲樂與口條教練，後來轉做前端與 [Total TypeScript](https://www.totaltypescript.com/)，這兩年開了 [AI Hero](https://www.aihero.dev/) 全職教人怎麼跟 AI 一起寫程式。他那包 skill 庫在半年內衝到約 20 萬星（截至 2026 年 8 月的快照）。星數是門票，真正值得看的是他的三個核心選擇，方向跟他點名的那幾套當紅框架剛好相反：

- 不做全域設定檔。有人問他能不能做全域的 skill 設定，他在 X 上回了三個字：「Config is death」（設定即死亡，[原文](https://x.com/mattpocockuk/status/2082445901612650558)）。
- 預設關掉 hook，不讓模型自動觸發 skill。
- 把整套 skill 庫常駐的 context 負擔壓在約 600 tokens。這是他 2026 年 7 月底的自述、不是我量的：「整個 library ~600 tokens context load, I constantly battle to lower that」（[原文](https://x.com/mattpocockuk/status/2082456422428586316)）。

先給個聲明：以下關於 Matt 立場的重建，全部來自他的公開 repo、推文與訪談，他本人並沒有核對過這份比較。

## 唯一的組織軸：誰能觸發？

一般 skill 庫的整理習慣是按功能分類：重構一區、測試一區、文件一區。但他在 `.agents/invocation.md`（[原文](https://github.com/mattpocock/skills/blob/main/.agents/invocation.md)）裡寫得很乾脆：

> The one axis that splits them is invocation — who can reach it

（把它們切開的唯一一條軸是觸發：誰碰得到它。）

實際做法也很乾脆：截至 2026 年 8 月，他對外發布的 skill 裡過半直接在標頭寫死 `disable-model-invocation: true`，不給模型自動呼叫，只留給人類手動敲命令。

這馬上爆出另一個問題：那十幾支要人手動敲的指令，誰記得住？他的解法是補一支叫 ask-matt 的路由 skill，開頭第一句就戳破現實：

> You don't remember every skill, so ask.

（你不會記得每一支 skill，所以用問的。）

注意他沒有因此把觸發權還給模型。記不住可以用問的，但按下去的手必須是人的。

## 認知負擔不是成本，是人類主導權的價格

把模型自動觸發關掉，等於把記憶負擔硬生生塞回人類腦袋裡。他不是不知道這有成本，而是刻意為之。在 writing-for-agents 這支 skill 裡，他把這件事拉到哲學高度：

> The human is the index. Not a cost to minimise — it is the price of human agency; spend it where human judgement matters, remove it where it does not.

（人就是索引。這不是該最小化的成本，是人類主導權的價格；花在人的判斷真正重要的地方，在不重要的地方拿掉它。）

先前有人在 X 上邀他把這套做成完整的自動化框架，他在回覆裡婉拒（[原文](https://x.com/mattpocockuk/status/2081826481160761376)）：自己完全不介意稍微增加使用者的認知負擔，只要能換取 AI 更好、更可控的產出。skill 是拿來放大人的能力的，不是拿來幫 agent 搶控制權。

## spec 是會壞掉的快取，ADR 才是例外

他自己說，大家老是把他跟 SDD（spec-driven development，規格驅動開發）綁在一起。今年八月初他在 X 上開串澄清（[原文](https://x.com/mattpocockuk/status/2083563195671667176)）：

> Everyone always confuses my skills with spec-driven-development. It really annoys me. The specs my skills create are intended to be deleted immediately - not kept around, or treated as source code. … The specs aren't that important. They're just a projection of the decisions made during grilling.

（大家老是把我的 skills 跟 spec-driven-development 搞混，這讓我很煩。我的 skills 產出的 spec 本來就是要立刻刪掉的，不是留著、也不是當原始碼看待。……spec 沒那麼重要，它們只是 grilling 過程中所做決策的投影。）

grilling 是他的需求訪談流程：動工前讓 agent 一題一題把你腦裡的答案挖出來。所以這句話的意思是：真正的產出是那場訪談裡做掉的決策，spec 只是決策的投影。

開頭講得很絕：立刻刪掉。但同一串被讀者追問「那為什麼不整理保存」之後，他自己把說法修細了（[原文](https://x.com/mattpocockuk/status/2083565169313980721)）：

> Specs are a cached representation of the code / As soon as a new commit arrives, the cache will likely go stale / Agents reading that stale cache will take it for ground truth / So, archive your specs

（spec 是程式碼的快取表示。新的 commit 一到，這份快取多半就過時了。讀到過時快取的 agent 會把它當成真理。所以，把你的 spec 歸檔。）

從「立刻刪」修到「歸檔」。注意他說的歸檔是把 spec 移出 agent 隨手 grep 得到的範圍，不是留在 repo 裡當活文件。同一串最後收出一個明確的邊界：

> ADR's and CONTEXT aren't specs, they are docs - and I make exceptions for them specifically because they describe the things code cannot.

（ADR 和 CONTEXT 不是 spec，是文件。我特別為它們開例外，因為它們描述的是程式碼本身無法表達的事。）

描述程式碼現況的文件只要有新 commit 就會過時；但記錄「當初為什麼這樣選」的決策紀錄（ADR），價值反而不會被時間洗掉。

## 流程主導權，絕不外包

把上面幾點串起來，核心就是一句話：own the process（掌握你的流程）。

他在 repo 的 README 第一段就點名 [GSD](https://github.com/gsd-build/get-shit-done)、[BMAD](https://github.com/bmad-code-org/BMAD-METHOD)、[Spec-Kit](https://github.com/github/spec-kit) 這幾套當紅的流程框架：它們用「擁有流程」來幫你，代價就是拿走你的控制權：一旦 AI 在框架深處走偏或出包，使用者連想除錯都找不到接線點。而對他自己的 skills，README 給的建議非常白話：

> Hack around with them. Make them your own.

（拆著玩，改成你自己的。）

連安裝方式都被他在 README 裡明講成兩種哲學：走 plugin 安裝是「訂閱」（整包唯讀、跟著他更新）；跑 skills.sh 是「fork」（檔案複製進你的專案、隨你改）。他更早的推文把立場說得更直接：把 context 的控制權交給框架，會讓事情難除錯得多，我的建議是掌握你自己的流程（[原文](https://x.com/mattpocockuk/status/2044029094942159126)）。

這裡順帶修正我自己的兩個舊印象。一，我先前查他的 repo 時，廢棄目錄裡還留著幾支退役的 skill 當公開墓地；2026 年 8 月再看，目錄已經清空，改成退役即刪除、在變更紀錄裡註明替代方案——「他會公開淘汰 skill」依然成立，「留著舊檔」已經走入歷史。二，他的 skill 沒有「一定要短」這回事：短的是那些一句話的基元（他最有名的 grill-me 全檔只有 7 行），把多個步驟串起來的編排型 skill 其實不短，他要求的核心指標是「可預測性」，而不是行數。

## 換個環境，能獨立推導出同一套結論嗎？

這套哲學聽起來很有道理，但它究竟是個人偏好，還是客觀條件下的必然？

我拿自己做過一次測試。在深入研究他的公開論述之前，我讓 AI 對我跑了一輪防污染取樣：它出題、一次問一題，每題附一段「猜我會怎麼答」的建議答案讓我糾正或推翻，全程不出示 Matt 的說法，防的就是他的答案污染我的答案。那次取樣記下了我在九個設計軸上的原生立場：觸發權、context 預算、spec 地位、框架容忍度、決策邊界、驗證角色、不確定性處理、生命週期、終局觀。

九軸是訪談當場長出來的分類（原本只規劃七軸），六同三對立則是事後逐軸判讀的結果：同構的六軸是 spec 地位、框架容忍度、決策邊界、不確定性處理、生命週期、終局觀；對立的三軸是觸發權、context 預算、驗證角色。

這裡誠實交代兩個脈絡：第一，取樣當時我是「未完全吸收」，不是完全沒看過他的東西；第二，同構的六軸裡，決策邊界那一軸（「事實讓 agent 去查，決策歸人拍板」）是我 2026 年 7 月從他的 grilling 概念吸收過來的，不算獨立收斂。所以同構軸我不逐條展開，只挑有外部證據撐腰的那條講。

## 時間戳不會騙人：同構最強的一軸

六個同構軸裡，最強的一條是「spec 是可拋棄的快取，真正的資產是決策過程」。

這條軸裡最能驗時序的那一段（「真正的資產是決策紀錄」）有硬性的 git 佐證：我在專案裡建立 `decisions/` 目錄、寫下第一筆 ADR，是 2026 年 5 月中的事；Matt 在 X 上公開講出「ADR 是例外」是 8 月初；我的紀錄早了整整兩個半月。而我當時本機唯一可能受他影響的來源，是他那支帶 ADR 概念的 grill-with-docs skill：翻了它引入以來 81 天的使用紀錄，呼叫次數是 0。

至少在「決策紀錄該單獨留下」這件事上，我們都不是在抄對方。ADR 本來就是軟體工程界行之有年的實踐，我們是在各自的開發場景裡，獨立走到同一條路上。

## 三個對立軸，本質上是同一件事

至於對立的三個軸：自動觸發權、context 預算，以及驗證外部化（程式碼品質由誰把關：他親眼讀每一行，我交給自動檢查、機制發出警報才介入）。這三個表面上是技術選擇，底層其實只問同一個問題：人類稀缺的注意力，到底該花在哪裡？

Matt 的答案是把注意力花在「每一次觸發都自己決定」跟「親眼審過每一行程式碼」。他公開講過的立場很強硬：每一行程式碼都他自己審過，所以他做的不是 vibe coding。

我的答案剛好相反：我的注意力只拿來做最終拍板，拍的是範圍跟取捨；實作細節我原則上信任前沿模型的選擇，品質由機制把關、收到警報才介入。至於自動觸發、狀態監控跟自動驗證，全部交給機器與自動化 gate。理由很簡單，我不信任自己的記憶力：紀錄顯示，只要靠「大腦記得」去維持紀律，我一定會漏失 🤣

## 一個可能的解釋：教育者 vs 操作者

這條分歧不是誰對誰錯，而是兩人的使用場景有結構上的根本差異（此為本文推論，非 Matt 本人自述）：

Matt 的角色是教育者。開頭那個聲樂教練的背景在這裡接上了，教人本來就是他的本業。他的 repo 定位是「Straight from my .agents directory」，受眾是他官網自述的十萬名以上學習者。他的 skill 要跑在大量彼此陌生的機器上，不能假設任何一台裝了跟他一樣的東西。所以自訂設定檔、自動 hook、強制檢查機制，對他來說全是靠不住的選項。在所有人的電腦裡，唯一保證預先裝好的執行環境，只有「人類的認知負擔」。

而我的角色是操作者。我的全套自動化規則只在我自己的本機運作，根本不需要被其他人複製。所以我可以把本機 hook、自動檢查 gate 跟稽核日誌開滿，用自動化機制來確保紀律，完全不需要依賴我那不可靠的記性。

## 不同的路線，相同的底線

路線的分歧講完了，剩下的是底線。我們對這件事的共識完全一致：拍板權永遠在人身上。

他公開強調範圍決策必須由人類操刀：「Scope decisions are decisions that you need a human for.」（[原文](https://x.com/mattpocockuk/status/2082775680249376914)）。他的訪談 skill 早期版本也把權責拆得很清楚：

> If a fact can be found by exploring the environment, look it up rather than asking me. The decisions, though, are mine.

（如果事實能透過探索環境找到，自己去查，別來問我。但決策是我的。）

我在那次取樣時給出的結論，也是完全相同的精神：推導歡迎，拍板歸人。

回到標題。我信的六條，是九軸裡那六個同構軸——其中決策邊界那條是我直接跟他學的，其餘五條是兩個場景各自推導、撞到同一批結論。我不信的那一條，是三個對立軸底下共用的那條根：把稀缺的注意力花在「每次觸發自己來」跟「親眼讀每一行」上。不是因為他錯，是因為我的場景撐不起這種花法：我只有一台機器要顧，跑的流程卻早就多到眼睛顧不完，而且紀錄一再證明我的記性靠不住。他信人，我信機器；但拍板的位子上，我們放的都是人。
