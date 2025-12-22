# BVM 产品准则 (Product Guidelines)

## 1. 沟通风格 (Communication Style)
- **风格定位**：亲切且引导性强 (Friendly & Guided)。
- **原则**：不仅告知用户发生了什么，更要引导用户接下来该做什么。输出应保持整洁且富有逻辑。

## 2. 视觉反馈 (Visual System)
遵循 `src/utils/ui.ts` 中定义的颜色和图标系统：
- **主要信息 (Primary)**：使用 `colors.cyan` (Bold Cyan)。
- **成功 (Success)**：使用 `colors.green` (Bold Green) 和图标 `✓`。
- **警告/操作建议 (Warning/Action)**：使用 `colors.yellow` (Bold Yellow) 和图标 `?` 或 `!`。
- **错误 (Error)**：使用 `colors.red` (Bold Red) 和图标 `✖`。
- **次要信息 (Info/Dim)**：使用 `colors.dim` (Gray) 处理路径、调试信息等。
- **当前状态 (Current)**：在列表中使用 `*` 标记当前版本。

## 3. 交互模式 (Interaction Patterns)
- **错误处理**：采用“积极防御”策略。遇到错误时立即显示带颜色的错误信息，并提供 **Suggested Action**（例如：`You can install it using: bvm install <version>`）。
- **风险控制**：修改系统配置文件（如 `.zshrc`, `.bashrc`）前，必须请求用户显式确认。
- **进度反馈**：长时间任务（下载、解压）必须使用 `ProgressBar` 或 `Spinner`，且成功后应使用过去式动词（如 "Installed."）。

## 4. 文档与帮助 (Documentation & Help)
- **场景驱动**：帮助信息 (`--help`) 应包含常见用例示例，而不仅仅是参数列表。
- **示例优先**：在用户操作失败或执行 `bvm` 命令不带参数时，优先展示最常用的 3-5 个场景化示例。