# 实现计划 (Plan): BVM 智能升级与健康体系

## Phase 1: 核心引擎重构 [checkpoint: fea0ec0]
- [x] Task: 扩展 `src/constants.ts` 定义分发组件清单.
- [x] Task: 修改 `src/commands/upgrade.ts` 实现 HEAD 探测与增量下载.
- [x] Task: 实现原子的 `safeSwap` 逻辑（包含备份功能）。
- [x] Task: TDD - 编写单元测试模拟文件损坏或锁定时的升级行为。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: 自愈与感知集成 [checkpoint: 73ab0cb]
- [x] Task: 优化 `src/commands/setup.ts` 的 `configureShell` 接口以支持内部静默刷新。
- [x] Task: 在 `upgrade` 流程末尾触发 `setup`。
- [x] Task: 实现 `src/utils/update-checker.ts` 异步通知逻辑。
- [x] Task: 在 `ls` 或 `current` 命令入口集成更新提示。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)
