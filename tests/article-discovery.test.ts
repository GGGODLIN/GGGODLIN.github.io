import assert from "node:assert/strict";
import test from "node:test";
import {
  createArticleDiscoveryState,
  filterArticleDiscovery,
  hasArticleDiscoveryFilters,
  transitionArticleDiscovery,
  type ArticleDiscoveryItem,
} from "../src/data/article-discovery.ts";
import { readBlogCorpus } from "./support/blog-corpus.ts";

const corpus = readBlogCorpus(
  new URL("../src/content/blog", import.meta.url),
).map((article) => ({
  id: article.slug,
  searchText: "",
  topicIds: [],
  tagIds: article.tags,
} satisfies ArticleDiscoveryItem));

const exactTagCases = {
  hook: [
    "checker-layoff",
    "compact-guard",
    "dcg-safety-lock",
    "hook-watchdog",
    "inline-the-rules",
    "local-llm-hook-judge",
    "prose-exams",
    "protocol-model-dependency",
    "rule-ladder",
    "sem-blast-radius",
  ],
  skill: ["matt-philosophy", "prose-exams", "workflow-vs-skill"],
  subagent: [
    "exit-0-illusion",
    "measure-revealed-adoption",
    "subagent-boot-cost",
  ],
  workflow: [
    "absorb-awesome-list",
    "deep-research-rate-limit",
    "one-model-not-enough",
    "prose-exams",
    "trial-review-system",
    "unattended-workflow-resume",
    "workflow-vs-skill",
  ],
} as const;

test("tag navigation returns only canonical frontmatter memberships", () => {
  for (const [tagId, expectedIds] of Object.entries(exactTagCases)) {
    const state = transitionArticleDiscovery(
      createArticleDiscoveryState({ query: tagId, topicId: "tools" }),
      { type: "tag", tagId },
    );
    const actualIds = filterArticleDiscovery(corpus, state)
      .map((article) => article.id)
      .sort((left, right) => left.localeCompare(right));

    assert.equal(state.query, "", tagId);
    assert.equal(state.topicId, "", tagId);
    assert.equal(state.tagId, tagId, tagId);
    assert.deepEqual(
      actualIds,
      [...expectedIds].sort((left, right) => left.localeCompare(right)),
      tagId,
    );
  }
});

test("general search keeps case-insensitive title, description, and visible-label matches", () => {
  const articles = [
    {
      id: "title-match",
      searchText: "exact title other summary other label",
      topicIds: [],
      tagIds: ["hook"],
    },
    {
      id: "description-match",
      searchText: "other title summary needle other label",
      topicIds: [],
      tagIds: ["skill"],
    },
    {
      id: "label-match",
      searchText: "other title other summary Claude Code",
      topicIds: [],
      tagIds: ["claude-code"],
    },
  ] satisfies ArticleDiscoveryItem[];

  for (const [query, expectedId] of [
    ["EXACT TITLE", "title-match"],
    ["SUMMARY NEEDLE", "description-match"],
    ["claude code", "label-match"],
  ] as const) {
    const state = transitionArticleDiscovery(
      createArticleDiscoveryState({ tagId: "hook" }),
      { type: "search", query },
    );

    assert.equal(state.tagId, "", query);
    assert.deepEqual(
      filterArticleDiscovery(articles, state).map((article) => article.id),
      [expectedId],
      query,
    );
  }
});

test("whitespace-only search is not an active filter", () => {
  assert.equal(
    hasArticleDiscoveryFilters(createArticleDiscoveryState({ query: "   " })),
    false,
  );
});

test("topic, reset, and close transitions clear exact tag state", () => {
  const taggedState = createArticleDiscoveryState({ tagId: "hook" });

  assert.deepEqual(
    transitionArticleDiscovery(taggedState, {
      type: "topic",
      topicId: "automation",
    }),
    { query: "", topicId: "automation", tagId: "" },
  );
  assert.deepEqual(
    transitionArticleDiscovery(taggedState, { type: "reset" }),
    { query: "", topicId: "", tagId: "" },
  );
  assert.deepEqual(
    transitionArticleDiscovery(taggedState, { type: "close" }),
    { query: "", topicId: "", tagId: "" },
  );
});
