import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve, sep } from "node:path";

export interface BlogCorpusArticle {
  readonly absolutePath: string;
  readonly fileName: string;
  readonly slug: string;
  readonly source: string;
  readonly title: string;
  readonly tags: readonly string[];
}

function parseFrontmatterValue(source: string, field: string, fileName: string): string {
  const value = source.match(new RegExp(`^${field}:\\s*(.+)$`, "m"))?.[1]?.trim();
  assert.ok(value, `Missing ${field} frontmatter in ${fileName}`);
  return value.replace(/^(["'])(.*)\1$/, "$2");
}

function parseTags(source: string, fileName: string): readonly string[] {
  const serializedTags = source.match(/^tags:\s*(\[.*\])$/m)?.[1];
  assert.ok(serializedTags, `Missing tags frontmatter in ${fileName}`);
  return JSON.parse(serializedTags) as string[];
}

function toDirectoryPath(directory: URL | string): string {
  return resolve(directory instanceof URL ? fileURLToPath(directory) : directory);
}

function compareCodePoints(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}

export function readBlogCorpus(directory: URL | string): readonly BlogCorpusArticle[] {
  const root = toDirectoryPath(directory);
  const absolutePaths: string[] = [];

  const visit = (currentDirectory: string): void => {
    const entries = readdirSync(currentDirectory, { withFileTypes: true })
      .sort((left, right) => compareCodePoints(left.name, right.name));

    for (const entry of entries) {
      const absolutePath = join(currentDirectory, entry.name);
      if (entry.isDirectory()) {
        visit(absolutePath);
        continue;
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        absolutePaths.push(absolutePath);
      }
    }
  };

  visit(root);

  return absolutePaths
    .map((absolutePath) => {
      const fileName = relative(root, absolutePath).split(sep).join("/");
      const source = readFileSync(absolutePath, "utf8");
      return {
        absolutePath,
        fileName,
        slug: fileName.replace(/\.md$/, ""),
        source,
        title: parseFrontmatterValue(source, "title", fileName),
        tags: parseTags(source, fileName),
      };
    })
    .sort((left, right) => compareCodePoints(left.slug, right.slug));
}
