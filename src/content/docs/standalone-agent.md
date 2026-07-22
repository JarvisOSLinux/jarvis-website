---
title: Standalone Agent Quickstart
description: Run the JARVIS agent on any Linux system with Ollama — no ISO or custom kernel required.
category: Running JARVIS
order: 1
---

The `jarvis_agent.py` runtime itself is distro-agnostic: it runs on any Linux system with
Ollama and its Python dependencies installed. The bundled launcher script, however, targets
Arch-based systems — see the note below. The agent does not require the custom kernel: its
system snapshot reads standard `/proc` and `/sys/class/thermal` interfaces, and the launcher
selects a model from available RAM in `/proc/meminfo`. Kernel integration via
`/sys/class/misc/jarvis/` is used by the full JARVIS daemon (`kernel_client.py`), not the
standalone agent.

## Quick start

```bash
# Ensure Ollama is running
systemctl start ollama

# Launch the agent (handles all setup automatically)
./test-jarvis-ollama.sh
```

The launcher will:

1. Install system dependencies (`portaudio`, `python-pip`, `unzip`) via `pacman`
2. Create a Python venv with `vosk`, `pyaudio`, `requests`
3. Download the Vosk small English model (~45 MB) for offline STT
4. Select an Ollama model based on available RAM
5. Open a dedicated terminal window with the JARVIS agent

> **Arch-based systems only.** The launcher installs dependencies exclusively through
> `pacman` and aborts on distros without it. On other distros, install `portaudio`, `pip`,
> and `unzip` with your package manager, create a venv with `vosk`, `pyaudio`, and
> `requests`, then run `python3 jarvis_agent.py` directly with `JARVIS_MODEL`, `OLLAMA_URL`,
> and `VOSK_MODEL_PATH` set.

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

The model classifies each planned command into a tier as part of its JSON plan; the agent
enforces gates on those self-reported tiers:

| Tier | Example | Behaviour |
|------|---------|-----------|
| SAFE | `df -h`, `systemctl status` | Runs silently |
| ELEVATED | `systemctl restart NetworkManager` | Runs, writes audit entry to `/tmp/jarvis.log` — except package-manager commands, which are force-escalated to DANGEROUS |
| DANGEROUS | `pacman -Syu`, `pacman -S htop` | Blocked until user types `y` (auto-aborts after 30 s without an answer) |
| FORBIDDEN | `rm -rf /`, `dd if=/dev/zero` | Plan rejected outright |

On approval, `sudo` commands prompt for your password via a KDE dialog
(`kdialog`/`ksshaskpass`) when available, and `pacman` install/remove/upgrade commands run
with `--noconfirm` — your single `y` is the only confirmation before execution.

Note: unlike the full JARVIS daemon's TLA gate, the standalone agent performs no host-side
payload inspection — tier accuracy depends on the model. A destructive command the model
labels SAFE executes ungated.

No voice input available (`vosk`/`pyaudio` missing)? The agent falls back to text-only mode
automatically — see [Troubleshooting](/docs/troubleshooting#jarvis-agent) to enable voice.

## Changelog — corrected claims

*2026-07-22:*

- Removed the `/sys/class/misc/jarvis/sysmon/` model-selection claim — the standalone agent reads only standard `/proc` and `/sys/class/thermal` paths; the kernel interface is consumed by the full daemon (`project-jarvis/jarvis/kernel_client.py`).
- Scoped the "any Linux" claim: `jarvis_agent.py` is distro-agnostic, but the launcher installs dependencies via `pacman` only and aborts elsewhere (`test-jarvis-ollama.sh:59-67`); documented the manual non-Arch path.
- Security tiers reworded: classification is self-reported by the model, gates read the model's tier, and no host-side payload inspection exists (contrast the daemon's TLA in `threat_level.py`); "hard-blocked unconditionally" → "plan rejected outright" (`jarvis_agent.py:481-497`).
- DANGEROUS confirmation documented as auto-aborting after 30 s (`jarvis_agent.py:506-513`).
- Added the previously undocumented sudo-askpass GUI rewrite and pacman `--noconfirm` injection applied to every executed command (`jarvis_agent.py:269-344, 358-363`).
