import {createGame,restoreGame,recoverLegacyGame,serializeGame,MAX_SAVE_BYTES} from './engine.js';
import {hasSaveOwnership} from './save-owner.js';
// Unmodified older tabs only know the legacy namespace. Never write or remove it.
export const SAVE_KEY='vesper.persistent.protected.v2';
export const BACKUP_KEY=SAVE_KEY+'.backup';
export const LEGACY_SAVE_KEY='vesper.persistent.prototype.v1';
export const LEGACY_BACKUP_KEY=LEGACY_SAVE_KEY+'.backup';
export const PREFS_KEY='vesper.ui.v1';
function decoded(raw){const game=restoreGame(raw)||recoverLegacyGame(raw);if(!game)return null;const source=JSON.parse(raw);return{game,needsAuditUpgrade:source.schemaVersion===1,archiveRaw:source.schemaVersion===1?raw:null,sourceVersion:source.rulesVersion};}
function resultFor(value,source,expectedRaw,sourceRaw,legacySource,warning=''){return{game:value.game,warning:value.needsAuditUpgrade?'舊版完整存檔已保留；請先匯出或確認採用有界紀錄格式，確認前僅供檢視':warning||(value.sourceVersion!==value.game.rulesVersion?'已升級規則存檔；既有角色與裝備保留。舊戰鬥沿用原政策':''),preserveOriginal:value.needsAuditUpgrade,needsAuditUpgrade:value.needsAuditUpgrade,archiveRaw:value.archiveRaw,source,expectedRaw,sourceRaw,legacySource};}
function emptyResult(source,expectedRaw=null,sourceRaw=null,legacySource=false){return{game:createGame(),warning:source==='fresh'?'':source==='unreadable'?'舊存檔格式無法讀取。未覆寫原檔，請先匯出原始存檔':'瀏覽器不允許儲存資料，離開後可能失去進度',preserveOriginal:source!=='fresh',needsAuditUpgrade:false,archiveRaw:null,source,expectedRaw,sourceRaw,legacySource};}
const readonly=()=>({ok:false,readonly:true,error:'沒有存檔寫入權；目前僅供檢視，請重新取得寫入權'});
const conflict=()=>({ok:false,conflict:true,error:'偵測到存檔衝突；已停止寫入，請先匯出本頁進度或重新載入'});

/** Read only. Preserve the exact observed canonical bytes even when using a backup. */
export function loadLocalSave(storage){
  let expectedRaw=null;
  try{
    expectedRaw=storage.getItem(SAVE_KEY);
    // A retained protected backup establishes this lineage even if primary is gone.
    const protectedBackup=expectedRaw===null?storage.getItem(BACKUP_KEY):null;
    const legacySource=expectedRaw===null&&protectedBackup===null;
    const raw=legacySource?storage.getItem(LEGACY_SAVE_KEY):expectedRaw;
    const primary=decoded(raw);
    if(primary)return resultFor(primary,'primary',expectedRaw,raw,legacySource);
    const backup=legacySource?storage.getItem(LEGACY_BACKUP_KEY):expectedRaw===null?protectedBackup:storage.getItem(BACKUP_KEY),fallback=decoded(backup);
    if(fallback)return resultFor(fallback,'backup',expectedRaw,backup,legacySource,'主存檔無法讀取，已載入上一份本機備份');
    if(legacySource&&raw===null&&backup===null)return emptyResult('fresh');
    return emptyResult('unreadable',expectedRaw,raw??backup,legacySource);
  }catch{return emptyResult('unavailable',expectedRaw);}
}

/**
 * Called inside acquire's reload hook. Copies verified legacy bytes exactly once,
 * including schema 1; this never implies consent to compact old audit history.
 */
export function bootstrapProtectedSave(storage,owner){
  const loaded=loadLocalSave(storage);
  if(!hasSaveOwnership(owner))return{...loaded,...readonly()};
  if(loaded.source==='unavailable')return{...loaded,ok:false,readonly:true,error:loaded.warning};
  // Existing canonical storage is authoritative, even if corrupt or older rules.
  if(loaded.expectedRaw!==null)return{...loaded,ok:true,error:''};
  if(loaded.source==='unreadable')return{...loaded,ok:false,readonly:true,error:loaded.warning};
  try{
    const next=loaded.sourceRaw??serializeGame(loaded.game);
    if(!decoded(next))return{...loaded,ok:false,readonly:true,error:'存檔驗證失敗，原進度未覆寫'};
    if(!hasSaveOwnership(owner))return{...loaded,...readonly()};
    if(storage.getItem(SAVE_KEY)!==null)return{...loaded,...conflict()};
    if(!hasSaveOwnership(owner))return{...loaded,...readonly()};
    storage.setItem(SAVE_KEY,next);
    if(storage.getItem(SAVE_KEY)!==next)return{...loaded,...conflict()};
    if(!hasSaveOwnership(owner))return{...loaded,...readonly()};
    return{...loaded,source:'primary',expectedRaw:next,sourceRaw:next,legacySource:false,ok:true,error:'',raw:next,migrated:loaded.legacySource};
  }catch{return{...loaded,ok:false,readonly:true,error:'建立受保護存檔失敗；原始存檔未覆寫，請匯出備份'};}
}

/** Ownership plus an exact loaded snapshot are mandatory for every primary/backup write. */
export function saveLocalGame(storage,game,options={}){
  const {owner,expectedRaw,preserveOriginal=false,allowLegacyReplacement=false}=options??{};
  if(!hasSaveOwnership(owner))return readonly();
  if(!Object.hasOwn(options,'expectedRaw')||(expectedRaw!==null&&typeof expectedRaw!=='string'))return{...readonly(),error:'缺少已載入存檔的版本證明；請重新載入'};
  if(preserveOriginal)return{ok:false,error:'原始存檔已保留'};
  try{
    const next=serializeGame(game);if(new TextEncoder().encode(next).byteLength>MAX_SAVE_BYTES)return{ok:false,error:'存檔已達 5 MB；上次有效進度已保留'};
    if(!restoreGame(next))return{ok:false,error:'存檔驗證失敗，原進度未覆寫'};
    const verify=()=>!hasSaveOwnership(owner)?readonly():storage.getItem(SAVE_KEY)!==expectedRaw?conflict():!hasSaveOwnership(owner)?readonly():null;
    let denied=verify();if(denied)return denied;
    const old=expectedRaw;let oldSchema=null,warning='';try{oldSchema=old===null?null:JSON.parse(old).schemaVersion;}catch{}
    if(oldSchema===1&&!allowLegacyReplacement)return{ok:false,error:'需先確認舊紀錄保存範圍，原檔未覆寫'};
    if(old!==null&&old!==next&&(restoreGame(old)||recoverLegacyGame(old))){
      denied=verify();if(denied)return denied;
      try{storage.setItem(BACKUP_KEY,old);}catch(error){if(oldSchema!==1||!allowLegacyReplacement)throw error;warning='完整舊檔未能另存為瀏覽器備份；本頁仍可匯出升級前原檔';}
    }
    denied=verify();if(denied)return denied;
    storage.setItem(SAVE_KEY,next);
    if(storage.getItem(SAVE_KEY)!==next)return conflict();
    if(!hasSaveOwnership(owner))return readonly();
    return{ok:true,error:'',raw:next,...(warning?{warning}:{})};
  }catch{return{ok:false,error:'儲存失敗，請匯出備份'};}
}
