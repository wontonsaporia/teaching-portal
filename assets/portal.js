// 教材一覧: 分野 → コース → 問題集・教材。分析画面は教材数に含めない。
const $=id=>document.getElementById(id);
const normalize=v=>String(v||'').normalize('NFKC').toLocaleLowerCase('ja');
const courses=window.TEACHING_COURSES.filter(x=>!x.hidden);
const materials=window.TEACHING_MATERIALS.filter(x=>!x.hidden&&x.kind!=='analytics');
const catalog=$('materials'),search=$('search'),subject=$('subject'),course=$('course');
function node(tag,text,cls){const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n}
function renderCourseOptions(){
 const selected=course.value;
 course.replaceChildren(new Option('すべてのコース','all'));
 for(const c of courses.filter(x=>subject.value==='all'||x.subject===subject.value)){
   course.add(new Option(c.title,c.id));
 }
 course.value=[...course.options].some(x=>x.value===selected)?selected:'all';
}
function card(m){
 const item=node('article',undefined,'card');
 item.append(node('p',[m.grade,m.format].filter(Boolean).join(' · '),'meta'));
 item.append(node('h3',m.title));
 item.append(node('p',m.description,'description'));
 const a=node('a',m.action||'教材を開く');a.href=m.path;
 if(m.external){a.target='_blank';a.rel='noopener noreferrer';}
 item.append(a);return item;
}
function render(){
 const words=normalize(search.value).trim().split(/\s+/).filter(Boolean);
 const active=materials.filter(m=>{
  const c=courses.find(x=>x.id===m.courseId);
  if(!c||(subject.value!=='all'&&m.subject!==subject.value)||(course.value!=='all'&&m.courseId!==course.value))return false;
  const text=normalize([c.title,c.description,m.title,m.description,m.grade,m.format,...(m.tags||[])].join(' '));
  return words.every(w=>text.includes(w));
 });
 catalog.replaceChildren();
 const groups=courses.filter(c=>active.some(x=>x.courseId===c.id)).sort((a,b)=>a.order-b.order);
 for(const c of groups){
   const section=node('section',undefined,'catalog-course');
   section.dataset.courseId=c.id;
   const header=node('div',undefined,'catalog-course-head');
   const line=node('p',c.subjectLabel,'home-kicker');
   const h=node('h3',c.title);
   const desc=node('p',c.description,'catalog-course-description');
   header.append(line,h,desc);section.append(header);
   const body=node('div',undefined,'grid');for(const m of active.filter(x=>x.courseId===c.id))body.append(card(m));
   section.append(body);catalog.append(section);
 }
 $('count').textContent=active.length+'件 / '+groups.length+'コース';
 $('empty').hidden=active.length>0;
}
search.addEventListener('input',render);
subject.addEventListener('change',()=>{renderCourseOptions();render()});
course.addEventListener('change',render);
renderCourseOptions();render();
