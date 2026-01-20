# Implementation Plan: Fix Windows Installation & Simplify Coexistence Logic

本计划旨在通过清理侵入性逻辑、增强脚本鲁棒性以及统一三端（Shell, PowerShell, NPM）的安装行为，解决 Windows 上的冲突并简化共存策略。

## 阶段 1：核心逻辑重构 (Core Logic Refactor) [checkpoint: 6c21847]
重点在于清理 TypeScript 源码中试图干预官方 Bun 的逻辑，并确保 PATH 优先级正确。

- [x] **任务 1.1: 重构 `src/commands/setup.ts`**
    - [ ] 移除 `checkConflicts` 函数中对官方 Bun 的移动、警告或建议删除的逻辑。
    - [ ] 确保在所有平台上（Windows/Unix），BVM 的 `shims` 和 `bin` 目录始终被添加到 `PATH` 的最前面。
    - [ ] 确保 PowerShell Profile 的写入逻辑具有幂等性，不再因重复写入或权限受限而崩溃。
- [x] **任务 1.2: 重构 `src/commands/install.ts`**
    - [ ] 审查安装流程，确保不再触发任何针对旧版本或官方版本的迁移逻辑。
    - [ ] 确保 `installBunVersion` 在版本已存在时能够静默处理或仅做必要更新。
- [x] **任务 1.3: 增强 `src/utils.ts` 中的文件操作**
    - [ ] 确保 `ensureDir` 等工具函数在 Windows 上对已存在文件/目录的处理更加健壮。
- [x] **任务: Conductor - User Manual Verification '阶段 1：核心逻辑重构' (Protocol in workflow.md)

## 阶段 2：安装脚本硬化 (Installer Scripts Hardening) [checkpoint: e4606a0]
更新前端安装脚本，确保其作为“第一入口”时表现稳定且符合新策略。

- [x] **任务 2.1: 更新 `install.ps1` (Windows)**
- [x] **任务 2.2: 更新 `install.sh` (Unix)**
    - [x] 确保 `mkdir -p` 的一致使用。 [0f63e4a]
    - [x] 移除任何针对官方 Bun 的侵入性逻辑。 [2e592b3]
- [x] **任务: Conductor - User Manual Verification '阶段 2：安装脚本硬化' (Protocol in workflow.md)

## 阶段 3：NPM 安装流程优化 (NPM Post-install Refinement) [checkpoint: 782d942]
确保通过 `npm install -g bvm` 安装时逻辑一致。

- [x] **任务 3.1: 更新 `scripts/postinstall.js`** [ef7f148]
    - [x] 同步移除侵入性逻辑。
    - [x] 修复可能导致 NPM 环境下安装路径权限问题的潜在 bug。
- [x] **任务: Conductor - User Manual Verification '阶段 3：NPM 安装流程优化' (Protocol in workflow.md)**

## 阶段 4：端到端验证 (E2E Verification)
通过自动化测试和手动验证确保“严格隔离”和“路径优先级”生效。

- [ ] **任务 4.1: 编写/更新 TDD 测试用例**
    - [ ] 增加测试用例：模拟存在官方 Bun 环境下的安装。
    - [ ] 增加测试用例：验证 `which bun` / `Get-Command bun` 的输出。
- [ ] **任务 4.2: 执行全平台冒烟测试**
- [ ] **任务: Conductor - User Manual Verification '阶段 4：端到端验证' (Protocol in workflow.md)**
