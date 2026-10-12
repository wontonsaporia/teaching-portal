/* Teaching Portal v2 guest storage draft.
 * Explicitly opt-in: this file does not change legacy encrypted profiles.
 * sessionStorage survives reload and same-tab navigation, but browser session restore
 * may recover it. Data is not encrypted and should not include identifying details.
 */
(function(root){
'use strict';
const PREFIX='teaching-portal-guest-v2:';
const MODE_KEY=PREFIX+'mode';
const ALLOWED=['care-national-medical-2024-2026-v1','care-2018-drill-v2','care-2018-exam-v2','care-quiz-history-v1',
 ...['human','healthcare','safety','infection','observation','suction-general','suction-practice','feeding-general','feeding-practice']
 .map(id=>'care-2018-drill-v2--'+id)];
function store(){if(!root.sessionStorage)throw Error('Session storage unavailable');return root.sessionStorage}
function enter(){store().setItem(MODE_KEY,'guest')}
function enterProfile(){store().setItem(MODE_KEY,'profile')}
function mode(){try{return store().getItem(MODE_KEY)||'guest'}catch(e){return 'guest'}}
function active(){try{return store().getItem(MODE_KEY)==='guest'}catch(e){return false}}
function storageKey(base){if(!ALLOWED.includes(base))throw Error('Unknown guest data key');return PREFIX+'data:'+base}
const local={
 getItem(base){return store().getItem(storageKey(base))},
 setItem(base,value){store().setItem(storageKey(base),String(value))},
 removeItem(base){store().removeItem(storageKey(base))}
};
function snapshot(){
 const values={};
 for(const base of ALLOWED){const value=local.getItem(base);if(value!==null)values[base]=value}
 return values;
}
function clear(){
 const storage=store();
 for(const base of ALLOWED)storage.removeItem(storageKey(base));
 storage.removeItem(MODE_KEY);
}
function exit(){store().removeItem(MODE_KEY)}
root.TeachingGuest={enter,enterProfile,mode,active,storageKey,local,snapshot,clear,exit,allowedKeys:[...ALLOWED]};
})(window);
