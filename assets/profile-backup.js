/* Encrypted backups, with explicit opt-in conversion of legacy unencrypted exports. */
(async()=>{
'use strict';
if(window.TeachingMode?.guest||window.TeachingMode?.insideShell)return;
const vault=window.TeachingVault,profiles=window.TeachingProfiles;
await vault.ready;
const unitIds=['human','healthcare','safety','infection','observation','suction-general','suction-practice','feeding-general','feeding-practice'];
const bases=['care-2018-drill-v2','care-2018-exam-v2','care-quiz-history-v1',...unitIds.map(id=>'care-2018-drill-v2--'+id)];
const scoped=base=>profiles.scopedKey(base,profiles.activeId());
const activeName=()=>profiles.list().find(x=>x.id===profiles.activeId())?.name||'学習者';
const maxBytes=3_000_000;
function validateSession(s){
 if(!s||typeof s!=='object'||Array.isArray(s))return false;
 if(!Array.isArray(s.order)||!s.order.length||s.order.length>50||new Set(s.order).size!==s.order.length||s.order.some(n=>!Number.isInteger(n)||n<1||n>50))return false;
 for(const field of ['answers','first']){
  if(s[field]!==undefined&&(!s[field]||typeof s[field]!=='object'||Array.isArray(s[field])||Object.entries(s[field]).some(([n,v])=>!/^([1-9]|[1-4][0-9]|50)$/.test(n)||!Number.isInteger(v)||v<1||v>4)))return false;
 }
 if(s.choiceMode!==undefined&&!['original','shuffled'].includes(s.choiceMode))return false;
 if(s.choiceOrders!==undefined&&(!s.choiceOrders||typeof s.choiceOrders!=='object'||Array.isArray(s.choiceOrders)||Object.values(s.choiceOrders).some(v=>!Array.isArray(v)||v.length!==4||new Set(v).size!==4||v.some(n=>!Number.isInteger(n)||n<1||n>4))))return false;
 if(s.index!==undefined&&(!Number.isInteger(s.index)||s.index<0||s.index>=s.order.length))return false;
 if(s.elapsed!==undefined&&(!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>1e9))return false;
 return true;
}
function validateHistory(v){
 return Array.isArray(v)&&v.length<=10000&&v.every(x=>x&&typeof x==='object'&&typeof x.questionId==='string'&&x.questionId.length<100&&typeof x.examId==='string'&&x.examId.length<100&&typeof x.unitId==='string'&&x.unitId.length<100&&Number.isInteger(x.number)&&x.number>=1&&x.number<=50&&Number.isInteger(x.choice)&&x.choice>=1&&x.choice<=4&&typeof x.correct==='boolean'&&typeof x.at==='string'&&x.at.length<80);
}
function checkSections(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Invalid payload');
 const entries=Object.entries(obj);
 if(!entries.length||entries.some(([k,v])=>!bases.includes(k)||(k==='care-quiz-history-v1'?!validateHistory(v):!validateSession(v))))throw Error('Invalid learning records');
 return entries;
}
function pack(){
 const sections={};
 for(const base of bases){const raw=vault.local.getItem(scoped(base));if(raw!==null)sections[base]=JSON.parse(raw)}
 return {schema:'teaching-portal-learning-backup',version:1,profileName:activeName(),exportedAt:new Date().toISOString(),sections};
}
function download(obj){
 const blob=new Blob([JSON.stringify(obj)],{type:'application/json'});
 const href=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=href;a.download='teaching-portal-encrypted-'+new Date().toISOString().slice(0,10)+'.json';document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(href),3000);
}
function requestPassword(title,confirmation=false){
 return new Promise(resolve=>{
  const overlay=document.createElement('div');overlay.className='vault-lock';
  const panel=document.createElement('section');panel.className='vault-panel';
  const h=document.createElement('h2');h.textContent=title;
  const form=document.createElement('form');
  const a=document.createElement('input');a.type='password';a.required=true;a.minLength=10;a.autocomplete='new-password';a.placeholder='10文字以上のパスワード';
  const b=document.createElement('input');b.type='password';b.required=confirmation;b.minLength=10;b.autocomplete='new-password';b.placeholder='パスワードを再入力';b.hidden=!confirmation;
  const error=document.createElement('p');error.className='vault-warning';
  const ok=document.createElement('button');ok.type='submit';ok.textContent=confirmation?'暗号化する':'復号する';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='キャンセル';cancel.className='vault-switch';
  const finish=v=>{a.value='';b.value='';overlay.remove();resolve(v)};
  cancel.onclick=()=>finish(null);
  form.onsubmit=e=>{e.preventDefault();if(a.value.length<10){error.textContent='10文字以上入力してください。';return}if(confirmation&&a.value!==b.value){error.textContent='入力が一致しません。';return}finish(a.value)};
  form.append(a,b,error,ok,cancel);panel.append(h,form);overlay.append(panel);document.body.append(overlay);a.focus();
 });
}
async function save(){
 let pass=await requestPassword('バックアップ用のパスワードを設定',true);
 if(pass===null)return;
 try{await vault.flush();const file=await vault.encryptedBackup(pack(),pass);download(file);alert('暗号化バックアップの保存を開始しました。パスワードを忘れると復元できません。')}
 catch(e){alert('バックアップの作成に失敗しました。'+e.message)}
 finally{pass=''}
}
async function restore(file){
 if(!file)return;if(file.size>maxBytes){alert('ファイルのサイズ上限は3MBです。');return}
 let envelope;try{envelope=JSON.parse(await file.text())}catch(e){alert('JSONとして読み取れません。');return}
 let data,fromLegacy=false,pass='';
 if(envelope?.schema==='teaching-portal-encrypted-backup'&&envelope.version===2){
  pass=await requestPassword('バックアップのパスワードを入力');
  if(pass===null)return;
  try{data=await vault.decryptBackup(envelope,pass)}catch(e){alert('復号できません。パスワードかファイルを確認してください。');return}
 }else if(envelope?.schema==='teaching-portal-learning-backup'&&envelope.version===1){
  fromLegacy=true;data=envelope;
  if(!confirm('旧形式の暗号化されていないバックアップです。現在の暗号化プロフィールに移行しますか？'))return;
 }else{alert('対応していないバックアップ形式です。');return}
 let entries;
 try{if(data.schema!=='teaching-portal-learning-backup'||data.version!==1)throw Error('Format mismatch');entries=checkSections(data.sections)}
 catch(e){alert('学習記録の検証に失敗しました。');return}
 if(!confirm('「'+activeName()+'」の対応する学習履歴を上書きします。現在の履歴は先にバックアップしてください。続けますか？'))return;
 try{await vault.commitEntries(entries.map(([k,v])=>[scoped(k),JSON.stringify(v)]));await vault.flush();alert('暗号化されたプロフィールに学習履歴を復元しました。');window.location.reload()}
 catch(e){alert('保存に失敗しました。以前の学習履歴を保持しています。')}
 finally{pass=''}
}
function mount(){
 const manager=document.querySelector('.profile-manager');if(!manager)return;
 const wrap=document.createElement('div');wrap.className='backup-actions';
 const a=document.createElement('button');a.type='button';a.textContent='暗号化バックアップ';a.onclick=save;
 const b=document.createElement('button');b.type='button';b.textContent='復元';const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;
 b.onclick=()=>input.click();input.onchange=async()=>{await restore(input.files?.[0]);input.value=''};
 const note=document.createElement('p');note.className='profile-hint';note.textContent='バックアップは別パスワードでAES-GCM暗号化。旧JSONも読み込み可能です。';
 wrap.append(a,b,input,note);manager.append(wrap);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();