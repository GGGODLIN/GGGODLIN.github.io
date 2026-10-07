import {createGame,restoreGame,serializeGame,MAX_SAVE_BYTES} from './engine.js';
export const SAVE_KEY='vesper.persistent.prototype.v1';
export const BACKUP_KEY=SAVE_KEY+'.backup';
export const PREFS_KEY='vesper.ui.v1';
/** Read without changing storage, including corrupt or unsupported original saves. */
export function loadLocalSave(storage){
  try{
    const raw=storage.getItem(SAVE_KEY);
    if(!raw)return {game:createGame(),warning:'',preserveOriginal:false,source:'fresh'};
    const game=restoreGame(raw);
    if(game)return {game,warning:JSON.parse(raw).rulesVersion!==game.rulesVersion?'已升級存檔：清波需確認繼續；戰外生命／魔力／靈力即時恢復':'',preserveOriginal:false,source:'primary'};
    const backup=storage.getItem(BACKUP_KEY),recovered=backup?restoreGame(backup):null;
    if(recovered)return {game:recovered,warning:'主存檔無法讀取，已載入上一份本機備份',preserveOriginal:false,source:'backup'};
    return {game:createGame(),warning:'舊存檔格式無法讀取。未覆寫原檔，請先匯出原始存檔',preserveOriginal:true,source:'unreadable'};
  }catch{return {game:createGame(),warning:'瀏覽器不允許儲存資料，離開後可能失去進度',preserveOriginal:true,source:'unavailable'}}
}
/** Validate before overwrite; partial storage errors never delete the primary or backup. */
export function saveLocalGame(storage,game,{preserveOriginal=false}={}){
  if(preserveOriginal)return {ok:false,error:'原始存檔已保留'};
  try{
    const next=serializeGame(game);
    if(new TextEncoder().encode(next).byteLength>MAX_SAVE_BYTES)return {ok:false,error:'存檔已達 5 MB；上次有效進度已保留'};
    if(!restoreGame(next))return {ok:false,error:'存檔驗證失敗，原進度未覆寫'};
    const old=storage.getItem(SAVE_KEY);
    if(old&&restoreGame(old)&&old!==next)storage.setItem(BACKUP_KEY,old);
    storage.setItem(SAVE_KEY,next);
    if(storage.getItem(SAVE_KEY)!==next)return {ok:false,error:'儲存結果未確認，請匯出備份'};
    return {ok:true,error:''};
  }catch{return {ok:false,error:'儲存失敗，請匯出備份'}}
}
