# BVM — Bun 版本管理器

BVM 是为 Bun 生态量身定制的高性能环境编排工具。它采用 **ArchSense (架构自举)** 设计哲学，利用 Bun 驱动自身，并通过 **全球 CDN (jsDelivr)** 极速分发。在提供近乎零延迟的终端启动体验的同时，实现了物理级的环境原子隔离。

[![Version](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![License](https://img.shields.io/github/license/EricLLLLLL/bvm?color=orange)](#)
[![Platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-blue)](#)

<a href="./README.md">🇺🇸 English Docs</a>

---

## 目录 (Table of Contents)

- [关于项目](#关于项目)
- [安装指南](#安装指南)
  - [安装脚本](#安装脚本)
  - [验证安装](#验证安装)
  - [手动更新](#手动更新)
- [基本用法](#基本用法)
  - [常用命令](#常用命令)
  - [执行命令](#执行命令)
  - [别名管理](#别名管理)
- [项目配置](#项目配置)
  - [.bvmrc](#bvmrc)
- [设计哲学](#设计哲学)
  - [ArchSense (架构自举)](#archsense-架构自举)
  - [智能镜像竞速](#智能镜像竞速)
  - [原子化隔离](#原子化隔离)
- [技术审计 (竞品对比)](#技术审计-架构级优势)
- [环境变量](#环境变量)
- [开源协议](#开源协议)

---

## 关于项目

BVM 旨在解决传统版本管理器常见的两大痛点：终端启动延迟和环境泄漏。通过利用 **NTFS 联接点 (Junctions) / Unix 软链接** 以及动态路径注入技术，BVM 确保了全球包和 Bun 运行时在物理上的完全隔离，并实现了无感的启动速度。

---

## 安装

BVM 提供了多种安装渠道。请根据您的网络环境选择最合适的方式：

### 1. 极速安装 (推荐 🇨🇳)
直接从淘宝 NPM 镜像下载完整 Tarball。该方式**不依赖 CDN 同步**，发布后秒级可用，成功率 100%。

**macOS / Linux / WSL:**
```bash
curl -L https://registry.npmmirror.com/bvm-core/-/bvm-core-1.1.4.tgz | tar -xz && bash package/install.sh
```

**Windows (PowerShell):**
```powershell
curl.exe -L https://registry.npmmirror.com/bvm-core/-/bvm-core-1.1.4.tgz -o bvm.tgz; tar -xf bvm.tgz; ./package/install.ps1
```

---

### 2. CDN 安装
通过各大公共 CDN 加速安装脚本。注意：新版本发布后可能存在数分钟的缓存延迟。

#### jsDelivr (推荐)
**macOS / Linux / WSL:**
```bash
curl -fsSL https://cdn.jsdelivr.net/npm/bvm-core/install.sh | bash
```
**Windows (PowerShell):**
```powershell
irm https://cdn.jsdelivr.net/npm/bvm-core/install.ps1 | iex
```

#### unpkg
**macOS / Linux / WSL:**
```bash
curl -fsSL https://unpkg.com/bvm-core/install.sh | bash
```
**Windows (PowerShell):**
```powershell
irm https://unpkg.com/bvm-core/install.ps1 | iex
```

---

### 3. 开发者安装 (GitHub 直连)
直接从 GitHub 源代码库获取最新的安装脚本。

**macOS / Linux / WSL:**
```bash
curl -fsSL https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.sh | bash
```

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.ps1 | iex
```

---

## 验证安装

安装完成后，请重启终端或执行 `source` 命令刷新环境变量，然后验证：

## 基本用法

### 常用命令

*   `bvm install latest`: 安装最新的稳定版 Bun。
*   `bvm install 1.1.0`: 安装指定版本。
*   `bvm use 1.1.0`: 立即切换活跃的 Bun 版本。
*   `bvm default 1.1.0`: 设置全局默认版本（新窗口生效）。
*   `bvm ls`: 列出本地已安装的所有版本。
*   `bvm ls-remote`: 列出注册表上可用的所有版本。
*   `bvm uninstall 1.1.0`: 卸载指定版本。

### 执行命令

您可以在不切换全局环境的情况下，使用特定版本运行命令：
```bash
bvm run 1.0.30 index.ts
```

### 别名管理

为特定版本创建自定义名称：
```bash
bvm alias prod 1.1.0
bvm use prod
```

---

## 项目配置

### .bvmrc

BVM 支持通过 `.bvmrc` 文件自动切换版本。在项目根目录下创建一个包含版本号的文件：

```bash
echo "1.1.0" > .bvmrc
```

配置完成后，在该目录（及其子目录）下执行任何 `bun` 命令，系统都将自动识别并应用指定版本。

---

## 设计哲学

### ArchSense (架构自举)
BVM 不分发沉重的预编译二进制文件。相反，它利用 **Bun 管理 Bun**。安装程序会首先下载一个极简的 Bun 运行时作为 BVM 的执行引擎，确保管理器自身始终运行在最优化的环境中。

### 智能镜像竞速
BVM 彻底消除了手动配置镜像的烦恼。它通过 Cloudflare Trace 识别地理位置，并同时对多个注册表（官方 NPM、淘宝、腾讯）发起“竞速”，自动为您选择当前网络下延迟最低的节点。

### 原子化隔离
不同于仅切换 `PATH` 的管理器，BVM 实现了 **文件系统级锁定**。它在执行命令前动态注入唯一的 `BUN_INSTALL` 路径，确保不同版本间安装的全局包永不冲突。

---

## 技术审计 (架构级优势)

| 审计维度 | **BVM** (本项目) | **bum** (Rust版) | **nvm** (Shell版) |
| :--- | :--- | :--- | :--- |
| **终端初始化开销** | **~9ms (极低损耗)** | < 5ms | ~500ms (明显卡顿) |
| **转发器运行时损耗** | **~8ms (内核转发)** | ~20ms | ~100ms (Shell函数) |
| **核心逻辑体积** | **~50 KB (JS)** | ~5 MB | ~100 KB |
| **Windows 适配** | **原生 Junctions** | 部分支持 | 不原生支持 |

---

## 环境变量

BVM 支持以下环境变量配置：

*   `BVM_DIR`: BVM 数据存储目录（默认：`~/.bvm`）。
*   `BVM_REGISTRY`: 强制指定用于下载的 NPM 注册表。
*   `BVM_MIRROR`: (旧版兼容) 镜像源地址。

---

## 开源协议

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)
