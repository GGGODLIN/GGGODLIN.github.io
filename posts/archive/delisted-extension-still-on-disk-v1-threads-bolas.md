---
title: 下架了，但還在你硬碟裡
description: bumblebee 在我機器上抓到一個潛伏約八個月的 GlassWorm 惡意 extension。就是那種市集早就清掉、你還裝著沒感覺的狀況。
voice: v1-threads-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/delisted-extension-still-on-disk-MATERIAL.md
---

今天跑每日掃描，跳出 2 個 critical 命中。

一個叫 sissel.shopify-liquid，版號 4.0.1，同時躺在 VS Code 跟 Cursor 兩個目錄裡。翻了一下，這顆去年十月就被多個公開來源列為 GlassWorm 惡意 extension，全網早就點名了，約八個月前的事了。

小丑竟是我自己🤣

## GlassWorm 是什麼

2025 年十月，資安公司 [Koi Security](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace) 發現並命名，業界判定是 VS Code 生態第一個自我傳播蠕蟲。

運作方式：劫持開發者帳號，在 extension 裡藏不可見的 Unicode 字元。對人眼跟靜態分析器看起來像空白，對 JavaScript 解譯器是可執行碼。被感染的機器會偷走 NPM、GitHub、Git 憑證，還有 49 種加密貨幣錢包 extension，同時裝後門。最要命的是它會用偷來的憑證感染那個開發者自己發佈的其他 extension，指數擴散。

首波 7 個 extension 受感染，累計約 35,800 次下載，sissel.shopify-liquid 是其中一個。這套機制不是 Shopify 開發者特有的問題，任何裝過的人都可能中。

## 三個讓惡意碼「自動留下來」的洞

我原本以為市集把東西下架了就沒事，測了才知道差遠了。

**第一個洞**：marketplace 下架只影響新安裝，不刪本機已裝副本。VS Code 跟 Cursor 都沒有「市集刪了就本機自動移除」的機制。你以前裝的版本還靜靜坐在那裡。

**第二個洞**：編輯器自動更新只往更高版號走，不降版。本機這顆版號 4.0.1，高於 registry 現存最高合法版，所以編輯器一直判斷「已是最新」，永遠不會去替換它。惡意版本孤兒凍結在硬碟上。

**第三個洞**：市集端防禦加上傳統掃描工具（npm audit、Snyk、Dependabot 那類）對「已安裝、資料庫未收錄」全盲。不可見 Unicode 更讓 ESLint、Semgrep 之類的靜態分析視為空行，抓不到。

這三個機制疊在一起，就算全網都知道這顆是惡意的，你的機器不會告訴你。

## bumblebee 補上的盲區

這就是 [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) 的切入點。

重點在「它掃哪裡」。直接掃本機磁碟實際裝了什麼，跟威脅情報 catalog 做精確比對：生態、套件名稱、版本號三項全符合才算命中。依賴清單、網路行為、靜態分析都不是它的路數。

能掃的生態很廣：npm、PyPI、Go、RubyGems、Packagist、editor extension，另外也支援 MCP server 跟瀏覽器 extension。

現在 catalog 有 931 條威脅情報，涵蓋的攻擊家族包括 npm 蠕蟲（Shai-Hulud 系列）、typosquat（Go 生態的 shopsprint）、憑證竊取（node-ipc）、加密貨幣竊取（trapdoor）、RubyGems 跟 Packagist 的惡意套件，還有 editor extension 蠕蟲，光 GlassWorm 家族就 245 條。

最重要的是，它看的是磁碟上實際存在的東西，而不是「官方 registry 顯示什麼」。市集清了記錄不代表你機器乾淨，bumblebee 的邏輯是從硬碟那端回頭看。

## 親身跑了三週的數字

我五月二十四日把 bumblebee 接進每日本機分析，當第六個偵測頻道。

五月二十四日啟動那天：catalog 626 條，掃了 67,344 個套件，0 findings。五月三十一日：catalog 654 條，掃了 67,441 個套件，還是 0。六月七日：catalog 931 條，掃了 66,125 個套件，2 findings，嚴重程度 critical。整趟掃描跑了 4 秒。

catalog 從 626 長到 931，是兩週漸增，每次更新加進新的威脅情報，不是一天爆衝的。

trial 結案：KEEP，保留進每日例行。

## 為什麼「今天」才抓到

六月七日 catalog 才加進 GlassWorm 的 signature（commit 訊息：feat(threat_intel): add GlassWorm exposure catalog #51）。五月二十四日到五月三十一日的 0 findings 不是乾淨，是假陰性，那時候 catalog 還沒收錄這個家族。

這也是這類工具誠實的能力邊界：能精確抓 catalog 已收錄的已知惡意版本，抓不到 catalog 沒收的 zero-day。工具的價值跟 catalog 更新速度直接掛鉤。拿去當「保證乾淨」的依據是錯的，拿去當「catalog 範圍內的持續比對」是對的。

## 處置，還有一個不確定

卸載用 CLI 標記為過時，然後物理刪除 ~/.vscode/extensions/ 跟 ~/.cursor/extensions/ 兩個目錄下的對應資料夾（光跑 CLI 的話編輯器沒在執行時不會實刪）。IoC 掃一輪：LaunchAgents、Daemons、監聽 port、/etc/hosts、憑證檔、C2 連線記錄，全部乾淨。

C2 基礎設施已在五月二十六日被 CrowdStrike、Google、Shadowserver 聯合查抄，四條管道同時瓦解，原 C2 推斷失聯。

但有一件事沒辦法現況證偽：這顆在我機器上潛伏約八個月（自首波曝光 2025-10 起算，不是實際安裝日，目錄已刪、mtime 查不到了），那段時間它有沒有執行過、憑證有沒有外傳，不知道。IoC 乾淨不等於「那八個月什麼都沒發生」。後來預防性輪換了相關 token，就這樣。

## 磁碟掃描這件事值得列常規

「市集清掉了就沒事」這個直覺是錯的。市集那端的動作跟你硬碟上的狀態是兩個獨立事件，前者不蘊含後者。

我裝過的工具裡，大部分評估後用不上、或是用了沒感覺，但 bumblebee 是少數試用期內真的命中、還救了一次的。一個工具的價值在真實命中的時候才被量化到。

供應鏈掃描不是 npm audit 的替代品，是另一個維度：掃磁碟、比版本、跨生態。如果你日常開發環境跟我差不多（VS Code / Cursor + 多年 extension 累積），值得跑一次看看有沒有什麼在硬碟上住很久了。
