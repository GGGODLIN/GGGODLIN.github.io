/** Community restorative candidates; this increment covers Potion items only. */
export const RESTORATIVE_POLICY=Object.freeze({
  id:'spirit-potion-candidate-v1',previousPotion:'potion-potency-candidate-v1',previous:'restoratives-candidate-v1',legacy:'legacy-training-v1',
  healthPotion:Object.freeze({resource:'hp',baseFraction:1,cooldown:40,percentages:Object.freeze([100,110,120,130,140,150])}),
  manaPotion:Object.freeze({resource:'mp',baseFraction:.5,cooldown:40,percentages:Object.freeze([50,55,60,65,70,75])}),
  spiritPotion:Object.freeze({resource:'sp',baseFraction:.5,cooldown:40,percentages:Object.freeze([50,55,60,65,70,75])}),
  sources:Object.freeze({amounts:'https://ehwiki.org/wiki/Items#Restoratives',abilities:'https://ehwiki.org/wiki/Abilities#General',cooldown:'https://ehwiki.org/wiki/Character_Menu#Item_Inventory'}),
  observedRevisions:Object.freeze({amounts:65165,abilities:64891,cooldown:64958}),
  rounding:'one final integer floor after base-resource percentage, then cap; unverified server rounding',
  scope:'Health/Mana/Spirit Potion items only; Draught and Elixir effects are not implemented',
});

function positiveInteger(value){return Number.isSafeInteger(value)&&value>0;}

// Exact Spirit bases are JSON-shaped fractions. Inspect descriptors rather than
// reading user fields so malformed accessors never run and no coercion occurs.
function spiritFraction(baseMaximum){
  if(positiveInteger(baseMaximum))return {numerator:baseMaximum,denominator:1};
  if(baseMaximum===null||typeof baseMaximum!=='object'||Array.isArray(baseMaximum))throw new RangeError('Invalid restorative inputs');
  const prototype=Object.getPrototypeOf(baseMaximum);
  if(prototype!==Object.prototype&&prototype!==null)throw new RangeError('Invalid restorative inputs');
  const keys=Reflect.ownKeys(baseMaximum);
  if(keys.length!==2||!keys.includes('numerator')||!keys.includes('denominator'))throw new RangeError('Invalid restorative inputs');
  const numerator=Object.getOwnPropertyDescriptor(baseMaximum,'numerator');
  const denominator=Object.getOwnPropertyDescriptor(baseMaximum,'denominator');
  if(!numerator?.enumerable||!denominator?.enumerable
    ||!Object.hasOwn(numerator,'value')||!Object.hasOwn(denominator,'value')
    ||!positiveInteger(numerator.value)||!positiveInteger(denominator.value))throw new RangeError('Invalid restorative inputs');
  return {numerator:numerator.value,denominator:denominator.value};
}

export function restorativeAmount(actionId,baseMaximum,rank=0){
  if(!['healthPotion','manaPotion','spiritPotion'].includes(actionId)
    ||!Number.isSafeInteger(rank)||Object.is(rank,-0)||rank<0||rank>5)throw new RangeError('Invalid restorative inputs');
  let base;
  if(actionId==='spiritPotion')base=spiritFraction(baseMaximum);
  else{
    if(!positiveInteger(baseMaximum))throw new RangeError('Invalid restorative inputs');
    base={numerator:baseMaximum,denominator:1};
  }
  const amount=BigInt(base.numerator)*BigInt(RESTORATIVE_POLICY[actionId].percentages[rank])/(BigInt(base.denominator)*100n);
  if(amount>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('Restorative amount exceeds supported range');
  return Number(amount);
}
