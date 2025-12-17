
export function valid(version: string): string | null {
  // Relaxed regex to allow versions like '1.2.3' and 'v1.2.3'
  // and simple validation
  if (!version) return null;
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/);
  return match ? version : null;
}

export function clean(version: string): string | null {
    const v = valid(version);
    return v ? v.replace(/^v/, '') : null;
}

function parse(version: string) {
  if (!version) return null;
  const v = version.replace(/^v/, '');
  const core = v.split(/[-+]/)[0];
  const parts = core.split('.').map(Number);
  
  if (parts.length === 0 || parts.some(p => isNaN(p))) return null;

  const prerelease = v.includes('-') ? v.split('-')[1].split('+')[0] : undefined;
  return { major: parts[0], minor: parts[1], patch: parts[2], pre: prerelease };
}

export function compare(v1: string, v2: string): number {
  const p1 = parse(v1);
  const p2 = parse(v2);
  if (!p1 || !p2) return 0;

  if (p1.major !== p2.major) return p1.major - p2.major;
  if (p1.minor !== p2.minor) return p1.minor - p2.minor;
  if (p1.patch !== p2.patch) return p1.patch - p2.patch;
  
  // Prerelease handling (simplified: pre-release < release)
  if (p1.pre && !p2.pre) return -1;
  if (!p1.pre && p2.pre) return 1;
  if (p1.pre && p2.pre) return p1.pre.localeCompare(p2.pre);
  
  return 0;
}

export function rcompare(v1: string, v2: string): number {
  return compare(v2, v1);
}

export function gt(v1: string, v2: string): boolean {
  return compare(v1, v2) > 0;
}

export function gte(v1: string, v2: string): boolean {
    return compare(v1, v2) >= 0;
}

export function lt(v1: string, v2: string): boolean {
    return compare(v1, v2) < 0;
}

export function lte(v1: string, v2: string): boolean {
    return compare(v1, v2) <= 0;
}

export function satisfies(version: string, range: string): boolean {
    if (range === '*' || range === '' || range === 'latest') return true; // Added empty string and latest

    const v = parse(version);
    if (!v) return false;

    let cleanRange = range;
    if (range.startsWith('v')) cleanRange = range.substring(1);

    // Exact match for 1.2.3, v1.2.3
    if (clean(version) === clean(range)) return true;

    // Handle ranges like '1', '1.2'
    const parts = cleanRange.split('.');
    if (parts.length === 1) { // range '1'
        const major = Number(parts[0]);
        if (v.major === major) return true;
    } else if (parts.length === 2) { // range '1.2'
        const major = Number(parts[0]);
        const minor = Number(parts[1]);
        if (v.major === major && v.minor === minor) return true;
    }

    // Handle '~' (tilde): same major and minor, patch >= base.patch
    if (range.startsWith('~')) {
        const base = parse(range.substring(1));
        if (!base) return false;
        const basePatch = base.patch ?? 0;
        return v.major === base.major && v.minor === base.minor && v.patch >= basePatch;
    }

    // Handle '^' (caret)
    if (range.startsWith('^')) {
         const base = parse(range.substring(1));
         if (!base) return false;

         const basePatch = base.patch ?? 0;
         const baseMinor = base.minor ?? 0;

         if (base.major === 0) { // ^0.2.3 := >=0.2.3 <0.3.0
             if (v.major !== 0) return false;
             if (v.minor !== baseMinor) return false;
             return v.patch >= basePatch;
         }
         // ^1.2.3 := >=1.2.3 <2.0.0
         if (v.major !== base.major) return false;
         if (v.minor < baseMinor) return false;
         if (v.minor === baseMinor && v.patch < basePatch) return false;
         return true;
    }
    
    // Fallback for more complex ranges or invalid ones
    return false;
}

export function maxSatisfying(versions: string[], range: string): string | null {
    const matching = versions.filter(v => satisfies(v, range));
    return matching.sort(rcompare)[0] || null;
}
