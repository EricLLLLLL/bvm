# Research Report: Bun Download via NPM Mirror

## 1. 概述
本报告旨在评估在 `bvm` 中引入 NPM 镜像源（如 `npmmirror.com`）作为 GitHub Releases 下载替代方案的可行性。这主要是为了解决国内用户在下载 Bun 二进制文件时遇到的速度慢和连接不稳定问题。

## 2. 关键发现

### 2.1 包结构差异
我们在调研中发现，官方 GitHub 发布包（ZIP）与 NPM 发布包（TGZ）在内部文件结构上存在显著差异：

| 特性 | GitHub Releases (Current) | NPM Registry / Mirror |
| :--- | :--- | :--- |
| **格式** | `.zip` | `.tgz` (tarball) |
| **目录结构** | `bun-{platform}-{arch}/bun` | `package/bin/bun` |
| **包含文件** | 二进制文件, 许可证等 | 二进制文件, `package.json`, `README.md` 等 |

**结论**：如果集成 NPM 源，解压逻辑（`extractBun`）必须能够根据下载源的不同，智能处理不同的解压路径。

### 2.2 架构映射 (Mapping)
官方 NPM 包采用了 Scope 命名空间 `@oven`，并遵循特定的命名规范。我们已验证以下映射关系：

| 平台 (OS) | 架构 (Arch) | 官方包名 (Package Name) |
| :--- | :--- | :--- |
| `darwin` | `arm64` | `@oven/bun-darwin-aarch64` |
| `darwin` | `x64` | `@oven/bun-darwin-x64` |
| `linux` | `arm64` | `@oven/bun-linux-aarch64` |
| `linux` | `x64` | `@oven/bun-linux-x64` |
| `win32` | `x64` | `@oven/bun-windows-x64` |

### 2.3 URL 构造规则
针对 NPM 镜像站（以 `npmmirror.com` 为例），下载 URL 的构造规则如下：

```typescript
// 伪代码模板
const baseUrl = "https://registry.npmmirror.com";
const pkgName = `@oven/bun-${platform}-${arch}`; // 例如 @oven/bun-darwin-aarch64
const filename = `bun-${platform}-${arch}-${version}.tgz`;

const downloadUrl = `${baseUrl}/${pkgName}/-/${filename}`;
```
示例：`https://registry.npmmirror.com/@oven/bun-darwin-aarch64/-/bun-darwin-aarch64-1.1.34.tgz`

## 3. 风险与维护

1.  **包名变动风险**：虽然 `@oven` 是官方 Scope，但如果官方更改了包名规则，我们需要更新映射表。
2.  **解压路径依赖**：NPM 包的标准结构通常是 `package/` 根目录，但也需防范官方更改打包方式。
3.  **一致性校验**：GitHub 下载目前使用 `SHASUMS256.txt` 进行校验。NPM Registry 提供了包的 `shasum`，但 `bvm` 目前的校验逻辑可能需要适配。

## 4. 建议方案

基于上述调研，我们建议分阶段实施：

1.  **实现通用解压器**：升级 `src/utils/archive.ts`，支持自动检测并解压 `package/bin/bun` 或 `bun-xxx/bun` 结构。
2.  **配置项支持**：在 `.bvmrc` 或环境变量 `BVM_DOWNLOAD_SOURCE` 中支持 `npm` 选项。
3.  **默认行为保持**：默认仍使用 GitHub，但在检测到长时间下载失败或用户显式配置时切换到 NPM 源。

## 5. 结论
技术上通过 NPM 镜像下载 Bun 是完全可行的。虽然需要处理 `.tgz` 格式和不同的解压路径，但这将显著提升国内用户的体验。
