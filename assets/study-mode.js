/* Unified study storage boundary. Guest: sessionStorage; profile: encrypted vault. */
(()=>{
'use strict';
const guest=window.TeachingGuest;
if(!guest)throw Error('Guest session module missing');
const asGuest=guest.mode()==='guest';
window.TeachingMode={guest:asGuest,profile:!asGuest};
if(asGuest){
 guest.enter();
 window.TeachingVault={
  ready:Promise.resolve(),
  local:guest.local,
  flush:()=>Promise.resolve(),
  isUnlocked:()=>true,
  isGuest:true
 };
}
})();
