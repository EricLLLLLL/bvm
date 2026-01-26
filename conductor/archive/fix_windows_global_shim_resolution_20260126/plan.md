# Implementation Plan: 修复 Windows 下全局包 Shim 的相对路径解析错误

## Phase 1: 调查与复现 (Investigation)
- [x] Task: 分析 Bun 生成的 Shim 文件结构
    - [x] 在 Windows 环境（或模拟）下，检查 `bun install -g` 生成的 `.cmd` 和 `.ps1` 文件内容。
    - [x] 记录相对路径的层级深度，对比 BVM `current` 目录结构。
- [x] Task: 创建最小复现脚本 (Reproduction Script)
    - [x] 编写一个 PowerShell 脚本，模拟 BVM 的目录结构（`versions/vX`, `current` junction）。
    - [x] 手动创建一个模拟 Bun Shim 的 `.cmd` 文件。
    - [x] 验证通过 Junction 调用时路径解析是否失效。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 方案原型验证 (Prototyping)
- [x] Task: 验证 "Shim Patching" (绝对路径) 方案
    - [x] 编写脚本修改 Shim 文件，将 `..\` 替换为绝对路径。
    - [x] 验证修改后的 Shim 是否能通过 `current` 路径正常运行。
- [x] Task: 验证 "Junction Bypass" (绕过) 方案
    - [x] 测试是否可以直接将 `PATH` 指向真实版本路径（而非 `current`），验证是否解决问题。
- [x] Task: 选择最佳方案并撰写技术决策文档 (ADR)。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: 实现修复 (Implementation)
- [x] Task: 实现 Shim 修正工具 (Shim Fixer)
    - [x] 在 `src/utils/windows-shim-fixer.ts` 中实现逻辑：扫描指定目录的 `.cmd` 文件，修复相对路径。
- [x] Task: 集成到 BVM 核心流程
    - [x] 在 `bvm install` 和 `bvm use` 成功后，自动触发 Shim Fixer（仅 Windows）。
    - [x] (可选) 添加 `bvm fix-shims` 命令供用户手动调用。
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)