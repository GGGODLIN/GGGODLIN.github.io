"""
Second-pass filter:
- Drop subagent prompt templates (start with "You are", or contain heavy template markers)
- Drop Stop hook feedback / AUTO-SAVE etc.
- Drop messages > 2500 chars (likely pasted spec / long doc / template)
- Drop messages that look like file paths only / log dumps

Output: all-user-messages-prose.txt (the true voice corpus)
"""

import re
from pathlib import Path

IN = Path("/Users/linhancheng/Desktop/projects/gggodlin-blog/style/cc-raw/all-user-messages-clean.txt")
OUT = Path("/Users/linhancheng/Desktop/projects/gggodlin-blog/style/cc-raw/all-user-messages-prose.txt")
OUT_DROPPED = Path("/Users/linhancheng/Desktop/projects/gggodlin-blog/style/cc-raw/dropped-samples.txt")

content = IN.read_text(encoding="utf-8")
msgs = [m.strip() for m in content.split("\n---\n") if m.strip()]

SUBAGENT_PROMPT_STARTS = (
    "You are ",
    "你是繁中",
    "你是 ",
    "你是繁體",
    "你是中文",
    "Subagent prompt:",
    "Background command",
    "## Context",
    "## Task",
)

HOOK_FEEDBACK_STARTS = (
    "Stop hook feedback:",
    "PreToolUse hook",
    "PostToolUse hook",
    "SessionStart hook",
    "UserPromptSubmit hook",
    "AUTO-SAVE",
)

TEMPLATE_MARKERS = [
    "Working directory:",
    "## What Was Requested",
    "## Acceptance Criteria",
    "## Test plan",
    "<task-id>",
    "<task-notification>",
    "<status>completed</status>",
]

kept = []
dropped = []

def reason(m):
    if any(m.startswith(p) for p in SUBAGENT_PROMPT_STARTS):
        return "subagent_prompt"
    if any(m.startswith(p) for p in HOOK_FEEDBACK_STARTS):
        return "hook_feedback"
    template_hits = sum(1 for mk in TEMPLATE_MARKERS if mk in m)
    if template_hits >= 2:
        return "template_doc"
    if len(m) > 2500:
        return "too_long"
    if m.count("```") >= 4:
        return "heavy_code"
    if m.count("\n") > 0 and m.count("\n") > len(m) / 60:  # mostly line breaks (lists, file dumps)
        if "/" in m and any(part.startswith("/") for part in m.split()):
            return "path_dump"
    return None

drop_counts = {}
for m in msgs:
    r = reason(m)
    if r:
        drop_counts[r] = drop_counts.get(r, 0) + 1
        if len(dropped) < 30:
            dropped.append((r, m[:300]))
    else:
        kept.append(m)

OUT.write_text("\n---\n".join(kept), encoding="utf-8")

dropped_text = "\n\n".join(f"### [{r}] ({len(m)} chars sample)\n{m}" for r, m in dropped)
OUT_DROPPED.write_text(dropped_text, encoding="utf-8")

total_chars = sum(len(m) for m in kept)
lengths = sorted(len(m) for m in kept)
median = lengths[len(lengths)//2] if lengths else 0
p90 = lengths[int(len(lengths)*0.9)] if lengths else 0
p99 = lengths[int(len(lengths)*0.99)] if lengths else 0

print(f"input msgs: {len(msgs)}")
print(f"kept prose: {len(kept)}")
print(f"dropped breakdown: {drop_counts}")
print(f"total chars (prose): {total_chars:,}")
print(f"median / p90 / p99 / max: {median} / {p90} / {p99} / {lengths[-1] if lengths else 0}")
