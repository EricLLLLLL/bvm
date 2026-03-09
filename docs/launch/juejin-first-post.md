# 【首发】BVM：把 Bun 版本切换和环境排障压缩成 3 步

> 一句话定位：**BVM 专注解决 Bun 多版本切换 + 环境自检两件事，减少“同样命令在不同机器表现不一致”的排查成本。**

如果你也遇到过这些情况，这篇会很有共鸣：

- 项目 A 需要旧版 Bun，项目 B 需要新版，来回切时容易把全局环境搞乱。
- 明明切了版本，但某些全局命令还“残留”或“消失”，问题边界不清晰。
- 新同学接手项目时，环境状态难统一，沟通里经常是“我这边正常”。

我做 BVM 的目标不是做一个“大而全”的工具，而是聚焦两点：

1. **可预期的版本切换**
2. **可复用的排障路径**

---

## 30 秒演示：安装 → 切换 → doctor

```bash
# 1) 安装 BVM（macOS / Linux）
curl -fsSL https://bvm-core.pages.dev/install | bash

# 2) 安装并切换 Bun
bvm install latest
bvm use latest

# 3) 环境自检
bvm doctor
```

如果你是 Windows：

```powershell
irm https://bvm-core.pages.dev/install | iex
```

---

## 为什么我认为这条链路有效

### 1) 版本切换成本低

常用命令都很直给：

- `bvm install latest`：装最新稳定版
- `bvm use <version>`：立即切换当前版本
- `bvm default <version>`：设置默认版本（新终端生效）
- `bvm ls` / `bvm ls-remote`：本地与远程版本一目了然

### 2) 排障入口统一

我把“先看哪里”的经验收敛进了 `bvm doctor`，核心是先判断：

- 当前 shell 走的是不是 BVM shim
- 版本链路是否一致
- 有没有常见的 PATH / 全局包冲突信号

这比“每次现场口述排查步骤”更稳定。

### 3) 多项目协作更容易对齐

项目根目录放一个 `.bvmrc`，版本期望就能显式化，减少口头同步成本：

```bash
echo "1.1.0" > .bvmrc
```

---

## 一个典型场景（真实高频）

你在项目 X 中安装过全局工具，切到项目 Y 后发现工具行为异常。  
常见原因不是“工具坏了”，而是**版本上下文与全局包归属不一致**。

处理路径通常是：

1. `bvm use <目标版本>`
2. `bvm doctor` 看当前链路状态
3. 在当前版本下重新安装该全局包

这个流程的价值是：**先定位边界，再修复**，避免盲改环境。

---

## 开源地址

- GitHub：<https://github.com/EricLLLLLL/bvm>
- 文档站：<https://bvm-core.pages.dev>

---

## 我希望收集的反馈（欢迎直接贴命令输出）

为了把 BVM 打磨成真正“省排障时间”的工具，我最需要这三类反馈：

1. 你的系统与 shell（macOS/Linux/Windows + bash/zsh/fish/pwsh）
2. 你执行的命令序列
3. 你看到的关键输出（尤其是 `bvm doctor`）

我会优先处理这类可复现反馈，并持续改进安装与诊断体验。
