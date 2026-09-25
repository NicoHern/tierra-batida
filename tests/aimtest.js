const {Sim,C}=require("./load-sim.js");
// Prepara una bola que viene del rival hacia el jugador i y simula con una entrada programada
function run(i, script, opts={}){
  const s=new Sim({cpu:[i!==0, i!==1], diff:'normal', games:4, seed:7});
  const me=s.players[i], sd=i===0?1:-1;
  s.phase='rally'; me.x=opts.px??0; me.z=sd*12.3; me.vx=me.vz=0;
  const b=s.ball; Object.assign(b,{x:opts.bx??0, y:1.0, z:-sd*12, vx:0,vy:0,vz:0, sx:0, g:9.8, kind:'drive', bounces:0, last:1-i, serve:false, net:false, hitT:0});
  if (opts.lob){ const dz=sd*10-b.z, vy=Math.sqrt(2*9.8*7), T=(vy+Math.sqrt(vy*vy+2*9.8))/9.8; b.vx=0; b.vz=dz/T; b.vy=vy; b.kind='lob'; }
  else s.solveFlat(opts.tx??0, sd*9, 18, 9.8*1.3, 0.4);
  let hit=null, t=0;
  for (let k=0;k<600;k++){
    const inp={mx:0,mz:0,drive:false,lob:false,slice:false};
    script(t, inp); const hin=[null,null]; hin[i]=inp;
    s.events.length=0; s.step(1/120, hin); t+=1/120;
    const h=s.events.find(e=>e.type==='hit' && e.i===i);
    if (h){ const bs=s.bounceSpot(); hit={shot:h.shot, x:bs?+bs.x.toFixed(2):null, z:bs?+bs.z.toFixed(2):null}; break; }
  }
  return hit;
}
const press=(at, key='drive')=>(t,inp)=>{ if (Math.abs(t-at)<0.004) inp[key]=true; };
const both=(...fs)=>(t,inp)=>fs.forEach(f=>f(t,inp));
const hold=(from,to,mx,mz)=>(t,inp)=>{ if (t>=from && t<=to){ inp.mx=mx; inp.mz=mz; } };
for (const i of [0,1]){
  const up = i===0 ? -1 : 1;     // "hacia la red" en pantalla para cada jugador (J2 juega de cara a la cámara)
  console.log("== jugador", i);
  console.log("neutral            ", JSON.stringify(run(i, press(0.3))));
  console.log("derecha tras pulsar", JSON.stringify(run(i, both(press(0.3), hold(0.4,9,1,0)))));
  console.log("izquierda tras pulsar", JSON.stringify(run(i, both(press(0.3), hold(0.4,9,-1,0)))));
  console.log("corre dcha y sigue", JSON.stringify(run(i, both(hold(0,9,1,0), press(0.5)), {px:-2.5, bx:0})));
  console.log("atrás tras pulsar  ", JSON.stringify(run(i, both(press(0.3), hold(0.4,9,0,-up)))));
  console.log("corre atrás y sigue", JSON.stringify(run(i, both(hold(0,9,0,-up), press(0.3)))));
  console.log("globo, corre atrás ", JSON.stringify(run(i, both(hold(0,9,0,-up), press(0.3)), {lob:true})));
}
for (const i of [0,1]){
  const up = i===0 ? -1 : 1;
  console.log("== extra jugador", i);
  console.log("parado, atrás+golpe  ", JSON.stringify(run(i, both(hold(0.2,9,0,-up), press(0.3)))));
  console.log("corre dcha→cambia izq", JSON.stringify(run(i, both(hold(0,0.55,1,0), press(0.5), hold(0.6,9,-1,0)), {px:-2.5})));
  console.log("adelante (profundo)  ", JSON.stringify(run(i, both(press(0.3), hold(0.4,9,0,up)))));
  console.log("diagonal dcha+adelante", JSON.stringify(run(i, both(press(0.3), hold(0.4,9,1,up)))));
}
