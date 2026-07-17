---
title: Overview
description: What JARVIS OS is, how it's put together, and what you need to run it.
category: Getting Started
order: 1
---

**The world's first operating system with a custom AI-integrated kernel.**

JARVIS OS is a custom Linux distribution built on a CachyOS/Arch base where an AI assistant
handles system administration, file management, and hardware control through natural language —
voice or text. The kernel itself speaks to the AI through a dedicated character device
(`/dev/jarvis`), making the AI a first-class OS citizen rather than a userspace afterthought.

> **Status**: Work in progress. The custom kernel (`linux-jarvisos`), JARVIS driver, and agent
> runtime are functional. The full ISO build pipeline builds successfully; live-boot testing and
> the Calamares installer are still being refined.

## What makes this different

Most "AI-integrated" desktops are just a chatbot running on top of a stock kernel. JARVIS OS
integrates the AI at the kernel level:

| Layer | What it does |
|-------|-------------|
| `jarvis.ko` | Character device `/dev/jarvis` — kernel posts structured queries, AI daemon reads and responds |
| `jarvis_sysmon` | Real-time CPU/memory/thermal metrics via ioctl and sysfs — AI uses these to pick the right LLM model size |
| `jarvis_policy` | Tiered action security engine (SAFE / ELEVATED / DANGEROUS / FORBIDDEN) with kernel-enforced rate limiting |
| `jarvis_keys` | Secure API-key storage in the Linux kernel keyring — cloud LLM keys never touch disk |
| `jarvis_dibs` | Zero-copy DIBS buffer sharing for large inference payloads |

## Architecture

```
Voice Input ──► Vosk STT ──► wake phrase "Hey JARVIS"
Text Input  ─────────────────────────────────┐
                                              ▼
                         Ollama (local LLM) ◄─── sysmon picks model size
                              │
                              ▼
                    Plan (JSON: commands + tiers)
                              │
               ┌──────────────▼──────────────────┐
               │   JARVIS Policy Gate             │
               │   SAFE ──────► run silently      │
               │   ELEVATED ──► run + audit log   │
               │   DANGEROUS ─► user confirm first│
               │   FORBIDDEN ─► hard block         │
               └──────────────┬──────────────────┘
                              │
                     Shell execution (PTY)
                              │
          ┌───────────────────▼────────────────────┐
          │            linux-jarvisos kernel        │
          │  /dev/jarvis ◄──► jarvis.ko             │
          │  /sys/class/misc/jarvis/sysmon/*        │
          │  /sys/class/misc/jarvis/policy/*        │
          └───────────────────────────────────────┘
```

## System requirements

**Minimum** — x86_64 CPU, 4 GB RAM, 20 GB disk, no GPU required (CPU inference).

**Recommended** — 8+ core modern CPU, 16 GB+ RAM, 50 GB+ SSD, NVIDIA GPU for accelerated inference.

**Building from source additionally requires** an Arch-based host (Arch, Manjaro, EndeavourOS,
CachyOS) — the kernel build uses `makepkg` and `pacman -U`, which are Arch-specific. You cannot
build and install the kernel on a Fedora or Debian host.

## Where to go next

- [Installing JARVIS OS](/docs/installing) — the fastest path, using the pre-built ISO
- [The Seven-Script Build Pipeline](/docs/build-pipeline) — build your own ISO from source
- [Standalone Agent Quickstart](/docs/standalone-agent) — run the JARVIS agent on any Linux box, no ISO or custom kernel required
