import { ACTIONS, ATTRIBUTE_KEYS, RULES, RULES_VERSION, SCHEMA_VERSION, MAX_SAVE_BYTES, STARTER_ITEMS, TRAINING_WAVES } from './data.js';
export { RULES, ACTIONS, ATTRIBUTE_KEYS, MAX_SAVE_BYTES } from './data.js';

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const success = (events = []) => ({ ok: true, events });
const failure = (error) => ({ ok: false, error, events: [] });
const isActive = (state) => state.battle?.status === 'active';
const actionById = (id) => ACTIONS.find((action) => action.id === id);

function seedNumber(seed) {
  if (typeof seed === 'number' && Number.isFinite(seed)) return (seed >>> 0) || 0x51f15e;
  let hash = 2166136261;
  for (const character of String(seed)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0) || 0x51f15e;
}
function random(state) {
  let x = state._rng;
  x ^= x << 13; x ^= x >>> 17; x ^= x << 5;
  state._rng = x >>> 0;
  return state._rng / 4294967296;
}
function randomInt(state, min, max) { return min + Math.floor(random(state) * (max - min + 1)); }

/** All derived-stat formulas below are authored training formulas, not recovered server formulas. */
export function getStats(state) {
  const { str, dex, agi, end, int, wis } = state.player.attributes;
  const gear = Object.values(state.equipped).map((id) => state.inventory.find((item) => item.id === id)).filter(Boolean);
  const total = (key) => gear.reduce((sum, item) => sum + item[key], 0);
  const burden = total('burden');
  const speed = Math.round(clamp((agi / state.player.level - 1) * 10, 0, 10) * clamp((130 - burden) / 90, 0, 1) * 100) / 100;
  return {
    maxHp: Math.floor(150 + end * 9 + state.player.level * 5),
    maxMp: Math.floor(30 + int * 2 + wis * 2),
    maxSp: Math.floor(10 + wis * 0.75),
    attack: Math.floor(8 + str * 1.4 + dex * 0.5 + total('attack')),
    magic: Math.floor(5 + int * 1.6 + wis * 0.4 + total('magic')),
    defense: Math.floor(end * 0.3 + total('defense')),
    accuracy: Math.round(clamp(88 + dex * 0.25, 88, 98) * 10) / 10,
    speed, burden,
  };
}

export function createGame(seed = 'vesper-training-01') {
  const state = {
    schemaVersion: SCHEMA_VERSION, rulesVersion: RULES_VERSION, mode: 'Persistent',
    player: { name: '旅者', level: 20, xp: 0, xpNext: 1000, attributePoints: 3,
      attributes: { str: 24, dex: 22, agi: 24, end: 26, int: 22, wis: 24 },
      hp: 0, mp: 0, sp: 0, overcharge: 0, credits: 0 },
    inventory: clone(STARTER_ITEMS),
    equipped: { weapon: 'blade-dawn', body: 'coat-traveler', offhand: 'shield-ash' },
    potions: { health: 3, mana: 3 }, battle: null,
    history: [], achievements: { trainingClears: 0 },
    externalBonuses: clone(RULES.externalBonuses),
    _rng: seedNumber(seed), _nextBattle: 1, _nextEvent: 1, _commandReceipts: [],
  };
  const stats = getStats(state);
  Object.assign(state.player, { hp: stats.maxHp, mp: stats.maxMp, sp: stats.maxSp });
  return state;
}

function emit(state, events, text, type = 'info', extra = {}) {
  const event = { id: `event-${state._nextEvent++}`, text, type, ...extra };
  events.push(event);
  if (state.battle) state.battle.log.push(event);
  return event;
}
function spawnWave(state) {
  const battle = state.battle;
  battle.enemies = TRAINING_WAVES[battle.round - 1].map((template, index) => ({
    id: `${battle.id}-r${battle.round}-e${index + 1}`,
    name: template.name, title: template.title, kind: template.kind,
    level: template.level, hp: template.maxHp, maxHp: template.maxHp,
    scanned: false, resistances: { ...template.resistances }, attack: template.attack,
  }));
  // Private scheduler is saved for deterministic reloads. Never render its contents as enemy intent.
  battle._schedule = battle.enemies.map((enemy, index) => ({
    id: enemy.id, nextAt: battle.timeUnits + randomInt(state, 10, 100), interval: TRAINING_WAVES[battle.round - 1][index].interval,
  }));
  battle.targetId = battle.enemies[0].id;
}
export function startBattle(state) {
  if (isActive(state)) return failure('演練尚未結束');
  const events = [...recoverOutOfCombat(state).events];
  state.battle = {
    id: `training-${state._nextBattle++}`, status: 'active', phase: 'combat', round: 1, rounds: TRAINING_WAVES.length,
    turn: 0, ticks: 0, timeUnits: 0, targetId: null, enemies: [], log: [],
    cooldowns: Object.fromEntries(ACTIONS.map((action) => [action.id, 0])),
    spiritActive: false, effects: { defend: 0, focus: 0 },
    _schedule: [], _nextTick: 100, _receipts: [], _settled: false,
  };
  spawnWave(state);
  emit(state, events, '裂隙演練開始 · 第 1 / 2 波。怪物與數值為原創訓練樣本。', 'round');
  return success(events);
}

export function selectTarget(state, targetId) {
  if (!isActive(state)) return failure('目前沒有進行中的演練');
  const enemy = state.battle.enemies.find((entry) => entry.id === targetId && entry.hp > 0);
  if (!enemy) return failure('請選擇存活的目標');
  state.battle.targetId = targetId;
  return success();
}

/** Safe presentation view. Hidden scheduler is never returned, even after Scan. */
export function getEnemyView(enemy) {
  const view = { id: enemy.id, name: enemy.name, title: enemy.title, kind: enemy.kind,
    scanned: enemy.scanned, defeated: enemy.hp <= 0, hpPercent: Math.ceil(100 * enemy.hp / enemy.maxHp) };
  if (enemy.scanned) Object.assign(view, { level: enemy.level, hp: enemy.hp, maxHp: enemy.maxHp,
    resistances: { ...enemy.resistances }, attack: enemy.attack });
  return view;
}

function effectiveSpirit(state) {
  return Boolean(state.battle?.spiritActive && state.player.overcharge > 30 && state.player.sp > 0);
}
function manaCost(state, action) {
  return action.mana ? Math.ceil(action.mana * (effectiveSpirit(state) ? 0.75 : 1)) : 0;
}
function actionError(state, action, targetId) {
  if (!isActive(state)) return '目前沒有進行中的演練';
  if (!action) return '未知的行動';
  if (state.battle.phase === 'round-complete') return '本波已完成，請確認繼續下一波';
  if (state.player.hp <= 0) return '角色已倒下';
  if (state.battle.cooldowns[action.id] > 0) return `尚需 ${state.battle.cooldowns[action.id]} 個${action.item ? '道具或一般' : '非道具'}行動冷卻`;
  if (action.target) {
    const enemy = state.battle.enemies.find((entry) => entry.id === targetId && entry.hp > 0);
    if (!enemy) return '請選擇存活的目標';
    if (action.id === 'scan' && enemy.scanned) return '已取得此目標的探查資料';
  }
  if (state.player.mp < manaCost(state, action)) return '魔力不足';
  if (action.id === 'spirit' && !state.battle.spiritActive && (state.player.overcharge < 50 || state.player.sp < 1)) return '需要至少 50 OC 與 1 SP';
  const stats = getStats(state);
  if ((action.id === 'cure' || action.id === 'healthPotion') && state.player.hp >= stats.maxHp) return '生命已滿';
  if (action.id === 'manaPotion' && state.player.mp >= stats.maxMp) return '魔力已滿';
  if (action.item && state.potions[action.item] <= 0) return '此藥水已用完';
  return null;
}

export function listAvailableActions(state) {
  return ACTIONS.map((action) => {
    const reason = actionError(state, action, state.battle?.targetId);
    const cost = action.item ? `${state.potions[action.item]} 瓶 · 0 時間` : action.mana ? `${manaCost(state, action)} MP` : action.id === 'spirit' ? state.battle?.spiritActive ? '關閉架式' : '50 OC 門檻' : '無消耗';
    return { id: action.id, name: action.name, icon: action.icon, cost,
      description: action.description, disabled: Boolean(reason), reason: reason || '', cooldown: state.battle?.cooldowns[action.id] || 0 };
  });
}

function actionTime(state, action) {
  if (action.item) return 0;
  const speed = action.id === 'attack' ? getStats(state).speed / 100 : 0;
  return Math.ceil(clamp(100 * action.baseTime * (1 - speed), RULES.minActionUnits, RULES.maxActionUnits));
}
function heal(state, events, resource, amount, source) {
  const stats = getStats(state);
  const max = resource === 'hp' ? stats.maxHp : stats.maxMp;
  const recovered = Math.min(max - state.player[resource], Math.max(0, Math.floor(amount)));
  state.player[resource] += recovered;
  emit(state, events, `${source}恢復 ${recovered} ${resource.toUpperCase()}`, 'heal', { amount: recovered, resource });
}
function settle(state, status, events) {
  const battle = state.battle;
  if (battle._settled) return;
  battle._settled = true;
  battle.finalVitals = { hp: state.player.hp, mp: state.player.mp, sp: state.player.sp };
  battle.status = status;
  battle.spiritActive = false;
  battle.effects = { defend: 0, focus: 0 };
  state.history.push({ battleId: battle.id, status, turns: battle.turn, rounds: battle.round });
  if (status === 'victory') {
    state.achievements.trainingClears++;
    emit(state, events, '演練完成。已記錄通關；此訓練不發放 EXP、Credits 或掉落。', 'victory');
  } else if (status === 'defeat') emit(state, events, '你已倒下。演練結束；敗北結果已記錄。', 'defeat');
  else emit(state, events, '已撤離裂隙。沒有獎勵或原版活動次數變更。', 'flee');
  const recovery = recoverOutOfCombat(state);
  events.push(...recovery.events);
  battle.log.push(...recovery.events);
}

function enemyAttack(state, enemy, events, focused) {
  const stats = getStats(state);
  // No enemy intent or future random choice is generated until this event is due.
  const hit = random(state) < (focused ? 1 : 0.9);
  if (!hit) {
    emit(state, events, `避開了${enemy.name}的攻擊`, 'miss', { actor: enemy.id });
    return;
  }
  const defended = state.battle.effects.defend > 0;
  const raw = enemy.attack * (0.9 + random(state) * 0.2);
  const damage = Math.max(1, Math.floor(raw * (100 / (100 + stats.defense * 2)) * (defended ? 0.75 : 1)));
  state.player.hp = Math.max(0, state.player.hp - damage);
  emit(state, events, `${enemy.name}造成 ${damage} 點傷害${defended ? '（防禦中）' : ''}`, 'enemy', { actor: enemy.id, amount: damage });
  if (state.player.hp === 0) settle(state, 'defeat', events);
}

function advanceTime(state, units, events, focused) {
  const battle = state.battle;
  if (units === 0) return;
  const end = battle.timeUnits + units;
  while (battle.status === 'active') {
    const due = battle._schedule.filter((entry) => battle.enemies.some((enemy) => enemy.id === entry.id && enemy.hp > 0))
      .sort((a, b) => a.nextAt - b.nextAt || a.id.localeCompare(b.id))[0];
    const nextTime = Math.min(battle._nextTick, due?.nextAt ?? Infinity);
    if (nextTime > end) break;
    battle.timeUnits = nextTime;
    // A tie resolves tick bookkeeping first; exact original tie ordering is unverified.
    if (battle._nextTick <= (due?.nextAt ?? Infinity)) {
      battle.ticks++;
      battle._nextTick += RULES.tickUnits;
    } else {
      due.nextAt += due.interval;
      const enemy = battle.enemies.find((entry) => entry.id === due.id);
      enemyAttack(state, enemy, events, focused);
    }
  }
  if (battle.status === 'active') battle.timeUnits = end;
}

/** Accepted commands are atomic synchronous mutations; rejected commands leave state byte-for-byte unchanged. */
export function performAction(state, actionId, targetId, commandId) {
  const battle = state.battle;
  const normalizedTarget = targetId ?? battle?.targetId ?? null;
  if (commandId !== undefined && (typeof commandId !== 'string' || commandId.length < 1 || commandId.length > 200)) return failure('無效的指令識別碼');
  const prior = commandId && state._commandReceipts.find((receipt) => receipt.id === commandId);
  if (prior) {
    if (prior.actionId !== actionId || prior.targetId !== (targetId ?? prior.targetId)) return failure('指令識別碼已用於不同的行動');
    return { ...clone(prior.result), duplicate: true };
  }
  const action = actionById(actionId);
  const error = actionError(state, action, normalizedTarget);
  if (error) return failure(error);
  const id = commandId ?? `${battle.id}:local:${battle.turn + 1}`;
  const events = [];
  const stats = getStats(state);
  const mpCost = manaCost(state, action);
  const wasSpirit = battle.spiritActive;
  const spirit = effectiveSpirit(state);
  const focused = battle.effects.focus > 0;
  battle.turn++;
  if (wasSpirit) {
    if (spirit) {
      state.player.overcharge -= 10;
      state.player.sp--;
      emit(state, events, '靈動架式維持：−10 OC / −1 SP', 'resource');
    } else {
      battle.spiritActive = false;
      emit(state, events, '靈動架式因資源不足而結束', 'status');
    }
  }
  // Items reduce only other item cooldowns. All non-item actions advance both families.
  for (const other of ACTIONS) {
    if (other.id !== action.id && (!action.item || other.item)) battle.cooldowns[other.id] = Math.max(0, battle.cooldowns[other.id] - 1);
  }
  state.player.mp -= mpCost;
  const target = action.target ? battle.enemies.find((enemy) => enemy.id === normalizedTarget) : null;
  if (target) battle.targetId = target.id;
  if (action.id === 'attack' || action.id === 'fire') {
    const isFire = action.id === 'fire';
    const accuracy = isFire ? clamp(stats.accuracy * (focused ? 2 : 1), 0, 100) : stats.accuracy;
    if (random(state) * 100 < accuracy) {
      const critical = random(state) < 0.08;
      const base = isFire ? stats.magic * 1.7 : stats.attack * (spirit ? 2 : 1);
      const mitigation = target.resistances[isFire ? 'fire' : 'physical'];
      const damage = Math.max(1, Math.floor(base * (0.9 + random(state) * 0.2) * (1 - mitigation) * (critical ? 1.5 : 1)));
      target.hp = Math.max(0, target.hp - damage);
      emit(state, events, `${isFire ? '烈焰衝擊' : '普通攻擊'}命中${target.name}：${damage}${critical ? '（暴擊）' : ''}`, isFire ? 'magic' : 'attack', { targetId: target.id, amount: damage, critical });
      if (!isFire) state.player.overcharge = Math.min(RULES.overchargeCap, state.player.overcharge + randomInt(state, 5, 10));
      if (target.hp === 0) emit(state, events, `${target.name}已被擊倒`, 'kill', { targetId: target.id });
    } else emit(state, events, `${isFire ? '烈焰衝擊' : '普通攻擊'}未命中${target.name}`, 'miss', { targetId: target.id });
  } else if (action.id === 'cure') heal(state, events, 'hp', stats.maxHp * 0.3 + stats.magic * 0.4, '治癒');
  else if (action.id === 'scan') {
    target.scanned = true;
    emit(state, events, `探查完成：${target.name}，Lv.${target.level}，HP ${target.hp} / ${target.maxHp}`, 'scan', { targetId: target.id });
  } else if (action.id === 'defend') {
    battle.effects.defend = 2;
    emit(state, events, '防禦姿態：本次與下次行動受到的傷害減少 25%', 'status');
  } else if (action.id === 'focus') {
    battle.effects.focus = 2;
    if (state.player.overcharge >= 25) {
      state.player.overcharge -= 25;
      heal(state, events, 'mp', stats.maxMp * 0.05, '專注');
    }
    emit(state, events, '專注：下次行動的法術命中提高；下次行動無法閃避', 'status');
  } else if (action.id === 'spirit') {
    battle.spiritActive = !wasSpirit;
    emit(state, events, battle.spiritActive ? '靈動架式啟動' : '靈動架式關閉', 'status');
  } else if (action.item) {
    state.potions[action.item]--;
    heal(state, events, action.item === 'health' ? 'hp' : 'mp', action.item === 'health' ? stats.maxHp * 0.5 : stats.maxMp * 0.4, action.name);
  } else if (action.id === 'flee') emit(state, events, '正在撤離……', 'status');
  if (action.cooldown) battle.cooldowns[action.id] = action.cooldown;
  advanceTime(state, actionTime(state, action), events, focused);
  if (battle.status === 'active') {
    for (const effect of ['defend', 'focus']) battle.effects[effect] = Math.max(0, battle.effects[effect] - 1);
    if (battle.spiritActive && (state.player.overcharge <= 20 || state.player.sp <= 0)) {
      battle.spiritActive = false;
      emit(state, events, '靈動架式耗盡，恢復一般姿態', 'status');
    }
    if (action.id === 'flee') settle(state, 'fled', events);
    else if (battle.enemies.every((enemy) => enemy.hp === 0)) {
      if (battle.round === battle.rounds) settle(state, 'victory', events);
      else {
        battle.phase = 'round-complete';
        battle.targetId = null;
        emit(state, events, `第 ${battle.round} / ${battle.rounds} 波已完成。確認「繼續」後才進入下一波。`, 'round');
      }
    }
    // Selection is a UI convenience; no action is submitted against the new selection.
    if (battle.status === 'active' && !battle.enemies.some((enemy) => enemy.id === battle.targetId && enemy.hp > 0)) battle.targetId = battle.enemies.find((enemy) => enemy.hp > 0)?.id ?? null;
  }
  const result = success(events);
  const receipt = { id, actionId, targetId: normalizedTarget, result: clone(result) };
  battle._receipts.push(receipt);
  state._commandReceipts.push(clone(receipt));
  return result;
}

/** Explicit non-combat-command wave continuation; no time, upkeep or cooldown decrement. */
export function continueRound(state) {
  const battle = state.battle;
  if (!isActive(state) || battle.phase !== 'round-complete' || battle.round >= battle.rounds) return failure('目前沒有等待繼續的波次');
  if (!battle.enemies.every((enemy) => enemy.hp === 0)) return failure('本波仍有存活敵人');
  const events = [];
  battle.round++;
  battle.phase = 'combat';
  spawnWave(state);
  emit(state, events, `第 ${battle.round} / ${battle.rounds} 波 · 保留資源、冷卻與經過時間`, 'round');
  return success(events);
}

export function equipItem(state, itemId) {
  if (isActive(state)) return failure('戰鬥中不能更換裝備');
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return failure('找不到這件裝備');
  if (state.equipped[item.slot] === item.id) return failure('這件裝備已穿戴');
  state.equipped[item.slot] = item.id;
  const stats = getStats(state);
  state.player.hp = Math.min(state.player.hp, stats.maxHp);
  state.player.mp = Math.min(state.player.mp, stats.maxMp);
  state.player.sp = Math.min(state.player.sp, stats.maxSp);
  return success([{ id: `event-${state._nextEvent++}`, text: `已裝備${item.name}`, type: 'equipment' }, ...recoverOutOfCombat(state).events]);
}
export function setItemProtected(state, itemId, locked) {
  if (typeof locked !== 'boolean') return failure('保護標記格式錯誤');
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return failure('找不到這件裝備');
  item.locked = locked;
  return success();
}
export function spendAttribute(state, key) {
  if (isActive(state)) return failure('戰鬥中不能配置屬性');
  if (!ATTRIBUTE_KEYS.includes(key)) return failure('未知的屬性');
  if (state.player.attributePoints < 1) return failure('沒有可配置的演練屬性點');
  state.player.attributePoints--;
  state.player.attributes[key]++;
  return recoverOutOfCombat(state);
}
/** Public 0.91-era statement: outside combat HP/MP/SP recover immediately. No OC/items/rewards inferred. */
export function recoverOutOfCombat(state) {
  if (isActive(state)) return failure('戰鬥系列尚未結束，不能進行戰外恢復');
  const stats = getStats(state);
  const recovered = { hp: stats.maxHp - state.player.hp, mp: stats.maxMp - state.player.mp, sp: stats.maxSp - state.player.sp };
  if (Object.values(recovered).every((amount) => amount === 0)) return success();
  Object.assign(state.player, { hp: stats.maxHp, mp: stats.maxMp, sp: stats.maxSp });
  return success([{ id: `event-${state._nextEvent++}`, text: '戰鬥系列已結束：生命、魔力、靈力即時回滿。藥水及 OC 不變。', type: 'recovery', recovered }]);
}
export function rest(state) { return recoverOutOfCombat(state); }

const integer = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= min && value <= max;
const plain = (value) => value && typeof value === 'object' && !Array.isArray(value);
const safeText = (value, max = 200) => typeof value === 'string' && value.length <= max;
function validState(state) {
  if (!plain(state) || state.schemaVersion !== SCHEMA_VERSION || state.rulesVersion !== RULES_VERSION || state.mode !== 'Persistent') return false;
  if (!integer(state._rng, 1, 0xffffffff) || !integer(state._nextBattle, 1) || !integer(state._nextEvent, 1)) return false;
  if (!plain(state.player) || !plain(state.player.attributes) || !safeText(state.player.name, 80)) return false;
  const player = state.player;
  if (!integer(player.level, 1, 500) || !ATTRIBUTE_KEYS.every((key) => integer(player.attributes[key], 1, 100000))) return false;
  if (!['hp', 'mp', 'sp', 'xp', 'credits', 'attributePoints'].every((key) => integer(player[key])) || !integer(player.xpNext, 1) || !integer(player.overcharge, 0, 250)) return false;
  if (!Array.isArray(state.inventory) || state.inventory.length !== STARTER_ITEMS.length || !plain(state.equipped)) return false;
  if (new Set(state.inventory.map((item) => item.id)).size !== state.inventory.length) return false;
  for (const item of state.inventory) {
    const original = STARTER_ITEMS.find((entry) => entry.id === item.id);
    if (!original || typeof item.locked !== 'boolean' || Object.keys(original).some((key) => key !== 'locked' && item[key] !== original[key])) return false;
  }
  if (!['weapon', 'body', 'offhand'].every((slot) => state.inventory.some((item) => item.id === state.equipped[slot] && item.slot === slot))) return false;
  const stats = getStats(state);
  if (player.hp > stats.maxHp || player.mp > stats.maxMp || player.sp > stats.maxSp) return false;
  if (!plain(state.potions) || !integer(state.potions.health, 0, 999999) || !integer(state.potions.mana, 0, 999999)) return false;
  if (!plain(state.externalBonuses) || Object.entries(RULES.externalBonuses).some(([key, value]) => state.externalBonuses[key] !== value)) return false;
  if (!plain(state.achievements) || !integer(state.achievements.trainingClears) || !Array.isArray(state.history)) return false;
  const statuses = ['active', 'victory', 'defeat', 'fled'];
  if (!state.history.every((entry) => plain(entry) && safeText(entry.battleId) && statuses.slice(1).includes(entry.status) && integer(entry.turns) && integer(entry.rounds, 1, 2))) return false;
  if (state.history.filter((entry) => entry.status === 'victory').length !== state.achievements.trainingClears) return false;
  const validEvent = (event) => plain(event) && safeText(event.id) && safeText(event.text, 2000) && safeText(event.type, 40);
  const validReceipt = (receipt) => plain(receipt) && safeText(receipt.id) && actionById(receipt.actionId) && (receipt.targetId === null || safeText(receipt.targetId)) && receipt.result?.ok === true && Array.isArray(receipt.result.events) && receipt.result.events.every(validEvent);
  if (!Array.isArray(state._commandReceipts) || !state._commandReceipts.every(validReceipt) || new Set(state._commandReceipts.map((receipt) => receipt.id)).size !== state._commandReceipts.length) return false;
  const battle = state.battle;
  if (battle === null) return true;
  if (!plain(battle) || !['combat', 'round-complete'].includes(battle.phase) || !safeText(battle.id) || !statuses.includes(battle.status) || !integer(battle.round, 1, 2) || battle.rounds !== 2) return false;
  if (!integer(battle.turn) || !integer(battle.ticks) || !integer(battle.timeUnits) || battle.ticks !== Math.floor(battle.timeUnits / 100) || battle._nextTick !== (battle.ticks + 1) * 100) return false;
  if (typeof battle.spiritActive !== 'boolean' || typeof battle._settled !== 'boolean' || battle._settled !== (battle.status !== 'active')) return false;
  if (battle.status === 'active' && player.hp === 0) return false;
  if (battle.finalVitals !== undefined && (!plain(battle.finalVitals) || !['hp', 'mp', 'sp'].every((key) => integer(battle.finalVitals[key])))) return false;
  if (!plain(battle.effects) || !['defend', 'focus'].every((key) => integer(battle.effects[key], 0, 2))) return false;
  if (!plain(battle.cooldowns) || !ACTIONS.every((action) => integer(battle.cooldowns[action.id], 0, 1000))) return false;
  if (!Array.isArray(battle.enemies) || battle.enemies.length !== 3 || !Array.isArray(battle._schedule) || battle._schedule.length !== 3) return false;
  if (new Set(battle.enemies.map((enemy) => enemy.id)).size !== 3) return false;
  for (const enemy of battle.enemies) {
    if (!plain(enemy) || !safeText(enemy.id) || !safeText(enemy.name) || !safeText(enemy.title) || !['wolf', 'golem', 'wraith'].includes(enemy.kind)) return false;
    if (!integer(enemy.level, 1) || !integer(enemy.maxHp, 1) || !integer(enemy.hp, 0, enemy.maxHp) || !integer(enemy.attack, 0) || typeof enemy.scanned !== 'boolean') return false;
    if (!plain(enemy.resistances) || !['fire', 'physical'].every((key) => Number.isFinite(enemy.resistances[key]) && enemy.resistances[key] >= -1 && enemy.resistances[key] <= 1)) return false;
    const schedule = battle._schedule.filter((entry) => entry.id === enemy.id);
    if (schedule.length !== 1 || !integer(schedule[0].nextAt) || !integer(schedule[0].interval, 1) || (enemy.hp > 0 && schedule[0].nextAt < battle.timeUnits)) return false;
  }
  if (battle.targetId !== null && !battle.enemies.some((enemy) => enemy.id === battle.targetId)) return false;
  if (battle.phase === 'round-complete' && (battle.status !== 'active' || battle.round >= battle.rounds || battle.enemies.some((enemy) => enemy.hp > 0) || battle.targetId !== null)) return false;
  if (battle.status === 'active' && battle.phase === 'combat' && !battle.enemies.some((enemy) => enemy.hp > 0)) return false;
  if (battle.status === 'victory' && (battle.round !== 2 || battle.enemies.some((enemy) => enemy.hp > 0))) return false;
  if (!Array.isArray(battle.log) || !battle.log.every(validEvent) || !Array.isArray(battle._receipts)) return false;
  if (new Set(battle._receipts.map((receipt) => receipt.id)).size !== battle._receipts.length) return false;
  if (!battle._receipts.every(validReceipt)) return false;
  if (!battle._receipts.every((receipt) => state._commandReceipts.some((global) => global.id === receipt.id && JSON.stringify(global) === JSON.stringify(receipt)))) return false;
  return true;
}
export function serializeGame(state) { return JSON.stringify(state); }
export function restoreGame(json) {
  try {
    if (typeof json !== 'string' || json.length > MAX_SAVE_BYTES || new TextEncoder().encode(json).byteLength > MAX_SAVE_BYTES) return null;
    const state = JSON.parse(json, (key, value) => {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Unsafe save key');
      return value;
    });
    // Validate old progress before applying the documented rule-version migration.
    const legacy = ['persistent-0.91-training-v1', 'persistent-0.91-training-v2'].includes(state?.rulesVersion);
    if (state?.schemaVersion === SCHEMA_VERSION && legacy) {
      state.rulesVersion = RULES_VERSION;
      if (state.battle && state.battle.phase === undefined) state.battle.phase = 'combat';
    }
    if (!validState(state)) return null;
    if (legacy && !isActive(state)) {
      if (state.battle && !state.battle.finalVitals) state.battle.finalVitals = { hp: state.player.hp, mp: state.player.mp, sp: state.player.sp };
      const recovery = recoverOutOfCombat(state);
      if (state.battle) state.battle.log.push(...recovery.events);
    }
    return state;
  } catch { return null; }
}
