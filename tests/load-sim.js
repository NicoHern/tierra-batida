// Carga el motor de juego (bloque <script id="sim-src"> de index.html) en Node, sin navegador.
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const tag = '<script id="sim-src">', a = html.indexOf(tag) + tag.length, b = html.indexOf('</script>', a);
const mod = { exports: {} };
new Function('module', 'require', html.slice(a, b))(mod, require);
module.exports = mod.exports;
