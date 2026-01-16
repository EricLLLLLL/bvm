# Specification: UUV Comprehensive Test Suite for BVM

## Overview
本项目旨在利用 `uuv` 框架为 `bvm` 构建一个全方位的端到端 (E2E) 测试套件。**核心目标是提供一套在本地开发环境下即可运行的完备测试方案**，覆盖从安装到所有核心命令的功能，并最终通过 GitHub Actions 确保跨平台一致性。

## Functional Requirements
- **本地一键运行**: 提供本地脚本（如 `./e2e/run.sh`），允许开发者在本地环境下快速触发 `uuv` 测试。
- **环境模拟**: 
    - macOS/Windows: 直接在 Host 系统运行 `uuv`。
    - Linux: 支持通过本地 Docker 容器运行 `uuv` 测试，确保 Linux 兼容性无需提交代码即可验证。
- **全流程覆盖**: 
  - **安装**: 验证 `install.sh` / `install.ps1`。
  - **核心命令**: `install`, `use`, `ls`, `ls-remote`, `alias`, `unalias`, `current`, `which` 等。
  - **高级功能**: `rehash`, `doctor`, `upgrade`, `deactivate`.
- **Shim 机制隔离性**: 严格验证 `bvm` 管理的运行时与系统原生版本的隔离。

## Non-Functional Requirements
- **快速反馈循环**: 测试应支持标签过滤（Tags），允许只运行特定的命令测试以节省时间。
- **CI/CD 对齐**: 本地运行逻辑应与 GitHub Actions 保持一致。
- **无副作用**: 测试应在 `.test-env` 或临时目录下进行，避免破坏开发者的全局 `bvm` 配置。

## Acceptance Criteria
- [ ] 开发者可以在本地 macOS 环境下一键运行所有核心命令的 `uuv` 测试。
- [ ] 提供 Dockerfile 或脚本，支持在本地模拟 Linux 环境运行相同测试。
- [ ] 所有 `bvm` 命令在本地测试中均有覆盖。
