import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {TextEncoder,TextDecoder} from 'node:util';

const code=readFileSync(new URL('../assets/secure-vault.js',import.meta.url),'utf8');
function browser(initial={}, failWrites=false){
 const values=new Map(Object.entries(initial));
 const storage={
  getItem:k=>values.has(k)?values.get(k):null,
  setItem(k,v){if(failWrites)throw new Error('QuotaExceededError');values.set(k,String(v))},
  removeItem:k=>values.delete(k),
  key:n=>Array.from(values.keys())[n]??null,
  get length(){return values.size}
 };
 const nodes=[];
 function element(tag){
  return {tag,children:[],style:{},value:'',hidden:false,disabled:false,
    textContent:'',append(...items){this.children.push(...items)},
    remove(){this.removed=true},focus(){},setAttribute(){},
    addEventListener(){},replaceWith(){}};
 }
 const doc={body:{append(n){nodes.push(n)},prepend(n){nodes.push(n)}},createElement:element,
  getElementById:()=>null,addEventListener(){}};
 const profiles={activeId:()=> 'default',scopedKey:k=>k,
  list:()=>[{id:'default',name:'デフォルト'}],create:()=>{}};
 const win={TeachingMode:{guest:false,insideShell:false},TeachingProfiles:profiles,crypto:webcrypto};
 const ctx={window:win,localStorage:storage,document:doc,crypto:webcrypto,
  TextEncoder,TextDecoder,Uint8Array,Promise,JSON,Object,Array,Error,String,Number,
  btoa,atob};
 runInNewContext(code,ctx);
 function unlock(password,setup=true){
  const lock=nodes.find(n=>n.id==='vault-lock');
  assert.ok(lock,'Vault lock must be shown');
  const panel=lock.children[0];
  const form=panel.children.find(n=>n.tag==='form');
  const pass=form.children.find(n=>n.id==='vault-password');
  const second=form.children.find(n=>n.id==='vault-password-confirm');
  pass.value=password;if(setup)second.value=password;
  return form.onsubmit({preventDefault(){}});
 }
 return {values,win,unlock};
}
const secret='valid-password-2026';
const raw='care-2018-drill-v2';
const client=browser({[raw]:JSON.stringify({order:[1],answers:{1:2}})});
await client.unlock(secret,true);
await client.win.TeachingVault.ready;
assert.equal(client.values.has(raw),false,'Legacy plaintext must be removed only after encrypt/readback');
assert.ok(client.values.has('teaching-portal-vault-v1::default'));
assert.equal(client.win.TeachingVault.local.getItem(raw),JSON.stringify({order:[1],answers:{1:2}}));
const backup=await client.win.TeachingVault.encryptedBackup({a:1},'backup-password-2026');
const recovered=await client.win.TeachingVault.decryptBackup(backup,'backup-password-2026');
assert.equal(recovered.a,1);
await assert.rejects(()=>client.win.TeachingVault.decryptBackup(backup,'wrong-password-2026'));
const forged={...backup,ciphertext:backup.ciphertext.slice(0,-4)+'AAAA'};
await assert.rejects(()=>client.win.TeachingVault.decryptBackup(forged,'backup-password-2026'));
const current=client.win.TeachingVault.local.getItem(raw);
assert.equal(current,JSON.stringify({order:[1],answers:{1:2}}),'Bad backup must not mutate records');
console.log('PASS: migration, encrypted backup, wrong password, tamper detection');

const corrupted=JSON.parse(client.values.get('teaching-portal-vault-v1::default'));
corrupted.ciphertext=corrupted.ciphertext.slice(0,-4)+'AAAA';
const fresh=browser({'teaching-portal-vault-v1::default':JSON.stringify(corrupted)});
await fresh.unlock(secret,false);
assert.equal(fresh.win.TeachingVault.isUnlocked(),false,'Corrupt vault must refuse unlocking');
console.log('PASS: corrupt encrypted vault is rejected');
