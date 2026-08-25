# Goal Plan: 發佈 V2 文體版成新 route + 固化事實查核紀錄進 CLAUDE.md

Generated: 2026-05-18
Task: (1) 採用 V2（posts/draft-rvm-v2-threads-line-bolas.md，threads+line+bolas 文體）發佈成新 route，不取代既有 src/content/blog/retire-vector-memory.md，build 驗證後 push 觸發 GitHub Pages 部署。(2) 把「對某主題做過的事實查核要記錄下來」固化進專案 CLAUDE.md（非 skill）。
Turn budget: 35（hard cap 50）

## 已驗證的環境事實（probe 過，非訓練資料臆測）

- blog = `src/pages/blog/[...slug].astro` 動態路由 + content collection glob `./src/content/blog/**/*.md`。加一個新 .md = 自動生新 route，**無需寫路由檔、不碰原檔**
- zod schema 要求 frontmatter：`title:string` `description:string` `pubDate:coerce.date` `tags:string[]`（draft 現有 `date/voice/status/source` 要轉成 schema 形）
- deploy = `.github/workflows/deploy.yml`，觸發 `push: branches:[main]`（withastro/action@v6 → actions/deploy-pages@v5）。Pages 已啟用 build_type=workflow，live `https://gggodlin.github.io/`
- 當前 branch `main`；gh auth ✓ GGGODLIN；node v24.8 / npm 11.6 / node_modules/astro 已裝
- origin = **public** repo `GGGODLIN/GGGODLIN.github.io`
- .gitignore 只 ignore `docs/philip/` `style/line-raw/*.txt` `style/cc-raw/*.txt|json`。**posts/、style/experiments/、style/reference/、style/voice-profile*.md、CLAUDE.md 都沒被 ignore** → `git add -A` 會外洩 voice 蒸餾內部檔到公開 repo

## Plan

1. **建新 route 內容檔**：讀 `posts/draft-rvm-v2-threads-line-bolas.md`，正文照搬寫入 `src/content/blog/retire-vector-memory-v2.md`，frontmatter 改成 schema 形：`title`（沿用 draft 標題）、`description`（沿用）、`pubDate: 2026-05-18`、`tags: ["claude-code","memory","vector-db","retrospective"]`；移除 voice/status/source/date。**不動** retire-vector-memory.md。
   - Verify: `ls src/content/blog/` 同時列 retire-vector-memory.md 與 retire-vector-memory-v2.md；`git diff --stat src/content/blog/retire-vector-memory.md` 無輸出（原檔 0 改動）
2. **本地 build 驗證**：`npm run check` 然後 `npm run build`
   - Verify: astro check 輸出含 `0 errors`；build 成功且 `dist/blog/retire-vector-memory-v2/index.html` 與 `dist/blog/retire-vector-memory/index.html` 皆存在
3. **固化事實查核紀錄進 CLAUDE.md**：在 `CLAUDE.md`（專案級，非全域；理由：綁 MATERIAL fact-authority 流程）加一段，規範「對某主題做過事實查核 → 記錄 claim / 判定 / 來源 / 日期，可複用、餵 MATERIAL fact-authority 標記、避免重查」
   - Verify: `grep -n 事實查核 CLAUDE.md` 命中新段標題
4. **Scoped commit（嚴禁 git add -A）**：`git add src/content/blog/retire-vector-memory-v2.md CLAUDE.md` 只此兩路徑
   - Verify: `git diff --cached --name-only` 輸出剛好 2 行 = `CLAUDE.md` + `src/content/blog/retire-vector-memory-v2.md`，無其他。否則 `git reset` 重來
   - commit message: `feat: publish V2-voice variant of retire-vector-memory at separate route` + 另一句 chore 拆 CLAUDE.md（或合理 conventional message）
5. **Push main 觸發部署**：`git push origin main`
   - Verify: push 成功；`gh run list --workflow=deploy.yml --limit 1` 顯示新 commit 觸發的 run
6. **驗證線上部署**：poll `gh run watch <id>` 至完成，再 `curl -sI` 兩個 route
   - Verify: workflow run conclusion `success`；`curl -sI https://gggodlin.github.io/blog/retire-vector-memory-v2/` → HTTP 200；`curl -sI https://gggodlin.github.io/blog/retire-vector-memory/` 仍 → HTTP 200（原版線上完好）

## Pre-flight checklist

✅ gh auth（GGGODLIN keyring token）
✅ GitHub Pages 已啟用（build_type workflow，live）
✅ deploy.yml 存在且觸發 push:main
✅ node v24.8 / npm 11.6 / node_modules/astro 已裝
✅ branch = main（deploy 觸發分支）
✅ PLAN-goal.md 原不存在（本檔新建）

全 ✅，無 user-action-required。可直接貼 condition 開跑。

## Hand-off (post-goal manual steps)

1. 視覺確認 `https://gggodlin.github.io/blog/retire-vector-memory-v2/` 排版 OK（主觀，非 goal gate）
2. **強烈建議（獨立決策，不在本 goal scope）**：這是 public repo 但 posts/ + style/experiments/ + style/reference/ + style/voice-profile*.md 未 gitignore。voice 蒸餾內部含 LINE 私聊語域 / 政治 / 性僻 register 註記，建議補 .gitignore 或移私有 repo。本 goal 用 scoped commit 暫時迴避，但根因未除
3. 本 session 其餘未 commit（v1/v3 draft、MATERIAL、profiles、CLAUDE.md 已隨 goal commit、extract.py、voice-profile-cc.md 改動）仍待你決定去留

## Risk + fallback

| Risk | Fallback |
|---|---|
| `git add -A` 外洩 voice 內部檔到公開 repo | Phase 4 scoped add 2 路徑；commit 前 assert cached 剛好 2 行否則 reset |
| frontmatter 不合 zod schema → build fail | 對照 src/content/config.ts 修 title/description/pubDate/tags，不改 body |
| CI deploy 失敗/慢 | `gh run watch` poll；同 root cause retry 2 次後 surface ⏸ PENDING_USER_ACTION |
| slug 撞既有 | 固定 retire-vector-memory-v2，Phase 1 ls 確認不撞原檔 |
| 原版被動到 | Phase 2 + 6 雙驗 retire-vector-memory 檔 0 改動 + 線上仍 200 |
| Astro/action API stale | 遇矛盾 fact 重新 invoke /research-before-answer 不硬撞 |

## Goal condition (reference copy)

見 chat code block（與此同步）。
