/**
 * Original, bounded AP ownership and ability-slot candidate.
 * No resources, progression awards, clocks, randomness, or persistence are changed.
 * See docs/ABILITIES.md for sourced values and explicit prototype decisions.
 */
import { validateTrainingState } from './training.js';

export const LEGACY_ABILITY_MODEL = 'early-tanks-candidate-v1';
export const PREVIOUS_ABILITY_MODEL = 'early-cure-candidate-v1';
export const COMPLETE_TANK_ABILITY_MODEL = 'complete-tanks-candidate-v1';
export const PREVIOUS_COMPLETE_CURE_MODEL = 'complete-cure-candidate-v1';
export const PREVIOUS_POTION_ABILITY_MODEL = 'potion-potency-candidate-v1';
export const PREVIOUS_SPIRIT_ABILITY_MODEL = 'spirit-potion-candidate-v1';
export const CONFLAGRATION_ABILITY_MODEL = 'conflagration-candidate-v1';
export const MASTERY_SLOT_MODEL = 'mastery-slots-candidate-v1';

// Each entry prices that numbered slot (slot 1 is index 0); both first fives are free.
const MASTERY_SLOT_COSTS = Object.freeze({
  major: Object.freeze([0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4, 5]),
  supportive: Object.freeze([0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 4]),
});
// Cumulative tables are indexed by the owned count, including a zero-count entry.
const MASTERY_SLOT_TOTALS = Object.freeze(Object.fromEntries(Object.entries(MASTERY_SLOT_COSTS)
  .map(([family, costs]) => [family, Object.freeze(costs.reduce((totals, cost) => {
    totals.push(totals.at(-1) + cost);
    return totals;
  }, [0]))])));

export const MASTERY_SLOT_POLICY = Object.freeze({
  model: MASTERY_SLOT_MODEL, status: 'candidate', minSlots: 5, maxSlots: 20,
  incrementalCosts: MASTERY_SLOT_COSTS, cumulativeCosts: MASTERY_SLOT_TOTALS,
  refundLimitation: 'Slot refunds and full resets are not available in this version.',
});

export const ABILITY_POLICY = Object.freeze({
  id: CONFLAGRATION_ABILITY_MODEL,
  model: MASTERY_SLOT_MODEL,
  legacySpiritModel: PREVIOUS_SPIRIT_ABILITY_MODEL,
  legacyPotionModel: PREVIOUS_POTION_ABILITY_MODEL,
  legacyCompleteCureModel: PREVIOUS_COMPLETE_CURE_MODEL,
  legacyCompleteTankModel: COMPLETE_TANK_ABILITY_MODEL,
  legacyModel: LEGACY_ABILITY_MODEL,
  legacyCureModel: PREVIOUS_ABILITY_MODEL,
  status: 'candidate',
  entitlementMode: 'level-candidate',
  legacyMode: 'legacy-disabled',
  minLevel: 1,
  maxLevel: 500,
  majorSlots: 5,
  supportiveSlots: 5,
  supportedRanks: Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 3,
    betterHealthPots: 5, betterManaPots: 5, betterSpiritPots: 5, conflagration: 3 }),
  freeSingleResetAllowance: 10,
  resetPolicy: 'ten-free-single-resets-candidate-v1',
  levelOneAPStatus: 'inferred-initial-point',
  maximumRounding: 'floor-after-applying-tank-multiplier-candidate',
  source: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
  cureSource: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
  potionSource: 'https://ehwiki.org/wiki/Abilities#General',
  potionScope: 'existing-health-mana-spirit-potion-potency-only',
  conflagrationScope: 'existing-fire-target-cap-ranks-one-through-three-only',
  assignmentSource: 'https://ehwiki.org/index.php?title=Character/Abilities&oldid=64563',
  levelingSource: 'https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211',
});

// Historical table values; applicability and maximum rounding remain candidate rules.
// These are incremental prices: a complete ten-rank Tank costs 36 AP in total.
const TANK_RANK_COSTS = Object.freeze([1, 2, 3, 3, 4, 4, 4, 5, 5, 5]);

function tank(id, name, pool, levelGates) {
  return Object.freeze({
    id, name, pool, slotType: 'major', furtherRanks: 'none',
    ranks: Object.freeze(levelGates.map((minLevel, index) => Object.freeze({
      rank: index + 1, minLevel, cost: TANK_RANK_COSTS[index], bonusPercent: (index + 1) * 10,
    }))),
  });
}

export const TANK_ABILITIES = Object.freeze({
  hpTank: tank('hpTank', 'HP Tank', 'hp', [0, 25, 50, 75, 100, 120, 150, 200, 250, 300]),
  mpTank: tank('mpTank', 'MP Tank', 'mp', [0, 30, 60, 90, 120, 160, 210, 260, 310, 350]),
  spTank: tank('spTank', 'SP Tank', 'sp', [0, 40, 80, 120, 170, 220, 270, 330, 390, 450]),
});

function potion(id, name, pool, levelGates, costs, percentages) {
  return Object.freeze({
    id, name, pool, slotType: 'major', furtherRanks: 'none',
    ranks: Object.freeze(levelGates.map((minLevel, index) => Object.freeze({
      rank: index + 1, minLevel, cost: costs[index], restorationPercent: percentages[index],
    }))),
  });
}

// Current community tables: instant recovery only, not Draught/Elixir ticks.
// No potion cooldown or maximum-resource bonus is part of these rank records.
export const POTION_ABILITIES = Object.freeze({
  betterHealthPots: potion('betterHealthPots', 'Better Health Pots', 'hp',
    [0, 100, 200, 300, 400], [1, 2, 3, 4, 5], [110, 120, 130, 140, 150]),
  betterManaPots: potion('betterManaPots', 'Better Mana Pots', 'mp',
    [0, 80, 140, 220, 380], [2, 3, 5, 7, 9], [55, 60, 65, 70, 75]),
  betterSpiritPots: potion('betterSpiritPots', 'Better Spirit Pots', 'sp',
    [0, 90, 160, 240, 400], [2, 3, 5, 7, 9], [55, 60, 65, 70, 75]),
});

// Source rank effects are preserved in full; only ranks 1–3 are purchasable.
// Rank 2 keeps Fire at four targets and is the sequential prerequisite to rank 3.
// Inferno and Flames of Loki are not implemented by this candidate.
export const CONFLAGRATION_SOURCE_RANKS = Object.freeze([
  [50, 3, 4, null, null],
  [100, 4, 4, 6, null],
  [150, 5, 5, 6, null],
  [200, 6, 5, 6, 8],
  [250, 8, 5, 6, 9],
  [300, 10, 5, 7, 9],
  [400, 12, 5, 7, 10],
].map(([minLevel, cost, fireTargetCap, infernoTargetCap, flamesOfLokiTargetCap], index) => Object.freeze({
  rank: index + 1, minLevel, cost, fireTargetCap, infernoTargetCap, flamesOfLokiTargetCap,
})));

export const CONFLAGRATION_ABILITY = Object.freeze({
  id: 'conflagration', name: 'Conflagration', slotType: 'major', furtherRanks: 'deferred',
  ranks: Object.freeze(CONFLAGRATION_SOURCE_RANKS.slice(0, 3)),
  deferredRanks: Object.freeze(CONFLAGRATION_SOURCE_RANKS.slice(3)),
});

export const ALL_ABILITIES = Object.freeze({
  ...TANK_ABILITIES,
  betterCure: Object.freeze({
    id: 'betterCure', name: 'Better Cure', slotType: 'supportive', furtherRanks: 'none',
    ranks: Object.freeze([
      Object.freeze({ rank: 1, minLevel: 1, cost: 2, potencyPercent: 70, cooldown: 4 }),
      Object.freeze({ rank: 2, minLevel: 35, cost: 3, potencyPercent: 85, cooldown: 3 }),
      Object.freeze({ rank: 3, minLevel: 65, cost: 5, potencyPercent: 100, cooldown: 2 }),
    ]),
  }),
  ...POTION_ABILITIES,
  conflagration: CONFLAGRATION_ABILITY,
});

const TANK_IDS = Object.freeze(Object.keys(TANK_ABILITIES));
const POTION_IDS = Object.freeze(Object.keys(POTION_ABILITIES));
// Historical key sets must never grow with the active registry.
const PRE_POTION_IDS = Object.freeze(['hpTank', 'mpTank', 'spTank', 'betterCure']);
const PRE_SPIRIT_IDS = Object.freeze([
  'hpTank', 'mpTank', 'spTank', 'betterCure', 'betterHealthPots', 'betterManaPots',
]);
const PRE_CONFLAGRATION_IDS = Object.freeze([
  'hpTank', 'mpTank', 'spTank', 'betterCure', 'betterHealthPots', 'betterManaPots', 'betterSpiritPots',
]);
const CONFLAGRATION_IDS = Object.freeze([
  'hpTank', 'mpTank', 'spTank', 'betterCure', 'betterHealthPots', 'betterManaPots', 'betterSpiritPots', 'conflagration',
]);
const CONFLAGRATION_RANK_CAPS = Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 3,
  betterHealthPots: 5, betterManaPots: 5, betterSpiritPots: 5, conflagration: 3 });
// Every historical format owned exactly five per family, independent of current policy.
const HISTORICAL_SLOT_COUNT = 5;
const SPIRIT_RANK_CAPS = Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 3,
  betterHealthPots: 5, betterManaPots: 5, betterSpiritPots: 5 });
const POTION_RANK_CAPS = Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 3,
  betterHealthPots: 5, betterManaPots: 5 });
const COMPLETE_CURE_RANK_CAPS = Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 3 });
const COMPLETE_TANK_RANK_CAPS = Object.freeze({ hpTank: 10, mpTank: 10, spTank: 10, betterCure: 2 });
const IDS = Object.freeze(Object.keys(ALL_ABILITIES));
const SLOT_TYPES = Object.freeze(['major', 'supportive']);
const LEDGER_KEYS = Object.freeze([
  'model', 'entitlementMode', 'purchased', 'majorSlots', 'supportiveSlots', 'freeSingleResetsUsed',
]);
const BATTLE_STATUSES = Object.freeze(['active', 'victory', 'defeat', 'fled']);
const failure = (error, metadata = {}) => ({ ...metadata, ok: false, error });
const validLevel = (level) => Number.isSafeInteger(level)
  && level >= ABILITY_POLICY.minLevel && level <= ABILITY_POLICY.maxLevel;
const validSlot = (index, slots) => Number.isSafeInteger(index)
  && !Object.is(index, -0) && index >= 0 && index < slots.length;

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Inspect only own enumerable data properties; never evaluate input accessors.
function dataField(record, key) {
  if (!isRecord(record)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor?.enumerable && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
}

function exactDataRecord(record, keys) {
  return isRecord(record) && Reflect.ownKeys(record).length === keys.length
    && keys.every((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(record, key);
      return descriptor?.enumerable && Object.hasOwn(descriptor, 'value');
    });
}

function exactSlotArray(slots, count) {
  if (!Array.isArray(slots) || Object.getPrototypeOf(slots) !== Array.prototype
    || slots.length !== count || Reflect.ownKeys(slots).length !== count + 1) return false;
  for (let index = 0; index < count; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(slots, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) return false;
  }
  return true;
}

function currentSlotArray(slots, enabled) {
  return Array.isArray(slots)
    && slots.length >= MASTERY_SLOT_POLICY.minSlots
    && slots.length <= (enabled ? MASTERY_SLOT_POLICY.maxSlots : MASTERY_SLOT_POLICY.minSlots)
    && exactSlotArray(slots, slots.length);
}

function allocatedMastery(abilities) {
  return MASTERY_SLOT_TOTALS.major[abilities.majorSlots.length]
    + MASTERY_SLOT_TOTALS.supportive[abilities.supportiveSlots.length];
}

function spentFor(purchased, ids = IDS) {
  return ids.reduce((sum, id) => sum + ALL_ABILITIES[id].ranks
    .slice(0, purchased[id]).reduce((cost, rank) => cost + rank.cost, 0), 0);
}

function writable(record, key) {
  return Object.getOwnPropertyDescriptor(record, key)?.writable === true;
}

/** Create an empty independent ledger. This does not grant or mutate player EXP. */
export function createAbilityState(enabled = true) {
  if (typeof enabled !== 'boolean') throw new TypeError('能力啟用狀態必須為布林值');
  return {
    model: ABILITY_POLICY.model,
    entitlementMode: enabled ? ABILITY_POLICY.entitlementMode : ABILITY_POLICY.legacyMode,
    purchased: { hpTank: 0, mpTank: 0, spTank: 0, betterCure: 0,
      betterHealthPots: 0, betterManaPots: 0, betterSpiritPots: 0, conflagration: 0 },
    majorSlots: Array(ABILITY_POLICY.majorSlots).fill(null),
    supportiveSlots: Array(ABILITY_POLICY.supportiveSlots).fill(null),
    freeSingleResetsUsed: 0,
  };
}

/** Strict nested-save validation. No repair, coercion, or unrelated subsystem reads. */
function validateLedger(abilities, level, enabled, model, ids, trainedAP = 0, rankCap = Infinity,
  variableSlots = false, trainedMastery = 0) {
  if (typeof enabled !== 'boolean' || !validLevel(level)
    || !Number.isSafeInteger(trainedAP) || Object.is(trainedAP, -0)
    || trainedAP < 0 || trainedAP > 500 || trainedAP > level || (!enabled && trainedAP !== 0)
    || !Number.isSafeInteger(trainedMastery) || Object.is(trainedMastery, -0)
    || trainedMastery < 0 || trainedMastery > 10 || trainedMastery > Math.floor(level / 50)
    || (!enabled && trainedMastery !== 0)
    || !exactDataRecord(abilities, LEDGER_KEYS)
    || abilities.model !== model
    || abilities.entitlementMode !== (enabled ? ABILITY_POLICY.entitlementMode : ABILITY_POLICY.legacyMode)
    || !exactDataRecord(abilities.purchased, ids)
    || !(variableSlots ? currentSlotArray(abilities.majorSlots, enabled)
      : exactSlotArray(abilities.majorSlots, HISTORICAL_SLOT_COUNT))
    || !(variableSlots ? currentSlotArray(abilities.supportiveSlots, enabled)
      : exactSlotArray(abilities.supportiveSlots, HISTORICAL_SLOT_COUNT))
    || abilities.majorSlots === abilities.supportiveSlots) return false;
  if (variableSlots && allocatedMastery(abilities)
    > (enabled ? Math.floor(level / 10) + trainedMastery : 0)) return false;
  if (!Number.isSafeInteger(abilities.freeSingleResetsUsed)
    || Object.is(abilities.freeSingleResetsUsed, -0)
    || abilities.freeSingleResetsUsed < 0
    || abilities.freeSingleResetsUsed > ABILITY_POLICY.freeSingleResetAllowance) return false;
  for (const id of ids) {
    const rank = abilities.purchased[id];
    if (!Number.isSafeInteger(rank) || Object.is(rank, -0) || rank < 0
      || rank > Math.min(typeof rankCap === 'number' ? rankCap : rankCap[id], ALL_ABILITIES[id].ranks.length)
      || (rank > 0 && level < ALL_ABILITIES[id].ranks[rank - 1].minLevel)) return false;
  }
  const spentAP = spentFor(abilities.purchased, ids);
  if (spentAP > (enabled ? level + trainedAP : 0)) return false;
  const assigned = new Set();
  for (const slotType of SLOT_TYPES) {
    for (const id of abilities[`${slotType}Slots`]) {
      if (id === null) continue;
      if (!ids.includes(id) || ALL_ABILITIES[id].slotType !== slotType
        || abilities.purchased[id] === 0 || assigned.has(id)) return false;
      assigned.add(id);
    }
  }
  return enabled || abilities.freeSingleResetsUsed === 0;
}

/** Strict current-format validation; an old model requires explicit migration. */
export function validateAbilityState(abilities, level, enabled = true, trainedAP = 0, trainedMastery = 0) {
  return validateLedger(abilities, level, enabled, ABILITY_POLICY.model, IDS, trainedAP,
    ABILITY_POLICY.supportedRanks, true, trainedMastery);
}

/** Copy a fully validated historical ledger without any purchase or AP grant. */
function migratedAbilityCopy(abilities) {
  return {
    model: ABILITY_POLICY.model,
    entitlementMode: abilities.entitlementMode,
    purchased: Object.fromEntries(IDS.map((id) => [id,
      Object.hasOwn(abilities.purchased, id) ? abilities.purchased[id] : 0])),
    majorSlots: [...abilities.majorSlots],
    supportiveSlots: [...abilities.supportiveSlots],
    freeSingleResetsUsed: abilities.freeSingleResetsUsed,
  };
}

/** Frozen eight-key, five-per-family Conflagration predecessor; no capacity grant. */
export function validateConflagrationAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, CONFLAGRATION_ABILITY_MODEL,
    CONFLAGRATION_IDS, trainedAP, CONFLAGRATION_RANK_CAPS);
}

export function migrateConflagrationAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validateConflagrationAbilityState(abilities, level, enabled, trainedAP)) {
    return failure('前版 Conflagration 能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** Seven-key Spirit predecessor; Conflagration ownership is never accepted. */
export function validateSpiritAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, PREVIOUS_SPIRIT_ABILITY_MODEL,
    PRE_CONFLAGRATION_IDS, trainedAP, SPIRIT_RANK_CAPS);
}

export function migrateSpiritAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validateSpiritAbilityState(abilities, level, enabled, trainedAP)) {
    return failure('前版 Spirit 藥水能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** Six-key Potion predecessor; Spirit ownership is never accepted in this model. */
export function validatePotionAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, PREVIOUS_POTION_ABILITY_MODEL,
    PRE_SPIRIT_IDS, trainedAP, POTION_RANK_CAPS);
}

export function migratePotionAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validatePotionAbilityState(abilities, level, enabled, trainedAP)) {
    return failure('前版藥水能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** Four-key complete Cure predecessor; valid paid training may provide 500 AP. */
export function validateCompleteCureAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, PREVIOUS_COMPLETE_CURE_MODEL,
    PRE_POTION_IDS, trainedAP, COMPLETE_CURE_RANK_CAPS);
}

export function migrateCompleteCureAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validateCompleteCureAbilityState(abilities, level, enabled, trainedAP)) {
    return failure('前版完整 Cure 能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** Full-Tank predecessor still capped Cure at two; migration grants no ranks/AP. */
export function validateCompleteTankAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, COMPLETE_TANK_ABILITY_MODEL,
    PRE_POTION_IDS, trainedAP, COMPLETE_TANK_RANK_CAPS);
}
export function migrateCompleteTankAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validateCompleteTankAbilityState(abilities, level, enabled, trainedAP)) return failure('前版完整 Tank 能力帳本、角色等級或 AP 配置無效');
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** The previous four-key model supported only two ranks of every ability. */
export function validatePreviousAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!Number.isSafeInteger(trainedAP) || trainedAP > 1) return false;
  return validateLedger(abilities, level, enabled, PREVIOUS_ABILITY_MODEL, PRE_POTION_IDS, trainedAP, 2);
}

/** Validate the complete previous ledger; changing its model grants no ranks or AP. */
export function migratePreviousAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  if (!validatePreviousAbilityState(abilities, level, enabled, trainedAP)) {
    return failure('前版能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** The earliest model has exactly three two-rank Tanks and no Supportive abilities. */
export function validateLegacyAbilityState(abilities, level, enabled = true) {
  return validateLedger(abilities, level, enabled, LEGACY_ABILITY_MODEL, TANK_IDS, 0, 2);
}

/** Validate the entire old ledger before returning an independent current copy. */
export function migrateLegacyAbilityState(abilities, level, enabled = true) {
  if (!validateLegacyAbilityState(abilities, level, enabled)) {
    return failure('舊版能力帳本、角色等級或 AP 配置無效');
  }
  return { ok: true, abilities: migratedAbilityCopy(abilities) };
}

/** Minimal reads need no training; supplied training must be a strict current ledger. */
function inspectState(state) {
  const abilities = dataField(state, 'abilities');
  const level = dataField(dataField(state, 'player'), 'level');
  const mode = dataField(abilities, 'entitlementMode');
  const enabled = mode === ABILITY_POLICY.entitlementMode;
  if (!isRecord(state)) return failure('能力帳本、角色等級或 AP 配置無效');
  const trainingDescriptor = Object.getOwnPropertyDescriptor(state, 'training');
  let trainedAP = 0, trainedMastery = 0;
  if (trainingDescriptor) {
    if (!trainingDescriptor.enumerable || !Object.hasOwn(trainingDescriptor, 'value')
      || !validateTrainingState(trainingDescriptor.value)) return failure('Training 帳本無效');
    trainedAP = dataField(trainingDescriptor.value, 'abilityBoostRank');
    trainedMastery = dataField(trainingDescriptor.value, 'manifestDestinyRank');
  }
  if (!validateAbilityState(abilities, level, enabled, trainedAP, trainedMastery)) {
    return failure('能力帳本、角色等級或 AP／Mastery 配置無效');
  }
  const progressionDescriptor = Object.getOwnPropertyDescriptor(state, 'progression');
  if (progressionDescriptor) {
    const kind = dataField(dataField(state, 'progression'), 'kind');
    if (enabled ? kind !== 'experience-ledger' : kind !== 'legacy-fixture') {
      return failure('能力權益與角色成長模型不一致');
    }
  }
  const levelAP = enabled ? level : 0;
  const levelMastery = enabled ? Math.floor(level / 10) : 0;
  return { ok: true, abilities, level, enabled, levelAP, trainedAP, levelMastery, trainedMastery,
    masteryPoints: levelMastery + trainedMastery,
    totalAP: levelAP + trainedAP, spentAP: spentFor(abilities.purchased) };
}

function inspectMutation(state) {
  const inspected = inspectState(state);
  if (!inspected.ok) return inspected;
  if (!inspected.enabled) return failure('舊版角色未啟用能力權益');
  if (dataField(dataField(state, 'progression'), 'kind') !== 'experience-ledger') {
    return failure('能力變更需要 experience-ledger 成長模型');
  }
  const descriptor = Object.getOwnPropertyDescriptor(state, 'battle');
  if (descriptor && (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))) {
    return failure('戰鬥狀態格式錯誤');
  }
  const battle = descriptor?.value;
  if (battle !== undefined && battle !== null) {
    const status = dataField(battle, 'status');
    if (!BATTLE_STATUSES.includes(status)) return failure('戰鬥狀態格式錯誤');
    if (status === 'active') return failure('戰鬥中與波次暫停時不能變更能力');
  }
  return inspected;
}

/** Derive AP and Mastery once from level and completed training, never reward logs. */
export function getAbilitySummary(state) {
  const inspected = inspectState(state);
  if (!inspected.ok) return inspected;
  const { abilities, enabled, levelAP, trainedAP, totalAP, spentAP,
    levelMastery, trainedMastery, masteryPoints } = inspected;
  const allocatedMasteryPoints = allocatedMastery(abilities);
  return {
    ok: true, enabled, levelAP, trainedAP, totalAP, spentAP, unspentAP: totalAP - spentAP,
    levelMastery, trainedMastery, masteryPoints, allocatedMasteryPoints,
    unallocatedMasteryPoints: masteryPoints - allocatedMasteryPoints,
    freeSingleResetsRemaining: enabled ? ABILITY_POLICY.freeSingleResetAllowance - abilities.freeSingleResetsUsed : 0,
  };
}

function quoteMasteryInspected(inspected, family) {
  if (!SLOT_TYPES.includes(family)) return failure('未知能力槽類型');
  const currentCount = inspected.abilities[`${family}Slots`].length;
  const { masteryPoints } = inspected;
  const allocatedMasteryPoints = allocatedMastery(inspected.abilities);
  const unallocatedMasteryPoints = masteryPoints - allocatedMasteryPoints;
  const capped = currentCount === MASTERY_SLOT_POLICY.maxSlots;
  const cost = capped ? null : MASTERY_SLOT_COSTS[family][currentCount];
  const metadata = {
    family, currentCount, nextSlot: capped ? null : currentCount + 1, cost,
    masteryPoints, allocatedMasteryPoints, unallocatedMasteryPoints,
    unallocatedMasteryPointsAfter: capped ? unallocatedMasteryPoints : unallocatedMasteryPoints - cost,
    candidate: true, refundLimitation: MASTERY_SLOT_POLICY.refundLimitation,
  };
  if (capped) return failure('能力槽已達最高容量', { ...metadata, capped: true });
  if (cost > unallocatedMasteryPoints) return failure('未配置 Mastery 不足', metadata);
  return { ok: true, ...metadata };
}

/** Read-only one-slot quote; both families spend the same level and trained budget. */
export function quoteMasterySlotPurchase(state, family) {
  const inspected = inspectMutation(state);
  return inspected.ok ? quoteMasteryInspected(inspected, family) : inspected;
}

/** Append one empty owned slot after validating a detached draft and current quote. */
export function purchaseMasterySlot(state, family, expectedCount) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!SLOT_TYPES.includes(family)) return failure('未知能力槽類型');
  const key = `${family}Slots`;
  const { abilities } = inspected;
  const slots = abilities[key];
  if (!Number.isSafeInteger(expectedCount) || Object.is(expectedCount, -0)
    || expectedCount !== slots.length) return failure('能力槽容量已變更，請重新確認');
  const quote = quoteMasteryInspected(inspected, family);
  if (!quote.ok) return quote;
  if (!writable(state, 'abilities') || !writable(abilities, key)
    || !Object.isExtensible(slots) || !writable(slots, 'length')
    || !slots.every((_, index) => writable(slots, String(index)))) return failure('能力槽持有資料為唯讀');
  const draft = { ...abilities, [key]: [...slots, null] };
  if (!validateAbilityState(draft, inspected.level, inspected.enabled,
    inspected.trainedAP, inspected.trainedMastery)) {
    return failure('能力槽購買後的帳本無效');
  }
  abilities[key] = draft[key];
  return quote;
}

function quoteInspected(inspected, id) {
  if (!IDS.includes(id)) return failure('未知能力');
  const fromRank = inspected.abilities.purchased[id];
  const next = ALL_ABILITIES[id].ranks[fromRank];
  if (!next) return ALL_ABILITIES[id].furtherRanks === 'none'
    ? failure('能力已達最高階級', { id, fromRank, capped: true })
    : failure('後續能力階級尚未實作', { id, fromRank, deferred: true });
  const metadata = {
    id, fromRank, toRank: fromRank + 1, cost: next.cost,
    minLevel: next.minLevel,
    ...(id === 'conflagration' ? { fireTargetCap: next.fireTargetCap }
      : POTION_IDS.includes(id) ? { restorationPercent: next.restorationPercent }
      : TANK_IDS.includes(id) ? { bonusPercent: next.bonusPercent }
        : { potencyPercent: next.potencyPercent, cooldown: next.cooldown }),
  };
  if (inspected.level < next.minLevel) return failure(`此階級需要 Lv.${next.minLevel}`, metadata);
  if (inspected.totalAP - inspected.spentAP < next.cost) return failure('未配置 AP 不足', metadata);
  return { ok: true, ...metadata };
}

/** Informational snapshot; committing recomputes the quote against current state. */
export function quoteAbilityPurchase(state, id) {
  const inspected = inspectMutation(state);
  return inspected.ok ? quoteInspected(inspected, id) : inspected;
}

/** Purchase exactly one successive rank. Ownership alone does not activate it. */
export function purchaseAbilityRank(state, id) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  const quote = quoteInspected(inspected, id);
  if (!quote.ok) return quote;
  if (!writable(inspected.abilities.purchased, id)) return failure('能力持有資料為唯讀');
  inspected.abilities.purchased[id] = quote.toRank;
  return quote;
}

/** Assign to the ability's own slot family. Moving requires an explicit unslot first. */
export function assignAbility(state, id, slotIndex) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!IDS.includes(id)) return failure('未知能力');
  const slotType = ALL_ABILITIES[id].slotType;
  const { abilities } = inspected;
  const slots = abilities[`${slotType}Slots`];
  if (!validSlot(slotIndex, slots)) return failure(`只能使用 0–${slots.length - 1} 的 ${slotType} 槽位`);
  if (abilities.purchased[id] === 0) return failure('請先購買能力階級');
  if (slots.includes(id)) return failure('能力已配置；移動前請先卸下');
  if (slots[slotIndex] !== null) return failure(`目標 ${slotType} 槽位已有能力`);
  if (!writable(slots, String(slotIndex))) return failure(`${slotType} 槽位為唯讀`);
  slots[slotIndex] = id;
  return { ok: true, id, slotIndex };
}

/** Unslot without refunding AP, changing ownership, or consuming a reset. */
export function unassignAbility(state, slotIndex, slotType = 'major') {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!SLOT_TYPES.includes(slotType)) return failure('未知能力槽類型');
  const { abilities } = inspected;
  const slots = abilities[`${slotType}Slots`];
  if (!validSlot(slotIndex, slots)) return failure(`只能使用 0–${slots.length - 1} 的 ${slotType} 槽位`);
  const id = slots[slotIndex];
  if (id === null) return failure(`這個 ${slotType} 槽位沒有能力`);
  if (!writable(slots, String(slotIndex))) return failure(`${slotType} 槽位為唯讀`);
  slots[slotIndex] = null;
  return { ok: true, id, slotIndex };
}

/** Refund every owned rank of one ability, clear its slot, and use one allowance. */
export function resetAbility(state, id) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!IDS.includes(id)) return failure('未知能力');
  const { abilities } = inspected;
  const fromRank = abilities.purchased[id];
  if (fromRank === 0) return failure('沒有已購買的能力可重置');
  if (abilities.freeSingleResetsUsed >= ABILITY_POLICY.freeSingleResetAllowance) {
    return failure('免費單項重置已用完；付費重置尚未實作');
  }
  const slots = abilities[`${ALL_ABILITIES[id].slotType}Slots`];
  const slotIndex = slots.indexOf(id);
  if (!writable(abilities.purchased, id) || !writable(abilities, 'freeSingleResetsUsed')
    || (slotIndex >= 0 && !writable(slots, String(slotIndex)))) {
    return failure('能力重置資料為唯讀');
  }
  const refundedAP = ALL_ABILITIES[id].ranks.slice(0, fromRank).reduce((sum, rank) => sum + rank.cost, 0);
  abilities.purchased[id] = 0;
  if (slotIndex >= 0) slots[slotIndex] = null;
  abilities.freeSingleResetsUsed++;
  return {
    ok: true, id, fromRank, toRank: 0, refundedAP, cost: -refundedAP,
    freeSingleResetsRemaining: ABILITY_POLICY.freeSingleResetAllowance - abilities.freeSingleResetsUsed,
  };
}

/**
 * Highest owned rank's total multiplier only when validly assigned.
 * Invalid/disabled inputs fail closed to neutral factors. Battle pinning and
 * applying/rounding maxima belong to the engine, not this pure helper.
 */
export function abilityVitalMultipliers(state) {
  const factors = { hp: 1, mp: 1, sp: 1 };
  const inspected = inspectState(state);
  if (!inspected.ok || !inspected.enabled) return factors;
  for (const id of inspected.abilities.majorSlots) {
    if (!TANK_IDS.includes(id)) continue;
    const ability = TANK_ABILITIES[id];
    const rank = ability.ranks[inspected.abilities.purchased[id] - 1];
    factors[ability.pool] = (100 + rank.bonusPercent) / 100;
  }
  return factors;
}

/** Read-only effective Cure rank. Ownership alone never enables the upgrade. */
export function activeCureRank(state) {
  const inspected = inspectState(state);
  if (!inspected.ok || !inspected.enabled
    || !inspected.abilities.supportiveSlots.includes('betterCure')) return 0;
  return inspected.abilities.purchased.betterCure;
}

/** Only a valid matching Major assignment activates potion potency ownership. */
export function activePotionRank(state, abilityId) {
  if (!POTION_IDS.includes(abilityId)) return 0;
  const inspected = inspectState(state);
  if (!inspected.ok || !inspected.enabled
    || !inspected.abilities.majorSlots.includes(abilityId)) return 0;
  return inspected.abilities.purchased[abilityId];
}

/** Only an assigned current-series ability changes Fire's authored target cap. */
export function activeConflagrationRank(state) {
  const inspected = inspectState(state);
  if (!inspected.ok || !inspected.enabled
    || !inspected.abilities.majorSlots.includes('conflagration')) return 0;
  const descriptor = Object.getOwnPropertyDescriptor(state, 'battle');
  if (descriptor && (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value'))) return 0;
  const battle = descriptor?.value;
  if (battle !== undefined && battle !== null) {
    const status = dataField(battle, 'status');
    if (!BATTLE_STATUSES.includes(status)
      || (status === 'active' && dataField(battle, 'abilityRules') !== ABILITY_POLICY.id)) return 0;
  }
  return inspected.abilities.purchased.conflagration;
}
