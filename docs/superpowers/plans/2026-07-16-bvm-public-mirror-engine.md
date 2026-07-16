# BVM Public Mirror Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make reliable public-mirror selection, fallback, and diagnosis a first-class BVM subsystem for mainland China.

**Architecture:** Add a focused registry selector that returns ordered candidates and persists versioned health state. Route metadata, downloads, the network command, doctor, and every installer surface through the same behavioral contract while preserving platform-native implementations.

**Tech Stack:** TypeScript, Bun tests, Bash, PowerShell, CommonJS, npm-compatible metadata, SHA-512 SRI.

## Global Constraints

- Preserve private `runtime/current`, user `current`, `.bvmrc`, and global-package isolation semantics.
- Public candidates are npmmirror, Tencent npm mirror, and npmjs.
- `BVM_REGISTRY` and `BVM_DOWNLOAD_MIRROR` are authoritative and never silently fall back.
- Automatic mode retries one source once before advancing.
- All fallback URLs use the first accepted SHA-512 integrity value.
- Add no dependency, hosted service, telemetry, interactive configuration, offline bundle, or lockfile.
- Do not commit, push, tag, or publish without separate explicit authorization.

---

### Task 1: Registry selection and health state

**Files:**
- Create: `src/utils/registry-selector.ts`
- Modify: `src/utils/network-utils.ts`
- Modify: `test/network_utils.test.ts`

**Interfaces:**
- Produces `RegistryCandidate`, `RegistryHealth`, `RegistrySelection`, `testRegistries()`, `selectRegistries()`, and `recordRegistryResult()`.
- Preserves `getFastestRegistry()` as a compatibility wrapper returning `selection.candidates[0].url`.

- [ ] **Step 1: Write failing tests for cache order and explicit mode**

```ts
test('orders recent successful sources before slower candidates', async () => {
  const selection = await selectRegistries({
    cacheFile,
    now: () => 2_000,
    readCache: async () => ({
      version: 2,
      updatedAt: 1_500,
      registries: {
        npmmirror: { latencyMs: 80, lastSuccess: 1_500, lastFailure: null, consecutiveFailures: 0 },
        npmjs: { latencyMs: 250, lastSuccess: 1_400, lastFailure: null, consecutiveFailures: 0 },
      },
    }),
    probe: async () => { throw new Error('probe must not run'); },
  });
  expect(selection.candidates.map(item => item.id).slice(0, 2)).toEqual(['npmmirror', 'npmjs']);
});

test('uses only an explicit registry', async () => {
  const selection = await selectRegistries({ explicitRegistry: 'https://mirror.example/' });
  expect(selection.mode).toBe('explicit');
  expect(selection.candidates).toEqual([{ id: 'custom', url: 'https://mirror.example', priority: 0 }]);
});
```

- [ ] **Step 2: Verify RED**

Run: `bun test test/network_utils.test.ts`

Expected: FAIL because `selectRegistries` does not exist.

- [ ] **Step 3: Implement the selector**

```ts
export const REGISTRY_CANDIDATES: RegistryCandidate[] = [
  { id: 'npmmirror', url: 'https://registry.npmmirror.com', priority: 0 },
  { id: 'tencent', url: 'https://mirrors.cloud.tencent.com/npm', priority: 1 },
  { id: 'npmjs', url: 'https://registry.npmjs.org', priority: 2 },
];

export interface SelectRegistriesOptions {
  cacheFile?: string;
  forceRefresh?: boolean;
  explicitRegistry?: string | null;
  region?: 'cn' | 'global' | null;
  now?: () => number;
  probe?: (candidate: RegistryCandidate) => Promise<RegistryHealth>;
  readCache?: () => Promise<RegistryHealthCache | null>;
}

export interface RegistryHealthCache {
  version: 2;
  updatedAt: number;
  registries: Partial<Record<RegistryCandidate['id'], {
    latencyMs: number | null;
    lastSuccess: number | null;
    lastFailure: number | null;
    consecutiveFailures: number;
  }>>;
}
```

Normalize trailing slashes, use a version-2 cache with a 24-hour TTL, ignore malformed cache data, rank by failure count and latency, and retain a stale-success snapshot for diagnostics.

- [ ] **Step 4: Verify GREEN**

Run: `bun test test/network_utils.test.ts && bun run typecheck`

Expected: all network compatibility and selector tests PASS.

---

### Task 2: Ordered metadata and artifact fallback

**Files:**
- Modify: `src/api.ts`
- Modify: `src/commands/install.ts`
- Modify: `test/api_bun_distribution.test.ts`
- Modify: `test/download_robustness.test.ts`

**Interfaces:**
- Consumes `selectRegistries()`.
- Extends `BunDownloadInfo` with `urls: string[]` while retaining `url` and `mirrorUrl`.
- Produces `downloadFileFromCandidates(urls, destPath, spinner, version, integrity, options?)`.

- [ ] **Step 1: Write failing ordered-URL and fallback tests**

```ts
const FIXED_INTEGRITY = `sha512-${Buffer.alloc(64).toString('base64')}`;

test('returns ordered URLs with one fixed integrity', async () => {
  const info = await findBunDownloadUrl('1.3.11', {
    platform: 'linux',
    arch: 'x64',
    hasAvx2: true,
    select: async () => ({
      mode: 'automatic',
      candidates: [
        { id: 'npmmirror', url: 'https://a.example', priority: 0 },
        { id: 'npmjs', url: 'https://b.example', priority: 1 },
      ],
      health: [],
      cacheExpiresAt: null,
    }),
    fetchMetadata: async () => ({
      dist: {
        tarball: 'https://a.example/@oven/bun-linux-x64/-/bun-linux-x64-1.3.11.tgz',
        integrity: FIXED_INTEGRITY,
      },
    }),
  });
  expect(info?.urls).toHaveLength(2);
  expect(info?.integrity).toBe(FIXED_INTEGRITY);
});

test('advances after one retry', async () => {
  const attempts: string[] = [];
  await downloadFileFromCandidates(['https://a/file', 'https://b/file'], dest, null, 'v1', integrity, {
    download: async url => { attempts.push(url); if (url.includes('/a/')) throw new Error('reset'); },
    sleep: async () => {},
  });
  expect(attempts).toEqual(['https://a/file', 'https://a/file', 'https://b/file']);
});
```

- [ ] **Step 2: Verify RED**

Run: `bun test test/api_bun_distribution.test.ts test/download_robustness.test.ts`

Expected: FAIL because ordered URLs and source-aware fallback do not exist.

- [ ] **Step 3: Implement ordered metadata resolution**

Loop over selected candidates, accept the first response containing `dist.tarball` and `dist.integrity`, fix that integrity value, and construct equivalent tarball URLs for remaining registries using `getBunDownloadUrl()`. Route exact-version checks, dist tags, Bun runtime metadata, and BVM release metadata through the ordered selector.

- [ ] **Step 4: Implement source-aware download fallback**

Keep `downloadFileWithProgress()` as the one-URL primitive. Add the coordinator, delete partial files between sources, update health history, list all attempted sources in the final error, and keep the existing cache re-verification before extraction.

- [ ] **Step 5: Verify GREEN**

Run: `bun test test/api_bun_distribution.test.ts test/download_robustness.test.ts test/install_integrity_contract.test.ts && bun run typecheck`

Expected: all PASS and integrity verification still precedes extraction.

---

### Task 3: `bvm network`

**Files:**
- Create: `src/commands/network.ts`
- Create: `test/network_command.test.ts`
- Modify: `src/index.ts`

**Interfaces:**
- Produces `networkCommand(action?: string, options?)`.

- [ ] **Step 1: Write failing output and exit tests**

```ts
test('network test prints health and selection', async () => {
  const lines: string[] = [];
  await networkCommand('test', {
    select: async () => ({
      mode: 'automatic',
      candidates: [{ id: 'npmmirror', url: 'https://registry.npmmirror.com', priority: 0 }],
      health: [{
        id: 'npmmirror', url: 'https://registry.npmmirror.com', reachable: true,
        latencyMs: 86, checkedAt: 1_000,
      }],
      cacheExpiresAt: 86_401_000,
    }),
    write: line => lines.push(line),
  });
  expect(lines.join('\n')).toContain('npmmirror');
  expect(lines.join('\n')).toContain('Selected: https://registry.npmmirror.com');
});

test('fails when every source is unavailable', async () => {
  await expect(networkCommand('test', {
    select: async () => ({
      mode: 'automatic', candidates: [], cacheExpiresAt: null,
      health: [{
        id: 'npmjs', url: 'https://registry.npmjs.org', reachable: false,
        latencyMs: null, checkedAt: 1_000, error: 'timeout',
      }],
    }),
  })).rejects.toThrow('No registry is reachable');
});
```

- [ ] **Step 2: Verify RED**

Run: `bun test test/network_command.test.ts`

Expected: FAIL because the command is missing.

- [ ] **Step 3: Implement and register**

```ts
app.command('network [action]', 'Show or test Bun registry connectivity')
  .action(async args => { await networkCommand(args[0]); });
```

Accept only an absent action or `test`; format latency/status/mode/cache; force refresh only for `test`; throw when a forced test confirms all sources unavailable.

- [ ] **Step 4: Verify GREEN**

Run: `bun test test/network_command.test.ts test/integration.test.ts && bun run typecheck`

Expected: command and CLI routing tests PASS.

---

### Task 4: Mirror-aware doctor

**Files:**
- Modify: `src/commands/doctor.ts`
- Modify: `test/doctor_checks.test.ts`

**Interfaces:**
- Changes `DoctorCheckInput.networkReachable: boolean` to `network: { status: 'pass' | 'warn' | 'fail'; detail: string }`.

- [ ] **Step 1: Write failing domestic-mirror tests**

```ts
test('passes when npmmirror works and npmjs fails', () => {
  const check = getCheck('network', buildDoctorChecks({
    bvmDir: '/tmp/.bvm', bvmDirExists: true, pathHasShims: true, pathHasBin: true,
    shellType: 'zsh', shellRaw: '/bin/zsh', directoryWritable: true, osPlatform: 'linux',
    network: { status: 'pass', detail: 'npmmirror reachable; npmjs unavailable' },
  }));
  expect(check.status).toBe('pass');
  expect(check.detail).toContain('npmmirror');
});
```

- [ ] **Step 2: Verify RED**

Run: `bun test test/doctor_checks.test.ts`

Expected: FAIL because doctor still accepts a Boolean npmjs probe.

- [ ] **Step 3: Replace the hard-coded npmjs check**

Use fresh selector health. PASS if any current probe succeeds, WARN if fresh probes fail but stale success exists, FAIL otherwise. Set remediation to `bvm network test` and print `bvm config registry auto` as the downstream Bun-registry repair.

- [ ] **Step 4: Verify GREEN**

Run: `bun test test/doctor_checks.test.ts test/misc.test.ts && bun run typecheck`

Expected: PASS and no hard-coded npmjs ping remains in doctor.

---

### Task 5: Installer surface parity

**Files:**
- Modify: `install.sh`
- Modify: `install.ps1`
- Modify: `scripts/postinstall.js`
- Create: `test/public_mirror_contract.test.ts`
- Modify: `test/install_integrity_contract.test.ts`
- Modify: `test/postinstall_logic.test.ts`

**Interfaces:**
- Every surface uses the same three public candidates, explicit override precedence, fallback, and SHA-512 contract.

- [ ] **Step 1: Write failing cross-surface contracts**

```ts
for (const file of ['install.sh', 'install.ps1', 'scripts/postinstall.js']) {
  test(`${file} exposes every public candidate`, () => {
    const source = read(file);
    expect(source).toContain('registry.npmmirror.com');
    expect(source).toContain('mirrors.cloud.tencent.com/npm');
    expect(source).toContain('registry.npmjs.org');
  });
}
```

Also assert `BVM_REGISTRY` precedence and that SHA-512 verification remains before extraction.

- [ ] **Step 2: Verify RED**

Run: `bun test test/public_mirror_contract.test.ts test/install_integrity_contract.test.ts`

Expected: FAIL because Tencent and explicit override behavior are not present everywhere.

- [ ] **Step 3: Align platform installers**

Use a one-entry candidate list in explicit mode. In automatic mode, order domestic candidates first for the `cn` hint and npmjs first otherwise. Continue after metadata/download failure, preserve the first accepted integrity, and keep local-install/test hooks unchanged.

- [ ] **Step 4: Align postinstall and verify**

Add Tencent, normalize URLs, preserve direct behavioral exports used by tests, then run:

`bun test test/public_mirror_contract.test.ts test/install_integrity_contract.test.ts test/postinstall_logic.test.ts test/postinstall_failure_contract.test.ts`

Expected: all PASS. If `pwsh` exists, parse `install.ps1` with the PowerShell language parser and require zero syntax errors.

---

### Task 6: Documentation and final verification

**Files:**
- Modify: `README.md`
- Modify: `website/docs/index.md`
- Modify: `website/docs/zh/index.md`
- Modify: `website/docs/guide/getting-started.md`
- Modify: `website/docs/zh/guide/getting-started.md`
- Modify: `website/docs/zh/guide/architecture.md`
- Modify: relevant website documentation tests.

**Interfaces:**
- Documents `bvm network`, fallback, explicit overrides, and separation of BVM artifact source from Bun package source.

- [ ] **Step 1: Write failing documentation expectations**

Assert generated public Markdown contains `bvm network test` and no longer claims installers fetch BVM core from GitHub-tagged jsDelivr `dist/` paths.

- [ ] **Step 2: Verify RED**

Run: `bun test website/test/*.test.ts`

Expected: FAIL until canonical docs are updated and regenerated.

- [ ] **Step 3: Update canonical documentation**

Use this positioning consistently:

```text
BVM is a Bun version manager optimized for mainland China. It automatically selects reachable public mirrors, verifies downloads, and isolates each Bun version.
```

Document `bvm network`, `bvm network test`, and `BVM_REGISTRY=https://registry.npmmirror.com bvm install 1.3.11`. Correct stale jsDelivr/GitHub-tag architecture claims to npm-compatible metadata resolution.

- [ ] **Step 4: Regenerate docs and run full verification**

Run the canonical website build, which performs both documentation sync and AI-document generation, then run repository verification:

```bash
bun --cwd website run build
bun run verify
bun x tsc --noEmit -p tsconfig.json --noUnusedLocals --noUnusedParameters
git diff --check
```

Expected: unit, isolated, integrity, type, unused-code, and whitespace checks PASS.

- [ ] **Step 5: Audit the final tree**

Inspect status, diff stat, generated artifacts, installer candidate strings, and package contents. Do not stage, commit, push, tag, or publish without explicit authorization.
