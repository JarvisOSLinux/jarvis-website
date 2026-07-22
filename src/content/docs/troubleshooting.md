---
title: Troubleshooting
description: Common errors across the kernel build, ISO build, standalone agent, TUI, and kernel module — with fixes.
category: Reference
order: 1
---

## Kernel build

**`makepkg: command not found`**

```bash
# You must be on an Arch-based system
sudo pacman -S base-devel
```

**`CONFIG_JARVIS=m missing from final .config`**

```bash
# Remove stale .config so PKGBUILD rebuilds from /proc/config.gz
rm linux-jarvisos/.config
bash iso-build-scripts/03b-build-kernel.sh --host-install
# or use the dedicated host wrapper:
./build-kernel.sh --install
```

**Kernel submodule is empty**

```bash
git submodule update --init --recursive linux-jarvisos
```

## ISO build

**`ISO file not found`**

```bash
ls build-deps/
# Ensure the base ISO named by ISO_FILE is present, or update ISO_FILE in build.config at the
# repo root (copy iso-build-scripts/build.config.example to ./build.config if it doesn't exist)
```

**`arch-chroot: command not found`**

```bash
sudo pacman -S arch-install-scripts
```

**`No space left on device` during squashfs**

```bash
df -h
```

Free space outside the build tree first, or remove only old finished ISOs in `build/`. Treat
`make -C iso-build-scripts clean` as a last resort here: it deletes `build/iso-extract` and
`build/iso-rootfs` — and `iso-rootfs` is the squashfs input, so cleaning mid-failure forces a
rebuild from step 1. (`clean` does not remove kernel files or finished ISOs, and the Makefile
lives in `iso-build-scripts/`, not the repo root.)

**UEFI boots to black screen / "Unsupported"**

`07-rebuild-iso.sh` dynamically sizes `efiboot.img`. `CONFIG_EFI_STUB=y` is enforced by the
`linux-jarvisos` PKGBUILD during the kernel build (step 3b), not step 7 — so if an old build's
kernel lacks the EFI stub, re-running step 7 alone just repacks the same kernel. Rebuild the
kernel, then the ISO: `make step3b step6 step7` (run `make` from `iso-build-scripts/`).

## JARVIS agent

**`Ollama not reachable`**

JARVIS auto-starts Ollama when it is unreachable (`OLLAMA_AUTO_START=true` by default): it tries
the platform service manager, then falls back to spawning `ollama serve` directly. If you still
see this error, auto-start failed — check that the `ollama` binary is installed and the service
isn't masked (auto-start is also skipped for remote Ollama hosts), then start it manually:

```bash
systemctl start ollama
# or for a user session:
ollama serve &
```

**No voice input (`vosk`/`sounddevice` missing)**

The agent falls back to text-only mode automatically. `sounddevice` needs the system `portaudio`
library — install `portaudio` and rerun the launcher to enable voice.

**Audio in live boot is silent**

```bash
systemctl --user status pipewire
systemctl --user start pipewire pipewire-pulse wireplumber
```

## JARVIS TUI (`jarvis tui`)

**`Error: TUI dependencies are not installed. (missing: textual)`**

The `textual` package is not in the JARVIS Python environment:

```bash
sudo /var/lib/jarvis/venv/bin/pip install textual
jarvis tui
```

The active JARVIS environment is `/var/lib/jarvis/venv` (the code lives in `/usr/lib/jarvis`) —
always install extra packages into `/var/lib/jarvis/venv`.

**`Error: No LLM configured`**

Model selection lives in the provider pool (`providers.json`), not `jarvis.conf` — setting
`LLM_MODEL` there is a no-op for the current daemon. Add a provider instead:

```bash
jarvis providers add --type ollama --model qwen3:14b   # or whichever model you have pulled
jarvis providers                                       # list configured providers
```

The pool also accepts remote providers: `jarvis providers add --type api --url <url> --key <key>`.

**`jarvis providers` shows the wrong/old model (e.g. `qwen3:4b` when `qwen3:14b` is installed)**

(`jarvis model` has been removed in favor of the provider pool — it now only prints a redirect
notice.)

The CLI may be reading the fallback `/usr/lib/jarvis/.env` config: the shipped wrapper
(`/usr/bin/jarvis`) does not set `JARVIS_CONFIG_DIR` — only the systemd daemon units get
`JARVIS_CONFIG_DIR=/etc/jarvis`. To make interactive runs read `/etc/jarvis`:

```bash
export JARVIS_CONFIG_DIR=/etc/jarvis   # add to your shell profile, or edit /usr/bin/jarvis
```

Then correct the provider entry:

```bash
jarvis providers edit <name> --model qwen3:14b   # or re-add the provider
```

## Kernel module (`/dev/jarvis`)

**`/dev/jarvis` missing after reboot**

```bash
lsmod | grep jarvis
cat /etc/modules-load.d/jarvis.conf /usr/lib/modules-load.d/jarvis.conf 2>/dev/null
# One of them should contain: jarvis — the OS installer and the linux-jarvisos
# package write the /usr/lib/modules-load.d/ path
journalctl -b -u systemd-modules-load | grep jarvis
```

If neither file exists, create one (systemd-modules-load reads both locations):

```bash
echo "jarvis" | sudo tee /etc/modules-load.d/jarvis.conf
sudo modprobe jarvis                   # Load now without rebooting
ls /dev/jarvis                         # Verify
```

**`modprobe: FATAL: Module jarvis not found`**

The `linux-jarvisos` kernel isn't running:

```bash
uname -r    # Must contain "jarvisos"
```

If not, select `linux-jarvisos` from your bootloader and reboot. If it doesn't appear, rebuild and
reinstall the kernel: `bash iso-build-scripts/03b-build-kernel.sh --host-install` (or
`./build-kernel.sh --install`).

## Changelog — corrected claims

*2026-07-22:*

- Python environment path was inverted: the active venv is `/var/lib/jarvis/venv` (code in
  `/usr/lib/jarvis`); `/opt/jarvis-env` is never created by any build or install script
  (jarvisos `04-bake-jarvis.sh`, `jarvis-install.sh`).
- LLM configuration corrected to the provider pool: the real error is `No LLM configured`, fixed
  via `jarvis providers add`; `LLM_MODEL` in `jarvis.conf` is no longer read and `jarvis model`
  was removed (Project-JARVIS `jarvis/cli.py`, `jarvis/config.py`).
- Config-dir check fixed: the wrapper is `/usr/bin/jarvis` (not `/usr/local/bin`) and does not
  export `JARVIS_CONFIG_DIR` — only the systemd units set it — so the fix is exporting it
  yourself, not re-running the installer overlay.
- Build-script paths fixed: there is no `scripts/` directory — the kernel build is
  `iso-build-scripts/03b-build-kernel.sh` (or root-level `./build-kernel.sh --install`), and
  `build.config` lives at the repo root.
- `make clean` guidance corrected: it removes only `build/iso-extract` and `build/iso-rootfs`
  (the squashfs input) and must run from `iso-build-scripts/`, so it was harmful advice for a
  mid-squashfs disk-space failure.
- UEFI stub attribution fixed: `CONFIG_EFI_STUB=y` is enforced by the `linux-jarvisos` PKGBUILD
  at kernel build time (step 3b), not by `07-rebuild-iso.sh`; remedy is `make step3b step6 step7`.
- Voice dependency name updated: runtime audio uses `sounddevice` (PortAudio bindings), not
  `pyaudio`; the portaudio fix stands.
- Added missing context: the daemon auto-starts Ollama (`OLLAMA_AUTO_START=true` by default), and
  the installer writes module auto-load config to `/usr/lib/modules-load.d/jarvis.conf`.
