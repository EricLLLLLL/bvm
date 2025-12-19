# BVM · Bun Version Manager

> The native version manager for Bun. Cross-platform, zero-dependency, and works out of the box.

![License](https://img.shields.io/github/license/EricLLLLLL/bvm)
![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm)
![Bun](https://img.shields.io/badge/Written%20in-Bun-f472b6)

## ✨ Core Features

*   ⚡ **Native & Fast**: Written in Bun, runs on Bun. No Node.js required.
*   📦 **Zero Dependency**: No `node_modules` hell. The core logic is just ~37KB.
*   🌍 **Cross-Platform**: Supports macOS (x64/arm64), Linux (x64/arm64), and Windows (PowerShell).
*   🚀 **Smart Install**: 
    *   Automatically downloads a private Bun runtime if you don't have one.
    *   **Optimization**: Instantly copies local files if you try to install the version matching the current runtime.
*   🧠 **Full-Featured**: `install`, `use`, `run`, `exec`, `alias`, `.bvmrc` support, and more.
*   🛡️ **Conflict Detection**: Automatically detects and helps resolve conflicts with global Bun installations.

## 🛠️ How it Works

BVM uses a **Shim-based Architecture** to provide nearly instant version switching without polluting your global environment. It automatically detects your project's `.bvmrc`, supports session-specific overrides, and isolates global packages per Bun version.

---

## 🚀 Quick Start

### macOS / Linux / WSL

```bash
curl -fsSL https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.sh | bash
```

After installation, run the `source` command displayed in your terminal to activate.

---

## 📖 Command Reference

### Basic

| Command | Description |
| :--- | :--- |
| `bvm i <version>` | Install a specific version (e.g., `1.3.4`, `latest`) |
| `bvm use <version>` | Switch the active version immediately (all terminals) |
| `bvm default <version>` | Set the global default version (for new terminals) |
| `bvm shell <version>` | Switch version for the current terminal session only |
| `bvm ls` | List installed versions and aliases |
| `bvm current` | Show currently active version and its source |
| `bvm uninstall <v>` | Uninstall a version (protected if active/default) |

### Advanced

| Command | Description |
| :--- | :--- |
| `bvm run <v> <args>` | Run a command with a specific version temporarily |
| `bvm exec <v> <cmd>` | Execute any command in a specific version's environment |
| `bvm alias <n> <v>` | Create a version alias |
| `bvm rehash` | Regenerate shims for global tools |
| `bvm upgrade` | Self-update BVM to the latest version |
| `bvm doctor` | Diagnose environment issues |


## 📄 License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)