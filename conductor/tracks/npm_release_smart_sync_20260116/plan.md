# Implementation Plan - Full NPM Release & Real-time Sync

## Phase 1: 基础配置与指纹 [checkpoint: 3a39e0b]
- [x] Task: 更新 `package.json` 的 `files` 列表，包含所有安装资产。
- [x] Task: 确保 `scripts/fingerprint.ts` 能够处理所有发布资产。
- [x] Task: Conductor - 用户手动验证 'Phase 1' (Protocol in workflow.md)

## Phase 2: 智能安装脚本 (Unix/Windows) [checkpoint: 8c12e6e]
- [x] Task: 重构 `install.sh` 实现**动态版本解析** (从 NPM 查询最新版)。
- [x] Task: 在 `install.sh` 中实现**智能网络探测** (自动切换 unpkg/elemecdn)。
- [x] Task: 在 `install.ps1` 中同步上述逻辑。
- [x] Task: 本地模拟 CN/Global 环境验证脚本的自适应能力。
- [x] Task: Conductor - 用户手动验证 'Phase 2' (Protocol in workflow.md)

## Phase 3: 自动化实时发布流 (CI/CD)
- [ ] Task: 更新 `.github/workflows/auto-release.yml`。
    - [ ] Sub-task: 实现 `npm publish` 步骤。
    - [ ] Sub-task: 实现 `cnpm sync` 并捕获实时同步日志。
    - [ ] Sub-task: 实现高频验证循环（轮询 npmmirror 状态直到版本匹配）。
- [ ] Task: Conductor - 用户手动验证 'Phase 3' (Protocol in workflow.md)

## Phase 4: 文档与清理
- [ ] Task: 更新 `README.md`，提供基于 NPM CDN 的“零配置”安装命令。
- [ ] Task: 移除所有过时的 GitHub/jsDelivr 引用。
- [ ] Task: Conductor - 用户手动验证 'Phase 4' (Protocol in workflow.md)
