(()=>{
'use strict';
const root=document.getElementById('session-info'),guest=window.TeachingGuest;
if(!root||!guest)return;
root.style.cssText='margin-bottom:22px;padding:15px 18px;border:1px solid #dce3dc;background:white;border-radius:9px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between';
const mode=document.createElement('span');mode.style.fontSize='13px';
if(guest.mode()==='guest'){
 guest.enter();mode.textContent='ゲスト利用中 — 回答はこのタブに一時保存されます';
 const clear=document.createElement('button');clear.type='button';clear.textContent='ゲスト履歴を消去';
 clear.style.cssText='border:1px solid #cbd8d0;border-radius:6px;background:white;padding:8px 12px;color:#286449';
 clear.onclick=()=>{if(!confirm('このタブのゲスト学習履歴を消去しますか？'))return;guest.clear();guest.enter();mode.textContent='ゲスト履歴を消去しました'};
 root.append(mode,clear);
}else{mode.textContent='ローカルプロフィール選択中 — ドリル等を開くとパスワード解錠が必要です';root.append(mode)}
})();