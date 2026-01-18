# Specification: fix_release_upgrade_sync_20260118

## Overview
解决 BVM 发布与升级流程中的不一致问题。目前 npm 仓库已到达 v1.1.11，但 GitHub Release 停留在 v1.1.9，且 `bvm upgrade` 仍依赖 GitHub/jsDelivr 导致无法检测到最新版。本任务旨在修复 CI 发布流程并重构升级检测逻辑，使其完全基于 npm 仓库，并引入网络竞速策略以提升国内外的访问速度。

## Functional Requirements
1. **重构版本检测逻辑 (集成竞速策略)**：
   - 修改 `src/api.ts` 中的 `fetchLatestBvmReleaseInfo` 方法。
   - 移除对 jsDelivr 和 GitHub API 的依赖，改为直接查询 npm registry (`bvm-core` 包) 的 `latest` 标签。
   - **关键需求**：必须复用或实现网络竞速策略（Race Strategy），同时探测多个源（如官方 npm registry, npmmirror 等），选取响应最快的源来获取版本信息。
2. **严格的版本同步**：
   - 优化发布脚本（`scripts/release.ts`）或 CI 流程。
   - 确保在打 Tag 和发布前，强制将 `install.sh`、`install.ps1` 和 `package.json` 中的版本号更新为目标版本。
   - 确保 Git Tag 与上述文件中的版本号严格一致。
3. **修复 GitHub Actions 发布流程**：
   - 检查并修正 `.github/workflows/auto-release.yml`。
   - 确保在 npm 发布成功后，能够正确创建并推送 Git Tag。
   - 确保 GitHub Release 能够自动生成并指向最新的 Tag。
4. **优化升级过程**：
   - 确保 `bvm upgrade` 下载更新包时同样遵循竞速策略，从最快的源下载。

## Non-Functional Requirements
- **可靠性**：需处理好 npm 镜像（如淘宝镜像）与官方源的同步时延问题。
- **性能**：版本检查和下载请求必须使用最优线路。

## Acceptance Criteria
- 运行 `bvm upgrade` 能正确识别出 npm 上的 v1.1.11（或更高版本）为最新版。
- 在不同网络环境下（CN/Global），升级命令都能快速响应（验证竞速逻辑生效）。
- 模拟新版本发布时，`install.sh` 和 `install.ps1` 中的版本号被正确同步。
- GitHub Actions 能自动完成：1) npm 发布 2) Git Tag 推送 3) GitHub Release 创建。

## Out of Scope
- 修改 Bun 运行时的下载逻辑（除非 BVM 自身的升级包下载受到影响）。
