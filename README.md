# JARVIS OS — Website

The official website for [JARVIS OS](https://jarvisos.github.io), an Arch Linux-based AI-native operating system built as a research project at Washington State University (WSU Everett).

## About JARVIS OS

JARVIS OS is a research platform studying the security implications of granting LLMs OS-level privileges. It combines Arch Linux, KDE Plasma 6, Ollama for local LLM inference, and an MCP (Model Context Protocol) orchestration layer that lets the AI autonomously manage system tools with sudo access.

The project's academic contribution is a six-threat taxonomy derived from hands-on experience building and operating the system — including the novel finding of **bloated context**, where context-window saturation becomes a discrete security threat: the LLM silently drops previously stated security constraints mid-session.

## Website

This site is built with [Astro](https://astro.build) and deployed via GitHub Pages. It uses the GitHub API at runtime to pull live release data, contributor lists, and repo stats — no backend or build-time secrets required.

### Pages

| Route | Description |
|---|---|
| `/` | Hero, features overview, architecture diagram, download CTA |
| `/download` | Latest ISO release, SHA-512 checksum, install instructions |
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
| [jarvisos](https://github.com/JarvisOSLinux/jarvisos) | AI-native distro + 7-script build pipeline |
| [Project-JARVIS](https://github.com/JarvisOSLinux/Project-JARVIS) | AI assistant daemon (LLM orchestration, TUI) |
| [dispatch](https://github.com/JarvisOSLinux/dispatch) | Signal-driven task orchestrator |
| [dmcp](https://github.com/JarvisOSLinux/dmcp) | MCP server lifecycle manager |
| [contextor](https://github.com/JarvisOSLinux/contextor) | Persistent memory store |
| [mcp-registry](https://github.com/JarvisOSLinux/mcp-registry) | Community-vetted MCP server catalog |

## License

See [LICENSE](LICENSE) for details.
