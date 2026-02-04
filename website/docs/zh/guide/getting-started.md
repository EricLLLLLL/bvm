# BVM — Bun 版本管理器

## 安装

### 方式 1：Shell（macOS / Linux，推荐）

```bash
curl -fsSL https://bvm-core.pages.dev/install | bash
```

### 方式 2：PowerShell（Windows，推荐）

```powershell
irm https://bvm-core.pages.dev/install | iex
```

### 方式 3：NPM（可选）

```bash
npm install -g bvm-core@latest --foreground-scripts
```

安装完成后建议：

1. 重启终端（或重新加载 shell 配置）
2. 运行 `bvm --version` 验证
3. 如果全局包隔离不生效，先执行一次 `bvm setup`（见「排障」）

## 常用命令

- `bvm install latest`：安装最新稳定版 Bun
- `bvm install 1.3.3`：安装指定版本
- `bvm use 1.3.3`：立即切换活跃版本（全终端生效）
- `bvm shell 1.3.3`：仅对当前 shell 会话生效
- `bvm default 1.3.3`：设置全局默认版本
- `bvm ls`：查看本地已安装
- `bvm uninstall 1.3.3`：卸载版本
- `bvm upgrade`：升级 bvm 本身

## 全局包隔离（你需要知道的）

- `bun install -g` 安装的全局命令是 **按 Bun 版本隔离** 的。
- 切换版本后看不到之前的全局命令是正常的（你需要在新版本下重新装一次）。
- `bvm` 会在必要时自动 `rehash`，但你也可以手动运行 `bvm rehash` 重新生成 shims。

