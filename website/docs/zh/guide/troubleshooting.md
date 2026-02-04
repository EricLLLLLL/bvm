# 排障

## 1）全局包没有隔离（切换版本后还有 pm2/cowsay 等）

如果 `bun install -g` 写到了 `~/.bun`，通常说明当前 shell 没有优先命中 **BVM shims**。

### 修复

1. 运行：

```bash
bvm setup
```

2. 重启终端（或重新加载 shell 配置）

3. 验证（macOS/Linux）：

```bash
which bun
```

期望：指向 `~/.bvm/shims/bun`。

## 2）Windows 没有 `which`

用 PowerShell 的命令：

```powershell
Get-Command bun
Get-Command cowsay
where.exe bun
where.exe cowsay
```

期望：`where.exe bun` 里 `...\ .bvm\shims\bun.cmd` 排在 `...\ .bvm\current\bin\bun.exe` 前面。

## 3）安装了全局工具但找不到

BVM 的全局工具是 **按 Bun 版本隔离** 的。切换版本后找不到是预期行为。

### 处理方式

- 在当前版本下重新安装：

```bash
bun install -g <pkg>
```

- 必要时手动重建 shims：

```bash
bvm rehash
```

## 4）PowerShell 执行策略拦截安装脚本

如果 `install.ps1` 被策略阻止，可以在 PowerShell 里执行：

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

再重试安装。

