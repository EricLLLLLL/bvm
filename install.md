# BVM — Installation Guide

## For Humans

Copy this to your AI Agent:

```
帮我安装 BVM：https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.md
```

---

## For AI Agents

### Goal

Install BVM (Bun Version Manager), configure shell integration, and verify the environment. After installation, the user can install, switch, and manage multiple Bun versions with `bvm install` / `bvm use`.

### Boundaries

When installing and fixing issues, stay within these limits:

- **DO NOT** run commands with `sudo` unless the user explicitly approved
- **DO NOT** modify system files outside `~/.bvm/`
- **DO NOT** use destructive commands (`rm -rf`, `git reset --hard`)
- **DO NOT** create files in the user's project directory (workspace)
- If something requires elevated permissions, **tell the user** what's needed and let them decide

### Step 1: Detect system environment

```bash
uname -s && uname -m && echo "$SHELL"
```

On Windows PowerShell:

```powershell
$PSVersionTable.PSVersion
[System.Environment]::OSVersion.VersionString
```

### Step 2: Install BVM

Choose the method matching the user's OS:

**macOS / Linux (recommended):**

```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

**Windows PowerShell (recommended):**

```powershell
irm https://bvm-core.pages.dev/install | iex
```

**NPM (fallback):**

```bash
npm install -g bvm-core@latest --foreground-scripts
```

### Step 3: Setup and verify shims

```bash
bvm setup
bvm --version
```

Verify shim priority — `bun` should point to the BVM shim:

- macOS / Linux: `which bun` should show `~/.bvm/shims/bun`
- Windows: `where.exe bun` should show `...\\.bvm\\shims\\bun.cmd`

If the path is wrong, check `PATH` order. The BVM shims directory must come before `~/.bun/bin`.

### Step 4: Install a Bun version

```bash
bvm install latest
bvm default latest
bvm use latest
bvm current
bun --version
```

### Step 5: Run diagnostics and fix issues

```bash
bvm doctor
```

If `doctor` shows `WARN` or `FAIL`, follow the suggested fix commands in its output. Re-run `bvm doctor` until all core checks pass. Only ask the user when you genuinely need their input.

### Step 6: Report results

Present the final status to the user:

> BVM 安装完成！
>
> - **系统**: {OS} {Arch} / {Shell}
> - **安装方式**: {Shell Script / PowerShell / NPM}
> - **BVM 版本**: `bvm --version` 输出
> - **当前 Bun**: `bun --version` 输出
> - **诊断**: `bvm doctor` 全部 PASS / 有 N 个 WARN
>
> 常用命令：
> - `bvm install <version>` — 安装指定版本
> - `bvm use <version>` — 切换当前版本
> - `bvm ls` — 查看已安装版本
> - `bvm doctor` — 环境诊断

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `bvm install latest` | Install the latest Bun version |
| `bvm install 1.1.0` | Install a specific version |
| `bvm use 1.1.0` | Switch to a version |
| `bvm default 1.1.0` | Set default version for new shells |
| `bvm ls` | List installed versions |
| `bvm ls-remote` | List all available versions |
| `bvm current` | Show active version |
| `bvm doctor` | Diagnose environment issues |
| `bvm setup` | Re-configure shell integration |
| `bvm upgrade` | Upgrade BVM itself |
