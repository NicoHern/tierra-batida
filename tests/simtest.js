const {Sim}=require("./load-sim.js");
for (const diff of ["easy","normal","hard"]){ let agg={pts:0,hits:0,games:0,reasons:{},shots:{},serves:{},minStam:1, secs:0};
 for (const seed of [1,2,3,4]){
  const s=new Sim({cpu:[true,true],diff,games:4,seed:seed*11});
  for(let k=0;k<120*1800 && !s.score.over;k++){ s.step(1/120,null);
    for (const p of s.players) agg.minStam=Math.min(agg.minStam,p.stam);
    for(const e of s.events){ if(e.type==="hit"){agg.hits++; agg.shots[e.shot]=(agg.shots[e.shot]||0)+1; if(e.serve) agg.serves[e.serve]=(agg.serves[e.serve]||0)+1;} if(e.type==="point"){agg.pts++;} if(e.type==="point"||e.type==="fault") agg.reasons[e.reason]=(agg.reasons[e.reason]||0)+1; }
    s.events.length=0; }
  agg.games+= s.score.over?1:0; agg.secs+=s.t; }
 console.log(diff,"over",agg.games,"/4 pts",agg.pts,"h/pt",(agg.hits/agg.pts).toFixed(1),"s/pt",(agg.secs/agg.pts).toFixed(1),"minStam",agg.minStam.toFixed(2),JSON.stringify(agg.reasons),JSON.stringify(agg.serves),JSON.stringify(agg.shots)); }
