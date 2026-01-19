# BVM — Bun 版本管理器

<div align="center">
  <a href="https://bvm-core.pages.dev">
    <img src="https://bvm-core.pages.dev/logo.svg" alt="BVM Logo" width="180" height="180" />
  </a>

  <h3 align="center">专为 Bun 打造的原生、零依赖版本管理器</h3>

  <p align="center">
    <a href="https://bvm-core.pages.dev"><strong>官方网站与文档 »</strong></a>
    <br />
    <br />
    <a href="./README.md">🇺🇸 English Docs</a>
    ·
    <a href="https://github.com/EricLLLLLL/bvm/issues">提交 Bug</a>
    ·
    <a href="https://github.com/EricLLLLLL/bvm/discussions">功能建议</a>
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

## ⚡ 一键极速安装

BVM 提供了智能安装脚本，**自动检测您的网络环境**。中国用户会自动切换至淘宝镜像源，海外用户使用官方源，无需手动配置。

### 方式 1: Shell 脚本 (推荐 - macOS / Linux)
```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### 方式 2: PowerShell (推荐 - Windows)
```powershell
irm https://bvm-core.pages.dev/install | iex
```

### 方式 3: NPM (可选)
```bash
npm install -g bvm-core@latest
```

---

## 核心特性

- **🚀 零延迟启动**：采用 Shim 架构设计，Shell 启动耗时约为 0ms。
- **🛡️ 地堡架构 (Bunker Architecture)**：BVM 拥有独立的私有运行环境，即使卸载系统 Bun，BVM 依然能稳定工作并自愈。
- **🛡️ 原子化隔离**：每个 Bun 版本拥有独立的全局包目录，彻底告别依赖冲突。
- **🌏 智能镜像加速**：基于 GeoIP 自动识别地理位置，智能选择 NPM 官方源或淘宝镜像，下载飞快。
- **📦 零依赖自举**：BVM 自身能够实现环境自举。安装无需预设环境（它会自动复用系统 Bun 或按需下载）。

---

## 快速上手

### 常用命令

*   `bvm install latest`: 安装最新的稳定版 Bun。
*   `bvm install 1.1.0`: 安装指定版本。
*   `bvm use 1.1.0`: 立即切换活跃的 Bun 版本。
*   `bvm default 1.1.0`: 设置全局默认版本（新窗口生效）。
*   `bvm ls`: 列出本地已安装的所有版本。
*   `bvm ls-remote`: 列出注册表上可用的所有版本。
*   `bvm uninstall 1.1.0`: 卸载指定版本。
*   `bvm upgrade`: 将 BVM 自身升级到最新版本。

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

### 项目级配置 (.bvmrc)

BVM 支持通过 `.bvmrc` 文件自动切换版本。在项目根目录下创建一个包含版本号的文件：

```bash
echo "1.1.0" > .bvmrc
```

---

## 设计哲学

### ArchSense (架构自举)
BVM 不分发沉重的预编译二进制文件。相反，它利用 **Bun 管理 Bun**。安装程序会首先下载一个极简的 Bun 运行时作为 BVM 的执行引擎，确保管理器自身始终运行在最优化的环境中。

### 原子化隔离
不同于仅切换 `PATH` 的管理器，BVM 实现了 **文件系统级锁定**。它在执行命令前动态注入唯一的 `BUN_INSTALL` 路径，确保不同版本间安装的全局包永不冲突。

---

## 开源协议

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)