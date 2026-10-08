/**
 * Bounded local NPC Health/Mana/Spirit Potion trades using existing in-game Credits only.
 * No network, player markets, stock generation, modifiers, clocks, RNG, event
 * IDs, or restorative effects. See docs/SUPPLIES.md for policy boundaries.
 */

export const PREVIOUS_SUPPLY_MODEL = 'npc-health-trades-v1';
export const PREVIOUS_POTION_TRADE_MODEL = 'npc-potion-trades-v1';
export const SUPPLY_ITEMS = Object.freeze({
  healthPotion: Object.freeze({ stockKey: 'health', unitPrice: 50, saleUnitPrice: 2 }),
  manaPotion: Object.freeze({ stockKey: 'mana', unitPrice: 100, saleUnitPrice: 4 }),
  spiritPotion: Object.freeze({ stockKey: 'spirit', unitPrice: 100, saleUnitPrice: 4 }),
});

export const SUPPLY_POLICY = Object.freeze({
  model: 'npc-potion-trades-v2',
  // Historical Health-only aliases remain unchanged for existing consumers.
  item: 'healthPotion',
  unitPrice: 50,
  saleUnitPrice: 2,
  // The purchase cap is documented; applying it to sales is a local safeguard.
  maxQuantity: 99_999,
  inventoryCap: 999_999,
  source: 'https://ehwiki.org/index.php?title=Bazaar&oldid=64945',
  supply: 'unlimited-npc-health-mana-spirit-potions',
});

const SUPPLY_KEYS = ['model', 'revision', 'lastTrade'];
const CHANGING_SUPPLY_KEYS = ['revision', 'lastTrade'];
const RECEIPT_KEYS = ['revision', 'kind', 'item', 'quantity', 'total'];
const LEGACY_SUPPLY_KEYS = ['revision', 'lastPurchase'];
const LEGACY_RECEIPT_KEYS = ['revision', 'item', 'quantity', 'total'];
const BATTLE_STATUSES = ['active', 'victory', 'defeat', 'fled'];
const legacyAmount = (value) => Number.isSafeInteger(value) && value >= 0;
const amount = (value) => legacyAmount(value) && !Object.is(value, -0);
const validQuantity = (value) => Number.isSafeInteger(value) && value >= 1 && value <= SUPPLY_POLICY.maxQuantity;
const failure = (error) => ({ ok: false, error });
const unitPrice = (kind, item) => kind === 'buy' ? SUPPLY_ITEMS[item].unitPrice : SUPPLY_ITEMS[item].saleUnitPrice;
const itemName = (item) => item === 'healthPotion' ? '生命藥水' : item === 'manaPotion' ? '魔力藥水' : '靈力藥水';

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Read only own data properties. Getters are never called to inspect inputs.
function dataField(record, key) {
  if (!isRecord(record)) return undefined;
  const descriptor = Object.getOwnPropertyDescriptor(record, key);
  return descriptor && Object.hasOwn(descriptor, 'value') ? descriptor.value : undefined;
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
  return { model: SUPPLY_POLICY.model, revision: 0, lastTrade: null };
}

/** Exact historical purchase-only contract. Never accepts current-model keys. */
export function validateLegacySupplyState(supplies) {
  if (!exactDataRecord(supplies, LEGACY_SUPPLY_KEYS) || !legacyAmount(supplies.revision)) return false;
  if (supplies.revision === 0) return supplies.lastPurchase === null;
  const receipt = supplies.lastPurchase;
  return exactDataRecord(receipt, LEGACY_RECEIPT_KEYS)
    && receipt.revision === supplies.revision
    && receipt.item === SUPPLY_POLICY.item
    && validQuantity(receipt.quantity)
    && receipt.total === receipt.quantity * SUPPLY_POLICY.unitPrice;
}

function validateTradeState(supplies, model, allowedItems) {
  if (!exactDataRecord(supplies, SUPPLY_KEYS)
    || supplies.model !== model || !amount(supplies.revision)) return false;
  if (supplies.revision === 0) return supplies.lastTrade === null;
  const receipt = supplies.lastTrade;
  return exactDataRecord(receipt, RECEIPT_KEYS)
    && receipt.revision === supplies.revision
    && (receipt.kind === 'buy' || receipt.kind === 'sell')
    && allowedItems.includes(receipt.item)
    && validQuantity(receipt.quantity)
    && receipt.total === receipt.quantity * unitPrice(receipt.kind, receipt.item);
}

/** Exact previous Health buy/sell contract. Mana receipts are never historical. */
export function validateHealthTradeState(supplies) {
  return validateTradeState(supplies, PREVIOUS_SUPPLY_MODEL, ['healthPotion']);
}

/** Exact two-item predecessor; a Spirit receipt cannot be historical. */
export function validatePotionTradeState(supplies) {
  return validateTradeState(supplies, PREVIOUS_POTION_TRADE_MODEL, ['healthPotion','manaPotion']);
}

/** Validate the current nested ledger without repairing or mutating it. */
export function validateSupplyState(supplies) {
  return validateTradeState(supplies, SUPPLY_POLICY.model, ['healthPotion','manaPotion','spiritPotion']);
}

/**
 * Explicit, detached migration only. Missing or malformed ledgers never reset.
 * The caller owns whether a historical game version may use this migration.
 */
export function migrateSupplyState(supplies) {
  if (validateSupplyState(supplies) || validateHealthTradeState(supplies) || validatePotionTradeState(supplies)) {
    return {
      ok: true,
      supplies: {
        model: SUPPLY_POLICY.model, revision: supplies.revision,
        lastTrade: supplies.lastTrade === null ? null : { ...supplies.lastTrade },
      },
    };
  }
  // JSON.stringify-generated historical saves encode -0 as 0. Reject an
  // explicit -0 revision instead of silently normalizing it for the new model.
  if (!validateLegacySupplyState(supplies) || !amount(supplies.revision)) {
    return failure('補給紀錄無法遷移');
  }
  const old = supplies.lastPurchase;
  return {
    ok: true,
    supplies: {
      model: SUPPLY_POLICY.model, revision: supplies.revision,
      lastTrade: old === null ? null : {
        revision: old.revision, kind: 'buy', item: old.item,
        quantity: old.quantity, total: old.total,
      },
    },
  };
}

/** Validate only this module's inputs, not unrelated full-game subsystems. */
function inspectState(state, item) {
  if (!isRecord(state)) return failure('補給狀態格式錯誤');
  const player = dataField(state, 'player');
  const potions = dataField(state, 'potions');
  const supplies = dataField(state, 'supplies');
  const stockKey = SUPPLY_ITEMS[item].stockKey;
  if (!isRecord(player) || !amount(dataField(player, 'credits'))
    || !isRecord(potions) || !amount(dataField(potions, stockKey))
    || potions[stockKey] > SUPPLY_POLICY.inventoryCap || !validateSupplyState(supplies)) {
    return failure(`補給、Credits 或${itemName(item)}資料無效`);
  }
  const battleDescriptor = Object.getOwnPropertyDescriptor(state, 'battle');
  if (battleDescriptor && !Object.hasOwn(battleDescriptor, 'value')) return failure('戰鬥狀態格式錯誤');
  const battle = battleDescriptor?.value;
  if (battle !== undefined && battle !== null
    && (!isRecord(battle) || !BATTLE_STATUSES.includes(dataField(battle, 'status')))) {
    return failure('戰鬥狀態格式錯誤');
  }
  // An inherited battle flag must not bypass the own-data check.
  if (!battleDescriptor && 'battle' in state) return failure('戰鬥狀態必須是自有資料');
  return { ok: true, player, potions, supplies, activeBattle: dataField(battle, 'status') === 'active' };
}

function inspectRequest(state, item, quantity, expectedRevision) {
  if (!validQuantity(quantity)) return failure(`數量須為 1 至 ${SUPPLY_POLICY.maxQuantity.toLocaleString('en-US')} 的整數`);
  if (!amount(expectedRevision)) return failure('交易版本須為非負安全整數');
  return inspectState(state, item);
}

function quoteCurrent(inspection, kind, item, quantity, expectedRevision) {
  const { player, potions, supplies, activeBattle } = inspection;
  if (expectedRevision !== supplies.revision) return failure('交易版本已變更，請重新確認補給');
  if (supplies.revision === Number.MAX_SAFE_INTEGER) return failure('交易版本已達安全上限');
  if (activeBattle) return failure('戰鬥系列尚未結束，不能交易補給');
  const stockKey = SUPPLY_ITEMS[item].stockKey;
  const price = unitPrice(kind, item);
  const total = quantity * price;
  if (kind === 'buy') {
    if (potions[stockKey] + quantity > SUPPLY_POLICY.inventoryCap) return failure(`${itemName(item)}數量會超過保存上限`);
    if (player.credits < total) return failure('Credits 不足');
  } else {
    if (potions[stockKey] < quantity) return failure(`${itemName(item)}數量不足`);
    if (player.credits > Number.MAX_SAFE_INTEGER - total) return failure('Credits 會超過安全上限');
  }
  return {
    ok: true, item, quantity,
    unitPrice: price, total, expectedRevision,
  };
}

/** Read-only fresh quote. An exact latest retry is still stale for quoting. */
function quoteTrade(state, kind, item, quantity, expectedRevision) {
  const inspection = inspectRequest(state, item, quantity, expectedRevision);
  return inspection.ok ? quoteCurrent(inspection, kind, item, quantity, expectedRevision) : inspection;
}

export function quoteHealthPurchase(state, quantity, expectedRevision) {
  return quoteTrade(state, 'buy', 'healthPotion', quantity, expectedRevision);
}

export function quoteHealthSale(state, quantity, expectedRevision) {
  return quoteTrade(state, 'sell', 'healthPotion', quantity, expectedRevision);
}

export function quoteManaPurchase(state, quantity, expectedRevision) {
  return quoteTrade(state, 'buy', 'manaPotion', quantity, expectedRevision);
}

export function quoteManaSale(state, quantity, expectedRevision) {
  return quoteTrade(state, 'sell', 'manaPotion', quantity, expectedRevision);
}

/**
 * Commit once at the expected shared revision, or acknowledge the exact latest
 * item/direction-aware retry. Preflight every changing field before any write.
 * Ordinary data records are supported; proxies and host objects are not.
 */
function tradePotion(state, kind, item, quantity, expectedRevision) {
  const inspection = inspectRequest(state, item, quantity, expectedRevision);
  if (!inspection.ok) return inspection;
  const { player, potions, supplies } = inspection;
  if (supplies.revision > 0 && expectedRevision === supplies.revision - 1
    && supplies.lastTrade.item === item && supplies.lastTrade.kind === kind
    && supplies.lastTrade.quantity === quantity) {
    return { ok: true, receipt: { ...supplies.lastTrade }, duplicate: true };
  }
  const quote = quoteCurrent(inspection, kind, item, quantity, expectedRevision);
  if (!quote.ok) return quote;
  const stockKey = SUPPLY_ITEMS[item].stockKey;
  if (!writable(player, ['credits']) || !writable(potions, [stockKey])
    || !writable(supplies, CHANGING_SUPPLY_KEYS)) return failure('補給交易資料為唯讀');
  const receipt = {
    revision: supplies.revision + 1, kind, item,
    quantity, total: quote.total,
  };
  const sign = kind === 'buy' ? 1 : -1;
  player.credits -= sign * quote.total;
  potions[stockKey] += sign * quantity;
  supplies.revision = receipt.revision;
  supplies.lastTrade = receipt;
  return { ok: true, receipt: { ...receipt }, duplicate: false };
}

export function purchaseHealthPotion(state, quantity, expectedRevision) {
  return tradePotion(state, 'buy', 'healthPotion', quantity, expectedRevision);
}

export function sellHealthPotion(state, quantity, expectedRevision) {
  return tradePotion(state, 'sell', 'healthPotion', quantity, expectedRevision);
}

export function purchaseManaPotion(state, quantity, expectedRevision) {
  return tradePotion(state, 'buy', 'manaPotion', quantity, expectedRevision);
}

export function sellManaPotion(state, quantity, expectedRevision) {
  return tradePotion(state, 'sell', 'manaPotion', quantity, expectedRevision);
}

export function quoteSpiritPurchase(state, quantity, expectedRevision) { return quoteTrade(state, 'buy', 'spiritPotion', quantity, expectedRevision); }
export function quoteSpiritSale(state, quantity, expectedRevision) { return quoteTrade(state, 'sell', 'spiritPotion', quantity, expectedRevision); }
export function purchaseSpiritPotion(state, quantity, expectedRevision) { return tradePotion(state, 'buy', 'spiritPotion', quantity, expectedRevision); }
export function sellSpiritPotion(state, quantity, expectedRevision) { return tradePotion(state, 'sell', 'spiritPotion', quantity, expectedRevision); }
