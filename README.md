# BVM — Bun Version Manager

BVM is a high-performance environment orchestrator designed for the Bun ecosystem. It leverages an **ArchSense (Self-Bootstrapping)** architecture, delivered via a **Global CDN (jsDelivr)** for instant availability. While providing a near-zero latency terminal experience, it maintains strict physical isolation between environments.

[![Version](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![License](https://img.shields.io/github/license/EricLLLLLL/bvm?color=orange)](#)
[![Platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue)](#)

<a href="./README.zh-CN.md">🇨🇳 中文文档</a>

---

## Table of Contents

- [About](#about)
- [Installation](#installation)
  - [Install Script](#install-script)
  - [Verify Installation](#verify-installation)
  - [Manual Update](#manual-update)
- [Usage](#usage)
  - [Basic Commands](#basic-commands)
  - [Running Commands](#running-commands)
  - [Aliases](#aliases)
- [Configuration](#configuration)
  - [.bvmrc](#bvmrc)
- [Design Philosophy](#design-philosophy)
  - [ArchSense (Self-Bootstrapping)](#archsense-self-bootstrapping)
  - [Smart Registry Racing](#smart-registry-racing)
  - [Atomic Isolation](#atomic-isolation)
- [Technical Audit](#technical-audit)
- [Environment Variables](#environment-variables)
- [License](#license)

---

## About

BVM was engineered to solve the common pitfalls of traditional version managers: shell startup lag and environment leakage. By utilizing **NTFS Junctions/Unix Symlinks** and dynamic path injection, BVM ensures that your global packages and Bun runtimes remain perfectly isolated and instantly available.

---

## Installation

BVM provides several installation channels. Choose the one that best fits your network environment:

### 1. Fast Installation (Recommended for China 🇨🇳)
Downloads the full package directly from the mirror registry. This method **does not depend on CDN sync** and is available seconds after release.

**macOS / Linux / WSL:**
```bash
curl -L https://registry.npmmirror.com/bvm-core/-/bvm-core-1.1.4.tgz | tar -xz && bash package/install.sh
```

**Windows (PowerShell):**
```powershell
curl.exe -L https://registry.npmmirror.com/bvm-core/-/bvm-core-1.1.4.tgz -o bvm.tgz; tar -xf bvm.tgz; ./package/install.ps1
```

---

### 2. CDN Installation
Install via global CDNs. Note: there might be a few minutes of cache delay after a new release.

#### jsDelivr (Recommended)
**macOS / Linux / WSL:**
```bash
curl -fsSL https://cdn.jsdelivr.net/npm/bvm-core/install.sh | bash
```
**Windows (PowerShell):**
```powershell
irm https://cdn.jsdelivr.net/npm/bvm-core/install.ps1 | iex
```

#### unpkg
**macOS / Linux / WSL:**
```bash
curl -fsSL https://unpkg.com/bvm-core/install.sh | bash
```
**Windows (PowerShell):**
```powershell
irm https://unpkg.com/bvm-core/install.ps1 | iex
```

---

### 3. Developer Installation (GitHub Raw)
Get the latest script directly from the source repository.

**macOS / Linux / WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.ps1 | iex
```

---

## Verification

After installation, restart your terminal or source your profile, then verify:


### Manual Update

If you already have BVM installed, you can upgrade to the latest version using the built-in command:
```bash
bvm upgrade
```

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

---

## Configuration

### .bvmrc

BVM supports automatic version switching via `.bvmrc` files. Create a file named `.bvmrc` in your project root containing the version number:

```bash
echo "1.1.0" > .bvmrc
```

Once configured, any `bun` command executed within that directory (or its subdirectories) will automatically use the specified version.

---

## Design Philosophy

### ArchSense (Self-Bootstrapping)
BVM does not ship with heavy pre-compiled binaries. Instead, it uses **Bun to manage Bun**. The installer downloads a minimal Bun runtime to serve as BVM's execution engine, ensuring the manager itself is always running on the most optimized environment.

### Smart Registry Racing
BVM eliminates the need for manual mirror configuration. It identifies your location via Cloudflare Trace and concurrently "races" multiple registries (Official NPM, Taobao, Tencent) to pick the lowest-latency endpoint for your current network.

### Atomic Isolation
Unlike managers that only switch the `PATH`, BVM performs **Filesystem-level Locking**. It dynamically injects a unique `BUN_INSTALL` path for every version, ensuring that global packages installed in one version never conflict with another.

---

## Technical Audit

| Metric | **BVM** | **bum** | **nvm** |
| :--- | :--- | :--- | :--- |
| **Shell Init Overhead** | **~9ms (Near-Zero)** | < 5ms | ~500ms (Blocking) |
| **Shim Latency** | **~8ms (Pure Bash/JS)** | ~20ms | ~100ms (Func Trap) |
| **Core Footprint** | **~50 KB (JS)** | ~5 MB (Binary) | ~100 KB (Scripts) |
| **Windows Support** | **Native Junctions** | Partial | No (WSL Only) |

---

## Environment Variables

BVM respects the following environment variables:

*   `BVM_DIR`: The directory where BVM stores its data (Default: `~/.bvm`).
*   `BVM_REGISTRY`: Force a specific NPM registry for downloads.
*   `BVM_MIRROR`: (Legacy) Fallback mirror URL.

---

## License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)
