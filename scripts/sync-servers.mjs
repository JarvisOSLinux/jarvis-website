// Writes src/data/servers.json, the list /servers shows, from the JARVIS MCP
// registry: each server's title and tagline (the registry's copy for people),
// its category, and how many of its tools run on their own and how many wait
// for the user, read from its manifest's threat levels. Test fixtures and
// revoked entries are left out. Runs before every build (npm's prebuild).
// Offline, or with GitHub failing, it keeps the file already there, so a build
// never depends on the network. JARVIS_REGISTRY_URL points it at another
// registry.json, such as a branch under review.
import { mkdir, readFile, writeFile } from "node:fs/promises";

const REGISTRY =
  process.env.JARVIS_REGISTRY_URL ||
  "https://raw.githubusercontent.com/JarvisOSLinux/mcp-registry/main/registry.json";
const OUT = new URL("../src/data/servers.json", import.meta.url);

// The registry's test fixtures and calculator examples carry `fixture`, and a
// deprecated or removed entry is on its way out; neither is for someone
// looking for a tool.
const listed = (entry) =>
  entry.fixture !== true && !["deprecated", "removed"].includes(entry.trustStatus);

async function json(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

function toolLevels(manifest) {
  const levels = { safe: 0, elevated: 0, dangerous: 0, forbidden: 0 };
  for (const tool of manifest.tools ?? []) {
    const level = tool.threat_level ?? (tool.confirmation_required ? "dangerous" : "safe");
    if (level in levels) levels[level] += 1;
  }
  return levels;
}

async function sync() {
  const registry = await json(REGISTRY);
  const entries = Object.entries(registry.servers).filter(([, e]) => listed(e));
  const servers = await Promise.all(
    entries.map(async ([id, e]) => ({
      id,
      name: e.name,
      summary: e.summary,
      title: e.title,
      tagline: e.tagline,
      category: (e.categories ?? ["other"])[0],
      trust: e.trustStatus,
      scope: e.scope,
      platforms: e.platforms ?? [],
      homepage: e.homepage,
      tools: toolLevels(await json(e.manifest)),
    })),
  );
  servers.sort((a, b) => a.name.localeCompare(b.name));
  return { updated: registry.updated, synced: new Date().toISOString(), servers };
}

// The same registry with only a new `synced` time is left alone, so a build or a
// deploy doesn't leave the checkout with a modified servers.json.
async function unchanged(data) {
  try {
    const kept = JSON.parse(await readFile(OUT, "utf8"));
    return kept.updated === data.updated && JSON.stringify(kept.servers) === JSON.stringify(data.servers);
  } catch {
    return false;
  }
}

try {
  const data = await sync();
  if (await unchanged(data)) {
    console.log(`servers.json: ${data.servers.length} servers, unchanged in the registry`);
  } else {
    await mkdir(new URL(".", OUT), { recursive: true });
    await writeFile(OUT, JSON.stringify(data, null, 2) + "\n");
    console.log(`servers.json: ${data.servers.length} servers from the registry`);
  }
} catch (err) {
  try {
    const kept = JSON.parse(await readFile(OUT, "utf8"));
    console.warn(`servers.json not refreshed (${err.message}); keeping the ${kept.servers.length} from ${kept.synced}`);
  } catch {
    console.error(`servers.json: no registry and no saved copy (${err.message})`);
    process.exit(1);
  }
}
