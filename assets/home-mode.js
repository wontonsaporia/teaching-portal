/* v2 HOME: summarize only data available to the selected guest or unlocked local profile.
 * No plaintext account data or passwords persist from this page.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const guest=window.TeachingGuest;
const units=window.CARE_BANK?.units||[];
const unitById=new Map(units.map(unit=>[unit.id,unit]));
let parentApp=null;
try{if(window.parent!==window&&window.parent.TeachingAppShell?.version===1)parentApp=window.parent}catch(e){}
const mode=parentApp?parentApp.TeachingMode?.guest?'guest':'profile':guest.mode();
const profile=parentApp?.TeachingProfiles;
const vault=parentApp?.TeachingVault;
const local=mode==='guest'?guest.local:parentApp&&vault?.isUnlocked()?vault.local:null;
const profileId=mode==='profile'&&profile?profile.activeId():null;
const storageKey=base=>mode==='profile'&&profile?profile.scopedKey(base,profileId):base;

function readJSON(base,otherwise){
 if(!local)return otherwise;
 try{const raw=local.getItem(storageKey(base));if(raw===null||raw.length>1000000)return otherwise;return JSON.parse(raw)}
 catch(e){return otherwise}
}
function link(path){return path}
function resumeOptions(){
 const definitions=[
  {base:'care-2018-drill-v2',unitTitle:'総合（全範囲）',target:'materials/care/suction-2018-quiz.html'},
  // Unsubmitted exams must never be selected as the automatic resume target.
  ...units.map(unit=>({
   base:'care-2018-drill-v2--'+unit.id,
   unitTitle:unit.title,
   target:'materials/care/suction-2018-quiz.html?unit='+encodeURIComponent(unit.id)
  }))
 ];
 const choices=[];
 for(const def of definitions){
  const state=readJSON(def.base,null);
  if(!state||typeof state!=='object'||Array.isArray(state)||state.completed===true)continue;
  const validOrder=Array.isArray(state.order)&&state.order.length>0&&state.order.length<=50?state.order.filter(n=>Number.isInteger(n)&&n>=1&&n<=50):[];
  if(!validOrder.length)continue;
  const answered=Object.entries(state.answers||{}).filter(([n,v])=>validOrder.includes(Number(n))&&Number.isInteger(v)&&v>=1&&v<=4).length;
  if(!answered)continue;
  choices.push({...def,answered,total:validOrder.length,savedAt:Number.isFinite(state.savedAt)?state.savedAt:0});
 }
 choices.sort((a,b)=>b.savedAt-a.savedAt||b.answered-a.answered);
 return choices;
}
function validHistory(){
 const value=readJSON('care-quiz-history-v1',[]);
 if(!Array.isArray(value))return [];
 return value.slice(-10000).filter(row=>row&&typeof row==='object'&&!Array.isArray(row)&&
 typeof row.questionId==='string'&&typeof row.correct==='boolean'&&unitById.has(row.unitId));
}
function buildFocus(records){
 const target=$('home-focus-list');
 target.replaceChildren();
 const first=new Map();
 for(const r of records)if(!first.has(r.questionId))first.set(r.questionId,r);
 const initial=[...first.values()];
 const rankings=units.map(u=>{
  const rows=initial.filter(r=>r.unitId===u.id);
  return {unit:u,answered:rows.length,correct:rows.filter(r=>r.correct).length};
 }).filter(r=>r.answered>=2)
 .map(r=>({...r,pct:Math.round(r.correct/r.answered*100)}))
 .filter(r=>r.pct<80).sort((a,b)=>a.pct-b.pct||b.answered-a.answered).slice(0,3);
 if(rankings.length){
  for(const r of rankings)addFocus('復習候補',r.unit.title,`初回 ${r.correct} / ${r.answered} 問（参考正答率 ${r.pct}%）`,
   'materials/care/suction-2018-quiz.html?unit='+encodeURIComponent(r.unit.id),'この単元を練習 →');
 }else if(initial.length){
  addFocus('学習を振り返る','単元別の学習記録','現時点で明確な復習候補はありません。回答数を増やして傾向を見てみましょう。',
   'materials/care/dashboard.html','詳細を見る →');
  addFocus('もっと練習する','練習ドリル','単元ごとの理解を確かめながら、回答記録を蓄積できます。',
   'materials/care/suction-2018-quiz.html','ドリルを開く →');
 }else{
  addFocus('FIRST STEP','一問ずつ練習する','まだ回答履歴がありません。練習ドリルから取り組めます。',
   'materials/care/suction-2018-quiz.html','練習を始める →');
  addFocus('TRY A TEST','模擬テストに挑戦','50問を解いてからまとめて結果を確認します。',
   'materials/care/suction-2018-test.html','模擬テストへ →');
 }
}
function addFocus(tag,title,description,path,actionText){
 const card=document.createElement('article');card.className='home-focus-card';
 const small=document.createElement('span');small.className='tag';small.textContent=tag;
 const heading=document.createElement('h3');heading.textContent=title;
 const desc=document.createElement('p');desc.textContent=description;
 const a=document.createElement('a');a.href=link(path);a.textContent=actionText;
 card.append(small,heading,desc,a);$('home-focus-list').append(card);
}
function render(){
 const modeLabel=$('home-mode'),privacy=$('home-privacy-note'),clear=$('home-clear-guest');
 if(mode==='guest'){
  modeLabel.textContent='GUEST / 一時利用';
  privacy.textContent='ゲストの記録はこのタブ内で一時保存。タブ復元時には残る場合があります。';
  clear.hidden=false;
 }else if(local&&profile){
  const name=profile.list().find(p=>p.id===profileId)?.name||'学習者';
  modeLabel.textContent=name+' / LOCAL PROFILE';
  privacy.textContent='学習履歴はこの端末内で暗号化して保存しています。';
  clear.hidden=true;
 }else{
  modeLabel.textContent='PROFILE / 未解錠';
  privacy.textContent='学習記録は表示していません。';
  clear.hidden=true;
 }
 const records=validHistory();
 const trainingIds=new Set(records.map(r=>r.questionId));
 for(const base of ['care-2018-drill-v2','care-2018-exam-v2',...units.map(u=>'care-2018-drill-v2--'+u.id)]){
  const s=readJSON(base,null);
  if(s&&s.answers&&typeof s.answers==='object')for(const n of Object.keys(s.answers)){
   const q=Number(n);if(Number.isInteger(q)&&q>=1&&q<=50)trainingIds.add('suction-2018-q'+String(q).padStart(2,'0'));
  }
 }
 const national=readJSON('care-national-medical-2024-2026-v1',null);
 const nationalIds=national?.answers&&typeof national.answers==='object'?Object.entries(national.answers)
  .filter(([id,v])=>/^(36|37)-(59|60|61|62|63)$|^38-(101|102|103|104|105)$/.test(id)&&Number.isInteger(v)&&v>=1&&v<=5).map(([id])=>id):[];
 const active=Number(trainingIds.size>0)+Number(nationalIds.length>0);
 $('home-attempts').textContent=local?trainingIds.size+nationalIds.length+'問':'—';
 $('home-covered').textContent=local?active+' / 2':'—';
 $('home-recent').textContent=local?'65問':'—';
 $('home-stats-note').textContent=local?'回答数はコースごとに集計。正答率は各コース内で確認できます。':'プロフィールの解錠後に表示します。';
 const choices=resumeOptions(),selected=choices[0];
 const anchor=$('resume-action');
 if(selected){
  $('resume-title').textContent='学習を再開';
  $('resume-description').textContent=selected.unitTitle+' · '+selected.answered+'/'+selected.total+'問';
  anchor.href=link(selected.target);anchor.querySelector('.resume-action-text').textContent='続きから学習';
 }else{
  $('resume-title').textContent=local?'新しい学習を始める':'プロフィールから始める';
  $('resume-description').textContent=local?'途中回答のあるドリルはありません':'プロフィールの解錠が必要です';
  anchor.href=local?'materials/care/suction-2018-quiz.html':'index.html';
  anchor.querySelector('.resume-action-text').textContent=local?'ドリルを開く':'STARTへ';
 }
 $('home-focus-list').replaceChildren();
 if(!local){addFocus('学習履歴','プロフィールを開く','HOMEでは解錠された学習記録だけを扱います。','index.html','STARTへ →');}
 else buildFocus(records);
}
$('home-clear-guest').addEventListener('click',()=>{
 if(mode!=='guest'||!confirm('このタブに保存されたゲストの学習記録をすべて削除しますか？'))return;
 try{guest.clear();guest.enter();render()}
 catch(e){$('home-privacy-note').textContent='ゲスト履歴を消去できませんでした。ブラウザの保存設定を確認してください。'}
});
render();
})();