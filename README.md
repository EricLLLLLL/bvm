# BVM · Bun Version Manager

> Bun 原生的多版本管理器，跨平台、零依赖、开箱即用。

![BVM banner](https://img.shields.io/badge/bvm-bun-blue)

## Table of Contents

1. [Core Features](#core-features)
2. [Quick Start](#quick-start)
3. [Installation](#installation)
4. [Command Reference](#command-reference)
5. [Command Demo](#command-demo)
6. [Local Development & Sandbox Mode](#local-development--sandbox-mode)
7. [Environment Configuration & Network Optimization](#environment-configuration--network-optimization)
8. [Troubleshooting](#troubleshooting)
9. [Tool Comparison](#tool-comparison)
10. [Contribution Guide](#contribution-guide)
11. [Uninstall](#uninstall)

---

## Core Features

- ⚡ **Native Bun Performance**: The CLI is built and run with Bun, offering extremely fast command response.
- 🧪 **Full Bun Toolchain**: Development, testing, and release scripts all use Bun (`bun test`, `npx bun run src/index.ts`) for a consistent experience.
- 📦 **Zero Runtime Dependencies**: The compiled output is a single binary, compatible with macOS / Linux / Windows.
- 🧠 **Smart Version Management**: Supports common commands like `install / use / ls / ls-remote / alias / run / exec / which / cache`, and built-in `.bvmrc` support.
- 🔁 **Conflict Detection**: Automatically detects existing official Bun installations or other PATH conflicts, providing interactive resolution.
- 🌐 **Network Friendly**: Automatically prioritizes `npmmirror.com` in mainland China and prompts for GitHub acceleration mirror configuration.
- 🧰 **Extensible Scripting**: Directly use `npx bun run src/index.ts`, or override the `HOME=<directory>` environment variable for real/sandbox environment debugging.

---

## Quick Start

```bash
# 1. Install the latest stable version of Bun
# For macOS / Linux / Git Bash / WSL:
curl -fsSL https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh | bash

# For Windows (PowerShell):
irm https://raw.githubusercontent.com/bvm-cli/bvm/main/install.ps1 | iex

# 2. Activate bvm in your current shell
# (The installer will provide a specific command for your shell, e.g.,)
source ~/.zshrc   # or ~/.bashrc / ~/.config/fish/config.fish / . $PROFILE

# 3. View remote versions and install
bvm ls-remote
bvm install 1.3.4
bvm use 1.3.4
```

---

## Installation

| Platform | Command |
| --- | --- |
| **macOS / Linux / Git Bash / WSL** | `curl -fsSL https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh \| bash` |
| **Windows (PowerShell)** | `irm https://raw.githubusercontent.com/bvm-cli/bvm/main/install.ps1 \| iex` |
| Alternate (wget for Unix-like) | `wget -qO- https://raw.githubusercontent.com/bvm-cli/bvm/main/install.sh \| bash` |
| Manual Download | Go to [GitHub Releases](https://github.com/bvm-cli/bvm/releases), download the corresponding platform binary, give `chmod +x` permission, and place it in your `PATH`. |

---

## Command Reference

```bash
bvm --help                   # Full help
bvm ls-remote                # View remote versions
bvm install 1.0.0            # Install a specific version
bvm install latest           # Install the latest stable version
bvm install                  # Install based on .bvmrc

bvm use 1.0.0                # Switch to a specific version
bvm use                      # Switch based on .bvmrc
bvm ls                       # View local versions & aliases
bvm current                  # View currently active version
bvm which 1.0.0              # View installation path

bvm alias prod 1.0.0         # Create an alias
bvm unalias prod             # Delete an alias
bvm run 1.0.0 --version      # Run a command with a specific version
bvm exec latest bun run app  # Execute a command in a specific version environment

bvm cache dir                # View cache directory
bvm cache clear              # Clear cache
bvm deactivate               # Deactivate bvm
bvm uninstall 1.0.0          # Uninstall a version
bvm upgrade                  # Self-upgrade
bvm doctor                   # Output diagnostic information (install dir, aliases, env vars)
bvm completion zsh           # Generate completion script for a specific shell
```

## Command Demo

```bash
$ npx bun run src/index.ts install 1.2
- Finding Bun 1.2 release...
✓ Bun v1.2.23 installed successfully.
✓ Bun v1.2.23 is now active.

$ npx bun run src/index.ts doctor
Directories
  BVM_DIR: /Users/you/.bvm
Environment
  BVM_TEST_MODE: false
Installed Versions
  v1.3.4 (current)
Aliases
  default -> v1.3.4
```

---

## Local Development & Sandbox Mode

To avoid polluting your real `HOME` directory, it is recommended to directly use `npx bun run src/index.ts` and optionally override `HOME`:

```bash
# Use real HOME (simulating an end-user)
npx bun run src/index.ts ls

# Use ./manual-home as HOME, for easy cleanup
HOME="$PWD/manual-home" npx bun run src/index.ts install 1.0.0
```

You can also customize it:

```bash
export BVM_DEV_HOME=$PWD/.sandbox-home
alias bvm-dev='HOME=$BVM_DEV_HOME npx bun run src/index.ts'
bvm-dev install 1.2.23
```

---

## Environment Configuration & Network Optimization

1. **PATH**  
   BVM attempts to update your shell configuration file (`.zshrc` / `.bashrc` / `config.fish` / PowerShell `$PROFILE`) during the first `install` or when running `bvm setup`. Ensure `~/.bvm/bin` is in your `PATH`, and `source` your configuration file or restart your terminal after modification.

2. **npm Registry**  
   When in mainland China, `npmmirror.com` will be prioritized automatically, requiring no additional configuration.

### Auto-Completion

```bash
# Zsh
bvm completion zsh > ~/.config/bvm.zsh && source ~/.config/bvm.zsh

# Bash
bvm completion bash >> ~/.bashrc && source ~/.bashrc

# Fish
bvm completion fish > ~/.config/fish/completions/bvm.fish
```

---

## Troubleshooting

| Issue | Solution |
| --- | --- |
| `Command not found: bun` | Check if `~/.bvm/bin` has been added to your PATH, and confirm that your terminal has been restarted or the configuration file has been `source`d. |
| `CONFLICT DETECTED` | Follow the prompts to uninstall official Bun or manually adjust your PATH to avoid multiple Bun conflicts. |
| Download timeout | Temporarily use a proxy, manually download release assets, or place offline packages in the local cache directory. |
| `.bvmrc` invalid | Confirm that `bvm use/install` is executed in the project directory or a subdirectory, and `.bvmrc` content is valid. |
| Tests require network | Before running `bun test`, it is recommended to export `BVM_TEST_MODE=true` or use the repository's built-in mock data. |

---

## Tool Comparison

|  | **bvm (Bun)** | **bum (Rust)** |
| --- | --- | --- |
| Implementation Language | Bun (TypeScript) | Rust |
| Command Coverage | install/use/ls/ls-remote/alias/run/exec/which/cache/doctor/completion | use/remove/list/list-remote |
| Auto-install Behavior | Installation and switching are separate, with more detailed output | `use` implicitly installs missing versions |
| Alias/Default Version | ✅ Aliases, `.bvmrc`, PATH detection | Partially supported (`.bumrc`) |
| Run Specific Version | `bvm run/exec` | Not provided |
| Self-upgrade | `bvm upgrade` | Not provided |
| Script/Sandbox | `npx bun run src/index.ts`, `HOME="<dir>" npx bun run src/index.ts` | Primarily via npx + Bun |

---

## Contribution Guide

1. Fork the project and pull the latest `main`.
2. Run `bun install` to synchronize dependencies, use `HOME="$PWD/manual-home" npx bun run src/index.ts <cmd>` to verify commands in an isolated environment.
3. Write/update tests: `npx bun test test/*.ts`.
4. Commit with `type: subject` style (e.g., `feat: support foo`).
5. In your PR, provide motivation, key changes, test output, and CLI screenshots if necessary.

Feel free to submit Issues / Discussions and PRs! For full details, please refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Uninstall

```bash
rm -rf ~/.bvm
# Or in sandbox mode: rm -rf <sandbox>/\.bvm
```

Also, remove the `BVM_DIR` and `PATH` related lines added to your shell configuration file, then restart your terminal.
