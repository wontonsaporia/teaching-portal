/* Persistent same-origin shell. The unlocked CryptoKey stays in the parent window.
 * No passphrase, CryptoKey, or plaintext progress is written to sessionStorage.
 */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const frame=$('learning-view'),status=$('app-status'),guest=window.TeachingGuest,vault=window.TeachingVault;
const paths=new Set(['home.html','materials/care/suction-2018-quiz.html','materials/care/suction-2018-test.html','materials/care/dashboard.html','materials/care/regulations.html','materials/care/disclaimer.html','materials/math/word-chunks.html','materials/math/integer-equations.html']);
const base=new URL('.',window.location.href);
let locked=false,transitioning=false;
window.TeachingAppShell={version:1};
function relativePath(raw){
 try{
  const u=new URL(raw,base);
  if(u.origin!==base.origin||u.username||u.password||u.searchParams.has('external'))return null;
  const prefix=base.pathname;
  if(!u.pathname.startsWith(prefix))return null;
  const path=u.pathname.slice(prefix.length);
  return paths.has(path)?path+u.search+u.hash:null;
 }catch(e){return null}
}
function currentPath(){try{const u=new URL(frame.contentWindow.location.href);return u.pathname.slice(base.pathname.length)}catch(e){return ''}}
function mark(path){document.querySelectorAll('.app-nav [data-page]').forEach(b=>{const selected=b.dataset.page===path;b.classList.toggle('current',selected);if(selected)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')})}
function go(path,history=true){
 if(locked||transitioning)return;
 const resolved=relativePath(path);
 if(!resolved){status.textContent='このリンクは学習スペース内で開けません。';return}
 const bare=resolved.split(/[?#]/)[0];
 transitioning=true;
 const navigate=async()=>{
  try{
   await saveChild();
   await vault.flush();
   if(history)window.history.pushState({page:resolved},'',new URL('app.html?page='+encodeURIComponent(resolved),base));
   frame.src=new URL(resolved,base).href;
   mark(bare);
   status.textContent='';
  }catch(e){status.textContent='保存に失敗しました。画面を移動せず、保存状態を確認してください。';mark(currentPath())}
  finally{transitioning=false}
 };
 void navigate();
}
frame.addEventListener('load',()=>{
 try{
  const doc=frame.contentDocument;
  if(!doc)return;
  const path=currentPath();
  mark(path);
  if(!paths.has(path)){
   frame.hidden=true;
   status.textContent='許可されていないページへの移動を検出しました。安全のため表示を停止しました。';
   return;
  }
  frame.hidden=false;
  doc.addEventListener('click',event=>{
   if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   const anchor=event.target.closest?.('a[href]');
   if(!anchor||anchor.download||anchor.target==='_blank')return;
   const u=new URL(anchor.getAttribute('href'),doc.baseURI);
   const resolved=relativePath(u.href);
   if(resolved){event.preventDefault();go(resolved)}
   else if(u.origin===base.origin&&u.pathname===new URL('index.html',base).pathname){event.preventDefault();go('home.html')}
   else if(u.origin===base.origin&&u.pathname.startsWith(base.pathname)){
    event.preventDefault();status.textContent='このページは学習スペース外で開いてください。';
   }
  },true);
 }catch(e){status.textContent='教材画面の連携に失敗しました。開発者ツールを確認してください。'}
});
document.querySelectorAll('.app-nav [data-page]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.page)));
$('app-home-logo').addEventListener('click',event=>{
 if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
 event.preventDefault();
 go('home.html');
});
async function saveChild(){
 try{
  const child=frame.contentWindow;
  if(child&&child!==window&&typeof child.TeachingSaveProgress==='function')await child.TeachingSaveProgress();
 }catch(e){throw e}
}
function updateSaveStatus(){
 const node=$('app-save-state');
 if(!node)return;
 node.textContent=window.TeachingMode.guest?'タブ内に一時保存':'暗号化して保存';
}
async function leave(){
 if(locked||transitioning)return;
 locked=true;$('app-lock').disabled=true;status.textContent='学習記録を保存しています…';
 try{
  await saveChild();
  await vault.flush();
  guest.exit();
  window.location.assign('index.html')
 }
 catch(e){locked=false;$('app-lock').disabled=false;status.textContent='保存が完了していません。ページを閉じず、保存状態を確認してください。'}
}
$('app-lock').addEventListener('click',leave);
$('app-start-link').addEventListener('click',e=>{e.preventDefault();leave()});
window.addEventListener('popstate',()=>{const requested=new URLSearchParams(location.search).get('page');go(relativePath(requested||'home.html')||'home.html',false)});
(async()=>{
 try{
  await vault.ready;
  if(!guest.mode)throw Error('Session mode unavailable');
  const isGuest=window.TeachingMode.guest;
  $('app-lock').textContent=isGuest?'ゲスト利用を終了':'ログアウト';
  $('app-mode-label').textContent=isGuest?'ゲスト利用中（タブ内一時保存）':'学習プロフィール：'+(window.TeachingProfiles.list().find(p=>p.id===window.TeachingProfiles.activeId())?.name||'ローカル');
  $('app-lock').disabled=false;
  if(isGuest){$('app-settings').hidden=true}else $('app-settings').hidden=false;
  frame.hidden=false;
  updateSaveStatus();
  const requested=new URLSearchParams(location.search).get('page');
  go(relativePath(requested||'home.html')||'home.html',false);
 }catch(e){status.textContent='学習データを開けませんでした。タブを再読み込みしてください。'}
})();
})();