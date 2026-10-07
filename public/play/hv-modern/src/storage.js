import {createGame,restoreGame,recoverLegacyGame,serializeGame,MAX_SAVE_BYTES} from './engine.js';
export const SAVE_KEY='vesper.persistent.prototype.v1';
export const BACKUP_KEY=SAVE_KEY+'.backup';
export const PREFS_KEY='vesper.ui.v1';
function decoded(raw){const game=restoreGame(raw)||recoverLegacyGame(raw);if(!game)return null;const source=JSON.parse(raw);return{game,needsAuditUpgrade:source.schemaVersion===1,archiveRaw:source.schemaVersion===1?raw:null,sourceVersion:source.rulesVersion};}
function resultFor(decoded,source,warning=''){return{game:decoded.game,warning:decoded.needsAuditUpgrade?'舊版完整存檔已保留；請先匯出或確認採用有界紀錄格式，確認前僅供檢視':warning||(decoded.sourceVersion!==decoded.game.rulesVersion?'已升級規則存檔；既有角色與裝備保留。舊戰鬥沿用原政策':''),preserveOriginal:decoded.needsAuditUpgrade,needsAuditUpgrade:decoded.needsAuditUpgrade,archiveRaw:decoded.archiveRaw,source};}
/** Read without writing. Legacy compaction is only a preview until the UI confirms replacement. */
export function loadLocalSave(storage){try{const raw=storage.getItem(SAVE_KEY);if(!raw)return{game:createGame(),warning:'',preserveOriginal:false,needsAuditUpgrade:false,archiveRaw:null,source:'fresh'};const decodedMain=decoded(raw);if(decodedMain)return resultFor(decodedMain,'primary');const backup=storage.getItem(BACKUP_KEY),decodedBackup=backup?decoded(backup):null;if(decodedBackup)return resultFor(decodedBackup,'backup','主存檔無法讀取，已載入上一份本機備份');return{game:createGame(),warning:'舊存檔格式無法讀取。未覆寫原檔，請先匯出原始存檔',preserveOriginal:true,needsAuditUpgrade:false,archiveRaw:null,source:'unreadable'};}catch{return{game:createGame(),warning:'瀏覽器不允許儲存資料，離開後可能失去進度',preserveOriginal:true,needsAuditUpgrade:false,archiveRaw:null,source:'unavailable'};}}
/** Explicit legacy replacement may proceed after archive disclosure; ordinary writes never sacrifice a backup. */
export function saveLocalGame(storage,game,{preserveOriginal=false,allowLegacyReplacement=false}={}){
  if(preserveOriginal)return{ok:false,error:'原始存檔已保留'};
  try{
    const next=serializeGame(game);if(new TextEncoder().encode(next).byteLength>MAX_SAVE_BYTES)return{ok:false,error:'存檔已達 5 MB；上次有效進度已保留'};
    if(!restoreGame(next))return{ok:false,error:'存檔驗證失敗，原進度未覆寫'};
    const old=storage.getItem(SAVE_KEY);let oldSchema=null,warning='';try{oldSchema=old?JSON.parse(old).schemaVersion:null;}catch{}
    if(oldSchema===1&&!allowLegacyReplacement)return{ok:false,error:'需先確認舊紀錄保存範圍，原檔未覆寫'};
    if(old&&old!==next&&(restoreGame(old)||recoverLegacyGame(old))){
      try{storage.setItem(BACKUP_KEY,old);}catch(error){if(oldSchema!==1||!allowLegacyReplacement)throw error;warning='完整舊檔未能另存為瀏覽器備份；本頁仍可匯出升級前原檔';}
    }
    storage.setItem(SAVE_KEY,next);if(storage.getItem(SAVE_KEY)!==next)return{ok:false,error:'儲存結果未確認，請匯出備份'};
    return{ok:true,error:'',...(warning?{warning}:{})};
  }catch{return{ok:false,error:'儲存失敗，請匯出備份'};}
}
