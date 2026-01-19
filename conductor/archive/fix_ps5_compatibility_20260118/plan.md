# Implementation Plan - Legacy PowerShell Fix

## Phase 1: 复现与环境检测修复
- [x] Task: 分析 `install.ps1` 当前的 OS 检测代码。
- [x] Task: 编写验证逻辑（脑内模拟或静态检查），确认在 PS 5.1 下会崩溃。
- [x] Task: 重构 OS 检测逻辑。
    - [x] 使用 `if ($PSVersionTable.PSVersion.Major -ge 6)` 包裹现代 API。
    - [x] 为 `else` 分支（Legacy）实现基于环境变量的检测。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 依赖检查与 TLS 加固
- [x] Task: 添加 TLS 1.2 强制开启代码。
- [x] Task: 实现 `tar` 命令检查。
    - [x] `if (-not (Get-Command tar -ErrorAction SilentlyContinue))`
    - [x] 抛出清晰的错误提示和升级建议。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: 版本发布
- [x] Task: 提交更改并打 Tag `v1.1.11`。
- [x] Task: 监控发布流程。
- [x] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
