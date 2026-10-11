/* Local learning data backups: no server, cookies or authentication. */
(()=>{
'use strict';
const profiles=window.TeachingProfiles;
if(!profiles)return;
const unitIds=['human','healthcare','safety','infection','observation','suction-general','suction-practice','feeding-general','feeding-practice'];
const baseKeys=['care-2018-drill-v2','care-2018-exam-v2','care-quiz-history-v1',...unitIds.map(id=>'care-2018-drill-v2--'+id)];
const storageKey=k=>profiles.scopedKey(k,profiles.activeId());
const maxBytes=2_000_000;
const selected=()=>profiles.list().find(p=>p.id===profiles.activeId());
function pack(){
 const sections={};
 for(const key of baseKeys){
  const item=localStorage.getItem(storageKey(key));
  if(item!==null){
   try{sections[key]=JSON.parse(item)}catch(e){/* malformed old data omitted */}
  }
 }
 return {
  schema:'teaching-portal-learning-backup',
  version:1,
  exportedAt:new Date().toISOString(),
  profileName:selected()?.name||'学習者',
  sections
 };
}
function exportProfile(){
 let content;
 try{content=JSON.stringify(pack(),null,2)}catch(e){alert('バックアップを作成できませんでした。');return}
 const blob=new Blob([content],{type:'application/json;charset=utf-8'});
 const uri=URL.createObjectURL(blob);
 const a=document.createElement('a');
 a.href=uri;
 a.download='teaching-portal-'+new Date().toISOString().slice(0,10)+'-'+profiles.activeId()+'.json';
 document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(uri),1000);
}
function validNumberedAnswers(x){
 return x&&typeof x==='object'&&!Array.isArray(x)&&Object.entries(x).every(([k,v])=>/^(?:[1-9]|[1-4][0-9]|50)$/.test(k)&&Number.isInteger(v)&&v>=1&&v<=4);
}
function validateSession(s){
 if(!s||typeof s!=='object'||Array.isArray(s))return false;
 if(!Array.isArray(s.order)||s.order.length>50||s.order.length===0||!s.order.every(n=>Number.isInteger(n)&&n>=1&&n<=50)||new Set(s.order).size!==s.order.length)return false;
 if(!validNumberedAnswers(s.answers||{}))return false;
 if(s.first!==undefined&&!validNumberedAnswers(s.first))return false;
 if(s.index!==undefined&&(!Number.isInteger(s.index)||s.index<0||s.index>=s.order.length))return false;
 if(s.elapsed!==undefined&&(!Number.isFinite(s.elapsed)||s.elapsed<0||s.elapsed>1e9))return false;
 if(s.choiceMode!==undefined&&!['original','shuffled'].includes(s.choiceMode))return false;
 if(s.choiceOrders!==undefined){
  if(!s.choiceOrders||typeof s.choiceOrders!=='object'||Array.isArray(s.choiceOrders))return false;
  for(const [k,v] of Object.entries(s.choiceOrders)){
   if(!/^(?:[1-9]|[1-4][0-9]|50)$/.test(k)||!Array.isArray(v)||v.length!==4||new Set(v).size!==4||!v.every(n=>Number.isInteger(n)&&n>=1&&n<=4))return false;
  }
 }
 return true;
}
function validateHistory(h){
 return Array.isArray(h)&&h.length<=10000&&h.every(x=>{
  if(!x||typeof x!=='object'||Array.isArray(x))return false;
  return typeof x.questionId==='string'&&x.questionId.length<=100&&
    typeof x.examId==='string'&&x.examId.length<=100&&
    typeof x.unitId==='string'&&x.unitId.length<=100&&
    Number.isInteger(x.number)&&x.number>=1&&x.number<=50&&
    Number.isInteger(x.choice)&&x.choice>=1&&x.choice<=4&&
    typeof x.correct==='boolean'&&
    typeof x.at==='string'&&x.at.length<80;
 });
}
async function importProfile(file){
 if(!file)return;
 if(file.size>maxBytes){alert('ファイルが大きすぎます（上限2 MB）。');return}
 let obj;
 try{obj=JSON.parse(await file.text())}catch(e){alert('JSONファイルを読み取れませんでした。');return}
 if(!obj||obj.schema!=='teaching-portal-learning-backup'||obj.version!==1||!obj.sections||typeof obj.sections!=='object'||Array.isArray(obj.sections)){alert('対応していないバックアップ形式です。');return}
 const entries=Object.entries(obj.sections);
 if(entries.some(([k,v])=>!baseKeys.includes(k)||(k==='care-quiz-history-v1'?!validateHistory(v):!validateSession(v)))){alert('バックアップの内容に不整合があります。');return}
 if(!entries.length){alert('復元する回答データが含まれていません。');return}
 if(!confirm('現在の「'+(selected()?.name||'学習者')+'」の対応する回答データを上書きします。バックアップ元：'+String(obj.profileName||'不明').slice(0,24)+'。続けますか？'))return;
 const old={};
 try{
  for(const k of baseKeys)old[k]=localStorage.getItem(storageKey(k));
  // All keys supplied in the backup are replaced, but absent sections are untouched.
  for(const [k,v] of entries)localStorage.setItem(storageKey(k),JSON.stringify(v));
 }catch(e){
  for(const [k,v] of Object.entries(old)){
   try{if(v===null)localStorage.removeItem(storageKey(k));else localStorage.setItem(storageKey(k),v)}catch(ignore){}
  }
  alert('復元に失敗しました。空き容量やブラウザ設定を確認してください。');return;
 }
 alert('学習記録を復元しました。ページを再読み込みします。');
 window.location.reload();
}
function mount(){
 const parent=document.querySelector('.profile-manager');
 if(!parent)return;
 const wrap=document.createElement('div');wrap.className='backup-actions';
 const save=document.createElement('button');save.type='button';save.textContent='データ保存';save.onclick=exportProfile;
 const load=document.createElement('button');load.type='button';load.textContent='読み込む';
 const input=document.createElement('input');input.type='file';input.accept='.json,application/json';input.hidden=true;input.setAttribute('aria-label','学習データのJSONバックアップファイル');
 load.onclick=()=>input.click();
 input.onchange=async()=>{await importProfile(input.files?.[0]);input.value=''};
 const note=document.createElement('p');note.className='profile-hint';note.textContent='端末移行用のJSONです。パスワードなどは含みませんが、回答履歴が入るので共有に注意してください。';
 wrap.append(save,load,input,note);parent.append(wrap);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
