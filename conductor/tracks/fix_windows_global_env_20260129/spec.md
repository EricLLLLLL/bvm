# Track: 深度修复 Windows 全局包路径漂移与 BVM 核心管理稳定性

## 1. 概述
修复 BVM 在 Windows 环境下管理全局包时的路径解析错误，优化安装脚本的竞速与降级逻辑，并从根源上解决多平台下 `bunx` 二进制缺失的管理问题。

## 2. 功能需求
### 2.1 Windows 路径稳定性修复 (Root Fix)
- **绝对路径硬编码**：在 `rehash` 生成 Windows Shim (`.cmd`, `.ps1`) 时，将 `%USERPROFILE%` 替换为 BVM 探测到的真实绝对路径，杜绝因 OneDrive 或深度嵌套导致的路径漂移。
- **全局包路径纠偏**：通过激进的正则匹配，强制将 Bun 生成的第三方 Shim 中的相对路径修正为 BVM 版本目录下的绝对路径（`install/global/node_modules`）。

### 2.2 安装脚本 (`postinstall.js`) 优化
- **注册表竞速 (Racing)**：在安装时同时探测 `npmmirror` 和官方源，自动选择最快响应者。
- **版本自适应回退**：若最新版（如 1.3.7）镜像同步延迟导致下载失败，自动回退至上一稳定版本（1.3.6），并增加连接超时处理。

### 2.3 `bunx` 二进制物理管理增强 (Root Fix)
- **安装时强校验**：增强 `src/commands/install.ts` 和安装脚本（`install.sh`/`.ps1`），在版本归档后确保 `bin` 目录下物理存在 `bunx`。
- **自愈机制**：在 `rehash` 过程中增加检查，若发现某个已安装版本缺失 `bunx`，自动为其创建软链接或副本。

### 2.4 BVM 运行健壮性
- **语法错误修复**：解决 `bvm-shim.js` 中因正则转义导致的语法异常。
- **环境隔离**：在 `bun.cmd` 中拦截安装指令，强制走 JS Shim 慢路径以触发自愈逻辑。

## 3. 验收标准
- [ ] Windows 下安装全局包（如 `claude`）后，命令不再报 `MODULE_NOT_FOUND`。
- [ ] 在 `npmmirror` 同步延迟时，BVM 能够通过竞速或回退成功完成初始化。
- [ ] 无论在 macOS 还是 Windows，安装 Bun 后 `bin` 目录下都物理存在可执行的 `bunx`。
- [ ] 运行 `bvm rehash` 后，所有已存在的旧 Shim 均被自动修正。
