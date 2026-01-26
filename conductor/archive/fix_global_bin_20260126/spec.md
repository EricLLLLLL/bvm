# Specification: 修复 bun install -g 全局包无法使用的问题

## 1. 概述
修复在 macOS 和 Windows 平台上，使用 `bun install -g` (如 `@anthropic-ai/claude-code`) 安装全局包后，无法在终端直接运行该命令（提示 `command not found`）的缺陷。

## 2. 问题分析
当前 BVM 允许每个 Bun 版本拥有独立的全局包安装目录。然而，当用户通过 BVM 激活某个 Bun 版本时，该版本对应的全局 bin 目录可能未被正确添加到系统的 PATH 环境变量中，导致用户无法直接调用安装的工具。

## 3. 目标
- 确保用户使用 `bvm use <version>` 切换版本后，该版本下已安装的全局包命令立即可用。
- 确保用户在当前版本下新执行 `bun install -g <package>` 后，安装的命令立即可用。
- 保持不同 Bun 版本间全局包的隔离性。

## 4. 解决方案 (待验证)
1.  **PATH 注入优化**: 确保 `bvm use` 操作会更新 Shell 的 PATH，指向 `<BUN_INSTALL>/bin`。
2.  **动态 Shim**: BVM 的 Shim 机制可能需要扩展，以代理 `$BUN_INSTALL/bin` 下的所有可执行文件。

## 5. 验收标准
### macOS / Unix
- [ ] 安装 BVM 并安装一个 Bun 版本。
- [ ] 执行 `bun install -g @anthropic-ai/claude-code`。
- [ ] 执行 `claude` 命令，应能正常启动。

### Windows
- [ ] 安装 BVM 并安装一个 Bun 版本。
- [ ] 执行 `bun install -g @anthropic-ai/claude-code`。
- [ ] 执行 `claude` 命令，应能正常启动。

## 6. 不在范围
- 跨 Bun 版本的全局包自动迁移或共享。
