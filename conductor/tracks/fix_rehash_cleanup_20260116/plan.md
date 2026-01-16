# 实施计划 - 修复 Rehash 清理逻辑导致的 CI 失败

## 阶段 1: 修正测试套件 (Phase 1: Test Suite Correction)
- [x] 任务: 更新 `test/rehash_cleanup.test.ts`
    - [x] 移除“期望 `rehash` 清理版本目录内软链接”的相关断言。
    - [x] 确保测试仍然验证 `~/.bvm/shims` 目录下的 Shim 能被正确管理（创建/删除）。
    - [x] 验证 `rehash` 的幂等性（运行两次不会导致错误）。
- [x] 任务: 本地运行测试
    - [x] 执行 `bun test test/rehash_cleanup.test.ts` 确认修复。
    - [x] 执行 `bun test` (全量测试) 确保没有其他回归错误。
- [~] 任务: Conductor - 用户手动验证 '修正测试套件' (协议见 workflow.md)

## 阶段 2: CI 验证与完成 (Phase 2: CI Verification & Finalization)
- [ ] 任务: 提交更改并验证 CI 状态。
