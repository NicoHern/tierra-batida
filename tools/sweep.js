// Barrido de balance: aplica reemplazos de texto al motor y juega partidos CPU contra CPU.
// Uso: node tools/sweep.js '{"base":[], "angulos":[["tx=aimX*3.4; tzA=8.6","tx=aimX*3.6; tzA=8.6"]]}'
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const tag = '<script id="sim-src">', a = html.indexOf(tag) + tag.length, base = html.slice(a, html.indexOf('</script>', a));
const variants = JSON.parse(process.argv[2] || '{"base":[]}');
for (const [name, reps] of Object.entries(variants)){
  let src = base;
  for (const [from, to] of reps){ if (!src.includes(from)) { console.log('NO ENCONTRADO:', from); process.exit(1); } src = src.split(from).join(to); }
  const m = { exports: {} }; new Function('module', 'require', src)(m, require); const { Sim } = m.exports;
  let line = name + ': ';
  for (const diff of ['easy', 'normal', 'hard']){
    let pts = 0, hits = 0, over = 0, out = 0, win = 0, net = 0;
    for (const seed of [1, 2, 3, 4, 5, 6]){
      const s = new Sim({ cpu: [true, true], diff, games: 4, seed: seed * 11 });
      for (let k = 0; k < 120 * 1800 && !s.score.over; k++){
        s.step(1 / 120, null);
        for (const e of s.events){ if (e.type === 'hit') hits++; if (e.type === 'point'){ pts++; if (e.reason === 'OUT') out++; if (e.reason === 'GANADOR') win++; if (e.reason === 'RED') net++; } }
        s.events.length = 0;
      }
      over += s.score.over ? 1 : 0;
    }
    line += `${diff} ${over}/6 golpes/punto ${(hits / pts).toFixed(1)} out ${(out / pts * 100 | 0)}% ganadores ${(win / pts * 100 | 0)}% red ${(net / pts * 100 | 0)}% | `;
  }
  console.log(line);
}
