(()=>{'use strict';
const bank=window.EQUATION_READING_BANK;
const $=id=>document.getElementById(id);
if(!bank||!Array.isArray(bank.questions)){document.body.textContent='問題データを読み込めませんでした。';return;}
const answers=new Map(),ratings=new Map();
let selectedId=bank.questions[0].id,visible=[],revealed=false;
for(const u of bank.units)$('unit').add(new Option(u.id+' · '+u.name,u.id));
const matches=q=>( $('unit').value==='all'||q.unit===$('unit').value )&&($('level').value==='all'||String(q.level)===$('level').value)&&($('status-filter').value==='all'||($('status-filter').value==='unseen'?!ratings.has(q.id):ratings.get(q.id)===$('status-filter').value));
function text(id,value){$(id).textContent=value}
function renderFilters(){visible=bank.questions.filter(matches);if(!visible.some(q=>q.id===selectedId))selectedId=visible[0]?.id||null;
const nav=$('numbers');nav.replaceChildren();visible.forEach(q=>{const b=document.createElement('button');b.type='button';b.textContent=q.id.slice(1);b.className=[q.id===selectedId?'active':'',ratings.get(q.id)||''].join(' ').trim();b.setAttribute('aria-label','問題'+q.id.slice(1));if(q.id===selectedId)b.setAttribute('aria-current','true');b.addEventListener('click',()=>{save();selectedId=q.id;revealed=false;renderQuestion();});nav.append(b)});
text('count',visible.length+'問を表示 / 全'+bank.questions.length+'問');
text('stats','理解 '+[...ratings.values()].filter(x=>x==='done').length+' / 要復習 '+[...ratings.values()].filter(x=>x==='retry').length);
$('empty').hidden=visible.length>0;$('problem').hidden=visible.length===0;
renderQuestion();}
function save(){if(selectedId)answers.set(selectedId,$('response').value)}
function renderQuestion(){const q=bank.questions.find(x=>x.id===selectedId);if(!q)return;
const u=bank.units.find(x=>x.id===q.unit);
text('unit-label',q.unit+' / '+u.name);text('level-label','難易度 '+q.level);text('position',(visible.findIndex(x=>x.id===q.id)+1)+' / '+visible.length);
text('question-title','問題 '+q.id.slice(1));text('question-body',q.body);text('question-task',q.task);$('response').value=answers.get(q.id)||'';
text('answer',q.answer);text('focus',q.focus);text('pitfall',q.likely_misreading);
$('solution').hidden=!revealed;$('reveal').setAttribute('aria-expanded',String(revealed));$('reveal').textContent=revealed?'解答例を閉じる':'解答例と読解ポイントを見る';
const i=visible.findIndex(x=>x.id===q.id);$('prev').disabled=i<=0;$('next').disabled=i>=visible.length-1;
$('mark-done').setAttribute('aria-pressed',String(ratings.get(q.id)==='done'));$('mark-retry').setAttribute('aria-pressed',String(ratings.get(q.id)==='retry'));
}
$('response').addEventListener('input',save);
for(const id of ['unit','level','status-filter'])$(id).addEventListener('change',()=>{save();revealed=false;renderFilters()});
$('reveal').addEventListener('click',()=>{revealed=!revealed;renderQuestion()});
function mark(status){if(!selectedId)return;save();if(status)ratings.set(selectedId,status);else ratings.delete(selectedId);renderFilters()}
$('mark-done').onclick=()=>mark('done');$('mark-retry').onclick=()=>mark('retry');$('mark-clear').onclick=()=>mark(null);
function step(d){save();const i=visible.findIndex(x=>x.id===selectedId);if(!visible[i+d])return;selectedId=visible[i+d].id;revealed=false;renderFilters();document.querySelector('.problem').scrollIntoView({behavior:'smooth',block:'start'})}
$('prev').onclick=()=>step(-1);$('next').onclick=()=>step(1);$('print').onclick=()=>window.print();
window.addEventListener('beforeunload',()=>{});renderFilters();
})();