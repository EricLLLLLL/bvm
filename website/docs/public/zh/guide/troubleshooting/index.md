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

## 5）Bun 元数据或运行时下载失败

先查看缓存的 registry 顺序，再执行一次实时检测：

```bash
bvm network
bvm network test
```

BVM 自动模式可使用 npmmirror、腾讯云 npm 镜像和 npmjs。企业环境需要固定源时，显式指定：

```bash
BVM_REGISTRY=https://your-registry.example bvm install <version>
```

显式模式具有最高优先级，不会静默使用公共回退。BVM 仍会要求 SHA-512 完整性元数据，校验通过后才安装运行时。
