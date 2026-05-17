# gggodlin-blog

個人技術 blog 的 pipeline + content repo。對應未來 `blog.gggodlin.com`（待建）。

## Scope

| Dir | 內容 |
|---|---|
| `inventory/` | memory + wiki + jsonl 挖出的題目候選報告 |
| `posts/` | `draft-<slug>.md` → user review → `published-<slug>.md` |
| `style/` | threads 既有文章 + me-distill output + 反向萃取的風格 notes |
| `scripts/` | inventory scan + 未來 graduate 到 `social-info/scripts/local-analysis/` |

不含：站本體 build（待 inventory 撐起再建 Astro skeleton）/ gggodlin.com hub config（另一個 repo）

## Workflow

1. Inventory 排隊 → user pick 題目
2. Claude 寫 `posts/draft-<slug>.md`
3. User local review + 潤色 → rename `posts/published-<slug>.md`
4. `git push` → CF Pages auto deploy

## Source

- Memory: `~/.claude/projects/-Users-linhancheng-Desktop-projects/memory/`
- Wiki: `~/.claude/wiki/`
- Session jsonl: `~/.claude/projects/.../<session>.jsonl`（補 memory / wiki 漏掉的 in-progress 題目，phase 2）
- Sibling pattern: `~/code/social-info/scripts/local-analysis/`（reuse `claude -p` headless + cron + reports/ 框架）

## Status

- 2026-05-17 — 啟動，跑首次存量 inventory（memory + wiki only，phase 2 jsonl 28 天待 review phase 1 後再說）
