---
title: Developer Setup on an Installed System
description: Get the full kernel + daemon + TUI stack working correctly on a running JARVIS OS install.
category: Running JARVIS
order: 2
---

If you're running JARVIS OS as your daily driver or a dev VM (not just booting a live ISO), this
page covers how to get the full stack working correctly.

## Prerequisites

- JARVIS OS installed from the live ISO (or kernel + daemon installed via `--host-install` + `--overlay`)
- For the default local-inference path: Ollama running (`systemctl status ollama`) with at least
  one model pulled (`ollama list`). Remote Ollama instances and OpenAI-compatible APIs also work —
  see step 2.

## 1. Verify the kernel module loads at boot

The `jarvis.ko` module must be loaded before any service starts.

```bash
lsmod | grep jarvis        # Should show: jarvis, dibs
ls -l /dev/jarvis          # Should exist
```

If the module isn't loading automatically at boot, create the modules-load config:

```bash
sudo tee /etc/modules-load.d/jarvis.conf << 'EOF'
jarvis
EOF

sudo systemctl restart systemd-modules-load.service
```

`modprobe` resolves the `dibs` dependency automatically — no separate entry needed.

## 2. Configure an LLM provider

Provider and model configuration lives in a provider pool (`providers.json`), not in
`jarvis.conf`. The pool is a priority-ordered failover list: the daemon tries providers in
order until one responds. Entries can be local or remote Ollama instances, or any
OpenAI-compatible API. Without at least one provider configured, `jarvis`, `jarvis run`,
and `jarvis chat` refuse to start with `Error: No LLM configured.`

Add a local Ollama provider (the daemon reads `/etc/jarvis/providers.json` because the
systemd unit sets `JARVIS_CONFIG_DIR=/etc/jarvis`):

```bash
ollama list                    # Find installed models
sudo JARVIS_CONFIG_DIR=/etc/jarvis jarvis providers add --type ollama --model qwen3:14b
```

Remote Ollama instances and OpenAI-compatible APIs are added the same way, and
`jarvis providers move` reorders the failover priority:

```bash
jarvis providers add --type api --model <model> --url <api-url> --key <api-key>
jarvis providers move <name> 1     # Make <name> the first provider tried
```

The pool can also be managed interactively from the TUI's Settings modal (`F2`, Providers tab).

`/etc/jarvis/jarvis.conf` still holds non-provider settings:

```ini
OUTPUT_MODE=text              # Use "text" if no working audio device
LLM_AUTO_PULL=false           # Set true to auto-pull missing models
```

Apply to the running service:

```bash
sudo systemctl restart jarvis.service
jarvis providers              # Pool should list your model at position [1]
```

## 3. Run the TUI

The interactive terminal UI (`jarvis tui`) requires the `textual` package in the JARVIS Python
environment:

```bash
which jarvis                                  # Should be /usr/local/bin/jarvis
sudo /opt/jarvis-env/bin/pip install textual
jarvis tui
```

| Key | Action |
|-----|--------|
| `Ctrl+N` | New session |
| `Ctrl+D` | Delete selected session |
| `Ctrl+Q` | Quit |
| `Ctrl+L` | Focus chat log (scroll with arrows/PgUp) |
| `Ctrl+I` | Focus input |
| `F1` | Help / keybinding reference |
| `F2` | Settings (Providers tab: add/edit LLM providers) |
| `Enter` | Submit message |

Two unlisted bindings also exist: `Ctrl+Shift+C` clears the chat log and `Ctrl+Shift+E`
exports the transcript.

## 4. Send messages to the running daemon

The JARVIS systemd service listens on a Unix socket:

```bash
jarvis send "what is my CPU temperature"

# Or use text chat mode directly (bypasses the socket, runs its own event loop)
jarvis chat
```

## 5. Verify the full stack

```bash
ls /dev/jarvis && echo "kernel driver OK"
systemctl is-active jarvis.service
curl -s http://localhost:11434/api/tags | python3 -m json.tool | grep name
jarvis providers               # Pool should list your model at position [1]
jarvis ask "say hello"
```

## Runtime file layout

| Path | Purpose |
|------|---------|
| `/usr/local/bin/jarvis` | Shell entry point (wraps `/opt/jarvis-env/bin/jarvis`) |
| `/opt/jarvis-env/` | Python venv with JARVIS and all dependencies |
| `/usr/lib/jarvis/` | JARVIS Python package source |
| `/etc/jarvis/jarvis.conf` | System-wide config (output mode, auto-pull, sockets — not model/provider settings) |
| `/etc/jarvis/providers.json` | LLM provider pool (priority-ordered failover list; managed via `jarvis providers`) |
| `/usr/lib/jarvis/.env` | Fallback config when `JARVIS_CONFIG_DIR` is unset |
| `/var/lib/jarvis/` | Runtime data (models dir, secondary venv) |
| `/run/jarvis/input.sock` | Unix socket — `jarvis send` writes here |
| `/run/jarvis/output.sock` | Unix socket — subscribe to receive JSON responses |
| `/var/log/jarvis/` | Logs (also in `journalctl -u jarvis`) |
| `/etc/modules-load.d/jarvis.conf` | Ensures `jarvis.ko` loads at boot |
| `/dev/jarvis` | JARVIS kernel character device |
| `/sys/class/misc/jarvis/sysmon/` | Live hardware metrics from kernel |

### Config precedence

```
JARVIS_CONFIG_DIR env var → /etc/jarvis/jarvis.conf   (system install, daemon)
                          ↓ fallback
                          /usr/lib/jarvis/.env         (dev fallback)
```

The systemd unit sets `JARVIS_CONFIG_DIR=/etc/jarvis` via `Environment=`. The
`/usr/local/bin/jarvis` wrapper sets it the same way so CLI and daemon always agree.

Running into errors on any of these steps? See [Troubleshooting](/docs/troubleshooting).

## Changelog — corrected claims

*2026-07-22:*

- `LLM_MODEL`/`LLM_URL` in `jarvis.conf` → provider pool in `providers.json`, managed via
  `jarvis providers add/edit/move/remove` or the TUI Settings modal; nothing in the daemon
  reads those legacy keys (code: `jarvis/config.py`, `jarvis/core/component_factory.py`).
- `jarvis model` verification steps → `jarvis providers`; the `model` command was removed
  and now exits with an error pointing at the provider pool (code: `jarvis/cli.py`).
- Ollama-only setup framing → priority-ordered failover pool that also accepts remote
  Ollama instances and OpenAI-compatible APIs; added the missing provider-creation step,
  without which the daemon, `jarvis run`, and `jarvis chat` refuse to start.
- TUI key table: added visible `Ctrl+D` (delete session) and `F2` (Settings/Providers)
  bindings, plus the hidden clear/export shortcuts (code: `jarvis/tui/app.py`).
