# [开源] BVM：专注 Bun 版本切换 + 环境排障（附最短体验路径）

TL;DR：如果你在多个项目间切 Bun，或经常遇到 PATH / 全局包不一致问题，BVM 可以把流程收敛成一组固定命令。

## 主要解决什么

1. 多项目切换 Bun 版本时，环境状态容易混乱  
2. 切完版本后，部分全局命令行为不稳定  
3. 团队协作里，环境问题难快速对齐与复现

## 最短体验路径

```bash
# macOS / Linux
curl -fsSL https://bvm-core.pages.dev/install | bash

bvm install latest
bvm use latest
bvm doctor
```

Windows:

```powershell
irm https://bvm-core.pages.dev/install | iex
```

## 常用命令（按频率）

```bash
bvm install <version>   # 安装指定版本
bvm use <version>       # 当前终端立即切换
bvm default <version>   # 设置默认版本（新终端生效）
bvm ls                  # 查看本地版本
bvm ls-remote           # 查看远程可用版本
bvm doctor              # 诊断当前环境链路
```

## 我自己的使用习惯

- 每个项目根目录放 `.bvmrc` 声明版本。
- 新环境先 `bvm doctor`，再开始装全局工具。
- 遇到“同命令不同机表现不一致”，先看版本链路和 shim，再做修复。

## 项目地址

- GitHub: https://github.com/EricLLLLLL/bvm
- Docs: https://bvm-core.pages.dev

如果愿意帮忙测试，欢迎回帖带这三项信息：

1. 系统 + shell（例如 macOS + zsh）  
2. 复现命令序列  
3. `bvm doctor` 的关键输出

我会按可复现程度优先跟进修复。
