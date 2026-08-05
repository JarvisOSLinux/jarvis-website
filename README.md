# JARVIS OS — Website

The official website for [JARVIS OS](https://jarvisoslinux.org), an Arch Linux-based AI-native operating system built as a research project at Washington State University (WSU Everett).

## About JARVIS OS

JARVIS OS is a research platform studying the security implications of granting LLMs OS-level privileges. It combines Arch Linux, KDE Plasma 6, Ollama for local LLM inference by default (the daemon is model-agnostic — OpenAI-compatible API providers can join the automatic failover pool), and an MCP (Model Context Protocol) orchestration layer that lets the AI autonomously manage system tools with sudo access.

The project's academic contribution is a six-threat taxonomy derived from hands-on experience building and operating the system — including the novel finding of **bloated context**: security constraints do not survive the context lifecycle, whether crowded out of a saturated context window or never durably stored at all, so a context refresh loses them structurally. This is the first identification of context-lifecycle failure as a discrete security threat rather than a reliability quirk.

## Website

This site is built with [Astro](https://astro.build) and deployed to a VPS at `jarvisoslinux.org` via the `./deploy` script (rsync over SSH; requires a `.env` with `VPS_USER`/`VPS_HOST`/`VPS_DIR` — see `env.example`). It uses the GitHub API client-side to pull live release data and contributor lists — no build-time secrets required. A small Python contact-form handler (`server/contact_handler.py`, deployed by `./deploy` as a systemd service) is the only server-side piece.

### Pages

| Route | Description |
|---|---|
| `/` | Hero, features overview, architecture diagram, download CTA |
| `/download` | Latest ISO release, its SHA-512 checksum (read from the release's `.sha512`/`SHA512SUMS` asset or notes), and install instructions |
| `/subsystems` | Component breakdown with links to each repo |
| `/research` | Threat taxonomy, SURCA poster, methodology |
| `/docs` | Getting started, build system walkthrough |
| `/contributors` | Team and GitHub API contributor list |

### Local development

```bash
npm install
npm run dev        # start dev server
npm run build      # production build
npm run preview    # preview production build
```

## Related repositories

| Repo | Description |
|---|---|
| [jarvisos](https://github.com/JarvisOSLinux/jarvisos) | AI-native distro + 9-script build pipeline |
| [Project-JARVIS](https://github.com/JarvisOSLinux/Project-JARVIS) | AI assistant daemon (LLM orchestration, TUI) |
| [dispatch](https://github.com/JarvisOSLinux/dispatch) | Signal-driven task orchestrator |
| [dmcp](https://github.com/JarvisOSLinux/dmcp) | MCP server lifecycle manager |
| [contextor](https://github.com/JarvisOSLinux/contextor) | Persistent memory store |
| [mcp-registry](https://github.com/JarvisOSLinux/mcp-registry) | Community-vetted MCP server catalog |
| [jarvisos-app](https://github.com/JarvisOSLinux/jarvisos-app) | Desktop GUI widget (Rust + CXX-Qt + Qt6/QML) |
| [linux-jarvisos](https://github.com/JarvisOSLinux/linux-jarvisos) | Custom kernel with `/dev/jarvis` character device drivers |

## License

See [LICENSE](LICENSE) for details.

## Changelog — corrected claims

*2026-08-01:* taxonomy updated seven → six — forgetful context merged back into bloated context. The two were presentations of one failure: the daemon's two-tier context manager never executes, so a single config flag decides whether constraints are crowded out of a growing history or cleared away with it. The novelty claim is retained and re-scoped to context-lifecycle failure (saturation and non-persistence).

*2026-07-22:* deployment corrected to VPS rsync via `./deploy` (not GitHub Pages); site link fixed to jarvisoslinux.org; GitHub API usage scoped to releases + contributors (no repo stats) and the contact-form handler noted; download-page checksum claim corrected; model posture updated to local-first/model-agnostic; taxonomy updated to seven threats (Bloated + Forgetful Context); jarvisos-app and linux-jarvisos added to the repo table.
