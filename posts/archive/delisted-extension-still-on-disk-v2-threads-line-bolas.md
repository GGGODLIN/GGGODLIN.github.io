---
title: 下架了你也不知道，extension 還在磁碟裡躺著
description: 一個在機器上潛伏約八個月的惡意 extension，今天被 bumblebee 抓到了。為什麼 marketplace 下架根本不夠用，磁碟掃描工具補上的是什麼。
voice: v2-threads-line-bolas
status: 實驗 draft（從 MATERIAL 重寫，非已發布版）
source: posts/delisted-extension-still-on-disk-MATERIAL.md
---

今天 bumblebee 的 catalog 更新，掃出一個 critical 命中：sissel.shopify-liquid 版本 4.0.1，同時在 VS Code 和 Cursor 兩個路徑各出現一次。

sissel.shopify-liquid 是做 Shopify Liquid 語法高亮的 extension，我日常做 Shopify 開發一直裝著的那種。2025 年 10 月，它被點名是 GlassWorm 首波受害的七個 extension 之一，然後就從 marketplace 消失了。從那時算到今天，估計在磁碟上潛伏了約八個月。

---

## GlassWorm 是什麼

VS Code / Open VSX 生態裡第一個自我傳播的蠕蟲，[Koi Security](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace) 在 2025 年 10 月 17 日發現並命名。

攻擊流程是這樣的：劫持有在發佈 extension 的開發者帳號，把惡意碼用不可見 Unicode 字元藏進去。這些字元對人眼和靜態分析工具看起來就像空行，對 JavaScript 解譯器卻是可執行碼。extension 裝進去之後，竊取 NPM / GitHub / Git 憑證，掃 49 種加密貨幣錢包 extension，再用偷來的憑證感染該開發者發佈的其他 extension，一路指數擴散。

規模不算小。首波 7 個 extension，累計約 35,800 次下載。

---

## 你以為安全，但磁碟上的狀況未必

三個機制，合起來讓這類惡意 extension 可以在磁碟裡靜置數月而不被察覺。

**第一**：marketplace 下架擋的是新安裝，和磁碟上已裝的副本沒有關係。VS Code 和 Cursor 都沒有「下架後自動移除本機副本」這個機制。

**第二**：VS Code 的自動更新只往更高版號走。sissel.shopify-liquid 這顆本機有的版本，版號高於 registry 現存最高合法版，編輯器因此判定「已是最新」，永遠不會自動降版，惡意版就凍結在磁碟裡。

**第三**：npm audit、Snyk、OSV、Dependabot 這類掃描型工具，掃的是依賴清單對 CVE 資料庫，不掃本機磁碟上實際裝了什麼。加上不可見 Unicode 讓靜態分析視為空白，市集端審核肉眼也辨識不了。這顆東西在一般掃描下是隱形的。

三個洞疊在一起，結論就是：marketplace 清乾淨不等於你的機器乾淨。這兩件事是獨立的。

---

## [bumblebee](https://github.com/perplexityai/bumblebee) 能補上什麼

Perplexity 開源的供應鏈攻擊掃描工具。做的事情很直接：掃本機磁碟上實際裝了什麼，跟威脅情報 catalog 做精確比對，生態、名稱、版本三個條件全部要對。

跨生態是它比較特別的地方。一支工具可以同時掃 npm、PyPI、Go、RubyGems、Packagist、editor extension，另外還支援 MCP 和瀏覽器 extension。

今天掃出 GlassWorm 的這次，catalog 有 931 條威脅情報，涵蓋的攻擊家族不只 GlassWorm，npm 蠕蟲、typosquat、憑證竊取、加密貨幣竊取、RubyGems 和 Packagist 套件都在裡面，光 GlassWorm 一家就有 245 條 signature。掃 66,125 個 packages，4 秒跑完，跳出 2 個 critical。

但能力邊界也要講清楚：它不做行為偵測，抓不到 zero-day，能抓到的就是 catalog 已收錄的已知惡意版本。工具的價值直接取決於 catalog 的更新及時性。

---

## 從 5/24 到今天

5 月 24 日把 bumblebee 接進每日本機分析，三次掃描：

- 5 月 24 日：catalog 626 條、掃過 67,344 個 packages、findings 0
- 5 月 31 日：catalog 654 條、67,441 個 packages、findings 0
- 6 月 7 日：catalog 931 條、66,125 個 packages、findings 2

前兩次零 findings，不是因為機器乾淨，是因為 catalog 還沒收 GlassWorm 的 signature。6 月 7 日 catalog 更新（commit #51 加入 GlassWorm 威脅情報），今天才命中。

「今天才抓到」不等於「今天才出現」。前兩次的零 findings 是假陰性，不是乾淨。

---

## 抓到之後

處置做了兩步：CLI uninstall，再物理刪除兩個目錄。CLI 只是標記 obsolete，editor 沒開著的話不會實際清掉，要手動刪乾淨。

IoC 掃了一輪，LaunchAgents、Daemons、監聽 port、hosts 設定、憑證檔、C2 IP 連線、落點關鍵字，目前全部乾淨。

但乾淨不等於什麼都沒發生過。GlassWorm 的 C2 基礎設施在 2026 年 5 月 26 日已被 CrowdStrike + Google + Shadowserver 聯合查抄，原 C2 推斷失聯。不過憑證是當下就能外傳的，歷史洩漏從現況無法證偽。預防性輪換一批 token 是合理的保險，catalog 自己也這樣建議。

---

marketplace 清乾淨、市集審核、掃描型工具，這些都擋不住已經在磁碟上凍結的惡意版本。

bumblebee 在我評估過之後放棄的一堆工具裡面算是異數，試用期內真的命中，還救了一次。磁碟掃描這件事，現在對我來說是常規流程了。
