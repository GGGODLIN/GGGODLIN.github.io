/**
 * Bounded Credits → Soul Fragments → weapon Soulbind candidate ledger.
 * Pure local data operations: no RNG, clocks, EXP, events or unrelated ledgers.
 * The relative level factors are LEGACY and unverified for Persistent 0.91.
 * See docs/SOULBIND-LEDGER.md before treating them as game-rule fidelity.
 */
export const SOULBIND_POLICY = Object.freeze({
  model: 'weapon-soulbind-candidate-v1',
  scalingModel: 'legacy-relative-weapon-v1',
  item: 'soulFragment',
  unitPrice: 1000,
  fragmentsRequired: 100,
  maxQuantity: 99_999,
  inventoryCap: 999_999,
  maxBindings: 1000,
  maxLevel: 500,
  supply: 'unlimited-npc-soul-fragment',
  qualities: Object.freeze(['Crude', 'Fair', 'Average', 'Superior', 'Exquisite']),
  scale: Object.freeze({ denominator: 100_000, attackNumerator: 1_660_027, magicNumerator: 2_272_727 }),
  sources: Object.freeze({
    purchase: 'https://ehwiki.org/index.php?title=Bazaar&oldid=64945#Item_Shop',
    cost: 'https://ehwiki.org/index.php?title=Items&oldid=65165#Soul_Fragments',
    behavior: 'https://ehwiki.org/index.php?title=The_Armory&oldid=65341#Soulbind',
    legacyScaling: 'https://ehwiki.org/index.php?title=Level_Scaling&oldid=63848',
  }),
  candidateWarning: '候選規則：採用舊版相對等級倍率，尚未驗證 Persistent 0.91；以原始有效物攻／魔攻為錨點，並非品質骰值。',
});

const LEDGER_KEYS = ['model', 'fragments', 'revision', 'lastAction', 'bindings'];
const BINDING_KEYS = ['referenceLevel', 'boundAtLevel', 'fragmentsSpent', 'scalingModel'];
const PURCHASE_KEYS = ['revision', 'kind', 'quantity', 'total'];
const BIND_KEYS = ['revision', 'kind', 'itemId', 'fragmentsSpent', 'referenceLevel', 'boundAtLevel'];
const STATS = ['attack', 'magic', 'defense', 'burden'];
const ITEM_REQUIRED = ['id', 'slot', 'category', 'quality', 'hands', 'level', 'attack', 'magic', 'defense', 'burden', 'container', 'bound', 'protected', 'locked'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const amount = value => Number.isSafeInteger(value) && value >= 0;
const validLevel = value => Number.isSafeInteger(value) && value >= 1 && value <= SOULBIND_POLICY.maxLevel;
const validQuantity = value => Number.isSafeInteger(value) && value >= 1 && value <= SOULBIND_POLICY.maxQuantity;
const failure = (code, error) => ({ ok: false, code, error });

// Inspect descriptors first. Accessors, symbols, hidden fields and inherited
// data are never used. Proxies/host objects are outside this JSON-data API.
function plainData(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Reflect.ownKeys(value).every(key => {
    if (typeof key !== 'string' || FORBIDDEN_KEYS.has(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor.enumerable && Object.hasOwn(descriptor, 'value');
  });
}
function ownFields(value, keys) { return keys.every(key => Object.hasOwn(value, key)); }
function exactData(value, keys) {
  return plainData(value) && Reflect.ownKeys(value).length === keys.length
    && keys.every(key => Object.hasOwn(value, key));
}
function arrayData(value, cap) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return false;
  const length = Object.getOwnPropertyDescriptor(value, 'length')?.value;
  if (!amount(length) || length > cap || Reflect.ownKeys(value).length !== length + 1) return false;
  for (let index = 0; index < length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) return false;
  }
  return true;
}
function jsonData(value, seen = new Set(), depth = 0) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value !== 'object' || seen.has(value) || depth > 8) return false;
  if (!(Array.isArray(value) ? arrayData(value, 1000) : plainData(value))) return false;
  seen.add(value);
  const values = Array.isArray(value) ? value : Object.values(value);
  const valid = values.every(entry => jsonData(entry, seen, depth + 1));
  seen.delete(value);
  return valid;
}
function canonicalId(value) {
  if (typeof value !== 'string' || FORBIDDEN_KEYS.has(value)) return false;
  const match = /^[a-z0-9][a-z0-9-]{0,199}$/.exec(value);
  return match !== null && match[0] === value;
}
function writable(record, keys) {
  return keys.every(key => Object.getOwnPropertyDescriptor(record, key)?.writable === true);
}
function validItem(item) {
  return plainData(item) && ownFields(item, ITEM_REQUIRED) && jsonData(item) && canonicalId(item.id)
    && ['weapon', 'body', 'offhand'].includes(item.slot)
    && typeof item.category === 'string' && typeof item.quality === 'string'
    && [0, 1, 2].includes(item.hands)
    && (item.level === null || validLevel(item.level))
    && STATS.every(key => amount(item[key]))
    && ['inventory', 'storage'].includes(item.container)
    && ['bound', 'protected', 'locked'].every(key => typeof item[key] === 'boolean')
    && !(item.protected && item.locked);
}
function supportedWeapon(item) {
  return item.slot === 'weapon'
    && (item.category === 'one-handed' && item.hands === 1 || item.category === 'staff' && item.hands === 2)
    && SOULBIND_POLICY.qualities.includes(item.quality) && item.defense === 0;
}
function validBinding(record, item, playerLevel) {
  return exactData(record, BINDING_KEYS) && supportedWeapon(item) && item.bound === true
    && validLevel(record.referenceLevel) && validLevel(record.boundAtLevel)
    && record.referenceLevel === item.level && record.referenceLevel <= record.boundAtLevel
    && record.boundAtLevel <= playerLevel && record.fragmentsSpent === SOULBIND_POLICY.fragmentsRequired
    && record.scalingModel === SOULBIND_POLICY.scalingModel;
}
function scaledStats(item, playerLevel, referenceLevel) {
  const { denominator, attackNumerator, magicNumerator } = SOULBIND_POLICY.scale;
  // Divide the integer level factors before multiplying. This retains fractional
  // effective values and avoids an unnecessarily unsafe intermediate product.
  const scaled = (anchor, numerator) => anchor * ((numerator + denominator * playerLevel) / (numerator + denominator * referenceLevel));
  const stats = {
    attack: scaled(item.attack, attackNumerator), magic: scaled(item.magic, magicNumerator),
    defense: item.defense, burden: item.burden, level: playerLevel,
  };
  if (!STATS.every(key => Number.isFinite(stats[key]) && stats[key] >= 0 && stats[key] <= Number.MAX_SAFE_INTEGER)) {
    throw new RangeError('Soulbind effective stats exceed the supported numeric range');
  }
  return stats;
}
function validReceipt(receipt, ledger, owned) {
  if (exactData(receipt, PURCHASE_KEYS)) {
    return receipt.kind === 'purchase' && receipt.revision === ledger.revision
      && validQuantity(receipt.quantity) && receipt.total === receipt.quantity * SOULBIND_POLICY.unitPrice
      && ledger.fragments >= receipt.quantity;
  }
  if (!exactData(receipt, BIND_KEYS) || receipt.kind !== 'bind' || receipt.revision !== ledger.revision
    || !canonicalId(receipt.itemId) || !owned.has(receipt.itemId)) return false;
  const binding = ledger.bindings[receipt.itemId];
  return Boolean(binding) && receipt.fragmentsSpent === binding.fragmentsSpent
    && receipt.referenceLevel === binding.referenceLevel && receipt.boundAtLevel === binding.boundAtLevel;
}

export function createSoulbindingState() {
  return { model: SOULBIND_POLICY.model, fragments: 0, revision: 0, lastAction: null, bindings: {} };
}

/** Cross-validates ownership and bound flags; it never manufactures migration stock. */
export function validateSoulbindingState(ledger, inventory, playerLevel) {
  try {
    if (!exactData(ledger, LEDGER_KEYS) || ledger.model !== SOULBIND_POLICY.model
      || !amount(ledger.fragments) || ledger.fragments > SOULBIND_POLICY.inventoryCap
      || !amount(ledger.revision) || !plainData(ledger.bindings) || !validLevel(playerLevel)
      || !arrayData(inventory, SOULBIND_POLICY.maxBindings)) return false;
    const ids = new Set();
    const bindingIds = Object.keys(ledger.bindings);
    if (bindingIds.length > inventory.length || !bindingIds.every(canonicalId)) return false;
    for (const item of inventory) {
      if (!validItem(item) || ids.has(item.id)) return false;
      ids.add(item.id);
      if (item.bound !== Object.hasOwn(ledger.bindings, item.id)) return false;
      if (item.bound) {
        const record = ledger.bindings[item.id];
        if (!validBinding(record, item, playerLevel)) return false;
        // Reject anchors that would overflow as the supported player reaches 500.
        scaledStats(item, SOULBIND_POLICY.maxLevel, record.referenceLevel);
      }
    }
    if (!bindingIds.every(id => ids.has(id))) return false;
    if (ledger.revision === 0) return ledger.fragments === 0 && bindingIds.length === 0 && ledger.lastAction === null;
    return ledger.revision > bindingIds.length && validReceipt(ledger.lastAction, ledger, ids);
  } catch { return false; }
}

/** Raw unbound values; continuously scaled bound values; never changes anchors. */
export function effectiveEquipmentStats(item, playerLevel, bindingRecord) {
  if (!validLevel(playerLevel) || !validItem(item)) throw new TypeError('Invalid equipment or player level');
  if (!item.bound) {
    if (bindingRecord !== undefined && bindingRecord !== null) throw new TypeError('Unbound equipment cannot have a binding record');
    return { attack: item.attack, magic: item.magic, defense: item.defense, burden: item.burden, level: item.level };
  }
  if (!validBinding(bindingRecord, item, playerLevel)) throw new TypeError('Invalid weapon binding record');
  return scaledStats(item, playerLevel, bindingRecord.referenceLevel);
}

function inspectState(state) {
  if (!plainData(state) || !ownFields(state, ['player', 'progression', 'soulbinding', 'inventory'])
    || !plainData(state.player) || !ownFields(state.player, ['credits', 'level'])
    || !plainData(state.progression) || !ownFields(state.progression, ['kind'])
    || !amount(state.player.credits) || !validLevel(state.player.level)
    || !validateSoulbindingState(state.soulbinding, state.inventory, state.player.level)) {
    return failure('invalid-soulbinding-state', 'Soulbind、裝備或 Credits 資料無效');
  }
  if (state.progression.kind !== 'experience-ledger') return failure('experience-profile-required', '僅限有效 EXP 帳本角色使用已取得的 Credits');
  const battle = Object.getOwnPropertyDescriptor(state, 'battle');
  if (!battle && 'battle' in state || battle && battle.value !== null && (!plainData(battle.value)
    || !Object.hasOwn(battle.value, 'status') || !['active', 'victory', 'defeat', 'fled'].includes(battle.value.status))) {
    return failure('invalid-battle-state', '戰鬥狀態格式錯誤');
  }
  return { ok: true, player: state.player, ledger: state.soulbinding, inventory: state.inventory,
    activeBattle: battle?.value?.status === 'active' };
}
function inspectRequest(state, expectedRevision) {
  if (!amount(expectedRevision)) return failure('invalid-revision', 'Soulbind 版本須為非負安全整數');
  return inspectState(state);
}
function freshRequest(inspection, expectedRevision) {
  if (expectedRevision !== inspection.ledger.revision) return failure('stale-revision', 'Soulbind 版本已變更，請重新確認');
  if (inspection.ledger.revision === Number.MAX_SAFE_INTEGER) return failure('revision-overflow', 'Soulbind 版本已達安全上限');
  if (inspection.activeBattle) return failure('active-battle', '戰鬥系列尚未結束，不能購買碎片或 Soulbind');
  return { ok: true };
}
function replay(inspection, kind, payload, expectedRevision) {
  const { ledger } = inspection;
  if (ledger.revision === 0 || expectedRevision !== ledger.revision - 1) return null;
  const receipt = ledger.lastAction;
  if (receipt.kind !== kind || (kind === 'purchase' ? receipt.quantity !== payload : receipt.itemId !== payload)) {
    return failure('payload-conflict', '這個 Soulbind 版本已用於不同的行動');
  }
  return { ok: true, receipt: { ...receipt }, duplicate: true };
}
function quotePurchase(inspection, quantity, expectedRevision) {
  const fresh = freshRequest(inspection, expectedRevision);
  if (!fresh.ok) return fresh;
  if (inspection.ledger.fragments + quantity > SOULBIND_POLICY.inventoryCap) return failure('fragment-cap', 'Soul Fragment 會超過本機保存上限');
  const total = quantity * SOULBIND_POLICY.unitPrice;
  if (inspection.player.credits < total) return failure('insufficient-credits', 'Credits 不足');
  return { ok: true, kind: 'purchase', item: SOULBIND_POLICY.item, quantity,
    unitPrice: SOULBIND_POLICY.unitPrice, total, expectedRevision, revision: inspection.ledger.revision };
}

/** Read-only quotes require the current revision; retries are not fresh purchases. */
export function quoteSoulFragmentPurchase(state, quantity, expectedRevision) {
  try {
    if (!validQuantity(quantity)) return failure('invalid-quantity', '購買數量須為 1 至 99,999 的整數');
    const inspection = inspectRequest(state, expectedRevision);
    return inspection.ok ? quotePurchase(inspection, quantity, expectedRevision) : inspection;
  } catch { return failure('invalid-soulbinding-state', 'Soul Fragment 資料無法安全讀取'); }
}

/** Exact retained last-action retries acknowledge receipt without another debit. */
export function purchaseSoulFragments(state, quantity, expectedRevision) {
  try {
    if (!validQuantity(quantity)) return failure('invalid-quantity', '購買數量須為 1 至 99,999 的整數');
    const inspection = inspectRequest(state, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'purchase', quantity, expectedRevision);
    if (repeated) return repeated;
    const quote = quotePurchase(inspection, quantity, expectedRevision);
    if (!quote.ok) return quote;
    const { player, ledger } = inspection;
    if (!writable(player, ['credits']) || !writable(ledger, ['fragments', 'revision', 'lastAction'])) {
      return failure('read-only', 'Soul Fragment 購買資料為唯讀');
    }
    const receipt = { revision: ledger.revision + 1, kind: 'purchase', quantity, total: quote.total };
    const result = { ok: true, receipt: { ...receipt }, duplicate: false };
    player.credits -= quote.total;
    ledger.fragments += quantity;
    ledger.revision = receipt.revision;
    ledger.lastAction = receipt;
    return result;
  } catch { return failure('invalid-soulbinding-state', 'Soul Fragment 購買無法安全完成'); }
}

function quoteBinding(inspection, itemId, expectedRevision) {
  const fresh = freshRequest(inspection, expectedRevision);
  if (!fresh.ok) return fresh;
  const { player, ledger, inventory } = inspection;
  const item = inventory.find(entry => entry.id === itemId);
  if (!item) return failure('item-not-owned', '找不到這件已擁有的裝備');
  if (item.bound) return failure('already-bound', '這件裝備已經 Soulbind');
  if (item.container !== 'inventory') return failure('stored-item', '請先將這件裝備從倉庫取回');
  if (item.locked) return failure('locked-item', '候選限制：請先解除裝備鎖定');
  if (!supportedWeapon(item)) return failure('unsupported-weapon', '目前僅支援防禦為 0 的 Crude–Exquisite 單手武器或法杖');
  if (item.level !== null && item.level > player.level) return failure('item-above-level', '目前不支援高於角色等級的裝備 Soulbind');
  const referenceLevel = item.level ?? player.level;
  scaledStats(item, SOULBIND_POLICY.maxLevel, referenceLevel);
  const affordable = ledger.fragments >= SOULBIND_POLICY.fragmentsRequired;
  const quote = {
    ok: true, kind: 'bind', itemId, fragmentsSpent: SOULBIND_POLICY.fragmentsRequired,
    expectedRevision, revision: ledger.revision, referenceLevel, boundAtLevel: player.level,
    before: effectiveEquipmentStats(item, player.level),
    after: scaledStats(item, player.level, referenceLevel),
    nextLevel: scaledStats(item, Math.min(SOULBIND_POLICY.maxLevel, player.level + 1), referenceLevel),
    requiresProtectionConfirmation: item.protected, candidateWarning: SOULBIND_POLICY.candidateWarning, affordable,
  };
  return affordable ? quote : { ...quote, ...failure('insufficient-fragments', 'Soul Fragment 不足，需要 100 枚') };
}

/** Insufficient stock still returns the complete eligible, non-consuming preview. */
export function quoteWeaponSoulbind(state, itemId, expectedRevision) {
  try {
    if (!canonicalId(itemId)) return failure('invalid-item-id', '裝備 ID 格式錯誤');
    const inspection = inspectRequest(state, expectedRevision);
    return inspection.ok ? quoteBinding(inspection, itemId, expectedRevision) : inspection;
  } catch { return failure('invalid-soulbinding-state', 'Soulbind 預覽無法安全計算'); }
}

/**
 * The caller owns paid-action and protected-item confirmation. This data layer
 * atomically consumes exactly 100 owned fragments and never substitutes Credits.
 */
export function bindWeapon(state, itemId, expectedRevision) {
  try {
    if (!canonicalId(itemId)) return failure('invalid-item-id', '裝備 ID 格式錯誤');
    const inspection = inspectRequest(state, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'bind', itemId, expectedRevision);
    if (repeated) return repeated;
    const quote = quoteBinding(inspection, itemId, expectedRevision);
    if (!quote.ok) return quote;
    const { ledger, inventory } = inspection;
    const item = inventory.find(entry => entry.id === itemId);
    if (!writable(ledger, ['fragments', 'revision', 'lastAction', 'bindings'])
      || !writable(item, item.level === null ? ['bound', 'level'] : ['bound'])) {
      return failure('read-only', 'Soulbind 帳本或裝備資料為唯讀');
    }
    const binding = { referenceLevel: quote.referenceLevel, boundAtLevel: quote.boundAtLevel,
      fragmentsSpent: SOULBIND_POLICY.fragmentsRequired, scalingModel: SOULBIND_POLICY.scalingModel };
    const bindings = { ...ledger.bindings, [itemId]: binding };
    const receipt = { revision: ledger.revision + 1, kind: 'bind', itemId,
      fragmentsSpent: SOULBIND_POLICY.fragmentsRequired, referenceLevel: quote.referenceLevel, boundAtLevel: quote.boundAtLevel };
    const result = { ok: true, receipt: { ...receipt }, duplicate: false };
    ledger.fragments -= SOULBIND_POLICY.fragmentsRequired;
    ledger.bindings = bindings;
    ledger.revision = receipt.revision;
    ledger.lastAction = receipt;
    if (item.level === null) item.level = quote.referenceLevel;
    item.bound = true;
    return result;
  } catch { return failure('invalid-soulbinding-state', 'Soulbind 無法安全完成'); }
}
