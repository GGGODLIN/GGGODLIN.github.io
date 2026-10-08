/** Pure Searing Skin candidate. Combat scheduling, RNG and state writes belong to the engine. */
export const SEARING_POLICY = Object.freeze({
  id: 'searing-skin-candidate-v1',
  legacy: 'none-v1',
  durationTicks: 3,
  procChance: 0.25,
  damageMultiplier: 0.9,
  sources: Object.freeze({
    spells: 'https://ehwiki.org/index.php?title=Spells&oldid=65260',
    actionSpeed: 'https://ehwiki.org/index.php?title=Action_Speed&oldid=64923',
  }),
  sourceStatus: '10% damage reduction and 3 ticks sourced; tier-1 25% chance is observed',
  durationStatus: 'shared global 100-unit ticks; applied before cast time; expires on third crossed tick',
  eligibilityStatus: 'local candidate: successful Fire hit on a surviving target, including a glance',
  refreshStatus: 'local candidate: replace deadline with current tick + 3; never stack',
  tieOrderStatus: 'local engine candidate; original-server tie order unverified',
  roundingStatus: 'local engine candidate; original-server damage rounding unverified',
  coldStatus: 'sourced Cold resistance -25 deferred; no Cold spell implemented',
});

const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype']);
const validTick = value => Number.isSafeInteger(value) && value >= 0;
const validId = value => typeof value === 'string' && value.length > 0 && !forbiddenKeys.has(value);

// Frozen/null-prototype JSON records are valid. Never read an input property
// before its descriptor proves that it is an own enumerable data property.
// Proxies are outside this JSON-data API; validator failures are still contained.
function dataDescriptors(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return null;
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) return null;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (const key of Reflect.ownKeys(descriptors)) {
    if (typeof key !== 'string' || forbiddenKeys.has(key)) return null;
    const descriptor = descriptors[key];
    if (!descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) return null;
  }
  return descriptors;
}

function effectEntries(effects, tick) {
  if (!validTick(tick)) throw new RangeError('Searing tick must be a nonnegative safe integer');
  const descriptors = dataDescriptors(effects);
  if (!descriptors) throw new RangeError('Searing effects must be a plain data map');
  const entries = [];
  for (const id of Object.keys(descriptors)) {
    const record = dataDescriptors(descriptors[id].value);
    if (!validId(id) || !record || Object.keys(record).length !== 1 || !Object.hasOwn(record, 'expiresAtTick')) {
      throw new RangeError('Searing effect must contain only expiresAtTick');
    }
    const expiry = record.expiresAtTick.value;
    // Past deadlines are allowed here so callers can inspect/clean up a crossed
    // tick. Subtraction avoids overflowing when tick is near MAX_SAFE_INTEGER.
    if (!Number.isSafeInteger(expiry) || expiry < 1 || expiry - tick > SEARING_POLICY.durationTicks) {
      throw new RangeError('Invalid Searing expiry');
    }
    entries.push([id, expiry]);
  }
  return entries;
}

function livingEnemyIds(enemies) {
  if (!Array.isArray(enemies) || Object.getPrototypeOf(enemies) !== Array.prototype) return null;
  const descriptors = Object.getOwnPropertyDescriptors(enemies);
  const length = descriptors.length.value;
  if (Reflect.ownKeys(descriptors).length !== length + 1) return null;
  const known = new Set();
  const living = new Set();
  for (let index = 0; index < length; index++) {
    const descriptor = descriptors[index];
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) return null;
    const enemy = dataDescriptors(descriptor.value);
    if (!enemy || !Object.hasOwn(enemy, 'id') || !Object.hasOwn(enemy, 'hp')) return null;
    const id = enemy.id.value;
    const hp = enemy.hp.value;
    if (!validId(id) || known.has(id) || !Number.isFinite(hp) || hp < 0) return null;
    known.add(id);
    if (hp > 0) living.add(id);
  }
  return living;
}

/** The caller owns the random draw and draw order. No RNG is consumed here. */
export function rollSearing(draw) {
  if (!Number.isFinite(draw) || draw < 0 || draw >= 1) throw new RangeError('Searing draw must be in [0,1)');
  return draw < SEARING_POLICY.procChance;
}

/** A fresh record replaces a prior effect; there is no stack count or duration addition. */
export function createSearingEffect(currentTick) {
  if (!validTick(currentTick) || currentTick > Number.MAX_SAFE_INTEGER - SEARING_POLICY.durationTicks) {
    throw new RangeError('Searing tick must leave room for its expiry');
  }
  return { expiresAtTick: currentTick + SEARING_POLICY.durationTicks };
}

/** Strict, read-only save validation. Disabled and terminal battles retain no effects. */
export function validateSearingEffects(effects, enemies, currentTick, enabled = true, active = true) {
  try {
    if (typeof enabled !== 'boolean' || typeof active !== 'boolean') return false;
    const entries = effectEntries(effects, currentTick);
    const living = livingEnemyIds(enemies);
    if (!living || ((!enabled || !active) && entries.length > 0)) return false;
    return entries.every(([id, expiry]) => living.has(id) && expiry > currentTick);
  } catch {
    return false;
  }
}

/** Inspect a validated map at a later tick without deleting or editing any entry. */
export function expiredSearingIds(effects, tick) {
  return effectEntries(effects, tick).filter(([, expiry]) => expiry <= tick).map(([id]) => id);
}

/** At the expiry tick the effect is already inactive, even before cleanup. */
export function searingDamageFactor(effects, id, tick) {
  if (!validId(id)) throw new RangeError('Searing target must be a nonempty, safe string id');
  const entry = effectEntries(effects, tick).find(([targetId]) => targetId === id);
  return entry && entry[1] > tick ? SEARING_POLICY.damageMultiplier : 1;
}
