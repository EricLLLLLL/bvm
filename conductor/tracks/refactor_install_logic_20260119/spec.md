# Specification: Refactor Installation Logic & Fix Postinstall Flow

## 1. Overview
本 Track 旨在重构并标准化 BVM 的安装逻辑，重点修复 `scripts/postinstall.js` 中存在的逻辑混乱和错误，并确保 `install.sh` 和 `install.ps1` 遵循完全一致的安装流程。目标是实现一个清晰、线性且健壮的安装体验，无论用户是通过 npm、Shell 还是 PowerShell 进行安装。

## 2. Goals
1.  **统一安装流程**：在所有安装脚本中实现标准化的“检测-测试-配置”流水线。
2.  **修复逻辑错误**：彻底解决 `postinstall.js` 中关于系统 Bun 检测、版本号格式（强制 `v` 前缀）以及 Runtime 复用的逻辑漏洞。
3.  **增强 NPM 体验**：为 `npm install -g bvm-core` 增加醒目的 ASCII Logo 和清晰的操作指引。

## 3. Functional Requirements

### 3.1 Standard Installation Workflow (Core Logic)
所有脚本 (`postinstall.js`, `install.sh`, `install.ps1`) 必须严格执行以下顺序：
1.  **初始化**：下载或提取 BVM 核心代码（NPM 场景下核心代码已存在）。
2.  **系统 Bun 检测**：检查环境变量 `PATH` 中是否存在 `bun` 可执行文件。
3.  **冒烟测试 (Smoke Test)**：
    -   如果存在系统 Bun，尝试运行 `bun <bvm-core>/index.js --version`。
    -   **Pass**：该系统 Bun 兼容，可直接用作 BVM 的宿主 Runtime。
    -   **Fail**：该系统 Bun 不兼容（版本过低等）。
4.  **Runtime 配置**：
    -   **Scenario A (Test Passed)**：
        -   将系统 Bun 复制/链接到 `~/.bvm/versions/v<version>`。
        -   设置 `~/.bvm/runtime/current` 指向该版本。
    -   **Scenario B (Test Failed or No System Bun)**：
        -   **即使测试失败**，仍将系统 Bun 注册到 `~/.bvm/versions/v<version>`（保留用户原有版本）。
        -   自动下载 BVM 官方推荐的最新稳定版 Bun Runtime。
        -   将下载的版本解压到 `~/.bvm/versions/v<latest>`。
        -   设置 `~/.bvm/runtime/current` 指向这个新下载的版本。
5.  **默认版本设置**：
    -   将步骤 4 中选定的版本（系统复用版或新下载版）设置为 `default` alias。
    -   **Critical**：确保所有版本号目录和 Alias 必须包含 `v` 前缀（如 `v1.3.6`），严禁出现纯数字版本号。
6.  **环境配置**：
    -   运行 `bvm setup` 或执行等效逻辑，确保 BVM 的 shims 路径添加到用户 Shell 配置文件的**最末尾**，以确保 BVM 命令优先级高于系统 Bun。

### 3.2 Postinstall Specifics (`postinstall.js`)
-   **ASCII Logo**：在脚本启动时输出与 `install.sh` 风格一致的 BVM ASCII Art。
-   **Success Message**：安装完成后，输出醒目的绿色提示，明确告知用户 BVM 已安装、路径已配置，并提示运行 `source` 命令。

## 4. Acceptance Criteria
-   [ ] **Postinstall 修复**：`scripts/postinstall.js` 能够正确处理“有系统 Bun 但版本过低”的情况，自动下载新版作为 Runtime，同时保留旧版在 versions 中。
-   [ ] **版本号规范**：安装后的 `~/.bvm/versions/` 目录下所有文件夹名均以 `v` 开头。
-   [ ] **Runtime 有效性**：安装后，`~/.bvm/runtime/current/bin/bun` 必须能够成功执行 `src/index.js`。
-   [ ] **PATH 优先级**：安装后，`which bun` 应该指向 `~/.bvm/shims/bun`（在 source 之后）。
-   [ ] **UI 一致性**：`npm install` 过程包含 Logo 和清晰的后续指引。

## 5. Out of Scope
-   修改 `src/index.js` 内部的核心业务逻辑（仅关注安装引导）。
-   对非主流 Shell（如 csh, ksh）的支持。
