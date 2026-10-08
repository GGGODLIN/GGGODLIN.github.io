/** Community restorative candidates; this increment covers Potion items only. */
export const RESTORATIVE_POLICY=Object.freeze({
  id:'potion-potency-candidate-v1',previous:'restoratives-candidate-v1',legacy:'legacy-training-v1',
  healthPotion:Object.freeze({resource:'hp',baseFraction:1,cooldown:40,percentages:Object.freeze([100,110,120,130,140,150])}),
  manaPotion:Object.freeze({resource:'mp',baseFraction:.5,cooldown:40,percentages:Object.freeze([50,55,60,65,70,75])}),
  sources:Object.freeze({amounts:'https://ehwiki.org/wiki/Items#Restoratives',abilities:'https://ehwiki.org/wiki/Abilities#General',cooldown:'https://ehwiki.org/wiki/Character_Menu#Item_Inventory'}),
  observedRevisions:Object.freeze({amounts:65165,abilities:64891,cooldown:64958}),
  rounding:'one final integer floor after base-resource percentage, then cap; unverified server rounding',
  scope:'Health/Mana Potion items only; Draught and Elixir effects are not implemented',
});
export function restorativeAmount(actionId,baseMaximum,rank=0){
  if(!['healthPotion','manaPotion'].includes(actionId)||!Number.isSafeInteger(baseMaximum)||baseMaximum<1
    ||!Number.isSafeInteger(rank)||Object.is(rank,-0)||rank<0||rank>5)throw new RangeError('Invalid restorative inputs');
  const amount=BigInt(baseMaximum)*BigInt(RESTORATIVE_POLICY[actionId].percentages[rank])/100n;
  if(amount>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('Restorative amount exceeds supported range');
  return Number(amount);
}
