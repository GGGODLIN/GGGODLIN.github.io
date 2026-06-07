# delisted-extension-still-on-disk — 純素材骨架

> 語氣中性大綱。不寫成文、不帶語氣、不用個人句型。
> 供 N 種文體版本共用的單一事實起點。
> **定調（2026-06-07 review gate 後 fold）**：主軸＝推薦供應鏈掃描工具 bumblebee，以作者親身中招的 GlassWorm extension 當活案例；副軸＝供應鏈攻擊科普（把威脅講清楚，才彰顯 bumblebee 的價值）。三個技術洞從「踩坑主軸」降為「為什麼別的防禦抓不到、只有磁碟掃描抓得到」，服務於推薦。

---

## 1. 核心主張 / thesis

- 主軸：像 bumblebee 這種**掃描本機磁碟實際內容、跨多種套件生態**的供應鏈攻擊偵測工具，值得列入開發者的常規工具——因為它補上了「市集端防禦」與「傳統掃描型工具」結構性看不到的盲區。親身證據：它在我機器上抓出一個潛伏約八個月的 GlassWorm 惡意 extension。
- 支撐主張 A：marketplace 下架惡意 extension，不等於已安裝的本機副本被移除。
- 支撐主張 B：VS Code 的自動更新只往更高版號走、不會自動降版；當惡意版本版號高於 registry 現存最高版，本機副本永久凍結，編輯器認為「已是最新」。
- 支撐主張 C：上述兩個機制 + 惡意碼用不可見 Unicode 躲過靜態分析，合力讓惡意 extension 在硬碟上靜置數月而不被市集端或掃描型工具偵測到；只有掃描本機磁碟實際內容的工具才抓得到。

---

## 2. 目標讀者 + 為什麼現在寫

**目標讀者**

- 日常使用 VS Code 或 Cursor、安裝過數量不等 extension 的開發者
- 關心軟體供應鏈安全、想知道現有防禦邏輯是否有盲點的人
- 在評估「該不該為這類風險多裝一個工具」的人

**時機**

- 事件當天（2026-06-07）本機命中，第一手。
- GlassWorm 自 2025-10 首波曝光已約八個月，若非今天 catalog 更新，此前每一次「掃描乾淨」都是假陰性。
- 「今天才抓到 ≠ 今天才出現」本身是文章要拆解的誤解，也是「為什麼需要這類工具」的切入。

---

## 3. 論證骨架（section by section beat 清單）

> PR-030 再平衡：科普（原 beat 2+3）合併精簡為一個配角 beat；bumblebee 主軸擴成「能防什麼」+「親身案例」兩個 beat。推薦工具是主角，科普點到「威脅真實且難防」即止。

| # | beat 要點 | 支撐證據 | 在整篇的作用 |
|---|---|---|---|
| 1 | 命中鉤子：每日例行掃描在 2026-06-07 跳出 2 個 critical 命中，是一個約八個月前就被全網點名、早該下架的惡意 extension，同時躺在 VS Code 與 Cursor | ALERT / 06-07 report（findings 2、critical、雙路徑） | 鋪陳 / 設懸念 |
| 2 | 科普（精簡，合併原 2+3）：GlassWorm 是 VS Code 生態第一個自我傳播蠕蟲，藏在不可見 Unicode、偷開發者憑證 + 加密貨幣錢包、裝後門、用偷來的憑證感染該開發者其他 extension 自我擴散；靜態分析與市集審核都難擋 | FC-039 / FC-043；首波 7 個、sissel 是其一、約 35,800 下載 | 鋪陳威脅真實且難防（配角，點到即止；**C2 四層備援 / ZOMBI / AES / 俄語 geofencing 等枝節不入文**） |
| 3 | 三個反直覺技術洞：下架≠本機移除 / 只升不降版凍結 / 市集端與掃描型工具全盲 | memory 教訓 + FC-039；版號關係（本機惡意版 > registry 現存最高合法版） | 轉折（把「你以為安全」翻過來，導向「那什麼抓得到」） |
| 4 | ★ bumblebee 能防什麼（主軸·擴充）：一支掃 npm / PyPI / Go / RubyGems / Packagist / editor extension 等多種套件生態；掃本機磁碟實際裝了什麼，跟威脅情報 catalog 做 exact（生態, 名稱, 版本）精確比對；catalog 涵蓋 npm 蠕蟲 / typosquat / 憑證竊取 / 加密貨幣竊取 / editor 蠕蟲等家族 | FC-044；bumblebee binary --help + catalog（931 條、跨生態） | 高潮 / 主張落點（推薦核心——它補上的盲區範圍有多廣） |
| 5 | 親身案例 + trial：怎麼接進每日本機分析（第 6 個偵測頻道）、trial 5/24→6/7 三日歷程、首次真實命中、KEEP | project_bumblebee_trial；三日掃描數字表 | 親身證據（主軸的實證） |
| 6 | 為何「今天」才抓到 + 能防 / 不能防邊界：catalog 6/7 才加 GlassWorm signature（#51），非今天才出現；此前 0 findings 是假陰性；能抓 catalog 已知、抓不到 zero-day → 價值取決於 catalog 更新及時性 | 06-07 report（HEAD 156df7a→bf685dd #51）；05-31 對照 0；FC-044 邊界 | 誠實補充（工具能力上限＝catalog 覆蓋範圍） |
| 7 | 處置 + 誠實 caveat：uninstall + 物理刪除、IoC 掃乾淨；但 C2 已查抄（推斷失聯）、憑證 activate 當下外傳、歷史外洩無法現況證偽 → 輪換 token（catalog 的 c2_status 欄自己也這樣建議） | memory 處置段 + FC-040 | 轉折（避免「掃乾淨＝沒事」的假安心） |
| 8 | 收尾 + 推薦 takeaway：marketplace 清乾淨≠你的機器乾淨；磁碟掃描該列常規；bumblebee 是少數「試了真用上、還救一次」的工具 | 對照「裝了沒用」的工具群；trial KEEP | 收束 |

---

## 4. 關鍵事實清單

| # | 事實 | 準據狀態 | 備註 |
|---|---|---|---|
| 1 | 命中 extension：`sissel.shopify-liquid@4.0.1`，2026-06-07 同時命中 VS Code 與 Cursor 兩路徑 | 【一手證據：ALERT / 06-07 report】 | findings 2、severity critical |
| 2 | 命中路徑（泛化）：`~/.vscode/extensions/...` 與 `~/.cursor/extensions/...` | 【一手證據；已泛化去使用者名稱】 | |
| 3 | ★ sissel.shopify-liquid@4.0.1 確為 GlassWorm 受害 extension，列名於四個公開來源 | 【成立，多來源：Koi Security / Fluid Attacks / Truesec / unic-glassworm-detect】 | FC-039；非只 bumblebee catalog |
| 4 | sissel 屬 GlassWorm **首波**（2025-10-17，7 個 extension 之一，累計約 35,800 下載） | 【成立：Koi Security / Fluid Attacks】 | FC-041；**不是**第三波 72 個那批 |
| 5 | GlassWorm＝VS Code / Open VSX 生態第一個自我傳播蠕蟲，Koi Security 2025-10-17 發現命名 | 【成立：Koi Security 原始來源】 | |
| 6 | 自我傳播機制：劫持帳號→不可見 Unicode 藏碼→Solana memo 取 C2→竊 NPM/GitHub/Git 憑證 + 49 種錢包 extension→用偷來憑證感染該開發者其他 extension | 【成立，多來源：Koi / Fluid Attacks】 | FC-043 |
| 7 | C2 四層備援：Solana 交易備忘 / BitTorrent DHT / Google Calendar 事件標題藏 Base64 / 直接 IP | 【成立：Fluid Attacks / CrowdStrike】 | FC-043；難瓦解的關鍵 |
| 8 | 後門＝SOCKS proxy + 隱藏 VNC（HVNC），稱 ZOMBI 模組；載荷 AES-256-CBC；含俄語註解、偵測 CIS 語系則靜默退出 | 【成立：Fluid Attacks / Truesec】 | FC-043 |
| 9 | 第三波（2026-01-31~03-13）演化為依賴濫用：`extensionPack`/`extensionDependencies` 靜默拉惡意依賴，extension 本體看似乾淨；Socket 記至少 72 個 | 【成立：Socket Research 2026-03-13】 | FC-041；當「攻擊持續演化」背景 |
| 10 | 技術洞一：marketplace 下架只影響新安裝，不刪本機已裝副本；VS Code/Cursor 無「下架→自動移除」機制 | 【成立：memory 教訓 + 機制推論】 | |
| 11 | 技術洞二：VS Code 自動更新只往更高版號走、不自動降版；本機 4.0.1 > registry 現存最高版 → editor 判定「已最新」→ 惡意孤兒版凍結 | 【成立：memory 教訓 + 機制】 | 版號關係可靠，**精確上傳日期不釘死**（見 #16） |
| 12 | 技術洞三：市集端防禦（下架/簽章）+ 傳統掃描型工具（npm audit/Snyk/OSV/Dependabot 類）對「已安裝、資料庫未收錄」全盲；不可見 Unicode 讓靜態分析視為空白 | 【成立：FC-043 + npm-supply-chain memory 對照】 | |
| 13 | bumblebee＝Perplexity 開源供應鏈攻擊掃描工具，掃本機磁碟實際內容比對威脅情報 catalog | 【成立：bumblebee memory + repo】 | [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee) |
| 14 | bumblebee 接入：作者每日本機分析的第 6 個偵測頻道，2026-05-24 啟動 trial | 【一手：bumblebee memory】 | |
| 15 | trial 三日掃描：5/24（catalog 626、0 findings）→ 5/31（catalog 654、67441 packages、0）→ 6/7（catalog 931、66125 packages、**2 findings**） | 【一手：bumblebee memory + 05-31 / 06-07 report】 | catalog 兩週漸增；**不是「一天內 626→931」** |
| 16 | trial 結案＝KEEP（保留 daily）；首次真實命中、達 promote 條件、正好打中日常 Shopify/Liquid 開發 | 【使用者 2026-06-07 拍板】 | review 日 5/24→6/7 |
| 17 | 為何今天才抓到：catalog 2026-06-07 才收 GlassWorm signature，HEAD `156df7a`→`bf685dd`（commit "add GlassWorm exposure catalog #51"） | 【一手：06-07 report】 | 此前 0 findings 是假陰性 |
| 18 | 命中當次：scan 4 秒、catalog 931 entries、掃 66125 packages | 【一手：06-07 report】 | |
| 19 | 處置：`code/cursor --uninstall-extension` + 物理 `rm -rf` 兩目錄（CLI 只標 .obsolete、editor 沒跑不會實刪） | 【一手：memory 處置段】 | |
| 20 | IoC 掃描全乾淨（LaunchAgents/Daemons、監聽 port、/etc/hosts、憑證檔、C2 IP 連線、落點 grep） | 【一手：memory】 | 乾淨 ≠ 未被偷過 |
| 21 | C2 基礎設施查抄：2026-05-26 14:00 UTC，CrowdStrike + Google + Shadowserver 聯合執行，四條 C2 管道同時瓦解；感染機改向接管的 sinkhole | 【成立：CrowdStrike / The Register】 | FC-040；操作者尚未逮捕 |

### 修正過 / 要特別小心（舊版錯在哪 → 正解）

1. **C2「217.69.3.218 已死」** → 降級：查抄報告**沒明說該 IP 確認離線**，只能寫「C2 已被查抄（2026-05-26），原 C2 推斷失聯」。不可寫「已死」當坐實事實。（FC-040）
2. **catalog「一天內 626→931」**（候選表舊述）→ 正解：**兩週漸增**（5/24 626 → 5/31 654 → 6/7 931）。
3. **版號精確時間線**（4.0.0=2023-10 / 4.0.1 由攻擊者 bump）→ 有出入（vsixhub 顯示 4.0.1=2023-11-07，對不上惡意版 2025-10-17）：**不釘死日期**，只用可靠的版號關係（4.0.1 > registry 現存最高版）+ 機制論點。（FC-042）
4. **sissel 歸屬** → 屬首波（2025-10）、**非**第三波 72 個那批；舉例別把它算進 72。（FC-041）
5. **dwell ~8 個月** → 估計值（首波曝光 2025-10-17 → 命中 2026-06-07 ≈ 7.7 月），非本機實際安裝日（目錄已刪、無法查 mtime）；標「約 / 估計」。
6. **trial KEEP** → 已由使用者 2026-06-07 拍板，可寫成事實（非推論）。

---

## 5. 數字 / 證據庫（寫作 agent 直接取用）

**bumblebee 掃描三日對照**

| 日期 | catalog entries | packages 掃過 | findings | catalog HEAD |
|---|---|---|---|---|
| 2026-05-24（啟動日） | 626 | 67344 | 0 | 不詳 |
| 2026-05-31 | 654 | 67441 | 0 | `7c93206` |
| 2026-06-07（命中日） | 931 | 66125 | **2** | `bf685dd` |

- 命中當次：scan **4 秒**、catalog **931 entries**、掃 **66125 packages**、**2 findings**（同一 extension、兩路徑各一）、severity critical
- 觸發 commit：`bf685dd` "feat(threat_intel): add GlassWorm exposure catalog (#51)"，HEAD 從 `156df7a` 更新

**bumblebee 能防範圍（FC-044，主軸素材）**

- 跨生態：一支掃 **npm / PyPI / Go / RubyGems / Packagist / editor extension** 等多種套件生態（binary 另支援 MCP、瀏覽器 extension）
- catalog 931 條威脅情報涵蓋的攻擊家族：npm 蠕蟲（Shai-Hulud 系列）、typosquat（shopsprint，Go）、憑證竊取（node-ipc）、加密貨幣竊取（trapdoor）、RubyGems（gemstuffer）/ Packagist（laravel-lang）套件、editor extension 蠕蟲（GlassWorm 一家就 245 條、nx-console）
- 機制：endpoint package inventory collector——掃本機磁碟「實際裝了什麼」，跟 catalog 做 **exact（生態, 名稱, 版本）精確比對**；不是掃依賴清單比對 CVE，也不是行為 / 網路偵測（catalog 自己標明「NOT an EDR IOC feed」、IP / Solana 地址不參與掃描）
- 能防 / 不能防邊界：能精確抓 catalog 已收錄的已知惡意版本、跨多生態；抓不到 catalog 沒收的（zero-day）、不做行為偵測 → 價值取決於 catalog 更新及時性（扣回 beat 6）

**GlassWorm 規模與時間線**

- 首波 2025-10-17：7 個 Open VSX extension 受感染（含 sissel.shopify-liquid@4.0.1），累計約 35,800 下載
- 第二波 2025-12~2026-01：13 個仿冒合法工具的 extension（換帳號 + 字面近似命名）
- 第三波 2026-01-31~03-13：Socket 發現至少 72 個（依賴濫用傳播）
- C2 查抄：2026-05-26 14:00 UTC（CrowdStrike + Google + Shadowserver）
- 命中日：2026-06-07；推算 dwell 約 8 個月（估計值）

**命中細節**

- Extension：`sissel.shopify-liquid@4.0.1`（一個 Shopify Liquid 語法的 VS Code / Open VSX extension）
- catalog id：`glassworm-editor-extension-sissel-shopify-liquid`、severity critical
- 路徑（泛化）：`~/.vscode/extensions/sissel.shopify-liquid-4.0.1/`、`~/.cursor/extensions/sissel.shopify-liquid-4.0.1/`
- 版號關係：本機 `4.0.1`（被四來源列為惡意）高於 registry 現存最高版 → editor 判定「已最新」→ 無降版機制 → 孤兒版凍結

**GlassWorm 技術細節（科普——精簡：入文只取「自我傳播 + 不可見 Unicode + 偷憑證／錢包 + 裝後門」這層；C2 四層備援 / ZOMBI / AES / 俄語 geofencing / 第三波依賴濫用 留作 record 不入文，PR-030）**

- 自我傳播五步驟：劫持帳號 → 不可見 Unicode 藏碼（對人眼/靜態分析像空行、對 JavaScript 解譯器是可執行碼）→ 連 Solana 交易備忘取 C2 位址、下載加密第二階段載荷 → 竊 NPM/GitHub/Git 憑證 + 49 種加密貨幣錢包 extension → 用偷來憑證感染該開發者發佈的其他 extension（指數擴散）
- C2 四層備援：① Solana 區塊鏈交易備忘（不可刪除）② BitTorrent DHT ③ Google Calendar 事件標題藏 Base64 ④ 直接 IP
- 後門：SOCKS proxy（受害機變跳板）+ 隱藏 VNC（HVNC，完整遠端控制），稱 ZOMBI 模組；載荷 AES-256-CBC 加密
- 規避：含俄語註解、偵測到 CIS 國家語系（俄/烏/哈薩克文）則靜默退出
- 為何傳統防禦抓不到：不可見 Unicode 讓 ESLint/Semgrep 等視為空白；市集審核肉眼不可辨；下架不刪本機；第三波「乾淨外殼 + 惡意依賴」讓 extension 本體看起來無害

**IoC（公開威脅情報，可選用）**

- C2 IP：`217.69.3.218`（推斷失聯，無直接確認離線）、`199.247.10.166`（直接 IP 層）、`164.92.88.210`（查抄後 CrowdStrike 接管 sinkhole）
- Exfil endpoint：`140.82.52.31:80/wall`
- Solana 錢包：`28PKnu7RzizxBzFPoLp69HLXp9bJL3JFtT2s5QzHsEA2`
- Calendar C2 組織者 email：`uhjdclolkdn@gmail.com`
- Payload 路徑關鍵字：`get_zombi_payload` / `get_arhive_npm`

**工具名與連結（第一次具名附）**

- [perplexityai/bumblebee](https://github.com/perplexityai/bumblebee)（推薦主角；偵測工具）
- [Koi Security 原始發現](https://www.koi.ai/blog/glassworm-first-self-propagating-worm-using-invisible-code-hits-openvsx-marketplace)（命名方）
- [Truesec 報告](https://www.truesec.com/hub/blog/glassworm-self-propagating-vscode-extension)（完整受害名單 + IoC）
- [Fluid Attacks 分析](https://fluidattacks.com/blog/glassworm-vs-code-extensions-supply-chain-attack)
- [Socket Research（第三波 72 個）](https://socket.dev/blog/open-vsx-transitive-glassworm-campaign)
- [CrowdStrike 查抄報告](https://www.crowdstrike.com/en-us/blog/inside-crowdstrike-takedown-of-a-developer-targeting-botnet/)
- [unic/glassworm-detect（社群偵測工具）](https://github.com/unic/glassworm-detect)

---

## 6. 收尾 takeaway（中性陳述）

- 「marketplace 下架」與「本機移除」是兩個獨立事件，前者不蘊含後者。
- 「editor 自動更新」在版號孤兒情況下失效，不是安全保障。
- 市集端防禦 + 傳統掃描型工具有結構性盲區；掃描本機磁碟實際內容（disk-based scan）是補上盲區的有效對策，與傳統工具互補非替代。
- bumblebee 在一堆「裝了沒用 / 評估後否決」的工具裡，是少數「試用期內真的命中、還救了一次」的正向案例；工具的價值在真實命中時才被量化。
- 誠實界定：IoC 乾淨 + 無活躍後門跡象，不排除歷史憑證洩漏；預防性輪換 token 是合理保險。

---

## 7. 素材完整度 / 缺口報告

| 區塊 | 評級 | 說明 |
|---|---|---|
| 命中鉤子 | 紮實可寫 | 一手 report 數字完整、雙路徑有紀錄 |
| GlassWorm 科普（是什麼/嚴重性） | 紮實可寫 | FC-039/043 多源佐證，自我傳播五步驟、規模、時間線齊全 |
| 供應鏈攻擊難防（科普二） | 紮實可寫 | C2 四層備援、不可見 Unicode、第三波依賴濫用皆有來源 |
| 三個技術洞 | 紮實可寫 | 版號關係可靠；精確上傳日期已標不釘死 |
| bumblebee 推薦（主軸） | 紮實可寫 | trial 三日數字一手、KEEP 已拍板、機制清楚 |
| bumblebee 能防範圍（主軸·擴充） | 紮實可寫 | FC-044：跨生態、catalog 攻擊家族、exact 比對機制、能防/不能防邊界，本機 binary + catalog 實證 |
| GlassWorm 科普 | 精簡為配角 | PR-030：合併精簡，技術枝節不入文（份量讓給 bumblebee 能力） |
| 為何今天才抓到 | 紮實可寫 | catalog commit hash + 對照 0 findings 皆一手 |
| 誠實 caveat | 紮實可寫 | C2 查抄已精確化、217 表述已降級、輪換 token 建議明確 |
| 收尾推薦 | 紮實可寫 | 論點可從上述直接導出 |

### 仍需小心 / 弱化處理（N 版一致）

1. **版號精確日期**：不釘死「4.0.0=2023-10」「攻擊者 bump 到 4.0.1」的時間線（vsixhub 顯示 4.0.1=2023-11-07，對不上惡意版 2025-10-17）。聚焦版號關係 + 機制，日期細節標「未完全確認」或略過。（FC-042）
2. **C2「已死」**：一律寫「已被查抄（2026-05-26）、原 C2 推斷失聯」，不寫「217.69.3.218 已死」。（FC-040）
3. **dwell**：標「約八個月（自首波曝光起算，非本機安裝日）」。
4. **Open VSX 現存版本**：頁面 JavaScript-only、取不到，不宣稱「Open VSX 現在停在 4.0.0」這種未確認的精確版態；改寫「registry 現存最高合法版低於本機這顆惡意版號」這個可靠關係。
5. **bumblebee「省 token / 演算法」**：本篇不是省 token 主題，不要把 bumblebee 寫成省 token 工具（與第七篇 token-saving 主題切開）；本篇定位＝供應鏈偵測。

### 總評

**素材紮實，足以寫 N 個完整版本。** 主軸（推薦 bumblebee）有親身命中一手證據 + trial KEEP 拍板 + 跨生態能防範圍（FC-044）；**PR-030 已再平衡：科普精簡為配角、bumblebee 能力擴為主軸高潮**。核心宣稱（sissel = GlassWorm 受害 extension）四來源坐實。弱化處理的點都不影響主軸與核心論證。

---

*素材收集日期：2026-06-07（review gate 後 fold：reframe 主軸 + 外部查證併入）*
*事實準據：reference_glassworm_editor_extension_2026.md / project_bumblebee_trial_2026_05_24.md / reference_npm_supply_chain_defense_2026.md（對照）/ ALERT-bumblebee.md / 2026-06-07 + 2026-05-31 report（一手數字）/ factcheck-log FC-039~043（外部查證）*
