// GitHub is read when the site is built, so a visitor's browser never calls it.
// null when the API is unreachable, rate-limited or answers anything but 200;
// pages render their fallback then.
export async function github(path: string): Promise<any | null> {
  try {
    const res = await fetch(`https://api.github.com/${path}`, {
      headers: { Accept: "application/vnd.github+json" },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}
