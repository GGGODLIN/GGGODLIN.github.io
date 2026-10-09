import {getEquipmentEligibility,getStats} from './engine.js';

/** Pure panel projection under current local rules; never executes an equip command. */
export function getLoadoutPreview(state, itemId) {
  const eligibility = getEquipmentEligibility(state, itemId);
  if (!eligibility.ok) return { ...eligibility, before: null, after: null, delta: null, removedIds: [], assignedLevel: null };
  const item = state.inventory.find(entry => entry.id === itemId);
  const equipped = { ...state.equipped, [item.slot]: item.id };
  for (const id of eligibility.unequipIds) {
    for (const slot of Object.keys(equipped)) if (equipped[slot] === id) equipped[slot] = null;
  }
  const assignedLevel = item.level === null ? state.player.level : null;
  const inventory = assignedLevel === null ? state.inventory : state.inventory.map(entry => entry.id === itemId ? { ...entry, level: assignedLevel } : entry);
  const before = getStats(state), after = getStats({ ...state, equipped, inventory });
  const delta = Object.fromEntries(Object.keys(before).map(key => [key, after[key] - before[key]]));
  const removedIds = Object.values(state.equipped).filter(id => id && !Object.values(equipped).includes(id));
  return { ...eligibility, before, after, delta, removedIds, assignedLevel };
}
