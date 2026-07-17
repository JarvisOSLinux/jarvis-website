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
bash scripts/03b-build-kernel.sh --host-install
```

**Kernel submodule is empty**

```bash
git submodule update --init --recursive linux-jarvisos
```

## ISO build

**`ISO file not found`**

```bash
ls build-deps/
# Ensure cachyos-desktop-linux-260308.iso is present, or update ISO_FILE in scripts/build.config
```

**`arch-chroot: command not found`**

```bash
sudo pacman -S arch-install-scripts
```

**`No space left on device` during squashfs**

```bash
df -h
make clean   # Clears build/ to reclaim space
```

**UEFI boots to black screen / "Unsupported"**

`07-rebuild-iso.sh` dynamically sizes `efiboot.img` and enforces `CONFIG_EFI_STUB=y` in the kernel
config. If you're hitting this on an old build, rebuild from step 7: `make step7`.

## JARVIS agent

**`Ollama not reachable`**

```bash
systemctl start ollama
# or for a user session:
ollama serve &
```

**No voice input (`vosk`/`pyaudio` missing)**

The agent falls back to text-only mode automatically. Install `portaudio` and rerun the launcher
to enable voice.

**Audio in live boot is silent**

```bash
systemctl --user status pipewire
systemctl --user start pipewire pipewire-pulse wireplumber
```

## JARVIS TUI (`jarvis tui`)

**`Error: TUI dependencies are not installed. (missing: textual)`**

The `textual` package is not in the JARVIS Python environment:

```bash
sudo /opt/jarvis-env/bin/pip install textual
jarvis tui
```

The active JARVIS environment is `/opt/jarvis-env`, not `/var/lib/jarvis/venv` — always install
extra packages into `/opt/jarvis-env`.

**`Error: LLM model not configured`**

```bash
sudo nano /etc/jarvis/jarvis.conf
# Set: LLM_MODEL=qwen3:14b  (or whichever model you have pulled)
```

**`jarvis model` shows the wrong model (e.g. `qwen3:4b` when `qwen3:14b` is installed)**

The CLI is reading the fallback `/usr/lib/jarvis/.env` instead of `/etc/jarvis/jarvis.conf`. Check
that `JARVIS_CONFIG_DIR` is exported by the wrapper:

```bash
head /usr/local/bin/jarvis
# Should contain: export JARVIS_CONFIG_DIR="${JARVIS_CONFIG_DIR:-/etc/jarvis}"
```

If missing, add it or re-run the jarvis-install overlay step.

## Kernel module (`/dev/jarvis`)

**`/dev/jarvis` missing after reboot**

```bash
lsmod | grep jarvis
cat /etc/modules-load.d/jarvis.conf    # Should contain: jarvis
journalctl -b -u systemd-modules-load | grep jarvis
```

If the config file is missing, create it:

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
reinstall the kernel: `bash scripts/03b-build-kernel.sh --host-install`.
