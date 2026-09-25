"""Prueba de humo en navegador: arranca un partido, saca, golpea y comprueba que no haya errores.
Uso: python3 -m http.server 8000 (en la raíz del repo) y luego: python3 tests/e2e/smoke.py
Requiere: pip install playwright && playwright install chromium"""
import asyncio, sys
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/index.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
        pg = await b.new_page(viewport={"width": 1100, "height": 620})
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(URL); await asyncio.sleep(3)
        await pg.click('#playBtn'); await asyncio.sleep(1.5)
        await pg.keyboard.press('KeyJ'); await asyncio.sleep(0.55); await pg.keyboard.press('KeyJ')   # saque
        await asyncio.sleep(0.9); await pg.keyboard.down('KeyD'); await pg.keyboard.press('KeyJ')
        await asyncio.sleep(1.2); await pg.keyboard.up('KeyD')
        await pg.screenshot(path='smoke.png')
        await b.close()
        print("errores:", errs or "ninguno"); sys.exit(1 if errs else 0)
asyncio.run(main())
