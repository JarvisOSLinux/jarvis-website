// Plain-English names and lines for /servers, keyed by registry id. A server
// missing here still shows, with its registry name and the first sentence of
// its summary (see `describe` in src/pages/servers.astro).
export const serverCopy: Record<string, { name?: string; line: string }> = {
  "com.github.yakupatahanov.jarvis-shell-mcp": {
    name: "Shell",
    line: "Run commands as you, no password needed.",
  },
  "com.github.yakupatahanov.jarvis-shell-system-mcp": {
    name: "Shell as root",
    line: "Run commands as root after your password: updates, installs, services.",
  },
  "com.github.yakupatahanov.mcp.system-status": {
    line: "Battery, CPU, memory, disk and temperatures, and whatever is wrong right now.",
  },
  "com.github.yakupatahanov.mcp.computer-use-linux": {
    name: "Computer Use",
    line: "See and use the windows on your KDE Plasma desktop: read, click and type.",
  },
  "org.modelcontextprotocol.server-filesystem": {
    name: "Files",
    line: "Find, read, edit and organize your files.",
  },
  "com.github.yakupatahanov.mcp.mpris": {
    name: "Media Control",
    line: "Play, pause, skip and set the volume in whatever is playing.",
  },
  "com.github.yakupatahanov.mcp.email": {
    name: "Email",
    line: "Search, read and send email from your own account, with any provider.",
  },
  "com.github.jarvisoslinux.mcp.microsoft-365": {
    line: "Outlook mail and calendar, OneDrive, To Do and OneNote, with a Microsoft sign-in.",
  },
  "com.github.jarvisoslinux.mcp.telegram": {
    name: "Telegram",
    line: "Send yourself messages and files on Telegram, and read your replies.",
  },
  "com.github.jarvisoslinux.mcp.discord": {
    name: "Discord",
    line: "Read and post in your Discord servers through your own bot.",
  },
  "io.github.korotovsky.slack-mcp-server": {
    name: "Slack",
    line: "Read channels and post messages in Slack.",
  },
  "com.github.yakupatahanov.mcp.caldav": {
    name: "Calendar (CalDAV)",
    line: "See and change your events and reminders on any CalDAV calendar.",
  },
  "com.github.jarvisoslinux.mcp.notion": {
    line: "Search, read and edit your Notion pages and databases.",
  },
  "io.github.cyanheads.obsidian-mcp-server": {
    name: "Obsidian",
    line: "Read, write and search the notes in your Obsidian vault.",
  },
  "io.github.fangmd.time-mcp": {
    name: "Time",
    line: "The current time, to the second.",
  },
  "org.modelcontextprotocol.server-sequential-thinking": {
    name: "Sequential Thinking",
    line: "Helps the AI work a hard problem through one step at a time.",
  },
  "com.github.jarvisoslinux.mcp.news": {
    line: "Today's headlines, and recent stories on any topic from around the world.",
  },
  "com.github.jarvisoslinux.mcp.wikipedia": {
    line: "Search and read Wikipedia in any language, and what happened on this day.",
  },
  "io.github.brave.brave-search-mcp-server": {
    name: "Brave Search",
    line: "Search the web, news, images and videos with Brave Search.",
  },
  "io.github.erodenn.fetch-guard": {
    line: "Read any web page, with defenses against instructions hidden in it.",
  },
  "io.github.microsoft.playwright-mcp": {
    line: "Open pages in a real browser, click through them and fill in forms.",
  },
  "com.github.yakupatahanov.mcp.weather": {
    name: "Weather",
    line: "Current weather, forecasts and air quality, anywhere.",
  },
  "com.github.jarvisoslinux.mcp.currency": {
    name: "Currency",
    line: "Exchange rates for about 160 currencies, today's or any past day's.",
  },
  "com.github.jarvisoslinux.mcp.maps": {
    name: "Maps",
    line: "Find places, see what's nearby and get routes by car, bike or foot.",
  },
  "com.github.yakupatahanov.mcp.comfyui": {
    name: "ComfyUI",
    line: "Make images on your own computer with Stable Diffusion.",
  },
  "io.github.ahujasid.blender-mcp": {
    name: "Blender",
    line: "Build and change 3D scenes in Blender by asking.",
  },
  "io.github.czlonkowski.n8n-mcp": {
    name: "n8n",
    line: "Build and run n8n workflow automations.",
  },
  "com.github.jarvisoslinux.mcp.github": {
    name: "GitHub",
    line: "Repos, issues, pull requests and search. Sign in from the browser, no token to paste.",
  },
  "io.github.missionsquad.mcp-github": {
    name: "GitHub (token)",
    line: "Repos, files, issues and pull requests, with a GitHub token.",
  },
  "io.github.uneco.mcp-git-polite": {
    line: "Stage changes line by line and write commits in your Git repositories.",
  },
  "io.github.eduresser.sqlite-mcp": {
    name: "SQLite",
    line: "Look inside a SQLite database and query it.",
  },
  "io.github.homeassistant-ai.ha-mcp": {
    name: "Home Assistant",
    line: "Control your lights, sensors and automations in Home Assistant.",
  },
};
