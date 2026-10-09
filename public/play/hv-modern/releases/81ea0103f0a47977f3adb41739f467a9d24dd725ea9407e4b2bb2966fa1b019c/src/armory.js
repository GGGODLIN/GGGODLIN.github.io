/**
 * Deterministic armory organization over the caller's flat equipment array.
 * No rewards, clocks, event IDs, storage APIs, or destructive actions live here.
 * See docs/ARMORY-ORGANIZATION.md for sources and prototype restrictions.
 */

export const ARMORY_CAPACITIES = Object.freeze({ inventory: 500, storage: 500 });

const CONTAINERS = Object.freeze(['inventory', 'storage']);
const PROTECTION_MODES = Object.freeze(['none', 'protected', 'locked']);
const BULK_PIN_MODES = Object.freeze(['unchanged', 'enable', 'clear']);
const BULK_PROTECTION_MODES = Object.freeze(['unchanged', 'protected', 'locked', 'clearboth']);
const SLOTS = Object.freeze(['weapon', 'body', 'offhand']);
const DANGEROUS_ACTIONS = Object.freeze(['sell', 'salvage', 'mail', 'fusion']);
const ACTIONS = Object.freeze(['equip', 'repair', 'upgrade', 'modify', ...DANGEROUS_ACTIONS]);
const success = () => ({ ok: true, events: [] });
const failure = (error) => ({ ok: false, error, events: [] });

function isRecord(value) {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

// Only own data properties are accepted; malformed accessors are not evaluated.
function dataField(record, key) {
  if (!isRecord(record)) return undefined;
  return Object.getOwnPropertyDescriptor(record, key)?.value;
}

function validId(value) { return typeof value === 'string' && value.trim().length > 0; }

function validItem(item) {
  return isRecord(item)
    && validId(dataField(item, 'id'))
    && CONTAINERS.includes(dataField(item, 'container'))
    && ['pinned', 'protected', 'locked'].every((key) => typeof dataField(item, key) === 'boolean')
    && !(dataField(item, 'protected') && dataField(item, 'locked'));
}

function inventoryOf(state) {
  const inventory = dataField(state, 'inventory');
  return Array.isArray(inventory) ? inventory : [];
}

function findMutableItem(state, itemId) {
  if (!validId(itemId)) return { error: '裝備 ID 格式錯誤' };
  if (!Array.isArray(dataField(state, 'inventory'))) return { error: '裝備清單格式錯誤' };
  const inventory = inventoryOf(state);
  const ids = new Set();
  for (const item of inventory) {
    if (!validItem(item) || ids.has(item.id)) return { error: '裝備整理資料無效或 ID 重複' };
    ids.add(item.id);
  }
  const item = inventory.find((entry) => entry.id === itemId);
  return item ? { item } : { error: '找不到這件裝備' };
}

function writableFields(record, keys) {
  return keys.every((key) => Object.getOwnPropertyDescriptor(record, key)?.writable === true);
}

/** Read-only counts. Unknown containers are ignored, never repaired or removed. */
export function getContainerCounts(state) {
  let inventory = 0;
  let storage = 0;
  for (const item of inventoryOf(state)) {
    const container = dataField(item, 'container');
    if (container === 'inventory') inventory++;
    else if (container === 'storage') storage++;
  }
  return {
    inventory, storage,
    inventoryCapacity: ARMORY_CAPACITIES.inventory,
    storageCapacity: ARMORY_CAPACITIES.storage,
    total: inventory + storage,
  };
}

/** Mutates only both protection flags, atomically and mutually exclusively. */
export function setEquipmentProtection(state, itemId, mode) {
  if (!PROTECTION_MODES.includes(mode)) return failure('保護模式只接受 none、protected 或 locked');
  const found = findMutableItem(state, itemId);
  if (found.error) return failure(found.error);
  const { item } = found;
  if (!writableFields(item, ['protected', 'locked'])) return failure('裝備保護標記為唯讀');
  item.protected = mode === 'protected';
  item.locked = mode === 'locked';
  return success();
}

/** Pinning is independent of protection, storage, equipment and combat status. */
export function toggleEquipmentPin(state, itemId) {
  const found = findMutableItem(state, itemId);
  if (found.error) return failure(found.error);
  if (!writableFields(found.item, ['pinned'])) return failure('裝備置頂標記為唯讀');
  found.item.pinned = !found.item.pinned;
  return success();
}

/**
 * Explicit flag assignments over existing items, with a whole-batch preflight.
 * Index descriptors avoid evaluating array accessors or overridden iterators.
 * "unchanged" neither assigns nor requires writable fields in that category.
 */
export function assignEquipmentOrganization(state, itemIds, options) {
  if (!isRecord(options) || Reflect.ownKeys(options).length !== 2
    || !BULK_PIN_MODES.includes(dataField(options, 'pin'))
    || !BULK_PROTECTION_MODES.includes(dataField(options, 'protection'))) {
    return failure('批次整理需指定有效的 pin 與 protection 選項');
  }
  if (!Array.isArray(itemIds) || itemIds.length === 0) return failure('請選取有效的裝備 ID 清單');
  const requestedIds = new Set();
  for (let index = 0; index < itemIds.length; index++) {
    const id = Object.getOwnPropertyDescriptor(itemIds, index)?.value;
    if (!validId(id) || requestedIds.has(id)) return failure('裝備 ID 格式錯誤或重複');
    requestedIds.add(id);
  }

  const inventory = dataField(state, 'inventory');
  if (!Array.isArray(inventory)) return failure('裝備清單格式錯誤');
  const itemsById = new Map();
  for (let index = 0; index < inventory.length; index++) {
    const item = Object.getOwnPropertyDescriptor(inventory, index)?.value;
    if (!validItem(item)) return failure('裝備整理資料無效或 ID 重複');
    const id = dataField(item, 'id');
    if (itemsById.has(id)) return failure('裝備整理資料無效或 ID 重複');
    itemsById.set(id, item);
  }

  const pin = dataField(options, 'pin');
  const protection = dataField(options, 'protection');
  const assignments = [];
  if (pin !== 'unchanged') assignments.push(['pinned', pin === 'enable']);
  if (protection !== 'unchanged') {
    assignments.push(['protected', protection === 'protected'], ['locked', protection === 'locked']);
  }
  const fields = assignments.map(([key]) => key);
  const selected = [];
  let changedCount = 0;
  for (const id of requestedIds) {
    const item = itemsById.get(id);
    if (!item) return failure('找不到選取的裝備；請重新選取');
    if (!writableFields(item, fields)) return failure('選取裝備的整理標記為唯讀');
    if (assignments.some(([key, value]) => dataField(item, key) !== value)) changedCount++;
    selected.push(item);
  }

  // Every selected item and every requested field is valid before any write.
  for (const item of selected) {
    for (const [key, value] of assignments) item[key] = value;
  }
  return { ...success(), changed: changedCount > 0, changedCount };
}

/**
 * Transfers by changing one container field; never splices, clones or deletes.
 * Active-battle blocking and refusing capacity overflow are prototype policies.
 */
export function moveEquipment(state, itemId, targetContainer) {
  if (!CONTAINERS.includes(targetContainer)) return failure('目的地只接受 inventory 或 storage');
  const found = findMutableItem(state, itemId);
  if (found.error) return failure(found.error);
  const { item } = found;
  if (dataField(dataField(state, 'battle'), 'status') === 'active') {
    return failure('演練限制：戰鬥中不能移動裝備');
  }
  const equipped = dataField(state, 'equipped');
  if (!isRecord(equipped) || Object.keys(equipped).length !== SLOTS.length
    || !SLOTS.every((slot) => dataField(equipped, slot) === null
      || (validId(dataField(equipped, slot)) && inventoryOf(state).some((entry) => entry.id === equipped[slot])))) {
    return failure('已裝備欄位格式錯誤');
  }
  if (targetContainer === 'storage' && SLOTS.some((slot) => equipped[slot] === item.id)) {
    return failure('已裝備的物品不能存入倉庫；請先卸下或更換');
  }
  if (item.container === targetContainer) return success();
  if (getContainerCounts(state)[targetContainer] >= ARMORY_CAPACITIES[targetContainer]) {
    return failure(`${targetContainer === 'inventory' ? '隨身裝備' : '倉庫'}已滿（上限 ${ARMORY_CAPACITIES[targetContainer]} 件）`);
  }
  if (!writableFields(item, ['container'])) return failure('裝備位置為唯讀');
  item.container = targetContainer;
  return success();
}

/**
 * New presentation array containing existing item references; input is untouched.
 * Pinned first, then original array index. Search examines names only.
 */
export function listOrganizedEquipment(state, options = {}) {
  if (!isRecord(options)) return [];
  const containerOption = dataField(options, 'container');
  const container = containerOption === undefined ? 'inventory' : containerOption;
  const slot = dataField(options, 'slot');
  const searchOption = dataField(options, 'search');
  const search = searchOption === undefined ? '' : searchOption;
  if (!CONTAINERS.includes(container) || (slot !== undefined && slot !== 'all' && !SLOTS.includes(slot))
    || typeof search !== 'string') return [];
  const query = search.trim().toLowerCase();
  return inventoryOf(state)
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => validItem(item) && item.container === container
      && (slot === undefined || slot === 'all' || dataField(item, 'slot') === slot)
      && typeof dataField(item, 'name') === 'string' && item.name.toLowerCase().includes(query))
    .sort((a, b) => Number(b.item.pinned) - Number(a.item.pinned) || a.index - b.index)
    .map(({ item }) => item);
}

/**
 * Organization gate only, not full action eligibility or an execution API.
 * A protected dangerous action is denied pending confirmation; this helper has
 * no override token. Unknown actions fail closed. Stored gear is unavailable.
 */
export function equipmentActionPermission(item, action) {
  const deny = (reason, visible = false, requiresConfirmation = false) => ({
    allowed: false, visible, requiresConfirmation, reason,
  });
  if (!validItem(item)) return deny('裝備整理資料無效');
  if (!ACTIONS.includes(action)) return deny('未知的裝備行動');
  if (item.container === 'storage') return deny('倉庫中的裝備須先取回，才能進行其他操作');
  if (DANGEROUS_ACTIONS.includes(action)) {
    if (item.locked) return deny('鎖定的裝備不會出現在危險操作清單');
    if (item.protected) return deny('受保護的裝備需要額外確認', true, true);
  }
  return { allowed: true, visible: true, requiresConfirmation: false, reason: '' };
}
