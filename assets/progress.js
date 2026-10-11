(async()=>{'use strict';
const $=id=>document.getElementById(id),vault=window.TeachingVault,guest=window.TeachingMode?.guest,profile=window.TeachingProfiles;
try{await vault.ready}catch(e){$('progress-status').textContent='学習記録を読み込めません。学習プロフィールを解錠してください。';return}
const key=base=>guest?base:profile.scopedKey(base,profile.activeId());
function read(base,fallback){try{const raw=vault.local.getItem(key(base));return raw===null?fallback:JSON.parse(raw)}catch(e){return fallback}}
function box(tag,text,cls){const x=document.createElement(tag);if(text!==undefined)x.textContent=text;if(cls)x.className=cls;return x}
const oldHistory=read('care-quiz-history-v1',[]);
const training=Array.isArray(oldHistory)?oldHistory.filter(x=>x&&typeof x.questionId==='string'&&x.questionId.startsWith('suction-2018-')):[];
const trainingIds=new Set(training.map(x=>x.questionId));
const units=['human','healthcare','safety','infection','observation','suction-general','suction-practice','feeding-general','feeding-practice'];
const sessions=['care-2018-drill-v2','care-2018-exam-v2',...units.map(id=>'care-2018-drill-v2--'+id)];
for(const base of sessions){const s=read(base,null);if(!s||typeof s!=='object'||!s.answers)continue;for(const n of Object.keys(s.answers)){const num=Number(n);if(Number.isInteger(num)&&num>=1&&num<=50)trainingIds.add('suction-2018-q'+String(num).padStart(2,'0'))}}
const national=read('care-national-medical-2024-2026-v1',null);
const answers=national&&typeof national.answers==='object'&&!Array.isArray(national.answers)?national.answers:{};
const years=[{round:38,year:2026,nums:[101,102,103,104,105],correct:[1,5,3,2,4]},{round:37,year:2025,nums:[59,60,61,62,63],correct:[1,4,4,1,3]},{round:36,year:2024,nums:[59,60,61,62,63],correct:[5,4,1,2,3]}];
const valid=Object.keys(answers).filter(k=>years.some(y=>y.nums.some(n=>k===y.round+'-'+n))&&Number.isInteger(answers[k])&&answers[k]>=1&&answers[k]<=5);
const courses=Number(trainingIds.size>0)+Number(valid.length>0);
$('progress-status').textContent=guest?'ゲストモード：このタブの一時記録です。':'プロフィール内の暗号化された記録を表示しています。';
for(const [label,value] of [['取り組み中のコース',courses],['回答済みの異なる問題',trainingIds.size+valid.length]]){const m=box('section',undefined,'progress-metric');m.append(box('span',label),box('strong',String(value)));$('progress-overview').append(m)}
const root=$('progress-courses');
const trainingCard=box('article',undefined,'progress-course');trainingCard.append(box('span','医療・介護 / TRAINING','home-kicker'),box('h3','喀痰吸引等研修'),box('p','平成30年度後期・沖縄県 / 50問 / 9単元'));
const td=box('div',undefined,'progress-details');td.append(box('span',trainingIds.size+' / 50問に回答'));trainingCard.append(td);
const tl=box('div',undefined,'progress-links');
for(const [label,path] of [['単元別の学習分析 →','materials/care/dashboard.html'],['練習ドリル →','materials/care/suction-2018-quiz.html'],['模擬テスト →','materials/care/suction-2018-test.html']]){const a=box('a',label);a.href=path;tl.append(a)}trainingCard.append(tl,box('p','正答率は公式正答表による監修が未完了の暫定参考値です。','progress-note'));root.append(trainingCard);
const nationalCard=box('article',undefined,'progress-course');nationalCard.append(box('span','医療・介護 / NATIONAL EXAM','home-kicker'),box('h3','介護福祉士国家試験'),box('p','医療的ケア / 第36〜38回 / 15問'));
const nd=box('div',undefined,'progress-details');nd.append(box('span',valid.length+' / 15問に回答'));nationalCard.append(nd);
for(const y of years){const row=box('div',undefined,'progress-year');const matched=y.nums.map((n,i)=>({n,i,id:y.round+'-'+n})).filter(x=>valid.includes(x.id));const correct=matched.filter(x=>answers[x.id]===y.correct[x.i]).length;row.append(box('span','第'+y.round+'回（'+y.year+'年）'),box('span',matched.length+'/5問'+(matched.length?' · '+correct+'/'+matched.length+'正解':'')));nationalCard.append(row)}
const nlink=box('div',undefined,'progress-links');const na=box('a','国家試験の問題を開く →');na.href='materials/care/national-medical-quiz.html';nlink.append(na);nationalCard.append(nlink,box('p','出題当時の公式正答との照合結果です。2026年の実務基準と同一とは限りません。','progress-note'));root.append(nationalCard);
})();