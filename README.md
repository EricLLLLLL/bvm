# BVM · Bun Version Manager

> **The Native, Atomic, and High-Performance Manager for Bun.**
> Built *with* Bun, *for* Bun. Speed-optimized for global developers.

[![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![Size](https://img.shields.io/badge/size-45kb-green)](#)
[![Bun](https://img.shields.io/badge/Native-Bun-000?logo=bun)](#)
[![Chinese](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh-CN.md)

**BVM** (Bun Version Manager) is a next-generation environment orchestration tool. Unlike traditional managers that merely swap environment variables, BVM provides an **atomic, self-healing, and zero-overhead** ecosystem designed to be the physical limit of performance.

---

## ⚡ Why BVM?

BVM was engineered to eliminate shell startup lag and environment pollution.

### Competitor Comparison

| Dimension | **BVM (v1.x)** | **nvm** (Node) | **fnm / asdf / proto** |
| :--- | :--- | :--- | :--- |
| **Language** | **TypeScript (Bun)** | Bash / POSIX | Rust / Go / C++ |
| **Shell Startup Lag** | **0ms** (Instant) | **500ms+** (Sourcing) | **0ms** |
| **Resolution Speed** | **~7ms** | ~50ms+ | <5ms |
| **Survivability** | ✅ **Atomic (Bunker)** | ❌ Script-dependent | ❌ Binary-dependent |
| **Global Package Isolation**| ✅ **Full (`BUN_INSTALL`)**| ❌ Shared PATH | ❌ Often Shared |
| **China Friendly** | ✅ **Native NPM Mirror** | ❌ Manual Config | ❌ Manual Config |

---

## 🏛️ Core Pillars of Architecture

### 1. The "Bunker" Architecture (Private Runtime)
BVM is "unbreakable". It maintains its own minimal Bun environment in `~/.bvm/runtime`.
*   **Decoupled Lifecycle**: BVM's operation is independent of the managed versions. Even if you wipe all user-installed Bun versions, BVM remains functional.
*   **Zero Dependency**: No need for system Node.js, Python, or Rust. One `curl` gets you everything.

### 2. Hybrid Path Routing (0ms Overhead)
We refuse to compromise between speed and flexibility:
*   **Global Mode**: Uses physical OS symlinks (`~/.bvm/current`). Execution speed hits the **physical limit of the OS** with zero proxy overhead.
*   **Project Mode**: A high-performance Shim script detects `.bvmrc` with negligible overhead, providing a seamless "cd-and-switch" experience.

### 3. Atomic Environment Isolation
BVM explicitly manages the `BUN_INSTALL` variable for every execution chain.
*   **Physical Isolation**: Global packages (`bun install -g`) are stored in directories unique to each Bun version. No more "Ghost Conflicts" or polluted global scopes.

### 4. Global High-Speed Distribution (NPM-First)
BVM implements a sophisticated NPM-first download strategy:
*   **Global Access**: Uses `registry.npmjs.org` via Cloudflare CDN for reliable global access.
*   **China Acceleration**: Automatically detects and switches to `registry.npmmirror.com` (Aliyun CDN) for domestic users. No more GitHub download timeouts.

---

## 🚀 Installation

### macOS / Linux / WSL (Recommended)

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.ps1 | iex
```

---

## 📖 Command Reference

| Command | Description |
| :--- | :--- |
| `bvm i latest` | Install the latest stable Bun version |
| `bvm use 1.1.34` | Switch global version (immediate effect) |
| `bvm ls` | List installed versions and aliases |
| `bvm current` | Show active version source (.bvmrc / Env / Alias) |
| `bvm default 1.1.20`| Set the default version for new shells |
| `bvm upgrade` | Update BVM itself via JSDelivr/GitHub |

---

## 📄 License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)

---

**BVM - Built with Bun, for the fastest developers on earth.**