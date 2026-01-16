# Implementation Plan - Hotfix: Missing Shim Build Artifacts

## Phase 1: 构建逻辑修复与 TDD (Implementation & TDD)
- [x] Task: 编写测试用例 `test/build_artifacts.test.ts` 验证 `dist/` 目录下应存在的文件。
    - [x] 子任务: 断言 `dist/bvm-shim.sh` 存在且包含 Bash Shebang。
    - [x] 子任务: 断言 `dist/bvm-shim.js` 存在。
- [x] Task: 实现 `scripts/sync-runtime.ts` 或新脚本以生成这些文件。
    - [x] 子任务: 从 `src/templates/init-scripts.ts` (或其他模板源) 提取模板内容。
    - [x] 子任务: 写入 `dist/bvm-shim.sh` 并设置 755 权限。
    - [x] 子任务: 写入 `dist/bvm-shim.js`。
- [x] Task: 更新 `package.json` 的 `build` 脚本，使其在编译后自动运行同步脚本。
- [~] Task: Conductor - 用户手动验证 'Phase 1' (Protocol in workflow.md)

## Phase 2: 发布流程验证 (Verification)
- [ ] Task: 运行本地构建命令 `npm run build` 并检查 `dist/` 目录。
- [ ] Task: 模拟 `git add .` 确保不再报错。
- [ ] Task: Conductor - 用户手动验证 'Phase 2' (Protocol in workflow.md)
