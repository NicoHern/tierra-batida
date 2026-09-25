"""Prueba del modo online en local con dos pestañas y la sala falsa (online-local.html).
Uso: python3 -m http.server 8000 y luego: python3 tests/e2e/online.py"""
import asyncio, sys
from playwright.async_api import async_playwright
URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8000/online-local.html"
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=swiftshader", "--enable-webgl", "--ignore-gpu-blocklist"])
        ctx = await b.new_context(viewport={"width": 640, "height": 400})
        errs, pages = [], []
        for n in range(2):
            pg = await ctx.new_page(); pg.on("pageerror", lambda e, n=n: errs.append(f"{n}:{e}"))
            await pg.goto(URL); pages.append(pg)
        await asyncio.sleep(3)
        for pg in pages:
            await pg.locator("#m-online").scroll_into_view_if_needed(); await pg.click("#m-online")
            await pg.locator("#playBtn").scroll_into_view_if_needed(); await pg.click("#playBtn")
        await asyncio.sleep(1.5)
        a, bb = pages
        await a.click('#lobbyList .small-btn'); await asyncio.sleep(0.6)
        await bb.click('#lobbyList .small-btn'); await asyncio.sleep(1.5)
        for k in range(8):
            for pg in pages: await pg.keyboard.press('KeyJ')
            await asyncio.sleep(0.5)
        ok = True
        for n, pg in enumerate(pages):
            hud = await pg.get_attribute('#hud', 'hidden')
            print(n, "en partido:", hud is None, "| marcador:", (await pg.inner_text('#board')).replace('\n', ' '))
            ok = ok and hud is None
        await b.close()
        print("errores:", errs or "ninguno"); sys.exit(0 if ok and not errs else 1)
asyncio.run(main())
