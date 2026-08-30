---
title: "一個模型不夠：五軸交叉審的 code review 工作流"
description: "四個 AI reviewer 全漏掉一顆死掉的 Save 按鈕，第五個抓到了。從這個案例拆我的 /pr-review command 三個設計哲學：視角是餵出來的、找的不准自己驗、模型不可信的部分用程式保證。"
pubDate: 2026-07-08
tags: ["claude-code", "code-review", "multi-model", "workflow", "review-governance"]
---

# 一個模型不夠：五軸交叉審的 code review 工作流

前陣子某個工作專案的 PR 出了一顆很好笑的死按鈕。新增頁面用了 Shopify 的 `<ShopifySaveBar>`，`handleDiscard`、`isLoading`、`isDirty` 都傳了，唯獨漏傳 `handleSave`。元件內部沒拿到 `handleSave` 就靜靜地什麼都不做。Shopify admin 頂部那顆 Save 按下去完全沒反應。沒有 error、沒有 type error、build 全過。

這個 PR 過了我的 /pr-review command，那一場實際出勤五個 reviewer 視角。主模型的兩個 reviewer 分批把整包 diff 看完，沒抓到。Codex 中性視角沒抓到。Codex 紅隊專門負責唱衰，也沒抓到，它提的另一條疑點後來反而被證明是誤報。最後是 Gemini Flash 抓到這顆死按鈕，標成高嚴重度，複查確認屬實，進了必修清單（報告裡的 Must Fix 區）。

四個看過都沒抓，抓到的那個還是全場最小咖：Gemini 3.5 Flash，推理力度只開 Medium 檔，比主模型軸跑的旗艦模型小了好幾號。

## 為什麼前四個都漏

這題我後來認真追過。第一個直覺解釋是「大 PR 分批審，相關的檔被切到不同批，所以看不出對照」，聽起來很合理，回去翻當時 review 的 session 紀錄取證卻直接被推翻：同一個 PR 其實新增了兩個都用 `<ShopifySaveBar>` 的元件，一個有傳 `handleSave`、一個沒傳，而這兩個檔在同一批裡、被同一個主模型 reviewer 一起看過。對照所需的線索它全部拿在手上，還是沒抓。

再看抓到的那邊。Gemini 在同一份報告裡同時 flag 了兩條 SaveBar 的 prop 缺失，一條真、一條誤報，行為上像是在對同一份 diff 裡的類似結構做橫向比對：兩個長得像的元件擺在一起，它會去問「為什麼這個有傳、那個沒傳」。至於它為什麼有這個偏好，session 查不出來；主模型跟 Codex 為什麼沒做這種比對，同樣沒證據，我不編故事。

能確定的只有結果：視野沒問題，差在盯的軸線。這也是整套工作流的起點。換更強的模型，同一個視角還是同一批盲點，要加的是視角數。

## 五軸長什麼樣

/pr-review 是我自己寫的 Claude Code slash command，模型軸有五條：

1. **主模型多 reviewer**：按語言路由（TS / Python / generic），條件觸發 security reviewer，讀 spec、讀 codebase，context 餵好餵滿
2. **[Codex CLI](https://github.com/openai/codex) 中性視角**：只給 diff，什麼都不補
3. **Codex 對抗式紅隊**：同一個 Codex，prompt 換成「假設這個 PR 會炸，去找哪裡炸」
4. **Gemini Pro**：第三家模型的獨立視角。跑法是把 review prompt 丟給 [Google Antigravity](https://antigravity.google/) 的 CLI（`agy`）執行、收回輸出
5. **Gemini Flash**：同樣走 Antigravity，模型小一號。開場那顆死按鈕就是它抓的（那一場 Pro 沒出勤）

模型軸之外還有兩層不是模型的。

[sem](https://github.com/Ataraxy-Labs/sem) 是 entity 級的依賴圖 CLI，review 開跑前先算這次改動的影響範圍：被改的函式跟元件有幾個依賴者、各自有沒有測試，0 個測試的會被特別標出來。這份是確定性資料，只餵主模型當背景，讓它一開始就知道「改這裡會炸到誰」。定位是參考不是判決：靜態解析算得到的它算，動態載入的算不到，所以依賴數當下限看。

[react-doctor](https://github.com/millionco/react-doctor) 則是 React 專用的機械掃描，React PR 才跑。掃出來的結果不餵任何模型軸，等最後彙整報告時才並進去，當一條不會幻覺的基準線。

五個模型視角加兩層非模型的資料，最後收成一份繁中比對報告，各軸 finding 並陳。每條 finding 至少帶五個欄位：哪一軸抓的、原文位置、嚴重度、複查結果、最後歸到哪一區。這套配置不是一開始就設計好的，是踩坑踩出來的，回頭看沉澱成三個設計哲學。

## 哲學一：視角差是餵出來的

五軸拿到的輸入不一樣，而且是故意的。主模型軸餵滿：spec / plan 全文、sem 算出來的影響範圍、跨語言的健康檢查表（重用、品質、效率、設計腐化四類通用檢查項），能給的 context 全給。Codex 則刻意餓著，只給 diff，command 內甚至明文禁止把檢查表跟 sem 資料注入 Codex 的 prompt。它的定位是「像剛收到 PR 通知信、還沒 checkout repo 的同事」：看不到全貌，反而不會被全貌帶著走。

你想要不同視角，就餵不同的 context，不是開兩個一樣的然後求它們想得不一樣。

真例是另一個 67 個檔案的大 PR。Codex 抓到前端 fetch 的 `/widget/rewards/*` 在後端 router 根本沒註冊，上線即全 404，P1 等級。主模型沒抓，但它不是粗心：它讀了 spec，spec 寫明後端 out-of-scope，所以沒查。反過來，主模型獨抓一條 `product.image.altText` 沒 escape 就進 innerHTML 的 XSS，這條要對照 codebase 既有的 escape 慣例才看得出異常，餓著的 Codex 沒這份 context，自然看不見。然後兩邊同抓另一顆死按鈕：餘額載入失敗時的重試按鈕只有畫出來，click 事件根本沒接，按了一樣沒反應。

兩邊都對，並列才看到全貌。接下來拆兩個讓視角真的分開的設計：spec 決定餵滿的那一軸吃什麼，紅隊人格決定餓著的那一軸往哪個方向想。

### spec 是 reviewer 的憲法

餵滿的那一半裡，最重要的一份 context 是 spec。command 會自動偵測 PR 裡的 spec / plan 檔，餵給 reviewer 當裁決依據：spec 明標 non-goal 的東西不准 flag，直接判 OUT_OF_SCOPE。附帶一條誠實機制：spec 作者跟 PR 作者是同一人時，報告必須標註利益重疊，畢竟自己寫 spec 給自己的實作免罪太容易了。

這裡有個生態上的共鳴。[superpowers](https://github.com/obra/superpowers)、[OpenSpec](https://github.com/Fission-AI/OpenSpec) 這類 spec-driven 開發套件，大家過去講的消費場景是兩個：未來的 agent 讀 spec 接手、開發過程中人類對齊意圖。code review 是第三個。而且受益最大的是不熟這塊業務的同事：沒有 spec 他只能看 diff 猜意圖，有 spec 連 non-goal 跟邊界都有據可查。當年寫 spec 的投資，在 review 階段回收。

另一條讀者可以直接偷走的紀律叫 search-before-flag：reviewer 要 flag「缺 X / 沒處理 Y」，必須先 grep codebase 附上搜尋證據（搜了什麼、找到什麼，一起寫進報告），沒證據不准 flag。不然就會拿到「你沒處理 null」這種幻覺（其實上游 middleware 全包了）。唯一例外是 strict-liability 三件套，直接 flag 不用搜：硬編 secret、字串拼接 SQL、eval 或 innerHTML 塞使用者輸入。自己隨手 prompt「幫我 review」通常就是缺這條，所以 finding 一堆噪音。

### 紅隊軸：同一個模型，換個人格

五軸裡最有戲的是紅隊。先看它的代表作，另一個 PR 的隱形 lock icon：`<Icon source={LockIcon} tone="text-inverse" />`。`text-inverse` 不在 Polaris `Icon` 的 `Tone` 型別裡，TS 太寬鬆不擋、runtime 不 throw，icon 靜默 fallback 成深色，放在深色背景上幾乎隱形。主模型兩輪沒看到，Codex 中性沒看到，Codex 切到紅隊模式抓到，複查 CONFIRMED、進 Must Fix。同一份 diff、同一個 Codex，差別只是 prompt 人格。

誠實數據也要給。挑 16 個 review session 統計紅隊的複查結果：41 條被確認、36 條被駁回，駁回率大約 47%。紅隊一半是噪音，它的獨有命中集中在 dark mode 可見性、fail-open、跨日邏輯（`11:60 PM` 這種）。一半是噪音的軸還能用嗎？能，前提是下一個哲學。

## 哲學二：找的不准自己驗

這條借鑑自 Cloudflare 的 [security-audit skill](https://github.com/cloudflare/security-audit-skill)：找到 finding 的 agent 不准自己驗。主模型驗其他軸的 finding，Codex 反過來踢館主模型的 finding，用的是獨立的驗證 prompt、不帶紅隊人格（這個反向踢館還是後來才補的，之前主模型的 finding 沒人驗、直接進 Must Fix，想想蠻不公平的）。

驗證跑四個測試：

1. exploitation：構造得出具體 input 觸發嗎
2. impact：真炸了拿到什麼？「learn field names」是 LOW，資料外洩或提權才 HIGH 以上
3. baseline：同 pattern 全 codebase N 處長期在用都沒炸，這條特別在哪？答不出就 REFUTED
4. mitigation：別的層（middleware / DB constraint / framework 預設）是不是早就擋掉了

四個測試跑完，判決不是只有二元：CONFIRMED（確認）、REFUTED（駁回）之外，還有 PARTIAL（部分成立）跟 INCONCLUSIVE（查不出來）兩個中間態。

baseline 是最好用的誤報殺手。實戰一例：主模型 flag 某第三方元件路徑硬編了一個租戶代號，擔心其他租戶跑到會 404。Codex 複查沒有直接判「查無實據」，它先去 grep 同 pattern，在 codebase 另外 4 個地方找到一模一樣的硬編、都長期在用沒出過事，判 REFUTED、降「參考用」。差別在 REFUTED 附的是反證（4 處平行案例），不是「我沒看到問題」。

補一個反直覺的：多軸同抓（consensus）也不代表免驗。兩個軸犯同一種缺 context 的錯誤時，正好互相免罪，所以 consensus 條照樣走輕量 baseline 檢查。

然後是兩條 guardrail：任何 finding 不准被丟掉，被駁回的照樣進報告、掛「參考用」區、雙方證據並陳；REFUTED 只代表另一軸找到反證，驗證軸自己也是模型、也會錯。過濾放在排序，不放在刪除。模型只能排序，人才能否決。

## 哲學三：模型不可信的部分，用程式保證

有四個環節我不信任何模型的自我回報，全部交給確定性程式：

1. **審的是不是最新版**：worktree 隔離 + fetch 後比對 API 的 commit hash。這條是真踩坑換來的，本地 stale branch 曾讓一整輪 comment resolution 的判定全錯
2. **每個檔都看過了嗎**：改動檔案集合由程式建，reviewer 每個檔必須回報 finding、或標 `REVIEWED_NO_ISSUES`、或標 `INTENTIONALLY_SKIPPED` 加理由（報告裡給這套機制一個白話名字，叫「點名冊」）。程式拿回報聯集對檔案集合做集合差，差集非空就強制重派
3. **大 PR 漏檔**：超過 15 檔或 800 行 diff 強制分塊，單一 reviewer 最多抱 15 檔
4. **行號指對了嗎**：每條 finding 附 1-3 行原文引用當 anchor，程式重新對行，對不中就標 FAILED、報告寫「需人工確認」，不亂 pin

一句話：模型負責判斷，程式負責誠實。

順帶一提，這套流程自己也會被 review。現在的 dispatch checklist 是某次抽查發現有兩個步驟「11 次執行、0 次真的跑過」，才升格成逐項打勾清單的。寫在 command 裡的步驟，模型未必真的執行，這也算是老問題了。

## 拍板是查表，輪不到模型說了算

最終建議按驗證結果查表：過了輕量複查的 consensus、strict-liability、交叉驗證 CONFIRMED 進 Must Fix；HIGH 但驗證只到 PARTIAL 或 INCONCLUSIVE 進 Should Fix；MEDIUM / LOW 進 Nice to Have；REFUTED 跟 OUT_OF_SCOPE 進參考用，證據並陳，人可以 override。報告排序按最終建議不按 severity，因為讀報告是要決定先修什麼，CRITICAL 被駁回照樣沉底。

REFUTED 率還能當每個 PR 的儀表：某一軸這次超過 30%，代表它在這個 PR over-flag，看它未驗證的條目時下調權重；低於 10% 代表這軸進 Must Fix 的可以放心採納。這是單次的讀報指引，不是軸的永久評等。紅隊常年住在高駁回區，它的價值本來就不在命中率，在那幾條別軸抓不到、複查又扛得住的獨有命中。軸的可信度是每個 PR 現場量出來的，跟信仰無關。

一份真實報告長這樣：某個 PR 的報告收了 23 條 finding，分散在五軸。#1 legacy 欄位店家一存檔就默默解除所有舊限制，只有紅隊抓到；#2 一條跳轉連結把 `extension://` 寫成 `extension:`、少了兩條斜線，管理介面的編輯按鈕點了打不開，只有 Gemini Flash 抓到；#3 整份 settings 拿舊快照 POST 回去、沒有 optimistic lock，四軸共識。一條這軸獨抓、一條那軸獨抓、一條全場都抓，每軸盯到的破口真的不一樣。

## Gemini 兩軸的成績單：Flash 穩，Pro 不行

五軸點完名，還欠 Gemini 兩軸一份成績單，而這份成績單本身就是「可信度現場量」的示範。就拿上一節那份 23 條的報告來看，Gemini Pro 出了 7 條 finding，其中 2 條是明確幻覺、1 條複查降級：兩條幻覺都是 confidence 0.95 的 CRITICAL，一條說 `render(x, document.body)` 在 worker sandbox 會 crash（實際上是官方 Preact pattern、同款 bootstrap 早就上線在跑），一條引用了型別定義裡根本不存在的欄位；剩下命中的幾條全跟其他軸重複，沒有獨有貢獻。同一份報告的 Flash 出了 5 條：3 條跟其他軸的共識對上，外加 1 條全場獨抓的 `e.target.values` 應為 `e.currentTarget.values`，複查確認，0 幻覺。

把兩軸上線以來的 15 個 review 樣本拉開來看：Flash 在 6 個樣本裡交出獨有命中，Pro 只有 3 個，而且 Pro 還有兩次直接 timeout。timeout 的軸不重跑，當作沒出勤、報告註明就好。另一個場景（spec 審查）量出來的方向也一致：Flash 穩、Pro 不穩。

所以「多加軸就更好」是不成立的，每加一軸，都要看它在真實 PR 裡留下什麼。

## 收尾：這篇文自己就是案例

這套流程 2026 年 4 月下旬首跑，到 7 月初累計 85 個 invoke session（含開發這條 command 自己的 session），是天天在跑的東西，不是概念文。但收尾我最想講的不是採用數字，是整理這篇素材的過程發生的事。

我請 CC 解釋「為什麼前四個 reviewer 都漏了 Save 按鈕」，它一口氣編了四段機制解釋：chunk 切開了、Codex 沒 context、紅隊優先序低、Gemini 剛好對這類敏感。講得頭頭是道。我問了一句「你這整段解釋是推論吧，還是有證據？」直接抓包🤣 它認錯之後回去翻當時 review 的 session 對話紀錄取證，結果證據推翻了「chunk 切開了」、Gemini 那段只有行為證據撐得住。最後留下來的版本只講查得到的事實，也就是這篇「為什麼前四個都漏」那節你讀到的樣子。

同一段時間我還抓到第二件。它產的介紹把 per-file accounting 寫成「點名冊」，我要它出示 command 原文，原文其實只有那兩個 marker：白話翻譯本身對得上，但它沒標示這個名字是自己翻的。兩件是同一類毛病：推論跟事實沒有標記開。

review 工作流防模型瞎掰，靠的是另一軸踢館加上人否決；生出這篇文章的過程，靠的也是同一套。工作流防的從來不只是 code 的瞎掰。

可以搬走的有三個層次：

1. 今天就能做：下一個 PR 跑一次雙模型審，看比對表裡「只有一邊抓到」的那幾條。最小版連 command 都不用寫：同一份 diff 丟給兩個餵法不同的 prompt 各自出 finding，再用第三個 prompt 逐條複查
2. 思路：想要不同視角就餵不同的 context，不用等更強的模型
3. 結構：把 review 掛上工作流節點，別靠記得

供大家參考。
