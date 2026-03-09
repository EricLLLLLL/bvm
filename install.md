# BVM AI Installer Guide

> 这是给 AI 助手执行的安装手册。目标是：自动安装 BVM、完成 shell 配置、验证可用性、并生成可复用的 BVM 使用 Skill。

## 给 AI 的执行要求

1. 不要只解释，请直接执行命令并给出结果。
2. 严格按步骤执行；某步失败时先修复再继续。
3. 不要使用破坏性命令（如 `rm -rf`、`git reset --hard`）。
4. 每完成一个阶段，输出简短状态和关键命令结果。

## 目标结果

- `bvm --version` 可用
- `bvm setup` 已执行，BVM shims 已生效
- `bvm doctor` 通过核心检查
- 已安装并启用一个 Bun 版本（建议 `latest`）
- 已生成一个可复用的 Skill 文件：`my-skills/bvm-user/SKILL.md`

## Step 1: 识别系统与 Shell

请先执行并记录结果：

```bash
uname -s || true
uname -m || true
echo "$SHELL" || true
```

在 Windows PowerShell 执行：

```powershell
$PSVersionTable.PSVersion
[System.Environment]::OSVersion.VersionString
```

## Step 2: 安装 BVM

### macOS / Linux（推荐）

```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### Windows PowerShell（推荐）

```powershell
irm https://bvm-core.pages.dev/install | iex
```

### 备选：NPM 全局安装

```bash
npm install -g bvm-core@latest --foreground-scripts
```

## Step 3: 执行 setup 并验证 shim 优先级

```bash
bvm setup
bvm --version
```

macOS / Linux 额外检查：

```bash
which bun
```

Windows 额外检查：

```powershell
where.exe bun
```

要求：`bun` 应优先指向 BVM shim 路径（如 `~/.bvm/shims/bun` 或 `...\\.bvm\\shims\\bun.cmd`）。

## Step 4: 初始化 Bun 版本

```bash
bvm install latest
bvm default latest
bvm use latest
bvm current
bun --version
```

## Step 5: 运行诊断并自动修复

```bash
bvm doctor
```

如果 `doctor` 有 `WARN/FAIL`，请根据输出建议自动执行修复命令，然后再次运行 `bvm doctor`，直到核心链路正常。

## Step 6: 生成并保存 Skill（必须）

请在仓库中创建文件：`my-skills/bvm-user/SKILL.md`，内容使用下面模板（可按当前机器微调）：

```markdown
---
name: bvm-user
description: 在日常开发中自动使用 BVM 管理 Bun 版本，确保版本切换、全局包隔离和环境诊断流程稳定可复现。
---

# BVM User

## 目标

- 自动遵循项目 `.bvmrc` 版本
- 保持 Bun 全局包按版本隔离
- 遇到环境问题优先使用 `bvm doctor` + `bvm setup` 修复

## 标准流程

1. 进入项目后优先检查版本上下文：
   - 若存在 `.bvmrc`，执行：`bvm use $(cat .bvmrc)`
   - 若不存在 `.bvmrc`，执行：`bvm use default`（若失败则提示先安装）
2. 安装或切换 Bun 版本：
   - 安装：`bvm install <full_version>`
   - 切换：`bvm use <version_or_alias>`
   - 设默认：`bvm default <version_or_alias>`
3. 出现命令不一致或全局包混乱时：
   - 执行：`bvm doctor`
   - 按提示执行修复
   - 执行：`bvm setup`
   - 重开终端后复检：`which bun`（Windows 用 `where.exe bun`）

## 注意事项

- BVM 只负责 Bun 版本与运行时管理，不负责自动安装第三方 Agent Skills。
- 全局包隔离是预期行为；切换版本后如缺少命令，请在当前版本重新安装对应全局包。
- 安装时优先使用完整版本号（如 `1.3.6`），避免模糊版本输入。
```

## Step 7: 最终回报格式

请按以下格式输出最终结果：

1. 系统信息（OS + Shell）
2. 安装方式（Shell / PowerShell / NPM）
3. 验证结果（`bvm --version`、`bvm current`、`bun --version`、`bvm doctor`摘要）
4. 已创建文件清单（至少包含 `my-skills/bvm-user/SKILL.md`）
5. 后续建议（最多 3 条）

---

## 一句话用法（可直接发给 AI）

请按这个安装手册执行：`https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.md`。不要只解释，直接完成安装、配置、验证，并按手册生成 `my-skills/bvm-user/SKILL.md`。
