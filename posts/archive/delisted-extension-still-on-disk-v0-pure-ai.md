---
title: 下架不等於移除：一個潛伏八個月的惡意 extension 與磁碟掃描工具 bumblebee
description: 市集下架惡意 extension 不會刪除本機已安裝的副本；bumblebee 靠掃描本機磁碟實際內容，補上市集端防禦與傳統掃描型工具的結構性盲區。
voice: pure-ai-baseline
status: 純 AI 校稿版（Phase 1.5，從 MATERIAL 寫，無 voice）
source: posts/delisted-extension-still-on-disk-MATERIAL.md
---

## Beat 1：命中

2026-06-07，每日例行的本機供應鏈掃描工具 [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) 跳出兩個 critical 等級的命中結果，對象都是同一個 extension：`sissel.shopify-liquid@4.0.1`。

命中路徑有兩條，分別在 `~/.vscode/extensions/sissel.shopify-liquid-4.0.1/` 與 `~/.cursor/extensions/sissel.shopify-liquid-4.0.1/`——VS Code 與 Cursor 各一份。這顆 extension 是一個 Shopify Liquid 語法工具，從安裝起從未主動引起任何懷疑，在兩個編輯器的 extension 清單裡靜靜顯示為「已是最新」。

bumblebee 這次掃描總共花了 4 秒，比對了 66,125 個套件，catalog 收錄 931 筆威脅情報。catalog 識別碼：`glassworm-editor-extension-sissel-shopify-liquid`，嚴重程度：critical。

這個 extension 早在 2025-10-17 就被公開點名，屬於 VS Code 與 Open VSX 生態中第一個有記錄的自我傳播蠕蟲——GlassWorm——的首波受害者之一。距今已過約八個月。

---

## Beat 2：GlassWorm 是什麼

GlassWorm 由資安公司 [Koi Security](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace) 於 2025-10-17 發現並命名，是 VS Code 與 Open VSX 生態中第一個具備自我傳播能力的蠕蟲。

`sissel.shopify-liquid@4.0.1` 是首波受害 extension 之一，首波共有 7 個 extension 遭感染，累計下載量約 35,800 次。

GlassWorm 的核心危害有三層：

**憑證竊取**：一旦開發者的環境執行了含惡意碼的 extension，GlassWorm 會竊取 NPM、GitHub、Git 等平台的登入憑證，以及 49 種加密貨幣錢包 extension 的資料。

**後門植入**：惡意碼會建立 SOCKS proxy（讓受害機器成為流量跳板）與隱藏 VNC（HVNC，即攻擊者可遠端完整操控機器）。這組後門模組稱為 ZOMBI，載荷以 AES-256-CBC 加密傳輸。程式碼中含有俄語註解；偵測到作業系統語系屬於 CIS 國家（俄語、烏克蘭語、哈薩克語等）時，則靜默退出不啟動。

**指數擴散**：竊得的 NPM、GitHub 憑證被直接用來感染該開發者名下的其他 extension，擴大受害範圍。這是「自我傳播」名稱的由來。

---

## Beat 3：為什麼這類攻擊難以防禦

GlassWorm 在技術設計上有幾個特性，讓傳統防禦手段難以正面應對。

**不可見 Unicode 藏碼**：惡意碼藏在不可見的 Unicode 字元裡，對人眼和靜態分析工具（如 ESLint、Semgrep）看起來像空行，但對 JavaScript 解譯器是可執行程式碼。市集審核人員用肉眼審查原始碼，無法察覺。

**四層 C2 備援**：指揮與控制（C2）伺服器透過四條完全獨立的管道傳遞指令：① Solana 區塊鏈交易備忘（記錄在鏈上，無法刪除）；② BitTorrent DHT 網路；③ Google Calendar 事件標題，以 Base64 編碼藏入指令；④ 直接 IP 連線。即便其中幾條管道被封鎖，攻擊者仍可透過其他管道維持控制。2026-05-26，CrowdStrike、Google、Shadowserver 聯合執行查抄行動，四條 C2 管道同時被瓦解，感染機器的連線被重導向資安單位接管的 sinkhole；C2 基礎設施已被查抄，原 C2 推斷失聯。

**持續演化**：在首波（2025-10）之後，攻擊者持續調整手法。第二波（2025-12 至 2026-01）改以字面近似的帳號名稱發布仿冒工具；第三波（2026-01-31 至 03-13）進一步演化為「依賴濫用」——extension 本體看起來完全乾淨，惡意碼藏在 `extensionPack` 或 `extensionDependencies` 靜默拉入的依賴裡。[Socket Research](https://socket.dev/blog/open-vsx-transitive-glassworm-campaign) 記錄了至少 72 個屬於第三波的 extension。`sissel.shopify-liquid` 屬首波受害者，不在這 72 個之列。

---

## Beat 4：三個反直覺的技術盲區

「我去看了一下，那個 extension 已經從市集下架了，所以沒問題。」這個推斷在技術上不成立。

**盲區一：市集下架，不等於本機移除。** VS Code 與 Cursor 沒有「偵測到市集已下架該 extension，自動刪除本機副本」的機制。下架只阻止新的使用者安裝；已安裝的副本繼續留在硬碟上，繼續在每次開啟編輯器時執行。

**盲區二：自動更新只往高版號走，不自動降版。** VS Code 的自動更新邏輯是：若 registry 上有更高版號，才觸發更新。`sissel.shopify-liquid@4.0.1` 這顆惡意版的版號，高於 registry 現存的最高合法版本——編輯器因此判斷「已是最新」，不觸發任何更新動作。惡意版本就這樣在不被察覺的情況下永久凍結在硬碟上。

**盲區三：傳統掃描型工具對這個情境全盲。** npm audit、Snyk、OSV Scanner、Dependabot 等工具的設計邏輯是：掃描專案的依賴清單，比對已知漏洞資料庫。它們不掃描編輯器 extension 的安裝目錄，也不掃描惡意碼藏在不可見 Unicode 裡的情況。即便這些工具在同一台機器上執行，`sissel.shopify-liquid@4.0.1` 對它們而言是隱形的。

三個盲區合力的結果：一顆惡意 extension 可以在開發者機器上靜置數月，期間所有「掃描乾淨」的結果都是假陰性。

---

## Beat 5：bumblebee 是什麼，為什麼是它抓到的

[bumblebee](https://github.com/perplexityai/bumblebee) 是 Perplexity 開源的供應鏈攻擊偵測工具。它的核心邏輯與上述傳統工具根本不同：它不依賴依賴清單，而是直接掃描本機磁碟上已安裝套件的實際內容，比對威脅情報 catalog。

這個差異是關鍵。傳統工具問的是「這個版本有沒有在 CVE 資料庫裡？」bumblebee 問的是「這顆實際安裝在磁碟上的東西，符不符合已知惡意模式？」前者對 `sissel.shopify-liquid@4.0.1` 毫無作用；後者在 catalog 收入 GlassWorm 特徵的當天，直接命中。

實際的試用歷程是這樣的：

| 日期 | catalog 筆數 | 掃過套件數 | 命中數 |
|------|------------|-----------|------|
| 2026-05-24（啟動日） | 626 | 67,344 | 0 |
| 2026-05-31 | 654 | 67,441 | 0 |
| 2026-06-07（命中日） | 931 | 66,125 | **2** |

從 2026-05-24 開始試用，兩週後的今天第一次出現命中。試用期間 catalog 從 626 筆逐漸增加到 931 筆，是持續演進的威脅情報。

bumblebee 被接入每日本機分析流程，作為第六個偵測頻道。試用結案後的評定：KEEP——這是在評估過的工具裡，少數在試用期內出現真實命中的工具。

---

## Beat 6：為什麼「今天」才抓到

2026-05-24 啟動試用、2026-05-31 掃描，兩次結果都是 0 findings。`sissel.shopify-liquid@4.0.1` 在那兩次掃描中一樣存在於硬碟上，但 bumblebee 沒有命中。

原因在於 catalog 的更新時序。2026-06-07 當次掃描時，bumblebee 的威脅情報 catalog HEAD 從 `156df7a` 更新到 `bf685dd`，對應的 commit 訊息是 "feat(threat_intel): add GlassWorm exposure catalog (#51)"——這個版本才第一次把 GlassWorm 的特徵收入 catalog。

所以正確的理解是：此前兩次「0 findings」不代表機器是乾淨的，只代表當時的 catalog 還沒有對應的特徵。這是一個誠實的技術限制——bumblebee 的偵測能力上限受 catalog 覆蓋範圍決定，catalog 的更新頻率決定了這個工具實際上能抓多早。

GlassWorm 首波曝光是 2025-10-17；命中日是 2026-06-07。從首波曝光到 catalog 收入特徵，中間過了約八個月（這個估計以首波公開曝光為起點，非本機實際安裝日，兩者可能不同）。這段時間，任何依賴傳統防禦的開發者，若已安裝這顆 extension，都處於假陰性狀態。

---

## Beat 7：處置與誠實界定

確認命中後的處置步驟分兩階段：

**第一階段：移除 extension。** 先以編輯器 CLI 執行 uninstall（`code --uninstall-extension` / `cursor --uninstall-extension`），但要注意：CLI 只是把 extension 標記為 `.obsolete`，真正的物理刪除需要在編輯器完全未執行的情況下，手動 `rm -rf` 兩個路徑的目錄（`~/.vscode/extensions/sissel.shopify-liquid-4.0.1/` 與 `~/.cursor/extensions/sissel.shopify-liquid-4.0.1/`）。

**第二階段：IoC 掃描。** 對照 GlassWorm 公開的威脅指標（IoC）逐項排查：LaunchAgents/LaunchDaemons 中無可疑項目、監聽通訊埠無異常、`/etc/hosts` 未被竄改、憑證檔目錄無可疑落點、無對 C2 IP 的連線、關鍵字 grep 無發現。掃描結果：全部乾淨。

然而，「IoC 乾淨」與「完全沒有損失」不是同一件事。C2 基礎設施已於 2026-05-26 被查抄，推斷已失聯。但如果在 extension 有活動期間（約 2025-10 至 2026-05）有憑證被竊取，那些憑證在被竊當下就可能已外傳，現在的環境掃描無法回溯排除。

合理的預防措施：主動輪換可能曾暴露在這段時間的 token——NPM 存取金鑰、GitHub token、Git 憑證、各平台 API key。

---

## Beat 8：總結與推薦

這次事件有幾個值得整理的結論。

**「市集清乾淨」不等於「你的機器清乾淨」**，兩件事由完全不同的機制控制。開發者習慣把「已下架」理解為安全，但市集的下架動作對已安裝副本沒有任何影響。

**「自動更新」在版號孤兒的情況下失效**。當惡意版本的版號高於 registry 現存的最高合法版時，編輯器的更新邏輯會讓惡意版本永久凍結。這個機制本身是合理設計，但在面對刻意操縱版號的攻擊時，成了防禦上的漏洞。

**傳統掃描型工具（npm audit 等）與市集端防禦有結構性盲區**：它們看不到編輯器 extension 安裝目錄的實際內容，也看不到不可見 Unicode 藏碼。這不是工具的缺陷，而是設計範疇本來就不覆蓋這個向量。磁碟掃描是補上這個盲區的對應方案，與傳統工具互補，不是替代。

對 [bumblebee](https://github.com/perplexityai/bumblebee) 的評估：在整個試用期間它是正向案例——試了真的用上，而且在試用期內完成一次真實的惡意 extension 命中。對於日常使用 VS Code 或 Cursor、安裝有數量不等 extension 的開發者，把這類磁碟掃描工具列入常規防禦頻道，是值得考慮的選項。

catalog 的覆蓋範圍是這類工具的實際能力上限，會持續演進。今天的命中，是因為今天的 catalog 才收入了對應的特徵。這本身是誠實的技術限制，也是為什麼這類工具需要持續執行而非一次性掃描的原因。
