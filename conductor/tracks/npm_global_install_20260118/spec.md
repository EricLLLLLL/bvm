# Specification: 支持 npm i -g 下载 (Track ID: npm_global_install_20260118)

## 1. 概述
支持通过 `npm install -g bvm-core` 全局安装 BVM。为了确保在切换 Node 版本后 BVM 依然可用，本方案采用“npm 引导，本地固化”的策略。

## 2. 目标
- 用户可以通过熟悉的 `npm install -g` 方式安装 BVM。
- 安装后的 BVM 独立于当前的 Node 环境，不会因切换 Node 版本而失效。
- 保持与现有 `install.sh` 安装方式的完全兼容。

## 3. 功能需求
### 3.1 package.json 配置
- 定义 `bin` 字段：`"bvm": "dist/index.js"`，支持 npm 直接调用。
- 配置 `files` 字段：确保包含 `dist/`, `install.sh`, `install.ps1`, `package.json` 等必需文件。

### 3.2 Postinstall 自动化 (核心)
- **检测冲突**：检查 `~/.bvm/bin/bvm` 是否已由 `install.sh` 创建。
- **TTY 交互确认**：
    - 如果存在冲突且在交互环境下，提示用户：“检测到已有 BVM 安装，是否使用 npm 版本接管并覆盖？(y/n)”。
    - 如果用户拒绝或处于非交互环境且未提供强制参数，则终止安装以保护环境。
- **文件部署**：将构建产物（`index.js`, `bvm-shim.sh` 等）从 npm 的 `node_modules` 拷贝到 `~/.bvm/src` 和 `~/.bvm/bin`。
- **环境配置**：自动执行 `bvm setup --silent`，确保 `~/.bvm/bin` 和 `~/.bvm/shims` 被添加到 Shell 配置文件中。

### 3.3 升级与卸载逻辑
- **bvm upgrade**：运行时识别自己是由 npm 安装的，执行升级时提示：“请运行 npm install -g bvm-core 进行更新”。
- **npm uninstall**：由于执行了“本地固化”，npm 卸载只会删除当前的链接，不会破坏 `~/.bvm` 里的持久化命令（这也是为了保证工具链的稳定性）。

## 4. 验收标准
- [ ] 执行 `npm install -g .` (本地验证) 后，可以在任何 Node 版本环境下运行 `bvm`。
- [ ] 运行 `which bvm` 确认其指向的是 `~/.bvm/bin/bvm`。
- [ ] 在已有旧版的环境下安装，能正确触发 TTY 确认提示。
- [ ] 确保 `postinstall` 脚本在 Windows 和 Unix 系统上均能正常工作。
