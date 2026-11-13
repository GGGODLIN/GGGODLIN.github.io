import {
  expectedSeries,
  forbiddenSeriesConnectorTags,
  intentionalIslandSlugs,
  type ExpectedSeriesDefinition,
} from "../../src/data/series-catalog.ts";

export {
  expectedSeries,
  forbiddenSeriesConnectorTags,
  intentionalIslandSlugs,
  type ExpectedSeriesDefinition,
};

export interface SeriesConnectivityEdge {
  readonly source: string;
  readonly target: string;
  readonly connectors: readonly string[];
}

export interface SeriesConnectivityResult extends ExpectedSeriesDefinition {
  readonly connected: boolean;
  readonly components: readonly (readonly string[])[];
  readonly edges: readonly SeriesConnectivityEdge[];
}

function getComponents(
  members: readonly string[],
  edges: readonly SeriesConnectivityEdge[],
): readonly (readonly string[])[] {
  const neighbors = new Map(members.map((member) => [member, new Set<string>()]));

  for (const edge of edges) {
    neighbors.get(edge.source)?.add(edge.target);
    neighbors.get(edge.target)?.add(edge.source);
  }

  const remaining = new Set(members);
  const components: string[][] = [];

  while (remaining.size > 0) {
    const start = [...remaining].sort((left, right) => left.localeCompare(right))[0];
    const queue = [start];
    const component: string[] = [];
    remaining.delete(start);

    while (queue.length > 0) {
      const member = queue.shift();
      if (member === undefined) continue;
      component.push(member);
      const nextMembers = [...(neighbors.get(member) ?? [])]
        .filter((neighbor) => remaining.has(neighbor))
        .sort((left, right) => left.localeCompare(right));
      for (const neighbor of nextMembers) {
        remaining.delete(neighbor);
        queue.push(neighbor);
      }
    }

    components.push(component.sort((left, right) => left.localeCompare(right)));
  }

  return components;
}

export function validateSeriesConnectors(
  definitions: readonly ExpectedSeriesDefinition[],
  validateConnector: (connector: string) => unknown,
): void {
  const forbiddenConnectors = new Set<string>(forbiddenSeriesConnectorTags);
  for (const definition of definitions) {
    for (const connector of definition.validConnectors) {
      if (forbiddenConnectors.has(connector)) {
        throw new Error(`Forbidden series connector "${connector}" in ${definition.id}`);
      }
      validateConnector(connector);
    }
  }
}

export function analyzeSeriesConnectivity(
  definitions: readonly ExpectedSeriesDefinition[],
  tagsBySlug: ReadonlyMap<string, readonly string[]>,
): readonly SeriesConnectivityResult[] {
  return definitions.map((definition) => {
    const missingMembers = definition.members.filter((member) => !tagsBySlug.has(member));
    if (missingMembers.length > 0) {
      throw new Error(`${definition.id} is missing corpus members: ${missingMembers.join(", ")}`);
    }

    const edges: SeriesConnectivityEdge[] = [];
    for (let sourceIndex = 0; sourceIndex < definition.members.length; sourceIndex += 1) {
      for (let targetIndex = sourceIndex + 1; targetIndex < definition.members.length; targetIndex += 1) {
        const source = definition.members[sourceIndex];
        const target = definition.members[targetIndex];
        const sourceTags = new Set(tagsBySlug.get(source) ?? []);
        const targetTags = new Set(tagsBySlug.get(target) ?? []);
        const connectors = definition.validConnectors
          .filter((connector) => sourceTags.has(connector) && targetTags.has(connector))
          .sort((left, right) => left.localeCompare(right));

        if (connectors.length > 0) {
          edges.push({ source, target, connectors });
        }
      }
    }

    const components = getComponents(definition.members, edges);
    return {
      ...definition,
      connected: components.length === 1,
      components,
      edges,
    };
  });
}

export function formatConnectivityFailures(
  results: readonly SeriesConnectivityResult[],
): string {
  return results
    .filter((result) => !result.connected)
    .map((result) => {
      const components = result.components
        .map((component) => `[${component.join(", ")}]`)
        .join(" | ");
      return `${result.id} disconnected: components=${components}; allowlist=[${result.validConnectors.join(", ")}]`;
    })
    .join("\n");
}
