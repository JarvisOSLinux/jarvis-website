---
title: Building the ISO
description: Step-by-step walkthrough for producing your own bootable JARVIS OS image from source.
category: Build System
order: 2
---

> **Work in progress.** The build pipeline runs end-to-end, but live-boot reliability and the
> `jarvis-install` TUI installer are still being stabilized. Expect rough edges.

## Requirements

- **Arch-based host** (Arch, Manjaro, EndeavourOS, CachyOS) — `makepkg` and `pacman` are required for the kernel build step
- 16 GB+ RAM
- 60 GB+ free disk space
- Internet connection (packages are downloaded during build)
- The official Arch Linux ISO placed in `build-deps/`

## Step 0 — Get the source ISO

Download the official Arch Linux ISO and place it in `build-deps/`:

```
build-deps/archlinux-x86_64.iso
```

The build configuration lives at the **project root** as `build.config` (copy
`iso-build-scripts/build.config.example` to get started). Update it if your filename differs:

```bash
ISO_FILE="archlinux-x86_64.iso"
PROJECT_ROOT="/absolute/path/to/jarvisos"
```

## Step 1 — Install host build tools

```bash
sudo bash iso-build-scripts/00-install-prereq.sh
```

This detects your host distro (Arch, Fedora/RHEL, Ubuntu/Debian, or openSUSE — though the kernel
build step still requires an Arch-based host, per the requirements above) and installs the full
toolchain: ISO tooling (`arch-install-scripts`, `squashfs-tools`, `xorriso`, `p7zip`,
`dosfstools`, `fakeroot`, `libarchive`, `unzip`), fetch/scripting basics (`git`, `curl`, `wget`,
`python3`, `dialog`), kernel-build dependencies (`base-devel`, `bc`, `flex`, `bison`, `openssl`,
`libelf`, `pahole`), Rust/`cargo` (needed to build dmcp and dispatch in step 4), and QEMU
(`qemu-system-x86`, `qemu-ui-gtk`) for boot testing. It verifies 12 required tools before
finishing.

## Step 2 — Run the full build

Every build step sources `./build.config` from the current directory, so run `make` **from the
project root** — do not `cd` into `iso-build-scripts/`:

```bash
make -f iso-build-scripts/Makefile all
```

Or run steps individually when debugging — see [The Build Pipeline](/docs/build-pipeline) for
what each one does:

```bash
make -f iso-build-scripts/Makefile step1    # Extract source Arch Linux ISO
make -f iso-build-scripts/Makefile step2    # Unsquash rootfs → build/iso-rootfs/
make -f iso-build-scripts/Makefile step3    # Install KDE Plasma Wayland + all system packages into rootfs
make -f iso-build-scripts/Makefile step3b   # Build linux-jarvisos kernel + install into rootfs
make -f iso-build-scripts/Makefile step4    # Install Project-JARVIS daemon
make -f iso-build-scripts/Makefile step5    # Install jarvis-install TUI installer (auto-launches on TTY1)
make -f iso-build-scripts/Makefile step6    # Repack rootfs into SquashFS
make -f iso-build-scripts/Makefile step7    # Assemble final bootable ISO → build/jarvisos-YYYYMMDD-x86_64.iso
```

**Estimated total time**: 60–120 min depending on CPU and network — kernel compilation is the
bottleneck (see [Building the Kernel](/docs/building-the-kernel) for ways to speed this up).

## Step 3 — Test in QEMU

Run from the project root (`booter.sh` also sources `./build.config`):

```bash
./iso-build-scripts/booter.sh    # UEFI if OVMF (edk2-ovmf) is installed, otherwise legacy BIOS
```

There is no firmware-selection flag: the script auto-detects OVMF firmware and silently falls
back to legacy BIOS when it isn't found. Install `edk2-ovmf` to test UEFI boot.

## Step 4 — Write to USB

```bash
sudo dd if=build/jarvisos-*-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

Boot from USB — the `jarvis-install` TUI installer launches automatically on TTY1 (root
auto-login; no display manager runs on the live environment). The installer configures and
enables SDDM/KDE Plasma on the installed system.

## Current status

| Area | Status |
|------|--------|
| ISO build pipeline | Working — full build completes without errors |
| Live boot (BIOS) | Working — boots to the TTY1 TUI installer (KDE Plasma comes up on the installed system) |
| Live boot (UEFI) | Working — `efiboot.img` dynamically sized, EFI stub enforced |
| WiFi on live boot | Working — NetworkManager + wpa_supplicant backend |
| Audio on live boot | Working — PipeWire with rtkit-daemon |
| Touchpad on live boot | Working — libinput + psmouse/i2c_hid modules |
| jarvis-install TUI installer | In progress — installs, but post-install configuration needs work |

## Changelog — corrected claims

*2026-07-22:*
- Source ISO corrected: CachyOS desktop ISO → official Arch Linux ISO (`archlinux-x86_64.iso`, the default `ISO_FILE` in `build.config.example`; `07-rebuild-iso.sh` sets `CACHYOS_FALLBACK_IN_ISO=false`).
- Build-script paths corrected: `scripts/` → `iso-build-scripts/`, with `make` and `booter.sh` invoked from the project root because every step sources `./build.config` from the current directory.
- Installer corrected: Calamares was removed from the build — step 5 (`05-bake-installer.sh`) bakes the `jarvis-install` TUI installer, which auto-launches on TTY1 via root auto-login.
- Live-boot behavior corrected: the live ISO boots to the TTY1 installer, not a KDE Plasma desktop — SDDM is only enabled on the installed system (`03-bake-wayland.sh`, `05-bake-installer.sh`).
- QEMU test script corrected: `booter.sh` accepts no flags (no `--bios`) — UEFI when OVMF is present, legacy BIOS fallback otherwise.
- Prerequisite list expanded to match `00-install-prereq.sh`: kernel-build deps, Rust/cargo, QEMU, and four supported host distro families.
