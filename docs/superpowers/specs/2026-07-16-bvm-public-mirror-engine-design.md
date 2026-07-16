# BVM Public Mirror Engine Design

Date: 2026-07-16
Status: Approved design, pending implementation

## Product goal

BVM's primary product promise is reliable Bun installation and use in mainland China without requiring a proxy. Version selection, runtime isolation, and integrity verification support that promise.

This phase makes public-mirror support a first-class subsystem rather than a collection of installer-specific heuristics.

## Scope

This phase delivers:

- one registry candidate model for npmmirror, Tencent, npmjs, and an explicit custom registry;
- health checks and persisted source history;
- deterministic source selection with download fallback;
- `bvm network` and `bvm network test`;
- mirror-aware `bvm doctor` results;
- equivalent candidate and integrity contracts across the CLI, `install.sh`, `install.ps1`, and `scripts/postinstall.js`.

This phase does not deliver:

- a BVM-operated mirror or proxy;
- remote telemetry or a hosted health service;
- interactive configuration;
- offline bundle export/import;
- lockfiles or automatic runtime installation from the execution shim.

## Product behavior

### Automatic mode

In automatic mode, BVM resolves candidates in this order:

1. a valid recent health cache, ordered by recent success and latency;
2. a concurrent health check of the public candidates when the cache is absent or stale;
3. a deterministic default order if all health checks fail.

`BVM_REGION=cn` and `BVM_REGION=global` influence only the deterministic initial order. A location probe never overrides observed reachability.

### Explicit registry mode

`BVM_REGISTRY` and `BVM_DOWNLOAD_MIRROR` are authoritative. When either is supplied, BVM uses only that URL and reports a clear failure instead of silently switching to another provider.

These environment variables control BVM metadata and runtime artifact downloads. The registry in `~/.bunfig.toml` controls later package installations performed by Bun. Automatic selection may update the generated per-version `bunfig.toml`, but a user-pinned Bun registry is not silently reinterpreted as a BVM artifact override.

### Download fallback

For automatic mode, an artifact download retries the current source once after a short delay, then advances to the next candidate. Logs identify the source and each fallback.

The expected SHA-512 integrity value is fixed before the artifact download begins. Switching a tarball URL must not change the expected digest.

## Architecture

### Registry policy

The focused registry module owns:

```ts
interface RegistryCandidate {
  id: 'npmmirror' | 'tencent' | 'npmjs' | 'custom';
  url: string;
  priority: number;
}

interface RegistryHealth {
  id: RegistryCandidate['id'];
  url: string;
  reachable: boolean;
  latencyMs: number | null;
  checkedAt: number;
  error?: string;
}

interface RegistrySelection {
  mode: 'automatic' | 'explicit';
  candidates: RegistryCandidate[];
  health: RegistryHealth[];
  cacheExpiresAt: number | null;
}
```

Its public operations are:

```ts
testRegistries(options?): Promise<RegistryHealth[]>
selectRegistries(options?): Promise<RegistrySelection>
recordRegistryResult(url, result, options?): Promise<void>
```

Existing fetch timeout helpers remain separate from selection policy.

### Health state

The registry cache moves to a versioned structure:

```json
{
  "version": 2,
  "updatedAt": 1784188800000,
  "registries": {
    "npmmirror": {
      "latencyMs": 86,
      "lastSuccess": 1784188800000,
      "lastFailure": null,
      "consecutiveFailures": 0
    }
  }
}
```

The selector ignores malformed or unknown cache versions. A valid legacy cache may be migrated in memory; migration failure must cause a fresh health check rather than a command failure.

The cache TTL remains 24 hours. A failed artifact request updates source history so a repeatedly failing source loses priority before the TTL expires.

### Metadata and artifact resolution

Registry metadata lookup consumes the ordered candidate list. Exact-version checks, dist-tag lookup, Bun runtime metadata, BVM release metadata, and upgrades use the same selection result.

Artifact resolution returns an ordered list of URLs for the same package and version. The first accepted metadata response supplies the required SHA-512 digest. Every downloaded candidate is checked against that fixed digest before extraction.

### Installer parity

The typed CLI is the reference implementation. Platform installers may use simpler shell-native probes, but they must share these behavioral contracts:

- the same public candidate set;
- explicit registry precedence;
- at least one fallback in automatic mode;
- SHA-512 verification before extraction;
- no dependency on npmjs when a domestic mirror is healthy.

Contract tests verify these properties in all installation surfaces. Textual implementation identity is not required.

## CLI design

### `bvm network`

Prints the cached selection without forcing a refresh. When no usable cache exists, it performs normal automatic selection once:

```text
Registry          Latency    Status
npmmirror         86ms       PASS
Tencent           142ms      PASS
npmjs             timeout    FAIL

Selected: npmmirror
Mode: automatic
Cache: valid for 23h
```

### `bvm network test`

Forces fresh health checks, persists the result, and prints the same table. It exits successfully when at least one candidate is reachable and unsuccessfully when all candidates fail.

Explicit mode displays only the custom source and never probes public candidates.

## Doctor integration

`bvm doctor` replaces its hard-coded npmjs ping with a fresh registry health check.

Network status is:

- PASS when at least one selected candidate is reachable;
- WARN when the fresh check fails for every candidate but stale successful data is available;
- FAIL when every candidate fails and no earlier successful state is available.

The report includes the configured `bunfig.toml` registry. A healthy domestic mirror with an unreachable npmjs endpoint is a passing state.

Suggested remediation is:

```text
bvm network test
bvm config registry auto
```

## Error handling

- Timeout errors include the source ID and elapsed limit.
- Explicit source failure does not fall back silently.
- Automatic mode reports every attempted source in the final error.
- Corrupt health cache data is ignored and replaced after a successful check.
- Integrity mismatch deletes the partial artifact and continues only when another URL can be checked against the same digest.
- All-source failure leaves the previous runtime and active links unchanged.

## Verification

Implementation follows red-green-refactor. Required tests cover:

1. recent successful sources are preferred;
2. stale cache triggers a new health check;
3. malformed and legacy caches do not break selection;
4. an explicit source is authoritative;
5. an automatic download advances after one retry;
6. fallback retains the original SHA-512 digest;
7. doctor passes when a domestic mirror works and npmjs fails;
8. `bvm network test` exit behavior and output;
9. the candidate and integrity contracts of all installation surfaces;
10. existing installer, integration, release, and website tests remain green.

Installer and filesystem changes require the repository `verify` command, relevant E2E tests, PowerShell syntax validation when available, and a final diff/integrity audit.

## Delivery sequence

1. Introduce registry selection types and red tests.
2. Implement versioned health state and selection.
3. Route API metadata operations through ordered candidates.
4. Add source-aware download fallback.
5. Add the network command.
6. Integrate doctor.
7. align shell, PowerShell, and postinstall contracts.
8. Update public documentation and generated documentation sources.
9. Run focused and full verification.

## Compatibility constraints

The work must not change:

- the meaning of `runtime/current` or user `current`;
- `.bvmrc` resolution;
- per-version global package isolation;
- current npm package names or public installation commands;
- the requirement to resolve artifacts from npm-compatible metadata and verify SHA-512 before extraction.
