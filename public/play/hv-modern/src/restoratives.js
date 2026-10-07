/** Published restorative subset; no ability bonuses or over-time draught/elixir effects. */
export const RESTORATIVE_POLICY=Object.freeze({
  id:'restoratives-candidate-v1',legacy:'legacy-training-v1',
  healthPotion:Object.freeze({resource:'hp',baseFraction:1,cooldown:40}),
  manaPotion:Object.freeze({resource:'mp',baseFraction:.5,cooldown:40}),
  sources:Object.freeze({amounts:'https://ehwiki.org/wiki/Items#Restoratives',cooldown:'https://ehwiki.org/wiki/Character_Menu#Item_Inventory'}),
  observedRevisions:Object.freeze({amounts:65165,cooldown:64958}),
  rounding:'floor final resource amount, then cap; unverified server rounding',
  scope:'source percentages applied to provisional base maxima; no ability bonus',
});
export function restorativeAmount(actionId,baseMaximum){
  const rule=RESTORATIVE_POLICY[actionId];
  if(!['healthPotion','manaPotion'].includes(actionId)||!Number.isSafeInteger(baseMaximum)||baseMaximum<1)throw new RangeError('Invalid restorative inputs');
  return Math.floor(baseMaximum*rule.baseFraction);
}
