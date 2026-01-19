# Specification: Comprehensive NPM Install & E2E Verification

## Overview
本 Track 旨在创建一个“终极”端到端（E2E）验证脚本，专门用于在发布前模拟真实的 `npm install -g bvm-core` 流程。该脚本将物理隔离运行，验证从安装、运行时修复、到跨版本管理的完整生命周期，确保发布的版本在用户机器上“即装即用”且具备自愈能力。

## Goals
1.  **物理级模拟**：在隔离的沙盒目录中执行真实的 `npm install -g <local-source>`，而非仅运行 JS 逻辑。
2.  **全链路覆盖**：验证安装后自动修复（Runtime Fix）、环境隔离、以及多版本切换功能。
3.  **发布准入**：作为 Release 流程的最后一道关卡，脚本失败必须阻断发布。
4.  **极简反馈**：采用 Fail-Fast 策略，出错即退出，适合 CI 环境。

## Functional Requirements

### 1. Sandbox Environment Setup
- **动作**：脚本启动时创建一个全新的临时目录（如 `.e2e-sandbox/`）。
- **配置**：
    - 伪造 `HOME` 目录以隔离真实用户配置。
    - 伪造 `PATH` 环境变量，仅保留系统必要路径（如 `/usr/bin`, `/bin`）和当前的 Node/npm 环境。
- **清理**：测试结束后（无论成功失败）必须彻底清理沙盒，避免污染。

### 2. NPM Global Install Simulation
- **输入**：当前项目的根目录（作为包源）。
- **执行**：运行 `npm install -g .`（指向本地）。
- **验证点**：
    - `postinstall` 脚本成功执行无报错。
    - `~/.bvm/bin/bvm` (Shim) 和 `~/.bvm/src/index.js` (Core) 存在。
    - `~/.bvm/bin/bvm` 具有可执行权限。

### 3. Runtime Bootstrap Verification (Scenario 2 Coverage)
- **前置条件**：模拟一个仅有 `npm` 和 `node` 的环境（或带有特定版本 `bun` 的环境）。
- **验证点**：
    - 安装后，`~/.bvm/runtime/current` 链接指向有效。
    - **自愈逻辑**：验证 BVM 是否成功将宿主机的 `bun` 纳管（Imported）或自动下载了新版。
    - 执行 `bvm --version` 必须成功返回版本号。

### 4. Version Management & Switching
- **动作**：
    1.  运行 `bvm install latest`。
    2.  运行 `bvm use latest`。
    3.  运行 `bun --version`。
- **验证点**：
    - `current` 链接更新指向新版本。
    - `bun` 命令指向新安装的版本而非宿主版本。
    - 能够安装并切换回旧版本（如果有）。

### 5. Conflict & Upgrade Safety
- **场景**：在已安装 BVM 的沙盒中再次运行 `npm install -g .`。
- **验证点**：
    - 必须触发“自动升级”逻辑（因为同源）。
    - 只有当 `BVM_INSTALL_SOURCE="npm"` 标记存在时才允许覆盖。
    - 不应弹出任何交互式询问（TTY Check 应被绕过或自动回答）。

## Non-Functional Requirements
- **Performance**：整个 E2E 流程（不含网络下载耗时）应在 30 秒内完成。
- **Reliability**：脚本必须是幂等的，多次运行不应有副作用。
- **Feedback**：
    - Success: Exit code 0, single line "E2E Verification Passed".
    - Failure: Exit code 1, print stderr of the failing command.

## Out of Scope
- 对 `install.sh` (Curl/Bash) 安装方式的验证（本 Track 专注 NPM 路径）。
- 对 Windows PowerShell 的深度兼容性测试（本验证主要针对 Unix-like 环境，或使用跨平台 Node 脚本但侧重逻辑验证）。
