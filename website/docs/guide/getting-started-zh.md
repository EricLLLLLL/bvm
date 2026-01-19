---
title: 快速开始
---

# 快速开始

BVM 提供了多种安装方式，能够根据您的操作系统和网络环境自动选择最优配置。

## 一键安装

### 方式 1: Shell 脚本 (推荐 - macOS / Linux)

打开终端并运行以下命令：

```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### 方式 2: PowerShell (推荐 - Windows)

打开 PowerShell 并运行：

```powershell
irm https://bvm-core.pages.dev/install | iex
```

### 方式 3: NPM (可选)

如果您已经安装了 Node.js，也可以使用 npm 安装：

```bash
npm install -g bvm-core@latest
```

## 环境变量配置

安装脚本会自动尝试修改您的 Shell 配置文件（如 `.zshrc`, `.bashrc` 或 PowerShell `$PROFILE`）。

**安装完成后，请务必重启终端或运行以下命令使配置生效：**

```bash
# Zsh
source ~/.zshrc

# Bash
source ~/.bashrc
```

## 验证安装

运行以下命令验证 BVM 是否安装成功：

```bash
bvm --version
```
