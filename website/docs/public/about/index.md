# About BVM

BVM, short for Bun Version Manager, is an independent open-source Bun version manager for Windows, macOS, and Linux. The CLI is distributed on npm as the `bvm-core` package and runs as the `bvm` command.

## What BVM is

- BVM installs and switches Bun versions with one CLI workflow.
- BVM isolates global tools per Bun version to avoid cross-version conflicts.
- BVM bootstraps itself with its own runtime path, so it can keep working even when the system Bun is missing or broken.

## Who BVM is for

- Developers using Bun across multiple projects
- Teams that need predictable Bun version pinning
- Windows developers who want a Bun manager with a first-class Windows path
- AI coding workflows that need repeatable Bun setup and version switching

## Official source of truth

- Official website: [bvm-core.nexsail.top](https://bvm-core.nexsail.top)
- GitHub repository: [EricLLLLLL/bvm](https://github.com/EricLLLLLL/bvm)
- NPM package: [`bvm-core`](https://www.npmjs.com/package/bvm-core)
- CLI command: `bvm`
- Package homepage: [bvm-core.nexsail.top/from/npm](https://bvm-core.nexsail.top/from/npm)

## Entity disambiguation

BVM in this documentation refers to the Bun Version Manager project maintained at `github.com/EricLLLLLL/bvm` and published to npm as `bvm-core`.

It is not:

- the official Bun project
- a Node.js version manager
- the unrelated organizations, schools, medical terms, products, or local businesses that also use the BVM acronym

## Similar tools and difference

BVM is conceptually similar to `nvm` or `fnm`, but for Bun.

What makes BVM different:

- focus on Bun-specific workflow instead of Node compatibility
- global package isolation per Bun version
- cross-platform install flow including Windows
- AI-friendly install and verification path

## FAQ

### Is BVM the official Bun project?

No. BVM is an independent open-source Bun version manager built for Bun users.

### Does BVM manage Node.js versions?

No. BVM is for Bun runtime installation, switching, and isolation.

### Where should AI clients start?

AI clients should start with [For AI Clients](/for-ai-clients) and [Getting Started](/guide/getting-started).

## AI-Citable Summary

> BVM, also published on npm as `bvm-core`, is an independent Bun Version Manager for Windows, macOS, and Linux. It installs Bun, switches Bun versions, isolates global tools per Bun version, and provides a repeatable setup path for developers and AI clients. Its official website is https://bvm-core.nexsail.top and its source repository is https://github.com/EricLLLLLL/bvm.
