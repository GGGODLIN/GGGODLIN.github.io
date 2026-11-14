# gggodlin-blog

個人技術部落格的寫作流程與 Astro 6 網站本體，正式站已上線於 `https://blog.gggodlin.com`。

## Scope

| Dir | 內容 |
|---|---|
| `src/` | Astro 6 網站本體，正式發佈文章位於 `src/content/blog/<slug>.md` |
| `inventory/` | memory + wiki + jsonl 挖出的題目候選報告 |
| `posts/` | 個人草稿與 `MATERIAL` 素材工作區（已由 `.gitignore` 排除，不進公開庫） |
| `style/` | threads 既有文章 + me-distill output + 反向萃取的風格 notes |

不含：`gggodlin.com` 主站設定（位於另一個儲存庫）

## Workflow

1. Inventory 排隊 → 使用者挑選題目
2. 於 `posts/` 收集查證素材並撰寫多版本草稿
3. 使用者本機校稿與定稿後，寫入 `src/content/blog/<slug>.md` 並通過契約測試（`npm test`）
4. `git push` → GitHub Actions 自動建置並部署至 GitHub Pages 自訂網域 `https://blog.gggodlin.com`（`.github/workflows/deploy.yml`）

## Source

- Memory: `~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/`
- Wiki: `~/.claude/wiki/`
- Session jsonl: `~/.claude/projects/.../<session>.jsonl`（補 memory / wiki 漏掉的 in-progress 題目，phase 2）
- Sibling pattern: `~/code/social-info/scripts/local-analysis/`（reuse `claude -p` headless + cron + reports/ 框架）

## Status

- 2026-05-17 — 啟動，跑首次存量 inventory（memory + wiki only，phase 2 jsonl 28 天待 review phase 1 後再說）
