---
title: The Build Pipeline
description: The modular script sequence that turns a CachyOS ISO into a bootable JARVIS OS image.
category: Build System
order: 1
---

JARVIS OS is assembled by a sequence of modular scripts under `scripts/` in the
[`jarvisos`](https://github.com/JarvisOSLinux/jarvisos) repo. Each script handles one stage of the
build, can be run individually for debugging, and is orchestrated end-to-end by a `Makefile`.

## The scripts

| Script | Stage | What it does |
|--------|-------|---------------|
| `00-install-prereq.sh` | Prerequisites | Detects the host distro (Arch/Fedora/Ubuntu/openSUSE) and installs `arch-install-scripts`, `squashfs-tools`, `xorriso`, `p7zip`, `dosfstools`, `fakeroot`, `git`, `curl`, `python3`. |
| `01-extract-iso.sh` | Extract | Mounts the CachyOS source ISO and copies its contents into `build/iso-extract/`. |
| `02-unsquash-fs.sh` | Unsquash | Extracts the SquashFS rootfs into `build/iso-rootfs/` for modification via `arch-chroot`. |
| `03-bake-wayland.sh` | Desktop | Installs KDE Plasma Wayland, PipeWire audio, NetworkManager, input drivers, and hardware firmware; creates the `liveuser` account with passwordless sudo; configures SDDM autologin. |
| `03b-build-kernel.sh` | Kernel | Builds `linux-jarvisos` and `linux-jarvisos-headers` with `makepkg`, installs into the rootfs via `pacman -U`, regenerates the initramfs. See [Building the Kernel](/docs/building-the-kernel). |
| `04-bake-jarvis.sh` | AI stack | Copies `Project-JARVIS` into the rootfs, creates the Python venv, installs Ollama, sets up the `jarvis.service` systemd unit and CLI wrappers. |
| `05-bake-calamares.sh` | Installer | Installs Calamares and applies JARVIS OS branding, partitioning, and post-install configuration. |
| `06-squash-fs.sh` | Repack | Repacks `build/iso-rootfs/` back into a SquashFS image with `zstd` compression. |
| `07-rebuild-iso.sh` | Assemble | Assembles the final ISO with `xorriso`, dynamically sizes `efiboot.img`, and updates the syslinux/GRUB bootloader entries. |

## Running it

```bash
git clone --recursive https://github.com/JarvisOSLinux/jarvisos.git
cd jarvisos/scripts

make all         # run every stage in sequence
make status      # show which steps are complete
make clean       # remove all build artifacts
```

Or run stages individually when debugging — see [Building the ISO](/docs/building-the-iso) for
the full step-by-step walkthrough, requirements, and QEMU testing instructions.
