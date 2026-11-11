"""Drive the page through CDP and save screenshots: scenes.py out mode(desktop|phone)."""
import asyncio, base64, json, subprocess, sys, tempfile, time, urllib.request
import websockets

URL = "http://localhost:8420/"

async def main(out, mode):
    port = 9334
    proc = subprocess.Popen(["chromium", "--headless=new", "--disable-gpu", "--no-sandbox", "--hide-scrollbars",
        f"--remote-debugging-port={port}", f"--user-data-dir={tempfile.mkdtemp()}", "about:blank"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(50):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json")); break
            except Exception:
                time.sleep(0.2)
        ws_url = [t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"]
        async with websockets.connect(ws_url, max_size=200_000_000) as ws:
            n = 0
            async def call(method, **params):
                nonlocal n
                n += 1
                await ws.send(json.dumps({"id": n, "method": method, "params": params}))
                while True:
                    msg = json.loads(await ws.recv())
                    if msg.get("id") == n:
                        return msg.get("result", {})
            async def js(expr):
                return (await call("Runtime.evaluate", expression=expr, awaitPromise=True)).get("result", {}).get("value")
            async def shot(name, scale=2):
                r = await call("Page.captureScreenshot", format="png")
                open(f"{out}/{name}.png", "wb").write(base64.b64decode(r["data"]))
                print("saved", name)
            if mode == "desktop":
                await call("Emulation.setDeviceMetricsOverride", width=1180, height=760, deviceScaleFactor=2, mobile=False)
            else:
                await call("Emulation.setDeviceMetricsOverride", width=390, height=844, deviceScaleFactor=3, mobile=True)
            await call("Page.navigate", url=URL)
            await asyncio.sleep(2.5)
            await js("""(()=>{const i=document.getElementById('message-input'); i.value='Install cowsay for me'; i.dispatchEvent(new Event('input',{bubbles:true})); document.getElementById('send-btn').click(); return 1})()""")
            await asyncio.sleep(4.5)
            if mode == "phone":
                await shot("phone-waiting")
                await js("document.getElementById('permissions-btn').click(), 1")
                await asyncio.sleep(0.8)
                await shot("phone-approve")
                await js("[...document.querySelectorAll('.permission-action')].find(b=>/approve/i.test(b.textContent)).click(), 1")
                await asyncio.sleep(0.6)
                await js("document.getElementById('permission-close').click(), 1")
                await asyncio.sleep(3.5)
                await shot("phone-done")
            else:
                await shot("desktop-waiting")
                await js("window.JarvisTransport.invoke('approve_confirmation', {id: 'c7a2'}), 1")
                await asyncio.sleep(3.5)
                await shot("desktop-done")
    finally:
        proc.terminate()

asyncio.run(main(sys.argv[1], sys.argv[2]))
