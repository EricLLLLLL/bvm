# BVM 全面加固设计

## 目标

在保持现有 CLI 命令、BVM 目录结构、版本隔离语义和跨平台安装方式兼容的前提下，修复安全、Windows、发布、类型检查、测试和仓库卫生问题，使发布产物具备可重复验证的质量门禁。

## 约束

- 不改变 `~/.bvm` 的公开目录布局和已有版本、alias、shim 数据格式。
- 不引入 CLI 运行时依赖，继续输出单文件 Bun bundle。
- 不重写完整安装架构，只提取边界清晰且可测试的共享逻辑。
- 不覆盖当前工作区中已有的网站内容改动。
- 不创建分支、commit、push 或 pull request，除非用户另行明确授权。
- 所有行为修改遵循测试先行：先看到回归测试因缺少行为而失败，再实现最小修复。

## 方案概览

改造分为五个相互独立、可逐批验证的部分：

1. CLI 输入与 Windows shim 正确性。
2. 下载完整性和不可变安装入口。
3. 类型检查、测试矩阵和发布门禁。
4. 文档站、仓库生成物和许可证收口。
5. 最终构建、打包、覆盖率和变更范围验证。

## 1. CLI 输入与 Windows shim

新增单一职责的 alias 名称校验函数。合法名称只允许 ASCII 字母、数字、下划线和连字符，且不能为空；`default` 继续作为合法保留 alias。创建、读取、解析和删除 alias 前均使用同一校验函数。最终路径使用 `resolve()` 计算，并确认父目录等于 `BVM_ALIAS_DIR`，形成第二层目录边界保护。

`fixPs1Shim()` 初始化独立的 `newContent`，按候选模式逐步替换，不再引用未声明变量。该函数发生失败时返回可测试结果或抛出带文件路径的错误；批量扫描器可以记录失败，但不能把代码缺陷完全吞掉。

轻量 CLI Router 保留现有命令注册方式，但 `.option()` 需要真正注册布尔参数。未知顶层命令、未知子命令和未知参数返回非零状态；帮助与版本查询继续返回零。命令 handler 不再依赖无边界的 `Record<string, any>`。

## 2. 下载完整性与安装入口

下载校验统一使用 npm 元数据中的 `dist.integrity`，当前支持 `sha512-<base64>`。CLI 下载器在写入临时文件后计算 SHA-512，校验通过后才重命名并解压；主源和镜像各自重新获取或使用同一版本对应的可信元数据，校验失败时删除临时文件并终止。

Node postinstall 使用内建 `crypto` 校验。PowerShell 使用 `Get-FileHash -Algorithm SHA512` 后转换为 Base64。POSIX 安装器优先使用 `openssl dgst -sha512 -binary`；缺少校验工具时明确失败并给出安装提示，不降级为未校验安装。

Cloudflare 安装函数先从 npm dist-tag 解析确定版本，再从 GitHub `v<version>` tag 获取安装脚本。安装脚本自身负责地域和 registry 选择，边缘函数不再对脚本文本做正则替换。响应保留短缓存和版本响应头，避免 `main` 分支变更绕过发布流程。

现有 MD5 fingerprint 不再作为安全机制。发布检查改为 SHA-256 构建清单，用于发布附件审计；安装可信性仍以 npm SHA-512 SRI 为准。

## 3. 类型系统、测试与发布门禁

根 `tsconfig` 只包含 CLI TypeScript，不包含废弃 React 示例。网络请求选项使用标准 `RequestInit` 与显式 timeout 扩展。模板 import 使用明确的文本类型边界，确保 `tsc --noEmit` 与 Bun bundle 同时通过。

website 使用独立配置覆盖 Cloudflare Pages 类型和 Remotion 源码。Cloudflare handler 的上下文、请求和异常均有显式类型；Remotion 类型使用 type-only import。

测试分层如下：

- `test/*.test.ts`：确定性单元和集成测试，不依赖全局 `bun` PATH，统一使用 `process.execPath`。
- `test/isolated/*.test.ts`：隔离进程场景。
- `test/e2e/*.test.ts`：按平台条件执行；PowerShell 安装测试只在 Windows 执行。
- 安装脚本契约测试：校验版本常量、必需产物、完整性步骤和 shell/PowerShell 行为对齐。

CI 增加独立验证工作流，在 Ubuntu、macOS、Windows 上使用固定 Bun 版本。Ubuntu 执行覆盖率和打包检查；各平台执行适用的类型检查、核心测试和平台 E2E。发布 workflow 依赖验证 job，通过后才能构建和 publish。发布 tag 只允许首次创建，禁止 force push。

本地 release 脚本不再自动 commit。它只准备版本文件、运行验证并输出下一步命令，所有 Git 写操作交给用户明确执行。

## 4. 结构与仓库卫生

删除根 `src/` 中未接入 CLI 的 React/Bun 示例文件。移除未被正式构建或部署引用的 `website-starlight/` 示例站，保留 `website/docs` VitePress 为文档唯一 source of truth。

停止跟踪 `website/docs/.vitepress/cache/` 和 `.playwright-mcp/` 运行日志，并补充以下忽略规则：

- `website/docs/.vitepress/cache/`
- `.playwright-mcp/`
- `test/e2e/.tmp*/`
- 本地诊断 `output/`，但不删除用户当前已有的 `output/` 内容。

仓库根保留标准 MIT `LICENSE`。若当前工作区已有用户创建的 LICENSE，则验证内容后复用，不覆盖。

大文件 `setup.ts`、`install.ts` 和跨语言安装器本轮不做整体拆分。只提取 alias 校验、完整性校验和安装契约等能降低重复且直接服务当前问题的单一职责模块，避免扩大回归面。

## 5. 错误处理与兼容策略

- 非法 alias 在任何文件系统操作前失败，错误信息包含允许格式。
- 完整性缺失、算法不支持或摘要不匹配均为硬失败，不解压、不激活版本。
- 网络源失败可切换镜像；完整性失败不能静默切换到未校验模式。
- Windows shim 单文件修复失败不破坏原文件，批量处理返回失败列表供调用方输出诊断。
- 不再使用空 `catch` 隐藏本轮触及路径的程序错误；仅对缓存、通知等明确 best-effort 行为保留降级，并附注释。
- 已有合法 alias、命令名称、安装目录、shell 初始化块和 npm 包入口保持兼容。

## 验收标准

以下命令均需获得新的、退出码为零的执行证据：

```bash
bunx tsc --noEmit
bun test test/*.test.ts
bun test test/isolated/*.test.ts
bun test --coverage test/*.test.ts
bun run scripts/check-templates.ts
bun build src/index.ts --target=bun --outfile /tmp/bvm-audit-dist.js --minify
npm pack --dry-run --json --ignore-scripts
```

website 需通过类型检查和 VitePress 构建。平台受限 E2E 在当前 macOS 上只验证适用部分，Windows 专用测试由 CI matrix 配置和静态契约测试共同覆盖。

覆盖率门禁以核心可执行 TypeScript 为统计对象，行覆盖率目标至少 80%。模板常量和生成文本不计入核心逻辑覆盖率，避免用静态字符串虚增指标。

完成前检查 Git diff，确认只包含本设计列出的文件和用户已有网站改动，并列出 `rg` 调用点审计、类型检查、测试矩阵和构建验证证据。

## 明确不做

- 不迁移到新的 CLI 框架。
- 不改变 BVM 的产品功能或新增命令。
- 不转换为完整 monorepo/workspace。
- 不重写全部 shell、PowerShell 或 postinstall 逻辑。
- 不修改用户当前正在进行的 SEO/GEO 页面文案与信息架构。
