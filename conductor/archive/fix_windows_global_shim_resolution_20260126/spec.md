# Specification: 修复 Windows 下全局包 Shim 的相对路径解析错误

## 1. 概述
在 Windows 平台上，用户通过 BVM 安装的 Bun 全局包（如 `claude`）在运行时可能抛出 `Module not found` 错误。初步分析显示，这是由于 Bun 生成的 Shim 脚本使用了相对路径（如 `..\..\..\node_modules\...`），而 BVM 的版本管理依赖于目录连接点（Junction，即 `.bvm\current`），导致相对路径解析时跳转到了错误的物理位置。

## 2. 问题分析 (Hypothesis)
- **现象**: 运行 `claude` 报错，路径指向错误的位置（如 `C:\Users\Administrator\.bvm\current\..\..\..\node_modules...`）。
- **原因**: Windows 的 Junction 在处理 `..` (父目录) 时，可能基于“链接所在的路径”而非“链接指向的目标真实路径”进行解析，或者反之，导致层级计算错误。
- **影响**: 所有依赖 BVM `current` 机制并在 Windows 上使用 `bun install -g` 的用户。

## 3. 目标
- **核心目标**: 确保在 Windows 上通过 BVM 安装和管理的全局包能够正常运行，不报路径错误。
- **阶段性目标**:
    1.  **复现**: 确立一个最小可复现案例 (Reproduction Case)。
    2.  **根因确认**: 分析 Bun 生成的 `.cmd` / `.ps1` 文件内容，确认相对路径的具体计算逻辑。
    3.  **方案验证**: 测试 "Shim Patching"（改为绝对路径）或 "Wrapper Proxy" 等修复方案的可行性。

## 4. 交付物
- 一个包含复现步骤和根因分析的技术报告。
- 修复方案的原型代码。
- 如果可行，直接集成修复到 BVM 核心。

## 5. 验收标准
- [ ] 在 Windows 测试环境中，安装 BVM 和 Bun。
- [ ] 运行 `bun install -g @anthropic-ai/claude-code`。
- [ ] 运行 `claude` 命令，不再报错。
- [ ] 确认修复方案不会破坏 Unix/macOS 的现有逻辑。

## 6. 不在范围
- 修复 Bun 自身的 Shim 生成逻辑。
