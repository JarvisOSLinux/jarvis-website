---
title: Installing JARVIS OS
description: Download the ISO, verify it, boot it, and install to disk or run in a VM.
category: Getting Started
order: 2
---

The fastest way to run JARVIS OS is the pre-built ISO from the [Download page](/download), which
always shows the latest GitHub release. Verify the ISO against the SHA-512 checksum published with
the release on GitHub.

## 1. Boot from USB

Flash the ISO to a USB drive using `dd`, Ventoy, or Balena Etcher, then boot from it — you'll land
in the live environment.

```bash
sudo dd if=jarvisos-*.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

## 2. Live environment

The live ISO boots to a text console: root auto-login on TTY1, where the installer launches
automatically. No display manager runs in the live environment — KDE Plasma 6 comes up on the
installed system, not the live session.

## 3. Install to disk

The `jarvis-install` TUI installer (bash + dialog) launches automatically on TTY1 and walks you
through a guided installation — partitioning, user setup, and bootloader configuration included.

> The installer works but post-install configuration is still being stabilized — see
> [Troubleshooting](/docs/troubleshooting) if something doesn't come up correctly after first boot.

## 4. Virtual machine

JARVIS OS runs well in VirtualBox or QEMU/KVM. Allocate at least 4 GB RAM and 20 GB disk for
comfortable usage with local LLM inference.

```bash
qemu-system-x86_64 -m 4G -smp 4 -cdrom jarvisos-*.iso
```

## Prefer to build it yourself?

See [The Build Pipeline](/docs/build-pipeline) to produce your own ISO from source
instead of using the pre-built release.

## Changelog — corrected claims

*2026-07-22:*

- Download-page checksum claim corrected: the page shows the latest GitHub release but does not
  display a SHA-512 checksum (the checksum block in `src/pages/download.astro` is hidden and never
  populated by `fetchRelease()`); readers are now directed to the checksum published with the
  release on GitHub.
- "The Seven-Script Build Pipeline" link retitled to "The Build Pipeline" to match the target
  page's actual title and its nine-script table (which includes `03b-build-kernel.sh`).
- Installer and live-environment sections corrected: Calamares was removed from the build — the
  live ISO boots to root auto-login on TTY1 where the `jarvis-install` TUI installer launches
  automatically (no live desktop session; Plasma runs on the installed system). See
  `iso-build-scripts/05-bake-installer.sh` in the `jarvisos` repo.
