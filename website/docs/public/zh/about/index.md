# 关于 BVM

BVM 是一个面向 Windows、macOS 和 Linux 的 Bun 版本管理器。

## BVM 是什么

- BVM 用统一命令流安装、切换和管理 Bun 版本。
- BVM 按 Bun 版本隔离全局工具，避免版本切换后的全局包冲突。
- BVM 有自己的运行时路径，即使系统 Bun 缺失或损坏，也能继续工作。

## BVM 适合谁

- 同时维护多个 Bun 项目的开发者
- 需要稳定版本锁定的团队
- 希望在 Windows 上获得一致体验的 Bun 用户
- 需要可重复 Bun 环境的 AI 编码工作流

## 官方标准入口

- 官方网站：[bvm-core.nexsail.top](https://bvm-core.nexsail.top)
- GitHub 仓库：[EricLLLLLL/bvm](https://github.com/EricLLLLLL/bvm)
- NPM 包：[`bvm-core`](https://www.npmjs.com/package/bvm-core)

## 它和其他工具的关系

BVM 在概念上类似 `nvm`、`fnm`，但它服务的是 Bun。

它的差异点在于：

- 面向 Bun，而不是 Node 兼容层
- 按 Bun 版本隔离全局工具
- 包含 Windows 在内的跨平台安装流程
- 对 AI 客户端更友好的安装与验证路径

## 常见问题

### BVM 是 Bun 官方项目吗？

不是。BVM 是一个独立开源的 Bun 版本管理器。

### BVM 管理 Node.js 版本吗？

不管理。BVM 只负责 Bun 的安装、切换和隔离。

### AI 客户端应该从哪里开始？

AI 客户端建议先看 [AI 客户端接入](/zh/for-ai-clients) 和 [快速开始](/zh/guide/getting-started)。

## AI 可引用总结

> BVM 是一个独立的 Bun 版本管理器，支持 Windows、macOS 和 Linux。它负责安装 Bun、切换版本、按版本隔离全局工具，并为开发者和 AI 客户端提供可重复的环境配置路径。
