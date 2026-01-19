# BVM — Bun Version Manager

<div align="center">
  <a href="https://bvm-core.pages.dev">
    <img src="https://bvm-core.pages.dev/logo.svg" alt="BVM Logo" width="180" height="180" />
  </a>

  <h3 align="center">The Native, Zero-Dependency Version Manager for Bun</h3>

  <p align="center">
    <a href="https://bvm-core.pages.dev"><strong>Official Website & Documentation »</strong></a>
    <br />
    <br />
    <a href="./README.zh-CN.md">🇨🇳 中文文档</a>
    ·
    <a href="https://github.com/EricLLLLLL/bvm/issues">Report Bug</a>
    ·
    <a href="https://github.com/EricLLLLLL/bvm/discussions">Request Feature</a>
  </p>

  <p align="center">
    <a href="https://github.com/EricLLLLLL/bvm/releases">
      <img src="https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest" alt="Release" />
    </a>
    <a href="https://github.com/EricLLLLLL/bvm/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/EricLLLLLL/bvm?color=orange" alt="License" />
    </a>
    <a href="#">
      <img src="https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue" alt="Platform" />
    </a>
  </p>
</div>

---

## ⚡ Quick Install

BVM uses a smart installation script that automatically detects your OS and network environment (selecting the fastest registry for China/Global users).

### Method 1: NPM (Recommended for Node.js users)
```bash
npm install -g bvm-core
```

### Method 2: Shell Script (macOS / Linux)
```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### Method 3: PowerShell (Windows)
```powershell
irm https://bvm-core.pages.dev/install | iex
```

---

## Key Features

- **🚀 Zero Latency**: Shim-based design ensures ~0ms shell startup overhead.
- **🛡️ Bunker Architecture**: BVM manages its own isolated Bun runtime, ensuring stability even if your system Bun is broken or missing.
- **🛡️ Atomic Isolation**: Each Bun version has its own global package directory. No more conflicts.
- **🌏 Smart Mirroring**: Automatically detects your region and picks the fastest registry (npmmirror/npmjs).
- **📦 Zero Dependency**: BVM bootstraps itself. No pre-requisites required (it can reuse your system Bun or download its own).

---

## Usage

### Basic Commands

*   `bvm install latest`: Install the latest stable version of Bun.
*   `bvm install 1.1.0`: Install a specific version.
*   `bvm use 1.1.0`: Switch the active Bun version immediately.
*   `bvm default 1.1.0`: Set a global default version for new shell sessions.
*   `bvm ls`: List all locally installed versions.
*   `bvm ls-remote`: List all available versions from the registry.
*   `bvm uninstall 1.1.0`: Remove a specific version.
*   `bvm upgrade`: Upgrade BVM itself to the latest version.

### Running Commands

You can run a command with a specific Bun version without switching your global environment:
```bash
bvm run 1.0.30 index.ts
```

### Aliases

Create custom names for specific versions:
```bash
bvm alias prod 1.1.0
bvm use prod
```

### Configuration (.bvmrc)

BVM supports automatic version switching via `.bvmrc` files. Create a file named `.bvmrc` in your project root:

```bash
echo "1.1.0" > .bvmrc
```

---

## Design Philosophy

### ArchSense (Self-Bootstrapping)
BVM does not ship with heavy pre-compiled binaries. Instead, it uses **Bun to manage Bun**. The installer downloads a minimal Bun runtime to serve as BVM's execution engine, ensuring the manager itself is always running on the most optimized environment.

### Atomic Isolation
Unlike managers that only switch the `PATH`, BVM performs **Filesystem-level Locking**. It dynamically injects a unique `BUN_INSTALL` path for every version, ensuring that global packages installed in one version never conflict with another.

---

## License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)