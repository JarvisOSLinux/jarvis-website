---
title: Building the linux-jarvisos Kernel
description: Build and install the custom AI-integrated kernel, standalone or as part of the ISO pipeline.
category: Build System
order: 3
---

> **Requirement: Arch-based host system.** The kernel build uses `makepkg`, which is Arch-specific.
> The `pacman -U` install step requires `pacman`. You cannot build and install this kernel on a
> Fedora or Debian host — use an Arch, Manjaro, EndeavourOS, or CachyOS machine.

## Prerequisites

```bash
sudo pacman -S base-devel bc flex bison openssl libelf pahole ccache
```

`ccache` is optional but strongly recommended — it makes incremental rebuilds ~5–10× faster.

## Initialize the kernel submodule

```bash
git clone --recursive https://github.com/JarvisOSLinux/jarvisos.git
cd jarvisos

# If already cloned without --recursive:
git submodule update --init linux-jarvisos
```

The `linux-jarvisos/` submodule tracks the `jarvisos-7.0-stable` branch — the upstream 7.0.2
kernel tree plus the JARVIS driver tree under `drivers/jarvis/`.

## Build modes

### Option A — Build and install on your running system

The fastest way to run the JARVIS kernel on your own machine. Builds the packages on the host and
installs them with `pacman`:

```bash
cd scripts
bash 03b-build-kernel.sh --host-install
```

After install, reboot and select **linux-jarvisos** from your bootloader (GRUB or systemd-boot) —
the GRUB entry is added automatically by the `linux-jarvisos.install` hook.

**Build time**: 20–60 min on first run. Subsequent runs with ccache take 2–5 min.

### Option B — Build packages only

For the ISO pipeline or manual inspection:

```bash
cd scripts
bash 03b-build-kernel.sh
# Packages land in build/kernel-pkg/
# linux-jarvisos-*.pkg.tar.zst
# linux-jarvisos-headers-*.pkg.tar.zst
```

### Skip recompilation when packages are already built

```bash
SKIP_KERNEL_BUILD=1 bash 03b-build-kernel.sh --host-install
```

## Verifying the kernel is active

```bash
uname -r
# Should output something like: 7.0.2-jarvisos-g5fffde5bcf9e

ls -l /dev/jarvis                                  # Kernel character device
cat /sys/class/misc/jarvis/sysmon/cpu_load          # Live hardware metrics
cat /sys/class/misc/jarvis/sysmon/mem_avail
cat /sys/class/misc/jarvis/sysmon/thermal
cat /sys/class/misc/jarvis/policy/policy_table      # Loaded AI security policy table
```

## Kernel config options

The `packages/linux-jarvisos/PKGBUILD` applies these config symbols on top of the host kernel
config:

| Symbol | Purpose |
|--------|---------|
| `CONFIG_JARVIS=m` | Main JARVIS driver module |
| `CONFIG_JARVIS_SYSMON=y` | CPU/memory/thermal sysfs metrics |
| `CONFIG_JARVIS_POLICY=y` | AI action security policy engine |
| `CONFIG_JARVIS_KEYS=y` | Kernel keyring for API key storage |
| `CONFIG_JARVIS_SYSFS_METRICS=y` | Expose state/model/pending via sysfs |
| `CONFIG_JARVIS_DIBS=y` | Zero-copy DIBS buffer integration (if DIBS present) |
| `CONFIG_EFI_STUB=y` | Required for UEFI boot (PE/COFF image) |
| `CONFIG_SQUASHFS=y` | Required for archiso live boot |
| `CONFIG_OVERLAY_FS=y` | Required for archiso overlay mount |

Build issues? See [Troubleshooting](/docs/troubleshooting#kernel-build).
