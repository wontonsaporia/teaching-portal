(async()=>{
'use strict';
const $=id=>document.getElementById(id),bank=window.NATIONAL_MEDICAL_BANK,vault=window.TeachingVault,guest=window.TeachingMode?.guest;
if(!vault||!bank){$('exam-status').textContent='問題バンクを読み込めませんでした。';return}
try{await vault.ready}catch(e){$('exam-status').textContent='学習プロフィールを解錠できませんでした。';return}
const baseKey='care-national-medical-2024-2026-v1';
const key=guest?baseKey:window.TeachingProfiles.scopedKey(baseKey,window.TeachingProfiles.activeId());
const local=vault.local;
let answers={};
try{const data=JSON.parse(local.getItem(key)||'{}');if(data&&typeof data.answers==='object'&&!Array.isArray(data.answers))for(const [k,v] of Object.entries(data.answers))if(bank.questions.some(q=>q.id===k)&&Number.isInteger(v)&&v>=1&&v<=5)answers[k]=v}catch(e){}
let round=38,index=0;
function save(){local.setItem(key,JSON.stringify({version:1,answers,savedAt:Date.now()}))}
window.TeachingSaveProgress=async()=>{save();await vault.flush()};
window.addEventListener('pagehide',()=>{try{save();vault.flush().catch(()=>{})}catch(e){}});
function make(tag,text,className){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(className)n.className=className;return n}
const getSet=()=>bank.sets.find(s=>s.round===round),getQuestions=()=>bank.questions.filter(q=>q.round===round),getQuestion=()=>getQuestions()[index];
function renderTabs(){
 $('year-tabs').replaceChildren();
 for(const s of bank.sets){const btn=make('button','第'+s.round+'回（'+s.year+'年）');btn.type='button';btn.setAttribute('aria-pressed',String(s.round===round));btn.addEventListener('click',()=>{round=s.round;index=0;render()});$('year-tabs').append(btn)}
}
function render(){
 renderTabs();
 const s=getSet(),questions=getQuestions(),q=getQuestion();
 $('exam-workspace').hidden=false;
 $('question-position').textContent='第'+round+'回　問題'+q.n+'　('+ (index+1)+'/5)';
 $('question-topic').textContent=q.topic;
 $('source-link').href=q.source;
 $('answer-link').href=q.answerSource;
 if($('exam-pdf').dataset.url!==q.source){$('exam-pdf').src=q.source;$('exam-pdf').dataset.url=q.source}
 const buttons=$('choice-buttons');buttons.replaceChildren();
 for(let choice=1;choice<=5;choice++){const b=make('button',String(choice));b.type='button';b.setAttribute('aria-pressed',String(answers[q.id]===choice));b.addEventListener('click',()=>{answers[q.id]=choice;try{save();$('exam-status').textContent='回答を保存しました'}catch(e){$('exam-status').textContent='保存に失敗しました。'}render()});buttons.append(b)}
 const result=$('answer-result');
 if(answers[q.id]!==undefined){const isCorrect=answers[q.id]===q.answer;result.textContent=(isCorrect?'公式正答と一致':'公式正答と不一致')+'（公式正答：'+q.answer+'）';}else result.textContent='解答を選択すると、公式正答番号と照合します。';
 const count=questions.filter(q=>answers[q.id]!==undefined).length;
 $('exam-count').textContent=count+'/5問 回答済み';
 const nav=$('question-buttons');nav.replaceChildren();
 for(const [i,item] of questions.entries()){const b=make('button',String(i+1),answers[item.id]!==undefined?'answered':'');b.type='button';b.title='問題'+item.n;b.setAttribute('aria-current',String(index===i));b.addEventListener('click',()=>{index=i;render()});nav.append(b)}
 $('previous').disabled=index===0;$('next').disabled=index===questions.length-1;
 $('question-review').textContent=q.review?'要確認：'+q.review:'出題当時の正答と現行の実務指針の適合性を確認してください。';
 $('exam-status').textContent='学習履歴は'+(guest?'このタブ内に一時保存':'プロフィール内で暗号化保存')+'されます。';
}
$('previous').addEventListener('click',()=>{if(index>0){index--;render()}});
$('next').addEventListener('click',()=>{if(index<4){index++;render()}});
$('clear-exam').addEventListener('click',()=>{if(!confirm('この15問の解答記録を削除しますか？'))return;answers={};try{save();render()}catch(e){$('exam-status').textContent='記録を削除できませんでした'}});
render();
})();