import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../assets/guest-session.js',import.meta.url),'utf8');
const guestMap=new Map(),profileMap=new Map();
const store={
 getItem(k){return guestMap.has(k)?guestMap.get(k):null},
 setItem(k,v){guestMap.set(k,String(v))},
 removeItem(k){guestMap.delete(k)}
};
const ctx={window:{sessionStorage:store},sessionStorage:store};
runInNewContext(source,ctx);
const guest=ctx.window.TeachingGuest;
guest.enter();
guest.local.setItem('care-national-medical-2024-2026-v1',JSON.stringify({version:1,answers:{'38-101':2}}));
profileMap.set('teaching-portal-vault-v1::default','CIPHERTEXT');
assert.equal(guest.active(),true);
assert.ok(guest.snapshot()['care-national-medical-2024-2026-v1']);
guest.clear();
assert.equal(guest.snapshot()['care-national-medical-2024-2026-v1'],undefined);
assert.equal(profileMap.get('teaching-portal-vault-v1::default'),'CIPHERTEXT');
assert.throws(()=>guest.local.setItem('teaching-portal-vault-v1::default','oops'));
console.log('PASS guest storage is allowlisted, isolated and clearable');
const shell=readFileSync(new URL('../assets/app-shell.js',import.meta.url),'utf8');
assert.match(shell,/frame.src='about:blank';await wait;\s*guest.clear\(\)/);
const profiles=readFileSync(new URL('../assets/profiles.js',import.meta.url),'utf8');
assert.match(profiles,/saveForProfileAction\(true\)/);
assert.match(profiles,/saveForProfileAction\(\)/);
const backup=readFileSync(new URL('../assets/profile-backup.js',import.meta.url),'utf8');
assert.match(backup,/await vault\.commitEntries\(/);
assert.match(backup,/validateNationalMedical/);
const start=readFileSync(new URL('../index.html',import.meta.url),'utf8');
assert.match(start,/href="library\.html">教材一覧を直接見る/);
console.log('PASS navigation, deletion ordering and backup invariants');
