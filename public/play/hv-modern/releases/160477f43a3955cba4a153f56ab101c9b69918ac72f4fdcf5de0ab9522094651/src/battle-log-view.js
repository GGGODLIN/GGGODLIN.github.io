export const LOG_FILTERS = Object.freeze([
  { id: 'all', label: '全部紀事' },
  { id: 'player', label: '自身攻擊' },
  { id: 'enemy', label: '敵方行動' },
  { id: 'recovery', label: '回復' },
  { id: 'status', label: '狀態／資源' },
  { id: 'other', label: '其他紀事' },
].map(filter => Object.freeze(filter)));

// Match the existing event string bounds without reading inherited fields or
// invoking accessors. Classification is only a view over retained log rows.
function ownString(entry, key, max) {
  if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(entry, key);
  if (!descriptor || !Object.hasOwn(descriptor, 'value')) return undefined;
  const value = descriptor.value;
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : undefined;
}

export function classifyLogEntry(entry) {
  switch (ownString(entry, 'type', 40)) {
    case 'attack':
    case 'magic':
    case 'kill':
      return 'player';
    case 'enemy':
      return 'enemy';
    case 'heal':
    case 'regen':
    case 'recovery':
      return 'recovery';
    case 'status':
    case 'resource':
      return 'status';
    case 'miss': {
      const hasActor = Object.hasOwn(entry, 'actor');
      const hasTarget = Object.hasOwn(entry, 'targetId');
      // A malformed or accessor field is still present, so it cannot establish
      // an unambiguous direction alongside the other identity field.
      if (hasTarget && !hasActor && ownString(entry, 'targetId', 200) !== undefined) return 'player';
      if (hasActor && !hasTarget && ownString(entry, 'actor', 200) !== undefined) return 'enemy';
      return 'other';
    }
    default:
      return 'other';
  }
}

/** Return retained rows newest first, preserving every original row and text. */
export function filterLogEntries(log, filter = 'all') {
  if (!Array.isArray(log)) return [];
  const selected = LOG_FILTERS.some(option => option.id === filter) ? filter : 'all';
  const rows = selected === 'all' ? log.slice() : log.filter(entry => classifyLogEntry(entry) === selected);
  return rows.reverse();
}
