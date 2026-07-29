import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node medium-paste-html.mjs <slug>");
  process.exit(1);
}

const site = readFileSync(join(process.cwd(), "astro.config.mjs"), "utf8").match(/site:\s*'([^']+)'/)?.[1];
const canonicalURL = `${site}/blog/${slug}/`;

const res = await fetch(canonicalURL);
if (!res.ok) {
  console.error(`fetch ${canonicalURL} -> ${res.status}`);
  process.exit(1);
}
const page = await res.text();
const article = page.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1];
if (!article) {
  console.error("article tag not found");
  process.exit(1);
}

let html = article
  .replace(/<header[\s\S]*?<\/header>/, "")
  .replace(/<footer[\s\S]*?<\/footer>/, "")
  .replace(/<h1[\s\S]*?<\/h1>/, "");

// 站內相對連結轉絕對。不轉的話：Medium 貼上後變 medium.com/blog/…、vocus 的 Lexical 解析成
// vocus.cc/blog/… 兩邊都是死連結（2026-07-29 #109 兩平台各撞一次）。負向前瞻排除
// protocol-relative 的 href="//cdn…"。
const relativeLinks = (html.match(/href="\/(?!\/)/g) ?? []).length;
html = html.replace(/href="\/(?!\/)/g, `href="${site}/`);

const preBlocks = [];
html = html.replace(/<pre[\s\S]*?<\/pre>/g, (m) => {
  preBlocks.push(m);
  return `<p>⟦CODE-BLOCK-${preBlocks.length}⟧</p>`;
});

const tables = [];
html = html.replace(/<table[\s\S]*?<\/table>/g, (m) => {
  tables.push(m);
  return `<p>⟦TABLE-${tables.length}⟧</p>`;
});

const outDir = join("/tmp", `medium-syndicate-${slug}`);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, "paste.html");
writeFileSync(outFile, html.trim());

console.log(
  JSON.stringify(
    {
      slug,
      canonicalURL,
      outFile,
      bytes: html.trim().length,
      codeBlockPlaceholders: preBlocks.length,
      tablePlaceholders: tables.length,
      relativeLinksAbsolutised: relativeLinks,
      paragraphs: (html.match(/<p[ >]/g) ?? []).length,
      headings: (html.match(/<h2[ >]/g) ?? []).length,
    },
    null,
    2,
  ),
);
