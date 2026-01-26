# Implementation Plan: 修复 bun install -g 全局包无法使用的问题

修复在 macOS 和 Windows 平台上，使用 `bun install -g` 安装的全局包无法在命令行中使用的问题。

## Phase 1: 问题复现与测试环境搭建
- [x] Task: 创建集成测试脚本复现 `command not found` 错误
    - [x] 在 `test/` 目录下创建 `global_install_path.test.ts`
    - [x] 编写测试：模拟 `bvm use` 之后尝试运行 `bun install -g` 安装的虚构命令
    - [x] 验证在当前环境下 `command -v <cmd>` 失败
- [x] Task: 检查现有的 PATH 注入逻辑
    - [x] 审计 `src/commands/setup.ts` 和 `src/rc.ts`
    - [x] 审计 `install.sh` 和 `install.ps1` 中的环境配置部分
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Unix/macOS 路径管理修复
- [x] Task: 增强 `install.sh` 以包含 Bun 全局 bin 目录
    - [x] 修改 `install.sh`，确保 `~/.zshrc` 或 `~/.bashrc` 中包含正确的 `BUN_INSTALL/bin` 路径
- [x] Task: 修改 BVM 核心逻辑，动态管理全局 PATH (Unix)
    - [x] 在 `bvm use` 执行后，如果检测到环境需要，提示用户重新加载或自动导出路径
- [x] Task: 运行集成测试并验证修复 (Unix)
    - [x] 执行 `npx bun test test/global_install_path.test.ts`
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Windows 路径管理修复
- [x] Task: 增强 `install.ps1` 环境配置
    - [x] 修改 `install.ps1`，确保用户 PATH 环境变量中永久包含当前版本 Bun 的 bin 目录
- [x] Task: 修复 BVM Windows Shim 的路径代理 (Windows)
    - [x] 确保 Windows 版的 `bvm.cmd` 或 shim 能够处理全局包的查找逻辑
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)

## Phase 4: 文档更新与回归测试
- [x] Task: 更新 README 和故障排除文档
    - [x] 添加关于 `bun install -g` 包管理的说明
- [x] Task: 执行 E2E 测试
    - [x] 运行 `npx bun run test` 确保无回归错误
- [x] Task: Conductor - User Manual Verification 'Phase 4' (Protocol in workflow.md)
