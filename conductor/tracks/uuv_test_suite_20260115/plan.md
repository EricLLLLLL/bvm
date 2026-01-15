# Implementation Plan: Comprehensive E2E Test Suite (Bun Test + Execa)

## Phase 1: E2E 测试框架搭建
- [x] Task: 初始化测试环境与安装依赖
    - 安装 `execa`。
    - 在 `test/e2e/` 创建基础架构（如 `setup.ts`, `utils.ts`）。
    - 建立跨平台沙箱机制（自动处理 `HOME`, `USERPROFILE`, `PATH`）。
- [x] Task: 实现基础命令验证工具
    - 编写辅助函数用于捕获输出、检查退出码及验证文件系统变化。
- [x] Task: Conductor - User Manual Verification 'Phase 1: E2E 测试框架搭建' (Protocol in workflow.md)

## Phase 2: 安装脚本与隔离性测试 [checkpoint: 9f0f056]
- [x] Task: 实现安装流测试 (Unix & Windows) [ff63279]
    - 验证 `install.sh` 和 `install.ps1` 在干净环境下的执行结果。
- [x] Task: 实现 Shim 机制与隔离性测试 [5f5d071]
    - 验证 `bvm` 生成的 shim 是否能正确截获命令。
    - 验证切换版本后，子进程中的版本是否同步更新。
- [x] Task: Conductor - User Manual Verification 'Phase 2: 安装脚本与隔离性测试' (Protocol in workflow.md) [9f0f056]

## Phase 3: 全命令覆盖与边缘情况
- [ ] Task: 覆盖所有核心 BVM 命令
    - `install`, `use`, `ls`, `ls-remote`, `alias`, `unalias`, `current`, `which`。
- [ ] Task: 覆盖维护类命令
    - `upgrade`, `doctor`, `cache`, `setup`, `rehash`, `deactivate`。
- [ ] Task: 验证 Shell 配置文件修改 (bashrc, zshrc, profile)
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 全命令覆盖与边缘情况' (Protocol in workflow.md)

## Phase 4: CI 集成与文档
- [ ] Task: 更新 GitHub Actions 工作流
    - 配置在 ubuntu-latest, macos-latest, windows-latest 上运行 `npx bun test test/e2e`。
- [ ] Task: 在 README 或 CONTRIBUTING 中增加测试指南
- [ ] Task: Conductor - User Manual Verification 'Phase 4: CI 集成与文档' (Protocol in workflow.md)