/* Study pages use parent shell's in-memory unlocked vault when embedded. */
(()=>{
'use strict';
const guest=window.TeachingGuest;
if(!guest)throw Error('Guest session module missing');
let parentShell=null;
try{if(window.parent!==window&&window.parent.TeachingAppShell?.version===1)parentShell=window.parent}catch(e){}
if(parentShell){
 const parentMode=window.parent.TeachingMode;
 const parentVault=window.parent.TeachingVault;
 if(!parentMode||!parentVault)throw Error('App shell not ready');
 window.TeachingMode={...parentMode,insideShell:true};
 window.TeachingVault=parentVault;
 return;
}
const asGuest=guest.mode()==='guest';
window.TeachingMode={guest:asGuest,profile:!asGuest,insideShell:false};
if(asGuest){
 guest.enter();
 window.TeachingVault={ready:Promise.resolve(),local:guest.local,flush:()=>Promise.resolve(),isUnlocked:()=>true,isGuest:true};
}
})();