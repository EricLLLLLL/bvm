# AI 客户端接入

这页用于让 AI 客户端稳定安装并正确使用 BVM，减少误操作。

## 1）先把安装手册丢给 AI

直接给 AI 这个链接：

`https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.md`

该手册会要求 AI：

- 安装 BVM
- 执行 `bvm setup`
- 用 `bvm doctor` 验证
- 安装并切换 Bun 版本
- 生成可复用的本地 Skill 文件

## 2）AI 应优先使用的最小命令集

```bash
bvm install latest
bvm use latest
bvm default latest
bvm doctor
bvm current
```

## 3）用 `.bvmrc` 固定项目版本

在仓库根目录：

```bash
echo "1.3.6" > .bvmrc
```

然后让 AI 执行：

```bash
bvm use "$(cat .bvmrc)"
```

## 4）避免 AI 常见误区

- 不要假设全局包在不同 Bun 版本之间共享。
- 命令路径不对时，先执行 `bvm setup`。
- 环境异常先跑 `bvm doctor`，不要直接盲改。
- 安装时优先写完整版本号（例如 `1.3.6`）。

## 5）LLM 上下文入口

- 索引：`/llms.txt`
- 全量聚合：`/llms-full.txt`
- Markdown 镜像：`/<page>/index.md`（例如 `/guide/getting-started/index.md`）
