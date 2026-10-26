(()=>{'use strict';
const bank=window.PROPORTION_READING_BANK;
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

/* Small, accessible schematic diagrams for moving points and meshing gears.
   They show the geometric relationships, not a to-scale tooth profile. */
const NS='http://www.w3.org/2000/svg';
function el(parent,tag,attrs={},label){const n=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))n.setAttribute(k,String(v));if(label!==undefined)n.textContent=label;parent.append(n);return n}
function line(svg,x1,y1,x2,y2,attrs={}){return el(svg,'line',{x1,y1,x2,y2,stroke:'#607b6d','stroke-width':3,...attrs})}
function label(svg,x,y,t,attrs={}){return el(svg,'text',{x,y,fill:'#243d35','font-size':17,'text-anchor':'middle',...attrs},t)}
function dot(svg,x,y,name,dx=0,dy=-13){el(svg,'circle',{cx:x,cy:y,r:6,fill:'#1e5947'});label(svg,x+dx,y+dy,name)}
function picture(q){
 const wrap=$('diagram'),figure=$('figure'),caption=$('diagram-caption');
 wrap.replaceChildren();const d=q.diagram;figure.hidden=!d;if(!d)return;
 const svg=el(wrap,'svg',{viewBox:'0 0 680 285',role:'img','aria-label':d.kind==='gears'?'かみ合う歯車の模式図':d.kind==='inverse'?'反比例のグラフ上の動点P':d.kind==='segment'?'線分AB上を動く点P':'長方形ABCD上を動く点P'});
 if(d.kind==='segment'){
  const A=[85,125],B=[595,125],P=[350,125];
  line(svg,...A,...B,{stroke:'#bdcec2','stroke-width':7});
  line(svg,...A,...P,{stroke:'#247457','stroke-width':6});
  dot(svg,...A,'A');dot(svg,...B,'B');dot(svg,...P,'P');
  label(svg,340,190,'AB = '+d.length+'cm');
  label(svg,216,103,'x');
  caption.textContent='線分の模式図（Pの位置は一例）。';
 }else if(d.kind==='rectangle'){
  const A=[112,50],B=[552,50],C=[552,218],D=[112,218];
  const onBC=d.route==='ABC';
  const P=onBC?[552,143]:[342,50];
  el(svg,'rect',{x:A[0],y:A[1],width:440,height:168,fill:'#f6faf6',stroke:'#607b6d','stroke-width':3});
  if(d.tri==='APD')el(svg,'polygon',{points:[A,P,D].map(p=>p.join(',')).join(' '),fill:'#b5dcc5','fill-opacity':'.55',stroke:'#2f8460','stroke-dasharray':'7 5','stroke-width':2});
  line(svg,...A,...B,{stroke:'#247457','stroke-width':5});
  if(onBC)line(svg,...B,...C,{stroke:'#247457','stroke-width':5});
  dot(svg,...A,'A',-16,-10);dot(svg,...B,'B',16,-10);dot(svg,...C,'C',17,19);dot(svg,...D,'D',-17,20);dot(svg,...P,'P',onBC?20:0,onBC?-1:-12);
  label(svg,328,270,'AB = '+d.width+'cm');
  label(svg,628,141,'BC = '+d.height+'cm');
  caption.textContent=onBC?'長方形の模式図。点PはA→B→Cの辺上を移動（現在の位置は一例）。':'長方形の模式図。点Pは辺AB上を移動（現在の位置は一例）。';
  if(d.route==='ABopenB')caption.textContent+=' PはBに到達しない。';
 }else if(d.kind==='gears'){
  const teeth=d.teeth;const rs=teeth.map(t=>typeof t==='number'?Math.max(32,t*1.38):48);
  const gap=36,total=rs.reduce((a,b)=>a+2*b,0)+(teeth.length-1)*gap;
  const scale=Math.min(1.15,560/total);const radius=rs.map(r=>r*scale);
  let x=340-(radius.reduce((a,b)=>a+2*b,0))/2;
  const centers=[];
  for(let i=0;i<radius.length;i++){x+=radius[i];centers.push(x);x+=radius[i];}
  // Touching pitch circles: the center distance between neighbors is the sum of radii.
  for(let i=0;i<centers.length;i++){
   el(svg,'circle',{cx:centers[i],cy:136,r:radius[i],fill:i%2?'#eaf3ee':'#d7e9df',stroke:'#375c4d','stroke-width':3});
   el(svg,'circle',{cx:centers[i],cy:136,r:7,fill:'#375c4d'});
   label(svg,centers[i],124,d.labels[i],{'font-weight':700});
   label(svg,centers[i],164,String(teeth[i])+'歯',{'font-size':15});
  }
  caption.textContent='歯車の模式図（円周の歯は省略）。回転方向と回転数は問題文から考える。';
 }else if(d.kind==='inverse'){
  const X=x=>66+56*x,Y=y=>249-17.5*y;
  line(svg,X(0),Y(0),X(10),Y(0),{'stroke-width':2});
  line(svg,X(0),Y(0),X(0),Y(12.5),{'stroke-width':2});
  label(svg,X(10)+14,Y(0)+8,'x');label(svg,X(0)-10,Y(12.5)-8,'y');
  const p=[];for(let x=2;x<=9.01;x+=.08)p.push(X(x)+','+Y(24/x));
  el(svg,'polyline',{points:p.join(' '),fill:'none',stroke:'#98b2a3','stroke-width':3});
  const active=[];for(let x=d.from[0];x<=d.to[0]+.001;x+=.08)active.push(X(x)+','+Y(24/x));active.push(X(d.to[0])+','+Y(d.to[1]));
  el(svg,'polyline',{points:active.join(' '),fill:'none',stroke:'#1e7455','stroke-width':5});
  dot(svg,X(3),Y(8),'(3, 8)',-40,-16);dot(svg,X(8),Y(3),'(8, 3)',20,-16);
  label(svg,343,22,'y = 24 / x',{'font-size':18});
  caption.textContent='座標平面の模式図。緑の部分がPの移動範囲（端点を含む）。';
 }
}

function renderQuestion(){const q=bank.questions.find(x=>x.id===selectedId);if(!q)return;
const u=bank.units.find(x=>x.id===q.unit);
text('unit-label',q.unit+' / '+u.name);text('level-label','難易度 '+q.level);text('position',(visible.findIndex(x=>x.id===q.id)+1)+' / '+visible.length);
text('question-title','問題 '+q.id.slice(1));text('question-body',q.body);text('question-task',q.task);$('response').value=answers.get(q.id)||'';
text('answer',q.answer);text('focus',q.focus);text('pitfall',q.likely_misreading);
picture(q);
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