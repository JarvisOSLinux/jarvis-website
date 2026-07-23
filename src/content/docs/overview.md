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
| `jarvis_sysmon` | Real-time CPU/memory/thermal metrics via ioctl and sysfs — the daemon can read these via ioctl; hardware-aware model selection is planned (today the active model comes from the configured provider list) |
| `jarvis_policy` | Tiered action security engine (SAFE / ELEVATED / DANGEROUS / FORBIDDEN) with kernel-enforced rate limiting |
| `jarvis_keys` | Kernel-keyring API-key storage — driver and daemon client implemented; provider integration in progress (today providers read keys from `providers.json`) |
| `jarvis_dibs` | Zero-copy DIBS buffer sharing for large inference payloads |

## Architecture

```
Voice Input ──► Vosk STT ──► wake words "jarvis / hey jarvis / okay jarvis"
Text Input  ─────────────────────────────────┐        (configurable via WAKE_WORDS)
                                              ▼
                LLM provider pool ── automatic failover
              Ollama (local, default) / OpenAI-compatible APIs
                              │
                              ▼
                  Plan (JSON: structured actions)
                              │
               ┌──────────────▼──────────────────┐
               │   JARVIS Policy Gate (TLA)       │
               │   SAFE ──────► run silently      │
               │   ELEVATED ──► user confirm first│
               │   DANGEROUS ─► user confirm first│
               │   FORBIDDEN ─► hard block        │
               └──────────────┬──────────────────┘
                              │
            dispatch (signal-driven orchestrator)
                              │
                              ▼
                 dmcp (MCP server manager)
                              │
                              ▼
     MCP servers (shellmcp subprocess shell, git, browser, ...)
                              │
          ┌───────────────────▼────────────────────┐
          │            linux-jarvisos kernel        │
          │  /dev/jarvis ◄──► jarvis.ko             │
          │  /sys/class/misc/jarvis/sysmon/*        │
          │  /sys/class/misc/jarvis/policy/*        │
          └───────────────────────────────────────┘
```

JARVIS is provider-agnostic: the daemon maintains a priority-ordered pool of LLM providers —
local Ollama and any OpenAI-compatible API — with automatic failover and per-provider cooldowns.
Local Ollama is the default and offline path, not the only path.

Threat tiers are assigned by the host (the TLA system), never by the model: the effective level
is max(host floor, manifest declaration, payload scan), so neither the LLM's plan nor a server
manifest can lower it.

Execution is indirect by design — the LLM dispatches tasks to **dispatch**, which delegates to
**dmcp** for MCP server discovery and tool invocation. Long-term memory lives in **contextor**,
a persistent vector store the daemon controls as a child process.

## System requirements

**Minimum** — x86_64 CPU, 4 GB RAM, 20 GB disk, no GPU required (CPU inference).

**Recommended** — 8+ core modern CPU, 16 GB+ RAM, 50 GB+ SSD, NVIDIA GPU for accelerated inference.

**Building from source additionally requires** an Arch-based host (Arch, Manjaro, EndeavourOS,
CachyOS) — the kernel build uses `makepkg` and `pacman -U`, which are Arch-specific. You cannot
build and install the kernel on a Fedora or Debian host.

## Where to go next

- [Installing JARVIS OS](/docs/installing) — the fastest path, using the pre-built ISO
- [The Build Pipeline](/docs/build-pipeline) — build your own ISO from source
- [Standalone Agent Quickstart](/docs/standalone-agent) — run the JARVIS agent standalone (Linux, macOS, or Windows), no ISO or custom kernel required

## Changelog — corrected claims

*2026-07-22:*

- Ollama-only inference framing → provider-agnostic LLM pool (local Ollama + OpenAI-compatible APIs) with automatic failover (code: `jarvis/llm/provider_pool.py`)
- "sysmon picks model size" → planned, not implemented; `IOCTL_SYSMON` is defined but has no callers, and the model comes from the configured provider list (`jarvis/kernel_client.py`, `jarvis/llm/provider_pool.py`)
- `jarvis_keys` "keys never touch disk" → keyring driver and client exist, but providers still read keys from plaintext `providers.json`; integration in progress (`jarvis/core/providers.py`)
- Plan "commands + tiers" → structured actions only; threat tiers are host-assigned via max(host floor, manifest, payload scan), and ELEVATED requires user confirmation rather than "run + audit log" (`jarvis/core/threat_level.py`, `jarvis/core/confirmation_manager.py`)
- "Shell execution (PTY)" with no MCP layer → actual chain is dispatch → dmcp → MCP servers (shellmcp uses subprocess pipes, no PTY); contextor added as the memory store (`shellmcp/src/server.py`, `jarvis/dispatch/`, `jarvis/contextor/`)
- "Seven-Script Build Pipeline" link → "The Build Pipeline"; the target page enumerates nine scripts, so the hardcoded count was dropped
- Wake phrase "Hey JARVIS" → default wake words are jarvis / hey jarvis / okay jarvis, configurable via `WAKE_WORDS` (`jarvis/config.py`)
- Standalone agent "any Linux box" → Linux, macOS, or Windows; full platform backends exist for all three (`jarvis/platform/`)
