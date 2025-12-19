# BVM · Bun Version Manager

> **The NVM for Bun.** 
> Native, fast, and opinionated version manager built *with* Bun, *for* Bun.

![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)
![License](https://img.shields.io/github/license/EricLLLLLL/bvm)
![Size](https://img.shields.io/badge/size-42kb-green)
![Bun](https://img.shields.io/badge/Written%20in-Bun-000000?logo=bun)

**BVM** is to Bun what **nvm** is to Node.js, but faster and simpler. It solves the chaos of managing multiple Bun versions across projects, ensuring you always use the exact version your project needs.

---

## ⚡ Why BVM? (Comparison)

Why use BVM over manual installation or other tools?

| Feature | **BVM** | **nvm** (Node) | **bum** / others |
| :--- | :--- | :--- | :--- |
| **Technology** | **Native Bun** (TypeScript) | Shell Script | Rust / Go |
| **Startup Speed** | **Instant** (<2ms shim) | Slow (Shell parsing) | Fast |
| **Dependencies** | **Zero** (Self-bootstrapped) | None | None |
| **Architecture** | **Smart Shims** (Path-free) | Path Injection | Symlink |
| **Global Tools** | **Isolated per Version** | Shared / Messy | Mixed |
| **Cross-Platform**| ✅ macOS, Linux, Windows | ❌ Unix only | ✅ |
| **Auto-Compat** | ✅ `yarn`/`npm` auto-linked | ❌ Manual | ❌ |

### 💡 The "Inception" Architecture
BVM is unique because it is **written in Bun itself**.
*   **Self-Hosting**: It downloads a tiny, private Bun runtime to bootstrap itself.
*   **Zero Node.js**: It doesn't depend on Node, Python, or Rust.
*   **Tiny Footprint**: The entire CLI is compiled into a single **42KB** executable.

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

## ✨ Key Features

*   **⚡ Smart Shims**: Automatically routes commands (`bun`, `bunx`) to the correct version based on `.bvmrc`, environment variables, or your shell session.
*   **🔗 Auto-Compatibility**: Automatically creates shims for `yarn`, `npm`, `pnpm` inside each Bun version, so you can use them instantly without global installs.
*   **🔄 Auto-Update**: Checks for BVM updates in the background (non-blocking) and notifies you only when necessary.
*   **📦 Project-Aware**: Recursively searches for `.bvmrc` to switch versions automatically when you `cd` into a project.
*   **🛡️ Global Isolation**: Global packages installed via `bun install -g` are isolated to that specific Bun version.

---

## 📖 Cheat Sheet

### Everyday Use

| Command | Action |
| :--- | :--- |
| `bvm i <version>` | Install a version (e.g., `1.3.5`, `latest`) |
| `bvm use <version>` | Switch version globally & immediately |
| `bvm ls` | List installed versions |
| `bvm ls-remote` | List available versions from GitHub |

### Project Management

| Command | Action |
| :--- | :--- |
| `bvm shell <version>`| Switch version *only* for current terminal |
| `bvm current` | Check active version and why (e.g., `.bvmrc`) |
| `echo "1.3.5" > .bvmrc` | Pin version for your project |

### Maintenance

| Command | Action |
| :--- | :--- |
| `bvm upgrade` | Update BVM to the latest version |
| `bvm rehash` | Regenerate shims (fixes broken paths) |
| `bvm doctor` | Diagnose environment issues |
| `bvm uninstall <v>` | Remove an old version |

---

## ❓ FAQ

**Q: How does it work without Node?**
A: BVM installs a standalone Bun binary in `~/.bvm/runtime` solely for running the BVM CLI. Your project's Bun versions are installed separately in `~/.bvm/versions`.

**Q: Can I use it with NVM?**
A: Yes! BVM manages Bun, NVM manages Node. They live happily together.

---

## 📄 License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)
