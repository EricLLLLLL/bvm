# Track Specification: Fix M-series (ARM64) Detection on macOS

## 1. 概述 (Overview)
在 Apple Silicon (M1/M2/M3/M4) 的 Mac 上，如果用户在 Rosetta 2 仿真环境下运行 BVM，会导致架构被误判为 `x64`，从而下载了性能较差且非原生的 Bun。本 Track 旨在引入“原生架构探测”机制，确保在 macOS 上始终优先安装 ARM64 版本。

## 2. 需求 (Requirements)

### 2.1 脚本原生探测
- **`install.sh`**: 在检测到 Darwin 系统时，不应仅依赖 `uname -m`，应通过 `sysctl -in hw.optional.arm64` 确认硬件能力。
- **`postinstall.js`**: 同步引入原生探测逻辑。

### 2.2 核心代码增强
- **`src/utils.ts`**: 重构架构获取逻辑。如果当前进程是 `x64` 但运行在 `darwin` 上，需检查是否支持 `arm64` 并在支持时强制返回 `arm64`。

## 3. 验收标准 (Acceptance Criteria)
- [ ] 在 M 系列 Mac 的 Rosetta 终端下运行安装，应下载 `aarch64` 版本的 Bun。
- [ ] 在 Intel Mac 下运行安装，应正确下载 `x64` 版本的 Bun。
- [ ] `bvm doctor` 应能显示当前检测到的“真实硬件架构”。
