# Easter Egg Pages — Content Spec

The easter egg pages (`/freedom-control` and `/ai-control`) are linked from the
presentation's closing slide: "Which reality do you choose? A or B." Audience
members scan a QR code and land on one of these pages.

---

## /freedom-control (Choice A — "AI Working With You")

**Theme**: Green (#00e676), hopeful, empowering
**Tone**: Measured optimism — not utopian, but structurally grounded

### Hero
- Tag: CHOICE A
- Heading: AI Working **With** You
- Subtitle: A future where AI is a tool, not a master. Technology amplifies
  human agency rather than replacing it.

### Visual
- GIF/image: Something representing freedom, openness, collaboration.
  Currently a soaring eagle (acceptable but generic — could be upgraded).

### Content Cards
1. **Local & Transparent AI** — runs on your hardware, no data leaves your
   machine, you own your compute and outputs.
2. **User-Controlled Permissions** — AI asks before it acts. Every access is
   explicit, logged, revocable. TLA system enforces this.
3. **Open Research & Accountability** — threats studied in the open. The
   seven-threat taxonomy is published. Community audits what you run.
4. **AI Amplifies, Not Replaces** — augments decisions, executes tasks you
   specify, stops when you say stop. Human remains the locus of judgment.

### Verdict Quote
> "Freedom is not the absence of AI — it is AI that remains answerable to
> the people who use it."

### Links
- "Read the Research" → /research
- (No link to Choice B from here — Choice A is the destination)

---

## /ai-control (Choice B — "AI Working On You")

**Theme**: Red (#ff3b5c), oppressive, confrontational
**Tone**: Direct, factual, urgent — not fearmongering, but unflinching

### Hero
- Tag: CHOICE B
- Heading: AI Working **On** You
- Subtitle: A future where AI is deployed against you — harvesting behavior,
  manufacturing desires, selling sovereignty.

### Visual
- **NEEDS REPLACEMENT** — current Big Brother GIF is too meme-like for the tone.
- Target: abstract, dark illustration — puppeteer pulling strings on human
  figurines, or similar concept of invisible control.
- The image slot is a `<img>` inside `.gif-frame.gif-frame-red`. Replace the
  `src` attribute and update the alt text and credit line.

### Alert Banner
- Tag: ACTIVE THREAT
- "This is not a hypothetical. These systems are already deployed at scale."

### Content Cards — UPDATE TO MATCH SEVEN-THREAT TAXONOMY

Current cards (OUTDATED):
1. Mass Data Harvesting ← keep, reword
2. Behavioral Manipulation at Scale ← keep, reword
3. Opaque Privilege Escalation ← maps to threats 4+5
4. Forgetful Context ← keep — now Threat 7 in its own right; add a separate
   Bloated Context card (Threat 6)
5. Unverified MCP Servers ← maps to threat 1
6. Regulatory Capture ← keep (social/political framing)

**Updated cards should be:**

1. **Mass Data Harvesting** — corporate AI sees everything: files, commands,
   conversations. Your intellectual output is the product.

2. **Malicious & Misleading Tools** — AI agents install and run third-party
   tools with no integrity checks. A tool with a helpful description and
   malicious code is indistinguishable to the model. (Threats 1+3)

3. **Unauthorized Privilege Escalation** — the AI requests sudo, chains
   privileged operations beyond the original scope, and the user never
   explicitly authorized it. (Threats 4+5)

4. **Prompt Injection** — external content (web pages, documents, tool
   outputs) can override the AI's instructions. Without structural separation
   of instruction and data planes, the attack is invisible. (Threat 2)

5. **Bloated Context** — the AI doesn't disobey security constraints. They
   get crowded out. Context window saturation silently drops earlier
   instructions. This is a security threat, not a reliability problem.
   (Threat 6)

6. **Forgetful Context** — worse than forgetting: the constraint was never
   durably stored. The AI has no persistent record of the rules you set, so
   a context refresh loses them structurally — nothing needed to go wrong.
   (Threat 7)

7. **Regulatory Capture** — big tech writes safety frameworks. Compliance
   costs exclude open alternatives. The future of AI is enclosed behind
   paywalls and terms of service. (Social/political framing)

### Verdict Quote
> "When AI has OS-level privilege and you have no visibility into what it
> does — you are not using a tool. You are inside one."

### Links
- "Read the Threat Taxonomy" → /research
- "Switch to Choice A" → /freedom-control

---

## Implementation Notes

- Both pages use `BaseLayout` from `src/layouts/BaseLayout.astro`
- CSS is scoped per-page (Astro `<style>` blocks)
- Cards use the existing `.message-card` + `.card-green` / `.card-red` pattern
- GIF/image is inside `.gif-frame` with `.gif-frame-green` or `.gif-frame-red`
- The pages are "easter eggs" — not linked from the main nav. Accessed via
  direct URL or QR code from the presentation.

---

## Changelog — corrected claims

*2026-07-22:*

- Taxonomy count updated six → seven per the 2026-07 split of Bloated Context
  and Forgetful Context into distinct threats (see `CLAUDE.md` and the live
  `/research` page). The /ai-control card list now carries both: Bloated
  Context (Threat 6, constraints crowded out) and Forgetful Context (Threat 7,
  constraints never durably stored).
