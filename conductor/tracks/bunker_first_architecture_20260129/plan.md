# 任务计划：BVM 地堡架构重构与 Windows 物理隔离对齐

## 阶段 1：核心存储架构重构 (Bunker Foundation)
本阶段建立 `runtime/` 作为物理实体的单一事实来源。

- [~] **Task: 实现物理实体与注册表分离逻辑**
    - [ ] 修改 `src/commands/install.ts`：将下载解压的目标锁定为 `runtime/vX.Y.Z`。
    - [ ] 为每个新版本物理目录自动生成 `bunfig.toml` 锁定路径。
    - [ ] **TDD**: 编写测试验证版本文件实际存在于 `runtime` 目录而非 `versions`。
- [ ] **Task: 实现全平台差异化关联机制**
    - [ ] Unix：在 `versions/` 创建指向 `runtime/` 的 Symlink。
    - [ ] Windows：在 `versions/` 采用物理拷贝或 Junction。
    - [ ] **TDD**: 编写测试验证 `versions/vX.Y.Z` 能正确访问到 Bun 执行文件。
- [ ] **Task: Conductor - User Manual Verification '阶段 1' (Protocol in workflow.md)**

## 阶段 2：智能安装流优化 (Smart Install Flow)
本阶段实现“检测-提示-自动切换”逻辑。

- [ ] **Task: 重写 `bvm install` 幂等逻辑**
    - [ ] 增加前置检查：若 `runtime/vX.Y.Z` 已完备，则停止下载。
    - [ ] 逻辑跳转：提示已安装，并自动调用 `useBunVersion(version)` 执行切换。
    - [ ] **TDD**: 模拟二次安装场景，验证是否触发自动切换。
- [ ] **Task: Conductor - User Manual Verification '阶段 2' (Protocol in workflow.md)**

## 阶段 3：引导脚本与存量自愈 (Bootstrap & Migration)
本阶段确保全新安装和旧版本都能平滑过渡。

- [ ] **Task: 同步更新 `install.sh` & `install.ps1`**
    - [ ] 修改引导脚本，对齐“物理实体在 `runtime`，逻辑链接在 `versions`”的架构。
- [ ] **Task: 增强 `rehash` 实现一键迁移**
    - [ ] 修改 `src/commands/rehash.ts`：检测旧的结构，自动将其迁移并扁平化到新架构下。
- [ ] **Task: Conductor - User Manual Verification '阶段 3' (Protocol in workflow.md)**

## 阶段 4：最后验证与质量收尾
- [ ] **Task: 全平台路径稳定性测试**
    - [ ] 在 Windows 上重点验证 `claude` 包在物理版本目录下的运行。
- [ ] **Task: 质量与文档更新**
    - [ ] 检查覆盖率 (>80%)。
    - [ ] 更新架构说明文档。
- [ ] **Task: Conductor - User Manual Verification '阶段 4' (Protocol in workflow.md)**
