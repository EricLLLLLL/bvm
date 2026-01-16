# 实现计划 (Plan): 优化 Unix Shim 性能

## Phase 1: 脚本重构
- [ ] Task: 修改 `src/templates/init-scripts.ts` 中的 `BVM_SHIM_SH_TEMPLATE`。
- [ ] Task: 实现基于 Bash 内置语法的字符串处理逻辑。
- [ ] Task: 加入快路径判断（无 .bvmrc 时直接直连）。
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 验证与集成
- [x] Task: 运行 `bvm setup` 刷新本地 Shims。
- [x] Task: 在本地测量性能提升。
- [x] Task: 实现 `install.ps1` 的跨平台全量 E2E 验证并跑通测试。
- [x] Task: 将跨平台验证流程固化到 `bvm-architect` skills 中。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)
