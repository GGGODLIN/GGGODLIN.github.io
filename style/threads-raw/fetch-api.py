#!/usr/bin/env python3
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import NamedTemporaryFile

BASE = "https://graph.threads.net/v1.0"
API_HOST = "graph.threads.net"
MAX_PAGES = 1000
OUTPUT_DIR = Path("/Users/linhancheng/Desktop/projects/gggodlin-blog/style/threads-raw")
TPE = timezone(timedelta(hours=8))


class NoRedirect(urllib.request.HTTPRedirectHandler):
  def redirect_request(self, req, fp, code, msg, headers, newurl):
    if fp:
      fp.close()
    raise RuntimeError("Threads API redirect blocked")


OPENER = urllib.request.build_opener(NoRedirect)


def read_token():
  out = subprocess.run(
    [
      "/usr/bin/security",
      "find-generic-password",
      "-s",
      "threads-api-access-token",
      "-a",
      "gggodlin",
      "-w",
    ],
    capture_output=True,
    text=True,
    check=True,
  )
  return out.stdout.strip()


def validate_api_url(url):
  parsed = urllib.parse.urlparse(url)
  try:
    port = parsed.port
  except ValueError as exc:
    raise RuntimeError("unexpected Threads API URL") from exc
  if (
    parsed.scheme != "https"
    or parsed.hostname != API_HOST
    or port not in (None, 443)
    or not parsed.path.startswith("/v1.0/")
    or parsed.username
    or parsed.password
  ):
    raise RuntimeError("unexpected Threads API URL")


def get(url, token):
  validate_api_url(url)
  req = urllib.request.Request(url, headers={"Authorization": f"Bearer {token}"})
  with OPENER.open(req, timeout=30) as resp:
    payload = json.load(resp)
  if not isinstance(payload, dict):
    raise RuntimeError("Threads API returned an invalid response")
  return payload


def fetch_all(edge, fields, token, limit=100):
  params = urllib.parse.urlencode({"fields": ",".join(fields), "limit": limit})
  url = f"{BASE}/me/{edge}?{params}"
  items = []
  pages = 0
  seen_urls = set()
  while url:
    if url in seen_urls:
      raise RuntimeError("Threads API pagination repeated a page")
    if pages >= MAX_PAGES:
      raise RuntimeError("Threads API pagination exceeded the page limit")
    seen_urls.add(url)
    payload = get(url, token)
    if "error" in payload:
      raise RuntimeError("Threads API returned an error")
    data = payload.get("data")
    paging = payload.get("paging", {})
    if not isinstance(data, list) or not all(isinstance(item, dict) for item in data):
      raise RuntimeError("Threads API returned invalid data")
    if not isinstance(paging, dict):
      raise RuntimeError("Threads API returned invalid paging data")
    next_url = paging.get("next")
    if next_url is not None and not isinstance(next_url, str):
      raise RuntimeError("Threads API returned an invalid next page")
    items.extend(data)
    pages += 1
    url = next_url
  return items, pages


def to_local(stamp):
  normalized = f"{stamp[:-1]}+00:00" if stamp.endswith("Z") else stamp
  return datetime.fromisoformat(normalized).astimezone(TPE)


def render(items, title, source_edge, fetched_total):
  stamps = [to_local(item["timestamp"]) for item in items if item.get("timestamp")]
  span = f"{min(stamps):%Y-%m-%d} → {max(stamps):%Y-%m-%d}" if stamps else "n/a"
  omitted = fetched_total - len(items)
  lines = [
    (
      f"# Threads @gggodlin {title} — API text corpus "
      f"({len(items)} text items, {fetched_total} fetched, {omitted} without text, {span})"
    ),
    "",
    f"Source: {BASE}/me/{source_edge}",
    f"Fetched: {datetime.now(TPE):%Y-%m-%d %H:%M} via Threads Graph API (token from Keychain)",
    "",
  ]
  for idx, item in enumerate(sorted(items, key=lambda value: value.get("timestamp", "")), 1):
    local = to_local(item["timestamp"]) if item.get("timestamp") else None
    lines.append("---")
    lines.append("")
    lines.append(f"## #{idx}")
    lines.append("")
    if local:
      lines.append(f"**{local:%Y-%m-%d %H:%M}**")
    if item.get("permalink"):
      lines.append(f"<{item['permalink']}>")
    lines.append("")
    lines.append(item["text"].strip())
    lines.append("")
  return "\n".join(lines)


def atomic_write(path, content):
  temp_path = None
  try:
    with NamedTemporaryFile(
      "w",
      encoding="utf-8",
      dir=path.parent,
      prefix=f".{path.name}.",
      delete=False,
    ) as handle:
      handle.write(content)
      handle.flush()
      os.fsync(handle.fileno())
      temp_path = Path(handle.name)
    os.replace(temp_path, path)
  finally:
    if temp_path and temp_path.exists():
      temp_path.unlink()


def main():
  token = read_token()
  if not token:
    raise RuntimeError("token 讀取失敗")

  today = datetime.now(TPE).strftime("%Y-%m-%d")
  jobs = [
    (
      "threads",
      ["id", "text", "timestamp", "permalink", "media_type", "is_quote_post"],
      "main feed",
      f"main-{today}-api.md",
    ),
    (
      "replies",
      ["id", "text", "timestamp", "permalink"],
      "replies",
      f"replies-{today}-api.md",
    ),
  ]

  outputs = []
  for edge, fields, title, filename in jobs:
    items, pages = fetch_all(edge, fields, token)
    with_text = [item for item in items if (item.get("text") or "").strip()]
    content = render(with_text, title, edge, len(items))
    stamps = [to_local(item["timestamp"]) for item in with_text if item.get("timestamp")]
    outputs.append((
      OUTPUT_DIR / filename,
      content,
      {
        "edge": edge,
        "file": filename,
        "pages": pages,
        "fetched": len(items),
        "with_text": len(with_text),
        "without_text": len(items) - len(with_text),
        "earliest": f"{min(stamps):%Y-%m-%d}" if stamps else None,
        "latest": f"{max(stamps):%Y-%m-%d}" if stamps else None,
      },
    ))

  for path, content, _ in outputs:
    atomic_write(path, content)
  for _, _, receipt in outputs:
    print(json.dumps(receipt, ensure_ascii=False))
  return 0


if __name__ == "__main__":
  try:
    sys.exit(main())
  except Exception as exc:
    print(f"抓取失敗：{type(exc).__name__}: {exc}", file=sys.stderr)
    sys.exit(1)
