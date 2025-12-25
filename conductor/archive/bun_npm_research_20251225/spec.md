# Specification: 重构 Bun 下载机制 (NPM-First Strategy)

## 1. 概述 (Overview)
为了解决 GitHub Releases 在国内下载慢的问题，并统一全球分发渠道，`bvm` 将彻底重构 Bun 二进制文件的下载机制。我们将弃用 GitHub Releases，转而全面使用 NPM Registry 作为分发源。

## 2. 核心变更 (Core Changes)

### 2.1 下载源策略
*   **默认 (Default/Global)**: 使用官方 NPM Registry (`https://registry.npmjs.org`).
*   **国内 (China/Fast)**: 使用 NPM Mirror (`https://registry.npmmirror.com`).
*   **机制**: 用户可以通过环境变量（如 `BVM_REGISTRY`）或 `.bvmrc` 配置。如果未配置，将根据网络连通性或简单的时区/语言环境探测自动推荐或回退（待定，首选显式配置或简单的自动检测）。

### 2.2 包结构处理
由于 NPM 包 (`.tgz`) 与 GitHub 包 (`.zip`) 结构不同，必须升级解压逻辑：
*   **支持格式**: 新增 `.tgz` (tarball) 解压支持。
*   **路径映射**: 识别并适配 `package/bin/bun` 的内部目录结构，将其正确提取并重命名/移动到版本管理目录。

### 2.3 废弃 GitHub Releases
*   `bvm install` 将不再尝试从 `github.com` 下载 Bun。
*   相关的 GitHub API 调用（获取 Tag 等）将替换为 NPM API 调用（获取包版本信息）。

## 3. 验收标准 (Acceptance Criteria)
- [ ] **功能**: `bvm install <version>` 能成功从 NPM Registry 下载并安装 Bun。
- [ ] **功能**: 支持配置使用 `registry.npmmirror.com`，且下载速度正常。
- [ ] **兼容性**: 安装后的 Bun 版本目录结构应与旧版保持一致（即用户无感）。
- [ ] **测试**: 包含针对新下载和解压逻辑的单元测试。

## 4. 排除范围 (Out of Scope)
*   BVM 自身的安装脚本 (`install.sh`) 更新（本 Track 仅关注 `bvm` 核心逻辑，脚本更新可另开 Track 或作为后续步骤）。