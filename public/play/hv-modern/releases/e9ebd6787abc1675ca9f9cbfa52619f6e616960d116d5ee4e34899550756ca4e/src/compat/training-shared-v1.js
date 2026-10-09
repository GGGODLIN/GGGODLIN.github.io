/** Frozen shared v1 first-rank validation, solely for explicit save migration. */
/**
 * Bounded shared Adept Learner / first-rank Ability Boost ledger. The caller supplies epoch milliseconds.
 * No clock, RNG, EXP, inventory, combat, or stamina changes occur here.
 * Completed Ability Boost rank is the AP entitlement; AP is derived elsewhere.
 * See docs/TRAINING-LEDGER.md for source uncertainty and local boundaries.
 */

export const TRAINING_POLICY = Object.freeze({
  model: 'shared-training-candidate-v1',
  legacyModel: 'adept-training-candidate-v1',
  battleModel: 'adept-exp-candidate-v1',
  costModel: 'adept-printed-formula-r65215-candidate-v1',
  id: 'adeptLearner',
  maxRank: 300,
  durationMs: 3_600_000,
  expBonusPercentPerRank: 1,
  abilityBoost: Object.freeze({
    id: 'abilityBoost', maxRank: 1, cost: 100, durationMs: 7_200_000, apPerRank: 1,
    sourceMaxRank: 500, sourceCap: 'player-level', furtherRanks: 'deferred',
    costModel: 'ability-boost-first-rank-r65215-candidate-v1',
  }),
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
  candidateWarning: '候選規則：Adept 採用 Training 修訂 65215 印出的價格公式，末級與總價表略有差異；Ability Boost 僅實作首級（100 Credits／2 小時／+1 AP），後續階級暫緩。到期後不可退款，戰鬥系列結束後回到 Training 領取；Adept 於下一場戰鬥套用已完成等級。',
});

const LEDGER_KEYS = ['model', 'adeptRank', 'abilityBoostRank', 'active', 'revision', 'lastAction', 'lastChangeAt'];
const JOB_KEYS = ['id', 'fromRank', 'paidCredits', 'startedAt', 'endsAt'];
const RECEIPT_KEYS = ['type', 'id', 'expectedRevision', 'fromRank', 'paidCredits', 'startedAt', 'endsAt', 'at'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const amount = value => Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0);
const epoch = value => amount(value) && value <= TRAINING_POLICY.maxEpochMs;
const rank = value => amount(value) && value <= TRAINING_POLICY.maxRank;
const boostRank = value => amount(value) && value <= TRAINING_POLICY.abilityBoost.maxRank;
const revision = value => amount(value) && value <= TRAINING_POLICY.maxRevision;

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

/** Price for completed rank N -> N+1. At the cap there is no purchasable rank. */
export function adeptTrainingCost(completedRank) {
  if (!rank(completedRank) || completedRank === TRAINING_POLICY.maxRank) {
    throw new RangeError('Adept Learner cost requires an integer rank from 0 through 299');
  }
  return Math.round((100 + 50 * completedRank) ** (1 + 0.000417446 * completedRank));
}

export function createTrainingState() {
  return { model: TRAINING_POLICY.model, adeptRank: 0, abilityBoostRank: 0, active: null, revision: 0, lastAction: null, lastChangeAt: null };
}

function trainingSpec(id) {
  if (id === TRAINING_POLICY.id) return {
    id, rankKey: 'adeptRank', maxRank: TRAINING_POLICY.maxRank,
    durationMs: TRAINING_POLICY.durationMs, costModel: TRAINING_POLICY.costModel,
    cost: adeptTrainingCost,
  };
  if (id === TRAINING_POLICY.abilityBoost.id) return {
    ...TRAINING_POLICY.abilityBoost, rankKey: 'abilityBoostRank', cost: () => TRAINING_POLICY.abilityBoost.cost,
  };
  return null;
}
function validPaidJob(record) {
  const spec = trainingSpec(record.id);
  return spec !== null && amount(record.fromRank) && record.fromRank < spec.maxRank
    && amount(record.paidCredits) && record.paidCredits === spec.cost(record.fromRank)
    && epoch(record.startedAt) && epoch(record.endsAt)
    && record.startedAt <= TRAINING_POLICY.maxEpochMs - spec.durationMs
    && record.endsAt === record.startedAt + spec.durationMs;
}

/** Strict local ledger validation; balances and full save validity belong to the engine. */
export function validateTrainingState(training) {
  try {
    if (!exactData(training, LEDGER_KEYS) || training.model !== TRAINING_POLICY.model
      || !rank(training.adeptRank) || !boostRank(training.abilityBoostRank)
      || !revision(training.revision)) return false;
    const completed = training.adeptRank + training.abilityBoostRank;
    if (training.revision === 0) {
      return completed === 0 && training.active === null
        && training.lastAction === null && training.lastChangeAt === null;
    }
    const receipt = training.lastAction;
    if (!exactData(receipt, RECEIPT_KEYS) || !validPaidJob(receipt)
      || !['start', 'cancel', 'complete'].includes(receipt.type)
      || !revision(receipt.expectedRevision) || receipt.expectedRevision !== training.revision - 1
      || !epoch(receipt.at) || receipt.at < receipt.startedAt
      || !epoch(training.lastChangeAt) || training.lastChangeAt !== receipt.at) return false;
    const spec = trainingSpec(receipt.id);
    const currentRank = training[spec.rankKey];
    // The last completed job was not part of the ranks owned when it started.
    const completedBeforeMs = training.adeptRank * TRAINING_POLICY.durationMs
      + training.abilityBoostRank * TRAINING_POLICY.abilityBoost.durationMs
      - (receipt.type === 'complete' ? spec.durationMs : 0);
    if (completedBeforeMs < 0 || receipt.startedAt < completedBeforeMs) return false;
    if (receipt.type === 'start') {
      const job = training.active;
      return training.revision % 2 === 1 && training.revision >= 2 * completed + 1
        && exactData(job, JOB_KEYS) && validPaidJob(job)
        && job.fromRank === currentRank && receipt.at === job.startedAt
        && JOB_KEYS.every(key => receipt[key] === job[key]);
    }
    if (training.active !== null || training.revision % 2 !== 0) return false;
    if (receipt.type === 'cancel') {
      return receipt.fromRank === currentRank && receipt.at < receipt.endsAt
        && training.revision >= 2 * completed + 2;
    }
    return receipt.fromRank + 1 === currentRank && receipt.at >= receipt.endsAt
      && training.revision >= 2 * completed;
  } catch { return false; }
}

