# Blog Inventory 增補 2026-06-08

> `2026-05-17-baseline.md` 是當時掃 memory/wiki 的 snapshot。本檔收 baseline 之後新成熟、值得寫的題目（工作做完才長出來的，baseline 掃不到）。格式沿用 baseline 的候選條目慣例。

---

## A. Blog 候選（baseline 後新增）

### Deep（mature 但份量大，多 source 重組）

**~~N1~~. 我怎麼讓 Claude Code 的背景 workflow 撐過 5 小時額度牆——從「resume 很便宜」的假象到確定性修到三窗實測**（**dynamic-workflow 系列第三篇**；✅ **已寫成第十一篇 unattended-workflow-resume · 2026-06-08 上線**）← from `~/.claude/commands/workflow-monitor.md` + `~/.claude/skills/workflow-hardening/SKILL.md` + `~/Desktop/projects/memory-backlog-research/`（deep-research-paced.js 確定性修 + STATE F15/F10 實戰）

- **系列定位（碰撞檢查 2026-06-08 抓到，必讀）**：本題是 dynamic-workflow 系列**第三篇**，接在 ① 先發 B `workflow-vs-skill`（已上線，workflow 作為固化載體）② `dynamic-workflow-MATERIAL`（進行中，**burst 限流軸**：75 agent 湧入撞 server 429 → fork paced）**之後**。三篇分工：B=正向方法論 / MATERIAL=為什麼撞限+fork / **N1=fork paced 之後撞 5h 額度牆怎麼 pause→resume 續命**。**N1 不重講 burst 限流**（那是第二篇主軸，開頭一句帶過 + link），主軸收窄在「resume 的 cache 機制 + 確定性 + 換帳號」。
- **妙對照可寫**：第二篇講「編排確定性**解決不了** server burst 限流」、N1 講「prompt 確定性**決定** resume 能不能省 token」——同一個「確定性」概念的兩面，是承接前篇的天然 hook。

- **Angle**：CC 的 Workflow tool 可以背景跑、撞 5h 額度時 pause→resume，官方賣點是「completed agents return cached results」≈ 零 token。**但這只在 workflow 確定性時成立**。我實測一個暫停在 verify 中段的 deep-research，resume 只 replay 6 個 agent、重跑 94 個——因為 Fetch 階段用 no-barrier `pipeline()` + 可變 `fetchSlots`/`seen` race，每次 resume 的 agent prompt 都不同 → 從 Search 後全 cache miss。把 Fetch 改成確定性（barrier 收集 + 固定順序選 URL）後，跨三窗 resume（philip Team → alex Max → alex 重置）實測 fresh agent **52 / 60 / 11** vs journal **52 / 106 / 110**，只剩 13 個 in-flight 邊界重跑。
- **切入**：「Anthropic 說 resume 會把已完成的 agent 從 cache 拿回來、幾乎不花 token——我信了，結果 5.5M token 重燒。」
- **三個可寫的硬核**：
  1. **resume 的真相 = 只 replay「prompt 跨 run byte-identical 的確定性前綴」**——非確定性 workflow 的 pause→resume ≈ 全重跑（不是省 token，是「別 crash」）。
  2. **怎麼用硬證據判斷有沒有重跑**：數 transcript 的 `agent-*.jsonl` 按 mtime 分窗 vs journal `agentCount` 增量——別用 utilization %（Team 5x/Max 20x 不可比、且非線性，這正是我第一次的誤判）。
  3. **換帳號加速**：撞牆 pause 後 `/login` 切到額度空的帳號，reverse-watch 讀到低 util 自動 resume、燒新帳號額度（已驗證計費端真的切過去）。
- **failure-as-content + 量化 + 完整 retrospective 三條件全到**（baseline 說這正是 blog identity）：誤判 → 被自己質疑 → transcript 實算翻案 → 修工具 → 三窗驗證。量化證據：63M 吞吐 / 60% 是便宜的 cache_read / 265K output / 13 個邊界重跑。
- **成熟度**：mature（2026-06-07 三窗 end-to-end 驗證完，確定性修 commit 在 repo）。份量 deep（要重組 monitor skill + hardening skill + 確定性修 + F15/F10 實戰）。

⚠️ **發布前風險**（比照 baseline「公司 context 滲透」意識）：
- 雙帳號實戰涉及 `alex.robin@akohub.com`（工作帳號）+ philip——**email 要 sanitize**，只寫「Team 5x / Max 20x 兩個訂閱帳號」這層抽象，不 leak 公司 email。
- deep-research 跑的**研究內容**（F10 個人品牌、F15 自家 setup）不必入文——這篇主題是 workflow 機制本身，研究題目只是跑出機制的載體。
- 「`claude -p` 計費 / OAuth trap / 2026-06-15 billing 切分」這類政策細節是 timely、半年會過時 → 寫 timestamp + stale-by。

**可拆 / 合併判斷**：N1 是 dynamic-workflow 系列第三篇（見上方系列定位），與第二篇 `dynamic-workflow-MATERIAL` 分工清楚（burst 限流 vs pause/resume 續命）、不必併。也可拆成 quick win 子篇（單講「resume 的 cache 只認確定性 prompt」一個點），但完整版的 retrospective 張力（誤判→被質疑→transcript 翻案→修工具→三窗驗證）更強，建議一次寫足。**寫作時序**：建議等第二篇（burst 限流）先發，N1 才有「link 回前篇帶過 burst 背景」的依託。
