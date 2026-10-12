/* START screen: uses profile metadata, never reads or decrypts private study data. */
(()=>{
'use strict';
const guest=window.TeachingGuest,profiles=window.TeachingProfiles;
const $=id=>document.getElementById(id);
function refresh(){
 const select=$('profile-select');select.replaceChildren();
 for(const p of profiles.list()){
  const option=document.createElement('option');option.value=p.id;
  option.textContent=p.id==='default'?p.name+'（旧データ用）':p.name;
  select.append(option);
 }
 select.value=profiles.activeId();
}
function navigate(){window.location.assign('app.html')}
$('start-guest').addEventListener('click',()=>{
 try{guest.enter();navigate()}catch(e){$('entry-status').textContent='このブラウザでは一時保存できません。ブラウザの保存設定を確認してください。'}
});
$('open-profile').addEventListener('click',()=>{
 const id=$('profile-select').value;
 if(!profiles.list().some(p=>p.id===id))return;
 try{localStorage.setItem('teaching-portal-active-profile-v1',id);guest.enterProfile();navigate()}
 catch(e){$('entry-status').textContent='プロフィールを選択できません。ブラウザの保存設定を確認してください。'}
});
$('create-profile').addEventListener('click',()=>{
 // Use the existing local-only profile creation routine; it does not touch encrypted records.
 profiles.create();
});
refresh();
})();