import {SEARING_POLICY,rollSearing,createSearingEffect,validateSearingEffects,expiredSearingIds,searingDamageFactor} from './searing.js';
import {TRAINING_POLICY,createTrainingState,validateTrainingState,migrateTrainingState,startAbilityBoostTraining as startAbilityBoost,cancelAbilityBoostTraining as cancelAbilityBoost,startAdeptTraining as startTraining,cancelAdeptTraining as cancelTraining,visitTraining as collectTraining} from './training.js';
export {getTrainingView,quoteAdeptTraining,quoteAbilityBoostTraining} from './training.js';
import {createSoulbindingState,validateSoulbindingState,effectiveEquipmentStats,purchaseSoulFragments as purchaseFragments,bindWeapon as bindSoulWeapon} from './soulbinding.js';
export {SOULBIND_POLICY,quoteSoulFragmentPurchase,quoteWeaponSoulbind} from './soulbinding.js';
import {GRINDFEST_POLICY,createGrindfestState,validateGrindfestState,reserveGrindfest,settleGrindfestRound,settleGrindfestSeries} from './grindfest.js';
export {previewGrindfest} from './grindfest.js';
import {CURATIVE_POLICY,cureHealingAmount} from './curative.js';
import {ACCURACY_POLICY,sampleOutgoingImpact} from './combat-accuracy.js';
import {AUDIT_POLICY,createAuditState,migrateAuditState,compactAuditState,validateRetainedHistory} from './audit-history.js';
import {createCommandLedger,nextCommandToken as ledgerToken,inspectCommand,appendCommandReceipt,migrateLegacyReceipts,validateCommandLedger,validateCommandEvent} from './command-ledger.js';
import {createActivityState as createLegacyActivityState,validateActivityState as validateLegacyActivityState} from './compat/arena-schema1.js';
import {VITAL_POLICY,calculateVitals} from './vitals.js';
import {ABILITY_POLICY,ALL_ABILITIES,activeCureRank,migrateLegacyAbilityState,createAbilityState,validateAbilityState,abilityVitalMultipliers,purchaseAbilityRank as purchaseRank,assignAbility as assignMajor,unassignAbility as unassignMajor,resetAbility as resetOwnedAbility} from './abilities.js';
import {createSupplyState,validateSupplyState} from './supplies.js';
import {RESTORATIVE_POLICY,restorativeAmount} from './restoratives.js';
import {GENERATION_POLICY,generateEquipment,validateGeneratedEquipment} from './equipment-generation.js';
import {OFFENSE_POLICY,publishedOffense,outgoingDamage} from './combat-offense.js';
import {COMBAT_RESOURCE_POLICY,SPELL_RESOURCES,REGEN_SCALE,spellManaCost,naturalRegenRates,recoverWholeUnits} from './combat-resources.js';
import {setEquipmentProtection,equipmentActionPermission,getContainerCounts} from './armory.js';
import {ARENAS,createActivityState,validateActivityState,migrateActivityState,previewActivities,reserveArena,settleArenaRound,settleArenaSeries} from './arena.js';
import {grantExperience,experienceThreshold,experienceLevel} from './leveling.js';
import {createExperienceLedger,validateExperienceLedger,quoteAttributeChange,applyAttributeChange,LEVEL_20_REFERENCE} from './progression.js';
import { ACTIONS, ATTRIBUTE_KEYS, RULES, RULES_VERSION, SCHEMA_VERSION, MAX_SAVE_BYTES, MAX_LEGACY_RECOVERY_BYTES, EQUIPMENT_QUALITIES, STARTER_ITEMS, TRAINING_WAVES } from './data.js';
export {ARENAS,previewActivities} from './arena.js';
export { RULES, ACTIONS, ATTRIBUTE_KEYS, MAX_SAVE_BYTES, MAX_LEGACY_RECOVERY_BYTES } from './data.js';

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

/** Vital and outgoing models are versioned separately; accuracy and generic defense remain authored. */
export function getStats(state) {
  const { str, dex, agi, end, int, wis } = state.player.attributes;
  const gear = Object.values(state.equipped).map((id) => state.inventory.find((item) => item.id === id)).filter(Boolean).map(item=>item.bound?effectiveEquipmentStats(item,state.player.level,state.soulbinding?.bindings?.[item.id]):item);
  const total = (key) => gear.reduce((sum, item) => sum + item[key], 0);
  const burden = total('burden');
  const legacyOffense=isActive(state)&&state.battle.offenseRules===OFFENSE_POLICY.legacy;
  const offense=publishedOffense(state.player.attributes,total('attack'),total('magic'));
  const vitalMultipliers=isActive(state)&&state.battle.abilityRules==='none-v1'?{hp:1,mp:1,sp:1}:abilityVitalMultipliers(state);
  const vitals=calculateVitals({level:state.player.level,attributes:state.player.attributes,model:isActive(state)?state.battle.vitalRules:state.vitalRules,multipliers:vitalMultipliers});
  const speed = Math.round(clamp((agi / state.player.level - 1) * 10, 0, 10) * clamp((130 - burden) / 90, 0, 1) * 100) / 100;
  return {
    ...vitals,
    attack: legacyOffense?Math.floor(8 + str * 1.4 + dex * 0.5 + total('attack')):offense.attack,
    magic: legacyOffense?Math.floor(5 + int * 1.6 + wis * 0.4 + total('magic')):offense.magic,
    healingMagicFixture: Math.floor(5 + int * 1.6 + wis * 0.4 + total('magic')),
    defense: Math.floor(end * 0.3 + total('defense')),
    accuracy: Math.round(clamp(88 + dex * 0.25, 88, 98) * 10) / 10,
    speed, burden,
  };
}

export function createGame(seed = 'vesper-training-01', {vitalRules=VITAL_POLICY.id}={}) {
  if(![VITAL_POLICY.id,VITAL_POLICY.legacy].includes(vitalRules))throw new RangeError('Unknown vital model');
  const state = {
    schemaVersion: SCHEMA_VERSION, rulesVersion: RULES_VERSION, mode: 'Persistent', vitalRules,
    player: { name: '旅者', level: LEVEL_20_REFERENCE.level, xp: LEVEL_20_REFERENCE.earnedThreshold, xpNext: LEVEL_20_REFERENCE.nextEarnedThreshold, attributePoints: 0,
      attributes: { str: 14, dex: 14, agi: 14, end: 14, int: 14, wis: 14 },
      hp: 0, mp: 0, sp: 0, overcharge: 0, credits: 0 },
    inventory: clone(STARTER_ITEMS),
    equipped: { weapon: 'blade-dawn', body: 'coat-traveler', offhand: 'shield-ash' },
    potions: { health: 3, mana: 3 }, battle: null,
    activities: createActivityState(0), grindfest:createGrindfestState(), levelRewards: [], supplies:createSupplyState(), soulbinding:createSoulbindingState(), training:createTrainingState(), abilities:createAbilityState(true),
    audit:createAuditState(), commandLedger:createCommandLedger(), history: [], achievements: { trainingClears: 0 },
    externalBonuses: clone(RULES.externalBonuses),
    _rng: seedNumber(seed), _nextBattle: 1, _nextEvent: 1,
  };
  state.progression = createExperienceLedger(state.player.attributes, state.player.xp);
  for (const id of Object.values(state.equipped)) state.inventory.find((item) => item.id === id).level = state.player.level;
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
function encounterCounts(battle) { return battle.kind === 'arena' ? ARENAS.find((a) => a.id === battle.arenaId)?.roundCounts : [3, 3]; }
export function grindfestMonsterBounds(round){if(!Number.isInteger(round)||round<1||round>1000)throw new RangeError('Invalid Grindfest round');const max=Math.min(10,3+Math.floor((round-1)/125));return {min:Math.max(1,max-2),max};}
function currentEnemyCount(battle){return battle.kind==='grindfest'?battle.waveMonsterCount:encounterCounts(battle)?.[battle.round-1];}
function totalRounds(battle){return battle.kind==='grindfest'?1000:encounterCounts(battle)?.length;}
function spawnWave(state) {
  const battle = state.battle;
  battle.enemyEffects = {};
  if(battle.kind==='grindfest'){const range=grindfestMonsterBounds(battle.round);battle.waveMonsterCount=randomInt(state,range.min,range.max);}
  const count = currentEnemyCount(battle);
  const templates = battle.kind !== 'training' ? Array.from({length:count},(_,i)=>TRAINING_WAVES[(battle.round-1)%2][(i+battle.round-1)%3]) : TRAINING_WAVES[battle.round - 1];
  battle.enemies = templates.map((template,index)=>({
    id: `${battle.id}-r${battle.round}-e${index+1}`, name:template.name,title:template.title,kind:template.kind,
    level:battle.kind==='grindfest'?state.player.level:battle.kind==='arena'?battle.entryLevel:template.level,powerLevel:battle.kind==='training'?0:100,
    hp:template.maxHp,maxHp:template.maxHp,scanned:false,resistances:{...template.resistances},attack:template.attack,
  }));
  battle._schedule = battle.enemies.map((enemy,index)=>({id:enemy.id,nextAt:battle.timeUnits+randomInt(state,10,100),interval:templates[index].interval}));
  battle.targetId=battle.enemies[0].id;
}

function startBattleUnsafe(state, options = {}) {
  if (isActive(state)) return failure('演練尚未結束');
  if(!Number.isSafeInteger(state._nextBattle)||state._nextBattle<1||state._nextBattle>=Number.MAX_SAFE_INTEGER)return failure('戰鬥序號無效或已達上限');
  const kind = ['arena','grindfest'].includes(options.kind)?options.kind:'training';
  if(kind==='arena'&&state.inventory.some(i=>i.id===`reward-arena-${state._nextBattle}`))return failure('下一場戰鬥的獎勵識別碼已存在');
  let reservation = null;
  if (kind === 'arena') {
    if (state.progression?.kind !== 'experience-ledger') return failure('既有演練角色保留原狀；需建立 EXP 帳本新角色才可進入獎勵競技場');
    reservation = reserveArena(state.activities,options.arenaId,state.player.level,options.nowMs,`arena-${state._nextBattle}`);
    if (!reservation.ok) return failure(reservation.error);
  }
  if(kind==='grindfest'){if(state.progression?.kind!=='experience-ledger')return failure('Grindfest 需要 EXP 帳本角色，舊版演練角色保留原狀');reservation=reserveGrindfest(state.activities,state.grindfest,{battleId:`grindfest-${state._nextBattle}`,nowMs:options.nowMs});if(!reservation.ok)return reservation;}
  const events = [...recoverOutOfCombat(state).events];
  state.battle = {
    id: `${kind}-${state._nextBattle++}`, kind, arenaId:reservation?.definition?.id||null, entryDay:reservation?.entryDay||null, entryLevel:state.player.level, entryStamina:kind==='grindfest'?reservation.staminaBefore:reservation?.stamina??null, status: 'active', phase: 'combat', round: 1, rounds:kind==='grindfest'?1000:reservation?.definition?.rounds||TRAINING_WAVES.length,
    turn: 0, ticks: 0, timeUnits: 0, targetId: null, enemies: [], log: [],
    cooldowns: Object.fromEntries(ACTIONS.map((action) => [action.id, 0])),
    statusRules:SEARING_POLICY.id, enemyEffects:{}, trainingRules:TRAINING_POLICY.battleModel, adeptRankAtEntry:state.training.adeptRank, vitalRules:state.vitalRules, curativeRules:CURATIVE_POLICY.id, abilityRules:ABILITY_POLICY.id, restorativeRules: RESTORATIVE_POLICY.id, equipmentRules: GENERATION_POLICY.model, accuracyRules:ACCURACY_POLICY.id, offenseRules: OFFENSE_POLICY.id, combatRules: COMBAT_RESOURCE_POLICY.id, _regenCarry: {mp:0,sp:0},
    spiritActive: false, effects: { defend: 0, focus: 0 },
    _schedule: [], _nextTick: 100, logOmitted:0, _settled: false, ...(kind==='grindfest'?{waveMonsterCount:0}:{}),
  };
  spawnWave(state);
  emit(state, events, kind==='grindfest'?'Grindfest · 第 1 / 1000 波。已支付 1 體力；完整波數／費用／EXP／通關獎勵有來源，怪物與漸進傷害為樣本；一般／水晶掉落待施工。':kind==='arena'?`${reservation.definition.name} · 第 1 / ${reservation.definition.rounds} 波。採來源波次、原創怪物／PL100 樣本；獎勵取整為候選。`:'裂隙演練開始 · 第 1 / 2 波。怪物與數值為原創訓練樣本，不發放獎勵。', 'round');
  return success(events);
}

export function startBattle(state,options={}){return transactGame(state,draft=>startBattleUnsafe(draft,options));}
export function nextCommandToken(state){return ledgerToken(state.commandLedger);}
export function getCommandReceiptsForBattle(state,battleId=state.battle?.id){return state.commandLedger.receipts.filter(r=>r.battleId===battleId).map(clone);}
export function startGrindfest(state,nowMs=Date.now()){return startBattle(state,{kind:'grindfest',nowMs});}
export function startArena(state, arenaId, nowMs = Date.now()) { return startBattle(state,{kind:'arena',arenaId,nowMs}); }

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
    resistances: { ...enemy.resistances }, attack: enemy.attack, powerLevel:enemy.powerLevel });
  return view;
}

/** Only already-applied status is public, independent of Scan-only enemy stats. */
export function getEnemyEffects(state,enemyId){
  const battle=state.battle,effect=battle?.enemyEffects?.[enemyId];
  if(!battle||battle.status!=='active'||battle.statusRules!==SEARING_POLICY.id||!effect||!battle.enemies.some(e=>e.id===enemyId&&e.hp>0))return [];
  const ticks=effect.expiresAtTick-battle.ticks;
  return Number.isSafeInteger(ticks)&&ticks>0&&ticks<=SEARING_POLICY.durationTicks?[{id:'searing-skin',name:'灼熱肌膚',ticks,damageReductionPercent:10}]:[];
}

function effectiveSpirit(state) {
  return Boolean(state.battle?.spiritActive && state.player.overcharge > 30 && state.player.sp > 0);
}
function modernRestoratives(state){return !isActive(state)||state.battle.restorativeRules===RESTORATIVE_POLICY.id;}
function modernResources(state) { return !isActive(state) || state.battle.combatRules === COMBAT_RESOURCE_POLICY.id; }
function manaCost(state, action) {
  const spell=SPELL_RESOURCES[action.id];
  if(modernResources(state)&&spell)return spellManaCost({level:state.player.level,baseCost:spell.baseCost,spiritStance:effectiveSpirit(state)});
  return action.mana ? Math.ceil(action.mana * (effectiveSpirit(state) ? 0.75 : 1)) : 0;
}
export function getCureProfile(state){
  const stats=getStats(state),rank=isActive(state)&&state.battle.curativeRules===CURATIVE_POLICY.legacy?0:activeCureRank(state),spec=rank?ALL_ABILITIES.betterCure.ranks[rank-1]:null;
  return {rank,potencyPercent:spec?.potencyPercent??null,supportiveProficiency:CURATIVE_POLICY.supportiveProficiency,sourceBased:rank>0,amount:spec?cureHealingAmount({baseHp:stats.baseHp,level:state.player.level,potencyPercent:spec.potencyPercent,supportiveProficiency:CURATIVE_POLICY.supportiveProficiency}):Math.floor(stats.baseHp*.3+stats.healingMagicFixture*.4),cooldown:spec?spec.cooldown:modernResources(state)?SPELL_RESOURCES.cure.cooldown:actionById('cure').cooldown};
}
function actionCooldown(state,action){if(action.id==='cure')return getCureProfile(state).cooldown;if(action.item&&modernRestoratives(state))return RESTORATIVE_POLICY[action.id].cooldown;return modernResources(state)&&SPELL_RESOURCES[action.id]?SPELL_RESOURCES[action.id].cooldown:action.cooldown||0;}
function naturalTick(state,events){const rates=naturalRegenRates(state.player.attributes),stats=getStats(state),recovered={};for(const key of ['mp','sp']){const result=recoverWholeUnits(state.player[key],key==='mp'?stats.maxMp:stats.maxSp,state.battle._regenCarry[key],rates[key+'Units']);state.player[key]=result.value;state.battle._regenCarry[key]=result.carry;recovered[key]=result.amount;}if(recovered.mp||recovered.sp)emit(state,events,`自然回復：+${recovered.mp} MP / +${recovered.sp} SP（tick ${state.battle.ticks}）`,'regen',recovered);}
function actionError(state, action, targetId) {
  if (!isActive(state)) return '目前沒有進行中的演練';
  if (!action) return '未知的行動';
  if(modernResources(state)&&SPELL_RESOURCES[action.id]&&state.player.level<SPELL_RESOURCES[action.id].minLevel)return `此法術需要等級 ${SPELL_RESOURCES[action.id].minLevel}（基礎熟練度 0）`;
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
    const impactNotice=['attack','fire'].includes(action.id)?isActive(state)&&state.battle.accuracyRules===ACCURACY_POLICY.legacy?' 本場沿用舊版單次命中／8% 單次暴擊。':' 新系列採雙次對抗樣本：一次成功為半傷擦傷，兩次成功才可暴擊；暴擊最多9重、每重+50%。對抗機率與暴擊輸入仍為样本，尚非原版完整命中式。':'';
    const cost = action.item ? `${state.potions[action.item]} 瓶 · 0 時間` : action.mana ? `${manaCost(state, action)} MP` : action.id === 'spirit' ? state.battle?.spiritActive ? '關閉架式' : '50 OC 門檻' : '無消耗';
    return { id: action.id, name: action.name, icon: action.icon, cost,
      description: (action.item?(modernRestoratives(state)?`零內部時間，恢復 ${action.item==='health'?'100% 基礎 HP':'50% 基礎 MP'}，上限封頂；40 道具／一般行動冷卻。基礎資源上限與最終取整仍為明示候選，未授予能力加成。`:`本場保留舊版藥水效果／冷卻。${action.description}`):modernResources(state)&&SPELL_RESOURCES[action.id]?`${action.id==='fire'?'火焰：至多 3 目標，分別命中判定。':getCureProfile(state).sourceBased?'治癒：Better Cure '+getCureProfile(state).rank+' 階，恢復 '+getCureProfile(state).amount+' HP；效力 '+getCureProfile(state).potencyPercent+'，熟練度 0 樣本（成長尚未接入）。':'治癒：未裝配強化或舊系列，保留治療樣本 '+getCureProfile(state).amount+' HP。'}消耗 ceil(等級 × ${SPELL_RESOURCES[action.id].baseCost}% × ${effectiveSpirit(state)?'0.75 靈動折扣':'1（無靈動折扣）'})，目前 ${manaCost(state,action)} MP；冷卻 ${actionCooldown(state,action)} 個非道具行動。${action.id==='cure'?'僅 Better Cure 前兩階已接入；其餘修正未施工。':'能力／裝備修正尚未接入。'}`:!modernResources(state)&&SPELL_RESOURCES[action.id]?`本場沿用舊版固定消耗／冷卻；${action.description}`:action.description)+impactNotice, disabled: Boolean(reason), reason: reason || '', cooldown: state.battle?.cooldowns[action.id] || 0 };
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
  if(resource==='mp'&&state.player.mp===max&&state.battle?._regenCarry)state.battle._regenCarry.mp=0;
  emit(state, events, `${source}恢復 ${recovered} ${resource.toUpperCase()}`, 'heal', { amount: recovered, resource });
}
function settle(state, status, events, nowMs) {
  const battle = state.battle;
  if (battle._settled) return;
  // Prepare all fallible Arena settlement/loot work before committing any reward.
  let arenaSettlement=null,preparedItem=null;
  if(battle.kind==='arena'){
    const activity=clone(state.activities);
    const reward=settleArenaSeries(activity,{battleId:battle.id,arenaId:battle.arenaId,status,entryDay:battle.entryDay,nowMs});
    if(!reward.ok)throw new Error('Arena settlement preflight failed');
    if(!reward.duplicate&&(reward.pendingGuaranteedEquipment||reward.equipmentDropCount>0)&&state.inventory.filter(i=>i.container!=='storage').length<500){
      if(battle.equipmentRules===GENERATION_POLICY.model)preparedItem=generateEquipment({templates:STARTER_ITEMS,id:`reward-${battle.id}`,level:state.player.level,rng:()=>random(state)});
      else {const base=STARTER_ITEMS[randomInt(state,0,STARTER_ITEMS.length-1)];preparedItem=clone(base);preparedItem.id=`reward-${battle.id}`;preparedItem.origin='arena-fixture';preparedItem.level=EQUIPMENT_QUALITIES.indexOf(preparedItem.quality)>=4?state.player.level:null;}
      if(state.inventory.some(i=>i.id===preparedItem.id))throw new Error('Duplicate reward identity');
    }
    if(!Number.isSafeInteger(state.player.credits+reward.credits))throw new Error('Credit settlement overflow');
    arenaSettlement={activity,reward};
  }
  let grindfestSettlement=null;
  if(battle.kind==='grindfest'){const activity=clone(state.activities),ledger=clone(state.grindfest),reward=settleGrindfestSeries(activity,ledger,{battleId:battle.id,status,nowMs});if(!reward.ok||!Number.isSafeInteger(state.player.credits+reward.credits))throw new Error('Grindfest settlement preflight failed');grindfestSettlement={activity,ledger,reward};}
  battle._settled = true;
  battle.finalVitals = { hp: state.player.hp, mp: state.player.mp, sp: state.player.sp };
  battle.status = status;
  battle.spiritActive = false;
  battle.effects = { defend: 0, focus: 0 };
  battle.enemyEffects = {};
  state.history.push({ battleId: battle.id, status, turns: battle.turn, rounds: battle.round, kind:battle.kind, arenaId:battle.arenaId });
  if (status === 'victory' && battle.kind === 'training') {
    state.achievements.trainingClears++;
    emit(state, events, '演練完成。已記錄通關；此訓練不發放 EXP、Credits 或掉落。', 'victory');
  } else if(status==='victory'&&battle.kind==='grindfest')emit(state,events,'Grindfest 1000 波完成，正在結算通關獎勵。','victory');
  else if (status === 'victory') emit(state,events,'競技場全波次通關，正在結算首次／重複通關獎勵。','victory');
  else if (status === 'defeat') emit(state, events, '你已倒下。演練結束；敗北結果已記錄。', 'defeat');
  else emit(state, events, '已撤離裂隙。沒有獎勵或原版活動次數變更。', 'flee');
  if (battle.kind === 'arena') {
    const {activity,reward}=arenaSettlement;
    Object.assign(state.activities,activity);
    if (reward.ok && !reward.duplicate) {
      state.player.credits += reward.credits;
      emit(state,events,`競技場結算：${reward.credits} Credits${reward.firstClear?'（首次通關）':''}；本日入場次數已使用。`,'reward');
      if (reward.pendingGuaranteedEquipment || reward.equipmentDropCount > 0) {
        if (state.inventory.filter(i=>i.container!=='storage').length>=500) emit(state,events,'隨身裝備已達 500 件；本次通關裝備依容量規則丟棄。','reward');
        else {
          const item=preparedItem;
          state.inventory.push(item);
          emit(state,events,`獲得 ${item.name}（${item.generation?item.quality+' · 逐項品質 roll；權重與數值投影為樣本':'原創固定樣本池；非原版生成權重'}）`,'reward',{itemId:item.id});
        }
      }
    } else if (!reward.ok) emit(state,events,`獎勵結算異常，未發放：${reward.error}`,'error');
  }
  if(grindfestSettlement){const {activity,ledger,reward}=grindfestSettlement;state.activities=activity;state.grindfest=ledger;if(!reward.duplicate){state.player.credits+=reward.credits;emit(state,events,`Grindfest 結算：${reward.credits} Credits；已完成波次 EXP 保留，入場體力不退還。`,'reward');}}
  if (state._pendingHandNormalization) {
    state.equipped.offhand = null;
    delete state._pendingHandNormalization;
    emit(state, events, '舊存檔的雙手法杖／副手組合已於戰鬥結束後校正；副手物品仍在庫存。', 'equipment');
  }
  const recovery = recoverOutOfCombat(state);
  events.push(...recovery.events);
  battle.log.push(...recovery.events);
}

function enemyAttack(state, enemy, events, focused, nowMs) {
  const stats = getStats(state);
  // No enemy intent or future random choice is generated until this event is due.
  const hit = random(state) < (focused ? 1 : 0.9);
  if (!hit) {
    emit(state, events, `避開了${enemy.name}的攻擊`, 'miss', { actor: enemy.id });
    return;
  }
  const defended = state.battle.effects.defend > 0;
  const raw = enemy.attack * (0.9 + random(state) * 0.2) * (state.battle.kind==='grindfest'?(500+4*(state.battle.round-1))/1000:1);
  const damage = Math.max(1, Math.floor(raw * (100 / (100 + stats.defense * 2)) * (defended ? 0.75 : 1) * searingDamageFactor(state.battle.enemyEffects,enemy.id,state.battle.ticks)));
  state.player.hp = Math.max(0, state.player.hp - damage);
  emit(state, events, `${enemy.name}造成 ${damage} 點傷害${defended ? '（防禦中）' : ''}`, 'enemy', { actor: enemy.id, amount: damage });
  if (state.player.hp === 0) settle(state, 'defeat', events, nowMs);
}

function advanceTime(state, units, events, focused, nowMs, suppressRegen=false) {
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
      for(const id of expiredSearingIds(battle.enemyEffects,battle.ticks)){delete battle.enemyEffects[id];const enemy=battle.enemies.find(e=>e.id===id);emit(state,events,`${enemy.name}的灼熱肌膚已消退`,'status',{targetId:id});}
      if(modernResources(state)&&!suppressRegen)naturalTick(state,events);
    } else {
      due.nextAt += due.interval;
      const enemy = battle.enemies.find((entry) => entry.id === due.id);
      enemyAttack(state, enemy, events, focused, nowMs);
    }
  }
  if (battle.status === 'active') battle.timeUnits = end;
}

/** Accepted commands are atomic synchronous mutations; rejected commands leave state byte-for-byte unchanged. */
function performActionUnsafe(state, actionId, targetId, commandId, nowMs = Date.now()) {
  const battle = state.battle;
  const normalizedTarget = targetId ?? battle?.targetId ?? null;
  const token=commandId===undefined?nextCommandToken(state):commandId;
  const inspected=inspectCommand(state.commandLedger,token,actionId,targetId===undefined?undefined:normalizedTarget);
  if(!inspected.ok)return {...inspected,error:commandError(inspected.code)};
  if(inspected.duplicate)return inspected;
  if (['arena','grindfest'].includes(battle?.kind) && (!Number.isSafeInteger(nowMs) || nowMs < state.activities.lastRegenAt || !validateActivityState(state.activities))) return failure('本機活動時間或資料無效，未執行行動');
  const action = actionById(actionId);
  const error = actionError(state, action, normalizedTarget);
  if (error) return failure(error);
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
    const targets=isFire&&modernResources(state)?[target,...battle.enemies.filter(e=>e.hp>0&&e.id!==target.id)].slice(0,SPELL_RESOURCES.fire.targets):[target];
    for(const victim of targets){
      const accuracy = isFire ? stats.accuracy * (focused ? 2 : 1) : stats.accuracy;
      const modern=battle.accuracyRules===ACCURACY_POLICY.id;
      const impact=modern?sampleOutgoingImpact(accuracy,()=>random(state)):{hit:random(state)*100<Math.min(100,accuracy),glancing:false,criticalHits:0};
      if (impact.hit) {
        const critical = modern?impact.critical:random(state)<0.08;
        const criticalHits=modern?impact.criticalHits:critical?1:0;
        let damage;
        if(battle.offenseRules===OFFENSE_POLICY.id){
          damage=outgoingDamage({base:isFire?stats.magic:stats.attack,kind:isFire?'fire':'physical',rollPercent:randomInt(state,80,120),critical,criticalHits,glancing:impact.glancing,spiritStance:spirit,generalMitigation:isFire?0:victim.resistances.physical,specificMitigation:isFire?victim.resistances.fire:0});
        }else{
          const base = isFire ? stats.magic * 1.7 : stats.attack * (spirit ? 2 : 1);
          const mitigation = victim.resistances[isFire ? 'fire' : 'physical'];
          damage = Math.max(1, Math.floor(base * (0.9 + random(state) * 0.2) * (1 - mitigation) * (critical ? 1.5 : 1)));
        }
        victim.hp = Math.max(0, victim.hp - damage);
        emit(state, events, `${isFire ? '烈焰衝擊' : '普通攻擊'}命中${victim.name}：${damage}${modern&&impact.glancing?'（擦傷 ×0.5）':critical?modern?'（'+criticalHits+' 重暴擊）':'（暴擊）':''}`, isFire ? 'magic' : 'attack', { targetId: victim.id, amount: damage, critical, ...(modern?{criticalHits,glancing:impact.glancing}:{}) });
        if (!isFire) state.player.overcharge = Math.min(RULES.overchargeCap, state.player.overcharge + randomInt(state, 5, 10));
        if (victim.hp === 0){delete battle.enemyEffects[victim.id];emit(state, events, `${victim.name}已被擊倒`, 'kill', { targetId: victim.id });}
        else if(isFire&&battle.statusRules===SEARING_POLICY.id&&rollSearing(random(state))){const refresh=Object.hasOwn(battle.enemyEffects,victim.id);battle.enemyEffects[victim.id]=createSearingEffect(battle.ticks);emit(state,events,`${victim.name}${refresh?'的灼熱肌膚已刷新':'受到灼熱肌膚'}：傷害降低 10%，持續 3 tick（候選規則）`,'status',{targetId:victim.id});}
      } else emit(state, events, `${isFire ? '烈焰衝擊' : '普通攻擊'}未命中${victim.name}`, 'miss', { targetId: victim.id });
    }
  } else if (action.id === 'cure') heal(state, events, 'hp', getCureProfile(state).amount, '治癒');
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
      heal(state, events, 'mp', stats.baseMp * 0.05, '專注');
    }
    emit(state, events, '專注：下次行動的法術命中提高；下次行動無法閃避', 'status');
  } else if (action.id === 'spirit') {
    battle.spiritActive = !wasSpirit;
    emit(state, events, battle.spiritActive ? '靈動架式啟動' : '靈動架式關閉', 'status');
  } else if (action.item) {
    state.potions[action.item]--;
    heal(state, events, action.item === 'health' ? 'hp' : 'mp', modernRestoratives(state)?restorativeAmount(action.id,action.item==='health'?stats.baseHp:stats.baseMp):action.item === 'health' ? stats.maxHp * 0.5 : stats.maxMp * 0.4, action.name);
  } else if (action.id === 'flee') emit(state, events, '正在撤離……', 'status');
  battle.cooldowns[action.id] = actionCooldown(state,action);
  advanceTime(state, actionTime(state, action), events, focused, nowMs, action.id==='spirit'&&!wasSpirit);
  if (battle.status === 'active') {
    for (const effect of ['defend', 'focus']) battle.effects[effect] = Math.max(0, battle.effects[effect] - 1);
    if (battle.spiritActive && (state.player.overcharge <= 20 || state.player.sp <= 0)) {
      battle.spiritActive = false;
      emit(state, events, '靈動架式耗盡，恢復一般姿態', 'status');
    }
    if (action.id === 'flee') settle(state, 'fled', events, nowMs);
    else if (battle.enemies.every((enemy) => enemy.hp === 0)) {
      if (['arena','grindfest'].includes(battle.kind)) {
        const input={battleId:battle.id,arenaId:battle.arenaId,round:battle.round,monsters:battle.enemies.map(e=>({level:e.level,powerLevel:e.powerLevel})),nowMs};
        const trainingRank=battle.trainingRules===TRAINING_POLICY.battleModel?battle.adeptRankAtEntry:0;
        const reward=battle.kind==='grindfest'?settleGrindfestRound(state.activities,state.grindfest,{battleId:input.battleId,round:input.round,monsters:input.monsters,nowMs},trainingRank):settleArenaRound(state.activities,input,trainingRank);
        if(battle.kind==='grindfest'&&!reward.ok)throw new Error('Grindfest round settlement failed');
        if (reward.ok && !reward.duplicate) {
          const earned=grantExperience(state,reward.xp);
          emit(state,events,`本波完成：+${earned.received||0} EXP，體力 −${reward.staminaCost.toFixed(2)}（候選結算）${trainingRank?` · Adept +${trainingRank}%`:""}`,'reward');
          for(const level of earned.levels||[]) emit(state,events,`升至 Lv.${level.level}；+1 AP${level.masteryPoints?'、+1 Mastery':''}${battle.abilityRules!=='none-v1'?'已加入能力資格帳本；不會自動學習或裝配。':'已記錄，能力介面待接入。'}`,'level');
        } else if(!reward.ok) emit(state,events,`EXP 結算異常：${reward.error}`,'error');
      }
      if (battle.round === battle.rounds) settle(state, 'victory', events, nowMs);
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
  const recorded=appendCommandReceipt(state.commandLedger,token,{battleId:battle.id,actionId,targetId:normalizedTarget,result});
  return recorded.ok?result:{...recorded,error:commandError(recorded.code)};
}

function commandError(code){return ({'receipt-expired':'此指令已處理，但結果已超過保留期；不會再次執行','legacy-command-retired':'此舊指令結果已退役；新行動需要新版序號，請重新整理介面','command-payload-conflict':'此指令序號已用於不同動作或目標','command-sequence-gap':'指令序號不連續，未執行','invalid-command-token':'指令序號格式無效','invalid-command-payload':'未知動作或目標格式無效','invalid-command-ledger':'指令帳本無效','receipt-too-large':'本次指令紀錄超過安全容量，原進度保留'})[code]||'指令未完成，原進度保留';}
/** All size-growing battle transitions validate and fit before replacing the live state. */
function commitDraft(state,draft){
  const compacted=compactAuditState(draft);
  if(!compacted.ok||!validState(draft)||new TextEncoder().encode(serializeGame(draft)).byteLength>MAX_SAVE_BYTES)return false;
  const removed=Object.keys(state).filter(key=>!Object.hasOwn(draft,key));
  if(!Object.keys(draft).every(key=>Object.getOwnPropertyDescriptor(state,key)?.writable===true)||!removed.every(key=>Object.getOwnPropertyDescriptor(state,key)?.configurable===true))return false;
  for(const key of removed)delete state[key];Object.assign(state,draft);return true;
}
function transactGame(state,operation){try{
  if(!validState(state))return failure('存檔或戰鬥資料無效，未變更進度');
  const draft=clone(state),result=operation(draft);
  if(!result.ok||result.duplicate)return result;
  if(!commitDraft(state,draft))return failure('結算或保存容量驗證未通過，原進度保留');
  return result;
}catch{return failure('結算未完成，原進度保留');}}
export function performAction(state,actionId,targetId,commandId,nowMs=Date.now()){
  return transactGame(state,draft=>performActionUnsafe(draft,actionId,targetId,commandId,nowMs));
}

/** Wall-clock training is collected only by explicitly visiting its out-of-combat screen. */
export function startAdeptTraining(state,nowMs=Date.now(),expectedRevision=state.training?.revision){return transactGame(state,draft=>({...startTraining(draft,nowMs,expectedRevision),events:[]}));}
export function startAbilityBoostTraining(state,nowMs=Date.now(),expectedRevision=state.training?.revision){return transactGame(state,draft=>({...startAbilityBoost(draft,nowMs,expectedRevision),events:[]}));}
export function cancelAbilityBoostTraining(state,nowMs=Date.now(),expectedRevision=state.training?.revision){return transactGame(state,draft=>({...cancelAbilityBoost(draft,nowMs,expectedRevision),events:[]}));}
export function cancelAdeptTraining(state,nowMs=Date.now(),expectedRevision=state.training?.revision){return transactGame(state,draft=>({...cancelTraining(draft,nowMs,expectedRevision),events:[]}));}
export function visitTraining(state,nowMs=Date.now()){return transactGame(state,draft=>({...collectTraining(draft,nowMs),events:[]}));}

/** View copies derive bound weapon stats; stored anchors and quality rolls never change. */
export function getEffectiveEquipment(state,itemOrId){const id=typeof itemOrId==='string'?itemOrId:itemOrId?.id,item=state.inventory.find(i=>i.id===id);if(!item)return null;return {...item,...effectiveEquipmentStats(item,state.player.level,state.soulbinding?.bindings?.[item.id])};}
export function purchaseSoulFragments(state,quantity,expectedRevision){return transactGame(state,draft=>{const result=purchaseFragments(draft,quantity,expectedRevision);return {...result,events:[]};});}
export function bindWeapon(state,itemId,expectedRevision){return transactGame(state,draft=>{const result=bindSoulWeapon(draft,itemId,expectedRevision);if(!result.ok)return {...result,events:[]};return {...result,events:result.duplicate?[]:recoverOutOfCombat(draft).events};});}

/** Ability ownership and assignment are distinct; changes reconcile outside maxima only. */
function changeAbility(state,operation,args){
  try{
    if(!validState(state))return failure('角色或能力資料無效');
    const draft=clone(state),result=operation(draft,...args);
    if(!result.ok)return result;
    const recovery=recoverOutOfCombat(draft);
    if(!recovery.ok||!validState(draft))return failure('能力變更驗證未通過，原進度保留');
    if(!Object.keys(draft).every(key=>Object.getOwnPropertyDescriptor(state,key)?.writable===true))return failure('能力資料為唯讀，原進度保留');
    Object.assign(state,draft);
    return {...result,events:recovery.events};
  }catch{return failure('能力变更未完成，原進度保留');}
}
export function purchaseAbility(state,id,expectedRank=state.abilities?.purchased?.[id]){
  if(expectedRank!==state.abilities?.purchased?.[id])return failure('能力階級已變更，請重新確認');
  return changeAbility(state,purchaseRank,[id]);
}
export function setMajorAbility(state,id,slotIndex){if(ALL_ABILITIES[id]?.slotType!=='major')return failure('此能力不屬於 Major');return changeAbility(state,assignMajor,[id,slotIndex]);}
export function setSupportiveAbility(state,id,slotIndex){if(ALL_ABILITIES[id]?.slotType!=='supportive')return failure('此能力不屬於 Supportive');return changeAbility(state,assignMajor,[id,slotIndex]);}
export function clearSupportiveAbility(state,slotIndex){return changeAbility(state,unassignMajor,[slotIndex,'supportive']);}
export function clearMajorAbility(state,slotIndex){return changeAbility(state,unassignMajor,[slotIndex]);}
export function resetPurchasedAbility(state,id){return changeAbility(state,resetOwnedAbility,[id]);}

/** Existing profiles retain their original resource model until this explicit outside-combat opt-in. */
export function getVitalUpgradeQuote(state){
  try{
    if(!validState(state))return failure('角色或資源模型資料無效');
    if(isActive(state))return failure('戰鬥系列尚未結束，不能更換資源模型');
    if(state.vitalRules!==VITAL_POLICY.legacy)return failure('目前已採來源資源候選式');
    const before=getStats(state),preview=clone(state);preview.vitalRules=VITAL_POLICY.id;
    return {ok:true,fromModel:state.vitalRules,toModel:VITAL_POLICY.id,before,after:getStats(preview)};
  }catch{return failure('無法建立資源模型預覽');}
}
export function upgradeVitalModel(state,expectedModel=VITAL_POLICY.legacy){
  const quote=getVitalUpgradeQuote(state);
  if(!quote.ok)return quote;
  if(expectedModel!==state.vitalRules)return failure('資源模型已變更，請重新確認');
  const draft=clone(state);draft.vitalRules=VITAL_POLICY.id;
  const recovery=recoverOutOfCombat(draft);
  if(!recovery.ok||!validState(draft)||!Object.keys(draft).every(key=>Object.getOwnPropertyDescriptor(state,key)?.writable===true))return failure('資源模型變更未完成，原進度保留');
  Object.assign(state,draft);
  return {ok:true,events:recovery.events,fromModel:quote.fromModel,toModel:quote.toModel};
}

/** Explicit non-combat-command wave continuation; no time, upkeep or cooldown decrement. */
function continueRoundUnsafe(state) {
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

export function continueRound(state){return transactGame(state,continueRoundUnsafe);}

export function getEquipmentEligibility(state, itemId) {
  if (isActive(state)) return { ok: false, error: '戰鬥中不能更換裝備', unequipIds: [] };
  const item = state.inventory.find((entry) => entry.id === itemId);
  if (!item) return { ok: false, error: '找不到這件裝備', unequipIds: [] };
  const permission=equipmentActionPermission(item,'equip');
  if(!permission.allowed)return {ok:false,error:permission.reason,unequipIds:[]};
  if (item.level !== null && item.level > state.player.level) return { ok: false, error: `裝備等級 ${item.level} 高於角色等級 ${state.player.level}`, unequipIds: [] };
  if (state.equipped[item.slot] === item.id) return { ok: false, error: '這件裝備已穿戴', unequipIds: [] };
  const mainhand = state.inventory.find((entry) => entry.id === state.equipped.weapon);
  if (item.slot === 'offhand' && mainhand?.hands === 2) return { ok: false, error: '目前主手是雙手武器；請先改用單手武器', unequipIds: [] };
  return { ok: true, error: '', unequipIds: item.slot === 'weapon' && item.hands === 2 && state.equipped.offhand ? [state.equipped.offhand] : [] };
}
export function equipItem(state, itemId) {
  const eligibility = getEquipmentEligibility(state, itemId);
  if (!eligibility.ok) return failure(eligibility.error);
  const item = state.inventory.find((entry) => entry.id === itemId);
  const events = [];
  for (const id of eligibility.unequipIds) {
    state.equipped.offhand = null;
    const offhand = state.inventory.find((entry) => entry.id === id);
    events.push({ id: `event-${state._nextEvent++}`, text: `雙手武器需占用雙手；已卸下${offhand.name}，物品仍保留在庫存`, type: 'equipment' });
  }
  if (item.level === null) {
    item.level = state.player.level;
    events.push({ id: `event-${state._nextEvent++}`, text: `${item.name}首次裝備，等級固定為 ${item.level}；之後不隨角色自動提升`, type: 'equipment' });
  }
  state.equipped[item.slot] = item.id;
  const stats = getStats(state);
  state.player.hp = Math.min(state.player.hp, stats.maxHp);
  state.player.mp = Math.min(state.player.mp, stats.maxMp);
  state.player.sp = Math.min(state.player.sp, stats.maxSp);
  events.push({ id: `event-${state._nextEvent++}`, text: `已裝備${item.name}`, type: 'equipment' }, ...recoverOutOfCombat(state).events);
  return success(events);
}
export function setItemProtected(state, itemId, protectedFlag) {
  if (typeof protectedFlag !== 'boolean') return failure('保護標記格式錯誤');
  return setEquipmentProtection(state,itemId,protectedFlag?'protected':'none');
}
export function getAttributeQuote(state, key, delta = 1) {
  if (state.progression?.kind === 'experience-ledger') return quoteAttributeChange(state.player.attributes, key, delta, state.progression.unspent);
  if (delta !== 1) return { ok: false, error: '舊版演練角色保留原本加點方式；EXP 配置適用新角色' };
  if (!ATTRIBUTE_KEYS.includes(key)) return { ok: false, error: '未知的屬性' };
  return state.player.attributePoints > 0 ? { ok: true, cost: 1, from: state.player.attributes[key], to: state.player.attributes[key] + 1 } : { ok: false, error: '沒有可配置的舊版演練屬性點' };
}
export function spendAttribute(state, key, delta = 1) {
  if (isActive(state)) return failure('戰鬥中不能配置屬性');
  if (state.progression?.kind === 'experience-ledger') {
    const result = applyAttributeChange(state.player.attributes, state.progression, key, delta);
    if (!result.ok) return failure(result.error);
    const recovery = recoverOutOfCombat(state);
    return { ...result, events: recovery.events };
  }
  const quote = getAttributeQuote(state, key, delta);
  if (!quote.ok) return failure(quote.error);
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
function canonicalBattleId(id,kind,nextBattle){
  if(typeof id!=='string')return false;
  const match=/^(training|arena|grindfest)-([1-9]\d*)$/.exec(id);
  return Boolean(match&&match[0]===id&&(!kind||match[1]===kind)&&Number.isSafeInteger(Number(match[2]))&&Number(match[2])<nextBattle);
}
function validBattleLinks(state){
  const current=state.battle,pending=[];
  if(current&&(!canonicalBattleId(current.id,current.kind,state._nextBattle)||Number(current.id.split('-')[1])!==state._nextBattle-1))return false;
  if(!state.history.every(h=>canonicalBattleId(h.battleId,h.kind||'training',state._nextBattle))||new Set(state.history.map(h=>h.battleId)).size!==state.history.length)return false;
  for(const [arenaId,days]of Object.entries(state.activities.attempts))for(const attempt of Object.values(days)){
    if(attempt.battleId!==null&&!canonicalBattleId(attempt.battleId,'arena',state._nextBattle))return false;
    if(attempt.status==='reserved')pending.push({arenaId,...attempt});
  }
  if(current?.status==='active'&&current.kind==='arena'){
    if(pending.length!==1||pending[0].arenaId!==current.arenaId||pending[0].entryDay!==current.entryDay||pending[0].battleId!==null&&pending[0].battleId!==current.id)return false;
    if(state.inventory.some(i=>i.id===`reward-${current.id}`)||state.history.some(h=>h.battleId===current.id))return false;
  }else if(pending.length)return false;
  const gf=state.grindfest?.current;
  if(gf){if(gf.lastSettledAt>state.activities.lastRegenAt)return false;if(!canonicalBattleId(gf.battleId,'grindfest',state._nextBattle))return false;if(gf.status==='active'&&(current?.kind!=='grindfest'||current.id!==gf.battleId||current.status!=='active'))return false;}
  if(current?.kind==='grindfest'){if(!gf||gf.battleId!==current.id||gf.status!==current.status||gf.completedRounds!==(current.status==='victory'||current.phase==='round-complete'?current.round:current.round-1))return false;}
  return true;
}
function validState(state,{legacyAudit=false}={}) {
  if (!plain(state) || state.schemaVersion !== (legacyAudit?1:SCHEMA_VERSION) || state.rulesVersion !== RULES_VERSION || state.mode !== 'Persistent') return false;
  if(![VITAL_POLICY.id,VITAL_POLICY.legacy].includes(state.vitalRules))return false;
  if(!legacyAudit){const keys=['schemaVersion','rulesVersion','mode','vitalRules','player','inventory','equipped','potions','battle','activities','grindfest','levelRewards','supplies','soulbinding','training','abilities','audit','commandLedger','history','achievements','externalBonuses','_rng','_nextBattle','_nextEvent','progression','_pendingHandNormalization'];if(Object.keys(state).some(k=>!keys.includes(k))||!validateCommandLedger(state.commandLedger))return false;}
  if (!integer(state._rng, 1, 0xffffffff) || !integer(state._nextBattle, 1) || !integer(state._nextEvent, 1)) return false;
  if (!plain(state.player) || !plain(state.player.attributes) || !safeText(state.player.name, 80)) return false;
  if(!legacyAudit){const only=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));if(!only(state.potions,['health','mana'])||!only(state.achievements,['trainingClears'])||!only(state.externalBonuses,Object.keys(RULES.externalBonuses)))return false;if(!Array.isArray(state.levelRewards)||state.levelRewards.length>499||new Set(state.levelRewards.map(r=>r.level)).size!==state.levelRewards.length||state.levelRewards.some(r=>!plain(r)||Object.keys(r).some(k=>!['level','abilityPoints','masteryPoints','status'].includes(k))||r.level>state.player.level||r.status!==undefined&&!safeText(r.status,80)))return false;}
  const player = state.player;
  if(!legacyAudit&&Object.keys(player).some(k=>!['name','level','xp','xpNext','attributePoints','attributes','hp','mp','sp','overcharge','credits'].includes(k)))return false;
  if (!plain(state.progression)) return false;
  if (state.progression.kind === 'experience-ledger') {
    if (!validateExperienceLedger(player.attributes, state.progression) || state.progression.earned !== player.xp || player.attributePoints !== 0) return false;
  } else if (state.progression.kind !== 'legacy-fixture' || Object.keys(state.progression).length !== 1) return false;
  if(!validateTrainingState(state.training)||state.training.abilityBoostRank>player.level||!validateAbilityState(state.abilities,player.level,state.progression.kind==='experience-ledger',state.training.abilityBoostRank))return false;
  if(state.progression.kind==='experience-ledger'&&(experienceLevel(player.xp)!==player.level||player.xpNext!==experienceThreshold(Math.min(500,player.level+1))))return false;
  if (!integer(player.level, 1, 500) || !ATTRIBUTE_KEYS.every((key) => integer(player.attributes[key], 1, 100000))) return false;
  if (!['hp', 'mp', 'sp', 'xp', 'credits', 'attributePoints'].every((key) => integer(player[key])) || !integer(player.xpNext, 1) || !integer(player.overcharge, 0, 250)) return false;
  if (!Array.isArray(state.inventory) || state.inventory.length < 1 || state.inventory.length > 1000 || !plain(state.equipped)) return false;
  if (new Set(state.inventory.map((item) => item.id)).size !== state.inventory.length) return false;
  for (const item of state.inventory) {
    const original = STARTER_ITEMS.find((entry) => entry.id === item.templateId);
    if (!safeText(item.id) || !/^[a-z0-9][a-z0-9-]{0,199}$/.test(item.id) || !original || typeof item.locked !== 'boolean') return false;
    if(item.origin==='quality-roll-fixture'){if(!validateGeneratedEquipment(item,STARTER_ITEMS,{allowBound:Boolean(state.soulbinding?.bindings?.[item.id])}))return false;}
    else {
      if(!legacyAudit&&Object.keys(item).some(k=>!Object.hasOwn(original,k)))return false;
      if(!['starter-fixture','arena-fixture'].includes(item.origin) || item.generation!==undefined || (item.origin==='starter-fixture'&&item.id!==item.templateId) || (item.origin==='arena-fixture'&&!/^reward-arena-[1-9]\d*$/.test(item.id)))return false;
      if(Object.keys(original).some((key)=>!['id','origin','locked','protected','pinned','container','level','bound'].includes(key)&&item[key]!==original[key]))return false;
    }
    if(!['inventory','storage'].includes(item.container)||typeof item.protected!=='boolean'||typeof item.pinned!=='boolean'||item.protected&&item.locked)return false;
    if(item.container==='storage'&&Object.values(state.equipped).includes(item.id))return false;
    if (item.level !== null && !integer(item.level, 1, 500)) return false;
    if (item.level === null && (EQUIPMENT_QUALITIES.indexOf(item.quality) >= 4 || Object.values(state.equipped).includes(item.id))) return false;
  }
  if (Object.keys(state.equipped).length !== 3 || !['weapon', 'body', 'offhand'].every((slot) => slot === 'offhand' && state.equipped[slot] === null || state.inventory.some((item) => item.id === state.equipped[slot] && item.slot === slot))) return false;
  const countsByContainer=getContainerCounts(state);if(countsByContainer.inventory>500||countsByContainer.storage>500)return false;
  const mainhand = state.inventory.find((item) => item.id === state.equipped.weapon);
  if (state._pendingHandNormalization !== undefined && state._pendingHandNormalization !== true) return false;
  if (mainhand.hands === 2 && state.equipped.offhand !== null && !(state._pendingHandNormalization && isActive(state))) return false;
  if (state._pendingHandNormalization && (!isActive(state) || mainhand.hands !== 2 || state.equipped.offhand === null)) return false;
  if(!validateSoulbindingState(state.soulbinding,state.inventory,player.level))return false;
  const stats = getStats(state);
  if (player.hp > stats.maxHp || player.mp > stats.maxMp || player.sp > stats.maxSp) return false;
  if(!validateSupplyState(state.supplies)||!validateGrindfestState(state.grindfest)||!validateTrainingState(state.training))return false;
  if(state.progression.kind==='legacy-fixture'&&state.training.revision!==0)return false;
  if (!plain(state.potions) || !integer(state.potions.health, 0, 999999) || !integer(state.potions.mana, 0, 999999)) return false;
  if (!plain(state.externalBonuses) || Object.entries(RULES.externalBonuses).some(([key, value]) => state.externalBonuses[key] !== value)) return false;
  if (!(legacyAudit?validateLegacyActivityState:validateActivityState)(state.activities) || !Array.isArray(state.levelRewards) || !state.levelRewards.every(r=>plain(r)&&integer(r.level,2,500)&&r.abilityPoints===1&&r.masteryPoints===(r.level%10===0?1:0))) return false;
  if (!plain(state.achievements) || !integer(state.achievements.trainingClears) || !Array.isArray(state.history)) return false;
  const statuses = ['active', 'victory', 'defeat', 'fled'];
  if (!state.history.every((entry) => plain(entry) && safeText(entry.battleId) && statuses.slice(1).includes(entry.status) && integer(entry.turns) && integer(entry.rounds, 1, entry.kind==='grindfest'?1000:6))) return false;
  if(legacyAudit){if(state.history.filter((entry)=>entry.status==='victory'&&(!entry.kind||entry.kind==='training')).length!==state.achievements.trainingClears)return false;}else if(!validateRetainedHistory(state))return false;
  const validEvent = (event) => plain(event) && safeText(event.id) && safeText(event.text, 2000) && safeText(event.type, 40)
    && (event.amount===undefined||integer(event.amount))
    && (event.critical===undefined||typeof event.critical==='boolean')
    && ['hp','mp','sp'].every(key=>event[key]===undefined||integer(event[key]))
    && ['targetId','actor','itemId'].every(key=>event[key]===undefined||safeText(event[key]))
    && (event.resource===undefined||['hp','mp','sp'].includes(event.resource));
  const validReceipt = (receipt) => plain(receipt) && safeText(receipt.id) && actionById(receipt.actionId) && (receipt.targetId === null || safeText(receipt.targetId)) && receipt.result?.ok === true && Array.isArray(receipt.result.events) && receipt.result.events.every(validEvent);
  if(legacyAudit&&(!Array.isArray(state._commandReceipts)||!state._commandReceipts.every(validReceipt)||new Set(state._commandReceipts.map(receipt=>receipt.id)).size!==state._commandReceipts.length))return false;
  if(!validBattleLinks(state))return false;
  const battle = state.battle;
  if (battle === null) return true;
  if (!plain(battle) || !['training','arena','grindfest'].includes(battle.kind) || !['combat', 'round-complete'].includes(battle.phase) || !safeText(battle.id) || !statuses.includes(battle.status)) return false;
  if(!legacyAudit&&Object.keys(battle).some(k=>!['id','kind','arenaId','entryDay','entryLevel','entryStamina','status','phase','round','rounds','turn','ticks','timeUnits','targetId','enemies','log','cooldowns','statusRules','enemyEffects','trainingRules','adeptRankAtEntry','vitalRules','curativeRules','abilityRules','restorativeRules','equipmentRules','accuracyRules','offenseRules','combatRules','_regenCarry','spiritActive','effects','_schedule','_nextTick','logOmitted','_settled','finalVitals','waveMonsterCount'].includes(k)))return false;
  if(!legacyAudit){const exactKeys=(v,keys)=>plain(v)&&Object.keys(v).length===keys.length&&keys.every(k=>Object.hasOwn(v,k));if(!exactKeys(battle.effects,['defend','focus'])||!exactKeys(battle._regenCarry,['mp','sp'])||!exactKeys(battle.cooldowns,ACTIONS.map(a=>a.id))||battle.finalVitals&&!exactKeys(battle.finalVitals,['hp','mp','sp']))return false;}
  const rounds=totalRounds(battle),count=currentEnemyCount(battle);
  if(!rounds||!integer(battle.round,1,rounds)||battle.rounds!==rounds)return false;
  if(battle.kind==='grindfest'){const range=grindfestMonsterBounds(battle.round);if(!integer(count,range.min,range.max)||battle.arenaId!==null||battle.entryDay!==null||!integer(battle.entryLevel,1,500)||battle.entryStamina!==state.grindfest.current?.entryStamina)return false;}else if(battle.waveMonsterCount!==undefined)return false;
  if(battle.kind==='arena'){
    const attempt=state.activities.attempts[battle.arenaId]?.[battle.entryDay];
    if(!attempt || attempt.battleId!==null&&attempt.battleId!==battle.id || attempt.status!==(battle.status==='active'?'reserved':battle.status) || !integer(battle.entryLevel,1,500))return false;
    const completed=state.activities.settledRounds.filter(r=>r.battleId===battle.id).length;
    if(completed!==(battle.status==='victory'||battle.phase==='round-complete'?battle.round:battle.round-1))return false;
  }
  if (!integer(battle.turn) || !integer(battle.ticks) || !integer(battle.timeUnits) || battle.ticks !== Math.floor(battle.timeUnits / 100) || battle._nextTick !== (battle.ticks + 1) * 100) return false;
  if(![VITAL_POLICY.id,VITAL_POLICY.legacy].includes(battle.vitalRules)||isActive(state)&&battle.vitalRules!==state.vitalRules)return false;
  if(![TRAINING_POLICY.battleModel,'none-v1'].includes(battle.trainingRules)||!integer(battle.adeptRankAtEntry,0,state.training.adeptRank)||battle.trainingRules==='none-v1'&&battle.adeptRankAtEntry!==0||battle.trainingRules===TRAINING_POLICY.battleModel&&isActive(state)&&battle.adeptRankAtEntry!==state.training.adeptRank)return false;
  if(![CURATIVE_POLICY.id,CURATIVE_POLICY.legacy].includes(battle.curativeRules))return false;
  if(![ABILITY_POLICY.id,ABILITY_POLICY.legacyModel,'none-v1'].includes(battle.abilityRules))return false;
  if(![RESTORATIVE_POLICY.id,RESTORATIVE_POLICY.legacy].includes(battle.restorativeRules))return false;
  if(![GENERATION_POLICY.model,'fixed-arena-fixture-v1'].includes(battle.equipmentRules))return false;
  if(![ACCURACY_POLICY.id,ACCURACY_POLICY.legacy].includes(battle.accuracyRules)||battle.accuracyRules===ACCURACY_POLICY.id&&battle.offenseRules!==OFFENSE_POLICY.id)return false;
  if(![OFFENSE_POLICY.id,OFFENSE_POLICY.legacy].includes(battle.offenseRules))return false;
  if(![COMBAT_RESOURCE_POLICY.id,COMBAT_RESOURCE_POLICY.legacy].includes(battle.combatRules)||!plain(battle._regenCarry)||!['mp','sp'].every(k=>integer(battle._regenCarry[k],0,REGEN_SCALE-1)))return false;
  if (typeof battle.spiritActive !== 'boolean' || typeof battle._settled !== 'boolean' || battle._settled !== (battle.status !== 'active')) return false;
  if (battle.status === 'active' && player.hp === 0) return false;
  if (battle.finalVitals !== undefined && (!plain(battle.finalVitals) || !['hp', 'mp', 'sp'].every((key) => integer(battle.finalVitals[key])))) return false;
  if (!plain(battle.effects) || !['defend', 'focus'].every((key) => integer(battle.effects[key], 0, 2))) return false;
  if (!plain(battle.cooldowns) || !ACTIONS.every((action) => integer(battle.cooldowns[action.id], 0, 1000))) return false;
  if (!Array.isArray(battle.enemies) || battle.enemies.length !== count || !Array.isArray(battle._schedule) || battle._schedule.length !== count) return false;
  if(![SEARING_POLICY.id,SEARING_POLICY.legacy].includes(battle.statusRules)||!validateSearingEffects(battle.enemyEffects,battle.enemies,battle.ticks,battle.statusRules===SEARING_POLICY.id,battle.status==='active'))return false;
  if (new Set(battle.enemies.map((enemy) => enemy.id)).size !== count) return false;
  for (const enemy of battle.enemies) {
    if(!legacyAudit&&Object.keys(enemy).some(k=>!['id','name','title','kind','level','powerLevel','hp','maxHp','scanned','resistances','attack'].includes(k)))return false;
    if (!plain(enemy) || !safeText(enemy.id) || !safeText(enemy.name) || !safeText(enemy.title) || !['wolf', 'golem', 'wraith'].includes(enemy.kind)) return false;
    // Only PL0 training and PL100 Arena fixtures are produced by this prototype.
    // This is an import contract, not a claim about the original game's PL cap.
    if(!integer(enemy.powerLevel,0,100)||enemy.powerLevel!==(battle.kind==='training'?0:100))return false;
    if (!integer(enemy.level, 1) || !integer(enemy.maxHp, 1) || !integer(enemy.hp, 0, enemy.maxHp) || !integer(enemy.attack, 0) || typeof enemy.scanned !== 'boolean') return false;
    if(!legacyAudit&&Object.keys(enemy.resistances).some(k=>!['physical','fire'].includes(k)))return false;
    if (!plain(enemy.resistances) || !['fire', 'physical'].every((key) => Number.isFinite(enemy.resistances[key]) && enemy.resistances[key] >= -1 && enemy.resistances[key] <= 1)) return false;
    const schedule = battle._schedule.filter((entry) => entry.id === enemy.id);
    if(!legacyAudit&&schedule.some(entry=>Object.keys(entry).length!==3||Object.keys(entry).some(k=>!['id','nextAt','interval'].includes(k))))return false;
    if (schedule.length !== 1 || !integer(schedule[0].nextAt) || !integer(schedule[0].interval, 1) || (enemy.hp > 0 && schedule[0].nextAt < battle.timeUnits)) return false;
  }
  if (battle.targetId !== null && !battle.enemies.some((enemy) => enemy.id === battle.targetId)) return false;
  if (battle.phase === 'round-complete' && (battle.status !== 'active' || battle.round >= battle.rounds || battle.enemies.some((enemy) => enemy.hp > 0) || battle.targetId !== null)) return false;
  if (battle.status === 'active' && battle.phase === 'combat' && !battle.enemies.some((enemy) => enemy.hp > 0)) return false;
  if (battle.status === 'victory' && (battle.round !== battle.rounds || battle.enemies.some((enemy) => enemy.hp > 0))) return false;
  if(!Array.isArray(battle.log)||!battle.log.every(legacyAudit?validEvent:validateCommandEvent))return false;
  if(legacyAudit){if(!Array.isArray(battle._receipts)||new Set(battle._receipts.map(r=>r.id)).size!==battle._receipts.length||!battle._receipts.every(validReceipt))return false;const oldReceipts=new Map(state._commandReceipts.map(r=>[r.id,JSON.stringify(r)]));if(!battle._receipts.every(r=>oldReceipts.get(r.id)===JSON.stringify(r)))return false;}else if(battle._receipts!==undefined)return false;
  return true;
}
export function serializeGame(state) { return JSON.stringify(state); }
export function restoreGame(json){return restoreSave(json,false);}
export function recoverLegacyGame(json){return restoreSave(json,true);}
function restoreSave(json,recoveryOnly) {
  try {
    const limit=recoveryOnly?MAX_LEGACY_RECOVERY_BYTES:MAX_SAVE_BYTES;
    if(typeof json!=='string'||json.length>limit||new TextEncoder().encode(json).byteLength>limit)return null;
    const state = JSON.parse(json, (key, value) => {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Unsafe save key');
      return value;
    });
    const sourceVersion=state?.rulesVersion,oldSchema=state?.schemaVersion===1,hadAbilities=state?.abilities!==undefined;
    if(recoveryOnly&&!oldSchema)return null;
    // Validate old progress before applying the documented rule-version migration.
    const legacy = ['persistent-0.91-training-v1', 'persistent-0.91-training-v2', 'persistent-0.91-training-v3', 'persistent-0.91-training-v4', 'persistent-0.91-training-v5', 'persistent-0.91-training-v6', 'persistent-0.91-training-v7', 'persistent-0.91-training-v8', 'persistent-0.91-training-v9', 'persistent-0.91-training-v10', 'persistent-0.91-training-v11', 'persistent-0.91-training-v12'].includes(state?.rulesVersion);
    if (oldSchema && legacy) {
      state.rulesVersion = RULES_VERSION;
      if(state.vitalRules===undefined)state.vitalRules=VITAL_POLICY.legacy;
      if(state.battle&&state.battle.vitalRules===undefined)state.battle.vitalRules=state.vitalRules;
      if(state.supplies===undefined)state.supplies=createSupplyState();
      if (state.activities === undefined) state.activities=createLegacyActivityState(0);
      if (state.levelRewards === undefined) state.levelRewards=[];
      if(state.battle&&state.battle.abilityRules===undefined)state.battle.abilityRules='none-v1';
      if(state.battle&&state.battle.restorativeRules===undefined)state.battle.restorativeRules=RESTORATIVE_POLICY.legacy;
      if(state.battle&&state.battle.equipmentRules===undefined)state.battle.equipmentRules='fixed-arena-fixture-v1';
      if(state.battle){if(Object.hasOwn(state.battle,'accuracyRules'))return null;state.battle.accuracyRules=ACCURACY_POLICY.legacy;}
      if(state.battle&&state.battle.offenseRules===undefined)state.battle.offenseRules=OFFENSE_POLICY.legacy;
      if(state.battle&&state.battle.combatRules===undefined){state.battle.combatRules=COMBAT_RESOURCE_POLICY.legacy;state.battle._regenCarry={mp:0,sp:0};}
      if (state.battle && !state.battle.kind) {state.battle.kind='training';state.battle.arenaId=null;state.battle.entryDay=null;state.battle.entryLevel=state.player?.level;state.battle.entryStamina=null;for(const enemy of state.battle.enemies||[])if(enemy.powerLevel===undefined)enemy.powerLevel=0;}
      if (state.progression === undefined) state.progression = { kind: 'legacy-fixture' };
      if(state.abilities===undefined)state.abilities=createAbilityState(state.progression.kind==='experience-ledger');
      if (state.battle && state.battle.phase === undefined) state.battle.phase = 'combat';
      if (Array.isArray(state.inventory)) for (const item of state.inventory) {
        const original = STARTER_ITEMS.find((entry) => entry.id === (item?.templateId||item?.id));
        if(original&&item.protected===undefined){item.protected=Boolean(item.locked);item.locked=false;}
        if(original&&item.pinned===undefined)item.pinned=false;
        if(original&&item.container===undefined)item.container='inventory';
        if(original&&item.category===undefined)item.category=original.category;
        if (original && item.templateId===undefined)item.templateId=original.id;
        if (original && item.origin===undefined)item.origin='starter-fixture';
        if (original && item.hands === undefined) item.hands = original.hands;
        if (original && item.level === undefined) item.level = state.player?.level;
        if (original?.quality === 'Average' && item.quality === 'Fine') item.quality = 'Average';
      }
      // Known legacy staff/shield pair: remove only a verified existing offhand, never an unknown ID.
      if (state.equipped?.weapon === 'staff-ember' && state.inventory?.some((item) => item.id === state.equipped.offhand && item.slot === 'offhand' && STARTER_ITEMS.some((base) => base.id === item.id))) {
        if (isActive(state)) state._pendingHandNormalization = true;
        else state.equipped.offhand = null;
      }
    }
    if(oldSchema&&!legacy)return null;
    if(legacy||['persistent-0.91-training-v13','persistent-0.91-training-v14','persistent-0.91-training-v15','persistent-0.91-training-v16','persistent-0.91-training-v17'].includes(sourceVersion)){if(state.training!==undefined)return null;state.training=createTrainingState();if(state.battle){if(Object.hasOwn(state.battle,'trainingRules')||Object.hasOwn(state.battle,'adeptRankAtEntry'))return null;state.battle.trainingRules='none-v1';state.battle.adeptRankAtEntry=0;}state.rulesVersion=RULES_VERSION;}
    if(legacy||['persistent-0.91-training-v13','persistent-0.91-training-v14','persistent-0.91-training-v15','persistent-0.91-training-v16'].includes(sourceVersion)){if(state.soulbinding!==undefined)return null;state.soulbinding=createSoulbindingState();state.rulesVersion=RULES_VERSION;}
    if(legacy||['persistent-0.91-training-v13','persistent-0.91-training-v14','persistent-0.91-training-v15'].includes(sourceVersion)){if(state.grindfest!==undefined)return null;state.grindfest=createGrindfestState();if(!oldSchema){state.audit=migrateAuditState(state.audit);if(!state.audit)return null;}state.rulesVersion=RULES_VERSION;}
    if(!oldSchema&&['persistent-0.91-training-v13','persistent-0.91-training-v14'].includes(sourceVersion)){
      if(sourceVersion==='persistent-0.91-training-v13'){
      if(state.battle&&Object.hasOwn(state.battle,'accuracyRules'))return null;
      state.rulesVersion=RULES_VERSION;
      if(state.battle)state.battle.accuracyRules=ACCURACY_POLICY.legacy;
      }
      state.rulesVersion=RULES_VERSION;
    }
    if(legacy||['persistent-0.91-training-v13','persistent-0.91-training-v14'].includes(sourceVersion)){
      if(state.battle){if(Object.hasOwn(state.battle,'curativeRules'))return null;state.battle.curativeRules=CURATIVE_POLICY.legacy;}
      if(hadAbilities){const migrated=migrateLegacyAbilityState(state.abilities,state.player?.level,state.progression?.kind==='experience-ledger');if(!migrated.ok)return null;state.abilities=migrated.abilities;}
    }
    if(legacy||['persistent-0.91-training-v13','persistent-0.91-training-v14','persistent-0.91-training-v15','persistent-0.91-training-v16','persistent-0.91-training-v17','persistent-0.91-training-v18'].includes(sourceVersion)){
      if(state.battle){if(Object.hasOwn(state.battle,'statusRules')||Object.hasOwn(state.battle,'enemyEffects'))return null;state.battle.statusRules=SEARING_POLICY.legacy;state.battle.enemyEffects={};}
      state.rulesVersion=RULES_VERSION;
    }
    if(['persistent-0.91-training-v18','persistent-0.91-training-v19'].includes(sourceVersion)){const migrated=migrateTrainingState(state.training);if(!migrated.ok)return null;state.training=migrated.training;state.rulesVersion=RULES_VERSION;}
    if(!validState(state,{legacyAudit:oldSchema}))return null;
    if (legacy && !isActive(state)) {
      if (state.battle && !state.battle.finalVitals) state.battle.finalVitals = { hp: state.player.hp, mp: state.player.mp, sp: state.player.sp };
      const recovery = recoverOutOfCombat(state);
      if (state.battle) state.battle.log.push(...recovery.events);
    }
    if(oldSchema){
      if(state.audit!==undefined||state.commandLedger!==undefined)return null;
      const commands=migrateLegacyReceipts(state._commandReceipts,state.battle?.id??null,state.battle?._receipts.map(r=>r.id)??[]),activities=migrateActivityState(state.activities,state.battle);
      if(!commands||!activities)return null;
      state.commandLedger=commands;state.activities=activities;state.audit=createAuditState(sourceVersion);state.schemaVersion=SCHEMA_VERSION;
      delete state._commandReceipts;if(state.battle){delete state.battle._receipts;state.battle.logOmitted=0;}
      if(!compactAuditState(state).ok)return null;
    }
    if(!validState(state)||new TextEncoder().encode(serializeGame(state)).byteLength>MAX_SAVE_BYTES)return null;
    return state;
  } catch { return null; }
}
