# BVM · Bun Version Manager

> **The Native, Atomic, and High-Performance Manager for Bun.**
> Built *with* Bun, *for* Bun. Speed-optimized for global developers.

[![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![Size](https://img.shields.io/badge/size-45kb-green)](#)
[![Bun](https://img.shields.io/badge/Native-Bun-000?logo=bun)](#)
[![Chinese](https://img.shields.io/badge/文档-中文-blue.svg)](./README.zh-CN.md)

**BVM** (Bun Version Manager) is a next-generation environment orchestration tool. Unlike traditional managers that merely swap environment variables, BVM provides an **atomic, self-healing, and zero-overhead** ecosystem designed to be the physical limit of performance.

---

## ⚡ Performance Duel (Benchmark)

We benchmarked BVM against the industry standards. The results are clear: BVM eliminates the "Shell Tax" imposed by legacy tools.

| Metric | **BVM (v1.x)** | **bum** (Rust) | **nvm** (Node) | **Analysis** |
| :--- | :--- | :--- | :--- | :--- |
| **Shell Startup Lag** | **0ms** | 0ms | **497ms** | NVM requires sourcing a massive shell script on every new terminal. BVM and Bum use Shims/PATH, resulting in zero lag. |
| **Runtime Overhead** | **0ms** (Global) | <1ms | 0ms | **BVM Global Mode uses physical symlinks.** The OS executes `bun` directly. Bum uses a binary proxy, which introduces a negligible but non-zero overhead. |
| **CLI Response** | ~27ms | **~7ms** | ~500ms | Rust binaries (Bum) are faster for CLI commands (`ls`, `install`). BVM runs on the Bun runtime, which is incredibly fast but has a tiny boot cost. |
| **Install Size** | **~45KB** | ~5MB | ~100KB | BVM leverages the existing Bun runtime, keeping the core logic microscopic. |

> *Benchmark Environment: MacBook Pro M1, macOS 14. Tested via `scripts/vs-competitors.ts`.*

---

## 🏛️ Deep Dive: Why BVM?

### 1. The "Bunker" Architecture (Private Runtime)
**The Problem**: Many version managers (like `pip`, `npm`, `gem`) depend on the very runtime they manage. If you break your system Node/Python, you break your version manager.
**The BVM Solution**: BVM maintains a **private, atomic Bun runtime** (`~/.bvm/runtime`). It is completely decoupled from your user-installed versions. You can `rm -rf` every installed version, and BVM will still work perfectly to repair them.

### 2. Physical Symlinks vs Binary Proxies
**The Problem**: Most modern managers (fnm, voltan, bum) use a "Binary Proxy" approach. When you run `node`, you are actually running a Rust/Go binary that calculates which version to use, then spawns the real process.
**The BVM Solution**: BVM uses **Hybrid Routing**.
*   **Global Mode**: We use **OS-level Symlinks**. When you run `bun`, the kernel points directly to the executable. **0 CPU cycles** are spent on "routing".
*   **Project Mode**: Only when a `.bvmrc` is present do we engage our high-performance Shell Shim (<10ms).

### 3. Environment-Level Atomic Isolation
**The Problem**: Switching versions often leaves global packages (`bun install -g`) in a mess. Packages from v1.0.0 might accidentally be accessible in v1.1.0, causing "Ghost Conflicts".
**The BVM Solution**: BVM injects `BUN_INSTALL` into the execution environment. Each version has a strictly isolated global store.

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
