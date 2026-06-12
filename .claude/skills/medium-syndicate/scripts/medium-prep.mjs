import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const slug = process.argv[2];
if (!slug) {
  console.error("usage: node medium-prep.mjs <slug>");
  process.exit(1);
}

const repoRoot = process.cwd();
const postPath = join(repoRoot, "src/content/blog", `${slug}.md`);
const raw = readFileSync(postPath, "utf8");

const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
if (!fmMatch) {
  console.error("frontmatter not found");
  process.exit(1);
}

const fm = fmMatch[1];
const field = (name) => fm.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, "m"))?.[1] ?? "";
const tagsRaw = fm.match(/^tags:\s*\[([^\]]*)\]/m)?.[1] ?? "";
const tags = tagsRaw
  .split(",")
  .map((t) => t.trim().replace(/^"|"$/g, ""))
  .filter(Boolean);

const site = readFileSync(join(repoRoot, "astro.config.mjs"), "utf8").match(/site:\s*'([^']+)'/)?.[1];
const canonicalURL = `${site}/blog/${slug}/`;

let body = raw.slice(fmMatch[0].length);
body = body.replace(/^\s*# .*\n/, "");

const codeBlocks = [...body.matchAll(/^```(\w*)\n([\s\S]*?)^```/gm)].map((m, i) => ({
  index: i + 1,
  lang: m[1] || "(未標語言)",
  lines: m[2].trimEnd().split("\n").length,
}));
const tableLines = body.split("\n").filter((l) => l.trimStart().startsWith("|")).length;
const images = [...body.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map((m) => m[1]);
const links = [...body.matchAll(/\[[^\]]+\]\((https?:\/\/[^)]+)\)/g)].length;

const outDir = join("/tmp", `medium-syndicate-${slug}`);
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "body-no-frontmatter.md"), body);
codeBlocks.forEach((b, i) => {
  const m = [...body.matchAll(/^```\w*\n([\s\S]*?)^```/gm)][i];
  writeFileSync(join(outDir, `code-block-${i + 1}.txt`), m[1].trimEnd());
});

console.log(
  JSON.stringify(
    {
      slug,
      title: field("title"),
      description: field("description"),
      pubDate: field("pubDate"),
      tags,
      canonicalURL,
      outDir,
      risks: {
        codeBlocks,
        tableLines,
        images,
        externalLinks: links,
      },
    },
    null,
    2,
  ),
);
