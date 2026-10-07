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

function inspectState(state, nowMs) {
  if (!epoch(nowMs)) return failure('invalid-time', 'Training 時間須為有效的非負整數毫秒');
  if (!plainData(state) || !ownFields(state, ['player', 'progression', 'training'])
    || !plainData(state.player) || !ownFields(state.player, ['level', 'credits'])
    || !amount(state.player.credits) || !Number.isSafeInteger(state.player.level)
    || state.player.level < TRAINING_POLICY.minLevel || state.player.level > TRAINING_POLICY.maxLevel
    || !plainData(state.progression) || !ownFields(state.progression, ['kind'])
    || !validateTrainingState(state.training)) {
    return failure('invalid-training-state', 'Training 帳本、角色等級或 Credits 資料無效');
  }
  if (state.progression.kind !== 'experience-ledger') {
    return failure('experience-profile-required', 'Training 僅限 EXP 帳本角色');
  }
  let activeBattle = false;
  if (Object.hasOwn(state, 'battle')) {
    const battle = state.battle;
    if (battle !== null && (!plainData(battle) || !Object.hasOwn(battle, 'status')
      || !['active', 'victory', 'defeat', 'fled'].includes(battle.status))) {
      return failure('invalid-battle-state', '戰鬥狀態格式錯誤');
    }
    activeBattle = battle !== null && battle.status === 'active';
  }
  const ledger = state.training;
  if (ledger.lastChangeAt !== null && nowMs < ledger.lastChangeAt
    || ledger.active !== null && nowMs < ledger.active.startedAt) {
    return failure('backwards-time', 'Training 時間早於最近一次變更，請檢查時鐘');
  }
  return { ok: true, ledger, player: state.player, activeBattle, nowMs };
}
function inspectRequest(state, nowMs, expectedRevision) {
  if (!revision(expectedRevision)) return failure('invalid-revision', 'Training 版本須為有效的非負安全整數');
  return inspectState(state, nowMs);
}
function newMutation(inspection, expectedRevision) {
  if (expectedRevision !== inspection.ledger.revision) return failure('stale-revision', 'Training 版本已變更，請重新確認');
  if (inspection.activeBattle) return failure('active-battle', '戰鬥中與波次暫停時不能變更 Training');
  if (inspection.ledger.revision >= TRAINING_POLICY.maxRevision) return failure('revision-overflow', 'Training 版本已達安全上限');
  return { ok: true };
}
function actionResult(ledger, { changed = false, duplicate = false, cost = 0, refund = 0, completedRanks = 0 } = {}) {
  return {
    ok: true, changed, duplicate, revision: ledger.revision, adeptRank: ledger.adeptRank,
    cost, refund, completedRanks, creditsDelta: refund - cost, expMultiplier: multiplier(ledger.adeptRank),
    active: copyJob(ledger.active), receipt: copyReceipt(ledger.lastAction),
  };
}
function replay(inspection, type, expectedRevision) {
  const { ledger } = inspection;
  if (ledger.revision === 0 || expectedRevision !== ledger.revision - 1) return null;
  if (ledger.lastAction.type !== type) return failure('payload-conflict', '這個 Training 版本已用於不同的行動');
  // nowMs is an observation clock, not an extra purchase payload. No debit,
  // refund, collection, combat check, or writable storage is needed for a replay.
  return actionResult(ledger, { duplicate: true });
}
function quoteStart(inspection, expectedRevision) {
  const fresh = newMutation(inspection, expectedRevision);
  if (!fresh.ok) return fresh;
  const { ledger, player, nowMs } = inspection;
  if (ledger.active !== null) return failure('training-active', '同一時間只能進行一項 Training');
  if (ledger.adeptRank >= TRAINING_POLICY.maxRank) return failure('rank-cap', 'Adept Learner 已達 300 級上限');
  if (nowMs > TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.durationMs) return failure('time-overflow', 'Training 完成時間超過可保存範圍');
  const quote = {
    ok: true, id: TRAINING_POLICY.id, costModel: TRAINING_POLICY.costModel,
    expectedRevision, revision: ledger.revision, fromRank: ledger.adeptRank, toRank: ledger.adeptRank + 1,
    cost: adeptTrainingCost(ledger.adeptRank), durationMs: TRAINING_POLICY.durationMs,
    startedAt: nowMs, endsAt: nowMs + TRAINING_POLICY.durationMs,
    expMultiplierBefore: multiplier(ledger.adeptRank), expMultiplierAfter: multiplier(ledger.adeptRank + 1),
  };
  return player.credits >= quote.cost ? quote : failure('insufficient-credits', 'Credits 不足', quote);
}
function receiptFor(type, ledger, job, nowMs) {
  return {
    type, expectedRevision: ledger.revision, fromRank: job.fromRank, paidCredits: job.paidCredits,
    startedAt: job.startedAt, endsAt: job.endsAt, at: nowMs,
  };
}
function nextLedger(ledger, type, job, nowMs) {
  return {
    model: ledger.model,
    adeptRank: ledger.adeptRank + (type === 'complete' ? 1 : 0),
    active: type === 'start' ? job : null,
    revision: ledger.revision + 1,
    lastAction: receiptFor(type, ledger, job, nowMs),
    lastChangeAt: nowMs,
  };
}
function commit(ledger, next, keys) {
  for (const key of keys) ledger[key] = next[key];
}

/** A fresh, read-only quote. A stale quote never silently becomes another rank. */
export function quoteAdeptTraining(state, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    return inspection.ok ? quoteStart(inspection, expectedRevision) : inspection;
  } catch { return failure('invalid-training-state', 'Training 預覽無法安全計算'); }
}

/** Debit once, then persist the exact one-hour job. No rank is granted here. */
export function startAdeptTraining(state, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'start', expectedRevision);
    if (repeated) return repeated;
    const quote = quoteStart(inspection, expectedRevision);
    if (!quote.ok) return quote;
    const { ledger, player } = inspection;
    if (!writable(player, ['credits']) || !writable(ledger, CHANGE_KEYS)) return failure('read-only', 'Training 帳本或 Credits 為唯讀');
    const job = { id: TRAINING_POLICY.id, fromRank: ledger.adeptRank, paidCredits: quote.cost, startedAt: nowMs, endsAt: quote.endsAt };
    const next = nextLedger(ledger, 'start', job, nowMs);
    const result = actionResult(next, { changed: true, cost: quote.cost });
    player.credits -= quote.cost;
    commit(ledger, next, CHANGE_KEYS);
    return result;
  } catch { return failure('invalid-training-state', 'Training 無法安全開始'); }
}

/** Full recorded refund only strictly before the deadline, with a single receipt. */
export function cancelAdeptTraining(state, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'cancel', expectedRevision);
    if (repeated) return repeated;
    const fresh = newMutation(inspection, expectedRevision);
    if (!fresh.ok) return fresh;
    const { ledger, player } = inspection;
    const job = ledger.active;
    if (job === null) return failure('no-active-training', '沒有可取消的 Training');
    if (nowMs >= job.endsAt) return failure('training-expired', 'Training 已到期，不可退款；請回到 Training 領取');
    if (player.credits > Number.MAX_SAFE_INTEGER - job.paidCredits) return failure('credits-overflow', '退款將超過 Credits 安全上限');
    if (!writable(player, ['credits']) || !writable(ledger, CHANGE_KEYS)) return failure('read-only', 'Training 帳本或 Credits 為唯讀');
    const next = nextLedger(ledger, 'cancel', job, nowMs);
    const result = actionResult(next, { changed: true, refund: job.paidCredits });
    player.credits += job.paidCredits;
    commit(ledger, next, CHANGE_KEYS);
    return result;
  } catch { return failure('invalid-training-state', 'Training 無法安全取消'); }
}

/** Only an explicit Training visit collects a finished job. Duplicate visits do nothing. */
export function visitTraining(state, nowMs) {
  try {
    const inspection = inspectState(state, nowMs);
    if (!inspection.ok) return inspection;
    const { ledger } = inspection;
    const job = ledger.active;
    if (job === null || nowMs < job.endsAt) return actionResult(ledger);
    const fresh = newMutation(inspection, ledger.revision);
    if (!fresh.ok) return fresh;
    const keys = [...CHANGE_KEYS, 'adeptRank'];
    if (!writable(ledger, keys)) return failure('read-only', 'Training 帳本為唯讀');
    const next = nextLedger(ledger, 'complete', job, nowMs);
    const result = actionResult(next, { changed: true, completedRanks: 1 });
    commit(ledger, next, keys);
    return result;
  } catch { return failure('invalid-training-state', 'Training 無法安全領取'); }
}

/** Detached presentation only. Passing time, viewing, and serializing never collect. */
export function getTrainingView(state, nowMs) {
  try {
    const inspection = inspectState(state, nowMs);
    if (!inspection.ok) return inspection;
    const { ledger, player, activeBattle } = inspection;
    const active = copyJob(ledger.active);
    const readyToComplete = active !== null && nowMs >= active.endsAt;
    const nextCost = ledger.adeptRank < TRAINING_POLICY.maxRank ? adeptTrainingCost(ledger.adeptRank) : null;
    const canChange = !activeBattle && ledger.revision < TRAINING_POLICY.maxRevision;
    return {
      ok: true, model: ledger.model, battleModel: TRAINING_POLICY.battleModel, costModel: TRAINING_POLICY.costModel,
      revision: ledger.revision, adeptRank: ledger.adeptRank, maxRank: TRAINING_POLICY.maxRank,
      expBonusPercent: ledger.adeptRank, expMultiplier: multiplier(ledger.adeptRank),
      nextCost, credits: player.credits, active, activeBattle, readyToComplete,
      status: active !== null ? (readyToComplete ? 'ready' : 'training') : nextCost === null ? 'capped' : 'idle',
      remainingMs: active === null ? 0 : Math.max(0, active.endsAt - nowMs),
      canStart: canChange && active === null && nextCost !== null && player.credits >= nextCost
        && nowMs <= TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.durationMs,
      canCancel: canChange && active !== null && !readyToComplete
        && player.credits <= Number.MAX_SAFE_INTEGER - active.paidCredits,
      canCollect: canChange && readyToComplete,
      warning: TRAINING_POLICY.candidateWarning,
    };
  } catch { return failure('invalid-training-state', 'Training 畫面資料無法安全讀取'); }
}
