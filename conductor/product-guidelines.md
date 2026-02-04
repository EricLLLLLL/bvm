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

## 5. 工程经验与防错 (Engineering Experience & Guardrails)

### 5.1 绝对路径基准 (The Absolute Baseline)
- **原则**：在 Windows 等复杂环境下，生成的持久化脚本（.cmd, .ps1）严禁使用相对路径（如 `%~dp0\..`）。
- **理由**：BVM 的 Junction 结构和 OneDrive 等环境会导致相对路径在物理层级上发生漂移（如导致 `MODULE_NOT_FOUND`）。
- **做法**：在生成 Shim 时，必须动态注入 BVM 探测到的真实绝对路径。

### 5.2 下载的竞速与降级 (Race & Fallback)
- **原则**：下载流程必须具备 Registry 竞速和版本自动回退能力。
- **理由**：镜像源（如 npmmirror）可能存在“元数据同步但二进制文件 404”的时间差。
- **做法**：设置硬超时（如 30s），失败时立即切换注册表或尝试前一个稳定版本（Fallback Chain）。

### 5.3 物理完整性校验 (Physical Integrity)
- **原则**：安装流程必须实现全物理闭环，严禁将补全逻辑推迟到运行时。
- **理由**：运行时探测 (`if exists`) 会增加 Shim 复杂度且不够稳固。
- **做法**：在解压或关联任何版本后，强制检查并物理补全 `bun`、`bunx` 等核心执行文件。

### 5.4 拦截式自愈 (Interceptor Self-Healing)
- **原则**：对“环境变更类操作”实现透明拦截与自愈。
- **理由**：用户手动安装全局包后，其生成的第三方 Shim 往往带有路径错误。
- **做法**：拦截 `bun install/add/upgrade` 等指令，在操作完成后自动静默执行 `bvm rehash` 逻辑，生成安全代理并修正第三方包的路径。