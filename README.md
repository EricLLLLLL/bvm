# BVM · Bun Version Manager

> **The NVM for Bun.** 
> Native, Atomic, and High-Performance version manager built *with* Bun, *for* Bun.

[![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![Size](https://img.shields.io/badge/size-42kb-green)](#)
[![Bun](https://img.shields.io/badge/Native-Bun-000?logo=bun)](#)

**BVM** (Bun Version Manager) is an environment orchestration tool designed for developers who demand peak performance. Moving beyond the limitations of traditional managers that only tweak environment variables, BVM provides an **atomic, self-healing** solution for your development ecosystem.

---

## ⚡ Why BVM? (Comparison)

BVM was engineered from the ground up to solve the slow initialization of `nvm` and the isolation weaknesses of traditional tools.

| Dimension | **BVM (Our Project)** | **nvm** (Node) | **bum / fnm** (Rust) |
| :--- | :--- | :--- | :--- |
| **Shell Startup Lag** | **0ms** (Shim-based) | **500ms+** (Full sourcing) | **0ms** |
| **Resolution Speed** | **~7ms** (Recursive logic) | ~50ms+ | <5ms |
| **Core Logic Size** | **42KB** (Minified JS) | ~100KB (Shell) | ~5MB+ (Binary) |
| **Survivability** | ✅ **Atomic (Built-in Runtime)** | ❌ Script-dependent | ❌ Binary-dependent |
| **Package Isolation** | ✅ **Atomic (BUN_INSTALL)** | ❌ PATH only | ❌ Shared Global |
| **Auto-Align Tools** | ✅ **Intelligent Linker** | ❌ Manual reinstall | ❌ |

---

## 🏛️ Advanced Architecture

### 1. Atomic Private Runtime (Bunker Architecture)
BVM employs a **"Bunker"** architecture, maintaining an independent, minimal Bun environment in `~/.bvm/runtime`.
*   **Atomic Survival**: BVM’s operation is entirely decoupled from the lifecycle of the Bun versions it manages. Even if you uninstall every managed Bun version, BVM remains rock-solid and ready to install or repair your environment.
*   **Instant Ready**: When you install BVM, it automatically bootstraps itself and **installs the latest stable Bun for you**. One `curl`, dual readiness—you get the manager and a production-ready Bun environment instantly.

### 2. Hybrid Path Routing
We refuse to compromise between performance and flexibility, utilizing a "Split Routing" strategy:
*   **Global Mode (0ms Overhead)**: When running `bvm use`, BVM modifies physical OS symlinks. Execution speed hits the **physical limit of the OS**, with zero proxy overhead.
*   **Smart Project Mode (<10ms)**: The Shim script uses a high-performance recursive algorithm to locate `.bvmrc`, intervening only when necessary to ensure a seamless "cd-and-switch" experience.

### 3. Environment-Level Atomic Isolation
Unlike traditional managers that only modify `PATH`, BVM injects the `BUN_INSTALL` environment variable directly into the execution chain.
*   **Determinism**: This ensures global packages (`bun install -g`) are physically stored in a directory unique to that specific Bun version. It completely eliminates "Ghost Conflicts" where different versions pollute each other's global scope.

### 4. Intelligent Toolchain Alignment
BVM deeply understands Bun's compatibility layer. The `rehash` mechanism automatically detects and aligns your toolchain:
*   **Logic**: It creates `yarn`, `npm`, and `pnpm` symlinks pointing to `bun` within the version's bin directory.
*   **Principle**: "User-First" priority. It only provides compatibility links if the tools are missing, never overwriting your manual global installations, ensuring maximum environment stability.

---

## 🚀 Quick Start

### macOS / Linux / WSL

```bash
curl -fsSL https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.sh | bash
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
| `bvm use 1.3.5` | Switch global version (immediate effect) |
| `bvm ls` | List installed versions and aliases |
| `bvm current` | Show active version source (.bvmrc / Env / Alias) |
| `bvm upgrade` | Update BVM itself (built-in async check) |

---

## 📄 License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)

---

**BVM - Built with Bun, for the fastest developers on earth.**
