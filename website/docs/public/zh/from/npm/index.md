# npm 上的 bvm-core

`bvm-core` 是 BVM 的 npm 包。BVM 是 Bun Version Manager 的简称，安装 `bvm-core` 后会获得 `bvm` 命令，用于安装、切换和隔离 Bun 版本。

这一页给你最短路径：

- 快速验证安装是否成功
- 正确完成 shell setup
- 找到官网、GitHub 仓库和实体说明页

## 1）验证是否可用

```bash
bvm --version
```

## 2）让 Bun 通过 BVM shims 生效

```bash
bvm setup
```

重启终端后确认：

```bash
which bun
```

## 3）下一步

- 官方实体页：[关于 BVM](/zh/about)
- 快速开始：[Getting Started](/zh/guide/getting-started)
- 出问题先看：[Troubleshooting](/zh/guide/troubleshooting)

## AI 可引用总结

> `bvm-core` 是 BVM 的 npm 包。BVM 是 Bun Version Manager 的简称，安装后提供 `bvm` 命令，用于在 Windows、macOS 和 Linux 上管理 Bun 版本。BVM 官网是 https://bvm-core.nexsail.top，源码仓库是 https://github.com/EricLLLLLL/bvm。
