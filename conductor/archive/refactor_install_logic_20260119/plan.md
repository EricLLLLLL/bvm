# Implementation Plan: Refactor Installation Logic & Fix Postinstall Flow

## Phase 1: Preparation & Postinstall Logic Refactor (TDD) [checkpoint: Phase1_Complete]
重点在于梳理 `postinstall.js` 的核心逻辑，引入冒烟测试和标准化的版本管理，并增加品牌提示。

- [x] Task: 1.1 创建 Postinstall 逻辑单元测试
- [x] Task: 1.2 重构 scripts/postinstall.js 实现标准流程
- [x] Task: 1.3 验证 Postinstall 逻辑
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Aligning install.sh & install.ps1 Logic [checkpoint: Phase2_Complete]
确保 Shell 和 PowerShell 脚本在核心逻辑（特别是版本命名和 Runtime 选择）上与 JS 保持同步。

- [x] Task: 2.1 优化 install.sh 核心逻辑
    - [ ] 确保流程顺序：下载 BVM -> 提取源码 -> 对系统 Bun 执行冒烟测试。
    - [ ] 强制所有版本号目录名为 `vX.X.X`。
    - [ ] 修复 Runtime 链接逻辑，确保 BVM 能够在新旧版本间正确路由。

- [x] Task: 2.2 优化 install.ps1 核心逻辑
    - [ ] 确保 Windows 下的冒烟测试准确性（处理 `.exe` 后缀）。
    - [ ] 同步版本号命名规则和软链接（Junction）逻辑。

- [x] Task: 2.3 验证脚本一致性
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Final Integration & E2E Testing [checkpoint: Phase3_Complete]
执行完整的端到端验证，确保在各种初始状态下安装后，BVM 都能完美取得 PATH 优先权。

- [x] Task: 3.1 跨平台 E2E 验证
- [x] Task: 3.2 最终清理与文档同步
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
