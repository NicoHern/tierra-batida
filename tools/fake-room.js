// Sala "online" falsa para probar el modo online en local: dos pestañas del mismo navegador
// se ven entre sí por BroadcastChannel. Imita la API window.claude.use("room") de los artefactos.
(function(){
 const ch=new BroadcastChannel('fake-room'); const me='p'+Math.random().toString(36).slice(2,10);
 const peers=new Map(); let pres={}; const listeners=new Set(); let maxSize=0;
 function mk(peer, presence){ return Object.freeze({peer, by:null, isMe: peer===me, sameTab: peer===me, kind:'viewer', guest:false, presence:Object.freeze(Object.assign({},presence)), updatedAt:Date.now()}); }
 peers.set(me, mk(me,{}));
 function notify(joined,left,updated){ const arr=[...peers.values()]; for(const l of listeners) l({peers:arr,joined,left,updated}); }
 ch.onmessage=(ev)=>{ const m=ev.data; if(m.t==='pres'){ const had=peers.has(m.peer); const p=mk(m.peer,m.presence); peers.set(m.peer,p); notify(had?[]:[p],[],had?[p]:[]); if(!had) ch.postMessage({t:'pres',peer:me,presence:pres}); } else if (m.t==='bye'){ const p=peers.get(m.peer); peers.delete(m.peer); if(p) notify([],[p],[]);} };
 let timer=null;
 const room={ presence(patch){ for(const k in patch){ if(patch[k]===null) delete pres[k]; else pres[k]=patch[k]; } peers.set(me,mk(me,pres));
   if(!timer){ timer=setTimeout(()=>{ timer=null; const js=JSON.stringify(pres); maxSize=Math.max(maxSize,js.length); window.__maxPres=maxSize; ch.postMessage({t:'pres',peer:me,presence:JSON.parse(js)}); notify([],[],[peers.get(me)]); },33);} return Promise.resolve(); },
  onPeers(fn){ listeners.add(fn); setTimeout(()=>fn({peers:[...peers.values()],joined:[...peers.values()],left:[],updated:[]}),0); ch.postMessage({t:'pres',peer:me,presence:pres}); return ()=>listeners.delete(fn); },
  peers(){ return [...peers.values()]; }, connected(){return true;} };
 window.claude={ use:(n)=>Promise.resolve(n==='room'?room:null) };
})();
