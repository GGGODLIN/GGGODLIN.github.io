export const VIEWS=Object.freeze(['battle','character','armory','activities','supplies','training','rules']);
export function readView(hash=''){const name=hash.startsWith('#')?hash.slice(1):hash;return VIEWS.includes(name)?name:'battle'}
/** A reset/import replaces the current entry so reload and Back agree with the displayed view. */
export function navigateView(view,{replace=false,history=globalThis.history,location=globalThis.location}={}){
  const next=readView(view),hash='#'+next;
  if(location.hash!==hash)history[replace?'replaceState':'pushState']({view:next},'',hash);
  return next;
}
