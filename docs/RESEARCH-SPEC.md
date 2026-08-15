# Research Spec — Canonical Reference for Website Content

This document is the single source of truth for all research-related content
on the JarvisOS website. All pages that reference the research (homepage,
/research, /AI-control, /freedom-control) must align with this spec.

Last updated from: the pre-publication manuscript, June 2026; taxonomy updated
to the seven-threat split, July 2026; Forgetful Context merged back into
Bloated Context, August 2026 (six threats). Per-threat implementation status is
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

## The Six-Threat Taxonomy

As of 2026-08 the taxonomy is **six** empirically-identified threats —
Forgetful Context was merged back into Bloated Context, which now covers the
whole context-lifecycle failure:

| # | Threat | Escalation Stage | Primary Mitigation | Status |
|---|--------|-----------------|-------------------|--------|
| 1 | Malicious MCP Servers | User / Sudo / Web | Community-vetted AUR-style registry + SHA-256 integrity verify | implemented (official tier not yet populated) |
| 2 | Prompt Injection | User / Sudo / Web | Cryptographic Boundary Protocol (verified daemon-side) | implemented |
| 3 | Misleading MCP Server Usage | User / Sudo / Web | Registry vetting + structured tool schema | partial |
| 4 | Unauthorized Sudo Requests via MCP | Sudo / Web | TLA system + PolicyKit enforcement | implemented |
| 5 | Sudo Capability Exploitation | Sudo / Web | TLA confirmation gate | implemented |
| 6 | Bloated Context (novel) | User / Sudo / Web | daemon hot window + rolling summary (every ROOT turn) + dispatch rolling window + contextor pruning; persistent constraint register (path-prefix deny rules) enforced at the dispatch gate | partial — saturation bounded; non-persistence mitigated for path rules, open beyond them |

### Key framing

- **Bloated Context covers both faces of the context-lifecycle failure**:
  constraints crowded out of a saturated window, and constraints never
  durably stored, so a context refresh loses them structurally rather than
  incidentally. It is the standout novel finding — the first identification
  of context-lifecycle failure as a security threat rather than a reliability
  quirk.
- "Forgetful Context" is not a separate threat — it was split out as threat 7
  in 2026-07 and merged back into "Bloated Context" in 2026-08, because the
  two are one failure with two presentations. The daemon's two-tier context
  manager (hot window + rolling summary) never executes: `_trim_root_history()`
  is reachable only from `switch_mode()`'s root branch, which early-returns
  because the LLM never leaves root mode — the only mode switch away from root
  lives in a function with no callers. One dead path therefore produces both
  presentations, selected by a single config flag: with
  `RESET_HISTORY_AFTER_RESPONSE=false` (the default) history grows without
  bound and constraints are crowded out; set it `true` and history is cleared
  while the summary that was supposed to carry constraints forward is empty,
  so constraints are lost outright. Splitting them implied two distinct
  mechanisms; there is one.
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
system prompt across refreshes. Its two-tier design — a trimmed hot window plus
a rolling summary carrying older turns forward — originally did **not** execute
(the trim fired only on a mode switch that never occurred, so history grew
unbounded and the summary stayed empty); it now runs on every ROOT turn, so the
window is enforced and evicted exchanges are compressed rather than dropped.
That bounds the **saturation** half. For the **non-persistence** half, the
persistent constraint register shipped its first version: path-prefix deny
rules persisted durably, enforced mechanically at the dispatch gate (ahead of
the confirmation mode), and re-injected into every ROOT prompt. A rolling
summary is still lossy compression chosen by a model, not a durable store, so
a constraint outside the register's path-rule scope can still be summarized
away — generalizing the register beyond path rules is the open item.

---

## Research Methodology — Three Escalation Stages

1. **User-level** — standard access, no sudo. Baseline threat surface.
2. **Sudo-enabled** — full root control. LLM can modify anything.
3. **Web-enabled** — sudo + internet. Enables exfiltration and remote injection.

---

## Four Contributions

1. Six-threat taxonomy for privilege-escalated LLM agents — including Bloated
   Context, the first identification of context-lifecycle failure (constraints
   crowded out of a saturated window, and constraints never durably stored) as
   a security threat rather than a reliability quirk.
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
- The taxonomy is **six** threats. Bloated Context is one entry covering both
  faces of the context-lifecycle failure — do not re-split it into Bloated
  Context and Forgetful Context.
- Bloated Context is the standout novel finding, and the novelty claim is
  about the *lifecycle*: constraints do not survive it, whether they are
  crowded out of a saturated window or were never durably stored. Copy may
  lead with either presentation, but must not present them as two threats.
- Present-tense mitigation claims must match the canonical status table in
  `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md`.
- The project is research-first, product-second.
- "Built for people, not corporations."
- Open-source is a structural necessity, not a preference.

---

## Changelog — corrected claims

*2026-08-15:* the persistent constraint register moved from planned to shipped
(Project-JARVIS#214): path-prefix deny rules persisted durably, enforced at the
dispatch gate ahead of the confirmation mode, and re-injected into every ROOT
prompt. The threat table, mitigation narrative, and `/research` page now state
it as live with its path-rule scope explicit; the non-persistence half stays
open for broader constraints. Also corrected on `/research`: threat 5's card
claimed "sudo access expires on task completion" — no expiry mechanism exists
and none is needed for the claim the card actually makes: sudo is an explicit,
user-toggled, password-required grant, and every individual escalation still
requires the user's password out-of-band (this was already corrected upstream
in Project-JARVIS's 2026-07-22 changelog; the website had kept the old wording).

*2026-08-01 (later):* the dead path described in the entry below has been
repaired for the saturation half (Project-JARVIS#213). `LLM.ask()` now applies
the hot window on every ROOT turn and compresses evicted exchanges into the
rolling summary, instead of relying on a mode switch that never fired. The
Bloated Context Mitigation section and the `/research` narrative are updated to
put the *defect* in the past tense while keeping the merge — that one mechanism
produced both faces is the empirical basis for treating them as one threat, and
that remains true of the system as observed. Threat 6 stays **partial**: the
non-persistence half is untouched and still open, because a rolling summary is
lossy compression chosen by a model rather than a durable constraint store, and
nothing persists it across a restart. The persistent constraint register
enforced at the dispatch gate remains the planned mitigation.

*2026-08-01:* taxonomy updated seven → six — Forgetful Context (the 2026-07
threat 7) merged back into Bloated Context (threat 6). Reading the daemon
established that the two are one failure with two presentations: the two-tier
context manager never executes (`_trim_root_history()` is reachable only from
`switch_mode()`'s root branch, which early-returns because the LLM never leaves
root mode), so a single config flag decides which face appears —
`RESET_HISTORY_AFTER_RESPONSE=false` (the default) grows history without bound
and crowds constraints out, `true` clears history while the summary that should
have carried constraints forward is empty. One dead code path, one threat. The
novelty claim is retained and re-scoped to context-lifecycle failure — both
saturation and non-persistence — as a security threat rather than a reliability
quirk, and the persistent constraint register becomes a threat-6 mitigation.
Also corrected here: the Bloated Context Mitigation section no longer claims the
daemon preserves a rolling summary across refreshes; that mechanism is
unreachable and the summary is never populated.

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
