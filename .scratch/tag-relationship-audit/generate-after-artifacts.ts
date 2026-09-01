import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalTagRegistry } from "../../src/data/tag-registry.ts";
import { readBlogCorpus } from "../../tests/support/blog-corpus.ts";
import {
  analyzeSeriesConnectivity,
  expectedSeries,
  forbiddenSeriesConnectorTags,
  formatConnectivityFailures,
  intentionalIslandSlugs,
  validateSeriesConnectors,
} from "../../tests/support/series-connectivity-contract.ts";

interface BeforeFinding {
  readonly id: string;
  readonly series_id: string;
  readonly affected_articles: readonly string[];
  readonly expected_relation: string;
  readonly why_broken: string;
  readonly minimal_recommendation: string;
}

interface BeforeMergeCandidate {
  readonly id: string;
  readonly tags: readonly string[];
  readonly decision: string;
  readonly reason: string;
  readonly counterevidence: string;
}

interface BeforeActualEdge {
  readonly source: string;
  readonly target: string;
  readonly tags: readonly string[];
  readonly series: readonly { readonly id: string }[];
}

interface BeforeGraph {
  readonly actual_edges: readonly BeforeActualEdge[];
  readonly findings: readonly BeforeFinding[];
  readonly merge_candidates: readonly BeforeMergeCandidate[];
}

const auditDirectory = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(auditDirectory, "../..");
const articleDirectory = resolve(repoRoot, "src/content/blog");
const defaultJsonPath = resolve(auditDirectory, "relationship-graph-after.json");
const defaultHtmlPath = resolve(auditDirectory, "relationship-graph-after.html");
const genericTags = new Set(forbiddenSeriesConnectorTags);
const repairConnectors = new Map<string, readonly string[]>([
  ["S04", ["deep-research"]],
  ["S07", ["report-vs-reality"]],
  ["S08", ["verify"]],
  ["S09", ["automation"]],
  ["S10", ["review-governance"]],
  ["S11", ["scope-control"]],
  ["S13", ["trial-review"]],
]);
const findingResolutionMembers = new Map([
  ["F01", ["deep-research-rate-limit", "unattended-workflow-resume", "workflow-vs-skill"]],
  ["F02", ["exit-0-illusion", "protocol-model-dependency", "websearch-misses-official-docs"]],
  ["F03", ["checker-layoff", "local-llm-hook-judge"]],
  ["F04", ["model-routing", "steal-determinism-layer", "test-theater"]],
  ["F05", ["model-routing", "one-model-not-enough", "sem-blast-radius", "spec-review-round"]],
  ["F06", ["gpt-review-tunnel-vision", "sol-overimplementation"]],
  ["F07", ["absorb-awesome-list", "bumblebee-still-on-disk", "checker-layoff", "dcg-safety-lock", "local-llm-hook-judge", "prose-exams", "sem-blast-radius", "trial-review-system"]],
] as const);

function parseArguments(values: readonly string[]): { jsonPath: string; htmlPath: string } {
  let jsonPath = defaultJsonPath;
  let htmlPath = defaultHtmlPath;

  for (let index = 0; index < values.length; index += 1) {
    const name = values[index];
    const value = values[index + 1];
    if ((name === "--json" || name === "--html") && value !== undefined) {
      if (name === "--json") jsonPath = resolve(value);
      if (name === "--html") htmlPath = resolve(value);
      index += 1;
      continue;
    }
    throw new Error(`Unknown or incomplete argument: ${name}`);
  }

  return { jsonPath, htmlPath };
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function sharedTags(
  sourceTags: readonly string[],
  targetTags: readonly string[],
): readonly string[] {
  const target = new Set(targetTags);
  return sourceTags
    .filter((tag) => target.has(tag))
    .sort((left, right) => left.localeCompare(right));
}

function edgeKey(seriesId: string, source: string, target: string): string {
  const [left, right] = [source, target].sort((first, second) => first.localeCompare(second));
  return `${seriesId}:${left}--${right}`;
}

function buildAfterGraph(): Record<string, unknown> {
  const articles = readBlogCorpus(articleDirectory);
  for (const article of articles) {
    for (const tag of article.tags) {
      canonicalTagRegistry.validateCanonicalId(tag);
    }
  }
  validateSeriesConnectors(
    expectedSeries,
    (connector) => canonicalTagRegistry.validateCanonicalId(connector),
  );

  const articleBySlug = new Map(articles.map((article) => [article.slug, article]));
  const tagsBySlug = new Map(articles.map((article) => [article.slug, article.tags]));
  const connectivity = analyzeSeriesConnectivity(expectedSeries, tagsBySlug);
  const failureMessage = formatConnectivityFailures(connectivity);
  assert.equal(failureMessage, "", failureMessage);

  const beforeSource = readFileSync(resolve(auditDirectory, "relationship-graph.json"), "utf8");
  const beforeGraph = JSON.parse(beforeSource) as BeforeGraph;
  const beforeTagsByEdge = new Map<string, ReadonlySet<string>>();
  for (const edge of beforeGraph.actual_edges) {
    for (const seriesAssessment of edge.series) {
      beforeTagsByEdge.set(
        edgeKey(seriesAssessment.id, edge.source, edge.target),
        new Set(edge.tags),
      );
    }
  }

  const series = connectivity.map((result) => {
    const validConnectorsByPair = new Map(
      result.edges.map((edge) => [
        edgeKey(result.id, edge.source, edge.target),
        edge.connectors,
      ]),
    );
    const edges = [];
    for (let sourceIndex = 0; sourceIndex < result.members.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < result.members.length; targetIndex += 1) {
        const source = result.members[sourceIndex];
        const target = result.members[targetIndex];
        const shared = sharedTags(
          articleBySlug.get(source)?.tags ?? [],
          articleBySlug.get(target)?.tags ?? [],
        );
        if (shared.length === 0) continue;
        const key = edgeKey(result.id, source, target);
        const allowed = validConnectorsByPair.get(key) ?? [];
        const nonGeneric = shared.filter((tag) => !genericTags.has(tag));
        const beforeTags = beforeTagsByEdge.get(key) ?? new Set<string>();
        const beforeWasValid = result.validConnectors.some((tag) => beforeTags.has(tag));
        const repaired = !beforeWasValid && allowed.some((tag) =>
          repairConnectors.get(result.id)?.includes(tag) ?? false
        );
        const layer = allowed.length > 0
          ? repaired ? "repaired" : "valid"
          : nonGeneric.length > 0 ? "weak" : "generic-only";
        edges.push({
          id: key,
          source,
          target,
          shared_tags: shared,
          allowed_connectors: allowed,
          layer,
        });
      }
    }

    const layerCounts = Object.fromEntries(
      ["repaired", "valid", "weak", "generic-only"].map((layer) => [
        layer,
        edges.filter((edge) => edge.layer === layer).length,
      ]),
    );

    return {
      id: result.id,
      title: result.title,
      minimum_common_concept: result.minimumCommonConcept,
      members: result.members,
      valid_connector_allowlist: result.validConnectors,
      components: result.components,
      connected: result.connected,
      status: result.connected ? "healthy" : "disconnected",
      valid_edges: result.edges.map((edge) => ({
        id: edgeKey(result.id, edge.source, edge.target),
        source: edge.source,
        target: edge.target,
        connectors: edge.connectors,
      })),
      edge_layers: layerCounts,
      edges,
    };
  });

  const edgeLayerById = new Map(
    series.flatMap((item) => item.edges.map((edge) => [edge.id, edge.layer] as const)),
  );
  assert.equal(
    edgeLayerById.get(edgeKey("S08", "exit-0-illusion", "hook-watchdog")),
    "valid",
  );
  assert.equal(
    edgeLayerById.get(edgeKey("S09", "hook-watchdog", "rule-ladder")),
    "valid",
  );

  const memberships = new Map<string, string[]>();
  for (const definition of expectedSeries) {
    for (const member of definition.members) {
      const current = memberships.get(member) ?? [];
      memberships.set(member, [...current, definition.id]);
    }
  }

  const unassignedSlugs = articles
    .map((article) => article.slug)
    .filter((slug) => !memberships.has(slug));
  assert.deepEqual(unassignedSlugs, [...intentionalIslandSlugs]);

  const nodes = articles.map((article) => {
    const seriesIds = memberships.get(article.slug) ?? [];
    return {
      slug: article.slug,
      title: article.title,
      tags: article.tags,
      tag_labels: article.tags.map((tag) => canonicalTagRegistry.getLabel(tag)),
      status: seriesIds.length === 0 ? "intentional-island" : "series-member",
      series_ids: seriesIds,
    };
  });
  const beforeFindings = beforeGraph.findings.map((finding) => {
    const connectors = repairConnectors.get(finding.series_id) ?? [];
    const resolutionMembers = findingResolutionMembers.get(finding.id);
    const seriesResult = series.find((item) => item.id === finding.series_id);
    assert.ok(resolutionMembers, `Missing resolution members for ${finding.id}`);
    assert.ok(seriesResult, `Missing series result for ${finding.series_id}`);
    const connectorsApplied = resolutionMembers.every((slug) =>
      connectors.every((connector) => articleBySlug.get(slug)?.tags.includes(connector) ?? false)
    );
    const resolved = seriesResult.connected && connectorsApplied;

    return {
      id: finding.id,
      series_id: finding.series_id,
      before_verdict: "disconnected",
      after_verdict: resolved ? "resolved" : "unresolved",
      affected_articles: finding.affected_articles,
      expected_relation: finding.expected_relation,
      before_reason: finding.why_broken,
      before_recommendation: finding.minimal_recommendation,
      resolution_connectors: connectors,
      resolution_members: resolutionMembers,
    };
  });

  const registryIds = canonicalTagRegistry.entries.map((entry) => entry.id);
  const usedTags = [...new Set(articles.flatMap((article) => article.tags))]
    .sort((left, right) => left.localeCompare(right));
  const unknownTags = usedTags.filter((tag) => !registryIds.includes(tag));
  const unusedRegistryIds = registryIds.filter((tag) => !usedTags.includes(tag));
  const articleSources = articles
    .map((article) => `${article.fileName}\n${article.source}`)
    .join("\n");
  const disconnectedFindings = series
    .filter((item) => !item.connected)
    .map((item) => ({
      series_id: item.id,
      components: item.components,
      allowlist: item.valid_connector_allowlist,
    }));

  const graph = {
    schema_version: 1,
    audit_state: "after",
    nodes,
    series,
    disconnected_findings: disconnectedFindings,
    before_findings: beforeFindings,
    merge_candidates: beforeGraph.merge_candidates,
    intentional_islands: [
      {
        slug: "ai-report-two-lies",
        verdict: "保留為合理孤島；目前沒有其他文章處理同一套查詢、資料列與儲存格追溯鏈。",
        reconsider_when: "未來文章直接承接查詢登錄、事實目錄或敘事數字 gate。",
      },
      {
        slug: "matt-philosophy",
        verdict: "保留為合理孤島；外部作者立場重建與九軸對照目前只有一篇。",
        reconsider_when: "未來用相同九軸方法對照另一位作者或方法論。",
      },
    ],
    metrics: {
      nodes: nodes.length,
      tag_assignments: articles.reduce((total, article) => total + article.tags.length, 0),
      used_tags: usedTags.length,
      registry_tags: registryIds.length,
      unknown_tags: unknownTags.length,
      unused_registry_ids: unusedRegistryIds.length,
      series: series.length,
      series_memberships: expectedSeries.reduce((total, item) => total + item.members.length, 0),
      healthy_series: series.filter((item) => item.connected).length,
      disconnected_series: series.filter((item) => !item.connected).length,
      disconnected_findings: disconnectedFindings.length,
      before_findings: beforeFindings.length,
      resolved_before_findings: beforeFindings.filter((finding) => finding.after_verdict === "resolved").length,
      merge_candidates: beforeGraph.merge_candidates.length,
      intentional_islands: intentionalIslandSlugs.length,
    },
    coverage: {
      article_slugs: articles.map((article) => article.slug),
      series_ids: expectedSeries.map((item) => item.id),
      intentional_island_slugs: intentionalIslandSlugs,
      generic_tags_forbidden_from_allowlists: forbiddenSeriesConnectorTags,
      unknown_tags: unknownTags,
      unused_registry_ids: unusedRegistryIds,
    },
    source_receipts: {
      corpus_sha256: sha256(articleSources),
      registry_sha256: sha256(readFileSync(resolve(repoRoot, "src/data/tag-registry.ts"), "utf8")),
      expected_series_contract_sha256: sha256(readFileSync(resolve(repoRoot, "tests/support/series-connectivity-contract.ts"), "utf8")),
      before_relationship_graph_sha256: sha256(beforeSource),
    },
  };

  assert.deepEqual(graph.metrics, {
    nodes: 40,
    tag_assignments: 188,
    used_tags: 58,
    registry_tags: 58,
    unknown_tags: 0,
    unused_registry_ids: 0,
    series: 13,
    series_memberships: 60,
    healthy_series: 13,
    disconnected_series: 0,
    disconnected_findings: 0,
    before_findings: 7,
    resolved_before_findings: 7,
    merge_candidates: 6,
    intentional_islands: 2,
  });

  return graph;
}

function escapeEmbeddedJson(value: string): string {
  return value.replaceAll("<", "\\u003c");
}

function buildHtml(graph: Record<string, unknown>): string {
  const embeddedGraph = escapeEmbeddedJson(JSON.stringify(graph));
  return `<!doctype html>
<html lang="zh-Hant" data-theme="light">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <meta name="description" content="40 篇文章、13 個預期系列與修正前後 finding 的本地 tag 關係 audit。">
  <link rel="icon" href="data:,">
  <title>文章 tag 關係圖 audit — after</title>
  <style>
    :root {
      --page: #f3eee4;
      --surface: #fffaf0;
      --surface-strong: #fffdf8;
      --surface-soft: #eee5d6;
      --ink: #2b2925;
      --ink-soft: #625e56;
      --ink-muted: #817a70;
      --border: #d8ccbb;
      --shadow: 0 18px 50px rgba(74, 58, 38, 0.10);
      --valid: #2a78d6;
      --healthy: #0ca30c;
      --success-text: #006300;
      --weak: #fab219;
      --generic: #78736c;
      --focus: #1d65bb;
      --tooltip: #25231f;
      --tooltip-ink: #fffaf0;
      --table-stripe: #faf4e9;
      --selected: #e6f0fb;
    }
    html[data-theme="dark"] {
      --page: #1d1b18;
      --surface: #292620;
      --surface-strong: #322e27;
      --surface-soft: #3a352d;
      --ink: #f5eee2;
      --ink-soft: #d5ccbd;
      --ink-muted: #ada496;
      --border: #50493e;
      --shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
      --valid: #3987e5;
      --healthy: #0ca30c;
      --success-text: #0ca30c;
      --weak: #fab219;
      --generic: #b8b0a4;
      --focus: #8bc2ff;
      --tooltip: #f5eee2;
      --tooltip-ink: #25231f;
      --table-stripe: #2e2a24;
      --selected: #243c55;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--page);
      color: var(--ink);
      font-family: ui-serif, "Iowan Old Style", "Noto Serif TC", "PingFang TC", serif;
      line-height: 1.6;
    }
    button, input, select { font: inherit; }
    .skip-link {
      position: fixed;
      z-index: 100;
      top: 0.5rem;
      left: 0.5rem;
      padding: 0.6rem 0.9rem;
      transform: translateY(-160%);
      background: var(--tooltip);
      color: var(--tooltip-ink);
      border-radius: 0.5rem;
    }
    .skip-link:focus { transform: translateY(0); }
    .page-shell {
      width: min(1220px, calc(100% - 2rem));
      margin: 0 auto;
      padding: 2rem 0 4rem;
    }
    .masthead {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 1rem;
      align-items: start;
      margin-bottom: 1.5rem;
    }
    .eyebrow {
      margin: 0 0 0.35rem;
      color: var(--success-text);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.78rem;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    h1, h2, h3 { line-height: 1.2; text-wrap: balance; }
    h1 {
      margin: 0;
      max-width: 17ch;
      font-size: clamp(2.1rem, 5vw, 4.6rem);
      letter-spacing: -0.045em;
    }
    .lede { max-width: 74ch; margin: 0.8rem 0 0; color: var(--ink-soft); font-size: 1.05rem; }
    .theme-button {
      min-width: 44px;
      min-height: 44px;
      padding: 0.6rem 0.8rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface);
      color: var(--ink);
      cursor: pointer;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 0.75rem;
      margin: 1.5rem 0;
    }
    .kpi, .card, .control-panel {
      border: 1px solid var(--border);
      border-radius: 1rem;
      background: var(--surface);
      box-shadow: var(--shadow);
    }
    .kpi { min-height: 112px; padding: 1rem; }
    .kpi strong {
      display: block;
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: clamp(1.8rem, 4vw, 3rem);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .kpi span {
      display: block;
      margin-top: 0.65rem;
      color: var(--ink-soft);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.85rem;
      font-weight: 700;
    }
    .control-panel {
      display: flex;
      flex-wrap: wrap;
      gap: 0.85rem 1.25rem;
      align-items: end;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .control-group { display: grid; gap: 0.3rem; }
    .control-group > label, .control-label {
      color: var(--ink-soft);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.04em;
    }
    select {
      min-height: 44px;
      max-width: min(560px, 80vw);
      padding: 0.55rem 2.2rem 0.55rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: 0.55rem;
      background: var(--surface-strong);
      color: var(--ink);
    }
    fieldset { display: flex; flex-wrap: wrap; gap: 0.35rem; padding: 0; margin: 0; border: 0; }
    .toggle {
      display: inline-flex;
      gap: 0.4rem;
      align-items: center;
      min-height: 44px;
      padding: 0.45rem 0.65rem;
      border: 1px solid var(--border);
      border-radius: 999px;
      background: var(--surface-strong);
      color: var(--ink-soft);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.82rem;
      cursor: pointer;
    }
    .toggle input { inline-size: 1rem; block-size: 1rem; accent-color: var(--focus); }
    .line-sample { width: 34px; border-top: 2px solid currentColor; }
    .line-repaired { color: var(--healthy); border-top-width: 4px; }
    .line-valid { color: var(--valid); }
    .line-weak { color: var(--weak); border-top-style: dashed; }
    .line-generic { color: var(--generic); border-top-width: 1px; }
    .overview-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.8fr) minmax(280px, 0.8fr);
      gap: 1rem;
      align-items: stretch;
    }
    .network-card { min-width: 0; overflow: hidden; }
    .card-header {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      align-items: start;
      padding: 1.1rem 1.2rem 0;
    }
    .card-header h2, .card-header h3 { margin: 0; }
    .card-header p { margin: 0.35rem 0 0; color: var(--ink-soft); }
    .status-badge {
      display: inline-flex;
      gap: 0.4rem;
      align-items: center;
      flex: none;
      min-height: 32px;
      padding: 0.25rem 0.65rem;
      border: 1px solid var(--healthy);
      border-radius: 999px;
      color: var(--ink);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.78rem;
      font-weight: 800;
    }
    .status-healthy::before, .status-resolved::before, .status-island::before {
      display: inline-block;
      width: 0.55em;
      height: 0.55em;
      margin-right: 0.35em;
      border-radius: 50%;
      content: "";
    }
    .status-healthy::before, .status-resolved::before { background: var(--healthy); }
    .status-island::before { background: var(--generic); }
    .network-scroll { overflow-x: auto; overscroll-behavior-inline: contain; }
    #network { display: block; width: 100%; min-width: 760px; height: 560px; overflow: visible; }
    .edge-visible, .edge-hit { fill: none; vector-effect: non-scaling-stroke; }
    .edge-hit { stroke: transparent; stroke-width: 16; pointer-events: stroke; }
    .edge-visible { stroke-width: 2; }
    .edge-repaired .edge-visible { stroke: var(--healthy); stroke-width: 4; }
    .edge-valid .edge-visible { stroke: var(--valid); }
    .edge-weak .edge-visible { stroke: var(--weak); stroke-dasharray: 5 5; }
    .edge-generic-only .edge-visible { stroke: var(--generic); stroke-width: 1; opacity: 0.72; }
    .edge-group:hover .edge-visible, .edge-group:focus-visible .edge-visible { stroke-width: 5; }
    .node-mark { fill: var(--surface-strong); stroke: var(--healthy); stroke-width: 3; vector-effect: non-scaling-stroke; }
    .node-core { fill: var(--ink); pointer-events: none; }
    .node-group:hover .node-mark, .node-group:focus-visible .node-mark { stroke-width: 5; }
    .leader { stroke: var(--border); stroke-width: 1; vector-effect: non-scaling-stroke; pointer-events: none; }
    .node-label {
      fill: var(--ink);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 12px;
      font-weight: 700;
      pointer-events: none;
    }
    .node-label-bg { fill: var(--surface); opacity: 0.94; stroke: var(--border); stroke-width: 0.75; pointer-events: none; }
    .summary-panel { display: grid; gap: 1rem; align-content: start; padding: 1.2rem; }
    .summary-panel h2, .summary-panel h3 { margin: 0; }
    .summary-panel p { margin: 0; color: var(--ink-soft); }
    .summary-stats { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.5rem; margin: 0; }
    .summary-stats div { padding: 0.7rem; border: 1px solid var(--border); border-radius: 0.7rem; background: var(--surface-strong); }
    .summary-stats dt { color: var(--ink-soft); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.72rem; font-weight: 800; }
    .summary-stats dd { margin: 0.2rem 0 0; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 1.25rem; font-weight: 800; }
    .legend { display: grid; gap: 0.55rem; padding: 0; margin: 0; list-style: none; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.82rem; }
    .legend li { display: grid; grid-template-columns: 48px 1fr; gap: 0.6rem; align-items: center; }
    .tooltip {
      position: fixed;
      z-index: 50;
      width: min(350px, calc(100vw - 2rem));
      padding: 0.75rem 0.85rem;
      border-radius: 0.65rem;
      background: var(--tooltip);
      color: var(--tooltip-ink);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.28);
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 0.82rem;
      line-height: 1.45;
      pointer-events: none;
    }
    .tooltip[hidden] { display: none; }
    .tooltip strong, .tooltip span { display: block; }
    .tooltip span + span { margin-top: 0.3rem; }
    .tables { display: grid; gap: 1rem; margin-top: 1rem; }
    .table-card { overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.85rem; }
    caption { padding: 0.95rem 1.1rem; color: var(--ink-soft); text-align: left; }
    th, td { padding: 0.75rem; border-top: 1px solid var(--border); text-align: left; vertical-align: top; }
    thead th { color: var(--ink-soft); background: var(--surface-soft); font-size: 0.73rem; letter-spacing: 0.03em; text-transform: uppercase; }
    tbody tr:nth-child(even) { background: var(--table-stripe); }
    tbody tr.is-selected { background: var(--selected); box-shadow: inset 4px 0 0 var(--focus); }
    .row-button {
      min-width: 44px;
      min-height: 36px;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      background: var(--surface-strong);
      color: var(--focus);
      font-weight: 800;
      cursor: pointer;
    }
    code { color: var(--ink); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82em; overflow-wrap: anywhere; }
    details.card { overflow: hidden; }
    details > summary { min-height: 52px; padding: 0.9rem 1.1rem; cursor: pointer; font-family: ui-sans-serif, system-ui, sans-serif; font-weight: 800; }
    .data-note { margin: 0.75rem 1.1rem 1rem; color: var(--ink-soft); font-family: ui-sans-serif, system-ui, sans-serif; font-size: 0.78rem; }
    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    :focus-visible { outline: 3px solid var(--focus); outline-offset: 3px; }
    @media (max-width: 900px) {
      .kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .overview-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 560px) {
      .page-shell { width: min(100% - 1rem, 1220px); padding-top: 1rem; }
      .masthead { grid-template-columns: 1fr; }
      .theme-button { justify-self: start; }
      .kpi-grid { grid-template-columns: 1fr 1fr; }
      .kpi:last-child { grid-column: 1 / -1; }
      .control-panel { align-items: stretch; }
      .control-group, .control-group select { width: 100%; max-width: none; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; } }
    @media (forced-colors: active) { .edge-visible, .node-mark, .status-badge { forced-color-adjust: auto; } }
  </style>
</head>
<body>
  <a class="skip-link" href="#main">跳到主要內容</a>
  <div class="page-shell">
    <header class="masthead">
      <div>
        <p class="eyebrow">本地文章 tag 關係檢查 · 修正後</p>
        <h1>13 個預期系列，現在都走得通</h1>
        <p class="lede">本頁根據目前文章標籤、tag 登錄表與獨立系列契約產生。連通只計各系列核准的連接標籤；能沿路徑走遍所有文章就通過，不要求每兩篇直接相連。</p>
      </div>
      <button class="theme-button" id="theme-toggle" type="button" title="切換深色模式" aria-pressed="false">◐ 明暗</button>
    </header>
    <main id="main" tabindex="-1">
      <section aria-labelledby="kpi-title">
        <h2 class="sr-only" id="kpi-title">檢查摘要</h2>
        <div class="kpi-grid" id="kpi-grid"></div>
      </section>
      <form class="control-panel" aria-label="關係圖篩選器">
        <div class="control-group">
          <label for="series-select">系列</label>
          <select id="series-select" name="series"></select>
        </div>
        <div class="control-group">
          <span class="control-label" id="edge-layer-label">連線圖層</span>
          <fieldset aria-labelledby="edge-layer-label">
            <label class="toggle"><input id="layer-repaired" type="checkbox" checked><span class="line-sample line-repaired" aria-hidden="true"></span>修正 connector</label>
            <label class="toggle"><input id="layer-valid" type="checkbox" checked><span class="line-sample line-valid" aria-hidden="true"></span>既有有效連線</label>
            <label class="toggle"><input id="layer-weak" type="checkbox"><span class="line-sample line-weak" aria-hidden="true"></span>交叉維度</label>
            <label class="toggle"><input id="layer-generic" type="checkbox"><span class="line-sample line-generic" aria-hidden="true"></span>僅泛用 tag</label>
          </fieldset>
        </div>
      </form>
      <section class="overview-grid" aria-label="所選系列概覽">
        <article class="card network-card">
          <header class="card-header">
            <div><h2 id="network-title">系列關係圖</h2><p id="network-subtitle"></p></div>
            <span class="status-badge status-healthy" id="series-status">✓ 已連通</span>
          </header>
          <div class="network-scroll">
            <svg id="network" viewBox="0 0 800 560" role="group" aria-labelledby="network-svg-title network-svg-desc">
              <title id="network-svg-title">所選系列的文章關係圖</title>
              <desc id="network-svg-desc">綠色粗線是本次補上的連接標籤，藍色實線是原本已有效的連線，橘色虛線是交叉維度，灰色細線只靠泛用 tag。節點與連線都可用鍵盤聚焦。</desc>
            </svg>
          </div>
        </article>
        <aside class="card summary-panel" aria-labelledby="summary-title">
          <div><h2 id="summary-title">系列摘要</h2><p id="summary-concept"></p></div>
          <dl class="summary-stats" id="summary-stats"></dl>
          <div><h3>核准連接標籤</h3><p><code id="summary-connectors"></code></p></div>
          <div>
            <h3>固定圖例</h3>
            <ul class="legend">
              <li><span class="line-sample line-repaired" aria-hidden="true"></span><span>綠色粗線 — 本次補上的連接標籤</span></li>
              <li><span class="line-sample line-valid" aria-hidden="true"></span><span>藍色實線 — 原本已有效的連線</span></li>
              <li><span class="line-sample line-weak" aria-hidden="true"></span><span>橘色虛線 — 交叉維度</span></li>
              <li><span class="line-sample line-generic" aria-hidden="true"></span><span>灰色細線 — 只靠泛用 tag，不計連通</span></li>
              <li><span class="status-healthy">✓ 已連通</span><span>可沿路徑走遍全部成員</span></li>
              <li><span class="status-island">● 合理孤島</span><span>保留獨立，不是缺陷</span></li>
            </ul>
          </div>
        </aside>
      </section>
      <section class="tables" aria-labelledby="tables-title">
        <h2 id="tables-title">資料表</h2>
        <article class="card table-card">
          <header class="card-header"><div><h3>13 系列成績表</h3><p>每個系列都能只靠核准的連接標籤走成單一連通群。</p></div></header>
          <div class="table-scroll">
            <table>
              <caption>13 個預期系列的成員、核准標籤、連線圖層與修正後判定。</caption>
              <thead><tr><th scope="col">系列</th><th scope="col">狀態</th><th scope="col">成員</th><th scope="col">核准標籤</th><th scope="col">修正連線</th><th scope="col">既有有效</th><th scope="col">交叉維度</th><th scope="col">僅泛用 tag</th><th scope="col">連通群</th><th scope="col">動作</th></tr></thead>
              <tbody id="series-table-body"></tbody>
            </table>
          </div>
        </article>
        <article class="card table-card">
          <header class="card-header"><div><h3>7 個原始 finding 的修正對照</h3><p>保留 F01–F07 的修正前判定與理由；修正後欄只記目前結果，不改寫前態。</p></div></header>
          <div class="table-scroll">
            <table>
              <caption>原始 7 個 finding ID 的修正前後對照。</caption>
              <thead><tr><th scope="col">ID</th><th scope="col">系列</th><th scope="col">修正前</th><th scope="col">修正後</th><th scope="col">原 finding 文章</th><th scope="col">修正驗證文章</th><th scope="col">修正前原因</th><th scope="col">修正 connector</th><th scope="col">動作</th></tr></thead>
              <tbody id="finding-table-body"></tbody>
            </table>
          </div>
        </article>
        <article class="card table-card">
          <header class="card-header"><div><h3>6 個 tag 合併判定</h3><p>沿用修正前檢查的 do-not-merge 判定與反證，不因連通修正而改寫。</p></div></header>
          <div class="table-scroll">
            <table>
              <caption>原始 tag 合併候選與未改寫的判定。</caption>
              <thead><tr><th scope="col">ID</th><th scope="col">Tags</th><th scope="col">判定</th><th scope="col">理由</th><th scope="col">反證</th></tr></thead>
              <tbody id="merge-table-body"></tbody>
            </table>
          </div>
        </article>
        <article class="card table-card">
          <header class="card-header"><div><h3>2 個合理孤島</h3><p>兩篇都在 40 篇文章範圍內，但不列入必須連通的系列成員。</p></div></header>
          <div class="table-scroll">
            <table>
              <caption>合理孤島的保留理由與重審條件。</caption>
              <thead><tr><th scope="col">Slug</th><th scope="col">狀態</th><th scope="col">目前判定</th><th scope="col">何時重審</th></tr></thead>
              <tbody id="island-table-body"></tbody>
            </table>
          </div>
        </article>
        <details class="card" open>
          <summary>所選系列的文章與連線資料表</summary>
          <p class="data-note">文章表列目前標籤；連線表與上方圖層開關同步。圖可用 Tab 聚焦，方向鍵移到前後一個圖形，Home／End 跳到首尾，Escape 關閉提示框。</p>
          <div class="table-scroll">
            <table>
              <caption>所選系列的文章。</caption>
              <thead><tr><th scope="col">文章</th><th scope="col">Slug</th><th scope="col">目前 tags</th><th scope="col">所屬系列</th></tr></thead>
              <tbody id="node-table-body"></tbody>
            </table>
          </div>
          <div class="table-scroll">
            <table>
              <caption>所選系列目前顯示的連線。</caption>
              <thead><tr><th scope="col">連線</th><th scope="col">圖層</th><th scope="col">共同 tags</th><th scope="col">核准連接標籤</th></tr></thead>
              <tbody id="edge-table-body"></tbody>
            </table>
          </div>
        </details>
      </section>
    </main>
  </div>
  <div class="tooltip" id="tooltip" role="tooltip" hidden></div>
  <div class="sr-only" id="live-region" aria-live="polite" aria-atomic="true"></div>
  <script type="application/json" id="graph-data">${embeddedGraph}</script>
  <script>
    const data = JSON.parse(document.getElementById("graph-data").textContent);
    const svgNs = "http://www.w3.org/2000/svg";
    const seriesById = new Map(data.series.map((series) => [series.id, series]));
    const nodeBySlug = new Map(data.nodes.map((node) => [node.slug, node]));
    const state = {
      seriesId: data.series[0].id,
      layers: { repaired: true, valid: true, weak: false, "generic-only": false }
    };
    const layerLabels = {
      repaired: "修正 connector",
      valid: "既有有效連線",
      weak: "交叉維度",
      "generic-only": "僅泛用 tag"
    };
    const controls = {
      series: document.getElementById("series-select"),
      repaired: document.getElementById("layer-repaired"),
      valid: document.getElementById("layer-valid"),
      weak: document.getElementById("layer-weak"),
      generic: document.getElementById("layer-generic")
    };
    const svg = document.getElementById("network");
    const tooltip = document.getElementById("tooltip");
    const liveRegion = document.getElementById("live-region");

    const create = (tag, text, className) => {
      const element = document.createElement(tag);
      if (text !== undefined) element.textContent = String(text);
      if (className) element.className = className;
      return element;
    };

    const createSvg = (tag, attributes) => {
      const element = document.createElementNS(svgNs, tag);
      Object.entries(attributes ?? {}).forEach(([name, value]) => element.setAttribute(name, String(value)));
      return element;
    };

    const appendCell = (row, value, options) => {
      const settings = options ?? {};
      const cell = create(settings.header ? "th" : "td");
      if (settings.header) cell.scope = "row";
      if (settings.code) cell.append(create("code", value));
      else cell.textContent = String(value);
      row.append(cell);
      return cell;
    };

    const positionTooltip = (event) => {
      const margin = 14;
      const rect = tooltip.getBoundingClientRect();
      const requestedX = event && event.clientX !== undefined ? event.clientX : window.innerWidth / 2;
      const requestedY = event && event.clientY !== undefined ? event.clientY : window.innerHeight / 2;
      tooltip.style.left = Math.min(window.innerWidth - rect.width - margin, Math.max(margin, requestedX + 14)) + "px";
      tooltip.style.top = Math.min(window.innerHeight - rect.height - margin, Math.max(margin, requestedY + 14)) + "px";
    };

    const showTooltip = (lines, event) => {
      tooltip.replaceChildren();
      lines.forEach((line, index) => tooltip.append(create(index === 0 ? "strong" : "span", line)));
      tooltip.hidden = false;
      positionTooltip(event);
      liveRegion.textContent = lines.join("。");
    };

    const hideTooltip = () => { tooltip.hidden = true; };

    const bindTooltip = (element, getLines) => {
      element.addEventListener("pointerenter", (event) => showTooltip(getLines(), event));
      element.addEventListener("pointermove", positionTooltip);
      element.addEventListener("pointerleave", hideTooltip);
      element.addEventListener("focus", (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        showTooltip(getLines(), { clientX: rect.right, clientY: rect.top });
      });
      element.addEventListener("blur", hideTooltip);
    };

    const radialLayout = (members) => {
      const sorted = [...members].sort();
      const count = sorted.length;
      const centerX = 400;
      const centerY = 275;
      const radiusX = count <= 4 ? 195 : 240;
      const radiusY = count <= 4 ? 155 : 205;
      return new Map(sorted.map((slug, index) => {
        const angle = -Math.PI / 2 + Math.PI * 2 * index / count;
        return [slug, {
          x: centerX + Math.cos(angle) * radiusX,
          y: centerY + Math.sin(angle) * radiusY,
          angle
        }];
      }));
    };

    const shortSlug = (slug) => slug.length > 23 ? slug.slice(0, 21) + "…" : slug;
    const layerEnabled = (layer) => state.layers[layer];

    const drawEdge = (edge, positions) => {
      const from = positions.get(edge.source);
      const to = positions.get(edge.target);
      const group = createSvg("g", {
        class: "edge-group edge-" + edge.layer,
        tabindex: "0",
        role: "img",
        "aria-label": edge.source + " 到 " + edge.target + "，" + layerLabels[edge.layer]
      });
      const line = { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
      group.append(
        createSvg("line", { ...line, class: "edge-hit" }),
        createSvg("line", { ...line, class: "edge-visible" })
      );
      bindTooltip(group, () => [
        edge.source + " ↔ " + edge.target,
        "圖層：" + layerLabels[edge.layer],
        "共同 tags：" + edge.shared_tags.join(", "),
        "核准連接標籤：" + (edge.allowed_connectors.length > 0 ? edge.allowed_connectors.join(", ") : "無")
      ]);
      return group;
    };

    const drawNode = (slug, positions) => {
      const position = positions.get(slug);
      const node = nodeBySlug.get(slug);
      const group = createSvg("g", {
        class: "node-group",
        transform: "translate(" + position.x + " " + position.y + ")",
        tabindex: "0",
        role: "img",
        "aria-label": node.title + "，slug " + slug
      });
      group.append(
        createSvg("circle", { class: "node-mark", r: 10 }),
        createSvg("circle", { class: "node-core", r: 4 })
      );
      const outwardX = Math.cos(position.angle);
      const outwardY = Math.sin(position.angle);
      const rawX = outwardX * 31;
      const labelY = outwardY * 31;
      const anchor = outwardX > 0.22 ? "start" : outwardX < -0.22 ? "end" : "middle";
      const labelWidth = Math.max(72, shortSlug(slug).length * 7.1 + 12);
      const rawBackgroundX = anchor === "start" ? rawX - 5 : anchor === "end" ? rawX - labelWidth + 5 : rawX - labelWidth / 2;
      const backgroundX = Math.min(792 - position.x - labelWidth, Math.max(8 - position.x, rawBackgroundX));
      const labelX = anchor === "start" ? backgroundX + 5 : anchor === "end" ? backgroundX + labelWidth - 5 : backgroundX + labelWidth / 2;
      group.append(
        createSvg("line", { class: "leader", x1: outwardX * 13, y1: outwardY * 13, x2: labelX, y2: labelY }),
        createSvg("rect", { class: "node-label-bg", x: backgroundX, y: labelY - 11, width: labelWidth, height: 22, rx: 5 })
      );
      const label = createSvg("text", { class: "node-label", x: labelX, y: labelY + 4, "text-anchor": anchor });
      label.textContent = shortSlug(slug);
      group.append(label);
      bindTooltip(group, () => [
        node.title,
        "Slug：" + slug,
        "目前 tags：" + node.tags.join(", "),
        "所屬系列：" + node.series_ids.join(", ")
      ]);
      return group;
    };

    const renderKpis = () => {
      const values = [
        ["文章數", data.metrics.nodes],
        ["系列數", data.metrics.series],
        ["已連通系列", data.metrics.healthy_series],
        ["斷線 findings", data.metrics.disconnected_findings],
        ["合理孤島", data.metrics.intentional_islands]
      ];
      const grid = document.getElementById("kpi-grid");
      values.forEach(([label, value]) => {
        const item = create("article", undefined, "kpi");
        item.append(create("strong", value), create("span", label));
        grid.append(item);
      });
    };

    const renderSeriesOptions = () => {
      data.series.forEach((series) => {
        const option = create("option", series.id + " · " + series.title);
        option.value = series.id;
        controls.series.append(option);
      });
      controls.series.value = state.seriesId;
    };

    const renderSummary = (series) => {
      document.getElementById("network-title").textContent = series.id + " · " + series.title;
      document.getElementById("network-subtitle").textContent = series.members.length + " 篇文章；固定環狀排列，不隨互動漂移。";
      document.getElementById("summary-concept").textContent = series.minimum_common_concept;
      document.getElementById("summary-connectors").textContent = series.valid_connector_allowlist.join(", ");
      const stats = [
        ["成員", series.members.length],
        ["連通群", series.components.length],
        ["修正連線", series.edge_layers.repaired],
        ["既有有效", series.edge_layers.valid],
        ["交叉維度", series.edge_layers.weak],
        ["僅泛用 tag", series.edge_layers["generic-only"]]
      ];
      const list = document.getElementById("summary-stats");
      list.replaceChildren();
      stats.forEach(([label, value]) => {
        const group = create("div");
        group.append(create("dt", label), create("dd", value));
        list.append(group);
      });
    };

    const renderNetwork = (series) => {
      Array.from(svg.children).forEach((child) => {
        if (child.localName !== "title" && child.localName !== "desc") child.remove();
      });
      const positions = radialLayout(series.members);
      const edges = series.edges.filter((edge) => layerEnabled(edge.layer));
      const edgeOrder = { "generic-only": 0, weak: 1, valid: 2, repaired: 3 };
      edges.sort((left, right) => {
        const layerOrder = edgeOrder[left.layer] - edgeOrder[right.layer];
        return layerOrder !== 0 ? layerOrder : left.id.localeCompare(right.id);
      });
      const edgeLayer = createSvg("g", { "aria-label": "連線" });
      edges.forEach((edge) => edgeLayer.append(drawEdge(edge, positions)));
      svg.append(edgeLayer);
      const nodeLayer = createSvg("g", { "aria-label": "文章" });
      [...series.members].sort().forEach((slug) => nodeLayer.append(drawNode(slug, positions)));
      svg.append(nodeLayer);
    };

    const renderSeriesTable = () => {
      const body = document.getElementById("series-table-body");
      body.replaceChildren();
      data.series.forEach((series) => {
        const row = create("tr", undefined, series.id === state.seriesId ? "is-selected" : undefined);
        appendCell(row, series.id + " · " + series.title, { header: true });
        const status = appendCell(row, "");
        status.append(create("span", "✓ 已連通", "status-healthy"));
        appendCell(row, series.members.join(", "), { code: true });
        appendCell(row, series.valid_connector_allowlist.join(", "), { code: true });
        appendCell(row, series.edge_layers.repaired);
        appendCell(row, series.edge_layers.valid);
        appendCell(row, series.edge_layers.weak);
        appendCell(row, series.edge_layers["generic-only"]);
        appendCell(row, series.components.length + "：[" + series.components[0].join(", ") + "]");
        const action = appendCell(row, "");
        const button = create("button", "查看", "row-button");
        button.type = "button";
        button.setAttribute("aria-label", "查看 " + series.id);
        button.addEventListener("click", () => selectSeries(series.id, true));
        action.append(button);
        body.append(row);
      });
    };

    const renderFindingTable = () => {
      const body = document.getElementById("finding-table-body");
      data.before_findings.forEach((finding) => {
        const row = create("tr");
        appendCell(row, finding.id, { header: true });
        appendCell(row, finding.series_id);
        appendCell(row, "✕ 未連通");
        const after = appendCell(row, "");
        const afterResolved = finding.after_verdict === "resolved";
        const afterText = afterResolved ? "✓ 已修正" : "✕ 未修正";
        after.append(create("span", afterText, afterResolved ? "status-resolved" : undefined));
        appendCell(row, finding.affected_articles.join(", "), { code: true });
        appendCell(row, finding.resolution_members.join(", "), { code: true });
        appendCell(row, finding.before_reason);
        appendCell(row, finding.resolution_connectors.join(", "), { code: true });
        const action = appendCell(row, "");
        const button = create("button", "查看", "row-button");
        button.type = "button";
        button.setAttribute("aria-label", "查看 " + finding.id + " 對應的 " + finding.series_id);
        button.addEventListener("click", () => selectSeries(finding.series_id, true));
        action.append(button);
        body.append(row);
      });
    };

    const renderMergeTable = () => {
      const body = document.getElementById("merge-table-body");
      data.merge_candidates.forEach((candidate) => {
        const row = create("tr");
        appendCell(row, candidate.id, { header: true });
        appendCell(row, candidate.tags.join(" ↔ "), { code: true });
        appendCell(row, candidate.decision);
        appendCell(row, candidate.reason);
        appendCell(row, candidate.counterevidence);
        body.append(row);
      });
    };

    const renderIslandTable = () => {
      const body = document.getElementById("island-table-body");
      data.intentional_islands.forEach((island) => {
        const row = create("tr");
        appendCell(row, island.slug, { header: true, code: true });
        const status = appendCell(row, "");
        status.append(create("span", "● 合理孤島", "status-island"));
        appendCell(row, island.verdict);
        appendCell(row, island.reconsider_when);
        body.append(row);
      });
    };

    const renderNodeTable = (series) => {
      const body = document.getElementById("node-table-body");
      body.replaceChildren();
      [...series.members].sort().forEach((slug) => {
        const node = nodeBySlug.get(slug);
        const row = create("tr");
        appendCell(row, node.title, { header: true });
        appendCell(row, node.slug, { code: true });
        appendCell(row, node.tags.join(", "), { code: true });
        appendCell(row, node.series_ids.join(", "));
        body.append(row);
      });
    };

    const renderEdgeTable = (series) => {
      const body = document.getElementById("edge-table-body");
      body.replaceChildren();
      series.edges.filter((edge) => layerEnabled(edge.layer)).forEach((edge) => {
        const row = create("tr");
        appendCell(row, edge.source + " ↔ " + edge.target, { header: true, code: true });
        appendCell(row, layerLabels[edge.layer]);
        appendCell(row, edge.shared_tags.join(", "), { code: true });
        appendCell(row, edge.allowed_connectors.length > 0 ? edge.allowed_connectors.join(", ") : "無", { code: true });
        body.append(row);
      });
    };

    const render = () => {
      const series = seriesById.get(state.seriesId);
      renderSummary(series);
      renderNetwork(series);
      renderSeriesTable();
      renderNodeTable(series);
      renderEdgeTable(series);
      liveRegion.textContent = series.id + "，已連通，" + series.members.length + " 篇文章，1 個連通群。";
    };

    const selectSeries = (seriesId, scrollToGraph) => {
      state.seriesId = seriesId;
      controls.series.value = seriesId;
      render();
      if (scrollToGraph) {
        document.querySelector(".network-card").scrollIntoView({ behavior: "smooth", block: "start" });
        controls.series.focus({ preventScroll: true });
      }
    };

    controls.series.addEventListener("change", () => selectSeries(controls.series.value, false));
    controls.repaired.addEventListener("change", () => { state.layers.repaired = controls.repaired.checked; render(); });
    controls.valid.addEventListener("change", () => { state.layers.valid = controls.valid.checked; render(); });
    controls.weak.addEventListener("change", () => { state.layers.weak = controls.weak.checked; render(); });
    controls.generic.addEventListener("change", () => { state.layers["generic-only"] = controls.generic.checked; render(); });

    svg.addEventListener("keydown", (event) => {
      const targets = [...svg.querySelectorAll("[tabindex='0']")];
      const currentIndex = targets.indexOf(document.activeElement);
      if (currentIndex < 0) return;
      let nextIndex = currentIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % targets.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + targets.length) % targets.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = targets.length - 1;
      if (event.key === "Escape") hideTooltip();
      if (nextIndex !== currentIndex) {
        event.preventDefault();
        targets[nextIndex].focus();
      }
    });

    const themeButton = document.getElementById("theme-toggle");
    themeButton.addEventListener("click", () => {
      const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      themeButton.setAttribute("aria-pressed", String(next === "dark"));
      themeButton.title = next === "dark" ? "切換淺色模式" : "切換深色模式";
      liveRegion.textContent = "已切換為" + (next === "dark" ? "深色" : "淺色") + "模式。";
    });

    renderKpis();
    renderSeriesOptions();
    renderFindingTable();
    renderMergeTable();
    renderIslandTable();
    render();
  </script>
</body>
</html>
`;
}

const { jsonPath, htmlPath } = parseArguments(process.argv.slice(2));
const graph = buildAfterGraph();
const json = `${JSON.stringify(graph, null, 2)}\n`;
const html = buildHtml(graph);
writeFileSync(jsonPath, json);
writeFileSync(htmlPath, html);
process.stdout.write(`AFTER_RELATIONSHIP_AUDIT_PASS json=${jsonPath} html=${htmlPath} nodes=40 series=13 healthy=13 disconnected_findings=0 intentional_islands=2 resolved_before_findings=7 json_sha256=${sha256(json)} html_sha256=${sha256(html)}\n`);
