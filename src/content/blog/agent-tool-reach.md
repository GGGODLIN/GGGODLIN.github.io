---
title: "codebase 工具數據很強，到我 agent 手上剩不到一成"
description: "FFF 宣稱快、省 token、給 AI agent 用，但接進 Claude Code 後我的 agent 實際吃得到不到一成。一個套件值不值得接，要看它宣稱的能力到你 agent 手上實際用得到多少，四個專案的 session 統計算給你看。"
pubDate: "2026-06-14"
tags: ["Claude Code", "MCP", "code-search", "tool-adoption", "FFF"]
---

# codebase 工具數據很強，到我 agent 手上剩不到一成

[前篇](https://gggodlin.github.io/blog/code-search-adoption/)寫的是 agent 願不願意拿起一個陌生 MCP 工具：答案幾乎都是不願意，退回 grep，三個工具三戰三敗。那是採用門檻的問題。

這篇換一個更尖銳的角度：就算工具被拿起來了，它宣稱的那些能力，你的 agent 實際吃得到多少？

## [dmtrKovalenko/fff](https://github.com/dmtrKovalenko/fff) 是什麼

FFF 是一個 Rust 寫的檔案搜尋函式庫，定位是「給 AI agent 的搜尋工具，快 + 省 token」，可以接成 Claude Code 的 MCP server。8470 顆星（約，截至 2026-06-14），最新版本 v0.9.4，MIT 授權，作者是 Dmitriy Kovalenko。

架構是常駐記憶體索引加上背景監看程式，同一個核心包了六種介面：MCP server、Pi 擴充、Neovim 外掛、Rust crate、C 函式庫、Node SDK。MCP 實際工具名是 `find_files`、`grep`、`multi_grep`。

賣點很直白。速度：巨型 repo 下 ripgrep 冷啟動要 3–9 秒，FFF 走記憶體索引可以做到 sub-10ms（來自 README，未獨立驗證）。省 token 有三路：定義自動展開、`multi_grep` 一次搜多個 pattern、frecency 排序把常用檔案推前面。

看到這裡，感覺條件都對了。

## 我原本以為要比工具能力，後來發現要比「我的 agent 實際吃得到多少」

評估之前我以為，判斷一個搜尋套件值不值得接，看的是它帳面上那些能力：找得快不快、準不準、省多少 token。

後來才發現，這些帳面能力再漂亮，都得先過一關：它到了我的 agent 手上，實際吃得到多少。

如果把 FFF 以 MCP server 接進 CC，它替代的會是內建的 Grep tool，也就是 agent 主動呼叫的那個 `grep` 工具。所以它的能力 agent 吃不吃得到，全看一件事：我的工作裡，CC 有多少搜尋真的走 Grep tool。我把四個專案的 session 撈出來數了一下。

結果是這樣：

| 專案 | session 數 | Grep tool 次數 | Bash grep 次數 | agent 實際吃得到 |
|---|---:|---:|---:|---:|
| 主力 Clojure 後端專案 | 158 | 132 | 1553 | ~8% |
| Hydrogen（TypeScript/React）前端 repo | 14 | 13 | 172 | ~7% |
| 行銷類 repo | 26 | 4 | 237 | ~2% |
| 研究類專案 | 361 | 6 | 3031 | ~0.2% |

這個比例怎麼算：拿 Grep tool 的次數，除以 Grep tool 加 Bash grep 的總次數。算出來的，就是「如果接了 FFF，CC 最多能讓它介入多少搜尋」的上限。

最高 8%，最低 0.2%。

換句話說，FFF 的能力再強，就算它把 Grep tool 那條路做到滿分，我的 agent 實際吃得到的也頂多 8%。剩下九成搜尋都在 Bash grep 那邊，FFF 的 MCP server 根本碰不到。宣稱的能力，跟 agent 真正用得到的，差一個量級。

## 為什麼幾乎所有搜尋都走 Bash grep

這跟習慣無關。CC 的搜尋本來就長在 shell 上，回頭看那些 Bash grep 到底在做什麼，大概五種情況：搜尋常常只是一整條管線裡的一環，像 `cat *.jsonl | jq ... | grep ... | sort`，整條都在 shell 裡跑，沒道理中途跳出去換一個工具；很多時候要搜的是某個指令吐出來的內容、不是搜檔案，而 Grep tool 只認檔案、插不進來；要帶 `-c` / `-o` / `-l` / `-A` 這些 flag 控制輸出，封裝過的工具給不了；要把搜尋接到 `find` / `xargs` / `jq` 後面一起跑；再不然，CC 已經在 Bash 環境裡了，順手一個 `| grep` 最省事，切去別的工具反而多一道手續。

這五種沒有一個是「Grep tool 不夠好」，全是因為 CC 的搜尋本來就長在 shell 管線裡。而 FFF 的 MCP server 攔不到這些 Bash grep（要攔得另外開一個 Pi override 模式，不在這次評估範圍）。所以「給一個更好的 Grep tool」這件事，根本碰不到 CC 實際在走的那條路。這是結構天花板，跟工具品質無關。

## 主力專案還有另一個衝突

吃得到的比例先放一邊。就算只看那 8% 真的走了 Grep tool 的搜尋，FFF 在主力 Clojure 後端專案上還有另一個麻煩。

132 次 Grep tool 使用裡，47% 用了正則表達式，30% 是我歸成關係搜尋的（`A.*B`，找陌生模組裡兩個概念之間怎麼牽連）；這兩類不一定互斥，關係搜尋本身就常是正則。

FFF 的設計立場是主動勸退正則搜尋、鼓勵搜裸識別符，`multi_grep` 還明文標了「NEVER escape」。Clojure 程式碼裡 `(defn`、`(def` 的括號是語法字元，搜尋必須跳脫（`\(`），這個跳脫需求跟 FFF 的設計方向直接衝突。

關係搜尋那 30% 也接不住。FFF 假設使用者已經知道在找什麼識別符，但關係搜尋的場景是「我不確定，我在探索」，這種搜法在 FFF 的設計裡沒有位置。

對照組是 Hydrogen（TypeScript/React）前端 repo，字面查詢比例 54%，沒有 Clojure 括號問題，契合度好得多。但整體還是被「主力不走 Grep tool」封頂了。

## 第二層風險：常駐行程

FFF 比語意截斷類工具乾淨——它精確檢索、不會塞給你一堆不相關的結果，就算一次抓太多被 `maxResults` 截斷，也會給一個游標讓你接著往下拿，不會悄悄砍掉一截還不告訴你。這是它的優點。

但常駐記憶體索引帶來了那類工具沒有的新型風險：索引過期、搜不到實際存在的東西（[issue #276](https://github.com/dmtrKovalenko/fff/issues/276)，搜尋時不會自己檢查索引夠不夠新）、CPU 空轉（[issue #151](https://github.com/dmtrKovalenko/fff/issues/151)，`.gitignore` 被反覆解析）、還有 fff-mcp 在 Claude Code 裡直接掛掉（[issue #506](https://github.com/dmtrKovalenko/fff/issues/506)）。這幾個到 v0.9.4 都還開著。FFF 更新很勤，早期一些檔案描述符洩漏、資料庫鎖的問題已經修掉，但只要是背景常駐跑的程式，就會帶這一類毛病。

這讓我想到之前 [context-mode](https://github.com/mksglu/context-mode) 的案例：五天後留下 18 個沒收乾淨的背景行程，其中兩組卡進無窮迴圈、各吃滿一個 CPU 核心，移除之後系統負載從 10.29 掉到 4.81。在一出錯就難收拾的生產環境，背景常駐的程式帶的就是這類麻煩。

另外還有三個「不出聲就跳過」的設定：檔案超過 10MB 直接略過、單次搜尋超過 150 毫秒就停、每個檔案最多給 100 筆。這跟截斷類工具的毛病其實一樣，只是藏得比較深。

漏掉結果卻不出聲，在這種環境特別致命：它不會報錯，而是「搜尋看起來成功了、其實少了東西」，事後很難回頭查到底是哪一步漏的。

## 否決它，但它確實是把好工具

這次評估的結論是否決，理由是契合度。它跟我的工作型態不合，品質本身沒問題。FFF 設計良好，定義自動展開的機制特別有意思。

FFF 的甜蜜點是：工作流重度走 Grep tool、專案是 Chromium 等級的巨型 repo、搜尋以找識別符為主。在那種場景，它「快」的好處才真的看得出來。

我這邊的實際情況是：專案是中型 repo（ripgrep 冷啟動本來就只需幾十毫秒），CC 的搜尋主力走 Bash 管線、多是管線 / 研究型搜尋。兩邊就是合不來。

FFF 不爛。只是它站的那條路（Grep tool），我的 agent 走得很少而已。

三條重評觸發條件，符合任一個就值得重新看：改用 Neovim（`fff.nvim` picker 評價很高，目前 VS Code 轉 Zed，這條不適用）；FFF 推出能直接攔截 Bash grep 進 Claude Code 的模式（到 v0.9.4 仍只有 Pi override 有、MCP server 沒有）；工作型態轉向「固定巨型 repo、反覆找識別符、我願意把搜尋導向 Grep tool」。

這次評估是紙上的結構推論否決：我沒有在專案裡實機跑過 FFF，前面那些數字，是用既有的 CC session 推估「如果接了 FFF，它最多能介入多少搜尋」。跟前篇三戰三敗（那是真的裝起來裸測過）是不同性質的否決，不要混。

## 先量「agent 吃得到多少」，再看品質

這個案子抽出來可以當個通則：評估在 Claude Code 裡替代或增強 Grep tool 的 MCP 工具時，第一個問題不是「它帳面多快」，是「它的能力，到我的 agent 手上實際吃得到多少」。

算起來很簡單：翻 session 記錄裡的 `tool_use` 統計，拿 Grep tool 的次數，除以 Grep tool 加 Bash grep 的總次數。先把這個數字算出來，再決定要不要往下評工具品質。

封裝工具接不進 shell 管線，這就是天花板。宣稱的能力再強，你的 agent 吃不到就是吃不到。

採用牆其實破得了，只是不靠這種接法。真正的繞法走的是另一條路，下篇再說。
