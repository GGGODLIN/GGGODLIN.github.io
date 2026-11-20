export const MAX_PINNED_MODELS = 3;

export interface CompareModelRecord {
  id: string;
  tableId: string;
  tableHeading: string;
  tierLabel: string;
  name: string;
  note?: string;
  metrics: ReadonlyArray<{
    key: string;
    label: string;
    value: string;
    sub?: string;
  }>;
}

export interface CompareRow {
  key: string;
  label: string;
  shared: boolean;
  values: Array<{ value: string; sub?: string }>;
}

export function togglePinnedModel(
  pinnedIds: ReadonlyArray<string>,
  targetId: string,
  maxCount = MAX_PINNED_MODELS,
): string[] {
  if (pinnedIds.includes(targetId)) {
    return pinnedIds.filter((id) => id !== targetId);
  }
  if (pinnedIds.length >= maxCount) {
    return [...pinnedIds];
  }
  return [...pinnedIds, targetId];
}

export function buildComparisonRows(
  models: ReadonlyArray<CompareModelRecord>,
): CompareRow[] {
  if (models.length === 0) return [];
  const tableIds = new Set(models.map((model) => model.tableId));
  const isCrossTable = tableIds.size > 1;

  const keyMeta = new Map<string, { label: string; count: number }>();
  for (const model of models) {
    for (const metric of model.metrics) {
      const existing = keyMeta.get(metric.key);
      if (existing) {
        existing.count += 1;
      } else {
        keyMeta.set(metric.key, { label: metric.label, count: 1 });
      }
    }
  }

  const orderedKeys = [...keyMeta.keys()];
  if (isCrossTable) {
    const priority = ["realPr", "summary"];
    orderedKeys.sort((a, b) => {
      const pa = priority.indexOf(a);
      const pb = priority.indexOf(b);
      if (pa !== -1 || pb !== -1) {
        if (pa === -1) return 1;
        if (pb === -1) return -1;
        return pa - pb;
      }
      return 0;
    });
  }

  return orderedKeys.map((key) => {
    const meta = keyMeta.get(key)!;
    const shared = meta.count === models.length;
    return {
      key,
      label: meta.label,
      shared,
      values: models.map((model) => {
        const found = model.metrics.find((metric) => metric.key === key);
        return found
          ? { value: found.value, sub: found.sub }
          : { value: "—（不同考卷）" };
      }),
    };
  });
}
