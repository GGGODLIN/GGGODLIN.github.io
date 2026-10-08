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

export const ABILITY_POLICY = Object.freeze({
  id: 'potion-potency-candidate-v1',
  model: 'potion-potency-candidate-v1',
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
    betterHealthPots: 5, betterManaPots: 5 }),
  freeSingleResetAllowance: 10,
  resetPolicy: 'ten-free-single-resets-candidate-v1',
  levelOneAPStatus: 'inferred-initial-point',
  maximumRounding: 'floor-after-applying-tank-multiplier-candidate',
  source: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
  cureSource: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
  potionSource: 'https://ehwiki.org/wiki/Abilities#General',
  potionScope: 'existing-health-mana-potion-potency-only',
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
});

const TANK_IDS = Object.freeze(Object.keys(TANK_ABILITIES));
const POTION_IDS = Object.freeze(Object.keys(POTION_ABILITIES));
// Historical key sets must never grow with the active registry.
const PRE_POTION_IDS = Object.freeze(['hpTank', 'mpTank', 'spTank', 'betterCure']);
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
const validSlot = (index, slotType) => SLOT_TYPES.includes(slotType)
  && Number.isSafeInteger(index) && index >= 0 && index < ABILITY_POLICY[`${slotType}Slots`];

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
    purchased: { hpTank: 0, mpTank: 0, spTank: 0, betterCure: 0, betterHealthPots: 0, betterManaPots: 0 },
    majorSlots: Array(ABILITY_POLICY.majorSlots).fill(null),
    supportiveSlots: Array(ABILITY_POLICY.supportiveSlots).fill(null),
    freeSingleResetsUsed: 0,
  };
}

/** Strict nested-save validation. No repair, coercion, or unrelated subsystem reads. */
function validateLedger(abilities, level, enabled, model, ids, trainedAP = 0, rankCap = Infinity) {
  if (typeof enabled !== 'boolean' || !validLevel(level)
    || !Number.isSafeInteger(trainedAP) || Object.is(trainedAP, -0)
    || trainedAP < 0 || trainedAP > 500 || trainedAP > level || (!enabled && trainedAP !== 0)
    || !exactDataRecord(abilities, LEDGER_KEYS)
    || abilities.model !== model
    || abilities.entitlementMode !== (enabled ? ABILITY_POLICY.entitlementMode : ABILITY_POLICY.legacyMode)
    || !exactDataRecord(abilities.purchased, ids)
    || !exactSlotArray(abilities.majorSlots, ABILITY_POLICY.majorSlots)
    || !exactSlotArray(abilities.supportiveSlots, ABILITY_POLICY.supportiveSlots)
    || abilities.majorSlots === abilities.supportiveSlots) return false;
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
export function validateAbilityState(abilities, level, enabled = true, trainedAP = 0) {
  return validateLedger(abilities, level, enabled, ABILITY_POLICY.model, IDS, trainedAP);
}

/** Copy a fully validated historical ledger without any purchase or AP grant. */
function migratedAbilityCopy(abilities) {
  return {
    model: ABILITY_POLICY.model,
    entitlementMode: abilities.entitlementMode,
    purchased: { ...abilities.purchased,
      ...(!Object.hasOwn(abilities.purchased, 'betterCure') ? { betterCure: 0 } : {}),
      betterHealthPots: 0, betterManaPots: 0 },
    majorSlots: [...abilities.majorSlots],
    supportiveSlots: [...abilities.supportiveSlots],
    freeSingleResetsUsed: abilities.freeSingleResetsUsed,
  };
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
  let trainedAP = 0;
  if (trainingDescriptor) {
    if (!trainingDescriptor.enumerable || !Object.hasOwn(trainingDescriptor, 'value')
      || !validateTrainingState(trainingDescriptor.value)) return failure('Training 帳本無效');
    trainedAP = dataField(trainingDescriptor.value, 'abilityBoostRank');
  }
  if (!validateAbilityState(abilities, level, enabled, trainedAP)) return failure('能力帳本、角色等級或 AP 配置無效');
  const progressionDescriptor = Object.getOwnPropertyDescriptor(state, 'progression');
  if (progressionDescriptor) {
    const kind = dataField(dataField(state, 'progression'), 'kind');
    if (enabled ? kind !== 'experience-ledger' : kind !== 'legacy-fixture') {
      return failure('能力權益與角色成長模型不一致');
    }
  }
  const levelAP = enabled ? level : 0;
  return { ok: true, abilities, level, enabled, levelAP, trainedAP,
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

/** Derive AP once from level and validated completed training, never levelRewards. */
export function getAbilitySummary(state) {
  const inspected = inspectState(state);
  if (!inspected.ok) return inspected;
  const { abilities, level, enabled, levelAP, trainedAP, totalAP, spentAP } = inspected;
  return {
    ok: true, enabled, levelAP, trainedAP, totalAP, spentAP, unspentAP: totalAP - spentAP,
    masteryPoints: enabled ? Math.floor(level / 10) : 0,
    allocatedMasteryPoints: 0,
    freeSingleResetsRemaining: enabled ? ABILITY_POLICY.freeSingleResetAllowance - abilities.freeSingleResetsUsed : 0,
  };
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
    ...(POTION_IDS.includes(id) ? { restorationPercent: next.restorationPercent }
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
  if (!validSlot(slotIndex, slotType)) return failure(`只能使用 0–4 的 ${slotType} 槽位`);
  const { abilities } = inspected;
  const slots = abilities[`${slotType}Slots`];
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
  if (!validSlot(slotIndex, slotType)) return failure(`只能使用 0–4 的 ${slotType} 槽位`);
  const { abilities } = inspected;
  const slots = abilities[`${slotType}Slots`];
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
