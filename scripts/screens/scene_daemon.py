"""The stub daemon with one scripted scene, for the website's screenshots.

The scene follows the flow verified live on 2026-11-10: a package install as
root becomes one job, pacman's [Y/n] comes back in a reminder, and the user's
approval of send_input answers it.
"""
import asyncio
import os
import sys
import time

sys.path.insert(0, os.path.join(os.environ["PROJECT_JARVIS"], "scripts"))
import stub_daemon as stub  # noqa: E402

JOB = "pacman-S-cowsay-4f1a"
waiting = asyncio.Event()


async def scene() -> None:
    b, act = stub.broadcast, stub.action
    await b({"type": "state", "state": "processing"})
    await asyncio.sleep(0.5)
    await b({"type": "response", "done": True, "comment": True,
             "content": "Let me find a tool that installs packages."})
    t = time.time()
    await act("start", "search:1", kind="search", title="Search: install system packages")
    await asyncio.sleep(0.6)
    await act("end", "search:1", kind="search", status="ok", started_at=t,
              output="jarvis-shell-system-mcp (installed): runs commands as root, after your password")
    await b({"type": "response", "done": True, "comment": True,
             "content": "Installing cowsay with pacman. It runs as root, so polkit asks for your password once."})
    t = time.time()
    await act("start", "tool:3", kind="tool", title="run_job (jarvis-shell-system-mcp)",
              detail=f"pacman -S cowsay  (job {JOB})")
    out = ["resolving dependencies...", "looking for conflicting packages...", "",
           "Packages (1) cowsay-3.8.4-1", "", "Total Installed Size:  0.04 MiB", "",
           ":: Proceed with installation? [Y/n]"]
    await asyncio.sleep(0.8)
    await act("update", "tool:3", output="\n".join(out))
    await b({"type": "activity", "text": "pacman is asking to proceed; waiting for your approval…"})
    stub.pending.append({
        "id": "c7a2", "created_at": time.time(), "tool_names": ["send_input"],
        "tool_lines": [f"send_input  Y⏎  (job {JOB}) — answers pacman's [Y/n]"],
    })
    await b({"type": "confirmation_request", "id": "c7a2"})
    await waiting.wait()
    await act("start", "tool:4", kind="tool", title="send_input (jarvis-shell-system-mcp)",
              detail=f"Y⏎  (job {JOB})")
    await act("end", "tool:4", kind="tool", status="ok", output="sent", started_at=time.time())
    out += ["", "(1/1) checking keys in keyring", "(1/1) checking package integrity",
            "(1/1) installing cowsay", ":: Running post-transaction hooks...",
            "(1/1) Arming ConditionNeedsUpdate..."]
    await asyncio.sleep(0.8)
    await act("end", "tool:3", kind="tool", status="ok", output="\n".join(out), started_at=t)
    await b({"type": "activity", "text": ""})
    await asyncio.sleep(0.4)
    await b({"type": "response", "done": True,
             "content": "Done: **cowsay 3.8.4** is installed. Try `cowsay hello`."})
    await b({"type": "state", "state": "idle"})


original = stub.handle


async def handle(msg, writer):
    kind = msg.get("type")
    if kind == "message":
        waiting.clear()
        stub.history.append({"role": "user", "content": msg.get("content", ""), "timestamp": time.time()})
        asyncio.create_task(scene())
        return
    if kind in ("approve_confirmation", "approve_all_confirmations"):
        stub.pending.clear()
        await stub.broadcast({"type": "confirmation_list", "confirmations": []})
        waiting.set()
        return
    await original(msg, writer)


stub.handle = handle
asyncio.run(stub.main(sys.argv[1]))
