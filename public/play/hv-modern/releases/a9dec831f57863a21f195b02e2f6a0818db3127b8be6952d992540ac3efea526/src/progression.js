/**
 * Original EXP-allocation candidate, not a server-exact implementation.
 * See docs/PROGRESSION.md for source versions and unverified policy choices.
 * This module has no clock, random, storage, reward, or level-up side effects.
 */

const ATTRIBUTE_KEYS = Object.freeze(['str', 'dex', 'agi', 'end', 'int', 'wis']);
const LEDGER_KEYS = Object.freeze(['kind', 'earned', 'allocated', 'unspent', 'roundingPolicy']);

export const EXPERIENCE_POLICY = Object.freeze({
  id: 'ceil-cumulative-v1',
  status: 'candidate',
  roundingStatus: 'unverified',
  refundStatus: 'unverified-symmetric-candidate',
  lifetimeModelStatus: 'inferred',
  minAttribute: 1,
  maxAttribute: 500,
  allowedDeltas: Object.freeze([-100, -10, -1, 1, 10, 100]),
  source: 'https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Experience_Point_Allocation',
});

/** Reference metadata only. No function in this module changes a level. */
export const LEVEL_20_REFERENCE = Object.freeze({
  level: 20,
  earnedThreshold: 9193,
  nextLevel: 21,
  nextEarnedThreshold: 10506,
  source: 'https://ehwiki.org/index.php?title=Level_Table&oldid=55267',
});

const safeAmount = (value) => Number.isSafeInteger(value) && value >= 0;
const rawCumulative = (n) => (n + 1) ** (2.5475566751265 ** (1 + n / 950));
const failure = (error, metadata = {}) => Object.freeze({ ...metadata, ok: false, error });

// Accept JSON-shaped records only, including null-prototype records. Reject
// inherited fields, unknown fields, symbols, and accessors without reading them.
function hasDataFields(value, keys) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const ownKeys = Reflect.ownKeys(value);
  if (ownKeys.length !== keys.length) return false;
  return keys.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && Object.hasOwn(descriptor, 'value');
  });
}

/**
 * C(n) = ceil(F(n) - F(0)), with C(0) = 0. Rounding is centralized here.
 * Zero is a mathematical reference; playable attributes are limited to 1–500.
 * Throws RangeError for unsupported/non-integer/non-finite inputs.
 */
export function attributeCumulativeCost(n) {
  if (!Number.isSafeInteger(n) || n < 0 || n > EXPERIENCE_POLICY.maxAttribute) {
    throw new RangeError('屬性累計成本只接受 0–500 的整數');
  }
  return Math.ceil(rawCumulative(n) - rawCumulative(0));
}

function allocatedFor(attributes) {
  if (!hasDataFields(attributes, ATTRIBUTE_KEYS)) return null;
  let allocated = 0;
  for (const key of ATTRIBUTE_KEYS) {
    const value = attributes[key];
    if (!Number.isSafeInteger(value) || value < EXPERIENCE_POLICY.minAttribute || value > EXPERIENCE_POLICY.maxAttribute) return null;
    allocated += attributeCumulativeCost(value);
  }
  return Number.isSafeInteger(allocated) ? allocated : null;
}

/** Create an explicit, fully funded candidate ledger; never invent EXP. */
export function createExperienceLedger(attributes, earned) {
  const allocated = allocatedFor(attributes);
  if (allocated === null) throw new TypeError('經驗帳本需要六項 1–500 的整數屬性');
  if (!safeAmount(earned)) throw new TypeError('累計 EXP 必須是非負安全整數');
  if (earned < allocated) throw new RangeError('累計 EXP 不足以支持目前屬性，不能自動補發');
  return {
    kind: 'experience-ledger',
    earned,
    allocated,
    unspent: earned - allocated,
    roundingPolicy: EXPERIENCE_POLICY.id,
  };
}

/** Strict non-mutating validation, suitable for rejecting malformed saves. */
export function validateExperienceLedger(attributes, ledger) {
  const allocated = allocatedFor(attributes);
  if (allocated === null || !hasDataFields(ledger, LEDGER_KEYS)) return false;
  if (ledger.kind !== 'experience-ledger' || ledger.roundingPolicy !== EXPERIENCE_POLICY.id) return false;
  if (![ledger.earned, ledger.allocated, ledger.unspent].every(safeAmount)) return false;
  return ledger.allocated === allocated && ledger.earned >= allocated && ledger.earned - allocated === ledger.unspent;
}

/**
 * Read-only quote. Positive cost spends EXP; negative cost refunds it.
 * Insufficient funds still return cost/from/to metadata, with ok: false.
 */
export function quoteAttributeChange(attributes, key, delta, unspent) {
  if (allocatedFor(attributes) === null) return failure('屬性資料無效');
  if (!ATTRIBUTE_KEYS.includes(key)) return failure('未知屬性');
  if (!EXPERIENCE_POLICY.allowedDeltas.includes(delta)) return failure('每次只可調整 ±1、±10 或 ±100 點');
  if (!safeAmount(unspent)) return failure('未配置 EXP 必須是非負安全整數');
  const from = attributes[key];
  const to = from + delta;
  if (to < EXPERIENCE_POLICY.minAttribute || to > EXPERIENCE_POLICY.maxAttribute) {
    return failure('本候選模型的屬性範圍為 1–500', { key, delta, from, to });
  }
  const cost = attributeCumulativeCost(to) - attributeCumulativeCost(from);
  const metadata = { key, delta, from, to, cost, unspentBefore: unspent, roundingPolicy: EXPERIENCE_POLICY.id };
  if (cost > unspent) return failure('未配置 EXP 不足', metadata);
  const unspentAfter = unspent - cost;
  if (!safeAmount(unspentAfter)) return failure('調整後 EXP 超出安全整數範圍', metadata);
  return Object.freeze({ ...metadata, ok: true, unspentAfter });
}

/**
 * Apply a quote atomically to ordinary data records. Failed requests mutate
 * nothing; earned is a lifetime counter and is never changed by allocation.
 * Battle restrictions and resource reconciliation belong to the caller.
 */
export function applyAttributeChange(attributes, ledger, key, delta) {
  if (!validateExperienceLedger(attributes, ledger)) return failure('經驗帳本無效或與屬性不一致');
  const quote = quoteAttributeChange(attributes, key, delta, ledger.unspent);
  if (!quote.ok) return quote;
  const nextAllocated = ledger.allocated + quote.cost;
  if (!safeAmount(nextAllocated) || ledger.earned - nextAllocated !== quote.unspentAfter) {
    return failure('調整後經驗帳本不守恆');
  }
  // Preflight all writes so frozen/sealed/read-only data cannot partly apply.
  const writes = [[attributes, key], [ledger, 'allocated'], [ledger, 'unspent']];
  if (!writes.every(([record, field]) => Object.getOwnPropertyDescriptor(record, field)?.writable === true)) {
    return failure('屬性或經驗帳本為唯讀');
  }
  attributes[key] = quote.to;
  ledger.allocated = nextAllocated;
  ledger.unspent = quote.unspentAfter;
  return quote;
}
