/* Local-only learning profiles. They are NOT accounts or a security boundary. */
(function(){
'use strict';
const catalogKey='teaching-portal-profiles-v1',activeKey='teaching-portal-active-profile-v1';
const baseProfile={id:'default',name:'デフォルト'};
function load(){
 try{const a=JSON.parse(localStorage.getItem(catalogKey)||'[]');if(Array.isArray(a))return [baseProfile,...a.filter(p=>p&&typeof p.id==='string'&&/^[a-z0-9-]{6,80}$/.test(p.id)&&p.id!=='default'&&typeof p.name==='string'&&p.name.length<=24)];}catch(e){}
 return [baseProfile];
}
function activeId(){
 try{const id=localStorage.getItem(activeKey)||'default';return load().some(p=>p.id===id)?id:'default'}catch(e){return 'default'}
}
function keyFor(base,id){return id==='default'?base:base+'::'+id}
function change(id){if(!load().some(p=>p.id===id))return;try{localStorage.setItem(activeKey,id)}catch(e){}window.location.reload()}
function create(){
 const input=prompt('学習プロフィール名を入力（24文字以内）。同じ端末の誰でも切り替えられます。');
 if(input===null)return;
 const name=input.trim().slice(0,24);if(!name)return;
 const profiles=load();if(profiles.length>=11){alert('プロフィールは最大11件です。');return}
 if(profiles.some(p=>p.name===name)){alert('同じ名前のプロフィールがあります。');return}
 const id='p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 try{localStorage.setItem(catalogKey,JSON.stringify([...profiles.filter(x=>x.id!=='default'),{id,name}]));localStorage.setItem(activeKey,id)}catch(e){alert('保存できませんでした。ブラウザの保存設定を確認してください。');return}
 window.location.reload();
}
function remove(){
 const id=activeId();if(id==='default'){alert('デフォルトは削除できません。');return}
 const item=load().find(p=>p.id===id);
 if(!confirm('「'+item.name+'」の学習データとプロフィールをこのブラウザから削除しますか？復元できません。'))return;
 try{
  const keys=[];
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.endsWith('::'+id))keys.push(k)}
  keys.forEach(k=>localStorage.removeItem(k));
  localStorage.setItem(catalogKey,JSON.stringify(load().filter(p=>p.id!=='default'&&p.id!==id)));
  localStorage.setItem(activeKey,'default');
 }catch(e){alert('削除できませんでした。');return}
 window.location.reload();
}
function mount(){
 const target=document.querySelector('.side')||document.querySelector('.hero')||document.querySelector('main');
 if(!target)return;
 const box=document.createElement('section');box.className='profile-manager';box.setAttribute('aria-label','学習プロフィール');
 const heading=document.createElement('label');heading.htmlFor='learning-profile';heading.textContent='学習プロフィール';
 const select=document.createElement('select');select.id='learning-profile';select.setAttribute('aria-label','学習プロフィールを切り替える');
 for(const p of load()){const option=document.createElement('option');option.value=p.id;option.textContent=p.name;select.append(option)}
 select.value=activeId();select.addEventListener('change',e=>change(e.target.value));
 const controls=document.createElement('div');controls.className='profile-actions';
 const add=document.createElement('button');add.type='button';add.textContent='＋ 追加';add.onclick=create;
 const del=document.createElement('button');del.type='button';del.textContent='削除';del.disabled=activeId()==='default';del.onclick=remove;
 controls.append(add,del);
 const hint=document.createElement('p');hint.className='profile-hint';hint.textContent='このブラウザ内だけの保存です。ログイン・端末間同期・パスワード保護はありません。';
 box.append(heading,select,controls,hint);
 if(target.classList.contains('side'))target.insertBefore(box,target.firstChild);
 else target.append(box);
}
window.TeachingProfiles={activeId,scopedKey:keyFor,list:load,mount};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
