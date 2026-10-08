/**
 * Bounded local NPC Health Potion purchases using in-game Credits only.
 * No network, market stock, clocks, RNG, event IDs, or restorative effects.
 * See docs/SUPPLIES.md for the documentary and prototype-policy boundaries.
 */

export const SUPPLY_POLICY = Object.freeze({
  item: 'healthPotion',
  unitPrice: 50,
  maxQuantity: 99_999,
  inventoryCap: 999_999,
  source: 'https://ehwiki.org/index.php?title=Bazaar&oldid=64945',
  supply: 'unlimited-npc-health-restorative',
});

const SUPPLY_KEYS = ['revision', 'lastPurchase'];
const RECEIPT_KEYS = ['revision', 'item', 'quantity', 'total'];
const BATTLE_STATUSES = ['active', 'victory', 'defeat', 'fled'];
const amount = (value) => Number.isSafeInteger(value) && value >= 0;
const validQuantity = (value) => Number.isSafeInteger(value) && value >= 1 && value <= SUPPLY_POLICY.maxQuantity;
const failure = (error) => ({ ok: false, error });

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Read only own data properties. Getters are never called to inspect inputs.
function dataField(record, key) {
  if (!isRecord(record)) return undefined;
  return Object.getOwnPropertyDescriptor(record, key)?.value;
}

function exactDataRecord(value, keys) {
  if (!isRecord(value)) return false;
  const names = Reflect.ownKeys(value);
  return names.length === keys.length && keys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && Object.hasOwn(descriptor, 'value') && descriptor.enumerable;
  });
}

function writable(record, keys) {
  return keys.every((key) => Object.getOwnPropertyDescriptor(record, key)?.writable === true);
}

export function createSupplyState() {
  return { revision: 0, lastPurchase: null };
}

/** Validate the nested state.supplies ledger, without repairing or mutating it. */
export function validateSupplyState(supplies) {
  if (!exactDataRecord(supplies, SUPPLY_KEYS) || !amount(supplies.revision)) return false;
  if (supplies.revision === 0) return supplies.lastPurchase === null;
  const receipt = supplies.lastPurchase;
  return exactDataRecord(receipt, RECEIPT_KEYS)
    && receipt.revision === supplies.revision
    && receipt.item === SUPPLY_POLICY.item
    && validQuantity(receipt.quantity)
    && receipt.total === receipt.quantity * SUPPLY_POLICY.unitPrice;
}

/** Validate only this module's inputs, not unrelated full-game subsystems. */
function inspectState(state) {
  if (!isRecord(state)) return failure('補給狀態格式錯誤');
  const player = dataField(state, 'player');
  const potions = dataField(state, 'potions');
  const supplies = dataField(state, 'supplies');
  if (!isRecord(player) || !amount(dataField(player, 'credits'))
    || !isRecord(potions) || !amount(dataField(potions, 'health'))
    || potions.health > SUPPLY_POLICY.inventoryCap || !validateSupplyState(supplies)) {
    return failure('補給、Credits 或生命藥水資料無效');
  }
  const battleDescriptor = Object.getOwnPropertyDescriptor(state, 'battle');
  if (battleDescriptor && !Object.hasOwn(battleDescriptor, 'value')) return failure('戰鬥狀態格式錯誤');
  const battle = battleDescriptor?.value;
  if (battle !== undefined && battle !== null
    && (!isRecord(battle) || !BATTLE_STATUSES.includes(dataField(battle, 'status')))) {
    return failure('戰鬥狀態格式錯誤');
  }
  // An inherited battle flag must not accidentally bypass the own-data check.
  if (!battleDescriptor && 'battle' in state) return failure('戰鬥狀態必須是自有資料');
  return { ok: true, player, potions, supplies, activeBattle: dataField(battle, 'status') === 'active' };
}

function inspectRequest(state, quantity, expectedRevision) {
  if (!validQuantity(quantity)) return failure(`數量須為 1 至 ${SUPPLY_POLICY.maxQuantity.toLocaleString('en-US')} 的整數`);
  if (!amount(expectedRevision)) return failure('購買版本須為非負安全整數');
  return inspectState(state);
}

function quoteCurrent(inspection, quantity, expectedRevision) {
  const { player, potions, supplies, activeBattle } = inspection;
  if (expectedRevision !== supplies.revision) return failure('購買版本已變更，請重新確認補給');
  if (supplies.revision === Number.MAX_SAFE_INTEGER) return failure('購買版本已達安全上限');
  if (activeBattle) return failure('戰鬥系列尚未結束，不能購買補給');
  if (potions.health + quantity > SUPPLY_POLICY.inventoryCap) return failure('生命藥水數量會超過保存上限');
  const total = quantity * SUPPLY_POLICY.unitPrice;
  if (player.credits < total) return failure('Credits 不足');
  return {
    ok: true, item: SUPPLY_POLICY.item, quantity,
    unitPrice: SUPPLY_POLICY.unitPrice, total, expectedRevision,
  };
}

/** Read-only fresh-purchase quote. Stale requests are never quoted as new buys. */
export function quoteHealthPurchase(state, quantity, expectedRevision) {
  const inspection = inspectRequest(state, quantity, expectedRevision);
  return inspection.ok ? quoteCurrent(inspection, quantity, expectedRevision) : inspection;
}

/**
 * Commit once at the expected revision, or acknowledge the exact last retry.
 * All changing fields are preflighted before the first write. Ordinary data
 * records are supported; JavaScript proxies and host objects are not.
 */
export function purchaseHealthPotion(state, quantity, expectedRevision) {
  const inspection = inspectRequest(state, quantity, expectedRevision);
  if (!inspection.ok) return inspection;
  const { player, potions, supplies } = inspection;
  if (supplies.revision > 0 && expectedRevision === supplies.revision - 1
    && supplies.lastPurchase.quantity === quantity) {
    return { ok: true, receipt: { ...supplies.lastPurchase }, duplicate: true };
  }
  const quote = quoteCurrent(inspection, quantity, expectedRevision);
  if (!quote.ok) return quote;
  if (!writable(player, ['credits']) || !writable(potions, ['health'])
    || !writable(supplies, SUPPLY_KEYS)) return failure('補給購買資料為唯讀');
  const receipt = {
    revision: supplies.revision + 1, item: SUPPLY_POLICY.item,
    quantity, total: quote.total,
  };
  player.credits -= quote.total;
  potions.health += quantity;
  supplies.revision = receipt.revision;
  supplies.lastPurchase = receipt;
  return { ok: true, receipt: { ...receipt }, duplicate: false };
}
