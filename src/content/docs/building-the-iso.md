---
title: Building the ISO
description: Step-by-step walkthrough for producing your own bootable JARVIS OS image from source.
category: Build System
order: 2
---

> **Work in progress.** The build pipeline runs end-to-end, but live-boot reliability and the
> Calamares installer are still being stabilized. Expect rough edges.

## Requirements

- **Arch-based host** (Arch, Manjaro, EndeavourOS, CachyOS) — `makepkg` and `pacman` are required for the kernel build step
- 16 GB+ RAM
- 60 GB+ free disk space
- Internet connection (packages are downloaded during build)
- A CachyOS desktop ISO placed in `build-deps/`

## Step 0 — Get the source ISO

Download the CachyOS desktop ISO and place it in `build-deps/`:

```
build-deps/cachyos-desktop-linux-260308.iso
```

Update `scripts/build.config` if your filename differs:

```bash
ISO_FILE="cachyos-desktop-linux-260308.iso"
PROJECT_ROOT="/absolute/path/to/jarvisos"
```

## Step 1 — Install host build tools

```bash
cd scripts
sudo bash 00-install-prereq.sh
```

This detects your host distro and installs `arch-install-scripts`, `squashfs-tools`, `xorriso`,
`p7zip`, `dosfstools`, `fakeroot`, `git`, `curl`, and `python3`.

## Step 2 — Run the full build

```bash
cd scripts
make all
```

Or run steps individually when debugging — see [The Build Pipeline](/docs/build-pipeline) for
what each one does:

```bash
make step1    # Extract CachyOS ISO
make step2    # Unsquash rootfs → build/iso-rootfs/
make step3    # Install KDE Plasma Wayland + all system packages into rootfs
make step3b   # Build linux-jarvisos kernel + install into rootfs
make step4    # Install Project-JARVIS daemon
make step5    # Install Calamares installer
make step6    # Repack rootfs into SquashFS
make step7    # Assemble final bootable ISO → build/jarvisos-YYYYMMDD-x86_64.iso
```

**Estimated total time**: 60–120 min depending on CPU and network — kernel compilation is the
bottleneck (see [Building the Kernel](/docs/building-the-kernel) for ways to speed this up).

## Step 3 — Test in QEMU

```bash
./scripts/booter.sh          # Boot with UEFI (recommended)
./scripts/booter.sh --bios   # Or boot with BIOS
```

## Step 4 — Write to USB

```bash
sudo dd if=build/jarvisos-*-x86_64.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

Boot from USB and use the Calamares installer on the desktop.

## Current status

| Area | Status |
|------|--------|
| ISO build pipeline | Working — full build completes without errors |
| Live boot (BIOS) | Working — boots to KDE Plasma desktop |
| Live boot (UEFI) | Working — `efiboot.img` dynamically sized, EFI stub enforced |
| WiFi on live boot | Working — NetworkManager + wpa_supplicant backend |
| Audio on live boot | Working — PipeWire with rtkit-daemon |
| Touchpad on live boot | Working — libinput + psmouse/i2c_hid modules |
| Calamares installer | In progress — installs, but post-install configuration needs work |
