import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {webcrypto} from 'node:crypto';
import {runInNewContext} from 'node:vm';

const source=readFileSync(new URL('../assets/secure-vault.js',import.meta.url),'utf8');
const envelopeKey='teaching-portal-vault-v1::default';
const memory=new Map();
let failWrites=false;
const storage={
 getItem(k){return memory.has(k)?memory.get(k):null},
 setItem(k,v){if(failWrites&&k===envelopeKey)throw Error('QuotaExceededError');memory.set(k,String(v))},
 removeItem(k){memory.delete(k)}
};
function element(tag){
 return {
  tag,children:[],hidden:false,value:'',style:{},
  append(...children){this.children.push(...children);for(const child of children)if(child&&typeof child==='object')child.parent=this},
  remove(){if(this.parent)this.parent.children=this.parent.children.filter(x=>x!==this)},
  focus(){},setAttribute(name,value){this[name]=value}
 };
}
function find(node,predicate){
 if(predicate(node))return node;
 for(const child of node.children||[]){const match=find(child,predicate);if(match)return match}
 return null;
}
function fresh(){
 const body=element('body'),document={
  body,createElement:element,
  getElementById(id){return find(body,n=>n.id===id)}
 };
 const profiles={
  activeId(){return 'default'},
  scopedKey(key,id){return id==='default'?key:key+'::'+id},
  list(){return [{id:'default',name:'デフォルト'}]}
 };
 const window={crypto:webcrypto,TeachingMode:{guest:false,insideShell:false},TeachingProfiles:profiles};
 runInNewContext(source,{window,document,localStorage:storage,crypto:webcrypto,TextEncoder,TextDecoder,atob,btoa,Uint8Array});
 const form=find(body,n=>n.tag==='form');
 const password=document.getElementById('vault-password');
 const confirmation=document.getElementById('vault-password-confirm');
 assert.ok(form&&password&&confirmation,'Unlock form exists');
 async function submit(pass,check){
  password.value=pass;confirmation.value=check||pass;
  await form.onsubmit({preventDefault(){}});
 }
 return {vault:window.TeachingVault,submit,body,document};
}
const pass='example-password-not-a-secret';
const historic=JSON.stringify({order:[1,2,3],answers:{1:2},savedAt:123});
memory.set('care-2018-drill-v2',historic);
const setup=fresh();
await setup.submit(pass);
await setup.vault.ready;
assert.equal(setup.vault.local.getItem('care-2018-drill-v2'),historic);
assert.equal(memory.has('care-2018-drill-v2'),false,'Plaintext old data removed only after verified encryption');
const persisted=memory.get(envelopeKey);
assert.ok(persisted&&!persisted.includes(historic),'Only ciphertext persists');
console.log('PASS initial migration keeps legacy progress and removes verified plaintext');

setup.vault.local.setItem('care-national-medical-2024-2026-v1',
 JSON.stringify({version:1,answers:{'38-101':2},savedAt:456}));
await setup.vault.flush();
const saved=memory.get(envelopeKey);
const again=fresh();
await again.submit('incorrect-long-password');
assert.equal(again.vault.isUnlocked(),false,'Wrong unlock password rejected');
assert.equal(memory.get(envelopeKey),saved,'Wrong password leaves encrypted data unchanged');
await again.submit(pass);
await again.vault.ready;
assert.equal(again.vault.isUnlocked(),true);
assert.equal(JSON.parse(again.vault.local.getItem('care-national-medical-2024-2026-v1')).answers['38-101'],2);
console.log('PASS wrong unlock password and re-unlock retain answers');

const payload={schema:'teaching-portal-learning-backup',version:1,sections:{
 'care-national-medical-2024-2026-v1':{version:1,answers:{'38-101':4}}
}};
const file=await again.vault.encryptedBackup(payload,'separate-backup-passphrase');
assert.equal((await again.vault.decryptBackup(file,'separate-backup-passphrase')).sections['care-national-medical-2024-2026-v1'].answers['38-101'],4);
await assert.rejects(again.vault.decryptBackup(file,'incorrect-backup-passphrase'));
const tampered={...file,ciphertext:file.ciphertext.slice(0,-8)+'AAAAAAAA'};
await assert.rejects(again.vault.decryptBackup(tampered,'separate-backup-passphrase'));
assert.equal(memory.get(envelopeKey),saved,'Failed backup decryption never modifies existing records');
console.log('PASS encrypted backup roundtrip, wrong password and ciphertext tampering');

const before=again.vault.local.getItem('care-national-medical-2024-2026-v1');
failWrites=true;
await assert.rejects(again.vault.commitEntries([['care-national-medical-2024-2026-v1',
 JSON.stringify({version:1,answers:{'38-101':5}})]]));
failWrites=false;
assert.equal(again.vault.local.getItem('care-national-medical-2024-2026-v1'),before,
 'Failed restore rolls in-memory records back');
assert.equal(memory.get(envelopeKey),saved,'Failed restore retains prior encrypted storage');
await again.vault.commitEntries([['care-national-medical-2024-2026-v1',before]]);
await again.vault.flush();
console.log('PASS rejected write rolls back state and allows subsequent save');
