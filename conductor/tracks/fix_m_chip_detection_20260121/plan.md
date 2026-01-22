# Implementation Plan: Fix M-series (ARM64) Detection

## Phase 1: 脚本修复
- [x] **任务 1.1: 更新 `install.sh`** [69bb31c]
    - [x] 引入 `sysctl` 检查。
- [~] **任务 1.2: 更新 `scripts/postinstall.js`**
    - [ ] 引入 `child_process` 检查硬件架构。

## Phase 2: 核心引擎增强
- [ ] **任务 2.1: 重构 `src/utils.ts` 中的架构获取逻辑**
    - [ ] 封装 `getNativeArch()` 函数。
- [ ] **任务 2.2: 更新 `src/commands/doctor.ts`**
    - [ ] 增加硬件架构显示。

## Phase 3: 验证
- [ ] **任务 3.1: 编写测试用例模拟 Rosetta 环境**
- [ ] **任务 3.2: 手动验证**
