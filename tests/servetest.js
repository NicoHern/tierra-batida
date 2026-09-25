const {Sim,C}=require("./load-sim.js");
function serve(i, ptsSum, aimMx, key='drive'){
  const s=new Sim({cpu:[i!==0,i!==1],diff:'normal',games:4,seed:3}); s.score.server=i; s.score.pts=[ptsSum,0]; s.setupPoint();
  const box=-s.standSign; let t=0, res=null;
  for (let k=0;k<400;k++){ const inp={mx:aimMx,mz:0,drive:false,lob:false,slice:false};
    if (k===5) inp.drive=true; if (k===72) inp[key]=true;
    const hin=[null,null]; hin[i]=inp; s.events.length=0; s.step(1/120,hin); t+=1/120;
    const bn=s.events.find(e=>e.type==='bounce'); if (bn){ res={x:+bn.x.toFixed(2), z:+bn.z.toFixed(2), box, inBox: bn.x*box>=0 && Math.abs(bn.x)<=C.SW && Math.abs(bn.z)<=C.SL}; break; }
    const f=s.events.find(e=>e.type==='fault'||e.type==='point'); if (f){ res={ev:f.reason}; break; } }
  return res;
}
for (const i of [0,1]) for (const pts of [0,1]) for (const mx of [-1,0,1]) for (const key of ['drive','slice','lob'])
  console.log('J'+(i+1), pts?'ventaja':'iguales', 'stick',mx, key.padEnd(5), JSON.stringify(serve(i,pts,mx,key)));
// ¿Se planta el jugador si pulsa mientras su propia bola va hacia el rival?
const s=new Sim({cpu:[false,true],diff:'normal',games:4,seed:3}); s.phase='rally'; const p=s.players[0]; p.z=12; p.x=0;
Object.assign(s.ball,{x:0,y:1,z:11,vx:0,vy:4,vz:-15,sx:0,g:9.8,kind:'drive',bounces:0,last:0,serve:false,net:false,hitT:0});
for (let k=0;k<60;k++){ const inp={mx:1,mz:0,drive:k===1,lob:false,slice:false}; s.step(1/120,[inp,null]); }
console.log('velocidad lateral con golpe pulsado y la bola alejándose:', p.vx.toFixed(2), 'm/s (antes ~1,8)');
