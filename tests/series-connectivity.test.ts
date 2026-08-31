import assert from "node:assert/strict";
import test from "node:test";
import { canonicalTagRegistry } from "../src/data/tag-registry.ts";
import {
  analyzeSeriesConnectivity,
  expectedSeries,
  forbiddenSeriesConnectorTags,
  formatConnectivityFailures,
  intentionalIslandSlugs,
  validateSeriesConnectors,
} from "./support/series-connectivity-contract.ts";
import { readBlogCorpus } from "./support/blog-corpus.ts";

function readCorpusTags(): ReadonlyMap<string, readonly string[]> {
  return new Map(
    readBlogCorpus(new URL("../src/content/blog", import.meta.url))
      .map((article) => [article.slug, article.tags]),
  );
}

test("expected series contract validates canonical connectors", () => {
  validateSeriesConnectors(
    expectedSeries,
    (connector) => canonicalTagRegistry.validateCanonicalId(connector),
  );
  assert.throws(
    () => validateSeriesConnectors(
      [{
        id: "S99",
        title: "invalid connector fixture",
        minimumCommonConcept: "fixture only",
        members: ["alpha", "beta"],
        validConnectors: ["unknown-series-connector"],
      }],
      (connector) => canonicalTagRegistry.validateCanonicalId(connector),
    ),
    /Unknown canonical tag "unknown-series-connector"/,
  );
  assert.throws(
    () => validateSeriesConnectors(
      [{
        id: "S99",
        title: "forbidden connector fixture",
        minimumCommonConcept: "fixture only",
        members: ["alpha", "beta"],
        validConnectors: ["claude-code"],
      }],
      (connector) => canonicalTagRegistry.validateCanonicalId(connector),
    ),
    /Forbidden series connector "claude-code" in S99/,
  );

  for (const series of expectedSeries) {
    assert.ok(series.members.length > 1, series.id);
    assert.ok(series.validConnectors.length > 0, series.id);
    assert.equal(new Set(series.members).size, series.members.length, series.id);
    assert.equal(new Set(series.validConnectors).size, series.validConnectors.length, series.id);
    for (const forbiddenTag of forbiddenSeriesConnectorTags) {
      assert.equal(series.validConnectors.includes(forbiddenTag), false, series.id);
    }
  }
});

test("connectivity analysis reports deterministic disconnected components", () => {
  const result = analyzeSeriesConnectivity(
    [{
      id: "S99",
      title: "negative fixture",
      minimumCommonConcept: "fixture only",
      members: ["alpha", "beta", "gamma"],
      validConnectors: ["approved-connector"],
    }],
    new Map([
      ["alpha", ["approved-connector", "claude-code"]],
      ["beta", ["approved-connector", "methodology"]],
      ["gamma", ["claude-code", "methodology"]],
    ]),
  );

  assert.deepEqual(result[0].components, [["alpha", "beta"], ["gamma"]]);
  const expectedFailure = "S99 disconnected: components=[alpha, beta] | [gamma]; allowlist=[approved-connector]";
  assert.equal(formatConnectivityFailures(result), expectedFailure);

  const reversedResult = analyzeSeriesConnectivity(
    [{
      id: "S99",
      title: "negative fixture",
      minimumCommonConcept: "fixture only",
      members: ["gamma", "beta", "alpha"],
      validConnectors: ["approved-connector"],
    }],
    new Map([
      ["gamma", ["methodology", "claude-code"]],
      ["beta", ["methodology", "approved-connector"]],
      ["alpha", ["claude-code", "approved-connector"]],
    ]),
  );

  assert.deepEqual(reversedResult[0].components, result[0].components);
  assert.equal(formatConnectivityFailures(reversedResult), expectedFailure);
});

test("connectivity accepts a valid chain without requiring a clique", () => {
  const result = analyzeSeriesConnectivity(
    [{
      id: "S98",
      title: "chain fixture",
      minimumCommonConcept: "fixture only",
      members: ["alpha", "beta", "gamma"],
      validConnectors: ["first-connector", "second-connector"],
    }],
    new Map([
      ["alpha", ["first-connector"]],
      ["beta", ["first-connector", "second-connector"]],
      ["gamma", ["second-connector"]],
    ]),
  );

  assert.equal(result[0].connected, true);
  assert.deepEqual(result[0].components, [["alpha", "beta", "gamma"]]);
  assert.equal(result[0].edges.length, 2);
});

test("all 13 expected series are connected in the current 41-article corpus", () => {
  const corpusTags = readCorpusTags();
  const articleSlugs = [...corpusTags.keys()].sort((left, right) => left.localeCompare(right));
  const requiredMembers = new Set(expectedSeries.flatMap((series) => series.members));
  const unassignedSlugs = articleSlugs.filter((slug) => !requiredMembers.has(slug));
  const results = analyzeSeriesConnectivity(expectedSeries, corpusTags);
  const failures = formatConnectivityFailures(results);

  assert.equal(articleSlugs.length, 41);
  assert.deepEqual(unassignedSlugs, [...intentionalIslandSlugs]);
  assert.equal(results.length, 13);
  assert.equal(results.filter((result) => result.connected).length, 13, failures);
  assert.deepEqual(
    intentionalIslandSlugs,
    ["ai-report-two-lies", "matt-philosophy"],
  );
  for (const island of intentionalIslandSlugs) {
    assert.equal(corpusTags.has(island), true, island);
    assert.equal(requiredMembers.has(island), false, island);
  }
});
