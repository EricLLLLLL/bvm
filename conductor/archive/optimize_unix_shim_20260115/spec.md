# 规范说明书 (Spec): 优化 Unix Shim 性能

## 1. 概述 (Overview)
`bvm-shim.sh` 是 Unix 系统的命令入口。本 Track 旨在通过引入快路径判定和替换外部系统命令（如 `tr`, `cat`）为 Bash 原生语法，进一步将命令转发延迟降低到物理极限。

## 2. 功能需求 (Functional Requirements)
- **极速分流逻辑**：
    - 在脚本开始处快速检查 `./.bvmrc` 是否存在。
    - 若不存在且未设置 `BVM_ACTIVE_VERSION`，直接跳过复杂的 `while` 循环和父级目录搜寻。
- **去除外部进程依赖**：
    - 使用 Bash 的 `${var//v/}` 替换 `tr -d 'v'`。
    - 尽量使用 Bash 的 `read` 或变量展开处理字符串，减少对 `cat`, `grep`, `cut` 的调用。
- **读取优化**：
    - 对 `.bvmrc` 的读取增加缓存或更轻量的读取方式。

## 3. 验收标准 (Acceptance Criteria)
- 在无 `.bvmrc` 场景下，`bun --version` 的额外耗时（Overhead）降至 **< 5ms**。
- 逻辑保持正确，能够准确处理 `.bvmrc` 中的版本号。
- 脚本依然保持 0 依赖，仅限 POSIX 标准 Shell / Bash。
