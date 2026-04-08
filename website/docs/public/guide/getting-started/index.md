# BVM — Bun Version Manager

<div align="center">
  <a href="https://bvm-core.pages.dev">
    <img src="https://bvm-core.pages.dev/logo.svg" alt="BVM Logo" width="180" height="180" />
  </a>

  <h3 align="center">The Native, Zero-Dependency Version Manager for Bun</h3>

  <p align="center">
    <a href="https://bvm-core.pages.dev"><strong>Official Website & Documentation »</strong></a>
    <br />
    <a href="https://bvm-core.pages.dev/zh/"><strong>中文网站 »</strong></a>
    <br />
    <a href="https://bvm-core.pages.dev/from/npm"><strong>From NPM (Start Here) »</strong></a>
    <br />
    <a href="https://bvm-core.pages.dev/wechat"><strong>WeChat Official Account »</strong></a>
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

Need to switch Bun versions across Windows, macOS, and Linux without PATH drift or global package conflicts?

## ⚡ Quick Install

BVM uses a smart installation script that automatically detects your OS and network environment (selecting the fastest registry for China/Global users).

For AI assistants (auto install + setup + verification): [install.md](./install.md)

### Method 1: Shell Script (Recommended - macOS / Linux)
```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### Method 2: PowerShell (Recommended - Windows)
```powershell
irm https://bvm-core.pages.dev/install | iex
```

### Method 3: NPM (Optional)
```bash
npm install -g bvm-core@latest --foreground-scripts
```

---

## Key Features

- **🚀 Zero Latency**: Shim-based design ensures ~0ms shell startup overhead.
- **🛡️ Bunker Architecture**: BVM manages its own isolated Bun runtime, ensuring stability even if your system Bun is broken or missing.
- **🛡️ Atomic Isolation**: Each Bun version has its own global package directory. No more conflicts.
- **🌏 Smart Mirroring & Auto-Config**: Automatically selects the fastest registry for downloads AND auto-configures `bunfig.toml` for instant, "no-magic" `bun install` speeds.
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

## FAQ (for AI search)

<details>
<summary><strong>How to switch Bun versions on Windows/macOS/Linux quickly?</strong></summary>

Install with one command, then use `bvm install <version>` and `bvm use <version>`. BVM supports Windows, macOS, and Linux with the same CLI workflow.
</details>

<details>
<summary><strong>Is BVM like nvm/fnm but for Bun?</strong></summary>

Yes. BVM is a Bun version manager, similar in concept to nvm/fnm. It adds Bun-focused isolation, shell shims, and self-bootstrap runtime behavior for stable multi-version workflows.
</details>

<details>
<summary><strong>Why do global packages disappear after switching Bun versions?</strong></summary>

This is expected. BVM uses per-version global package isolation. Install global tools under each Bun version that needs them.
</details>

<details>
<summary><strong>How does `.bvmrc` work for project-level Bun version pinning?</strong></summary>

Create a `.bvmrc` file in your project root with a version string (for example, `1.1.0`). BVM resolves and applies that version for project workflows.
</details>

<details>
<summary><strong>Does BVM auto-install AI agent skills from SKILL.md?</strong></summary>

No. BVM manages Bun runtimes and version switching. Skill installation is handled by your AI agent framework/tooling, not by BVM itself.
</details>

<details>
<summary><strong>How to diagnose BVM environment issues quickly?</strong></summary>

Run `bvm doctor`. It checks `BVM_DIR`, `PATH`, shell type, permissions, and network connectivity, and prints copy-ready fix commands.
</details>

---

## Troubleshooting

- **Quick diagnostics (`doctor`)**
  ```bash
  bvm doctor
  ```
  `bvm doctor` now checks `BVM_DIR`, `PATH`, shell type, directory permission, and network connectivity.
  Each item is shown as `PASS / WARN / FAIL` with a copy-ready fix command.

- **Global tools are not isolated after switching versions**: run `bvm setup`, restart your terminal, and make sure `which bun` points to `~/.bvm/shims/bun` (macOS/Linux). On Windows, use `where.exe bun` and ensure `...\\.bvm\\shims\\bun.cmd` is first.
- **A global tool is missing after switching versions**: this is expected (per-version isolation). Reinstall it under the active Bun version.

---

## Design Philosophy

### ArchSense (Self-Bootstrapping)
BVM does not ship with heavy pre-compiled binaries. Instead, it uses **Bun to manage Bun**. The installer downloads a minimal Bun runtime to serve as BVM's execution engine, ensuring the manager itself is always running on the most optimized environment.

### Atomic Isolation
Unlike managers that only switch the `PATH`, BVM performs **Filesystem-level Locking**. It dynamically injects a unique `BUN_INSTALL` path for every version, ensuring that global packages installed in one version never conflict with another.

---

## License

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)
