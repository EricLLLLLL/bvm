# BVM · Bun Version Manager (中文版)

> **为 Bun 而生的原生、原子化、高性能版本管理器。**
> 使用 Bun 开发，专为 Bun 优化。为全球开发者提供极致速度体验。

[![Release](https://img.shields.io/github/v/release/EricLLLLLL/bvm?color=f472b6&label=latest)](https://github.com/EricLLLLLL/bvm/releases)
[![Size](https://img.shields.io/badge/size-45kb-green)](#)
[![Bun](https://img.shields.io/badge/Native-Bun-000?logo=bun)](#)
[![English](https://img.shields.io/badge/Document-English-blue.svg)](./README.md)

**BVM** (Bun Version Manager) 是下一代环境编排工具。不同于仅修改环境变量的传统管理器，BVM 提供了一个**原子化、自愈且零开销**的生态系统，旨在触达性能的物理极限。

---

## ⚡ 性能决斗 (基准测试)

我们将 BVM 与行业标准进行了对比测试。结果显示：BVM 彻底消除了传统工具带来的“Shell 税”。

| 指标 | **BVM (v1.x)** | **bum** (Rust) | **nvm** (Node) | **深度解析** |
| :--- | :--- | :--- | :--- | :--- |
| **Shell 启动延迟** | **0ms** | 0ms | **497ms** | NVM 需要在每次打开终端时 `source` 巨大的脚本。BVM 和 Bum 使用 Shim/PATH 机制，零延迟。 |
| **运行时开销** | **0ms** (全局) | <1ms | 0ms | **BVM 全局模式使用物理软链接。** 操作系统直接执行 `bun`。Bum 使用二进制代理，虽快但仍有微小开销。 |
| **CLI 响应速度** | ~27ms | **~7ms** | ~500ms | Rust 二进制 (Bum) 在执行管理命令 (`ls`) 时更快。BVM 运行在 Bun 运行时之上，速度极快但有极小的启动成本。 |
| **安装体积** | **~45KB** | ~5MB | ~100KB | BVM 复用现有的 Bun 运行时，核心逻辑体积微乎其微。 |

> *测试环境: MacBook Pro M1, macOS 14. 数据来源: `scripts/vs-competitors.ts`.*

## 🧩 功能矩阵

BVM 不仅快，更是一个统一的、跨平台的解决方案。

| 特性 | **BVM** | **nvm** | **fnm / bum** |
| :--- | :--- | :--- | :--- |
| **Windows 支持** | ✅ **原生支持 (PowerShell)** | ❌ (需 `nvm-windows`) | ✅ |
| **Shell 兼容性** | ✅ **通用 Shim** | ❌ (主要是 Bash/Zsh) | ✅ |
| **环境依赖** | **无** (自动引导安装 Bun) | POSIX Shell | 二进制 / Rust 工具链 |
| **原子隔离** | ✅ **`BUN_INSTALL` 注入** | ❌ | ❌ (通常仅修改 PATH) |
| **自愈能力** | ✅ **Bunker 架构** | ❌ | ❌ |
| **国内镜像** | ✅ **内置自动切换** | ❌ 需手动配置 | ❌ 需手动配置 |

---

## 🏛️ 深度解析：为什么选择 BVM?

### 1. "Bunker" 架构 (私有运行时)
**痛点**: 许多版本管理器 (如 `pip`, `npm`, `gem`) 依赖于它们管理的对象。如果你弄坏了系统的 Node/Python，你的版本管理器也就挂了。
**BVM 方案**: BVM 维护一个**私有、原子化的 Bun 运行时** (`~/.bvm/runtime`)。它与用户安装的版本完全解耦。即使你 `rm -rf` 删光了所有安装的版本，BVM 依然坚如磐石，随时准备修复环境。

### 2. 物理软链 vs 二进制代理
**痛点**: 现代管理器 (fnm, voltan, bum) 多采用“二进制代理”模式。当你运行 `node` 时，实际上运行的是一个 Rust/Go 编写的中间人程序，由它计算并转发请求。
**BVM 方案**: 我们采用 **混合路由 (Hybrid Routing)**。
*   **全局模式**: 我们使用 **操作系统级软链接**。当你运行 `bun` 时，内核直接指向可执行文件。**0 CPU 周期** 被浪费在路由上。
*   **项目模式**: 仅当检测到 `.bvmrc` 时，才会激活高性能 Shim 脚本 (<10ms)，确保无感切换。

### 3. 环境级原子隔离
**痛点**: 切换版本后，全局包 (`bun install -g`) 往往会变得混乱。v1.0.0 的包可能会意外地被 v1.1.0 读取到，导致难以排查的“幽灵冲突”。
**BVM 方案**: BVM 将 `BUN_INSTALL` 注入到执行环境中。每个版本的全局包存储在物理隔离的目录中。

### 4. 全球化高速分发 (NPM 优先)
BVM 实现了复杂的 NPM 优先下载策略：
*   **全球访问**: 默认使用 `registry.npmjs.org` (Cloudflare CDN)，确保全球稳定访问。
*   **国内加速**: 自动检测并为国内用户切换至 `registry.npmmirror.com` (阿里云 CDN)。彻底告别 GitHub 下载超时。

---

## 🚀 快速开始

### macOS / Linux / WSL (推荐)

```bash
curl -fsSL https://cdn.jsdelivr.net/gh/EricLLLLLL/bvm@main/install.sh | bash
```

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.ps1 | iex
```

---

## 📖 命令参考

| 命令 | 描述 |
| :--- | :--- |
| `bvm i latest` | 安装最新的稳定版 Bun |
| `bvm use 1.1.34` | 切换全局版本（立即生效） |
| `bvm ls` | 列出已安装的版本和别名 |
| `bvm current` | 显示当前版本来源 (.bvmrc / 环境变量 / 别名) |
| `bvm default 1.1.20`| 设置新终端的默认版本 |
| `bvm upgrade` | 通过 JSDelivr/GitHub 更新 BVM 自身 |

---

## 📄 开源协议

MIT © [EricLLLLLL](https://github.com/EricLLLLLL)

---

**BVM - Built with Bun, for the fastest developers on earth.**
