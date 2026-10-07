/**
 * Bounded, local early-Arena candidate. No player/EXP-ledger, combat, storage,
 * random, or global-clock side effects. See docs/ARENA.md for source boundaries.
 */

import { validateActivityState as validateSchema1Activity } from './compat/arena-schema1.js';

const arenaSource = 'https://ehwiki.org/index.php?title=Arena&oldid=64924';
const staminaSource = 'https://ehwiki.org/index.php?title=Stamina&oldid=65230';
const experienceSource = 'https://ehwiki.org/index.php?title=Experience_Points&oldid=65116';
const dawnSource = 'https://ehwiki.org/index.php?title=Dawn_of_a_New_Day&oldid=59286';
const HOUR = 3_600_000;
const RETENTION_MODEL = 'bounded-arena-v1';
const STATE_KEYS = ['stamina', 'lastRegenAt', 'attempts', 'clears', 'settledRounds', 'settledSeries', 'retentionModel', 'archivedClears', 'currentBattleId'];
const ATTEMPT_KEYS = ['entryDay', 'enteredAt', 'battleId', 'status'];
const ROUND_KEYS = ['battleId', 'arenaId', 'entryDay', 'round', 'xp', 'staminaCost', 'staminaBefore', 'staminaAfter', 'staminaStatus', 'settledAt'];
const SERIES_KEYS = ['battleId', 'arenaId', 'entryDay', 'status', 'credits', 'firstClear', 'staminaAtSettlement', 'settledAt'];
const TERMINAL = ['victory', 'defeat', 'fled'];

export const ARENA_POLICY = Object.freeze({
  id: 'early-arena-local-candidate-v1', status: 'bounded-candidate',
  arenaSource, staminaSource, experienceSource, dawnSource,
  maxStamina: 99, entryStamina: 2, greatStamina: 60, exhaustedBelow: 1,
  initialStamina: 99, initialStaminaStatus: 'authored-fresh-profile',
  recoveryPerHour: 1, regenerationPolicy: 'continuous-local-clock-candidate',
  settlementOrder: 'regenerate-then-reward-then-consume-candidate',
  xpRoundingPolicy: 'ceil-sum-of-round-candidate', xpRoundingStatus: 'source-marked-uncertain',
  clock: 'caller-injected-local-epoch-ms-not-server-authoritative',
  externalBonuses: 0, difficultyMultiplier: 1, riddlemasterPenalty: 'not-implemented',
  guaranteedEquipment: 'one-clear-drop-caller-authored-fixture', monsterDrops: 'pending-not-implemented',
});

function definition(id, name, minLevel, maxLevelExclusive, roundCounts, firstCredits, repeatCredits, revision) {
  return Object.freeze({
    id, name, minLevel, maxLevelExclusive, roundCounts: Object.freeze(roundCounts),
    rounds: roundCounts.length, monsterCount: roundCounts.reduce((sum, count) => sum + count, 0),
    firstCredits, repeatCredits, xpMultiplier: 1, source: arenaSource,
    detailSource: `https://ehwiki.org/index.php?title=${name.replaceAll(' ', '_')}&oldid=${revision}`,
    status: 'sourced-early-arena-candidate',
  });
}

export const ARENAS = Object.freeze([
  definition('first-blood', 'First Blood', 1, 140, [1, 1], 100, 20, 55263),
  definition('learning-curves', 'Learning Curves', 10, 150, [1, 1, 2, 2], 1000, 200, 55262),
  definition('graduation', 'Graduation', 20, 165, [2, 2, 2, 2, 3, 3], 2000, 400, 55261),
]);

const findArena = (id) => ARENAS.find((arena) => arena.id === id);
const safeAmount = (n) => Number.isSafeInteger(n) && n >= 0;
// An explicit local format boundary keeps UTC day keys four-digit ISO years.
const validTime = (n) => Number.isSafeInteger(n) && n >= 0 && n <= 253402300799999;
const validLevel = (n) => Number.isSafeInteger(n) && n >= 1 && n <= 500;
const battleOrdinal = (id) => typeof id === 'string' && /^arena-[1-9]\d*$/.test(id) &&
  Number.isSafeInteger(Number(id.slice(6))) ? Number(id.slice(6)) : null;
const validId = (id) => battleOrdinal(id) !== null;
const validStamina = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 99;
const failure = (code, error) => Object.freeze({ ok: false, code, error });
const roundStamina = (n) => Math.round(n * 1e9) / 1e9;

function dataRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const names = Reflect.ownKeys(value);
  if (keys && (names.length !== keys.length || !keys.every((key) => names.includes(key)))) return false;
  return names.every((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return typeof key === 'string' && descriptor.enumerable && Object.hasOwn(descriptor, 'value');
  });
}
function dataArray(value) {
  return Array.isArray(value) && Reflect.ownKeys(value).length === value.length + 1 &&
    Array.from({ length: value.length }, (_, i) => Object.getOwnPropertyDescriptor(value, String(i)))
      .every((descriptor) => descriptor && Object.hasOwn(descriptor, 'value'));
}
function validDay(day) {
  if (typeof day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return false;
  const ms = Date.parse(`${day}T00:00:00.000Z`);
  return validTime(ms) && utcDay(ms) === day;
}
function openAttempts(activity) {
  return Object.entries(activity.attempts).flatMap(([arenaId, days]) =>
    Object.values(days).filter((attempt) => attempt.status === 'reserved').map((attempt) => ({ arenaId, ...attempt })));
}

export function utcDay(nowMs) {
  if (!validTime(nowMs)) throw new RangeError('時間必須是有效的本機 Unix 毫秒時間');
  return new Date(nowMs).toISOString().slice(0, 10);
}

export function createActivityState(nowMs) {
  utcDay(nowMs);
  return { stamina: 99, lastRegenAt: nowMs, attempts: {}, clears: {}, settledRounds: [], settledSeries: [],
    retentionModel: RETENTION_MODEL, archivedClears: {}, currentBattleId: null };
}

/** Strict bounded JSON-data validation, including every retained audit link. */
export function validateActivityState(activity) {
  if (!dataRecord(activity, STATE_KEYS) || activity.retentionModel !== RETENTION_MODEL ||
      !validStamina(activity.stamina) || !validTime(activity.lastRegenAt) ||
      !dataRecord(activity.attempts) || !dataRecord(activity.clears) || !dataRecord(activity.archivedClears) ||
      !dataArray(activity.settledRounds) || !dataArray(activity.settledSeries) ||
      activity.settledRounds.length > Math.max(...ARENAS.map((arena) => arena.rounds)) ||
      activity.settledSeries.length > 1) return false;
  if (activity.currentBattleId === null) return Object.keys(activity.attempts).length === 0 &&
    Object.keys(activity.clears).length === 0 && Object.keys(activity.archivedClears).length === 0 &&
    activity.settledRounds.length === 0 && activity.settledSeries.length === 0;
  const currentOrdinal = battleOrdinal(activity.currentBattleId);
  if (currentOrdinal === null) return false;
  const attemptByBattle = new Map();
  let pending = 0;
  for (const [arenaId, days] of Object.entries(activity.attempts)) {
    if (!findArena(arenaId) || !dataRecord(days) || Object.keys(days).length !== 1) return false;
    for (const [day, attempt] of Object.entries(days)) {
      if (!validDay(day) || !dataRecord(attempt, ATTEMPT_KEYS) || attempt.entryDay !== day ||
          !validTime(attempt.enteredAt) || attempt.enteredAt > activity.lastRegenAt || utcDay(attempt.enteredAt) !== day ||
          !['reserved', ...TERMINAL].includes(attempt.status) || !validId(attempt.battleId) ||
          battleOrdinal(attempt.battleId) > currentOrdinal || attemptByBattle.has(attempt.battleId)) return false;
      if (attempt.status === 'reserved') {
        if (attempt.battleId !== activity.currentBattleId) return false;
        pending++;
      }
      attemptByBattle.set(attempt.battleId, { arenaId, ...attempt });
    }
  }
  const currentAttempt = attemptByBattle.get(activity.currentBattleId);
  if (!currentAttempt || pending > 1 || [...attemptByBattle.values()].some((attempt) =>
      attempt.enteredAt > currentAttempt.enteredAt)) return false;
  const arena = findArena(currentAttempt.arenaId);
  const rounds = activity.settledRounds;
  for (let index = 0; index < rounds.length; index++) {
    const receipt = rounds[index];
    if (!dataRecord(receipt, ROUND_KEYS) || receipt.battleId !== activity.currentBattleId ||
        receipt.arenaId !== currentAttempt.arenaId || receipt.entryDay !== currentAttempt.entryDay ||
        receipt.round !== index + 1 || receipt.round > arena.rounds ||
        !safeAmount(receipt.xp) || !validTime(receipt.settledAt) ||
        receipt.settledAt < (rounds[index - 1]?.settledAt ?? currentAttempt.enteredAt) ||
        receipt.settledAt > activity.lastRegenAt || !validStamina(receipt.staminaBefore) ||
        !validStamina(receipt.staminaAfter) || receipt.staminaStatus !== staminaStatus(receipt.staminaBefore)) return false;
    const expectedCost = Math.min(receipt.staminaBefore, receipt.staminaBefore >= 60 ? 0.03 : 0.02);
    if (receipt.staminaCost !== roundStamina(expectedCost) ||
        receipt.staminaAfter !== roundStamina(receipt.staminaBefore - expectedCost) ||
        (receipt.staminaBefore < 1 && receipt.xp !== 0)) return false;
  }
  const terminal = activity.settledSeries[0];
  if ((currentAttempt.status !== 'reserved') !== (activity.settledSeries.length === 1)) return false;
  if (activity.settledSeries.length === 1) {
    if (!dataRecord(terminal, SERIES_KEYS) || terminal.battleId !== activity.currentBattleId ||
        terminal.arenaId !== currentAttempt.arenaId || terminal.entryDay !== currentAttempt.entryDay ||
        terminal.status !== currentAttempt.status || !TERMINAL.includes(terminal.status) ||
        !safeAmount(terminal.credits) || typeof terminal.firstClear !== 'boolean' ||
        !validStamina(terminal.staminaAtSettlement) || !validTime(terminal.settledAt) ||
        terminal.settledAt < (rounds.at(-1)?.settledAt ?? currentAttempt.enteredAt) ||
        terminal.settledAt > activity.lastRegenAt) return false;
    if (terminal.status === 'victory') {
      if (rounds.length !== arena.rounds || terminal.firstClear !== !activity.archivedClears[arena.id]) return false;
      const expected = terminal.staminaAtSettlement < 1 ? 0 : terminal.firstClear ? arena.firstCredits : arena.repeatCredits;
      if (terminal.credits !== expected) return false;
    } else if (terminal.credits !== 0 || terminal.firstClear || rounds.length === arena.rounds) return false;
  }
  for (const counters of [activity.clears, activity.archivedClears]) {
    if (!Object.entries(counters).every(([arenaId, count]) => findArena(arenaId) && safeAmount(count) && count > 0 &&
        Object.hasOwn(activity.attempts, arenaId))) return false;
  }
  for (const definition of ARENAS) {
    const archived = activity.archivedClears[definition.id] || 0;
    const retained = terminal?.arenaId === definition.id && terminal.status === 'victory' ? 1 : 0;
    const total = archived + retained;
    if (!safeAmount(total) || (activity.clears[definition.id] || 0) !== total) return false;
    const attempt = Object.values(activity.attempts[definition.id] || {})[0];
    if (attempt?.status === 'victory' && attempt.battleId !== activity.currentBattleId && archived < 1) return false;
  }
  return true;
}

/** Validate the complete frozen schema1 history before discarding any receipt. */
export function migrateActivityState(oldActivity, currentBattle = null) {
  if (!validateSchema1Activity(oldActivity)) return null;
  const pending = openAttempts(oldActivity)[0];
  const latest = oldActivity.settledSeries.at(-1);
  let currentBattleId = pending?.battleId ?? latest?.battleId ?? null;
  if (pending) {
    if (currentBattle !== null) {
      if (!dataRecord(currentBattle) || !['id', 'kind', 'arenaId', 'entryDay', 'status'].every((key) => Object.hasOwn(currentBattle, key)) ||
          !validId(currentBattle.id) || currentBattle.kind !== 'arena' || currentBattle.status !== 'active' ||
          currentBattle.arenaId !== pending.arenaId || currentBattle.entryDay !== pending.entryDay ||
          (pending.battleId !== null && pending.battleId !== currentBattle.id)) return null;
      currentBattleId = currentBattle.id;
    } else if (pending.battleId === null) return null;
  }
  if (currentBattleId !== null && !validId(currentBattleId)) return null;
  const attempts = {};
  for (const [arenaId, days] of Object.entries(oldActivity.attempts)) {
    const entries = Object.entries(days).sort(([a], [b]) => a.localeCompare(b));
    if (!entries.length) continue;
    const [day, attempt] = entries.at(-1);
    attempts[arenaId] = { [day]: { ...attempt, battleId: attempt.status === 'reserved' ? currentBattleId : attempt.battleId } };
  }
  const settledRounds = oldActivity.settledRounds.filter((receipt) => receipt.battleId === currentBattleId).map((receipt) => ({ ...receipt }));
  const settledSeries = oldActivity.settledSeries.filter((receipt) => receipt.battleId === currentBattleId).map((receipt) => ({ ...receipt }));
  const archivedClears = { ...oldActivity.clears };
  const retained = settledSeries[0];
  if (retained?.status === 'victory') {
    archivedClears[retained.arenaId]--;
    if (archivedClears[retained.arenaId] === 0) delete archivedClears[retained.arenaId];
  }
  const result = { stamina: oldActivity.stamina, lastRegenAt: oldActivity.lastRegenAt,
    attempts, clears: { ...oldActivity.clears }, settledRounds, settledSeries,
    retentionModel: RETENTION_MODEL, archivedClears, currentBattleId };
  return validateActivityState(result) ? result : null;
}

export function staminaStatus(stamina) {
  if (!validStamina(stamina)) throw new RangeError('耐力必須介於 0–99');
  return stamina >= 60 ? 'Great' : stamina >= 1 ? 'Normal' : 'Exhausted';
}

function regeneration(activity, nowMs) {
  if (nowMs < activity.lastRegenAt) return { stamina: activity.stamina, lastRegenAt: activity.lastRegenAt, recovered: 0, clockBackwards: true };
  const stamina = roundStamina(Math.min(99, activity.stamina + (nowMs - activity.lastRegenAt) / HOUR));
  return { stamina, lastRegenAt: nowMs, recovered: roundStamina(stamina - activity.stamina), clockBackwards: false };
}
function commit(activity, next, keys) {
  if (!keys.every((key) => Object.getOwnPropertyDescriptor(activity, key)?.writable === true)) {
    return failure('read-only', '活動資料為唯讀，未套用任何變更');
  }
  const candidate = { ...activity };
  for (const key of keys) candidate[key] = next[key];
  if (!validateActivityState(candidate)) return failure('invalid-state', '變更後的活動資料無效，未套用任何變更');
  for (const key of keys) activity[key] = candidate[key];
  return null;
}

/** Recovery accrues during combat too; the UI may defer its visible counter. */
export function regenerateStamina(activity, nowMs, { inBattle = false } = {}) {
  if (!validateActivityState(activity)) return failure('invalid-state', '活動資料無效');
  if (!validTime(nowMs)) return failure('invalid-time', '時間資料無效');
  const result = regeneration(activity, nowMs);
  if (!result.clockBackwards) {
    const blocked = commit(activity, result, ['stamina', 'lastRegenAt']);
    if (blocked) return blocked;
  }
  return Object.freeze({ ok: true, ...result, staminaStatus: staminaStatus(result.stamina), displayDeferred: Boolean(inBattle) });
}

/** Read-only eligibility, including projected recovery; never reserves entry. */
export function previewActivities(activity, playerLevel, nowMs) {
  const valid = validateActivityState(activity) && validLevel(playerLevel) && validTime(nowMs);
  const projected = valid ? regeneration(activity, nowMs) : null;
  const entryDay = valid ? utcDay(nowMs) : null;
  const pending = valid && openAttempts(activity).length > 0;
  return ARENAS.map((arena, index) => {
    const previous = ARENAS[index - 1];
    const priorCleared = valid && (!previous || Boolean(activity.clears[previous.id]) || playerLevel >= previous.maxLevelExclusive);
    const attemptedToday = valid && Object.hasOwn(activity.attempts[arena.id] || {}, entryDay);
    const reasons = [];
    if (!valid) reasons.push(['invalid-state', '活動、等級或時間資料無效']);
    else {
      if (projected.clockBackwards) reasons.push(['clock-backwards', '本機時間早於最近活動時間']);
      if (playerLevel < arena.minLevel) reasons.push(['level-required', `需要等級 ${arena.minLevel}`]);
      if (playerLevel >= arena.maxLevelExclusive) reasons.push(['retired', `此挑戰於等級 ${arena.maxLevelExclusive} 起不再提供`]);
      if (!priorCleared) reasons.push(['previous-clear-required', `先完成 ${previous.name}`]);
      if (attemptedToday) reasons.push(['daily-attempt-used', '今日已挑戰；UTC 00:00 重置']);
      if (pending) reasons.push(['arena-in-progress', '先結束目前的競技場挑戰']);
      if (projected.stamina < 2) reasons.push(['stamina-required', '開始戰鬥需要至少 2 點耐力']);
    }
    return Object.freeze({ ...arena, eligible: reasons.length === 0, available: reasons.length === 0,
      disabled: reasons.length > 0, reason: reasons[0]?.[1] || '', code: reasons[0]?.[0] || null,
      reasons: Object.freeze(reasons.map(([code, reason]) => Object.freeze({ code, reason }))),
      entryDay, stamina: projected?.stamina ?? null, staminaStatus: projected ? staminaStatus(projected.stamina) : null,
      priorCleared, attemptedToday, clears: valid ? activity.clears[arena.id] || 0 : 0,
      nextCredits: valid && activity.clears[arena.id] ? arena.repeatCredits : arena.firstCredits,
    });
  });
}

/** Entry spends the UTC day's attempt even when the later outcome is a loss. */
export function reserveArena(activity, arenaId, playerLevel, nowMs, battleId) {
  const arena = findArena(arenaId);
  if (!arena) return failure('unknown-arena', '未知的競技場挑戰');
  const view = previewActivities(activity, playerLevel, nowMs).find((entry) => entry.id === arenaId);
  if (!view.eligible) return failure(view.code, view.reason);
  if (!validId(battleId) || (activity.currentBattleId !== null && battleOrdinal(battleId) <= battleOrdinal(activity.currentBattleId))) {
    return failure('invalid-battle', '新的競技場戰鬥識別碼必須是較新的 arena-N');
  }
  const projected = regeneration(activity, nowMs);
  const attempts = structuredClone(activity.attempts);
  attempts[arenaId] = { [view.entryDay]: { entryDay: view.entryDay, enteredAt: nowMs, battleId, status: 'reserved' } };
  const archivedClears = { ...activity.archivedClears };
  const terminal = activity.settledSeries[0];
  if (terminal?.status === 'victory') {
    const count = (archivedClears[terminal.arenaId] || 0) + 1;
    if (!safeAmount(count)) return failure('clear-overflow', '通關次數超出安全整數範圍');
    archivedClears[terminal.arenaId] = count;
  }
  const next = { ...projected, attempts, archivedClears, currentBattleId: battleId, settledRounds: [], settledSeries: [] };
  const blocked = commit(activity, next, ['stamina', 'lastRegenAt', 'attempts', 'archivedClears', 'currentBattleId', 'settledRounds', 'settledSeries']);
  return blocked || Object.freeze({ ok: true, entryDay: view.entryDay, definition: arena, stamina: activity.stamina });
}

/** Normal difficulty, Arena 1x, external contributions zero. No reward writes. */
export function calculateRoundExperience(monsters, stamina, trainingRank = 0) {
  if(!Number.isSafeInteger(trainingRank)||trainingRank<0||trainingRank>300)return failure('invalid-training','訓練加成格式無效');
  if (!dataArray(monsters) || monsters.length < 1 || monsters.length > 3 ||
      monsters.some((monster) => !dataRecord(monster) || !Object.hasOwn(monster, 'level') ||
        !Object.hasOwn(monster, 'powerLevel') || !Number.isSafeInteger(monster.level) ||
        monster.level < 0 || !safeAmount(monster.powerLevel)) || !validStamina(stamina)) {
    return failure('invalid-monsters', '怪物 EXP 輸入無效');
  }
  const multiplier = stamina >= 60 ? 2 : stamina >= 1 ? 1 : 0;
  const rawXp = monsters.reduce((sum, monster) => sum +
    (3 + Math.min(300, Math.max(1, monster.level)) ** 1.193 / 6) * (1 + monster.powerLevel / 500) * multiplier, 0) * (1 + trainingRank / 100);
  const xp = Math.ceil(rawXp);
  if (!safeAmount(xp)) return failure('xp-overflow', '本輪 EXP 超出安全整數範圍');
  return Object.freeze({ ok: true, xp, rawXp, multiplier, roundingPolicy: ARENA_POLICY.xpRoundingPolicy });
}

function settlementInput(activity, battleId, arenaId, nowMs) {
  if (!validateActivityState(activity)) return failure('invalid-state', '活動資料無效');
  if (!validId(battleId) || !findArena(arenaId)) return failure('invalid-battle', '競技場戰鬥識別資料無效');
  if (!validTime(nowMs)) return failure('invalid-time', '時間無效');
  if (battleId !== activity.currentBattleId) return failure('stale-battle', '競技場戰鬥已過期或不是目前挑戰');
  return null;
}
function reservationFor(activity, battleId, arenaId) {
  return openAttempts(activity).find((entry) => entry.arenaId === arenaId && entry.battleId === battleId) || null;
}

/** Call only after a won round; defeated/fled current rounds get no receipt. */
export function settleArenaRound(activity, { battleId, arenaId, round, monsters, nowMs } = {}, trainingRank = 0) {
  if(!Number.isSafeInteger(trainingRank)||trainingRank<0||trainingRank>300)return failure('invalid-training','訓練加成格式無效');
  const invalid = settlementInput(activity, battleId, arenaId, nowMs);
  if (invalid) return invalid;
  const arena = findArena(arenaId);
  if (!Number.isSafeInteger(round) || round < 1 || round > arena.rounds) return failure('invalid-round', '競技場回合超出範圍');
  const duplicate = activity.settledRounds.find((receipt) => receipt.battleId === battleId && receipt.round === round);
  if (duplicate) {
    if (duplicate.arenaId !== arenaId) return failure('battle-conflict', '戰鬥識別資料與競技場不一致');
    return Object.freeze({ ...duplicate, ok: true, duplicate: true, originalXp: duplicate.xp, xp: 0, staminaCost: 0 });
  }
  if (nowMs < activity.lastRegenAt) return failure('invalid-time', '時間早於最近活動時間');
  const attempt = reservationFor(activity, battleId, arenaId);
  if (!attempt || nowMs < attempt.enteredAt) return failure('not-reserved', '找不到對應的未完成挑戰');
  const previous = activity.settledRounds.filter((receipt) => receipt.battleId === battleId);
  if (round !== previous.length + 1 || nowMs < (previous.at(-1)?.settledAt ?? 0)) return failure('round-order', '必須依序結算每一回合');
  if (!dataArray(monsters) || monsters.length !== arena.roundCounts[round - 1]) return failure('monster-count', '怪物數量與來源記載的完整回合不符');
  const projected = regeneration(activity, nowMs);
  const experience = calculateRoundExperience(monsters, projected.stamina, trainingRank);
  if (!experience.ok) return experience;
  const cost = Math.min(projected.stamina, projected.stamina >= 60 ? 0.03 : 0.02);
  const receipt = { battleId, arenaId, entryDay: attempt.entryDay, round, xp: experience.xp,
    staminaCost: roundStamina(cost), staminaBefore: projected.stamina,
    staminaAfter: roundStamina(projected.stamina - cost), staminaStatus: staminaStatus(projected.stamina), settledAt: nowMs };
  const attempts = structuredClone(activity.attempts);
  attempts[arenaId][attempt.entryDay].battleId = battleId;
  const next = { stamina: receipt.staminaAfter, lastRegenAt: projected.lastRegenAt,
    attempts, settledRounds: [...activity.settledRounds, receipt] };
  const blocked = commit(activity, next, ['stamina', 'lastRegenAt', 'attempts', 'settledRounds']);
  return blocked || Object.freeze({ ...receipt, ok: true, duplicate: false, roundingPolicy: ARENA_POLICY.xpRoundingPolicy });
}

/** Clear credits and one equipment entitlement; item creation belongs to caller. */
export function settleArenaSeries(activity, { battleId, arenaId, status, entryDay, nowMs } = {}) {
  const invalid = settlementInput(activity, battleId, arenaId, nowMs);
  if (invalid) return invalid;
  if (!TERMINAL.includes(status) || !validDay(entryDay)) return failure('invalid-result', '挑戰結果或入場日期無效');
  const duplicate = activity.settledSeries.find((receipt) => receipt.battleId === battleId);
  if (duplicate) {
    if (duplicate.arenaId !== arenaId || duplicate.entryDay !== entryDay || duplicate.status !== status) return failure('battle-conflict', '重複結算的結果與原紀錄不一致');
    return Object.freeze({ ...duplicate, ok: true, duplicate: true, originalCredits: duplicate.credits, credits: 0, xp: 0, staminaCost: 0, equipmentDropCount: 0 });
  }
  if (nowMs < activity.lastRegenAt) return failure('invalid-time', '時間早於最近活動時間');
  const attempt = reservationFor(activity, battleId, arenaId); const arena = findArena(arenaId);
  if (!attempt || attempt.entryDay !== entryDay || nowMs < attempt.enteredAt) return failure('not-reserved', '入場日期或戰鬥與未完成挑戰不一致');
  const rounds = activity.settledRounds.filter((receipt) => receipt.battleId === battleId);
  if (nowMs < (rounds.at(-1)?.settledAt ?? 0)) return failure('invalid-time', '結束時間不可早於最後一輪');
  if (status === 'victory' && rounds.length !== arena.rounds) return failure('incomplete-arena', '尚未結算全部回合，不能領取通關獎勵');
  if (status !== 'victory' && rounds.length === arena.rounds) return failure('already-won', '全部回合已獲勝，不能改記為敗北或逃離');
  const projected = regeneration(activity, nowMs);
  const firstClear = status === 'victory' && !activity.clears[arenaId];
  const credits = status !== 'victory' || projected.stamina < 1 ? 0 : firstClear ? arena.firstCredits : arena.repeatCredits;
  const receipt = { battleId, arenaId, entryDay, status, credits, firstClear,
    staminaAtSettlement: projected.stamina, settledAt: nowMs };
  const attempts = structuredClone(activity.attempts);
  attempts[arenaId][entryDay] = { ...attempts[arenaId][entryDay], battleId, status };
  const clears = { ...activity.clears };
  if (status === 'victory') {
    const count = (clears[arenaId] || 0) + 1;
    if (!safeAmount(count)) return failure('clear-overflow', '通關次數超出安全整數範圍');
    clears[arenaId] = count;
  }
  const next = { ...projected, attempts, clears, settledSeries: [...activity.settledSeries, receipt] };
  const blocked = commit(activity, next, ['stamina', 'lastRegenAt', 'attempts', 'clears', 'settledSeries']);
  return blocked || Object.freeze({ ...receipt, ok: true, duplicate: false, xp: 0, staminaCost: 0,
    pendingGuaranteedEquipment: status === 'victory' && projected.stamina >= 1,
    equipmentDropCount: status === 'victory' && projected.stamina >= 1 ? 1 : 0,
    lootStatus: ARENA_POLICY.guaranteedEquipment });
}
