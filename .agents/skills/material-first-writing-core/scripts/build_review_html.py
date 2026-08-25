#!/usr/bin/env python3
"""Build an offline, self-contained HTML page for comparing Markdown drafts."""

from __future__ import annotations

import argparse
import html
import pathlib
import re


KEY_RE = re.compile(r"^[A-Za-z0-9_-]+$")


def inside(root: pathlib.Path, path: pathlib.Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def resolve_input(root: pathlib.Path, raw: str) -> pathlib.Path:
    candidate = pathlib.Path(raw)
    if not candidate.is_absolute():
        candidate = root / candidate
    candidate = candidate.resolve()
    if not inside(root, candidate):
        raise ValueError(f"document escapes --root: {raw}")
    if not candidate.is_file():
        raise ValueError(f"document is not a file: {raw}")
    return candidate


def inline(text: str) -> str:
    escaped = html.escape(text)
    escaped = re.sub(r"`([^`]+)`", r"<code>\1</code>", escaped)
    escaped = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", escaped)
    return re.sub(
        r"\[([^\]]+)\]\((https?://[^)\s]+)\)",
        r'<a href="\2" rel="noreferrer">\1</a>',
        escaped,
    )


def table_cells(line: str) -> list[str]:
    return [cell.strip() for cell in line.strip().strip("|").split("|")]


def is_table_separator(line: str) -> bool:
    cells = table_cells(line)
    return bool(cells) and all(re.fullmatch(r":?-{3,}:?", cell) for cell in cells)


def split_frontmatter(markdown: str) -> tuple[str, str]:
    if not markdown.startswith("---\n"):
        return "", markdown
    parts = markdown.split("---", 2)
    if len(parts) != 3:
        return "", markdown
    return parts[1].strip(), parts[2].lstrip()


def render(markdown: str) -> str:
    lines = markdown.splitlines()
    output: list[str] = []
    index = 0
    while index < len(lines):
        line = lines[index]
        if not line.strip():
            index += 1
            continue

        heading = re.match(r"^(#{1,4})\s+(.+)$", line)
        if heading:
            level = len(heading.group(1))
            output.append(f"<h{level}>{inline(heading.group(2).strip())}</h{level}>")
            index += 1
            continue

        if line.strip().startswith("```"):
            index += 1
            block: list[str] = []
            while index < len(lines) and not lines[index].strip().startswith("```"):
                block.append(lines[index])
                index += 1
            if index < len(lines):
                index += 1
            output.append("<pre><code>" + html.escape("\n".join(block)) + "</code></pre>")
            continue

        if "|" in line and index + 1 < len(lines) and is_table_separator(lines[index + 1]):
            header = table_cells(line)
            index += 2
            rows: list[list[str]] = []
            while index < len(lines) and "|" in lines[index] and lines[index].strip():
                rows.append(table_cells(lines[index]))
                index += 1
            output.append("<table><thead><tr>" + "".join(f"<th>{inline(c)}</th>" for c in header) + "</tr></thead><tbody>")
            for row in rows:
                output.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in row) + "</tr>")
            output.append("</tbody></table>")
            continue

        if line.lstrip().startswith(">"):
            quote: list[str] = []
            while index < len(lines) and lines[index].lstrip().startswith(">"):
                quote.append(inline(re.sub(r"^\s*>\s?", "", lines[index])))
                index += 1
            output.append("<blockquote>" + "<br>".join(quote) + "</blockquote>")
            continue

        if re.match(r"^\s*[-*]\s+", line):
            output.append("<ul>")
            while index < len(lines):
                item = re.match(r"^\s*[-*]\s+(.+)$", lines[index])
                if not item:
                    break
                output.append(f"<li>{inline(item.group(1))}</li>")
                index += 1
            output.append("</ul>")
            continue

        if re.match(r"^\s*\d+\.\s+", line):
            output.append("<ol>")
            while index < len(lines):
                item = re.match(r"^\s*\d+\.\s+(.+)$", lines[index])
                if not item:
                    break
                output.append(f"<li>{inline(item.group(1))}</li>")
                index += 1
            output.append("</ol>")
            continue

        paragraph: list[str] = []
        while index < len(lines) and lines[index].strip():
            current = lines[index]
            if re.match(r"^(#{1,4})\s+|^\s*```|^\s*[-*]\s+|^\s*\d+\.\s+|^\s*>", current):
                break
            if "|" in current and index + 1 < len(lines) and is_table_separator(lines[index + 1]):
                break
            paragraph.append(inline(current.strip()))
            index += 1
        if paragraph:
            output.append("<p>" + "<br>".join(paragraph) + "</p>")
        else:
            index += 1

    return "\n".join(output)


CSS = """
*{box-sizing:border-box}body{margin:0;background:#f5f3ed;color:#1f1e1b;font-family:-apple-system,BlinkMacSystemFont,"PingFang TC",sans-serif;line-height:1.75}
header{position:sticky;top:0;z-index:2;padding:14px 22px;background:#20201d;color:#f7f5ee}h1{margin:0 0 8px;font-size:18px}.tabs{display:flex;gap:7px;flex-wrap:wrap}
button{border:0;border-radius:5px;padding:7px 12px;background:#44413b;color:#eee9df;cursor:pointer}button.active{background:#b95e3f;color:white}.panel{display:none}.panel.active{display:block}
main{max-width:900px;margin:auto;padding:28px 22px 70px}.card{background:white;border:1px solid #ded8ca;border-radius:8px;padding:24px;margin-bottom:20px}.meta{font-size:12px;color:#6c665e}
article{font-size:17px}article h1{font-size:28px}article h2{margin-top:34px;border-top:1px solid #ddd6c8;padding-top:18px}code{background:#ece8de;padding:1px 4px;border-radius:3px}pre{overflow:auto;background:#282722;color:#eee8dc;padding:14px;border-radius:6px}
table{border-collapse:collapse;width:100%;display:block;overflow:auto;margin:18px 0}th,td{border:1px solid #d8d1c2;padding:7px 9px;text-align:left;vertical-align:top}th{background:#eee9de}blockquote{border-left:3px solid #b95e3f;margin:18px 0;padding:8px 16px;background:#faf9f5}
"""

JS = """
document.querySelectorAll('button[data-panel]').forEach((button)=>button.addEventListener('click',()=>{
 document.querySelectorAll('button[data-panel],.panel').forEach((node)=>node.classList.remove('active'));
 button.classList.add('active');document.getElementById(button.dataset.panel).classList.add('active');window.scrollTo(0,0);
}));
"""


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="project root containing every input document")
    parser.add_argument("--out", required=True, help="new or explicitly overwritten .html output under --root")
    parser.add_argument("--title", required=True)
    parser.add_argument("--note", default="")
    parser.add_argument("--doc", action="append", required=True, help="key|label|path|primary-or-ref")
    parser.add_argument("--overwrite", action="store_true")
    args = parser.parse_args()

    root = pathlib.Path(args.root).resolve()
    if not root.is_dir():
        raise SystemExit("--root must be an existing directory")

    documents: list[tuple[str, str, pathlib.Path, str]] = []
    seen: set[str] = set()
    try:
        for item in args.doc:
            parts = [part.strip() for part in item.split("|", 3)]
            if len(parts) != 4:
                raise ValueError("--doc must be key|label|path|primary-or-ref")
            key, label, raw_path, kind = parts
            if not KEY_RE.fullmatch(key) or key in seen:
                raise ValueError(f"invalid or duplicate document key: {key}")
            if kind not in {"primary", "ref"}:
                raise ValueError(f"invalid document kind: {kind}")
            documents.append((key, label, resolve_input(root, raw_path), kind))
            seen.add(key)
    except ValueError as error:
        raise SystemExit(str(error)) from error

    output_arg = pathlib.Path(args.out).expanduser()
    output = (root / output_arg if not output_arg.is_absolute() else output_arg).resolve()
    if not inside(root, output):
        raise SystemExit("output escapes --root")
    if output.suffix.lower() != ".html":
        raise SystemExit("--out must end in .html")
    if output.exists() and not args.overwrite:
        raise SystemExit("output already exists; choose a new path or pass --overwrite")

    tabs: list[str] = []
    panels: list[str] = []
    for position, (key, label, path, kind) in enumerate(documents):
        frontmatter, body = split_frontmatter(path.read_text(encoding="utf-8"))
        active = " active" if position == 0 else ""
        tabs.append(f'<button class="{kind}{active}" data-panel="panel-{key}">{html.escape(label)}</button>')
        meta = f"<pre>{html.escape(frontmatter)}</pre>" if frontmatter else ""
        panels.append(
            f'<section id="panel-{key}" class="panel{active}"><div class="card">'
            f'<div class="meta">{html.escape(path.name)}</div>{meta}<article>{render(body)}</article>'
            "</div></section>"
        )

    page = (
        "<!doctype html><html lang=\"zh-Hant\"><head><meta charset=\"utf-8\">"
        '<meta name="viewport" content="width=device-width,initial-scale=1">'
        f"<title>{html.escape(args.title)}</title><style>{CSS}</style></head><body>"
        f"<header><h1>{html.escape(args.title)}</h1><div>{html.escape(args.note)}</div>"
        f'<div class="tabs">{"".join(tabs)}</div></header><main>{"".join(panels)}</main>'
        f"<script>{JS}</script></body></html>"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page, encoding="utf-8")
    print(f"WROTE {output} ({len(documents)} documents)")


if __name__ == "__main__":
    main()
