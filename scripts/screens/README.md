# The product screenshots

`public/assets/screens/` holds real screens of jarvis-app's UI, the same page the
desktop app and `jarvis web` show, driven by a scripted scene instead of a model.
The scene follows a flow verified live on 2026-11-10: a package install as root
becomes one job, pacman's `[Y/n]` comes back in a reminder, and approving
`send_input` answers it.

To retake them you need a Project-JARVIS checkout with its venv (`jarvis`,
`websockets`) and Chromium:

```bash
export PROJECT_JARVIS=~/src/Project-JARVIS
W=$(mktemp -d)
export JARVIS_GUI_SOCKET=$W/jarvis.sock JARVIS_WEB_ENABLED=true JARVIS_WEB_PORT=8420 \
       JARVIS_WEB_ALLOWLIST_FILE=$W/allow.json JARVIS_WEB_AUDIT_FILE=$W/audit.jsonl
python scripts/screens/scene_daemon.py $W/jarvis.sock &
jarvis web allow you@example.com owner
jarvis web start --insecure-dev-login you@example.com &
python scripts/screens/scenes.py /tmp/shots desktop   # app-approval, app-done
# restart the scene daemon, then:
python scripts/screens/scenes.py /tmp/shots phone     # phone-waiting, the approval card
```

Then convert to WebP at the sizes in `public/assets/screens/` (1600 wide for the
app, 640 for the phone; the approval card is cropped from `phone-approve.png`).
