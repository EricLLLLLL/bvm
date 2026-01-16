# BVM 架构与流程文档

> **定位**: 本文档是 BVM 内部架构、安装流程和发布机制的单一真实来源。它既设计为供 AI 代理阅读（作为 Knowledge Base），也供人类贡献者参考。

## 1. 安装逻辑 (`install.sh` & `install.ps1`)

BVM 采用“自引导（Bootstrap）”安装模式。安装脚本（Shell/PowerShell）负责环境的初始设置和运行时的下载，而不是分发一个打包好的二进制可执行文件。

### 1.1 Unix 安装流程 (`install.sh`)

```mermaid
graph TD
    Start(用户运行 install.sh) --> Geo{IP 探测 (1.1.1.1)}
    Geo -- loc=CN --> Race_CN[竞速: npmmirror, tencent, npmjs]
    Geo -- loc=Other --> Race_Global[竞速: npmjs, npmmirror]
    Geo -- Timeout --> Race_Global
    
    Race_CN --> SetRegistry[选定最快源]
    Race_Global --> SetRegistry
    
    SetRegistry --> ResolveVer[解析 Bun 版本]
    
    ResolveVer --> CheckRuntime{Runtime 已安装?}
    CheckRuntime -- 是 --> LinkCurrent[链接 runtime/current]
    CheckRuntime -- 否 --> DownloadRuntime[下载 bun-runtime.tgz]
    DownloadRuntime --> ExtractRuntime[解压至 versions/vX.Y.Z]
    ExtractRuntime --> LinkCurrent
    
    LinkCurrent --> DownloadBVM[下载 BVM 源码 (index.js)]
    DownloadBVM --> DownloadShim[下载 Shim 逻辑 (bvm-shim.sh)]
    DownloadShim --> CreateWrappers[创建 'bvm' 包装器 & Shims]
    
    CreateWrappers --> FirstInit[将 'default' 别名链接到当前版本]
    FirstInit --> RunSetup[运行 'bvm setup']
    
    RunSetup --> DetectShell[检测 Shell (zsh/bash/fish)]
    DetectShell --> ModProfile[修改 Profile (.zshrc/.bashrc/config.fish)]
    ModProfile --> End(安装完成)
```

**关键实现细节:**
*   **文件:** `install.sh`
*   **智能源选择:** 结合 IP 地理位置检测（Cloudflare Trace）与实时竞速策略（Race Strategy），在 Official、Taobao、Tencent 源中选择最快的一个。
*   **运行时解析:** 从 Registry 获取 `dist-tags` 以确定兼容的最新 Bun 版本。
*   **无依赖:** 脚本仅依赖系统自带的 `curl` 和 `tar`。
*   **Shim 生成:** 静态生成 `bvm` (CLI 入口) 和 `bun/bunx` (Shims) 脚本文件，指向正确的路径。

### 1.2 Windows 安装流程 (`install.ps1`)

```mermaid
graph TD
    Start(用户运行 install.ps1) --> PreClean[清理旧 Shims]
    PreClean --> Geo{IP 探测}
    Geo -- loc=CN --> Race_CN[竞速: npmmirror, tencent, npmjs]
    Geo -- Other --> Race_Global[竞速: npmjs, npmmirror]
    
    Race_CN --> SetRegistry[选定最快源]
    Race_Global --> SetRegistry
    
    SetRegistry --> ResolveVer[解析 Bun 版本]
    
    ResolveVer --> CheckRuntime{Runtime 已安装?}
    CheckRuntime -- 否 --> DownloadRuntime[下载 bun-windows-x64.tgz]
    DownloadRuntime --> Extract[解压至 .bvm/versions/vX]
    Extract --> LinkRuntime[创建 Junction: runtime/current -> versions/vX]
    CheckRuntime -- 是 --> LinkRuntime
    
    LinkRuntime --> DownloadSrc[下载 dist/index.js & bvm-shim.js]
    DownloadSrc --> CreateShims[创建 .cmd Shims]
    
    CreateShims --> ModPath[更新用户 PATH 环境变量]
    ModPath --> RunSetup[运行 'bvm setup' (PowerShell Profile 更新)]
    RunSetup --> End(安装完成)
```

**关键实现细节:**
*   **文件:** `install.ps1`
*   **原生 Powershell:** 使用 `Invoke-WebRequest` 和 `Invoke-RestMethod`。
*   **兼容性:** 针对 PowerShell 5.1 做了专门适配（处理 `$IsWindows` 缺失问题）。
*   **Junctions:** 使用 Windows Junctions (`New-Item -ItemType Junction`) 代替软链接，以获得更好的兼容性且无需管理员权限。
*   **环境变量:** 直接修改 `[Environment]::SetEnvironmentVariable("Path", ...)` 以确保持久化。

---

## 2. 命令实现流程

BVM 使用一个轻量级的 Router 来分发命令。架构上将“CLI 入口”与“命令逻辑”分离。

### 2.1 CLI 架构

```mermaid
graph LR
    UserInput(bvm install 1.0.0) --> Router[src/index.ts: App.run()]
    Router --> ParseArgs[util.parseArgs]
    ParseArgs --> MatchCommand{匹配命令?}
    
    MatchCommand -- 是 --> ActionHandler[执行 Action]
    MatchCommand -- 否 --> ShowHelp[显示帮助]
    
    ActionHandler --> CommandFunc[例如: commands/install.ts: installBunVersion]
    CommandFunc --> Utils[工具库: npm-lookup, ui, etc.]
    
    subgraph Execution Context
    Utils --> BunRuntime[Bun Runtime (Current)]
    end
```

### 2.2 命令映射表

| 命令 | 文件路径 | 描述 |
| :--- | :--- | :--- |
| `install` | `src/commands/install.ts` | 从 NPM Registry 下载并解压 Bun 版本。 |
| `use` | `src/commands/use.ts` | 更新 `~/.bvm/runtime/current` 软链接。 |
| `ls-remote` | `src/commands/ls-remote.ts` | 从 NPM Registry 获取可用版本 (`npm view`)。 |
| `alias` | `src/commands/alias.ts` | 在 `~/.bvm/aliases/` 中创建命名软链接。 |
| `setup` | `src/commands/setup.ts` | 检测 Shell 并修改 `.rc` 文件或 PowerShell Profile。 |
| `upgrade` | `src/commands/upgrade.ts` | 从 CDN 重新下载最新的 BVM 源代码。 |

---

## 3. 测试策略与环境

BVM 采用双层测试策略，确保内部逻辑正确性和端到端（E2E）的可靠性。

### 3.1 测试金字塔

```mermaid
block-beta
  columns 1
  block:E2E
    E2E_Tests["E2E 测试 (execa + sandbox)"]
  end
  block:Unit
    Unit_Tests["单元测试 (bun:test)"]
  end
```

### 3.2 测试规范

| 级别 | 范围 | 工具 | 位置 | 环境要求 |
| :--- | :--- | :--- | :--- | :--- |
| **Unit** | 内部逻辑 (`semver`, `npm-lookup`, `utils`) | `bun:test` | `test/*.test.ts` | 已安装 `bun`。 |
| **E2E** | 完整 CLI 工作流, 文件系统, Shell 配置 | `execa`, `bun:test` | `test/e2e/*.test.ts` | `bun`, `pwsh` (用于在 macOS/Linux 上测试 Windows 逻辑)。 |

### 3.3 CI 集成 (`.github/workflows/ci.yml`)

每次 Push 或 PR 到 `main` 分支时自动运行测试。
*   **矩阵:** `ubuntu-latest`, `macos-latest`, `windows-latest`。
*   **命令:** `bun test test/e2e` (环境变量 `CI=true`)。

---

## 4. 发布流程与集成

发布流程通过 GitHub Actions 完全自动化，确保安装脚本始终指向有效的 Artifacts。

### 4.1 发布流水线 (`auto-release.yml`)

```mermaid
sequenceDiagram
    participant User
    participant Git as GitHub (Repo)
    participant Action as GitHub Actions
    participant NPM as NPM Registry
    participant CDN as jsDelivr

    User->>Git: Push to main (package.json 版本变更)
    Git->>Action: 触发 'check-and-release'
    Action->>Action: 检查 Tag 是否存在
    
    alt Tag 已存在
        Action->>Action: 停止
    else 新版本
        Action->>Action: bun install & bun run build
        Action->>Git: 提交 'dist/' 产物 (skip ci)
        Action->>Git: 创建 Tag (v1.2.3)
        Action->>Git: 推送 Tag
        Action->>Git: 创建 GitHub Release (上传 install.sh/ps1)
        
        Action->>CDN: 清除缓存 (Purge API)
        Note over CDN: /dist/index.js, /install.sh, etc.
    end
```

### 4.2 产物耦合

*   **安装脚本源:** `install.sh` 和 `install.ps1` 从 `cdn.jsdelivr.net` 下载 `index.js` 和 `bvm-shim.sh`。
*   **版本控制:** URL 中包含版本 Tag: `.../gh/EricLLLLLL/bvm@v1.0.6/dist/index.js`。
*   **自更新:** `bvm upgrade` 命令通过 GitHub API 获取 `latest` Tag 来确定新版本，然后下载新的源代码。

---

## 5. 全球加速与镜像方法论

BVM 旨在实现全球范围内的“0ms 延迟”和“高可用性”。

### 5.1 架构

```mermaid
graph TD
    UserRequest[用户请求] --> Geo{Cloudflare IP 探测}
    Geo -- CN --> Race_CN[竞速: 淘宝, 腾讯, 官方]
    Geo -- Global --> Race_Global[竞速: 官方, 淘宝]
    
    Race_CN --> Selected_Mirror[选定 Registry]
    Race_Global --> Selected_Mirror
    
    subgraph "静态资源 (BVM 源码)"
    UserRequest --> jsDelivr[cdn.jsdelivr.net]
    jsDelivr --> Fastly[Fastly Edge]
    jsDelivr --> Cloudflare[Cloudflare Edge]
    end
```

### 5.2 实施规则

1.  **Geo-Location (IP 探测):** 访问 `https://1.1.1.1/cdn-cgi/trace` 获取用户地理位置 (`loc=CN`)。设置 500ms 超时，快速失败。
2.  **Race Strategy (竞速策略):** 对候选源（npmmirror, tencent, npmjs）并发发起 `HEAD` 请求，选用响应最快的源。
3.  **资源托管:** BVM 不维护自己的后端。所有二进制文件均来源：
    *   **BVM 逻辑:** GitHub Repo -> jsDelivr CDN。
    *   **Bun Runtimes:** 官方 NPM 包 (`@oven/bun-...`) -> 智能选定的 Registry。
4.  **零配置:** 用户无需手动设置 `BVM_MIRROR`。系统“默认智能”。

---

## 6. 已知限制与技术债 (Known Issues)

### 6.1 Shim 性能与实现
*   **现状:** Windows Shim (`bun.cmd`) 和 Unix Shim (`bun`) 目前调用 `bvm-shim.js` 来处理逻辑。这意味着每次运行 `bun` 命令都需要启动一次 Bun JS 运行时。
*   **影响:** 相比于原生二进制（Native）或纯 Batch/Shell 实现，存在一定的启动延迟。
*   **计划:** 未来考虑迁移到 Rust/Go 编写的 Native Shim 或纯 CMD/Bash 实现以追求极致性能。

### 6.2 Upgrade 命令局限性
*   **现状:** `bvm upgrade` 目前仅更新 `dist/index.js` (CLI 核心逻辑)。
*   **问题:** 它**不会**更新 `bvm-shim.js` 或 Shim 包装器脚本。如果 Shim 逻辑发生变更，用户升级后可能遇到不兼容问题。
*   **规避:** 建议用户在遇到奇怪问题时，重新运行安装脚本进行“覆盖安装”以更新所有组件。

## 7. 跨平台验证方法论 (Cross-Platform Verification)

BVM 的核心原则之一是“跨平台一致性”。为了在单一操作系统（如 macOS）上验证所有平台的 Installer 和 Shims，必须遵循以下规程：

### 7.1 Windows 逻辑验证 (在 macOS 上)
*   **工具链**: 使用 Homebrew 安装的 `pwsh` (PowerShell Core)。
*   **E2E 规程**: 
    1.  利用 `test/e2e/install-ps1.test.ts` 进行全量安装测试。
    2.  **隔离性**: 必须通过 `$env:BVM_DIR` 环境变量重定向安装路径，避免污染宿主机环境。
    3.  **模板同步**: 任何对 `src/templates` 的修改，必须同步更新至 `install.ps1` 内部的硬编码模板。

### 7.2 Unix 逻辑验证
*   **工具链**: 纯 `bash`。
*   **E2E 规程**: 使用 `scripts/verify-install.ts` 或 `test/e2e/install.test.ts`。
*   **性能审计**: 修改 `bvm-shim.sh` 后，应运行 `scripts/audit-bench.ts` 确保初始化开销控制在 10ms 以内。

### 7.3 模板一致性
*   **原则**: BVM CLI (`setup` 命令) 与外部 Installer (`install.sh/ps1`) 生成的产物必须具备 **二进制级别的等效性**。
