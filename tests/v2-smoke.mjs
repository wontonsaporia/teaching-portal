import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { Script, runInNewContext } from 'node:vm';
import { resolve } from 'node:path';

const root=resolve(import.meta.dirname,'..');
const read=(p)=>readFileSync(resolve(root,p),'utf8');
const jsFiles=[
 'assets/app-shell.js','assets/guest-session.js','assets/home-mode.js','assets/materials.js',
 'assets/portal.js','assets/profile-backup.js','assets/profiles.js','assets/secure-vault.js',
 'assets/start.js','assets/study-mode.js','materials/care/national-medical-bank.js',
 'materials/care/national-medical-quiz.js','materials/care/practice.js'
];
for(const path of jsFiles){
 new Script(read(path),{filename:path});
}
console.log('PASS: all v2 JavaScript parses');

const scope={window:{}};
runInNewContext(read('assets/materials.js'),scope);
const visible=scope.window.TEACHING_MATERIALS.filter(m=>!m.hidden);
assert.equal(new Set(visible.map(m=>m.id)).size,visible.length);
for(const m of visible){assert.ok(m.title&&m.subject&&m.path);if(!m.external)assert.ok(existsSync(resolve(root,m.path)),m.path)}
assert.ok(visible.some(m=>m.id==='care-national-medical-36-38'));
console.log('PASS: material catalog and local routes');

const questionScope={window:{}};
runInNewContext(read('materials/care/national-medical-bank.js'),questionScope);
const bank=questionScope.window.NATIONAL_MEDICAL_BANK;
assert.equal(bank.questions.length,15);
assert.deepEqual(Array.from(bank.sets.map(s=>s.round)),[38,37,36]);
const expected={38:[1,5,3,2,4],37:[1,4,4,1,3],36:[5,4,1,2,3]};
for(const set of bank.sets){
 assert.deepEqual(Array.from(set.answers),expected[set.round]);
 assert.equal(set.questions.length,5);
 assert.ok(set.pdf.startsWith('https://www.sssc.or.jp/'));
 assert.ok(set.answerSource.startsWith('https://www.sssc.or.jp/'));
}
assert.equal(new Set(bank.questions.map(q=>q.id)).size,15);
for(const q of bank.questions){
 assert.ok(q.source.startsWith('https://www.sssc.or.jp/'));
 if(q.round===38){
  assert.ok(q.stem?.length>20,'Missing question text: '+q.id);
  assert.equal(q.options?.length,5);
  assert.ok(q.options.every(s=>typeof s==='string'&&s.length>10));
 }
}
console.log('PASS: 15 official question indexes, keys and round 38 text');

const shell=read('assets/app-shell.js'),guest=read('assets/guest-session.js'),backup=read('assets/profile-backup.js');
for(const path of visible.map(m=>m.path).filter(p=>!p.startsWith('http')))assert.ok(shell.includes("'"+path.split('?')[0]+"'"),'Missing shell route: '+path);
assert.ok(guest.includes('care-national-medical-2024-2026-v1'));
assert.ok(backup.includes('validateNationalMedical'));
assert.ok(backup.includes('care-national-medical-2024-2026-v1'));
assert.ok(read('assets/home-mode.js').includes("base:'care-2018-drill-v2'"));
assert.ok(!read('assets/home-mode.js').includes("base:'care-2018-exam-v2'"));
console.log('PASS: isolated guest/profile storage, backup and resume protection');

for(const page of ['app.html','index.html','home.html','library.html','materials/care/national-medical-quiz.html']){
 const html=read(page);
 for(const match of html.matchAll(/<script\s+src="([^"]+)"[^>]*><\/script>/g)){
  const target=resolve(root,page.includes('/')?page.slice(0,page.lastIndexOf('/')):'',match[1].split('?')[0]);
  assert.ok(existsSync(target),page+': missing '+match[1]);
 }
}
const page=read('materials/care/national-medical-quiz.html');
for(const id of ['exam-status','question-stem','choice-buttons','pdf-panel','source-link','answer-link']){
 assert.ok(page.includes('id="'+id+'"'),'Missing UI target '+id);
}
console.log('PASS: entry page scripts and exam DOM targets');
console.log('Static smoke checks complete. Browser E2E is required before merging.');
