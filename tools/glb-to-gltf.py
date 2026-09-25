"""Convierte un modelo .glb en glTF JSON con el buffer embebido en base64 (así se generó xbot.json
a partir de Xbot.glb de los ejemplos de three.js r128).
Uso: python3 tools/glb-to-gltf.py Xbot.glb xbot.json"""
import base64, json, struct, sys
src, dst = sys.argv[1], sys.argv[2]
d = open(src, 'rb').read()
magic, version, length = struct.unpack('<III', d[:12]); assert magic == 0x46546C67, 'no es un GLB'
o, gltf, binary = 12, None, b''
while o < len(d):
    clen, ctype = struct.unpack('<II', d[o:o+8]); chunk = d[o+8:o+8+clen]; o += 8 + clen
    if ctype == 0x4E4F534A: gltf = json.loads(chunk)
    elif ctype == 0x004E4942: binary = chunk
gltf['buffers'] = [{'byteLength': len(binary), 'uri': 'data:application/octet-stream;base64,' + base64.b64encode(binary).decode()}]
json.dump(gltf, open(dst, 'w'), separators=(',', ':'))
print(dst, len(binary), 'bytes de buffer')
