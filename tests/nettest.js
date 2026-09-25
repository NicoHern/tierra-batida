{
const {Sim}=require("./load-sim.js");
function run(i, script, opts={}){
  const s=new Sim({cpu:[i!==0, i!==1], diff:'normal', games:4, seed:7});
  const me=s.players[i], sd=i===0?1:-1;
  s.phase='rally'; me.x=opts.px??0.5; me.z=sd*(opts.pz??2.8); me.vx=me.vz=0;
  const b=s.ball; Object.assign(b,{x:0, y:1.0, z:-sd*11, vx:0,vy:0,vz:0, sx:0, g:9.8, kind:'drive', bounces:0, last:1-i, serve:false, net:false, hitT:0});
  if (opts.lob){ const dz=sd*(opts.land??9.5)-b.z, vy=Math.sqrt(2*9.8*(opts.apex??6)), T=(vy+Math.sqrt(vy*vy+2*9.8))/9.8; b.vz=dz/T; b.vy=vy; b.vx=(opts.lx??0)/T; b.kind='lob'; }
  else s.solveFlat(opts.tx??1.5, sd*(opts.land??8), 17, 9.8*1.3, 0.4);
  let res={hit:null, cancel:false}, t=0, zs=[];
  for (let k=0;k<480;k++){
    const inp={mx:0,mz:0,drive:false,lob:false,slice:false};
    script(t, inp); const hin=[null,null]; hin[i]=inp;
    s.events.length=0; s.step(1/120, hin); t+=1/120;
    if (k%60===0) zs.push((me.z*sd).toFixed(1));
    if (s.events.some(e=>e.type==='cancel')) res.cancel=+t.toFixed(2);
    const h=s.events.find(e=>e.type==='hit' && e.i===i);
    if (h){ res.hit={shot:h.shot, t:+t.toFixed(2), z:+(me.z*sd).toFixed(2), q:+h.q.toFixed(2)}; break; }
    if (s.phase!=='rally'){ res.end=s.phase; break; }
  }
  res.z=zs.join(' '); return res;
}
const press=(at, key='drive')=>(t,inp)=>{ if (Math.abs(t-at)<0.004) inp[key]=true; };
const both=(...fs)=>(t,inp)=>fs.forEach(f=>f(t,inp));
const hold=(from,to,mx,mz)=>(t,inp)=>{ if (t>=from && t<=to){ inp.mx=mx; inp.mz=mz; } };
for (const i of [0,1]){ const back = i===0 ? 1 : -1;
  console.log('-- jugador',i);
  console.log('red, pulsa y le hacen globo, corre atrás  ', JSON.stringify(run(i, both(press(0.05), hold(0.1,9,0,back)), {lob:true})));
  console.log('red, globo alto, corre atrás            ', JSON.stringify(run(i, both(press(0.05), hold(0.1,9,0,back)), {lob:true, apex:8, land:10.5})));
  console.log('red, pulsa, cancela y corre atrás        ', JSON.stringify(run(i, both(press(0.05), press(0.4), hold(0.1,9,0,back)), {lob:true})));
  console.log('red, globo profundo y cruzado, corre     ', JSON.stringify(run(i, both(press(0.05), hold(0.1,9,0.35,back)), {lob:true, apex:7.5, land:11.3, lx:2})));
  console.log('red, cancela y vuelve a pulsar al llegar ', JSON.stringify(run(i, both(press(0.05), press(0.4), press(1.7), hold(0.1,1.9,0,back)), {lob:true, apex:7.5, land:11.3})));
  console.log('red, globo bajo que bota, persigue       ', JSON.stringify(run(i, both(press(0.05), hold(0.1,9,0,back)), {lob:true, apex:4.2, land:9.8})));
  console.log('red, volea normal (pulsa pronto)         ', JSON.stringify(run(i, press(0.05), {tx:1.5, land:6})));
  console.log('fondo, bola lateral, pulsa pronto y corre', JSON.stringify(run(i, both(press(0.05), hold(0.05,9,1,0)), {pz:12.3, px:-1.5, tx:2.5, land:9})));
  console.log('doble pulsación rápida (no cancela)      ', JSON.stringify(run(i, both(press(0.3), press(0.42)), {pz:12.3, tx:0.8, land:9})));
}
}
