---
title: Installing JARVIS OS
description: Download the ISO, verify it, boot it, and install to disk or run in a VM.
category: Getting Started
order: 2
---

The fastest way to run JARVIS OS is the pre-built ISO from the [Download page](/download), which
always shows the latest GitHub release along with its SHA-512 checksum.

## 1. Boot from USB

Flash the ISO to a USB drive using `dd`, Ventoy, or Balena Etcher, then boot from it — you'll land
in the live environment.

```bash
sudo dd if=jarvisos-*.iso of=/dev/sdX bs=4M status=progress conv=fsync
```

## 2. Live environment

The live session gives you a fully functional JARVIS OS with KDE Plasma 6. Test the AI features,
explore the system, and run the `jarvis` CLI before committing to an install.

## 3. Install to disk

Launch the Calamares installer from the desktop for a guided installation to your hard drive —
automatic partitioning, user setup, and bootloader configuration included.

> Calamares installs but post-install configuration is still being stabilized — see
> [Troubleshooting](/docs/troubleshooting) if something doesn't come up correctly after first boot.

## 4. Virtual machine

JARVIS OS runs well in VirtualBox or QEMU/KVM. Allocate at least 4 GB RAM and 20 GB disk for
comfortable usage with local LLM inference.

```bash
qemu-system-x86_64 -m 4G -smp 4 -cdrom jarvisos-*.iso
```

## Prefer to build it yourself?

See [The Seven-Script Build Pipeline](/docs/build-pipeline) to produce your own ISO from source
instead of using the pre-built release.
