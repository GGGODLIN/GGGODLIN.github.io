/**
 * Bounded, local full-length Grindfest ledger. The caller owns combat, player
 * rewards, storage and randomness. No global clock or drop generator is used.
 * See docs/GRINDFEST-LEDGER.md for source and candidate-policy boundaries.
 */
import { validateActivityState, regenerateStamina, staminaStatus } from './arena.js';

const MODEL = 'grindfest-local-v1';
const TOTAL_ROUNDS = 1000;
const STATE_KEYS = ['model', 'entries', 'clears', 'current'];
const CURRENT_KEYS = ['battleId', 'enteredAt', 'entryStamina', 'status', 'completedRounds',
  'xpAwarded', 'staminaSpent', 'creditsAwarded', 'lastSettledAt', 'staminaAtSettlement', 'lastRound'];
const ROUND_KEYS = ['battleId', 'round', 'xp', 'staminaCost', 'staminaBefore', 'staminaAfter', 'staminaStatus', 'settledAt'];
const TERMINAL = ['victory', 'defeat', 'fled'];
const ENTRY_KEYS = ['battleId', 'nowMs'];
const ROUND_COMMAND_KEYS = ['battleId', 'round', 'monsters', 'nowMs'];
const SERIES_COMMAND_KEYS = ['battleId', 'status', 'nowMs'];
const ACTIVITY_WRITE_KEYS = ['stamina', 'lastRegenAt'];
const STATE_WRITE_KEYS = ['entries', 'clears', 'current'];

export const GRINDFEST_POLICY = Object.freeze({
  id: MODEL, status: 'bounded-local-candidate', rounds: TOTAL_ROUNDS, maxMonsters: 10,
  grindfestSource: 'https://ehwiki.org/index.php?title=Grindfest&oldid=65054',
  staminaSource: 'https://ehwiki.org/index.php?title=Stamina&oldid=65230',
  experienceSource: 'https://ehwiki.org/index.php?title=Experience_Points&oldid=65116',
  requiredStamina: 2, entryCost: 1, clearCredits: 5000, xpMultiplier: 1,
  greatStamina: 60, normalStamina: 1, greatRoundCost: 0.03, normalRoundCost: 0.02,
  recoveryPerHour: 1, externalBonuses: 0, difficultyMultiplier: 1,
  settlementOrder: 'regenerate-then-reward-then-consume-candidate',
  xpRoundingPolicy: 'ceil-sum-of-round-candidate', xpRoundingStatus: 'source-marked-uncertain',
  clock: 'caller-injected-local-epoch-ms-not-server-authoritative',
  monsterGeneration: 'caller-owned-authored-candidate', damageScaling: 'caller-owned-source-uncertain-candidate',
  regularDrops: 'deferred-not-implemented', crystals: 'deferred-not-implemented',
  bossRewards: 'deferred-not-implemented', riddlemaster: 'deferred-not-implemented',
  exhaustedRoundCost: 'baseline-0.02-capped-at-remaining-stamina-candidate',
});

const safeAmount = (value) => Number.isSafeInteger(value) && value >= 0;
const validTime = (value) => Number.isSafeInteger(value) && value >= 0 && value <= 253402300799999;
const validStamina = (value) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 99;
const rounded = (value) => Math.round(value * 1e9) / 1e9;
const failure = (code, error) => Object.freeze({ ok: false, code, error });
function ordinal(id) {
  if (typeof id !== 'string' || !/^grindfest-[1-9]\d*$/.test(id)) return null;
  const value = Number(id.slice(10));
  return Number.isSafeInteger(value) && id === `grindfest-${value}` ? value : null;
}
function dataRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const names = Reflect.ownKeys(value);
  if (names.length !== keys.length || !keys.every((key) => names.includes(key))) return false;
  return names.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return typeof key === 'string' && descriptor?.enumerable === true && Object.hasOwn(descriptor, 'value');
  });
}
function validMonsters(monsters) {
  if (!Array.isArray(monsters) || monsters.length < 1 || monsters.length > 10 ||
      Reflect.ownKeys(monsters).length !== monsters.length + 1) return false;
  for (let index = 0; index < monsters.length; index++) {
    const descriptor = Object.getOwnPropertyDescriptor(monsters, String(index));
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) return false;
    const monster = descriptor.value;
    if (!dataRecord(monster, ['level', 'powerLevel']) || !safeAmount(monster.level) || !safeAmount(monster.powerLevel)) return false;
  }
  return true;
}
const hasReservedArena = (activity) => Object.values(activity.attempts)
  .some((days) => Object.values(days).some((attempt) => attempt.status === 'reserved'));
const wonRoundCost = (stamina) => Math.min(stamina, stamina >= 60 ? 0.03 : 0.02);

export function createGrindfestState() {
  return { model: MODEL, entries: 0, clears: 0, current: null };
}

/** Validate strict, bounded JSON data without reading getters. */
export function validateGrindfestState(state) {
  if (!dataRecord(state, STATE_KEYS) || state.model !== MODEL || !safeAmount(state.entries) ||
      !safeAmount(state.clears) || state.clears > state.entries) return false;
  if (state.current === null) return state.entries === 0 && state.clears === 0;
  const current = state.current;
  if (!dataRecord(current, CURRENT_KEYS) || state.entries < 1 || ordinal(current.battleId) === null ||
      ordinal(current.battleId) < state.entries || !validTime(current.enteredAt) ||
      !validStamina(current.entryStamina) || current.entryStamina < 2 ||
      !['active', ...TERMINAL].includes(current.status) || !safeAmount(current.completedRounds) ||
      current.completedRounds > TOTAL_ROUNDS || !safeAmount(current.xpAwarded) ||
      !safeAmount(current.creditsAwarded) || !validTime(current.lastSettledAt) ||
      current.lastSettledAt < current.enteredAt || typeof current.staminaSpent !== 'number' ||
      !Number.isFinite(current.staminaSpent) || current.staminaSpent !== rounded(current.staminaSpent) ||
      current.staminaSpent < 1 || current.staminaSpent > rounded(1 + current.completedRounds * 0.03)) return false;
  if (current.completedRounds === 0) {
    if (current.lastRound !== null || current.xpAwarded !== 0 || current.staminaSpent !== 1) return false;
  } else {
    const receipt = current.lastRound;
    if (!dataRecord(receipt, ROUND_KEYS) || receipt.battleId !== current.battleId ||
        receipt.round !== current.completedRounds || !safeAmount(receipt.xp) || receipt.xp > current.xpAwarded ||
        !validTime(receipt.settledAt) || receipt.settledAt < current.enteredAt ||
        receipt.settledAt > current.lastSettledAt || !validStamina(receipt.staminaBefore) ||
        !validStamina(receipt.staminaAfter) || receipt.staminaStatus !== staminaStatus(receipt.staminaBefore)) return false;
    const cost = wonRoundCost(receipt.staminaBefore);
    if (receipt.staminaCost !== rounded(cost) || receipt.staminaAfter !== rounded(receipt.staminaBefore - cost) ||
        current.staminaSpent < rounded(1 + receipt.staminaCost) ||
        (receipt.staminaBefore < 1 && receipt.xp !== 0)) return false;
    if (current.completedRounds === 1 && (current.xpAwarded !== receipt.xp ||
        current.staminaSpent !== rounded(1 + receipt.staminaCost))) return false;
  }
  if (current.status === 'active') {
    return state.clears < state.entries && current.creditsAwarded === 0 && current.staminaAtSettlement === null &&
      current.lastSettledAt === (current.lastRound?.settledAt ?? current.enteredAt);
  }
  if (!validStamina(current.staminaAtSettlement)) return false;
  if (current.status === 'victory') {
    return state.clears >= 1 && current.completedRounds === TOTAL_ROUNDS &&
      current.creditsAwarded === (current.staminaAtSettlement < 1 ? 0 : 5000);
  }
  return state.clears < state.entries && current.completedRounds < TOTAL_ROUNDS && current.creditsAwarded === 0;
}

function validatePair(activity, state) {
  if (!validateActivityState(activity) || !validateGrindfestState(state) ||
      (state.current && state.current.lastSettledAt > activity.lastRegenAt)) {
    return failure('invalid-state', '活動或 Grindfest 紀錄無效');
  }
  return null;
}
function project(activity, nowMs, inBattle) {
  const next = structuredClone(activity);
  const result = regenerateStamina(next, nowMs, { inBattle });
  if (!result.ok) return result;
  if (result.clockBackwards) return failure('clock-backwards', '本機時間早於最近活動時間');
  return { ok: true, activity: next };
}
/** Preflight both records before either write. Nested records are replaced. */
function commit(activity, state, nextActivity, nextState) {
  const invalid = validatePair(nextActivity, nextState);
  if (invalid) return invalid;
  if (!ACTIVITY_WRITE_KEYS.every((key) => Object.getOwnPropertyDescriptor(activity, key)?.writable === true) ||
      !STATE_WRITE_KEYS.every((key) => Object.getOwnPropertyDescriptor(state, key)?.writable === true)) {
    return failure('read-only', '活動或 Grindfest 紀錄為唯讀，未套用任何變更');
  }
  for (const key of ACTIVITY_WRITE_KEYS) activity[key] = nextActivity[key];
  for (const key of STATE_WRITE_KEYS) state[key] = nextState[key];
  return null;
}
function viewFailure(code, reason) {
  return Object.freeze({ ok: false, ...GRINDFEST_POLICY, eligible: false, available: false, disabled: true,
    code, reason, reasons: Object.freeze([Object.freeze({ code, reason })]), stamina: null,
    staminaAfterEntry: null, staminaStatus: null, nextCredits: 5000 });
}

/** Preview/cancel never charges entry or applies projected regeneration. */
export function previewGrindfest(activity, state, nowMs) {
  const invalid = validatePair(activity, state);
  if (invalid) return viewFailure(invalid.code, invalid.error);
  if (!validTime(nowMs)) return viewFailure('invalid-time', '時間資料無效');
  const projected = project(activity, nowMs, false);
  if (!projected.ok) return viewFailure(projected.code, projected.error);
  const reasons = [];
  if (state.current?.status === 'active') reasons.push({ code: 'grindfest-in-progress', reason: '先結束目前的 Grindfest 挑戰' });
  if (hasReservedArena(activity)) reasons.push({ code: 'arena-in-progress', reason: '先結束目前的競技場挑戰' });
  if (projected.activity.stamina < 2) reasons.push({ code: 'stamina-required', reason: '開始戰鬥需要至少 2 點耐力' });
  return Object.freeze({ ok: true, ...GRINDFEST_POLICY, eligible: reasons.length === 0,
    available: reasons.length === 0, disabled: reasons.length > 0, code: reasons[0]?.code ?? null,
    reason: reasons[0]?.reason ?? '', reasons: Object.freeze(reasons.map(Object.freeze)),
    stamina: projected.activity.stamina, staminaAfterEntry: rounded(Math.max(0, projected.activity.stamina - 1)),
    staminaStatus: staminaStatus(projected.activity.stamina), nextCredits: 5000 });
}

/** Reserve once, charging one stamina immediately, with no daily entry limit. */
export function reserveGrindfest(activity, state, command = {}) {
  const invalid = validatePair(activity, state);
  if (invalid) return invalid;
  if (!dataRecord(command, ENTRY_KEYS)) return failure('invalid-command', '入場指令資料無效');
  const { battleId, nowMs } = command;
  if (ordinal(battleId) === null || (state.current && ordinal(battleId) <= ordinal(state.current.battleId))) {
    return failure('invalid-battle', '新的 Grindfest 識別碼必須是較新的 grindfest-N');
  }
  const view = previewGrindfest(activity, state, nowMs);
  if (!view.eligible) return failure(view.code, view.reason);
  const entries = state.entries + 1;
  if (!safeAmount(entries)) return failure('entry-overflow', '入場次數超出安全整數範圍');
  const projected = project(activity, nowMs, false);
  if (!projected.ok) return projected;
  const next = structuredClone(state);
  next.entries = entries;
  next.current = { battleId, enteredAt: nowMs, entryStamina: projected.activity.stamina, status: 'active',
    completedRounds: 0, xpAwarded: 0, staminaSpent: 1, creditsAwarded: 0,
    lastSettledAt: nowMs, staminaAtSettlement: null, lastRound: null };
  projected.activity.stamina = rounded(projected.activity.stamina - 1);
  const blocked = commit(activity, state, projected.activity, next);
  return blocked || Object.freeze({ ok: true, duplicate: false, battleId, enteredAt: nowMs,
    staminaBefore: next.current.entryStamina, stamina: projected.activity.stamina,
    staminaAfter: projected.activity.stamina, staminaCost: 1, xp: 0, credits: 0, equipmentDropCount: 0 });
}

function settlementInput(activity, state, command, keys) {
  const invalid = validatePair(activity, state);
  if (invalid) return invalid;
  if (!dataRecord(command, keys)) return failure('invalid-command', '結算指令資料無效');
  if (ordinal(command.battleId) === null) return failure('invalid-battle', 'Grindfest 戰鬥識別資料無效');
  if (!validTime(command.nowMs)) return failure('invalid-time', '時間資料無效');
  if (command.battleId !== state.current?.battleId) return failure('stale-battle', '不是目前保留的 Grindfest 挑戰');
  if (hasReservedArena(activity)) return failure('arena-in-progress', '競技場挑戰進行中，不能結算 Grindfest');
  return null;
}
function experience(monsters, stamina) {
  const multiplier = stamina >= 60 ? 2 : stamina >= 1 ? 1 : 0;
  const rawXp = monsters.reduce((sum, monster) => sum +
    (3 + Math.min(300, Math.max(1, monster.level)) ** 1.193 / 6) * (1 + monster.powerLevel / 500) * multiplier, 0);
  const xp = Math.ceil(rawXp);
  if (!safeAmount(xp)) return failure('xp-overflow', '本輪 EXP 超出安全整數範圍');
  return { ok: true, xp };
}

/** Only won rounds settle; one retained receipt provides bounded retry safety. */
export function settleGrindfestRound(activity, state, command = {}) {
  const invalid = settlementInput(activity, state, command, ROUND_COMMAND_KEYS);
  if (invalid) return invalid;
  const { battleId, round, monsters, nowMs } = command;
  if (!Number.isSafeInteger(round) || round < 1 || round > TOTAL_ROUNDS) return failure('invalid-round', 'Grindfest 回合超出範圍');
  if (!validMonsters(monsters)) return failure('invalid-monsters', 'Grindfest 怪物 EXP 輸入必須是 1–10 筆完整資料');
  const current = state.current;
  if (current.lastRound?.round === round) {
    return Object.freeze({ ...current.lastRound, ok: true, duplicate: true, originalXp: current.lastRound.xp,
      xp: 0, staminaCost: 0, credits: 0, equipmentDropCount: 0 });
  }
  if (round <= current.completedRounds) return failure('stale-round', '舊回合已結算且收據已移除，不可再次領獎');
  if (current.status !== 'active') return failure('not-active', 'Grindfest 挑戰已結束');
  if (round !== current.completedRounds + 1) return failure('round-order', '必須依序結算每一回合');
  const projected = project(activity, nowMs, true);
  if (!projected.ok) return projected;
  const reward = experience(monsters, projected.activity.stamina);
  if (!reward.ok) return reward;
  const totalXp = current.xpAwarded + reward.xp;
  if (!safeAmount(totalXp)) return failure('xp-overflow', '累積 EXP 超出安全整數範圍');
  const cost = wonRoundCost(projected.activity.stamina);
  const receipt = { battleId, round, xp: reward.xp, staminaCost: rounded(cost),
    staminaBefore: projected.activity.stamina, staminaAfter: rounded(projected.activity.stamina - cost),
    staminaStatus: staminaStatus(projected.activity.stamina), settledAt: nowMs };
  const next = structuredClone(state);
  next.current = { ...next.current, completedRounds: round, xpAwarded: totalXp,
    staminaSpent: rounded(current.staminaSpent + receipt.staminaCost), lastSettledAt: nowMs, lastRound: receipt };
  projected.activity.stamina = receipt.staminaAfter;
  const blocked = commit(activity, state, projected.activity, next);
  return blocked || Object.freeze({ ...receipt, ok: true, duplicate: false, credits: 0,
    equipmentDropCount: 0, roundingPolicy: GRINDFEST_POLICY.xpRoundingPolicy });
}

function terminalResult(current, duplicate) {
  return Object.freeze({ ok: true, duplicate, battleId: current.battleId, status: current.status,
    completedRounds: current.completedRounds, credits: duplicate ? 0 : current.creditsAwarded,
    ...(duplicate ? { originalCredits: current.creditsAwarded } : {}), xp: 0, staminaCost: 0,
    staminaAtSettlement: current.staminaAtSettlement, settledAt: current.lastSettledAt,
    equipmentDropCount: 0, pendingGuaranteedEquipment: false, lootStatus: 'deferred-not-implemented' });
}

/** Full 1000-round clear pays 5000 credits once unless exhausted at settlement. */
export function settleGrindfestSeries(activity, state, command = {}) {
  const invalid = settlementInput(activity, state, command, SERIES_COMMAND_KEYS);
  if (invalid) return invalid;
  const { status, nowMs } = command;
  if (!TERMINAL.includes(status)) return failure('invalid-result', 'Grindfest 結果無效');
  const current = state.current;
  if (current.status !== 'active') {
    return status === current.status ? terminalResult(current, true) : failure('battle-conflict', '結算結果與原紀錄不一致');
  }
  if (status === 'victory' && current.completedRounds !== TOTAL_ROUNDS) return failure('incomplete-grindfest', '必須完成全部 1000 回合才可領取通關獎勵');
  if (status !== 'victory' && current.completedRounds === TOTAL_ROUNDS) return failure('already-won', '全部回合已完成，不能改記為敗北或逃離');
  const projected = project(activity, nowMs, true);
  if (!projected.ok) return projected;
  const clears = state.clears + (status === 'victory' ? 1 : 0);
  if (!safeAmount(clears)) return failure('clear-overflow', '通關次數超出安全整數範圍');
  const next = structuredClone(state);
  next.clears = clears;
  next.current = { ...next.current, status, creditsAwarded: status === 'victory' && projected.activity.stamina >= 1 ? 5000 : 0,
    lastSettledAt: nowMs, staminaAtSettlement: projected.activity.stamina };
  const blocked = commit(activity, state, projected.activity, next);
  return blocked || terminalResult(next.current, false);
}
