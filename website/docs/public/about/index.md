# About BVM

BVM is a Bun version manager for Windows, macOS, and Linux.

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

> BVM is an independent Bun version manager for Windows, macOS, and Linux. It installs Bun, switches versions, isolates global tools per Bun version, and provides a repeatable setup path for both developers and AI clients.
