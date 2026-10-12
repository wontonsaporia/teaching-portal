/* Teaching Portal encrypted local vault v1 (Web Crypto, no server). */
(()=>{
'use strict';
if(window.TeachingMode?.guest||window.TeachingMode?.insideShell)return;
const profiles=window.TeachingProfiles;
if(!profiles)throw Error('Profile system must load first');
const id=profiles.activeId();
const dbKey='teaching-portal-vault-v1::'+id;
const ITERATIONS=600000;
const MAX_BACKUP_BYTES=3_000_000;
const encoder=new TextEncoder(),decoder=new TextDecoder();
const u8=x=>new Uint8Array(x);
function b64(x){let out='';const v=u8(x);for(let i=0;i<v.length;i+=8192)out+=String.fromCharCode(...v.subarray(i,i+8192));return btoa(out)}
function from64(s){if(typeof s!=='string'||s.length>6000000||!/^[-A-Za-z0-9+/]*={0,2}$/.test(s))throw Error('Invalid base64');return Uint8Array.from(atob(s),c=>c.charCodeAt(0))}
const random=n=>crypto.getRandomValues(new Uint8Array(n));
const aad=name=>encoder.encode('teaching-portal:'+name+':v1');
async function derive(password,salt,iterations){
 if(typeof password!=='string'||password.length<1||password.length>1024)throw Error('Invalid password');
 if(!(salt instanceof Uint8Array)||salt.length!==16||iterations<310000||iterations>1200000)throw Error('Unsupported cipher parameters');
 const raw=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveKey']);
 return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations,hash:'SHA-256'},raw,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);
}
async function seal(payload,key,scope){
 const iv=random(12);
 const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(scope),tagLength:128},key,encoder.encode(JSON.stringify(payload)));
 return {iv:b64(iv),ciphertext:b64(encrypted)};
}
async function unseal(packet,key,scope){
 const iv=from64(packet.iv),ciphertext=from64(packet.ciphertext);
 if(iv.length!==12||ciphertext.length<16||ciphertext.length>MAX_BACKUP_BYTES)throw Error('Invalid encrypted content');
 const bytes=await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:aad(scope),tagLength:128},key,ciphertext);
 return JSON.parse(decoder.decode(bytes));
}
function envelopeOK(p){
 return p&&p.schema==='teaching-portal-vault'&&p.version===1&&p.kdf==='PBKDF2-SHA256'&&p.cipher==='AES-256-GCM'&&
 p.iterations>=310000&&p.iterations<=1200000&&p.salt&&p.iv&&p.ciphertext;
}
function validData(value){
 return !!value&&typeof value==='object'&&!Array.isArray(value)&&Object.entries(value).every(([k,v])=>
 typeof k==='string'&&k.length<160&&typeof v==='string'&&v.length<=1000000);
}
const unitIds=['human','healthcare','safety','infection','observation','suction-general','suction-practice','feeding-general','feeding-practice'];
const legacyBases=['care-2018-drill-v2','care-2018-exam-v2','care-quiz-history-v1',...unitIds.map(u=>'care-2018-drill-v2--'+u),'teaching-portal-care-suction-2018-v1'];
const legacyKeys=()=>legacyBases.map(k=>profiles.scopedKey(k,id)).filter(k=>localStorage.getItem(k)!==null);
const displayName=()=>profiles.list().find(p=>p.id===id)?.name||'デフォルト';
let unlocked=false,key=null,salt=null,iterations=ITERATIONS,state=Object.create(null),queue=Promise.resolve(),writes=0,error=null;
let resolveReady,rejectReady;
const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
const local={
 getItem(k){if(!unlocked)throw Error('Vault is locked');return Object.hasOwn(state,k)?state[k]:null},
 setItem(k,v){if(!unlocked)throw Error('Vault is locked');state[k]=String(v);schedule()},
 removeItem(k){if(!unlocked)throw Error('Vault is locked');delete state[k];schedule()}
};
function status(message,isError=false){
 const node=document.getElementById('vault-save-status');
 if(node){node.textContent=message;node.style.color=isError?'#9f382b':'#597465'}
}
async function persist(snapshot){
 const packet=await seal(snapshot,key,'profile:'+id);
 const env={schema:'teaching-portal-vault',version:1,kdf:'PBKDF2-SHA256',cipher:'AES-256-GCM',
  iterations,salt:b64(salt),...packet};
 const text=JSON.stringify(env);
 localStorage.setItem(dbKey,text);
}
function schedule(){
 const snapshot={...state};++writes;status('暗号化して保存中…');
 queue=queue.catch(()=>{}).then(()=>persist(snapshot)).then(()=>{writes--;error=null;if(writes<=0){writes=0;status('暗号化して保存済み')}}).catch(e=>{
  writes=Math.max(0,writes-1);error=e;status('保存できませんでした。空き容量を確認してください。',true);throw e;
 });
 queue.catch(()=>{});
 return queue;
}
function flush(){return queue.then(()=>{if(error)throw error})}
async function commitEntries(entries){
 if(!unlocked)throw Error('Vault is locked');
 const before={...state};for(const [k,v] of entries)state[k]=v;
 try{await schedule()}catch(e){state=Object.assign(Object.create(null),before);throw e}
}
async function encryptedBackup(payload,pass){
 const bsalt=random(16),backupKey=await derive(pass,bsalt,ITERATIONS);
 const packet=await seal(payload,backupKey,'backup');
 return {schema:'teaching-portal-encrypted-backup',version:2,kdf:'PBKDF2-SHA256',cipher:'AES-256-GCM',iterations:ITERATIONS,salt:b64(bsalt),...packet};
}
async function decryptBackup(p,pass){
 if(!p||p.schema!=='teaching-portal-encrypted-backup'||p.version!==2||p.kdf!=='PBKDF2-SHA256'||p.cipher!=='AES-256-GCM')throw Error('Unsupported backup');
 const bsalt=from64(p.salt),backupKey=await derive(pass,bsalt,p.iterations);
 return unseal(p,backupKey,'backup');
}
const api={id,ready,local,flush,commitEntries,encryptedBackup,decryptBackup,isUnlocked:()=>unlocked,legacyKeys,version:1};
window.TeachingVault=api;
async function start(){
 const root=document.createElement('div');root.id='vault-lock';root.className='vault-lock';
 const panel=document.createElement('section');panel.className='vault-panel';
 const heading=document.createElement('h2');heading.textContent='学習プロフィールの保護';
 const intro=document.createElement('p');intro.className='vault-description';
 const name=document.createElement('p');name.className='vault-profile-name';name.textContent=displayName();
 const form=document.createElement('form');
 const passlabel=document.createElement('label');passlabel.htmlFor='vault-password';passlabel.textContent='パスワード';
 const pass=document.createElement('input');pass.id='vault-password';pass.type='password';pass.required=true;pass.autocomplete='current-password';pass.minLength=10;
 const confirmLabel=document.createElement('label');confirmLabel.htmlFor='vault-password-confirm';confirmLabel.textContent='パスワード（確認）';
 const second=document.createElement('input');second.id='vault-password-confirm';second.type='password';second.autocomplete='new-password';second.minLength=10;
 const action=document.createElement('button');action.type='submit';
 const warning=document.createElement('p');warning.className='vault-warning';warning.setAttribute('role','alert');
 const note=document.createElement('p');note.className='vault-description';
 const switcher=document.createElement('button');switcher.type='button';switcher.className='vault-switch';switcher.textContent='別のプロフィールに切り替える';
 const newProfile=document.createElement('button');newProfile.type='button';newProfile.className='vault-switch';newProfile.textContent='＋ 新しいプロフィールを作成';newProfile.onclick=()=>profiles.create();
 const existing=localStorage.getItem(dbKey);
 const legacy=legacyKeys();
 const setup=!existing;
 intro.textContent=setup?(legacy.length?'既存の学習履歴を暗号化します。パスワードを設定してください。':'このプロフィールを暗号化して使い始めます。パスワードを設定してください。'):'学習データは暗号化されています。パスワードを入力して解錠してください。';
 if(setup){
  pass.autocomplete='new-password';second.required=true;
  note.textContent='10文字以上を推奨します。忘れると暗号化された記録を復旧できません。パスワードは送信・保存しません。';
  action.textContent=legacy.length?'履歴を暗号化して開始':'パスワードを設定して開始';
 }else{
  confirmLabel.hidden=true;second.hidden=true;action.textContent='解錠する';
  note.textContent='パスワードは端末やサーバーへ送信されません。忘れた場合、暗号化済みのデータは復旧できません。';
 }
 form.append(passlabel,pass,confirmLabel,second,action,warning);
 panel.append(heading,name,intro,form,note,switcher,newProfile);root.append(panel);
 const attach=()=>{document.body.append(root);pass.focus()};
 if(document.body)attach();else await new Promise(ok=>document.addEventListener('DOMContentLoaded',()=>{attach();ok()},{once:true}));
 const profileChoose=()=>{
  const picker=document.createElement('select');picker.className='vault-picker';
  for(const p of profiles.list()){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;picker.append(o)}
  picker.value=id;const proceed=document.createElement('button');proceed.type='button';proceed.textContent='切り替え';proceed.onclick=()=>{
   if(picker.value===id)return;
   localStorage.setItem('teaching-portal-active-profile-v1',picker.value);window.location.reload()
  };switcher.replaceWith(picker,proceed);
 };
 switcher.onclick=profileChoose;
 form.onsubmit=async e=>{
  e.preventDefault();warning.textContent='';
  const password=pass.value;
  if(password.length<10){warning.textContent='10文字以上のパスワードを設定・入力してください。';return}
  if(setup&&password!==second.value){warning.textContent='確認用のパスワードが一致しません。';return}
  action.disabled=true;action.textContent='暗号化処理中…';
  try{
   if(setup){
    salt=random(16);iterations=ITERATIONS;key=await derive(password,salt,iterations);
    const imported=Object.create(null);
    for(const k of legacy)imported[k]=localStorage.getItem(k);
    // Persist and read back before removing any legacy plaintext.
    await persist(imported);
    const written=JSON.parse(localStorage.getItem(dbKey));
    const check=await unseal(written,key,'profile:'+id);
    if(!validData(check)||legacy.some(k=>check[k]!==imported[k]))throw Error('Migration verification failed');
    state=Object.assign(Object.create(null),check);
    for(const k of legacy)localStorage.removeItem(k);
   }else{
    const env=JSON.parse(existing);
    if(!envelopeOK(env))throw Error('Invalid vault format');
    salt=from64(env.salt);iterations=env.iterations;key=await derive(password,salt,iterations);
    const data=await unseal(env,key,'profile:'+id);
    if(!validData(data))throw Error('Invalid vault data');
    state=Object.assign(Object.create(null),data);
    // If a previous migration was interrupted after verified write, remove identical cleartext copies only.
    for(const k of legacyKeys())if(state[k]===localStorage.getItem(k))localStorage.removeItem(k);
   }
   unlocked=true;pass.value='';second.value='';
   root.remove();status('暗号化して保存済み');resolveReady();
  }catch(err){
   warning.textContent=setup?'暗号化・移行に失敗しました。元のデータは保持しています。':'パスワードが違うか、データを解読できません。';
   key=null;salt=null;pass.value='';second.value='';
  }finally{action.disabled=false;action.textContent=setup?'パスワードを設定して開始':'解錠する'}
 };
}
if(!window.crypto?.subtle){
 const banner=document.createElement('p');banner.textContent='このブラウザでは暗号化を利用できません。HTTPS対応のブラウザで開いてください。';
 const show=()=>document.body.prepend(banner);if(document.body)show();else document.addEventListener('DOMContentLoaded',show,{once:true});
 rejectReady(new Error('Web Crypto not available'));return;
}
start().catch(rejectReady);
})();
