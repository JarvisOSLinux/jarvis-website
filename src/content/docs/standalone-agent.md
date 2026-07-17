---
title: Standalone Agent Quickstart
description: Run the JARVIS agent on any Linux system with Ollama — no ISO or custom kernel required.
category: Running JARVIS
order: 1
---

The `jarvis_agent.py` runtime works on any Linux system with Ollama installed. It does not
require the custom kernel, but if `linux-jarvisos` is running it can read from
`/sys/class/misc/jarvis/sysmon/` for hardware-aware model selection.

## Quick start

```bash
# Ensure Ollama is running
systemctl start ollama

# Launch the agent (handles all setup automatically)
./test-jarvis-ollama.sh
```

The launcher will:

1. Install system dependencies (`portaudio`, `python-pip`)
2. Create a Python venv with `vosk`, `pyaudio`, `requests`
3. Download the Vosk small English model (~45 MB) for offline STT
4. Select an Ollama model based on available RAM
5. Open a dedicated terminal window with the JARVIS agent

## Selecting a model

```bash
# Force a specific model
JARVIS_MODEL=qwen3:8b ./test-jarvis-ollama.sh

# Point at a remote Ollama instance
OLLAMA_URL=http://192.168.1.10:11434 ./test-jarvis-ollama.sh
```

## Agent commands

| Input | What happens |
|-------|-------------|
| `sysmon` | Print current CPU%, RAM, temperature |
| `update my system` | Plan `pacman -Syu`, show DANGEROUS confirmation, run on approval |
| `Hey JARVIS <command>` | Voice wake phrase → transcribe → plan → execute |
| `quit` / `exit` / Ctrl-C | Graceful shutdown |

## Action security tiers

Every command the AI plans is classified before execution:

| Tier | Example | Behaviour |
|------|---------|-----------|
| SAFE | `df -h`, `systemctl status` | Runs silently |
| ELEVATED | `systemctl restart NetworkManager` | Runs, writes audit entry to `/tmp/jarvis.log` |
| DANGEROUS | `pacman -Syu`, `pacman -S htop` | Blocked until user types `y` |
| FORBIDDEN | `rm -rf /`, `dd if=/dev/zero` | Hard-blocked unconditionally |

No voice input available (`vosk`/`pyaudio` missing)? The agent falls back to text-only mode
automatically — see [Troubleshooting](/docs/troubleshooting#jarvis-agent) to enable voice.
