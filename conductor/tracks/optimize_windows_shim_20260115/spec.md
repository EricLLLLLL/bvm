# 规范说明书 (Spec): 优化 Windows Shim 性能

## 1. 概述 (Overview)
目前的 Windows Shim 无论是否需要切换版本，都会启动一个 JS 进程。本 Track 旨在通过重构 `.cmd` 包装器，实现一种“快路径 (Fast-Path)”机制：在无需版本切换的场景下直接转发到目标二进制，从而消除 JS 运行时的启动开销。

## 2. 功能需求 (Functional Requirements)
- **快路径分流 (Fast-Path Dispatching)**：
    - 修改 `bun.cmd` / `bunx.cmd` 模板。
    - 在脚本开头检查当前目录下是否存在 `.bvmrc`。
    - 若不存在，直接执行 `~/.bvm/runtime/current/bin/bun.exe`。
- **慢路径降级 (Slow-Path Fallback)**：
    - 若存在 `.bvmrc`，则维持现有逻辑，调用 `bvm-shim.js` 处理版本解析与环境变量注入。
- **参数转发兼容性**：
    - 确保 `%*` 转发在各种引用符号下表现正确。

## 3. 验收标准 (Acceptance Criteria)
- 在无 `.bvmrc` 的目录下运行 `bun -v`，执行延迟显著降低。
- 在有 `.bvmrc` 的目录下运行 `bun -v`，能正确识别并切换版本。
- 所有生成的 `.cmd` 文件均能通过 `bvm setup` 或 `bvm upgrade` 自动更新。
