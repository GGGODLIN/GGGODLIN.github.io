export type TldrInlineToken =
  | { readonly type: "text"; readonly value: string }
  | { readonly type: "strong"; readonly value: string }
  | { readonly type: "code"; readonly value: string }
  | { readonly type: "link"; readonly label: string; readonly href: string };

export type TldrParagraph = readonly TldrInlineToken[];

const INLINE_PATTERN =
  /\[([^\]]+)\]\(([^()\s]*(?:\([^()\s]*\)[^()\s]*)*)\)|\*\*([^*]+)\*\*|`([^`]+)`/g;

function isSafeHref(href: string): boolean {
  return (
    href.startsWith("https://") ||
    href.startsWith("http://") ||
    (href.startsWith("/") && !href.startsWith("//"))
  );
}

function parseInlineTokens(line: string): TldrParagraph {
  const tokens: TldrInlineToken[] = [];
  let cursor = 0;

  for (const match of line.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) {
      tokens.push({ type: "text", value: line.slice(cursor, start) });
    }

    const [fullMatch, linkLabel, linkHref, strongText, codeText] = match;
    if (linkLabel !== undefined && linkHref !== undefined) {
      if (isSafeHref(linkHref)) {
        tokens.push({ type: "link", label: linkLabel, href: linkHref });
      } else {
        tokens.push({ type: "text", value: linkLabel });
      }
    } else if (strongText !== undefined) {
      tokens.push({ type: "strong", value: strongText });
    } else if (codeText !== undefined) {
      tokens.push({ type: "code", value: codeText });
    }

    cursor = start + fullMatch.length;
  }

  if (cursor < line.length) {
    tokens.push({ type: "text", value: line.slice(cursor) });
  }

  return tokens;
}

export function parseTldrBlocks(raw: string | undefined): readonly TldrParagraph[] {
  if (!raw) return [];

  return raw
    .trim()
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.replace(/\s*\r?\n\s*/g, " ").trim())
    .filter((block) => block.length > 0)
    .map((block) => parseInlineTokens(block));
}
