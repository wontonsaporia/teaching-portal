(async()=>{'use strict';
const vault=window.TeachingVault;await vault.ready;const localStorage=vault.local;
const BANK=window.CARE_BANK;const Q=BANK?BANK.questions:(window.CARE_QUIZ_QUESTIONS||[]), $=id=>document.getElementById(id), test=document.body.dataset.mode==='test';
const unitParam=!test?new URLSearchParams(window.location.search).get('unit'):null;
const activeUnit=BANK&&BANK.units.some(u=>u.id===unitParam)?unitParam:null;
const baseSessionKey='care-2018-'+(test?'exam':'drill')+'-v2'+(activeUnit?'--'+activeUnit:'');
const prefix=window.TeachingMode?.guest?baseSessionKey:window.TeachingProfiles.scopedKey(baseSessionKey,window.TeachingProfiles.activeId());
const all=Q.filter(q=>!activeUnit||q.unitId===activeUnit).map(q=>q.n),byNum=n=>Q.find(q=>q.n===n),randomize=x=>{const a=[...x];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
let order=[...all],answers={},first={},index=0,completed=false,elapsed=0,start=Date.now(),revealed={};

let choiceMode='original',choiceOrders={};
const validPermutation=a=>Array.isArray(a)&&a.length===4&&new Set(a).size===4&&a.every(i=>Number.isInteger(i)&&i>=1&&i<=4);
const freshChoiceOrders=()=>Object.fromEntries(Q.map(q=>[q.n,randomize([1,2,3,4])]));
const displayOrder=n=>choiceMode==='shuffled'&&validPermutation(choiceOrders[n])?choiceOrders[n]:[1,2,3,4];
const displayNumber=(n,sourceValue)=>displayOrder(n).indexOf(sourceValue)+1;
try{let o=JSON.parse(localStorage.getItem(prefix)||'{}');if(Array.isArray(o.order)&&o.order.length&&o.order.every(n=>all.includes(n))&&new Set(o.order).size===o.order.length)order=o.order;if(o.answers&&typeof o.answers==='object')answers=Object.fromEntries(Object.entries(o.answers).filter(([k,v])=>all.includes(Number(k))&&Number.isInteger(v)&&v>=1&&v<=4));if(o.first&&typeof o.first==='object')first=o.first;if(o.choiceMode==='shuffled')choiceMode='shuffled';if(o.choiceOrders&&typeof o.choiceOrders==='object')for(const [n,a] of Object.entries(o.choiceOrders)){if(validPermutation(a))choiceOrders[n]=a;}index=Math.max(0,Math.min(order.length-1,Number(o.index)||0));elapsed=Number(o.elapsed)||0;completed=!!o.completed;}catch(e){}
const save=()=>localStorage.setItem(prefix,JSON.stringify({order,answers,first,index,elapsed:elapsed+(Date.now()-start)/1000,completed,choiceMode,choiceOrders,savedAt:Date.now()}));
const point=()=>{elapsed+=(Date.now()-start)/1000;start=Date.now()};
const current=()=>byNum(order[index]);
const answered=n=>Number.isInteger(answers[n]);
const scoreEligible=n=>!BANK||BANK.scoreEligible(byNum(n));
const historyKey=window.TeachingMode?.guest?'care-quiz-history-v1':window.TeachingProfiles.scopedKey('care-quiz-history-v1',window.TeachingProfiles.activeId());
function record(n,choice){const q=byNum(n);if(!q||!scoreEligible(n))return;try{const h=JSON.parse(localStorage.getItem(historyKey)||'[]');h.push({questionId:q.id||String(n),examId:q.examId||'suction-2018-okinawa',number:n,unitId:q.unitId||q.topic,mode:test?'test':'drill',choice,correct:choice===q.key,keyStatus:q.answerVerification||'unofficial',at:new Date().toISOString(),firstAttempt:!h.some(x=>x.questionId===(q.id||String(n)))});localStorage.setItem(historyKey,JSON.stringify(h.slice(-10000)))}catch(e){}}
const correct=n=>scoreEligible(n)&&answered(n)&&answers[n]===byNum(n).key;
const scoreable=()=>order.filter(scoreEligible);
const page=n=>byNum(n).sourcePage||Math.min(11,Math.ceil(n/5));
const marker=n=>byNum(n).transcriptionReviewed?'転記確認済み':'原文の逐字照合待ち';
function elements(tag,txt,cls){const e=document.createElement(tag);if(txt!=null)e.textContent=txt;if(cls)e.className=cls;return e}
function fill(el,...children){el.replaceChildren(...children)}
function go(i){index=Math.max(0,Math.min(order.length-1,i));save();render();window.scrollTo({top:0,behavior:'smooth'})}
function nav(){const box=$('navigator');box.replaceChildren();order.forEach((n,i)=>{const b=elements('button',n);b.type='button';b.className=(i===index?'active ':'')+(!scoreEligible(n)?'skipped':test?(answered(n)?'attempted':''):(answered(n)?(correct(n)?'done':'miss'):''));b.title='問'+n;b.onclick=()=>{if(test&&completed)return;go(i)};box.append(b)})}
function feedback(q){
 const box=$('feedback');box.replaceChildren();box.hidden=true;
 if(test||!answered(q.n)||!scoreEligible(q.n))return;
 box.hidden=false;
 const right=correct(q.n),text=elements('div',right?'✓ 正解（参考解答）':'✕ 不正解（参考解答）','inline-result '+(right?'good':'bad'));box.append(text);
 if(!right){const note=elements('div',null,'details missed');note.append(elements('strong','参考解答：'+displayNumber(q.n,q.key)+'） '+q.options[q.key-1]),elements('p',q.explanation||'原本と研修資料を参照してください。'));box.append(note)}
 else{const details=elements('details',null,'details');details.append(elements('summary','解説を見る'),elements('p',q.explanation||'原本と研修資料を参照してください。'));box.append(details)}
}
function render(){
 $('screen').hidden=false;$('report').hidden=true;
 const q=current(),eligible=scoreable();if(activeUnit){const u=BANK.getUnit(activeUnit);document.querySelector('.hero h1').textContent=u.title+'｜単元別ドリル';document.querySelector('.hero .sub').textContent='この単元の'+all.length+'問を練習します。回答後にすぐ正誤が確認できます。';}$('choice-order').value=choiceMode;$('choice-order').disabled=test&&Object.keys(answers).some(n=>answered(Number(n)));
$('progress').style.width=(eligible.filter(answered).length/Math.max(eligible.length,1)*100)+'%';
 $('position').textContent='原本 問'+q.n+'（'+(index+1)+' / '+order.length+'）';
 $('counter').textContent=eligible.filter(answered).length+' / '+eligible.length+'問 回答済み（採点対象）';
 $('category').textContent=q.topic;$('question').textContent=q.stem;
 $('source-page').textContent='原本 p.'+page(q.n)+' · 原文逐字照合待ち · 参考解答未検証';
 const diagram=$('diagram');diagram.hidden=q.n!==21;
 if(q.n===21){diagram.textContent='問21の図（原本を軽量化して表示）。画像が見えない場合は原本PDFを参照してください。';if(window.CARE_Q21_IMAGE){const img=document.createElement('img');img.src=window.CARE_Q21_IMAGE;img.alt='頭頸部の矢状断面：空気と飲食物の経路。図中に①から④の番号と指示線がある。';img.loading='lazy';img.style.cssText='display:block;width:100%;max-width:560px;height:auto;margin:auto;';diagram.replaceChildren(img);}}
 const box=$('options');box.replaceChildren();
 displayOrder(q.n).forEach((value,i)=>{const v=q.options[value-1],b=elements('button',null,'choice');b.type='button';b.append(elements('span',String(i+1),'number'),elements('span',v));const selected=answers[q.n]===value;
 if(selected)b.classList.add('selected');if(!scoreEligible(q.n)){b.disabled=true;}else if(!test&&answered(q.n)){b.disabled=true;if(value===q.key)b.classList.add('right');if(selected&&!correct(q.n))b.classList.add('wrong')}
 else if(test&&completed)b.disabled=true;
 b.setAttribute('aria-pressed',String(selected));
 b.onclick=()=>{if(!scoreEligible(q.n)||(!test&&answered(q.n)))return; const wasAnswered=answered(q.n);if(test){answers[q.n]=value;}else{answers[q.n]=value;if(!(q.n in first))first[q.n]=value;if(!wasAnswered)record(q.n,value);}save();render();if(!test)$('feedback').scrollIntoView({block:'nearest',behavior:'smooth'})};
 box.append(b)});
 feedback(q);$('prev').disabled=index===0;
 $('next').textContent=index===order.length-1?(test?'提出して結果を見る':'練習結果を見る'):'次の問題へ';
 $('source').href='../care/disclaimer.html';nav();
}
function pct(x,y){return y?Math.round(x/y*100):0}
function report(){
 point();if(test&&!completed){order.filter(answered).forEach(n=>record(n,answers[n]));}if(test)completed=true;save();
 $('screen').hidden=true;$('report').hidden=false;
 const set=order.map(byNum).filter(q=>scoreEligible(q.n)),done=set.filter(q=>answered(q.n)),right=done.filter(q=>correct(q.n)),wrong=done.filter(q=>!correct(q.n)),pending=set.filter(q=>!answered(q.n));
 $('report-title').textContent=test?'テスト分析レポート':'ドリル学習レポート';
 $('score').textContent=right.length+' / '+set.length+' 問';
 $('metrics').replaceChildren();
 [['正答率',pct(right.length,set.length)+'%'],['回答済み',done.length+'問'],['所要時間',Math.max(1,Math.round(elapsed/60))+'分']].forEach(([name,value])=>{const card=elements('div',null,'metric');card.append(elements('strong',value),elements('span',name));$('metrics').append(card)});
 $('weak').replaceChildren();
 const units=BANK?BANK.units.map(u=>({id:u.id,title:u.title})):([...new Set(set.map(q=>q.topic))].map(t=>({id:t,title:t})));
 units.forEach(unit=>{const items=set.filter(q=>BANK?q.unitId===unit.id:q.topic===unit.id),correctCount=items.filter(q=>correct(q.n)).length,row=elements('div',null,'barrow'),bar=elements('div',null,'bar'),val=elements('div');val.style.width=pct(correctCount,items.length)+'%';bar.append(val);row.append(elements('span',unit.title),elements('span',correctCount+'/'+items.length+'問（'+pct(correctCount,items.length)+'%）'),bar);$('weak').append(row)});
 $('wrong-list').replaceChildren();
 [...wrong,...pending].forEach(q=>{const b=elements('button','問'+q.n+(answered(q.n)?'（不正解）':'（未回答）'));b.onclick=()=>{if(test){$('review-dialog').hidden=false;const text=displayOrder(q.n).map((n,i)=>(i+1)+'）'+q.options[n-1]).join('\n');$('review-dialog').textContent='問'+q.n+'\n'+q.stem+'\n'+text+'\nあなたの回答：'+(answered(q.n)?displayNumber(q.n,answers[q.n]):'未回答')+'\n参考解答：'+displayNumber(q.n,q.key)+'\n'+(q.explanation||'') }else go(order.indexOf(q.n))};$('wrong-list').append(b)});
 if(!wrong.length&&!pending.length)$('wrong-list').append(elements('p','すべて正解です。','muted'));
 $('quality').textContent='公式解答表がなく、全問の原文逐字照合も未完了です。参考解答は法令や医学的知識等による推論です。得点は学習用の参考値です。';
 $('review-dialog').hidden=true;
 window.scrollTo({top:0,behavior:'smooth'});
}
$('prev').onclick=()=>go(index-1);
$('next').onclick=()=>{if(index<order.length-1){go(index+1)}else if(!test||confirm('テストを提出して、解答と分析レポートを表示しますか？'))report()};
$('finish').onclick=()=>{if(!test||confirm('テストを提出しますか？未回答は不正解として集計されます。'))report()};
$('choice-order').onchange=()=>{
 const wanted=$('choice-order').value==='shuffled'?'shuffled':'original';
 if(test&&Object.keys(answers).some(n=>answered(Number(n)))){$('choice-order').value=choiceMode;return;}
 choiceMode=wanted;
 if(wanted==='shuffled')choiceOrders=freshChoiceOrders();
 else choiceOrders={};
 save();render();
};
$('order').onchange=()=>{const n=current().n;order=$('order').value==='random'?randomize(order):[...order].sort((a,b)=>a-b);index=order.indexOf(n);save();render()};
$('reset').onclick=()=>{if(!confirm('このページの回答履歴を削除しますか？（全教材のブラウザキャッシュは削除しません）'))return;localStorage.removeItem(prefix);answers={};first={};order=[...all];index=0;completed=false;elapsed=0;start=Date.now();choiceMode='original';choiceOrders={};$('order').value='ordered';$('choice-order').value='original';render()};
$('retry-wrong').onclick=()=>{const wrong=order.filter(n=>answered(n)&&!correct(n));if(!wrong.length)return;order=wrong;wrong.forEach(n=>delete answers[n]);index=0;completed=false;point();save();render()};
$('restart').onclick=()=>{if(!confirm('このページの回答を消去して全50問をやり直しますか？'))return;answers={};first={};order=[...all];index=0;completed=false;elapsed=0;start=Date.now();if(choiceMode==='shuffled')choiceOrders=freshChoiceOrders();save();render()};
$('back').onclick=()=>{if(test&&completed){$('report').hidden=false;return}render()};
window.TeachingSaveProgress=async()=>{point();save();await vault.flush()};
window.addEventListener('pagehide',()=>{save();vault.flush().catch(()=>{})});
window.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')vault.flush().catch(()=>{})});
if(test&&completed){const completedBefore=completed;report();}else render();
})();