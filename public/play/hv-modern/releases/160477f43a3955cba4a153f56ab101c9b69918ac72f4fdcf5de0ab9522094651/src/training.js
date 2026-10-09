/**
 * Shared Adept Learner / Ability Boost / Manifest Destiny candidate ledger. The caller supplies epoch milliseconds.
 * No clock, RNG, EXP, inventory, combat, or stamina changes occur here.
 * Completed Ability Boost and Manifest Destiny ranks supply AP and Mastery entitlements elsewhere.
 * See docs/TRAINING-LEDGER.md for source uncertainty and local boundaries.
 */
import { validateTrainingState as validateLegacyTrainingState } from './compat/training-adept-v1.js';
import { validateTrainingState as validatePreviousTrainingState } from './compat/training-shared-v1.js';
import { validateTrainingState as validateLevelCappedTrainingState } from './compat/training-level-capped-v1.js';

export const MANIFEST_TRAINING_MODEL = 'manifest-training-candidate-v1';

export const TRAINING_POLICY = Object.freeze({
  model: MANIFEST_TRAINING_MODEL,
  levelCappedModel: 'level-capped-training-candidate-v1',
  previousModel: 'shared-training-candidate-v1',
  legacyModel: 'adept-training-candidate-v1',
  battleModel: 'adept-exp-candidate-v1',
  costModel: 'adept-printed-formula-r65215-candidate-v1',
  id: 'adeptLearner',
  maxRank: 300,
  durationMs: 3_600_000,
  expBonusPercentPerRank: 1,
  abilityBoost: Object.freeze({
    id: 'abilityBoost', maxRank: 500, cost: 100, durationMs: 7_200_000, apPerRank: 1,
    sourceMaxRank: 500, sourceCap: 'player-level', furtherRanks: 'none',
    costModel: 'ability-boost-printed-formula-r65215-candidate-v1',
  }),
  manifestDestiny: Object.freeze({
    id: 'manifestDestiny', maxRank: 10, cost: 1_000_000, durationMs: 86_400_000,
    masteryPerRank: 1, levelsPerRank: 50, sourceMaxRank: 10, sourceCap: 'floor-player-level-divided-by-50',
    furtherRanks: 'none', costModel: 'manifest-destiny-linear-formula-r65215-candidate-v1',
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
    mastery: 'https://ehwiki.org/index.php?title=Abilities&oldid=64891',
    levelGates: 'https://ehwiki.org/index.php?title=Leveling_Up&oldid=65211',
  }),
  candidateWarning: '候選規則：採用 Training 修訂 65215 印出的價格公式；Manifest Destiny 共 10 級，第 r 級需角色 Lv (50 × r)／(1,000,000 × r) Credits／24 小時，領取才增加 1 Mastery，不會自動續訓。Ability Boost 最多 500 級且不可超過角色等級，每級 2 小時／+1 AP，公式總價 109,521,466 Credits，舊翻譯表總價多 3 Credits。Adept 公式與末級、總價表略有差異；目前伺服器適用性未驗證。到期後不可退款，戰鬥系列結束後回到 Training 領取；Adept 於下一場戰鬥套用已完成等級。',
});

const LEDGER_KEYS = ['model', 'adeptRank', 'abilityBoostRank', 'manifestDestinyRank', 'active', 'revision', 'lastAction', 'lastChangeAt'];
const JOB_KEYS = ['id', 'fromRank', 'paidCredits', 'startedAt', 'endsAt'];
const RECEIPT_KEYS = ['type', 'id', 'expectedRevision', 'fromRank', 'paidCredits', 'startedAt', 'endsAt', 'at'];
const CHANGE_KEYS = ['active', 'revision', 'lastAction', 'lastChangeAt'];
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const amount = value => Number.isSafeInteger(value) && value >= 0 && !Object.is(value, -0);
const epoch = value => amount(value) && value <= TRAINING_POLICY.maxEpochMs;
const rank = value => amount(value) && value <= TRAINING_POLICY.maxRank;
const boostRank = value => amount(value) && value <= TRAINING_POLICY.abilityBoost.maxRank;
const manifestRank = value => amount(value) && value <= TRAINING_POLICY.manifestDestiny.maxRank;
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

/** Published candidate price for completed Boost rank N -> N+1 (N = 0..499).
 * Keep the printed constants unchanged: their 500-price sum is 109,521,466.
 * Older translated totals differ by 3 Credits; live-server applicability is unverified.
 */
export function abilityBoostTrainingCost(completedRank) {
  if (!boostRank(completedRank) || completedRank === TRAINING_POLICY.abilityBoost.maxRank) {
    throw new RangeError('Ability Boost cost requires an integer rank from 0 through 499');
  }
  return Math.round((100 + 100 * completedRank) ** (1 + 0.0005548607 * completedRank));
}

/** Exact linear price for the next of ten documented Manifest Destiny ranks. */
export function manifestDestinyTrainingCost(completedRank) {
  if (!manifestRank(completedRank) || completedRank === TRAINING_POLICY.manifestDestiny.maxRank) {
    throw new RangeError('Manifest Destiny cost requires an integer rank from 0 through 9');
  }
  return TRAINING_POLICY.manifestDestiny.cost * (completedRank + 1);
}

export function createTrainingState() {
  return { model: TRAINING_POLICY.model, adeptRank: 0, abilityBoostRank: 0, manifestDestinyRank: 0, active: null, revision: 0, lastAction: null, lastChangeAt: null };
}

function trainingSpec(id) {
  if (id === TRAINING_POLICY.id) return {
    id, rankKey: 'adeptRank', maxRank: TRAINING_POLICY.maxRank,
    durationMs: TRAINING_POLICY.durationMs, costModel: TRAINING_POLICY.costModel,
    cost: adeptTrainingCost,
  };
  if (id === TRAINING_POLICY.abilityBoost.id) return {
    ...TRAINING_POLICY.abilityBoost, rankKey: 'abilityBoostRank', cost: abilityBoostTrainingCost,
  };
  if (id === TRAINING_POLICY.manifestDestiny.id) return {
    ...TRAINING_POLICY.manifestDestiny, rankKey: 'manifestDestinyRank', cost: manifestDestinyTrainingCost,
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
      || !rank(training.adeptRank) || !boostRank(training.abilityBoostRank) || !manifestRank(training.manifestDestinyRank)
      || !revision(training.revision)) return false;
    const completed = training.adeptRank + training.abilityBoostRank + training.manifestDestinyRank;
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
      + training.manifestDestinyRank * TRAINING_POLICY.manifestDestiny.durationMs
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

/** Validate old data before a detached, grant-free migration. Never collect or refund. */
export function migrateTrainingState(training) {
  try {
    if (!validateLegacyTrainingState(training)) {
      return failure('invalid-training-state', '舊版 Training 帳本無效');
    }
    const migrated = {
      model: TRAINING_POLICY.model, adeptRank: training.adeptRank, abilityBoostRank: 0, manifestDestinyRank: 0,
      active: copyJob(training.active), revision: training.revision,
      lastAction: training.lastAction === null ? null : {
        ...training.lastAction, id: training.active?.id ?? TRAINING_POLICY.id,
      },
      lastChangeAt: training.lastChangeAt,
    };
    return validateTrainingState(migrated)
      ? { ok: true, training: migrated }
      : failure('invalid-training-state', 'Training 帳本無法安全升級');
  } catch { return failure('invalid-training-state', 'Training 帳本無法安全升級'); }
}

/** Upgrade the frozen first-rank format without collecting, repricing, or granting anything. */
export function migratePreviousTrainingState(training) {
  try {
    if (!validatePreviousTrainingState(training)) {
      return failure('invalid-training-state', '前版 Training 帳本無效');
    }
    const migrated = {
      ...training, model: TRAINING_POLICY.model, manifestDestinyRank: 0,
      active: copyJob(training.active), lastAction: copyReceipt(training.lastAction),
    };
    return validateTrainingState(migrated)
      ? { ok: true, training: migrated }
      : failure('invalid-training-state', 'Training 帳本無法安全升級');
  } catch { return failure('invalid-training-state', 'Training 帳本無法安全升級'); }
}

/** Upgrade the frozen level-capped format, preserving every paid job and receipt exactly. */
export function migrateLevelCappedTrainingState(training) {
  try {
    if (!validateLevelCappedTrainingState(training)) {
      return failure('invalid-training-state', '前版等級上限 Training 帳本無效');
    }
    const migrated = {
      ...training, model: TRAINING_POLICY.model, manifestDestinyRank: 0,
      active: copyJob(training.active), lastAction: copyReceipt(training.lastAction),
    };
    return validateTrainingState(migrated)
      ? { ok: true, training: migrated }
      : failure('invalid-training-state', 'Training 帳本無法安全升級');
  } catch { return failure('invalid-training-state', 'Training 帳本無法安全升級'); }
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
  if (state.training.abilityBoostRank > state.player.level
    || state.training.active?.id === TRAINING_POLICY.abilityBoost.id
      && state.training.active.fromRank + 1 > state.player.level) {
    return failure('invalid-training-state', 'Ability Boost 已完成或進行中的等級超過角色等級');
  }
  const manifestLevelCap = Math.floor(state.player.level / TRAINING_POLICY.manifestDestiny.levelsPerRank);
  if (state.training.manifestDestinyRank > manifestLevelCap
    || state.training.active?.id === TRAINING_POLICY.manifestDestiny.id
      && state.training.active.fromRank + 1 > manifestLevelCap) {
    return failure('invalid-training-state', 'Manifest Destiny 已完成或進行中的等級超過角色等級限制');
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
function actionResult(ledger, { changed = false, duplicate = false, cost = 0, refund = 0, completedRanks = 0, earnedAP = 0, earnedMastery = 0 } = {}) {
  return {
    ok: true, changed, duplicate, revision: ledger.revision, adeptRank: ledger.adeptRank,
    abilityBoostRank: ledger.abilityBoostRank, manifestDestinyRank: ledger.manifestDestinyRank, earnedAP, earnedMastery,
    cost, refund, completedRanks, creditsDelta: refund - cost, expMultiplier: multiplier(ledger.adeptRank),
    active: copyJob(ledger.active), receipt: copyReceipt(ledger.lastAction),
  };
}
function replay(inspection, type, id, expectedRevision) {
  const { ledger } = inspection;
  if (ledger.revision === 0 || expectedRevision !== ledger.revision - 1) return null;
  if (ledger.lastAction.type !== type || ledger.lastAction.id !== id) return failure('payload-conflict', '這個 Training 版本已用於不同的行動');
  // nowMs is an observation clock, not an extra purchase payload. No debit,
  // refund, collection, combat check, or writable storage is needed for a replay.
  return actionResult(ledger, { duplicate: true });
}
function quoteStart(inspection, id, expectedRevision) {
  const fresh = newMutation(inspection, expectedRevision);
  if (!fresh.ok) return fresh;
  const { ledger, player, nowMs } = inspection;
  if (ledger.active !== null) return failure('training-active', '同一時間只能進行一項 Training');
  const spec = trainingSpec(id);
  const fromRank = ledger[spec.rankKey];
  if (fromRank >= spec.maxRank) return failure('rank-cap', id === TRAINING_POLICY.id
    ? 'Adept Learner 已達 300 級上限' : id === TRAINING_POLICY.abilityBoost.id
      ? 'Ability Boost 已達 500 級上限' : 'Manifest Destiny 已達 10 級上限');
  if (id === TRAINING_POLICY.abilityBoost.id && fromRank >= player.level) {
    return failure('level-cap', 'Ability Boost 等級不可超過角色等級');
  }
  if (id === TRAINING_POLICY.manifestDestiny.id
    && (fromRank + 1) * TRAINING_POLICY.manifestDestiny.levelsPerRank > player.level) {
    return failure('level-cap', 'Manifest Destiny 每級需要角色提升 50 級');
  }
  if (nowMs > TRAINING_POLICY.maxEpochMs - spec.durationMs) return failure('time-overflow', 'Training 完成時間超過可保存範圍');
  const quote = {
    ok: true, id, costModel: spec.costModel,
    expectedRevision, revision: ledger.revision, fromRank, toRank: fromRank + 1,
    cost: spec.cost(fromRank), durationMs: spec.durationMs,
    startedAt: nowMs, endsAt: nowMs + spec.durationMs,
    expMultiplierBefore: multiplier(ledger.adeptRank),
    expMultiplierAfter: multiplier(ledger.adeptRank + (id === TRAINING_POLICY.id ? 1 : 0)),
    ...(id === TRAINING_POLICY.abilityBoost.id ? { earnedAP: 1 } : {}),
    ...(id === TRAINING_POLICY.manifestDestiny.id ? {
      earnedMastery: 1, requiredLevel: (fromRank + 1) * TRAINING_POLICY.manifestDestiny.levelsPerRank,
    } : {}),
  };
  return player.credits >= quote.cost ? quote : failure('insufficient-credits', 'Credits 不足', quote);
}
function receiptFor(type, ledger, job, nowMs) {
  return {
    type, id: job.id, expectedRevision: ledger.revision, fromRank: job.fromRank, paidCredits: job.paidCredits,
    startedAt: job.startedAt, endsAt: job.endsAt, at: nowMs,
  };
}
function nextLedger(ledger, type, job, nowMs) {
  return {
    model: ledger.model,
    adeptRank: ledger.adeptRank + (type === 'complete' && job.id === TRAINING_POLICY.id ? 1 : 0),
    abilityBoostRank: ledger.abilityBoostRank + (type === 'complete' && job.id === TRAINING_POLICY.abilityBoost.id ? 1 : 0),
    manifestDestinyRank: ledger.manifestDestinyRank + (type === 'complete' && job.id === TRAINING_POLICY.manifestDestiny.id ? 1 : 0),
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
    return inspection.ok ? quoteStart(inspection, TRAINING_POLICY.id, expectedRevision) : inspection;
  } catch { return failure('invalid-training-state', 'Training 預覽無法安全計算'); }
}

/** Debit once and persist the exact job. No rank is granted here. */
function startTraining(state, id, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'start', id, expectedRevision);
    if (repeated) return repeated;
    const quote = quoteStart(inspection, id, expectedRevision);
    if (!quote.ok) return quote;
    const { ledger, player } = inspection;
    if (!writable(player, ['credits']) || !writable(ledger, CHANGE_KEYS)) return failure('read-only', 'Training 帳本或 Credits 為唯讀');
    const job = { id, fromRank: quote.fromRank, paidCredits: quote.cost, startedAt: nowMs, endsAt: quote.endsAt };
    const next = nextLedger(ledger, 'start', job, nowMs);
    const result = actionResult(next, { changed: true, cost: quote.cost });
    player.credits -= quote.cost;
    commit(ledger, next, CHANGE_KEYS);
    return result;
  } catch { return failure('invalid-training-state', 'Training 無法安全開始'); }
}

/** Full recorded refund only strictly before the deadline, with a single receipt. */
function cancelTraining(state, id, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    if (!inspection.ok) return inspection;
    const repeated = replay(inspection, 'cancel', id, expectedRevision);
    if (repeated) return repeated;
    const fresh = newMutation(inspection, expectedRevision);
    if (!fresh.ok) return fresh;
    const { ledger, player } = inspection;
    const job = ledger.active;
    if (job === null) return failure('no-active-training', '沒有可取消的 Training');
    if (job.id !== id) return failure('training-kind-mismatch', '進行中的 Training 與取消要求不符');
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

/** A fresh Boost quote enforces the separate published 500-rank and player-level caps. */
export function quoteAbilityBoostTraining(state, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    return inspection.ok ? quoteStart(inspection, TRAINING_POLICY.abilityBoost.id, expectedRevision) : inspection;
  } catch { return failure('invalid-training-state', 'Training 預覽無法安全計算'); }
}
/** A Manifest Destiny quote requires the next fifty-level boundary and grants nothing. */
export function quoteManifestDestinyTraining(state, nowMs, expectedRevision) {
  try {
    const inspection = inspectRequest(state, nowMs, expectedRevision);
    return inspection.ok ? quoteStart(inspection, TRAINING_POLICY.manifestDestiny.id, expectedRevision) : inspection;
  } catch { return failure('invalid-training-state', 'Training 預覽無法安全計算'); }
}
export function startManifestDestinyTraining(state, nowMs, expectedRevision) {
  return startTraining(state, TRAINING_POLICY.manifestDestiny.id, nowMs, expectedRevision);
}
export function cancelManifestDestinyTraining(state, nowMs, expectedRevision) {
  return cancelTraining(state, TRAINING_POLICY.manifestDestiny.id, nowMs, expectedRevision);
}
export function startAdeptTraining(state, nowMs, expectedRevision) {
  return startTraining(state, TRAINING_POLICY.id, nowMs, expectedRevision);
}
export function startAbilityBoostTraining(state, nowMs, expectedRevision) {
  return startTraining(state, TRAINING_POLICY.abilityBoost.id, nowMs, expectedRevision);
}
export function cancelAdeptTraining(state, nowMs, expectedRevision) {
  return cancelTraining(state, TRAINING_POLICY.id, nowMs, expectedRevision);
}
export function cancelAbilityBoostTraining(state, nowMs, expectedRevision) {
  return cancelTraining(state, TRAINING_POLICY.abilityBoost.id, nowMs, expectedRevision);
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
    const keys = [...CHANGE_KEYS, trainingSpec(job.id).rankKey];
    if (!writable(ledger, keys)) return failure('read-only', 'Training 帳本為唯讀');
    const next = nextLedger(ledger, 'complete', job, nowMs);
    const result = actionResult(next, { changed: true, completedRanks: 1,
      earnedAP: job.id === TRAINING_POLICY.abilityBoost.id ? 1 : 0,
      earnedMastery: job.id === TRAINING_POLICY.manifestDestiny.id ? 1 : 0 });
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
    const abilityBoostNextCost = ledger.abilityBoostRank < TRAINING_POLICY.abilityBoost.maxRank
      ? abilityBoostTrainingCost(ledger.abilityBoostRank) : null;
    const abilityBoostLevelCap = Math.min(player.level, TRAINING_POLICY.abilityBoost.maxRank);
    const abilityBoostLevelLocked = abilityBoostNextCost !== null && ledger.abilityBoostRank >= abilityBoostLevelCap;
    const manifestDestinyNextCost = ledger.manifestDestinyRank < TRAINING_POLICY.manifestDestiny.maxRank
      ? manifestDestinyTrainingCost(ledger.manifestDestinyRank) : null;
    const manifestDestinyLevelCap = Math.min(Math.floor(player.level / TRAINING_POLICY.manifestDestiny.levelsPerRank), TRAINING_POLICY.manifestDestiny.maxRank);
    const manifestDestinyLevelLocked = manifestDestinyNextCost !== null && ledger.manifestDestinyRank >= manifestDestinyLevelCap;
    const canChange = !activeBattle && ledger.revision < TRAINING_POLICY.maxRevision;
    return {
      ok: true, model: ledger.model, battleModel: TRAINING_POLICY.battleModel, costModel: TRAINING_POLICY.costModel,
      revision: ledger.revision, adeptRank: ledger.adeptRank, maxRank: TRAINING_POLICY.maxRank,
      abilityBoostRank: ledger.abilityBoostRank, maxAbilityBoostRank: TRAINING_POLICY.abilityBoost.maxRank,
      manifestDestinyRank: ledger.manifestDestinyRank, maxManifestDestinyRank: TRAINING_POLICY.manifestDestiny.maxRank,
      manifestDestinyNextCost, manifestDestinyLevelCap, manifestDestinyLevelLocked,
      manifestDestinyNextLevel: manifestDestinyNextCost === null ? null : (ledger.manifestDestinyRank + 1) * TRAINING_POLICY.manifestDestiny.levelsPerRank,
      abilityBoostNextCost, abilityBoostLevelCap, abilityBoostLevelLocked, activeDurationMs: active === null ? 0 : active.endsAt - active.startedAt,
      expBonusPercent: ledger.adeptRank, expMultiplier: multiplier(ledger.adeptRank),
      nextCost, credits: player.credits, active, activeBattle, readyToComplete,
      status: active !== null ? (readyToComplete ? 'ready' : 'training') : nextCost === null ? 'capped' : 'idle',
      remainingMs: active === null ? 0 : Math.max(0, active.endsAt - nowMs),
      canStart: canChange && active === null && nextCost !== null && player.credits >= nextCost
        && nowMs <= TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.durationMs,
      canStartAbilityBoost: canChange && active === null && abilityBoostNextCost !== null
        && !abilityBoostLevelLocked && player.credits >= abilityBoostNextCost
        && nowMs <= TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.abilityBoost.durationMs,
      canStartManifestDestiny: canChange && active === null && manifestDestinyNextCost !== null
        && !manifestDestinyLevelLocked && player.credits >= manifestDestinyNextCost
        && nowMs <= TRAINING_POLICY.maxEpochMs - TRAINING_POLICY.manifestDestiny.durationMs,
      canCancel: canChange && active !== null && !readyToComplete
        && player.credits <= Number.MAX_SAFE_INTEGER - active.paidCredits,
      canCollect: canChange && readyToComplete,
      warning: TRAINING_POLICY.candidateWarning,
    };
  } catch { return failure('invalid-training-state', 'Training 畫面資料無法安全讀取'); }
}
