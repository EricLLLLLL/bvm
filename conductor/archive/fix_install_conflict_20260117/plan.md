# Implementation Plan - Fix Installation Path Conflict

## Phase 1: 脚本逻辑加固 [checkpoint: d77deb8]
- [x] Task: 识别并增强 Windows (`install.ps1`) 的清理逻辑。
    - [x] Sub-task: 在创建 Junction 前，插入显式的 `Remove-Item` 检查。
    - [x] Sub-task: 确保错误捕获逻辑能够处理由于权限引起的删除失败。
- [x] Task: 识别并增强 Unix (`install.sh`) 的清理逻辑。
    - [x] Sub-task: 在 `ln -sf` 前执行 `rm -rf`。
- [x] Task: 审查 `src/commands/upgrade.ts` 确保其不包含重置 Runtime 链接的逻辑（遵循约束）。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 本地模拟验证 [checkpoint: e29ced0]
- [x] Task: 编写自动化回归测试（或本地验证脚本）。
    - [x] Sub-task: 模拟冲突场景：手动创建阻塞性目录。
    - [x] Sub-task: 运行 `install.ps1` (Windows 环境) 验证修复。
    - [x] Sub-task: 运行 `install.sh` (Unix 环境) 验证修复。
- [x] Task: 验证 `bvm upgrade` 的隔离性。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: 发布与归档 [checkpoint: de686c6]
- [x] Task: 更新版本号并发布 Hotfix (v1.1.8)。
- [x] Task: 清理测试残留环境。
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
