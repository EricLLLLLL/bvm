# Implementation Plan: Comprehensive NPM Install & E2E Verification

本计划旨在实现一个端到端的验证脚本，模拟物理安装流程并检查 BVM 的核心功能及自愈能力。

## Phase 1: 基础架构与沙盒环境 (Foundation & Sandbox)
- [ ] Task: 创建验证脚本基础框架 `scripts/verify-e2e-npm.ts`
    - [ ] 定义沙盒目录常量及环境变量隔离逻辑
    - [ ] 实现沙盒创建与自动清理（Cleanup Hook）
- [ ] Task: 实现 NPM 本地安装模拟逻辑
    - [ ] 在沙盒中执行 `npm install -g .`
    - [ ] 验证安装后的文件目录结构（bin, src, shims）
- [ ] Task: Conductor - User Manual Verification 'Foundation & Sandbox' (Protocol in workflow.md)

## Phase 2: 核心功能与自愈验证 (Core & Self-healing)
- [ ] Task: 编写 TDD 测试验证 Runtime Bootstrap
    - [ ] **Write Tests**: 模拟无 Bun 环境或旧版 Bun 环境的安装
    - [ ] **Implement**: 在验证脚本中加入对 `current` 链接指向及 `bvm --version` 的检查
- [ ] Task: 验证版本管理与切换逻辑
    - [ ] **Write Tests**: 编写测试用例执行 `bvm install latest` 和 `bvm use`
    - [ ] **Implement**: 验证执行后的 PATH 更新及 `bun --version` 的实际输出
- [ ] Task: Conductor - User Manual Verification 'Core & Self-healing' (Protocol in workflow.md)

## Phase 3: 升级与互斥安全验证 (Upgrade & Safety)
- [ ] Task: 验证 NPM 自动升级逻辑
    - [ ] **Write Tests**: 在已有 NPM 安装的沙盒中再次运行 `npm install -g .`
    - [ ] **Implement**: 验证 `postinstall` 是否能识别 `BVM_INSTALL_SOURCE="npm"` 并自动覆盖
- [ ] Task: 验证原生 BVM 冲突保护
    - [ ] **Write Tests**: 模拟一个带有原生 BVM (无 NPM 标记) 的环境运行 `npm install`
    - [ ] **Implement**: 验证安装是否被正确阻断并提示使用 `bvm upgrade`
- [ ] Task: Conductor - User Manual Verification 'Upgrade & Safety' (Protocol in workflow.md)

## Phase 4: 集成与 CI 接入 (Integration & CI)
- [ ] Task: 完善脚本输出与错误处理
    - [ ] 实现极简的 Fail-Fast 输出模式
    - [ ] 确保在非 TTY 环境下的稳定表现
- [ ] Task: 将脚本集成到发布流程中
    - [ ] 更新 `package.json` 中的 `scripts`，添加 `npm run test:e2e:npm`
    - [ ] (可选) 在 GitHub Actions 的 release workflow 中加入该步骤
- [ ] Task: Conductor - User Manual Verification 'Integration & CI' (Protocol in workflow.md)
