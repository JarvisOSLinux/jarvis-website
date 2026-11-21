---
title: What JARVIS Can Do
description: Everything beyond the security model — the work it does, the tools it finds, phone and voice, your choice of model, and more.
category: Getting Started
order: 3
---

JARVIS's main point is in [How JARVIS Protects Your Data](/docs/how-jarvis-protects-you). This page
covers everything else.

## It does the work

Ask a chatbot to install something and you get commands to copy, a password to type and a question
to answer. Ask JARVIS and it gets done. It only stops to check with you.

Some things to ask, and the tool that does each:

| Ask | Tool |
|-----|------|
| "Update my system" / "Install VLC" | Shell as root |
| "What's eating my memory?" | System Status |
| "Did my professor email me back?" | Email, Microsoft 365 |
| "What's on my calendar tomorrow?" | Microsoft 365, CalDAV |
| "Sort my Downloads folder" | Files |
| "Pause the music" | Media Control |
| "Turn off the living room lights" | Home Assistant |
| "Add this to my Obsidian notes" | Obsidian |
| "What are my open pull requests?" | GitHub |
| "Open this page and fill in the form" | Playwright Browser |
| "Send this to my Telegram" / "Post it in our Slack" | Telegram, Slack |
| "Make me a wallpaper of a foggy forest" | ComfyUI |
| "What's the weather this weekend?" | Weather |

## It finds its own tools

JARVIS starts with none of these tools. The first time you ask, it finds the right one in the
[registry](/servers), installs it and carries on. Next time it's already there. Every tool is reviewed
and rated before it's listed.

## Walk away

Open JARVIS on your phone and pick up where you left off: watch it work, answer its questions,
approve a step or stop it. Your phone reaches your computer over your own Tailscale network.

## Your choice of model

- Pick a model and JARVIS downloads it and runs it with llama.cpp.
- Or plug in any OpenAI-compatible API, free tiers included.
- List several and JARVIS uses them in order, moving down the list when one runs out of credits, is
  rate-limited or goes offline. Keep hosted ones off the list if nothing should leave your computer.
- Change models while it runs, with no restart.

## Just say "Hey JARVIS"

Talk to it hands-free. Listening and speaking both run on your computer, offline.

## Ask the next thing right away

JARVIS works on more than one request at a time, so you don't wait for the first to finish.

## Gets better at your tools

Once a task works, it can write itself a how-to for that tool, so the next time goes right the first
time.
