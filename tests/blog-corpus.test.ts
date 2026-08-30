import assert from "node:assert/strict";
import test from "node:test";
import { readBlogCorpus } from "./support/blog-corpus.ts";

test("blog corpus reader follows the recursive loader slug contract", () => {
  const corpus = readBlogCorpus(
    new URL("./fixtures/blog-corpus", import.meta.url),
  );

  assert.deepEqual(
    corpus.map(({ fileName, slug, tags }) => ({ fileName, slug, tags })),
    [
      {
        fileName: "nested/example.md",
        slug: "nested/example",
        tags: ["hook", "automation"],
      },
      {
        fileName: "nested/z-example.md",
        slug: "nested/z-example",
        tags: ["memory"],
      },
      {
        fileName: "nested/ä-example.md",
        slug: "nested/ä-example",
        tags: ["memory"],
      },
      {
        fileName: "top-level.md",
        slug: "top-level",
        tags: ["memory"],
      },
    ],
  );
});
