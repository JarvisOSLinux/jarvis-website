---
title: Building the linux-jarvisos Kernel
description: Build and install the custom AI-integrated kernel, standalone or as part of the ISO pipeline.
category: Build System
order: 3
---

> **Requirement: Arch-based host for installation.** The `--host-install` step uses `pacman -U`,
> so installing the kernel onto the host requires an Arch-based system (Arch, Manjaro,
> EndeavourOS, CachyOS). Building the packages requires `makepkg` on PATH; the build script also
> documents a Debian/Ubuntu toolchain (`build-essential bc flex bison libssl-dev libelf-dev
> dwarves`) for compile-only use.

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

> **Note:** the submodule URLs in `.gitmodules` use SSH (`git@github.com:...`), so the commands
> above fail with a `Permission denied (publickey)` error unless you have GitHub SSH keys
> configured. If you cloned anonymously over HTTPS, rewrite the URLs first:
>
> ```bash
> git config url."https://github.com/".insteadOf git@github.com:
> git submodule update --init linux-jarvisos
> ```
>
> Alternatively, skip the submodule entirely and use pre-built packages (Option C below).

The `linux-jarvisos/` submodule tracks the `stable` branch — the upstream kernel tree (currently
7.1.1) plus the JARVIS driver tree under `drivers/jarvis/`.

## Build modes

Run every command below from the **jarvisos repo root** — the build script sources
`build.config` from the current directory, and `build.config` lives at the repo root
(copy `iso-build-scripts/build.config.example` to `build.config` if it doesn't exist yet).
There is also a Makefile entry point for this step, also run from the repo root:
`make -f iso-build-scripts/Makefile step3b`.

### Option A — Build and install on your running system

The fastest way to run the JARVIS kernel on your own machine. Builds the packages on the host and
installs them with `pacman`:

```bash
# from the jarvisos repo root
bash iso-build-scripts/03b-build-kernel.sh --host-install
```

The `linux-jarvisos.install` hook runs `depmod` and regenerates the initramfs
(`mkinitcpio -p linux-jarvisos`) automatically. It does **not** update your bootloader — after
install, regenerate the GRUB config or add a systemd-boot entry, then reboot and select
**linux-jarvisos**:

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg
# or, for systemd-boot: add an entry pointing at
#   vmlinuz-linux-jarvisos + initramfs-linux-jarvisos.img
```

**Build time**: 20–60 min on first run. Subsequent runs with ccache take 2–5 min.

### Option B — Build packages only

For the ISO pipeline or manual inspection:

```bash
# from the jarvisos repo root
bash iso-build-scripts/03b-build-kernel.sh
# Packages land in build/kernel-pkg/
# linux-jarvisos-*.pkg.tar.zst
# linux-jarvisos-headers-*.pkg.tar.zst
```

### Option C — Use pre-built packages from GitHub Releases

```bash
bash iso-build-scripts/03b-build-kernel.sh --download-release --host-install
```

Downloads the latest `linux-jarvisos-*.pkg.tar.zst` packages from the linux-jarvisos Releases
page (requires an authenticated `gh` CLI) and skips compilation entirely. This also works when
the kernel submodule is not initialized. `DOWNLOAD_KERNEL_RELEASE=1` is the equivalent
environment variable.

### Skip recompilation when packages are already built

```bash
SKIP_KERNEL_BUILD=1 bash iso-build-scripts/03b-build-kernel.sh --host-install
```

## Verifying the kernel is active

```bash
uname -r
# Should output something like: 7.1.1-jarvisos

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

## Changelog — corrected claims

*2026-07-22:*
- Build commands corrected from a nonexistent `scripts/` directory to `iso-build-scripts/03b-build-kernel.sh`, run from the repo root where the script sources `build.config` (added `make step3b` and `build.config.example` notes).
- Submodule branch/version fixed: `stable` at kernel 7.1.1, not `jarvisos-7.0-stable` at 7.0.2; `uname -r` example updated to `7.1.1-jarvisos` (PKGBUILD disables `CONFIG_LOCALVERSION_AUTO`, so no `-g<hash>` suffix).
- Removed false claim that the install hook adds a GRUB entry — `linux-jarvisos.install` only runs depmod + mkinitcpio; added manual `grub-mkconfig`/systemd-boot instructions (code: packages/linux-jarvisos/linux-jarvisos.install).
- Documented the `--download-release` / `DOWNLOAD_KERNEL_RELEASE=1` pre-built-package path as Option C (code: iso-build-scripts/03b-build-kernel.sh).
- Host requirement softened: `pacman` is required only for `--host-install`; the script documents a Debian/Ubuntu toolchain for compile-only use.
- Added SSH-vs-HTTPS submodule note: `.gitmodules` uses `git@github.com:` URLs, so anonymous HTTPS clones need a URL rewrite or Option C.
