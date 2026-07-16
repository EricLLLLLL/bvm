---
title: 架构
description: BVM 内部架构、安装流程和发布机制的参考文档，供贡献者和 AI 代理使用。
---

# BVM Architecture Map

This is an orientation map for the current design. Verify mutable details against the checked-out repository before acting.

## Contents

1. Runtime model
2. Installation surfaces
3. CLI structure
4. Shims and shell integration
5. Registry and artifact flow
6. Upgrade flow
7. Tests and release
8. Current review hotspots

## 1. Runtime model

BVM keeps two distinct concepts under `BVM_DIR`:

- `runtime/<version>` stores physical Bun runtimes managed by BVM.
- `runtime/current` points to the private Bun runtime that executes BVM.
- `versions/<version>` exposes installed versions to user-facing version management.
- `current` points to the user's active Bun version.
- `aliases/` stores named version targets, including the default alias.
- `src/`, `bin/`, and `shims/` contain the installed CLI core and command proxies.

The private host runtime and active user runtime must remain independently replaceable.

## 2. Installation surfaces

The supported installation surfaces are:

- `install.sh` for POSIX environments.
- `install.ps1` for Windows PowerShell.
- `scripts/postinstall.js` for npm or Bun package installation.

They share behavioral contracts:

1. Resolve BVM package metadata through an npm-compatible registry.
2. Require SHA-512 integrity metadata and verify the downloaded archive.
3. Reject BVM-owned shims as bootstrap runtimes.
4. Establish the private runtime and active-version links or junctions.
5. install the CLI core and platform shims inside `BVM_DIR`.
6. Configure PATH with deterministic BVM precedence.
7. Preserve the official Bun installation and unrelated user files.

The scripts are platform-specific implementations. Keep behavior aligned through contract tests and generated templates rather than forcing textual duplication.

## 3. CLI structure

- `src/index.ts` is the composition root and command registration surface.
- `src/cli/app.ts` parses arguments, validates options, dispatches handlers, and centralizes top-level error reporting.
- `src/commands/` contains command behavior.
- `src/api.ts` owns registry and release metadata access.
- `src/utils/` contains focused utilities; `src/utils.ts` still contains shared filesystem helpers.
- `src/command-runner.ts` standardizes progress and failure presentation.

The current handler contract is equivalent to:

```ts
type CliFlags = Record<string, boolean | string | undefined>;
type ActionHandler = (args: string[], flags: CliFlags) => Promise<void> | void;
```

Keep parsing and routing small. Move reusable behavior into commands or focused utilities only when it has a clear owner.

## 4. Shims and shell integration

Generated templates live under `src/templates/` and are exported to `dist/` during build.

Shims provide command routing and version isolation. Complex routing may start Bun and execute a JavaScript shim, so avoid unverified zero-latency claims.

Shell configuration uses standardized markers:

```text
# >>> bvm initialize >>>
# <<< bvm initialize <<<
```

The block is kept at the end of the relevant shell configuration file to preserve PATH precedence. Windows persists PATH through user environment settings and may additionally update the PowerShell profile.

## 5. Registry and artifact flow

BVM uses npm-compatible registry metadata for BVM packages and Bun runtime packages. `src/utils/registry-selector.ts` owns the shared candidate model, versioned health cache, ranking, and explicit-source precedence. Automatic mode ranks npmmirror, Tencent Cloud's npm mirror, and npmjs. Metadata and archive failures advance through that ordered list.

`BVM_REGISTRY` and `BVM_DOWNLOAD_MIRROR` select one authoritative custom source. Explicit mode does not silently fall back to the public catalog. `bvm network` reads the cached ranking; `bvm network test` refreshes connectivity and latency data.

Published BVM artifacts are available through:

- The `bvm-core` npm package, which includes `dist/index.js`, platform shims, installers, and postinstall logic.
- GitHub Release attachments for the immutable release tag.
- The website install function, which resolves the published version and serves the tagged installer.

Git tags do not currently contain generated `dist/` files. Do not construct GitHub jsDelivr `dist/` URLs from a tag.

## 6. Upgrade flow

`src/commands/upgrade.ts` supports two paths:

- Package-manager installation: execute a global npm or Bun package upgrade using the selected registry.
- Standalone installation: read the latest npm release metadata, download the package tarball, then replace the CLI core and the applicable platform shim.

The standalone path updates `index.js`, the Unix shim on POSIX, or the JavaScript shim on Windows. It then refreshes shell configuration. Verify extraction, integrity, rollback, and cleanup behavior when changing this path.

## 7. Tests and release

The current CI matrix covers Ubuntu, macOS, and Windows. POSIX-heavy suites and native Windows suites are intentionally separated. Linux additionally runs coverage and package-content validation.

The local `release` script prepares files only. The production workflow publishes an npm version that does not already exist, creates an immutable tag, uploads GitHub Release assets, triggers the npm mirror, and purges npm jsDelivr caches.

Inspect these files for current behavior:

- `package.json`
- `.github/workflows/ci.yml`
- `.github/workflows/auto-release.yml`
- `scripts/release.ts`
- `test/release_contract.test.ts`

## 8. Current review hotspots

These are review targets, not pre-approved refactors:

- `src/commands/setup.ts` combines migration, shell discovery, POSIX profile editing, Windows environment persistence, and PowerShell profile work.
- `src/commands/install.ts` combines resolution, download retries, progress reporting, extraction, activation, and shell setup.
- `scripts/postinstall.js` repeats parts of installer policy outside the typed source tree.
- `src/utils.ts` remains a mixed shared-helper module beside the focused `src/utils/` directory.
- Installer parity depends on tests and generation conventions rather than a single shared implementation.
- Architecture documentation and skills can drift from the release workflow unless mutable facts are re-verified.

Before extracting modules, map callers and tests. Prefer ownership boundaries that reduce repeated policy without introducing a framework layer.
