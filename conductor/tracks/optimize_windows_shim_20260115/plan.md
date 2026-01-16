# 实现计划 (Plan): 优化 Windows Shim 性能

## Phase 1: 模板重构 [checkpoint: 81c4964]
- [x] Task: 修改 `src/templates/init-scripts.ts` 中的 Windows 包装器模板（加入分流逻辑）。
- [x] Task: 优化 `bvm-shim.js` 的实现（同步模板）。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 集成与验证 [checkpoint: 81c4964]
- [x] Task: 运行 `bvm setup` 刷新本地 Shims。
- [x] Task: 在 Windows 环境下测量性能提升。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)
