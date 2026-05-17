"""
Extract user-only prose messages from all CC project jsonl files.

Filters out:
- tool_result responses (user role but auto-generated)
- pure slash commands
- pure system-reminder / hook tags
- attachments / images
- very short messages
- duplicate consecutive messages within one session

Output:
- all-user-messages-clean.txt : prose corpus for distillation
- by-project-stats.json       : per-project counts
"""

import json
import re
from pathlib import Path
from collections import defaultdict

PROJECTS_DIR = Path.home() / ".claude" / "projects"
OUT_DIR = Path("/Users/linhancheng/Desktop/projects/gggodlin-blog/style/cc-raw")
OUT_DIR.mkdir(parents=True, exist_ok=True)

OUT_CLEAN = OUT_DIR / "all-user-messages-clean.txt"
OUT_BY_PROJECT = OUT_DIR / "by-project-summary.txt"
OUT_STATS = OUT_DIR / "extraction-stats.json"

# Strip wrapper tags that aren't actual user speech
TAG_RE = re.compile(
    r"<(system-reminder|local-command-stdout|local-command-stderr|local-command-stdin|"
    r"bash-input|bash-stdout|bash-stderr|command-name|command-message|command-args|"
    r"user-prompt-submit-hook|stdin|user-memory-input)[^>]*>.*?</\1>",
    re.DOTALL,
)
SLASH_ONLY_RE = re.compile(r"^\s*/[\w:-]+(?:\s+\S+)*\s*$")
CONTAINS_ZH_OR_PROSE_RE = re.compile(r"[一-鿿]|[a-zA-Z]{4,}")


def clean(text: str) -> str:
    text = TAG_RE.sub("", text)
    return text.strip()


def looks_like_pasted_data(text: str) -> bool:
    if len(text) > 2000 and text.count("\n") > 30 and text.count(" ") / max(len(text), 1) < 0.03:
        return True
    if text.count("\t") > 20:
        return True
    return False


stats = {
    "total_jsonl": 0,
    "user_string_total": 0,
    "user_tool_result_filtered": 0,
    "kept": 0,
    "filtered_slash_only": 0,
    "filtered_short": 0,
    "filtered_pasted_data": 0,
    "filtered_tag_only": 0,
    "by_project": defaultdict(lambda: {"kept": 0, "filtered": 0}),
}

per_project_lines = defaultdict(list)
all_lines = []

for jsonl_path in PROJECTS_DIR.rglob("*.jsonl"):
    stats["total_jsonl"] += 1
    project_slug = jsonl_path.parent.name

    try:
        with open(jsonl_path, encoding="utf-8", errors="replace") as f:
            prev_text = None
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    obj = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if obj.get("type") != "user":
                    continue
                msg = obj.get("message", {})
                if msg.get("role") != "user":
                    continue
                content = msg.get("content")

                if isinstance(content, list):
                    is_tool_result = any(
                        isinstance(c, dict) and c.get("type") == "tool_result"
                        for c in content
                    )
                    if is_tool_result:
                        stats["user_tool_result_filtered"] += 1
                        continue
                    text_parts = [
                        c.get("text", "")
                        for c in content
                        if isinstance(c, dict) and c.get("type") == "text"
                    ]
                    text = "\n".join(text_parts).strip()
                elif isinstance(content, str):
                    text = content
                else:
                    continue

                stats["user_string_total"] += 1

                if not text or len(text.strip()) < 4:
                    stats["filtered_short"] += 1
                    stats["by_project"][project_slug]["filtered"] += 1
                    continue

                if SLASH_ONLY_RE.match(text):
                    stats["filtered_slash_only"] += 1
                    stats["by_project"][project_slug]["filtered"] += 1
                    continue

                cleaned = clean(text)
                if len(cleaned) < 4:
                    stats["filtered_tag_only"] += 1
                    stats["by_project"][project_slug]["filtered"] += 1
                    continue

                if not CONTAINS_ZH_OR_PROSE_RE.search(cleaned):
                    stats["filtered_tag_only"] += 1
                    stats["by_project"][project_slug]["filtered"] += 1
                    continue

                if looks_like_pasted_data(cleaned):
                    stats["filtered_pasted_data"] += 1
                    stats["by_project"][project_slug]["filtered"] += 1
                    continue

                if cleaned == prev_text:
                    continue
                prev_text = cleaned

                stats["kept"] += 1
                stats["by_project"][project_slug]["kept"] += 1

                all_lines.append(cleaned)
                per_project_lines[project_slug].append(cleaned)

    except Exception as e:
        print(f"err {jsonl_path}: {e}", flush=True)

with open(OUT_CLEAN, "w", encoding="utf-8") as f:
    f.write("\n---\n".join(all_lines))

with open(OUT_BY_PROJECT, "w", encoding="utf-8") as f:
    by_count = sorted(
        ((slug, len(lines)) for slug, lines in per_project_lines.items()),
        key=lambda x: -x[1],
    )
    for slug, n in by_count:
        f.write(f"{n:>6}  {slug}\n")

with open(OUT_STATS, "w", encoding="utf-8") as f:
    serializable = dict(stats)
    serializable["by_project"] = dict(serializable["by_project"])
    json.dump(serializable, f, ensure_ascii=False, indent=2)

print(
    f"Done. jsonl={stats['total_jsonl']} | "
    f"user_str_seen={stats['user_string_total']} | "
    f"tool_result_skipped={stats['user_tool_result_filtered']} | "
    f"kept={stats['kept']} | "
    f"slash={stats['filtered_slash_only']} | "
    f"short={stats['filtered_short']} | "
    f"tag={stats['filtered_tag_only']} | "
    f"pasted={stats['filtered_pasted_data']}"
)
