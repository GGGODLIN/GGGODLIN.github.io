/** Source critical sequence with an explicitly authored accuracy-vs-evade input. */
export const ACCURACY_POLICY=Object.freeze({
  id:'critical-sequence-candidate-v1',legacy:'single-hit-fixture-v1',
  source:'https://ehwiki.org/wiki/Battles#Criticals',sourceRevision:64927,
  avoidanceSource:'https://ehwiki.org/wiki/Damage#Damage_Avoidance',avoidanceRevision:64962,
  inputStatus:'authored per-roll probability; not the original opposing-stat formula',
  orderStatus:'local deterministic draw order; original server order unverified',
  focusStatus:'source Magic Accuracy x2; applying modified input to critical rolls is an inference',
});

/** Both pass: critical eligible. One pass: half-damage glance. Neither: evade.
 * The given percentage is a fixture probability, NOT the published Accuracy stat.
 * Parry, block and resist are not represented by this input or this function.
 */
export function sampleOutgoingImpact(accuracyPercent,random){
  if(!Number.isFinite(accuracyPercent)||accuracyPercent<0||accuracyPercent>10000||typeof random!=='function')throw new RangeError('Invalid accuracy fixture');
  const draw=()=>{const value=random();if(!Number.isFinite(value)||value<0||value>=1)throw new RangeError('Random draw must be in [0,1)');return value;};
  const probability=Math.min(1,accuracyPercent/100);
  const first=draw()<probability,second=draw()<probability;
  const attackSuccesses=Number(first)+Number(second);
  let criticalHits=0;
  if(attackSuccesses===2&&draw()<Math.min(.5,accuracyPercent/200)){
    criticalHits=1;
    while(criticalHits<9&&draw()<Math.min(.25,accuracyPercent/400))criticalHits++;
  }
  return {attackSuccesses,hit:attackSuccesses>0,glancing:attackSuccesses===1,critical:criticalHits>0,criticalHits};
}
