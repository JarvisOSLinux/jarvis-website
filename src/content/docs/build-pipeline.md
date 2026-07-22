---
title: The Build Pipeline
description: The modular script sequence that turns an Arch Linux ISO into a bootable JARVIS OS image.
category: Build System
order: 1
---

JARVIS OS is assembled by a sequence of modular scripts under `iso-build-scripts/` in the
[`jarvisos`](https://github.com/JarvisOSLinux/jarvisos) repo. Each script handles one stage of the
build, can be run individually for debugging, and is orchestrated end-to-end by a `Makefile`.

## The scripts

| Script | Stage | What it does |
|--------|-------|---------------|
| `00-install-prereq.sh` | Prerequisites | Detects the host distro (Arch/Fedora/Ubuntu/openSUSE) and installs the ISO tooling (`arch-install-scripts`, `squashfs-tools`, `xorriso`, `p7zip`, `dosfstools`, `fakeroot`, `git`, `curl`, `python`) plus the kernel build toolchain (`base-devel`, `bc`, `flex`, `bison`, `openssl`, `libelf`, `pahole`), Rust/cargo for the `dmcp` and `dispatch` builds, `dialog`, `wget`, `libarchive`, `unzip`, and QEMU for testing. |
| `01-extract-iso.sh` | Extract | Extracts the Arch Linux source ISO with `7z` into `build/iso-extract/`. |
| `02-unsquash-fs.sh` | Unsquash | Extracts the SquashFS rootfs into `build/iso-rootfs/` for modification via `arch-chroot`. |
| `03-bake-wayland.sh` | Desktop | Installs KDE Plasma Wayland, PipeWire audio, NetworkManager, input drivers, and hardware firmware; creates the `liveuser` account with passwordless sudo; writes the default SDDM Wayland config. SDDM is not enabled on the live ISO — the TUI installer auto-launches on TTY1 instead, and SDDM autologin is set up at install time. |
| `03b-build-kernel.sh` | Kernel | Builds `linux-jarvisos` and `linux-jarvisos-headers` with `makepkg`, installs into the rootfs via `pacman -U`, regenerates the initramfs. See [Building the Kernel](/docs/building-the-kernel). |
| `04-bake-jarvis.sh` | AI stack | Copies `Project-JARVIS` into the rootfs, creates the Python venv, and installs Ollama — the LLM model is deliberately not pre-pulled into the ISO; it downloads on first boot via `jarvis-setup.service`. Also builds the `dmcp` and `dispatch` Rust binaries on the host (with a GitHub Releases binary fallback) and installs them to `/usr/bin`, stages the Vosk STT model directory, and sets up the `jarvis.service` systemd unit and CLI wrappers. |
| `05-bake-installer.sh` | Installer | Installs the `jarvis-install` TUI installer (bash + `dialog`) into the rootfs and configures TTY1 root auto-login so it launches automatically in the live environment. |
| `06-squash-fs.sh` | Repack | Repacks `build/iso-rootfs/` back into a SquashFS image with `xz` compression. |
| `07-rebuild-iso.sh` | Assemble | Assembles the final ISO with `xorriso`, dynamically sizes `efiboot.img`, and updates the syslinux/GRUB bootloader entries. |

## Running it

```bash
git clone https://github.com/JarvisOSLinux/jarvisos.git
cd jarvisos

# Submodules are pinned to SSH URLs; rewrite to HTTPS unless you have GitHub SSH keys set up
git config url."https://github.com/".insteadOf git@github.com:
git submodule update --init --recursive

cd iso-build-scripts
cp build.config.example ../build.config   # the Makefile requires build.config at the repo root; edit as needed

make prereq      # install build prerequisites (required before make all)
# download the Arch Linux ISO (archlinux-x86_64.iso) and place it in build-deps/

make all         # run steps 1-7 (+3b) in sequence
make rest        # resume an interrupted build (skips completed steps)
make status      # show which steps are complete
make clean       # remove extracted ISO and rootfs (kernel packages and final ISO are kept)
```

Pass `JOBS=N` to parallelize the kernel build and squashfs repack (e.g. `make JOBS=8 step3b`).

Or run stages individually when debugging — see [Building the ISO](/docs/building-the-iso) for
the full step-by-step walkthrough, requirements, and QEMU testing instructions.

## Changelog — corrected claims

*2026-07-22:*

- Script directory corrected: `scripts/` → `iso-build-scripts/` (code: `iso-build-scripts/Makefile`, `build.config.example` `SCRIPTS_DIR`).
- Base ISO corrected: CachyOS → plain Arch Linux (`ISO_FILE="archlinux-x86_64.iso"`); step 1 extracts it with `7z` rather than mounting it (code: `01-extract-iso.sh`).
- Installer step rewritten: Calamares is discontinued — `05-bake-installer.sh` bakes the `jarvis-install` TUI installer with TTY1 root auto-login (code: `05-bake-installer.sh`).
- Step 3 SDDM claim corrected: no SDDM autologin and SDDM not enabled on the live ISO; the installer configures it post-install (code: `03-bake-wayland.sh`).
- SquashFS compression corrected: `zstd` → `xz` (code: `06-squash-fs.sh` `mksquashfs -comp xz`).
- Steps 0 and 4 completed: full prerequisite set including kernel toolchain, Rust/cargo, and QEMU; step 4 also bakes the `dmcp`/`dispatch` binaries, stages the Vosk model, and defers the Ollama model pull to first boot via `jarvis-setup.service` (code: `00-install-prereq.sh`, `04-bake-jarvis.sh`).
- Run instructions fixed: `build.config` must be copied to the repo root, `make prereq` and the Arch ISO in `build-deps/` are required before `make all`; documented `make rest`, `JOBS=N`, the actual scope of `make clean`, and the HTTPS submodule workaround (`.gitmodules` pins SSH URLs).
