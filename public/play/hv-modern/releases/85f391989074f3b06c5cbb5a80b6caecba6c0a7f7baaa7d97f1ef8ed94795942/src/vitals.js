/** Pure, version-pinned HP/MP/SP candidates. See docs/VITALS.md. */
export const VITAL_POLICY = Object.freeze({
  id: 'source-vitals-candidate-v1',
  model: 'source-vitals-candidate-v1',
  legacy: 'legacy-vitals-fixture-v1',
  source: 'https://ehwiki.org/index.php?title=Character_Stats&oldid=65166#Vitals',
  canonicalSource: 'https://ehwiki.org/wiki/Character_Stats#Vitals',
  sourceRevision: 65166,
  status: 'source candidate; derived formulas and original-server rounding unverified',
  legacyStatus: 'original prototype fixture; compatibility only, not a sourced formula',
  hpConstantChoice: 'current canonical 500; older translation 50 conflict unresolved',
  rounding: 'exact rational Tank tenths, then one final floor per source maximum',
  legacyRounding: 'legacy base SP floor retained before final Tank maximum floor',
  externalPerks: 'none',
  equipmentVitalBonuses: 'none',
  minLevel: 1,
  maxLevel: 500,
  minAttribute: 1,
  maxAttribute: 100000,
});

const ATTRIBUTE_KEYS = Object.freeze(['str', 'dex', 'agi', 'end', 'int', 'wis']);
const POOLS = Object.freeze(['hp', 'mp', 'sp']);
const REQUIRED_INPUT_KEYS = Object.freeze(['level', 'attributes', 'model']);
const INPUT_KEYS = Object.freeze([...REQUIRED_INPUT_KEYS, 'multipliers']);

// JSON-like records only: own enumerable data fields, without coercion or getters.
function recordFields(value, required, allowed, name) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    throw new TypeError(`${name} must be a plain data object`);
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    throw new TypeError(`${name} must be a plain data object`);
  }
  const keys = Reflect.ownKeys(value);
  if (keys.some((key) => !allowed.includes(key))
    || required.some((key) => !keys.includes(key))) {
    throw new TypeError(`${name} must contain only ${allowed.join(', ')}; required: ${required.join(', ')}`);
  }
  const fields = Object.create(null);
  for (const key of keys) {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor?.enumerable || !Object.hasOwn(descriptor, 'value')) {
      throw new TypeError(`${name}.${key} must be an enumerable data property`);
    }
    fields[key] = descriptor.value;
  }
  return fields;
}

function boundedInteger(value, minimum, maximum, name) {
  if (typeof value !== 'number') throw new TypeError(`${name} must be a number`);
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a safe integer from ${minimum} to ${maximum}`);
  }
  return value;
}

function tankTenths(value, name) {
  if (typeof value !== 'number') throw new TypeError(`${name} must be a number`);
  // Restrict to the current, explicitly supplied Tank ranks; no perk stacking.
  for(let tenths=10;tenths<=20;tenths++)if(value===tenths/10)return tenths;
  throw new RangeError(`${name} must be an exact supported Tank tenth from 1 through 2`);
}

// Bounds above keep every intermediate numerator a safe integer. Fractions are
// carried as numerator/denominator through the Tank multiplication, not as floats.
function maximum(numerator, denominator, tenths) {
  return Math.floor((numerator * tenths) / (denominator * 10));
}

/**
 * Calculate an explicit model without changing inputs or reading external state.
 * The caller supplies verified, equipped Tank multipliers; this grants no ability.
 * Omitted multipliers mean hp=mp=sp=1. Supplied records require all three keys.
 * Malformed data types/shapes throw TypeError; unsupported values throw RangeError.
 */
export function calculateVitals(input) {
  const fields = recordFields(input, REQUIRED_INPUT_KEYS, INPUT_KEYS, 'Vitals input');
  const level = boundedInteger(fields.level, VITAL_POLICY.minLevel, VITAL_POLICY.maxLevel, 'level');
  if (typeof fields.model !== 'string') throw new TypeError('model must be a string');
  if (fields.model !== VITAL_POLICY.model && fields.model !== VITAL_POLICY.legacy) {
    throw new RangeError('model must be an explicitly supported VITAL_POLICY identifier');
  }
  const attributes = recordFields(fields.attributes, ATTRIBUTE_KEYS, ATTRIBUTE_KEYS, 'attributes');
  for (const key of ATTRIBUTE_KEYS) {
    boundedInteger(attributes[key], VITAL_POLICY.minAttribute, VITAL_POLICY.maxAttribute, `attributes.${key}`);
  }
  const multipliers = Object.hasOwn(fields, 'multipliers')
    ? recordFields(fields.multipliers, POOLS, POOLS, 'multipliers')
    : { hp: 1, mp: 1, sp: 1 };
  const factors = POOLS.map((pool) => tankTenths(multipliers[pool], `multipliers.${pool}`));

  let baseHp, baseMp, spNumerator, spDenominator;
  if (fields.model === VITAL_POLICY.model) {
    baseHp = 500 + level * 10 + attributes.end * 6;
    baseMp = 10 + level + attributes.wis;
    spNumerator = 5 + ATTRIBUTE_KEYS.reduce((sum, key) => sum + attributes[key], 0);
    spDenominator = 5;
  } else {
    // HP/MP are already integers. Preserve the old base SP floor intentionally.
    baseHp = 150 + attributes.end * 9 + level * 5;
    baseMp = 30 + attributes.int * 2 + attributes.wis * 2;
    spNumerator = Math.floor((40 + attributes.wis * 3) / 4);
    spDenominator = 1;
  }
  return {
    baseHp,
    baseMp,
    baseSp: spNumerator / spDenominator,
    maxHp: maximum(baseHp, 1, factors[0]),
    maxMp: maximum(baseMp, 1, factors[1]),
    maxSp: maximum(spNumerator, spDenominator, factors[2]),
  };
}
