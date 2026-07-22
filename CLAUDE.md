# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview
This is the official website for **JARVIS OS**, an Arch Linux-based AI-native operating system
built as a research project at **Washington State University (WSU Everett)** by Yakup Atahanov and
co-author Toufic Majdaleni, under a WSU research grant. The project is presented at
**SURCA** (Showcase for Undergraduate Research and Creative Activities — 2026, Winner, Gray Grant) and
is heading toward a full academic paper.

## Commands
```bash
npm install
npm run dev        # start Astro dev server
npm run build      # production build to dist/
npm run preview    # preview production build
./deploy           # build + rsync dist/ and server/contact-handler to VPS (needs .env, see env.example)
```
No test suite, linter, or type-check script is configured. `tsconfig.json` extends Astro's strict
preset, so run `npx astro check` if you want type diagnostics — it isn't wired into a script.

## Architecture
- **Astro** static site (`output: "static"` in `astro.config.mjs`), custom domain `jarvisoslinux.org`.
- Top-level routes are flat files under `src/pages/*.astro`. The `/docs` section is the exception:
  docs pages are Markdown in `src/content/docs/` (a content collection defined in
  `src/content.config.ts` with title/description/category/order frontmatter), rendered through
  `src/pages/docs/[...slug].astro` + `src/layouts/DocsLayout.astro`, with `src/pages/docs/index.astro`
  as the section landing page.
- Shared chrome: `src/layouts/BaseLayout.astro` (head/meta/OG/JSON-LD + `Nav`/`Footer`) wraps every
  page via `<slot />`; page-specific `<script slot="head" type="application/ld+json">` adds per-page
  schema.org JSON-LD.
- Reusable pieces live in `src/components/` (`Nav`, `Footer`, `SubsystemCard`, `ThreatCard`).
- **GitHub API calls are client-side, not build-time**: `download.astro` and `contributors.astro`
  fetch `api.github.com` from a plain `<script>` tag that runs in the visitor's browser after page
  load (see `fetchRelease()` / `fetchContributors()`), with an inline fallback UI if the fetch fails.
  There is no SSG-time data fetching and no GitHub token — these are unauthenticated client requests
  subject to GitHub's anonymous rate limit.
- Styling is a single global stylesheet (`src/styles/global.css`) with CSS custom properties — no
  component-scoped styling system, no Tailwind.
- **Deployment is a bare-metal VPS via rsync + SSH, not GitHub Pages** — despite the org name, there
  is no `.github/workflows/` deploy pipeline. The `deploy` script reads `VPS_USER`/`VPS_HOST`/`VPS_DIR`
  from `.env` (see `env.example`), builds, rsyncs `dist/`, and also pushes a `server/contact_handler.py`
  + systemd unit for a contact-form handler — note the `server/` directory this references is not
  present in this repo checkout.

## Research core — seven-threat taxonomy
`docs/RESEARCH-SPEC.md` is the single source of truth for all research content on the site;
`docs/EASTER-EGG-SPEC.md` is the spec for the `/freedom-control` and `/ai-control` pages. Empirically
identified through building and operating JARVIS OS. **As of 2026-07, this is seven threats** —
Bloated Context and Forgetful Context were split into two distinct entries; verify against the
`jarvisos` repo README (canonical status lives in `Project-JARVIS/docs/SECURITY-ARCHITECTURE.md`
upstream) before changing this count again, since it has moved before.

| # | Threat | Status / Primary Mitigation |
|---|--------|--------------------|
| 1 | Malicious MCP Servers | Community-vetted AUR-style registry |
| 2 | Prompt Injection | Cryptographic Boundary Protocol |
| 3 | Misleading MCP Server Usage | Registry vetting + structured tool schema |
| 4 | Unauthorized Sudo Requests via MCP | TLA system + PolicyKit enforcement |
| 5 | Sudo Capability Exploitation | TLA + goal-scoped confirmation |
| 6 | Bloated Context | Partial — dispatch rolling window + contextor pruning; persistent constraint preservation across context refreshes not implemented |
| 7 | Forgetful Context (novel) | Not yet mitigated — no persistent constraint register in the daemon; highest-priority open item |

Three privilege escalation stages: (1) user-level, (2) sudo-enabled, (3) web-enabled.

**Framing rules for copy/content (do not violate):**
- **Bloated Context** ≠ **Forgetful Context** — they are separate, adjacent threats. Bloated Context
  is constraints getting crowded out of a full context window (partially mitigated). Forgetful
  Context is the daemon never durably storing constraints in the first place (unmitigated, the
  standout novel finding — first identification of this as a security threat rather than a
  reliability quirk).
- "Misinterpreted MCP Keyword Search" is subsumed by "Misleading MCP Server Usage."
- "Unintended File Modification/Deletion" is a consequence of threats 4+5, not a root cause.
- The academic contribution is the **platform + taxonomy + mitigations**, not just the software.
  Traditional OS security models are inadequate for probabilistic AI agents — this is the thesis.
- Project is research-first, product-second. "Built for people, not corporations." Open source is
  a structural necessity, not a preference.

## Design language (established — match it, don't reinvent it)
- Dark theme: `#07090f` background, `#00c8ff` cyan accent, `#f0a500` gold for warnings.
- Fonts: `Chakra Petch` (headings), `DM Mono` (code/labels), `DM Sans` (body).
- Grid overlay background, scan line animations, bordered cards.
- Severity labels: Critical (red), High (gold), Medium (cyan), Novel (green).
- Tone: technical, research-credible, not marketing fluff.

## GitHub org structure
Each `/subsystems` card links to a repo under the `JarvisOSLinux` org:
```
github.com/JarvisOSLinux/
├── jarvisos              ← AI-native distro (Arch base + kernel + 7-script build pipeline)
├── Project-JARVIS        ← AI assistant daemon (Python, LLM orchestration, TUI)
├── dispatch               ← Rust signal-driven parallel task orchestrator
├── dmcp                   ← Rust MCP server lifecycle manager (dual-scope: user/system)
├── contextor              ← Rust persistent memory store (vector search, session summaries)
├── mcp-registry           ← community-vetted MCP server catalog
├── jarvisos-app           ← desktop GUI widget (Rust + CXX-Qt + Qt6/QML)
├── linux-jarvisos         ← custom kernel with /dev/jarvis character device drivers
└── jarvisos-website       ← this repo
```
