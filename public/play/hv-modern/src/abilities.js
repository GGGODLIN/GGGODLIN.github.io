/**
 * Original, bounded AP ownership and ability-slot candidate.
 * No resources, progression awards, clocks, randomness, or persistence are changed.
 * See docs/ABILITIES.md for sourced values and explicit prototype decisions.
 */

export const ABILITY_POLICY = Object.freeze({
  id: 'early-tanks-candidate-v1',
  model: 'early-tanks-candidate-v1',
  status: 'candidate',
  entitlementMode: 'level-candidate',
  legacyMode: 'legacy-disabled',
  minLevel: 1,
  maxLevel: 500,
  majorSlots: 5,
  supportiveSlots: 5,
  supportedRanks: 2,
  freeSingleResetAllowance: 10,
  resetPolicy: 'ten-free-single-resets-candidate-v1',
  levelOneAPStatus: 'inferred-initial-point',
  maximumRounding: 'floor-after-applying-tank-multiplier-candidate',
  source: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
  assignmentSource: 'https://ehwiki.org/index.php?title=Character/Abilities&oldid=64563',
  levelingSource: 'https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211',
});

function tank(id, name, pool, secondRankLevel) {
  return Object.freeze({
    id, name, pool, slotType: 'major', furtherRanks: 'deferred',
    ranks: Object.freeze([
      Object.freeze({ rank: 1, minLevel: 0, cost: 1, bonusPercent: 10 }),
      Object.freeze({ rank: 2, minLevel: secondRankLevel, cost: 2, bonusPercent: 20 }),
    ]),
  });
}

export const TANK_ABILITIES = Object.freeze({
  hpTank: tank('hpTank', 'HP Tank', 'hp', 25),
  mpTank: tank('mpTank', 'MP Tank', 'mp', 30),
  spTank: tank('spTank', 'SP Tank', 'sp', 40),
});

const IDS = Object.freeze(Object.keys(TANK_ABILITIES));
const LEDGER_KEYS = Object.freeze([
  'model', 'entitlementMode', 'purchased', 'majorSlots', 'supportiveSlots', 'freeSingleResetsUsed',
]);
const BATTLE_STATUSES = Object.freeze(['active', 'victory', 'defeat', 'fled']);
const failure = (error, metadata = {}) => ({ ...metadata, ok: false, error });
const validLevel = (level) => Number.isSafeInteger(level)
  && level >= ABILITY_POLICY.minLevel && level <= ABILITY_POLICY.maxLevel;
const validSlot = (index) => Number.isSafeInteger(index) && index >= 0 && index < ABILITY_POLICY.majorSlots;

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

function spentFor(purchased) {
  return IDS.reduce((sum, id) => sum + TANK_ABILITIES[id].ranks
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
    purchased: { hpTank: 0, mpTank: 0, spTank: 0 },
    majorSlots: Array(ABILITY_POLICY.majorSlots).fill(null),
    supportiveSlots: Array(ABILITY_POLICY.supportiveSlots).fill(null),
    freeSingleResetsUsed: 0,
  };
}

/** Strict nested-save validation. No repair, coercion, or unrelated subsystem reads. */
export function validateAbilityState(abilities, level, enabled = true) {
  if (typeof enabled !== 'boolean' || !validLevel(level)
    || !exactDataRecord(abilities, LEDGER_KEYS)
    || abilities.model !== ABILITY_POLICY.model
    || abilities.entitlementMode !== (enabled ? ABILITY_POLICY.entitlementMode : ABILITY_POLICY.legacyMode)
    || !exactDataRecord(abilities.purchased, IDS)
    || !exactSlotArray(abilities.majorSlots, ABILITY_POLICY.majorSlots)
    || !exactSlotArray(abilities.supportiveSlots, ABILITY_POLICY.supportiveSlots)
    || abilities.majorSlots === abilities.supportiveSlots) return false;
  if (!Number.isSafeInteger(abilities.freeSingleResetsUsed)
    || abilities.freeSingleResetsUsed < 0
    || abilities.freeSingleResetsUsed > ABILITY_POLICY.freeSingleResetAllowance) return false;
  for (const id of IDS) {
    const rank = abilities.purchased[id];
    if (!Number.isSafeInteger(rank) || rank < 0 || rank > TANK_ABILITIES[id].ranks.length
      || (rank > 0 && level < TANK_ABILITIES[id].ranks[rank - 1].minLevel)) return false;
  }
  const spentAP = spentFor(abilities.purchased);
  if (spentAP > (enabled ? level : 0)) return false;
  const assigned = new Set();
  for (const id of abilities.majorSlots) {
    if (id === null) continue;
    if (!IDS.includes(id) || abilities.purchased[id] === 0 || assigned.has(id)) return false;
    assigned.add(id);
  }
  if (abilities.supportiveSlots.some((id) => id !== null)) return false;
  return enabled || abilities.freeSingleResetsUsed === 0;
}

/** Pure reads accept a minimal state; a supplied progression must match its mode. */
function inspectState(state) {
  const abilities = dataField(state, 'abilities');
  const level = dataField(dataField(state, 'player'), 'level');
  const mode = dataField(abilities, 'entitlementMode');
  const enabled = mode === ABILITY_POLICY.entitlementMode;
  if (!validateAbilityState(abilities, level, enabled)) return failure('能力帳本、角色等級或 AP 配置無效');
  const progressionDescriptor = Object.getOwnPropertyDescriptor(state, 'progression');
  if (progressionDescriptor) {
    const kind = dataField(dataField(state, 'progression'), 'kind');
    if (enabled ? kind !== 'experience-ledger' : kind !== 'legacy-fixture') {
      return failure('能力權益與角色成長模型不一致');
    }
  }
  return { ok: true, abilities, level, enabled, spentAP: spentFor(abilities.purchased) };
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

/** Derive AP once from current level, never by adding historical levelRewards. */
export function getAbilitySummary(state) {
  const inspected = inspectState(state);
  if (!inspected.ok) return inspected;
  const { abilities, level, enabled, spentAP } = inspected;
  const totalAP = enabled ? level : 0;
  return {
    ok: true, enabled, totalAP, spentAP, unspentAP: totalAP - spentAP,
    masteryPoints: enabled ? Math.floor(level / 10) : 0,
    allocatedMasteryPoints: 0,
    freeSingleResetsRemaining: enabled ? ABILITY_POLICY.freeSingleResetAllowance - abilities.freeSingleResetsUsed : 0,
  };
}

function quoteInspected(inspected, id) {
  if (!IDS.includes(id)) return failure('未知能力');
  const fromRank = inspected.abilities.purchased[id];
  const next = TANK_ABILITIES[id].ranks[fromRank];
  if (!next) return failure('後續能力階級尚未實作', { id, fromRank, deferred: true });
  const metadata = {
    id, fromRank, toRank: fromRank + 1, cost: next.cost,
    minLevel: next.minLevel, bonusPercent: next.bonusPercent,
  };
  if (inspected.level < next.minLevel) return failure(`此階級需要 Lv.${next.minLevel}`, metadata);
  if (inspected.level - inspected.spentAP < next.cost) return failure('未配置 AP 不足', metadata);
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

/** Assign to a zero-based Major slot. Moving requires an explicit unslot first. */
export function assignAbility(state, id, slotIndex) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!IDS.includes(id)) return failure('未知能力');
  if (!validSlot(slotIndex)) return failure('只能使用 0–4 的 Major 槽位');
  const { abilities } = inspected;
  if (abilities.purchased[id] === 0) return failure('請先購買能力階級');
  if (abilities.majorSlots.includes(id)) return failure('能力已配置；移動前請先卸下');
  if (abilities.majorSlots[slotIndex] !== null) return failure('目標 Major 槽位已有能力');
  if (!writable(abilities.majorSlots, String(slotIndex))) return failure('Major 槽位為唯讀');
  abilities.majorSlots[slotIndex] = id;
  return { ok: true, id, slotIndex };
}

/** Unslot without refunding AP, changing ownership, or consuming a reset. */
export function unassignAbility(state, slotIndex) {
  const inspected = inspectMutation(state);
  if (!inspected.ok) return inspected;
  if (!validSlot(slotIndex)) return failure('只能使用 0–4 的 Major 槽位');
  const { abilities } = inspected;
  const id = abilities.majorSlots[slotIndex];
  if (id === null) return failure('這個 Major 槽位沒有能力');
  if (!writable(abilities.majorSlots, String(slotIndex))) return failure('Major 槽位為唯讀');
  abilities.majorSlots[slotIndex] = null;
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
  const slotIndex = abilities.majorSlots.indexOf(id);
  if (!writable(abilities.purchased, id) || !writable(abilities, 'freeSingleResetsUsed')
    || (slotIndex >= 0 && !writable(abilities.majorSlots, String(slotIndex)))) {
    return failure('能力重置資料為唯讀');
  }
  const refundedAP = TANK_ABILITIES[id].ranks.slice(0, fromRank).reduce((sum, rank) => sum + rank.cost, 0);
  abilities.purchased[id] = 0;
  if (slotIndex >= 0) abilities.majorSlots[slotIndex] = null;
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
    if (id === null) continue;
    const ability = TANK_ABILITIES[id];
    const rank = ability.ranks[inspected.abilities.purchased[id] - 1];
    factors[ability.pool] = (100 + rank.bonusPercent) / 100;
  }
  return factors;
}
