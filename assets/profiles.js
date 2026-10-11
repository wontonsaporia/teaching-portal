/* Device-local learner profiles. Names are public metadata; progress is in a separate encrypted vault. */
(()=>{
'use strict';
const catalogKey='teaching-portal-profiles-v1';
const activeKey='teaching-portal-active-profile-v1';
const defaultNameKey='teaching-portal-default-name-v1';
const validId=id=>typeof id==='string'&&/^[a-z0-9-]{6,80}$/.test(id);
function list(){
 let items=[];
 try{const parsed=JSON.parse(localStorage.getItem(catalogKey)||'[]');if(Array.isArray(parsed))items=parsed.filter(p=>p&&validId(p.id)&&p.id!=='default'&&typeof p.name==='string'&&p.name.trim()&&p.name.length<=24)}catch(e){}
 let name='デフォルト';try{const saved=localStorage.getItem(defaultNameKey);if(saved&&saved.trim()&&saved.length<=24)name=saved}catch(e){}
 return [{id:'default',name},...items];
}
function activeId(){try{const id=localStorage.getItem(activeKey)||'default';return list().some(p=>p.id===id)?id:'default'}catch(e){return 'default'}}
function scopedKey(base,id){return id==='default'?base:base+'::'+id}
function safeName(value){if(value===null)return null;const v=String(value).trim();return v&&v.length<=24?v:null}
function create(){
 const value=prompt('新しいプロフィール名（1～24文字）');
 if(value===null)return false;
 const name=safeName(value);if(!name){alert('1～24文字の名前を入力してください。');return false}
 const items=list();if(items.length>=11){alert('プロフィールは最大11件です。');return false}
 if(items.some(p=>p.name===name)){alert('同じ名前のプロフィールがあります。');return false}
 const id='p-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10);
 try{
  localStorage.setItem(catalogKey,JSON.stringify([...items.filter(p=>p.id!=='default'),{id,name}]));
  localStorage.setItem(activeKey,id);
  window.location.reload();return true;
 }catch(e){alert('プロフィールを保存できませんでした。');return false}
}
function rename(){
 const id=activeId(),items=list(),now=items.find(p=>p.id===id);
 const input=prompt('プロフィール名を変更（1～24文字）',now?.name||'');
 if(input===null)return false;
 const name=safeName(input);
 if(!name){alert('1～24文字の名前を入力してください。');return false}
 if(items.some(p=>p.id!==id&&p.name===name)){alert('同じ名前のプロフィールがあります。');return false}
 try{
  if(id==='default')localStorage.setItem(defaultNameKey,name);
  else localStorage.setItem(catalogKey,JSON.stringify(items.filter(p=>p.id!=='default').map(p=>p.id===id?{...p,name}:p)));
  window.location.reload();return true;
 }catch(e){alert('名前を保存できませんでした。');return false}
}
async function change(id){
 if(!list().some(p=>p.id===id)||id===activeId())return;
 try{
  if(window.TeachingVault?.isUnlocked()){
   await window.TeachingVault.flush();
  }
  localStorage.setItem(activeKey,id);window.location.reload();
 }catch(e){alert('暗号化データの保存が完了していません。保存状態を確認してから切り替えてください。')}
}
async function remove(){
 const id=activeId();if(id==='default'){alert('デフォルトのプロフィールは削除できません。名前の変更は可能です。');return}
 const name=list().find(p=>p.id===id)?.name||'このプロフィール';
 if(!window.TeachingVault?.isUnlocked()){alert('削除するプロフィールを先に解錠してください。');return}
 if(!confirm('「'+name+'」と暗号化された学習履歴を、この端末から削除しますか？元に戻せません。先にバックアップしてください。'))return;
 try{
  await window.TeachingVault.flush();
  const toRemove=[];
  for(let i=0;i<localStorage.length;i++){
   const k=localStorage.key(i);
   if(k&&(k.endsWith('::'+id)||k==='teaching-portal-vault-v1::'+id))toRemove.push(k);
  }
  toRemove.forEach(k=>localStorage.removeItem(k));
  localStorage.setItem(catalogKey,JSON.stringify(list().filter(p=>p.id!=='default'&&p.id!==id)));
  localStorage.setItem(activeKey,'default');
  window.location.reload();
 }catch(e){alert('削除できませんでした。')}
}
function mount(){
 if(window.TeachingMode?.guest||window.TeachingMode?.insideShell||document.body?.dataset.profileUi==='hidden')return;
 const target=document.querySelector('.side')||document.querySelector('.profile-slot')||document.querySelector('.hero')||document.querySelector('main');
 if(!target)return;
 const box=document.createElement('section');box.className='profile-manager';box.setAttribute('aria-label','学習プロフィール');
 const heading=document.createElement('label');heading.htmlFor='learning-profile';heading.textContent='学習プロフィール';
 const select=document.createElement('select');select.id='learning-profile';select.setAttribute('aria-label','学習プロフィールを選ぶ');
 for(const p of list()){const op=document.createElement('option');op.value=p.id;op.textContent=p.name;select.append(op)}
 select.value=activeId();select.onchange=()=>change(select.value);
 const controls=document.createElement('div');controls.className='profile-actions';
 const add=document.createElement('button');add.type='button';add.textContent='＋ 追加';add.onclick=create;
 const edit=document.createElement('button');edit.type='button';edit.textContent='名前を変更';edit.onclick=rename;
 const del=document.createElement('button');del.type='button';del.textContent='削除';del.disabled=activeId()==='default';del.onclick=remove;
 controls.append(add,edit,del);
 const hint=document.createElement('p');hint.className='profile-hint';hint.textContent='この端末だけに保存。プロフィール名は暗号化されず、解答履歴はパスワードで暗号化されます。';
 box.append(heading,select,controls,hint);target.insertBefore(box,target.firstChild);
}
window.TeachingProfiles={activeId,scopedKey,list,mount,create,rename,change,remove};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();