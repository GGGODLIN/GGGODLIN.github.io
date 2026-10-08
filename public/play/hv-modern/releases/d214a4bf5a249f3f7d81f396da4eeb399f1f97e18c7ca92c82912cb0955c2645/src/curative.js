/** Published Cure potency with an explicit untrained proficiency fixture. */
export const CURATIVE_POLICY=Object.freeze({id:'better-cure-candidate-v1',legacy:'legacy-cure-fixture-v1',supportiveProficiency:0,proficiencyStatus:'fixed-untrained-fixture; growth not implemented',rounding:'floor final healing; unverified',source:'https://ehwiki.org/wiki/Spells#Curative',sourceRevision:65260});
// Exact fraction of the finite decimal input, including scientific notation.
function decimalFraction(value){const [mantissa,exponent='0']=String(value).split('e'),[whole,fraction='']=mantissa.split('.'),scale=fraction.length-Number(exponent),digits=BigInt(whole+fraction);return scale>=0?[digits,10n**BigInt(scale)]:[digits*10n**BigInt(-scale),1n];}
export function cureHealingAmount({baseHp,level,potencyPercent,supportiveProficiency=0}){
  if(!Number.isSafeInteger(baseHp)||baseHp<1||!Number.isSafeInteger(level)||level<1||level>500||!Number.isFinite(potencyPercent)||potencyPercent<0||potencyPercent>100||!Number.isFinite(supportiveProficiency)||supportiveProficiency<0)throw new RangeError('Invalid Cure input');
  const L=BigInt(level),[P,D]=decimalFraction(supportiveProficiency),[potency,potencyDenominator]=decimalFraction(potencyPercent);
  // Common denominator10*L*D: max(0.8+0.2P/L,0.5+0.5P/L), capped1.5.
  const a=8n*L*D+2n*P,b=5n*L*D+5n*P,cap=15n*L*D,peak=a>b?a:b,numerator=peak<cap?peak:cap;
  const amount=BigInt(baseHp)*potency*numerator/(1000n*L*D*potencyDenominator);
  if(amount>BigInt(Number.MAX_SAFE_INTEGER))throw new RangeError('Cure amount exceeds supported range');
  return Number(amount);
}
