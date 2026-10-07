/**
 * Partial, original quality-roll fixture model. Source-backed ranges/structure
 * are separate from authored weights and stat projection. See the evidence and
 * unresolved scaling/distribution limitations in docs/EQUIPMENT-GENERATION.md.
 */
export const QUALITY_ROLL_RANGES = Object.freeze(Object.fromEntries([
  ['Crude', 0, 40], ['Fair', 30, 70], ['Average', 60, 100],
  ['Superior', 90, 130], ['Exquisite', 120, 160], ['Magnificent', 150, 180],
  ['Legendary', 170, 200], ['Peerless', 200, 200],
].map(([quality, min, max]) => [quality, Object.freeze([min, max])])));

export const GENERATION_POLICY = Object.freeze({
  model: 'quality-roll-fixture-v1',
  distribution: 'authored-50-35-15',
  qualityWeights: Object.freeze({ Average: 50, Superior: 35, Exquisite: 15 }),
  statOrder: Object.freeze(['attack', 'magic', 'defense']),
  templateDistribution: 'authored-uniform',
  statDistribution: 'candidate-discrete-uniform-inclusive',
  independence: 'unverified',
  projection: 'authored-anchor-projection; not verified HV scaling',
  evidence: 'docs/EQUIPMENT-GENERATION.md',
});

const TEMPLATE_KEYS = Object.freeze([
  'id', 'name', 'slot', 'quality', 'attack', 'magic', 'defense', 'burden',
  'description', 'templateId', 'origin', 'container', 'pinned', 'protected',
  'category', 'level', 'hands', 'locked', 'bound', 'iwLevel', 'forgeLevel',
]);
const ITEM_KEYS = Object.freeze([...TEMPLATE_KEYS, 'generation']);
const GENERATION_KEYS = Object.freeze(['model', 'rolls', 'meanRoll', 'distribution']);
const MUTABLE_OR_GENERATED = new Set([
  'id', 'templateId', 'origin', 'quality', 'attack', 'magic', 'defense', 'burden',
  'level', 'container', 'pinned', 'protected', 'locked', 'bound',
]);
const MAX_ANCHOR = Math.floor(Number.MAX_SAFE_INTEGER / 2);

function plainData(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Reflect.ownKeys(value).every((key) => {
    if (typeof key !== 'string' || ['__proto__', 'constructor', 'prototype'].includes(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor.enumerable && Object.hasOwn(descriptor, 'value');
  });
}
function exactKeys(value, keys) {
  return plainData(value) && Reflect.ownKeys(value).length === keys.length
    && keys.every((key) => Object.hasOwn(value, key));
}
function levelValid(level) { return Number.isSafeInteger(level) && level >= 1 && level <= 500; }
function safeText(value) { return typeof value === 'string' && value.length > 0 && value.length <= 2000; }
function templateValid(base) {
  return exactKeys(base, TEMPLATE_KEYS)
    && typeof base.id === 'string' && /^[a-z0-9][a-z0-9-]{0,199}$/.test(base.id)
    && base.templateId === base.id && base.origin === 'starter-fixture'
    && safeText(base.name) && safeText(base.description)
    && ['weapon', 'body', 'offhand'].includes(base.slot)
    && Object.hasOwn(QUALITY_ROLL_RANGES, base.quality)
    && [...GENERATION_POLICY.statOrder, 'burden'].every((key) => Number.isSafeInteger(base[key]) && base[key] >= 0 && base[key] <= MAX_ANCHOR)
    && GENERATION_POLICY.statOrder.some((key) => base[key] > 0)
    && ['inventory', 'storage'].includes(base.container)
    && ['pinned', 'protected', 'locked', 'bound'].every((key) => typeof base[key] === 'boolean')
    && !(base.protected && base.locked)
    && ['one-handed', 'staff', 'shield', 'cloth', 'light', 'heavy'].includes(base.category)
    && [0, 1, 2].includes(base.hands)
    && (base.level === null || levelValid(base.level))
    && ['iwLevel', 'forgeLevel'].every((key) => Number.isSafeInteger(base[key]) && base[key] >= 0);
}
function validTemplates(templates) {
  if (!Array.isArray(templates) || templates.length < 1 || templates.length > 1000) return false;
  const ids = new Set();
  // Reject sparse arrays and getters before reading their values.
  for (let i = 0; i < templates.length; i++) {
    const descriptor = Object.getOwnPropertyDescriptor(templates, String(i));
    if (!descriptor || !Object.hasOwn(descriptor, 'value') || !templateValid(descriptor.value)) return false;
    if (ids.has(descriptor.value.id)) return false;
    ids.add(descriptor.value.id);
  }
  return true;
}
function rewardIdValid(id) { return typeof id === 'string' && id.length <= 200 && /^reward-arena-[1-9]\d*$/.test(id); }
function draw(rng) {
  const result = rng();
  if (typeof result !== 'number' || !Number.isFinite(result) || result < 0 || result >= 1) {
    throw new RangeError('Equipment RNG must return a finite number in [0, 1)');
  }
  return result;
}
function project(base, rolls, meanRoll) {
  const stats = {};
  for (const key of GENERATION_POLICY.statOrder) {
    stats[key] = base[key] === 0 ? 0 : Math.round(base[key] * (0.5 + rolls[key] / 200));
  }
  stats.burden = Math.round(base.burden * (1.5 - meanRoll / 200));
  return stats;
}

/**
 * Does not mutate templates. RNG order: quality, template, positive attack,
 * positive magic, positive defense. Invalid static inputs fail before any draw.
 * Caller owns RNG rollback if its RNG throws or violates the [0, 1) contract.
 */
export function generateEquipment(options) {
  if (!exactKeys(options, ['templates', 'id', 'level', 'rng'])
    || !validTemplates(options.templates) || !rewardIdValid(options.id)
    || !levelValid(options.level) || typeof options.rng !== 'function') {
    throw new TypeError('Invalid equipment generation inputs');
  }
  const { templates, id, level, rng } = options;
  const qualityDraw = draw(rng);
  const quality = qualityDraw < 0.5 ? 'Average' : qualityDraw < 0.85 ? 'Superior' : 'Exquisite';
  const base = templates[Math.floor(draw(rng) * templates.length)];
  const [min, max] = QUALITY_ROLL_RANGES[quality];
  const rolls = {};
  for (const key of GENERATION_POLICY.statOrder) {
    if (base[key] > 0) rolls[key] = min + Math.floor(draw(rng) * (max - min + 1));
  }
  const values = Object.values(rolls);
  const meanRoll = values.reduce((sum, value) => sum + value, 0) / values.length;
  return {
    ...base, ...project(base, rolls, meanRoll), id, templateId: base.id,
    origin: 'quality-roll-fixture', quality, level: quality === 'Exquisite' ? level : null,
    container: 'inventory', pinned: false, protected: false, locked: false,
    generation: { model: GENERATION_POLICY.model, rolls, meanRoll, distribution: GENERATION_POLICY.distribution },
  };
}

/**
 * Validate only this model, never upgrade/reinterpret legacy fixture origins.
 * Container/protection values and equip-level eligibility belong to the engine.
 * Low-quality gear may have its level assigned later by first equip.
 */
export function validateGeneratedEquipment(item, templates, {allowBound=false}={}) {
  try {
    if (typeof allowBound!=='boolean'||!allowBound&&item?.bound)return false;
    if (!exactKeys(item, ITEM_KEYS) || !validTemplates(templates)
      || typeof item.bound!=='boolean' || item.origin !== 'quality-roll-fixture' || !rewardIdValid(item.id)
      || !Object.hasOwn(GENERATION_POLICY.qualityWeights, item.quality)) return false;
    const base = templates.find((entry) => entry.id === item.templateId);
    if (!base || TEMPLATE_KEYS.some((key) => !MUTABLE_OR_GENERATED.has(key) && item[key] !== base[key])) return false;
    if (!(levelValid(item.level) || item.level === null && item.quality !== 'Exquisite')) return false;
    const metadata = item.generation;
    if (!exactKeys(metadata, GENERATION_KEYS) || metadata.model !== GENERATION_POLICY.model
      || metadata.distribution !== GENERATION_POLICY.distribution) return false;
    const keys = GENERATION_POLICY.statOrder.filter((key) => base[key] > 0);
    if (!exactKeys(metadata.rolls, keys)) return false;
    const [min, max] = QUALITY_ROLL_RANGES[item.quality];
    if (!keys.every((key) => Number.isSafeInteger(metadata.rolls[key]) && metadata.rolls[key] >= min && metadata.rolls[key] <= max)) return false;
    const mean = keys.reduce((sum, key) => sum + metadata.rolls[key], 0) / keys.length;
    if (metadata.meanRoll !== mean) return false;
    const stats = project(base, metadata.rolls, mean);
    return Object.keys(stats).every((key) => item[key] === stats[key]);
  } catch {
    return false;
  }
}

/** Display summary only; save acceptance always requires the full validator. */
export function summarizeRolls(item) {
  if (!plainData(item) || !exactKeys(item.generation, GENERATION_KEYS)
    || !plainData(item.generation.rolls) || !Number.isFinite(item.generation.meanRoll)) return '';
  const labels = { attack: '物攻', magic: '魔攻', defense: '防禦' };
  const entries = GENERATION_POLICY.statOrder.filter((key) => Object.hasOwn(item.generation.rolls, key));
  if (entries.length === 0 || !exactKeys(item.generation.rolls, entries)
    || !entries.every((key) => Number.isSafeInteger(item.generation.rolls[key]))) return '';
  return `${entries.map((key) => `${labels[key]} ${item.generation.rolls[key]}`).join(' · ')} · 平均 ${Number(item.generation.meanRoll.toFixed(2))}`;
}
