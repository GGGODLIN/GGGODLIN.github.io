/**
 * Bounded, local early-Arena candidate. No player/EXP-ledger, combat, storage,
 * random, or global-clock side effects. See docs/ARENA.md for source boundaries.
 */

const arenaSource = 'https://ehwiki.org/index.php?title=Arena&oldid=64924';
const staminaSource = 'https://ehwiki.org/index.php?title=Stamina&oldid=65230';
const experienceSource = 'https://ehwiki.org/index.php?title=Experience_Points&oldid=65116';
const dawnSource = 'https://ehwiki.org/index.php?title=Dawn_of_a_New_Day&oldid=59286';
const HOUR = 3_600_000;
const STATE_KEYS = ['stamina', 'lastRegenAt', 'attempts', 'clears', 'settledRounds', 'settledSeries'];
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
const validId = (id) => typeof id === 'string' && id.length > 0 && id.length <= 200;
const validStamina = (n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 99;
const failure = (code, error) => Object.freeze({ ok: false, code, error });
const roundStamina = (n) => Math.round(n * 1e9) / 1e9;

function dataRecord(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const names = Reflect.ownKeys(value);
  if (keys && (names.length !== keys.length || !keys.every((key) => names.includes(key)))) return false;
  return names.every((key) => typeof key === 'string' && Object.hasOwn(Object.getOwnPropertyDescriptor(value, key), 'value'));
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
  return { stamina: 99, lastRegenAt: nowMs, attempts: {}, clears: {}, settledRounds: [], settledSeries: [] };
}

/** Strict read-only JSON-data validation, including reservation/receipt links. */
export function validateActivityState(activity) {
  if (!dataRecord(activity, STATE_KEYS) || !validStamina(activity.stamina) || !validTime(activity.lastRegenAt) ||
      !dataRecord(activity.attempts) || !dataRecord(activity.clears) ||
      !dataArray(activity.settledRounds) || !dataArray(activity.settledSeries)) return false;
  const attemptByBattle = new Map();
  let pending = 0;
  for (const [arenaId, days] of Object.entries(activity.attempts)) {
    if (!findArena(arenaId) || !dataRecord(days)) return false;
    for (const [day, attempt] of Object.entries(days)) {
      if (!validDay(day) || !dataRecord(attempt, ATTEMPT_KEYS) || attempt.entryDay !== day ||
          !validTime(attempt.enteredAt) || attempt.enteredAt > activity.lastRegenAt || utcDay(attempt.enteredAt) !== day ||
          !['reserved', ...TERMINAL].includes(attempt.status)) return false;
      if (attempt.status === 'reserved') pending++;
      if (attempt.battleId === null) { if (attempt.status !== 'reserved') return false; }
      else {
        if (!validId(attempt.battleId) || attemptByBattle.has(attempt.battleId)) return false;
        attemptByBattle.set(attempt.battleId, { arenaId, ...attempt });
      }
    }
  }
  if (pending > 1) return false;
  const roundKeys = new Set(); const roundsByBattle = new Map();
  for (const receipt of activity.settledRounds) {
    if (!dataRecord(receipt, ROUND_KEYS)) return false;
    const attempt = attemptByBattle.get(receipt.battleId); const arena = findArena(receipt.arenaId);
    if (!attempt || !arena || attempt.arenaId !== receipt.arenaId || attempt.entryDay !== receipt.entryDay ||
        !Number.isSafeInteger(receipt.round) || receipt.round < 1 || receipt.round > arena.rounds ||
        !safeAmount(receipt.xp) || !validTime(receipt.settledAt) || receipt.settledAt < attempt.enteredAt || receipt.settledAt > activity.lastRegenAt ||
        !validStamina(receipt.staminaBefore) || !validStamina(receipt.staminaAfter) ||
        receipt.staminaStatus !== staminaStatus(receipt.staminaBefore)) return false;
    const expectedCost = Math.min(receipt.staminaBefore, receipt.staminaBefore >= 60 ? 0.03 : 0.02);
    if (receipt.staminaCost !== roundStamina(expectedCost) ||
        receipt.staminaAfter !== roundStamina(receipt.staminaBefore - expectedCost) ||
        (receipt.staminaBefore < 1 && receipt.xp !== 0)) return false;
    const key = JSON.stringify([receipt.battleId, receipt.round]);
    const prior = roundsByBattle.get(receipt.battleId) || [];
    if (roundKeys.has(key) || receipt.round !== prior.length + 1 ||
        (prior.length && prior.at(-1).settledAt > receipt.settledAt)) return false;
    roundKeys.add(key); prior.push(receipt); roundsByBattle.set(receipt.battleId, prior);
  }
  const seriesIds = new Set(); const clearCounts = {};
  for (const receipt of activity.settledSeries) {
    if (!dataRecord(receipt, SERIES_KEYS)) return false;
    const attempt = attemptByBattle.get(receipt.battleId); const arena = findArena(receipt.arenaId);
    const rounds = roundsByBattle.get(receipt.battleId) || [];
    if (!attempt || !arena || attempt.arenaId !== receipt.arenaId || attempt.entryDay !== receipt.entryDay ||
        attempt.status !== receipt.status || !TERMINAL.includes(receipt.status) || seriesIds.has(receipt.battleId) ||
        !safeAmount(receipt.credits) || typeof receipt.firstClear !== 'boolean' ||
        !validStamina(receipt.staminaAtSettlement) || !validTime(receipt.settledAt) ||
        receipt.settledAt < (rounds.at(-1)?.settledAt ?? attempt.enteredAt) || receipt.settledAt > activity.lastRegenAt) return false;
    if (receipt.status === 'victory') {
      if (rounds.length !== arena.rounds || receipt.firstClear !== !clearCounts[arena.id]) return false;
      const expected = receipt.staminaAtSettlement < 1 ? 0 : receipt.firstClear ? arena.firstCredits : arena.repeatCredits;
      if (receipt.credits !== expected) return false;
      clearCounts[arena.id] = (clearCounts[arena.id] || 0) + 1;
    } else if (receipt.credits !== 0 || receipt.firstClear || rounds.length === arena.rounds) return false;
    seriesIds.add(receipt.battleId);
  }
  for (const [battleId, attempt] of attemptByBattle) {
    if ((attempt.status !== 'reserved') !== seriesIds.has(battleId)) return false;
  }
  if (Object.keys(activity.clears).length !== Object.keys(clearCounts).length) return false;
  return Object.entries(activity.clears).every(([arenaId, count]) =>
    findArena(arenaId) && safeAmount(count) && count > 0 && count === clearCounts[arenaId]);
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
  for (const key of keys) activity[key] = next[key];
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
export function reserveArena(activity, arenaId, playerLevel, nowMs) {
  const arena = findArena(arenaId);
  if (!arena) return failure('unknown-arena', '未知的競技場挑戰');
  const view = previewActivities(activity, playerLevel, nowMs).find((entry) => entry.id === arenaId);
  if (!view.eligible) return failure(view.code, view.reason);
  const projected = regeneration(activity, nowMs);
  const attempts = structuredClone(activity.attempts);
  attempts[arenaId] ||= {};
  attempts[arenaId][view.entryDay] = { entryDay: view.entryDay, enteredAt: nowMs, battleId: null, status: 'reserved' };
  const blocked = commit(activity, { ...projected, attempts }, ['stamina', 'lastRegenAt', 'attempts']);
  return blocked || Object.freeze({ ok: true, entryDay: view.entryDay, definition: arena, stamina: activity.stamina });
}

/** Normal difficulty, Arena 1x, external contributions zero. No reward writes. */
export function calculateRoundExperience(monsters, stamina) {
  if (!dataArray(monsters) || monsters.length < 1 || monsters.length > 3 ||
      monsters.some((monster) => !dataRecord(monster) || !Object.hasOwn(monster, 'level') ||
        !Object.hasOwn(monster, 'powerLevel') || !Number.isSafeInteger(monster.level) ||
        monster.level < 0 || !safeAmount(monster.powerLevel)) || !validStamina(stamina)) {
    return failure('invalid-monsters', '怪物 EXP 輸入無效');
  }
  const multiplier = stamina >= 60 ? 2 : stamina >= 1 ? 1 : 0;
  const rawXp = monsters.reduce((sum, monster) => sum +
    (3 + Math.min(300, Math.max(1, monster.level)) ** 1.193 / 6) * (1 + monster.powerLevel / 500) * multiplier, 0);
  const xp = Math.ceil(rawXp);
  if (!safeAmount(xp)) return failure('xp-overflow', '本輪 EXP 超出安全整數範圍');
  return Object.freeze({ ok: true, xp, rawXp, multiplier, roundingPolicy: ARENA_POLICY.xpRoundingPolicy });
}

function settlementInput(activity, battleId, arenaId, nowMs) {
  if (!validateActivityState(activity)) return failure('invalid-state', '活動資料無效');
  if (!validId(battleId) || !findArena(arenaId)) return failure('invalid-battle', '競技場戰鬥識別資料無效');
  if (!validTime(nowMs)) return failure('invalid-time', '時間無效');
  return null;
}
function reservationFor(activity, battleId, arenaId) {
  const reserved = openAttempts(activity).find((entry) => entry.arenaId === arenaId && (entry.battleId === null || entry.battleId === battleId));
  const usedElsewhere = Object.entries(activity.attempts).some(([id, days]) => Object.values(days).some((attempt) =>
    attempt.battleId === battleId && (id !== arenaId || attempt.status !== 'reserved')));
  return reserved && !usedElsewhere ? reserved : null;
}

/** Call only after a won round; defeated/fled current rounds get no receipt. */
export function settleArenaRound(activity, { battleId, arenaId, round, monsters, nowMs } = {}) {
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
  const experience = calculateRoundExperience(monsters, projected.stamina);
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
  if (status === 'victory') clears[arenaId] = (clears[arenaId] || 0) + 1;
  const next = { ...projected, attempts, clears, settledSeries: [...activity.settledSeries, receipt] };
  const blocked = commit(activity, next, ['stamina', 'lastRegenAt', 'attempts', 'clears', 'settledSeries']);
  return blocked || Object.freeze({ ...receipt, ok: true, duplicate: false, xp: 0, staminaCost: 0,
    pendingGuaranteedEquipment: status === 'victory' && projected.stamina >= 1,
    equipmentDropCount: status === 'victory' && projected.stamina >= 1 ? 1 : 0,
    lootStatus: ARENA_POLICY.guaranteedEquipment });
}
