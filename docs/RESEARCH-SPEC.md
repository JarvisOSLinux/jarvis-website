# Research Spec — Canonical Reference for Website Content

This document is the single source of truth for all research-related content
on the JarvisOS website. All pages that reference the research (homepage,
/research, /AI-control, /freedom-control) must align with this spec.

Last updated from: the pre-publication manuscript, June 2026; taxonomy updated
to the seven-threat split, July 2026. Per-threat implementation status is
canonical in `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md` upstream — where
this spec and that table disagree, the upstream table wins.

---

## Paper Title

**Security Threats in AI-Native Operating Systems: An Empirical Study Using
Privilege-Escalated LLM Agents**

Yakup Atahanov, Toufic Majdalani — Washington State University Everett
Faculty Advisor: Dr. Jeremy Thompson

---

## Core Thesis

Traditional OS security models assume deterministic software. An LLM agent
violates that assumption fundamentally — its behavior is probabilistic,
context-dependent, and shaped by natural language inputs that are difficult
to sanitize or predict.

We chose an operating system as the research environment because it represents
the broadest possible integration surface. If we can characterize and mitigate
threats at the OS level, the findings generalize to every narrower context.

---

## The Seven-Threat Taxonomy

As of 2026-07 the taxonomy is **seven** empirically-identified threats —
Bloated Context and Forgetful Context were split into two distinct entries:

| # | Threat | Escalation Stage | Primary Mitigation | Status |
|---|--------|-----------------|-------------------|--------|
| 1 | Malicious MCP Servers | User / Sudo / Web | Community-vetted AUR-style registry + SHA-256 integrity verify | implemented (official tier not yet populated) |
| 2 | Prompt Injection | User / Sudo / Web | Cryptographic Boundary Protocol (verified daemon-side) | implemented |
| 3 | Misleading MCP Server Usage | User / Sudo / Web | Registry vetting + structured tool schema | partial |
| 4 | Unauthorized Sudo Requests via MCP | Sudo / Web | TLA system + PolicyKit enforcement | implemented |
| 5 | Sudo Capability Exploitation | Sudo / Web | TLA confirmation gate | implemented |
| 6 | Bloated Context | User / Sudo / Web | dispatch rolling window + contextor pruning | partial |
| 7 | Forgetful Context (novel) | User / Sudo / Web | Not yet mitigated — persistent constraint register planned | open |

### Key framing

- **Bloated Context ≠ Forgetful Context.** They are separate, adjacent
  threats. Bloated Context is security constraints getting crowded out of a
  saturated context window (partially mitigated). Forgetful Context is the
  daemon never durably storing constraints in the first place, so a context
  refresh loses them structurally rather than incidentally — the standout
  novel finding, and the first identification of this as a security threat
  rather than a reliability quirk.
- "Misinterpreted MCP Keyword Search" is not a separate threat — it is
  subsumed by "Misleading MCP Server Usage" and addressed by dmcp's
  embedding-based semantic tool search (cosine similarity over
  registry-provided vectors) alongside keyword search.
- "Unintended File Modification/Deletion" is not a separate threat — it is a
  consequence of threats 4 and 5 (unauthorized/exploited sudo), not a root
  cause.
- **Prompt Injection** is an explicit threat in the taxonomy.

---

## Architectural Mitigations

### Cryptographic Boundary Protocol
dispatch generates a 128-bit provenance nonce (32 hex characters) from the OS
CSPRNG for each MCP task. (An earlier 24-bit PID + wall-clock scheme was
replaced because it was guessable, making the boundary tag forgeable.) Tool
output returns wrapped in the nonce-keyed boundary tag in the EXIT signal
(`[hash=h] 200 <h>output</h>`), and the daemon verifies the tag against the
trusted per-task nonce — unverified output is marked untrusted. Tasks can opt
into out-of-band storage via `defer_output: true`, in which case the signal
shows only `[hash=h] 200 (deferred)` and the output is fetched on demand with
`get_output`.

### TLA (Threat Level Access) System
A four-tier threat classification: Safe → Elevated → Dangerous → Forbidden.
Enforced in userspace by the JARVIS daemon as a non-blocking human-in-the-loop
confirmation gate; the kernel-level policy engine (`/dev/jarvis`) mirrors the
same tiers OS-side but is not consulted from the daemon today. Every tool
invocation is classified as max(host floor, manifest declaration, payload
scan) and gated at or above the confirmation threshold. Escalation requires
explicit out-of-band user confirmation — it cannot be triggered by model
output or MCP server response alone. Sudo capability is an explicit,
user-toggled grant (a validated, password-required sudoers drop-in); every
individual escalation still requires the user's password in an out-of-band
GUI prompt.

### Community-Vetted MCP Registry
AUR-style proofread model. Third-party MCP servers pass community review (code,
declared capabilities, tool description accuracy) before being listed. Malicious
or deceptive servers are filtered before they are discoverable by tool search.

### Bloated Context Mitigation
dispatch's bounded rolling signal window (last 20 entries per wakeup) +
contextor's retention-based pruning; the daemon's context manager preserves the
system prompt and a rolling summary across refreshes. Persistent per-constraint
preservation is designed but **not implemented** — that gap is exactly
Forgetful Context (threat #7).

---

## Research Methodology — Three Escalation Stages

1. **User-level** — standard access, no sudo. Baseline threat surface.
2. **Sudo-enabled** — full root control. LLM can modify anything.
3. **Web-enabled** — sudo + internet. Enables exfiltration and remote injection.

---

## Four Contributions

1. Seven-threat taxonomy for privilege-escalated LLM agents — including
   Bloated Context (first identification of context saturation as a security
   threat) and Forgetful Context (first identification of absent persistent
   constraints as a security threat).
2. Architectural mitigations for each threat class, implemented or partially
   implemented in JarvisOS (per-threat status is canonical in
   `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md`).
3. JarvisOS itself — a fully functional, bootable, open-source AI-native OS.
4. MCP tool-description architecture independently developed Oct–Nov 2025,
   predating commercial deployments.

---

## What We Built (for /subsystems and architecture references)

- **dispatch** — signal-driven parallel task orchestrator. "One brain, many
  hands." LLM dispatches and returns to conversation; dispatch wakes LLM only
  on signals.
- **dmcp** — MCP server lifecycle manager. Discovery, install, config, invoke,
  remove. Dual scope (user/system). Also runs as MCP server itself.
- **contextor** — persistent memory backend. Vector similarity search, rolling
  session summaries, retention-based pruning.
- **Nine-script build pipeline** — transforms base Arch ISO into bootable
  AI-native OS with KDE Plasma 6 on Wayland.

---

## Publications

- **SURCA 2026** — Poster, WSU Everett. **Winner, Gray Grant.**
- **Full paper** — pre-publication manuscript available on request.

---

## Framing Rules for Website Copy

- The research contribution is the **platform + taxonomy + mitigations**, not
  just the software.
- The taxonomy is **seven** threats. Do not collapse Bloated Context and
  Forgetful Context back into one entry.
- Forgetful Context is the standout novel finding; Bloated Context remains a
  discrete threat in its own right — lead with whichever the page is about,
  but never conflate them.
- Present-tense mitigation claims must match the canonical status table in
  `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md`.
- The project is research-first, product-second.
- "Built for people, not corporations."
- Open-source is a structural necessity, not a preference.

---

## Changelog — corrected claims

*2026-07-22:* taxonomy updated six → seven (Bloated/Forgetful Context split,
2026-07, matching the live `/research` page, the jarvisos README, and
`CLAUDE.md`); boundary protocol corrected to the implemented 128-bit CSPRNG
nonce with daemon-side verification and opt-in `defer_output` (the
six-character Splitmix64 + out-of-band-default description was the old
design); TLA corrected to the four userspace tiers (no Guest→Kernel ladder,
no goal-scoped sudo expiry); constraint-preservation claim re-scoped to the
unmitigated Forgetful Context gap; per-threat status column added (canonical
upstream: `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md`); "adaptive search
strategy" replaced with dmcp's real keyword + embedding search; build
pipeline count corrected to nine scripts.
