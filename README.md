# Tierra Batida

Juego de tenis en tierra batida para el navegador, hecho con [Three.js](https://threejs.org/) e inspirado en el Virtua Tennis de Dreamcast. Todo el juego está en un único `index.html`, sin compilación ni dependencias que instalar.

## Cómo jugar

Hace falta un servidor web local porque el modelo del jugador (`xbot.json`) se carga con `fetch`. Abrir `index.html` con doble clic no funciona.

```bash
python3 -m http.server 8000
# y abrir http://localhost:8000
```

También funciona tal cual en GitHub Pages: *Settings → Pages → Deploy from branch → main / root*.

### Controles

| | Mover | Golpe | Slice | Globo |
|---|---|---|---|---|
| Jugador 1 | `W A S D` (o flechas) | `J` (o `Espacio`) | `L` | `K` |
| Jugador 2 (local) | Flechas | `.` | `,` | `-` |
| Mando | Stick | `A` | `X` | `B` |

- **Dejada:** atrás + golpe.
- **Dirección:** izquierda o derecha al pegar; hacia la red para tirar más profundo.
- **Cancelar un golpe:** vuelve a pulsar el mismo botón.
- `C` cambia la cámara, `P` pausa, `M` silencia.
- En el móvil aparecen un stick táctil y botones en pantalla.

## Qué incluye

- Modos contra la CPU (tres niveles) y dos jugadores en el mismo teclado.
- Barra de carga que sube y vuelve a bajar: la potencia es la que marque al contactar.
- Círculo de precisión: se estrecha si llegas preparado y parado, y se abre si golpeas corriendo, tarde o cansado.
- Voleas, smash, dejadas, globos, planchas, tres tipos de saque (plano, cortado y liftado) y energía.
- Personalización del jugador: colores, pelo, gorra, altura, mano dominante, revés a una o dos manos y estilo de juego.
- **Online:** usa la capacidad `room` de los artefactos de Claude. Fuera de ese entorno el botón Online aparece desactivado y el resto del juego funciona igual. Para probarlo en local, abre `online-local.html` en dos pestañas del mismo navegador y elige Online en las dos (usa una sala falsa, `tools/fake-room.js`).

## Estructura

- `index.html`: el juego completo. El bloque `<script id="sim-src">` es el motor (física, reglas, IA), sin dependencias del navegador. El resto es render, entrada y UI.
- `xbot.json`: modelo 3D del jugador (glTF con el buffer embebido).
- `online-local.html`: el mismo juego con una sala online falsa entre pestañas, para desarrollo.
- `tests/`: simulaciones en Node que cargan el motor directamente desde `index.html`; `tests/e2e/`, pruebas en navegador con Playwright.
- `tools/`: barrido de balance de la IA (`sweep.js`), la sala falsa y el conversor `.glb` → `xbot.json`.
- `versiones/`: copias anteriores del juego guardadas durante el desarrollo.

## Tests

```bash
node tests/simtest.js   # partidos CPU contra CPU: duración de puntos, errores, ganadores
node tests/aimtest.js     # dirección de los golpes según la entrada
node tests/servetest.js   # los saques caen en el cuadro correcto
node tests/nettest.js     # moverse en la red, globos y cancelar el golpe

# en navegador (pip install playwright && playwright install chromium), con el servidor en marcha:
python3 tests/e2e/smoke.py    # arranca un partido y golpea sin errores
python3 tests/e2e/online.py   # dos pestañas juegan online con la sala falsa

# balance: compara variantes del motor en partidos CPU contra CPU
node tools/sweep.js '{"actual":[], "angulos_abiertos":[["tx=aimX*3.4; tzA=8.6","tx=aimX*3.6; tzA=8.6"]]}'
```

## Licencia

El código está bajo licencia [MIT](LICENSE).

El modelo `xbot.json` es el personaje "X Bot" de [Mixamo](https://www.mixamo.com/) (Adobe), en la versión que distribuye el repositorio de ejemplos de three.js. No está cubierto por la licencia MIT y se rige por los términos de Mixamo.
