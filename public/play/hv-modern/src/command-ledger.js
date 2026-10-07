import { ACTIONS } from './data.js';

export const COMMAND_LEDGER_MODEL = 'ordered-commands-v1';
export const MAX_COMMAND_RECEIPTS = 128;
export const MAX_COMMAND_RECEIPT_BYTES = 256 * 1024;

const actions = new Set(ACTIONS.map(({ id }) => id));
const encoder = new TextEncoder();
const ledgerKeys = ['model', 'highWater', 'receipts', 'evictedLegacy', 'evictedOrdered'];
const payloadKeys = ['battleId', 'actionId', 'targetId', 'result'];
const oldReceiptKeys = ['id', 'actionId', 'targetId', 'result'];
const eventRequired = ['id', 'text', 'type'];
const eventOptional = ['amount', 'critical', 'criticalHits', 'glancing', 'hp', 'mp', 'sp', 'targetId', 'actor', 'itemId', 'resource', 'recovered'];
const resources = ['hp', 'mp', 'sp'];
const nonnegative = value => Number.isSafeInteger(value) && value >= 0;
const positive = value => Number.isSafeInteger(value) && value > 0;
const boundedString = (value, max = 200) => typeof value === 'string' && value.length >= 1 && value.length <= max;
const targetValid = value => value === null || boundedString(value);
const clone = value => JSON.parse(JSON.stringify(value));
const byteLength = value => encoder.encode(JSON.stringify(value)).byteLength;
const failure = (code, error) => ({ ok: false, code, error, events: [] });

// Inspect descriptors before reading values: JSON-shaped data must not execute
// getters, inherit fields, hide metadata, or smuggle symbols into a save.
function objectWithKeys(value, required, optional = []) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  if (proto !== Object.prototype && proto !== null) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (!required.every(key => Object.hasOwn(descriptors, key))) return false;
  return keys.every(key => typeof key === 'string' && (required.includes(key) || optional.includes(key))
    && Object.hasOwn(descriptors[key], 'value') && descriptors[key].enumerable);
}

function plainArray(value) {
  if (!Array.isArray(value) || Object.getPrototypeOf(value) !== Array.prototype) return false;
  const descriptors = Object.getOwnPropertyDescriptors(value);
  const keys = Reflect.ownKeys(descriptors);
  if (keys.length !== value.length + 1) return false;
  for (let index = 0; index < value.length; index++) {
    const descriptor = descriptors[index];
    if (!descriptor || !Object.hasOwn(descriptor, 'value') || !descriptor.enumerable) return false;
  }
  return true;
}

function canonicalBattleId(value) {
  if (typeof value !== 'string') return false;
  const match = /^(training|arena)-([1-9][0-9]*)$/.exec(value);
  return Boolean(match && match[0] === value && positive(Number(match[2])) && String(Number(match[2])) === match[2]);
}

function validEvent(event) {
  if (!objectWithKeys(event, eventRequired, eventOptional)
    || !boundedString(event.id) || !boundedString(event.text, 2000) || !boundedString(event.type, 40)) return false;
  if (Object.hasOwn(event, 'amount') && !nonnegative(event.amount)) return false;
  if (Object.hasOwn(event, 'critical') && typeof event.critical !== 'boolean') return false;
  if (Object.hasOwn(event,'criticalHits') && (!Number.isInteger(event.criticalHits)||event.criticalHits<0||event.criticalHits>9||event.critical!==(event.criticalHits>0)))return false;
  if (Object.hasOwn(event,'glancing') && (typeof event.glancing!=='boolean'||event.glancing&&event.critical!==false))return false;
  if (!resources.every(key => !Object.hasOwn(event, key) || nonnegative(event[key]))) return false;
  if (!['targetId', 'actor', 'itemId'].every(key => !Object.hasOwn(event, key) || boundedString(event[key]))) return false;
  if (Object.hasOwn(event, 'resource') && !resources.includes(event.resource)) return false;
  if (Object.hasOwn(event, 'recovered') && (!objectWithKeys(event.recovered, resources)
    || !resources.every(key => Number.isSafeInteger(event.recovered[key])))) return false;
  return true;
}

/** Shared strict event schema for receipt results and bounded gameplay logs. */
export function validateCommandEvent(event) {
  try { return validEvent(event); }
  catch { return false; }
}

function validResult(result) {
  return objectWithKeys(result, ['ok', 'events']) && result.ok === true
    && plainArray(result.events) && result.events.every(validEvent);
}

function validPayload(receipt) {
  return actions.has(receipt.actionId) && targetValid(receipt.targetId) && validResult(receipt.result);
}

function validReceipt(receipt) {
  if (objectWithKeys(receipt, ['kind', 'seq', ...payloadKeys])) {
    return receipt.kind === 'ordered' && positive(receipt.seq)
      && canonicalBattleId(receipt.battleId) && validPayload(receipt);
  }
  return objectWithKeys(receipt, ['kind', 'id', ...payloadKeys]) && receipt.kind === 'legacy'
    && boundedString(receipt.id) && (receipt.battleId === null || canonicalBattleId(receipt.battleId)) && validPayload(receipt);
}

function validToken(token) {
  return objectWithKeys(token, ['seq']) && positive(token.seq);
}

/** A new ledger has no legacy execution path: strings are always retry-only. */
export function createCommandLedger() {
  return { model: COMMAND_LEDGER_MODEL, highWater: 0, receipts: [], evictedLegacy: 0, evictedOrdered: 0 };
}

/** Validate a detached JSON ledger without normalizing, trimming, or mutating it. */
export function validateCommandLedger(ledger) {
  try {
    if (!objectWithKeys(ledger, ledgerKeys) || ledger.model !== COMMAND_LEDGER_MODEL
      || !nonnegative(ledger.highWater) || !nonnegative(ledger.evictedLegacy) || !nonnegative(ledger.evictedOrdered)
      || !plainArray(ledger.receipts) || ledger.receipts.length > MAX_COMMAND_RECEIPTS) return false;
    const legacyIds = new Set();
    let orderedCount = 0;
    for (const receipt of ledger.receipts) {
      if (!validReceipt(receipt)) return false;
      if (receipt.kind === 'legacy') {
        if (orderedCount || ledger.evictedOrdered > 0 || legacyIds.has(receipt.id)) return false;
        legacyIds.add(receipt.id);
      } else {
        orderedCount++;
        if (receipt.seq !== ledger.evictedOrdered + orderedCount) return false;
      }
    }
    return ledger.evictedOrdered === ledger.highWater - orderedCount
      && byteLength(ledger.receipts) <= MAX_COMMAND_RECEIPT_BYTES;
  } catch { return false; }
}

/** Allocation is read-only; the token is consumed only by a successful append. */
export function nextCommandToken(ledger) {
  if (!validateCommandLedger(ledger) || ledger.highWater === Number.MAX_SAFE_INTEGER) return null;
  return { seq: ledger.highWater + 1 };
}

/**
 * New commands require exactly highWater + 1. Undefined retry targets resolve
 * to the saved target; explicit null is an explicit payload, not a wildcard.
 */
export function inspectCommand(ledger, token, actionId, targetId) {
  try {
    if (!validateCommandLedger(ledger)) return failure('invalid-command-ledger', 'The command ledger is invalid.');
    if (!actions.has(actionId) || (targetId !== undefined && !targetValid(targetId))) {
      return failure('invalid-command-payload', 'The action or target is invalid.');
    }
    let receipt;
    if (typeof token === 'string') {
      if (!boundedString(token)) return failure('invalid-command-token', 'Legacy command IDs must contain 1–200 characters.');
      receipt = ledger.receipts.find(entry => entry.kind === 'legacy' && entry.id === token);
      if (!receipt) return failure('legacy-command-retired', 'This legacy command result is no longer retained; it cannot execute again.');
    } else {
      if (!validToken(token)) return failure('invalid-command-token', 'Use a typed positive safe-integer command sequence.');
      if (token.seq > ledger.highWater) {
        if (token.seq !== ledger.highWater + 1) return failure('command-sequence-gap', 'Commands must execute in sequence.');
        return { ok: true, execute: true, targetId: targetId ?? null };
      }
      receipt = ledger.receipts.find(entry => entry.kind === 'ordered' && entry.seq === token.seq);
      if (!receipt) return failure('receipt-expired', 'This command was already consumed, but its result is no longer retained.');
    }
    if (receipt.actionId !== actionId || receipt.targetId !== (targetId === undefined ? receipt.targetId : targetId)) {
      return failure('command-payload-conflict', 'This command identity was already used with a different action or target.');
    }
    return { ...clone(receipt.result), duplicate: true };
  } catch { return failure('invalid-command-token', 'The command could not be inspected safely.'); }
}

/** Commit one complete successful receipt, or leave the original ledger intact. */
export function appendCommandReceipt(ledger, token, payload) {
  try {
    if (!validateCommandLedger(ledger)) return failure('invalid-command-ledger', 'The command ledger is invalid.');
    if (!objectWithKeys(payload, payloadKeys) || !canonicalBattleId(payload.battleId) || !validPayload(payload)) {
      return failure('invalid-command-receipt', 'Only a complete, valid successful command result can be saved.');
    }
    const inspected = inspectCommand(ledger, token, payload.actionId, payload.targetId);
    if (!inspected.ok) return inspected;
    if (!inspected.execute) return failure('command-already-committed', 'This command is already committed.');
    const receipt = { kind: 'ordered', seq: token.seq, ...clone(payload) };
    if (byteLength([receipt]) > MAX_COMMAND_RECEIPT_BYTES) {
      return failure('command-receipt-too-large', 'The complete command result exceeds the receipt byte budget.');
    }
    const receipts = ledger.receipts.concat(receipt);
    let evictedLegacy = ledger.evictedLegacy;
    let evictedOrdered = ledger.evictedOrdered;
    while (receipts.length > MAX_COMMAND_RECEIPTS || byteLength(receipts) > MAX_COMMAND_RECEIPT_BYTES) {
      if (receipts.shift().kind === 'legacy') evictedLegacy++;
      else evictedOrdered++;
    }
    const draft = { model: COMMAND_LEDGER_MODEL, highWater: token.seq, receipts, evictedLegacy, evictedOrdered };
    if (!validateCommandLedger(draft)) return failure('invalid-command-ledger', 'The updated command ledger cannot be represented safely.');
    const changedKeys = ['highWater', 'receipts', 'evictedLegacy', 'evictedOrdered'];
    if (!changedKeys.every(key => Object.getOwnPropertyDescriptor(ledger, key)?.writable === true)) {
      return failure('command-ledger-read-only', 'The command ledger is read-only.');
    }
    // All destination fields are own writable data properties on a plain object.
    // Nothing in the receipt is mutated, and all fallible work precedes commit.
    for (const key of changedKeys) ledger[key] = draft[key];
    return { ok: true };
  } catch { return failure('invalid-command-receipt', 'The command receipt could not be committed safely.'); }
}

/**
 * Migrate only a newest bounded tail of validated schema-1 receipts. Provenance
 * comes exclusively from the current battle's known receipt IDs, never an ID
 * prefix. Invalid input (including any individually oversized result) is null.
 */
export function migrateLegacyReceipts(oldReceipts, currentBattleId = null, currentBattleReceiptIds = []) {
  try {
    if (!plainArray(oldReceipts) || !plainArray(currentBattleReceiptIds)
      || (currentBattleId !== null && !canonicalBattleId(currentBattleId))
      || (currentBattleId === null && currentBattleReceiptIds.length)) return null;
    const currentIds = new Set();
    for (const id of currentBattleReceiptIds) {
      if (!boundedString(id) || currentIds.has(id)) return null;
      currentIds.add(id);
    }
    const seen = new Set();
    const ledger = createCommandLedger();
    for (const old of oldReceipts) {
      if (!objectWithKeys(old, oldReceiptKeys) || !boundedString(old.id) || seen.has(old.id) || !validPayload(old)) return null;
      seen.add(old.id);
      const receipt = { kind: 'legacy', id: old.id, battleId: currentIds.has(old.id) ? currentBattleId : null,
        actionId: old.actionId, targetId: old.targetId, result: clone(old.result) };
      if (byteLength([receipt]) > MAX_COMMAND_RECEIPT_BYTES) return null;
      ledger.receipts.push(receipt);
      while (ledger.receipts.length > MAX_COMMAND_RECEIPTS || byteLength(ledger.receipts) > MAX_COMMAND_RECEIPT_BYTES) {
        ledger.receipts.shift();
        ledger.evictedLegacy++;
      }
    }
    if ([...currentIds].some(id => !seen.has(id))) return null;
    return validateCommandLedger(ledger) ? ledger : null;
  } catch { return null; }
}
