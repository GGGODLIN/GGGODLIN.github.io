/** Frozen v1 Adept-only validation used solely for explicit save migration. */
/**
 * Bounded Adept Learner ledger. The caller supplies epoch milliseconds.
 * No clock, RNG, EXP, inventory, combat, stamina, or AP changes occur here.
 * See docs/TRAINING-LEDGER.md for source uncertainty and local boundaries.
 */
export const TRAINING_POLICY = Object.freeze({
  model: 'adept-training-candidate-v1',
  battleModel: 'adept-exp-candidate-v1',
  costModel: 'adept-printed-formula-r65215-candidate-v1',
  id: 'adeptLearner',
  maxRank: 300,
  durationMs: 3_600_000,
  expBonusPercentPerRank: 1,
  minLevel: 1,
  maxLevel: 500,
  maxEpochMs: 253_402_300_799_999,
  // An even terminal ceiling leaves room to settle every accepted start.
  maxRevision: Number.MAX_SAFE_INTEGER - 1,
  cancellationPolicy: 'full-refund-before-deadline-only-candidate-v1',
  collectionPolicy: 'training-page-visit-out-of-combat-candidate-v1',
  sources: Object.freeze({
    training: 'https://ehwiki.org/index.php?title=Training&oldid=65215',
    experience: 'https://ehwiki.org/index.php?title=Experience_Points&oldid=65116',
  }),
  candidateWarning: '候選規則：採用 Training 修訂 65215 印出的價格公式，末級與總價表略有差異；到期後不可退款，戰鬥系列結束後回到 Training 領取，下一場戰鬥才套用已完成等級。',
});

const LEDGER_KEYS = ['model', 'adeptRank', 'active', 'revision', 'lastAction', 'lastChangeAt'];
const JOB_KEYS = ['id', 'fromRank', 'paidCredits', 'startedAt', 'endsAt'];
const RECEIPT_KEYS = ['type', 'expectedRevision', 'fromRank', 'paidCredits', 'startedAt', 'endsAt', 'at'];
const CHANGE_KEYS = ['active', 'revision', 'lastAction', 'lastChangeAt'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const amount = value => Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0);
const epoch = value => amount(value) && value <= TRAINING_POLICY.maxEpochMs;
const rank = value => amount(value) && value <= TRAINING_POLICY.maxRank;
const revision = value => amount(value) && value <= TRAINING_POLICY.maxRevision;
const failure = (code, error, metadata = {}) => ({ ...metadata, ok: false, code, error });
const multiplier = value => 1 + value / 100;

// Descriptor-first: input accessors, symbols, hidden keys, and custom prototypes
// are rejected without invoking getters. Proxies are outside this JSON-data API.
function plainData(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  return Reflect.ownKeys(value).every(key => {
    if (typeof key !== 'string' || FORBIDDEN_KEYS.has(key)) return false;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor?.enumerable === true && Object.hasOwn(descriptor, 'value');
  });
}
function ownFields(value, keys) { return keys.every(key => Object.hasOwn(value, key)); }
function exactData(value, keys) {
  return plainData(value) && Reflect.ownKeys(value).length === keys.length && ownFields(value, keys);
}
function writable(value, keys) {
  return keys.every(key => Object.getOwnPropertyDescriptor(value, key)?.writable === true);
}
function copyJob(job) { return job === null ? null : { ...job }; }
function copyReceipt(receipt) { return receipt === null ? null : { ...receipt }; }

/** Price for completed rank N -> N+1. At the cap there is no purchasable rank. */
export function adeptTrainingCost(completedRank) {
  if (!rank(completedRank) || completedRank === TRAINING_POLICY.maxRank) {
    throw new RangeError('Adept Learner cost requires an integer rank from 0 through 299');
  }
  return Math.round((100 + 50 * completedRank) ** (1 + 0.000417446 * completedRank));
}

export function createTrainingState() {
  return { model: TRAINING_POLICY.model, adeptRank: 0, active: null, revision: 0, lastAction: null, lastChangeAt: null };
}

function validPaidJob(record) {
  return rank(record.fromRank) && record.fromRank < TRAINING_POLICY.maxRank
    && amount(record.paidCredits) && record.paidCredits === adeptTrainingCost(record.fromRank)
    && epoch(record.startedAt) && epoch(record.endsAt)
    && record.startedAt <= TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.durationMs
    && record.endsAt === record.startedAt + TRAINING_POLICY.durationMs
    // Each already collected rank required a full hour, with one job at a time.
    && record.startedAt >= record.fromRank * TRAINING_POLICY.durationMs;
}

/** Strict local ledger validation; balances, EXP validity and save migration belong to the engine. */
export function validateTrainingState(training) {
  try {
    if (!exactData(training, LEDGER_KEYS) || training.model !== TRAINING_POLICY.model
      || !rank(training.adeptRank) || !revision(training.revision)) return false;
    if (training.revision === 0) {
      return training.adeptRank === 0 && training.active === null
        && training.lastAction === null && training.lastChangeAt === null;
    }
    const receipt = training.lastAction;
    if (!exactData(receipt, RECEIPT_KEYS) || !validPaidJob(receipt)
      || !['start', 'cancel', 'complete'].includes(receipt.type)
      || !revision(receipt.expectedRevision) || receipt.expectedRevision !== training.revision - 1
      || !epoch(receipt.at) || receipt.at < receipt.startedAt
      || !epoch(training.lastChangeAt) || training.lastChangeAt !== receipt.at) return false;
    if (receipt.type === 'start') {
      const job = training.active;
      return training.revision % 2 === 1 && training.revision >= 2 * training.adeptRank + 1
        && exactData(job, JOB_KEYS) && job.id === TRAINING_POLICY.id && validPaidJob(job)
        && job.fromRank === training.adeptRank && receipt.at === job.startedAt
        && ['fromRank', 'paidCredits', 'startedAt', 'endsAt'].every(key => receipt[key] === job[key]);
    }
    if (training.active !== null || training.revision % 2 !== 0) return false;
    if (receipt.type === 'cancel') {
      return receipt.fromRank === training.adeptRank && receipt.at < receipt.endsAt
        && training.revision >= 2 * training.adeptRank + 2;
    }
    return receipt.fromRank + 1 === training.adeptRank && receipt.at >= receipt.endsAt
      && training.revision >= 2 * training.adeptRank;
  } catch { return false; }
}

