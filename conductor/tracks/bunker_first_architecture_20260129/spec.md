# Track: BVM “地堡优先”架构实现与 Windows 物理路径对齐

## 1. 概述
实施“地堡优先”（Bunker-First）架构：将 `runtime/` 设为 BVM 的核心物理存储层，将 `versions/` 设为版本注册表。针对不同系统采用差异化策略：Unix 使用软链接，Windows 使用更稳健的物理拷贝或 Junction，并配合 `bunfig.toml` 实现全平台路径锁定。同时优化安装逻辑，实现已安装版本的自动识别与切换。

## 2. 功能需求
### 2.1 地堡物理存储层 (`runtime/`)
- 所有下载或检测到的 Bun 版本，物理实体文件统一存放在 `~/.bvm/runtime/vX.Y.Z`。
- 每个物理目录下必须包含 `bunfig.toml`，硬编码 `globalDir` 和 `globalBinDir` 指向该物理路径。
- 该目录是 BVM 的运行基准，受 BVM 保护。

### 2.2 版本注册中心 (`versions/`)
- **Unix (macOS/Linux)**：`~/.bvm/versions/vX.Y.Z` 是一个软链接，指向 `../runtime/vX.Y.Z`。
- **Windows**：`~/.bvm/versions/vX.Y.Z` 采用 **物理文件拷贝**（或在权限允许时使用 Junction），确保 `claude` 等工具在任何环境下都能通过真实路径找到模块。
- **当前版本**：`~/.bvm/current` 始终指向 `versions/` 目录下的对应条目。

### 2.3 安装逻辑与幂等性
- **初始化**：BVM 安装时默认将第一个 Bun 版本物理化到 `runtime/`。
- **智能安装检查**：`bvm install` 在执行前会检查 `runtime/` 是否已有该版本。若已存在，则提示用户“已安装”，并自动调用 `bvm use` 切换到该版本，不再重复下载。

### 2.4 扁平化路径锁定
- 通过注入 `bunfig.toml`，强制 `bun install -g` 将包安装在版本目录内部，实现物理级的版本隔离。

## 3. 验收标准
- [ ] `~/.bvm/runtime` 目录下存有物理实体文件及 `bunfig.toml`。
- [ ] Windows 下的 `versions/` 目录不依赖不稳定软链接，通过物理路径提供服务。
- [ ] 运行 `bvm install <已安装版本>` 会自动切换当前版本而不会触发重新下载。
- [ ] 运行 `bvm use` 后，`current` 能够准确通过 `versions` 层级定位到 `runtime` 实体。
- [ ] 存量版本通过 `bvm rehash` 可自动完成从旧结构到新架构的迁移。
