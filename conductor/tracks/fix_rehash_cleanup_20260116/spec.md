# Track Specification: 修复 Rehash 清理逻辑导致的 CI 失败

## 概览 (Overview)
当前的 CI 流程在 `Rehash Cleanup Logic > rehash removes legacy npm/yarn symlinks pointing to bun` 这个测试用例上失败了。
失败的原因是：当前的 `rehash` 实现不再（也不需要）清理版本目录 `versions/vX.X.X/bin` 下的历史遗留软链接，但测试脚本仍然期望它执行清理操作。

既然我们确定不需要支持老用户的历史遗留问题，本 Track 的目标是**更新测试用例以匹配当前行为**，从而通过 CI 并解除发布阻塞。

## 功能要求 (Functional Requirements)
1.  **移除过时的测试断言**:
    - `test/rehash_cleanup.test.ts` 中的测试用例 `rehash removes legacy npm/yarn symlinks pointing to bun` 断言 `bvm rehash` 会删除版本目录下的文件。
    - 必须移除或修改此断言，不再期望这种副作用。

2.  **保持 Shim 完整性**:
    - `bvm rehash` 必须继续为存在的二进制文件正确生成 `~/.bvm/shims` 下的 Shim。
    - `bvm rehash` 仍然应该清理那些指向已不存在的二进制文件的 *Shim*（孤儿 Shim 清理），但绝不应该修改 `versions` 目录内的内容。

## 验收标准 (Acceptance Criteria)
- [ ] `test/rehash_cleanup.test.ts` 测试套件全部通过。
- [ ] `bvm rehash` 在遇到版本目录中的非预期文件时不会报错。
- [ ] CI 流水线 (Pipeline) 成功通过。

## 范围外 (Out of Scope)
- 实现删除 `versions/vX.X.X/bin` 下历史遗留软链接的逻辑。
