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
- Ollama running (`systemctl status ollama`)
- At least one model pulled: `ollama list`

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

## 2. Configure the LLM model

The JARVIS service and CLI both read `/etc/jarvis/jarvis.conf`:

```bash
ollama list                    # Find installed models
sudo nano /etc/jarvis/jarvis.conf
```

Key fields:

```ini
LLM_MODEL=qwen3:14b          # Match an ollama list entry exactly
LLM_URL=http://localhost:11434
OUTPUT_MODE=text              # Use "text" if no working audio device
LLM_AUTO_PULL=false           # Set true to auto-pull missing models
```

Apply to the running service:

```bash
sudo systemctl restart jarvis.service
jarvis model                  # Should echo the model name
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
| `Ctrl+Q` | Quit |
| `Ctrl+L` | Focus chat log (scroll with arrows/PgUp) |
| `Ctrl+I` | Focus input |
| `F1` | Help / keybinding reference |
| `Enter` | Submit message |

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
jarvis model
jarvis ask "say hello"
```

## Runtime file layout

| Path | Purpose |
|------|---------|
| `/usr/local/bin/jarvis` | Shell entry point (wraps `/opt/jarvis-env/bin/jarvis`) |
| `/opt/jarvis-env/` | Python venv with JARVIS and all dependencies |
| `/usr/lib/jarvis/` | JARVIS Python package source |
| `/etc/jarvis/jarvis.conf` | System-wide config (model, URLs, modes) |
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
