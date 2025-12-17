# BVM · Bun Version Manager

> The native version manager for Bun. Cross-platform, zero-dependency, and works out of the box.

![License](https://img.shields.io/github/license/bvm-cli/bvm)
![Release](https://img.shields.io/github/v/release/bvm-cli/bvm)
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

---

## 🚀 Quick Start

### macOS / Linux / WSL

```bash
curl -fsSL https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/bvm-cli/bvm/main/install.ps1 | iex
```

After installation, restart your terminal or source your config file (e.g., `source ~/.zshrc`).

---

## 📖 Command Reference

### Basic

| Command | Description |
| :--- | :--- |
| `bvm install <version>` | Install a specific version (e.g., `1.3.4`, `latest`) |
| `bvm use <version>` | Switch to a specific version |
| `bvm ls` | List installed versions and aliases |
| `bvm ls-remote` | List available remote versions |
| `bvm uninstall <version>` | Uninstall a version |
| `bvm current` | Show currently active version |

### Advanced

| Command | Description |
| :--- | :--- |
| `bvm run <ver> <args>` | Run a command with a specific Bun version temporarily |
| `bvm exec <ver> <cmd>` | Execute any command in a specific version's environment |
| `bvm alias <name> <ver>` | Create an alias (e.g., `bvm alias default 1.3.4`) |
| `bvm upgrade` | Self-update bvm to the latest version |
| `bvm doctor` | Diagnose environment issues |

---

## 🛠️ How it Works

Unlike other version managers that rely on Python, Rust, or Go, `bvm` is written in **TypeScript** and runs on **Bun** itself.

1.  **Bootstrapping**: The installation script downloads a small, private Bun runtime (`~/.bvm/runtime`) specifically for running `bvm`.
2.  **Isolation**: This private runtime is isolated from the Bun versions you install and use (`~/.bvm/versions`).
3.  **Speed**: Because it runs on Bun, startup time is nearly instant.

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for details on how to set up your local development environment.

### Development Commands

```bash
# Install dependencies
bun install

# Run bvm source directly
npx bun run src/index.ts <command>

# Run tests
bun test

# Build for production
bun run build
```

---

## 📄 License

MIT © [bvm-cli](https://github.com/bvm-cli)