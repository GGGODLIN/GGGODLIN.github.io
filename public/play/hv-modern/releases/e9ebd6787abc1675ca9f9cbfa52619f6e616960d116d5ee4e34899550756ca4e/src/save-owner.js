/** One cooperating writer per origin. Old releases are isolated by storage.js's new keys. */
export const SAVE_LOCK_NAME='vesper.persistent.protected.v2.writer';
const ownership=new WeakMap();
const deferred=()=>{let resolve;const promise=new Promise(done=>{resolve=done;});return{promise,resolve};};
const refused=error=>({ok:false,readonly:true,error});

/** A lookalike object is never proof of ownership. */
export function hasSaveOwnership(owner){return ownership.get(owner)?.()===true;}

/**
 * There is deliberately no localStorage lease, optimistic fallback, queue, or steal.
 * acquire resolves after the reload hook, while the Web Locks callback stays pending.
 * A release invalidates pending callbacks immediately; reacquisition drains the old
 * request first so this owner's old callback cannot contend with its new attempt.
 */
export function createSaveOwner({locks=globalThis.navigator?.locks,onChange}={}){
  let status='readonly',reason='尚未取得存檔寫入權',generation=0,active=null,drain=Promise.resolve();
  const isCurrent=attempt=>active===attempt&&attempt.generation===generation;
  const held=()=>Boolean(active?.granted&&isCurrent(active));
  function change(next,detail=''){
    status=next;reason=detail;
    // Presentation errors cannot escape lifecycle cleanup or create ownership.
    try{onChange?.(owner);}catch{}
  }
  function settle(attempt,result){if(!attempt.settled){attempt.settled=true;attempt.ready.resolve(result);}}
  function stop(next,detail){
    const previous=active;active=null;generation++;
    if(previous){previous.cancel.resolve();settle(previous,refused(detail));}
    change(next,detail);
    return drain;
  }
  const owner=Object.freeze({
    get status(){return status;},
    get reason(){return reason;},
    get held(){return held();},
    acquire(onAcquired){
      if(active)return active.ready.promise;
      if(!locks||typeof locks.request!=='function'){
        change('readonly','瀏覽器不支援安全存檔鎖定；目前僅供檢視');
        return Promise.resolve(refused(reason));
      }
      const attempt={generation:++generation,granted:false,settled:false,ready:deferred(),cancel:deferred()};
      active=attempt;
      const previousDrain=drain;
      // Install the drain before notifying observers, which may release/reacquire.
      drain=(async()=>{
        await previousDrain;
        if(!isCurrent(attempt))return;
        try{
          await locks.request(SAVE_LOCK_NAME,{mode:'exclusive',ifAvailable:true},async lock=>{
            if(!isCurrent(attempt))return;
            if(!lock){active=null;change('readonly','另一個分頁正在使用存檔；目前僅供檢視');settle(attempt,refused(reason));return;}
            attempt.granted=true;
            try{
              // Cancellation releases the browser lock even if a reload hook is slow.
              const hook=Promise.resolve().then(()=>isCurrent(attempt)?onAcquired?.(owner):undefined);
              const result=await Promise.race([hook,attempt.cancel.promise]);
              if(!isCurrent(attempt))return;
              if(result===false||result?.ok===false)throw new Error(result?.error||'無法安全載入最新存檔');
              change('writable','');
              if(!isCurrent(attempt))return;
              settle(attempt,{ok:true,owner});
              await attempt.cancel.promise;
            }catch(error){
              if(isCurrent(attempt))stop('readonly',error?.message||'無法安全載入最新存檔');
            }
          });
          // A real Web Locks request cannot finish while its callback still holds.
          if(isCurrent(attempt))stop('readonly','存檔鎖定已結束；請重新載入');
        }catch(error){
          if(isCurrent(attempt))stop('readonly',error?.message||'無法取得安全存檔鎖定；目前僅供檢視');
        }
      })();
      change('acquiring','正在取得存檔寫入權並載入最新進度');
      return attempt.ready.promise;
    },
    release(detail='此分頁已釋放存檔寫入權'){return stop('readonly',detail);},
    invalidate(detail='存檔已變更；請匯出本頁進度或重新載入'){return stop('conflict',detail);}
  });
  ownership.set(owner,held);
  return owner;
}
