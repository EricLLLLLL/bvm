# Track Specification: 全量 NPM 发布与智能安装源自动切换 (Full NPM Release & Smart Source Auto-Switch)

## 概览 (Overview)
当前 BVM 安装依赖 GitHub/jsDelivr，稳定性差。本 Track 将 BVM 全量发布到 NPM（含安装脚本），并重构安装脚本实现**智能网络环境感知**。脚本将自动检测用户网络环境（CN vs Global），并据此统一切换 BVM 资源和 Bun Runtime 的下载源，实现“零配置”的稳定安装。

## 功能要求 (Functional Requirements)

1.  **全量 NPM 发布 (Full NPM Release)**:
    -   **内容**: `package.json` 加入 `dist/index.js`, `dist/bvm-shim.sh`, `dist/bvm-shim.js`, `install.sh`, `install.ps1`, `README.md`。
    -   **流程**: GitHub Release -> Build -> Fingerprint -> NPM Publish -> Cnpm Sync -> Verify。

2.  **安装脚本重构 (Smart Install Logic)**:
    -   **目标**: `install.sh` 和 `install.ps1`。
    -   **动态版本解析**: 脚本启动时从 NPM Registry 查询 `latest` 版本号，确保始终安装最新版。
    -   **网络环境探测 (Auto-Detect)**:
        -   脚本启动时，对 `npm.elemecdn.com` (CN) 和 `unpkg.com` (Global) 执行连接测试。
        -   **判定规则**: 根据响应速度和可用性自动判定为 **CN Mode** 或 **Global Mode**。
    -   **源切换 (Source Switching)**:
        -   **CN Mode**: 使用 `npm.elemecdn.com` 获取 BVM 资源，使用 `registry.npmmirror.com` 获取 Bun Runtime。
        -   **Global Mode**: 使用 `unpkg.com` 获取 BVM 资源，使用 `registry.npmjs.org` 获取 Bun Runtime。

3.  **文档更新**:
    -   提供统一的基于 NPM CDN 的安装命令。
    -   彻底移除过时的 GitHub/jsDelivr 引用。

## 非功能性要求 (Non-Functional Requirements)
-   **实时性**: CI 流程必须确保 npmmirror 同步完成后才标记为成功。
-   **无感体验**: 用户无需设置环境变量，脚本自动选择最优解。

## 验收标准 (Acceptance Criteria)
-   [ ] NPM 包包含所有指定文件。
-   [ ] GitHub Actions 发布流程成功并验证同步。
-   [ ] 在模拟 CN 网络环境下，`install.sh` 自动切换到镜像源下载。
-   [ ] `install.ps1` 实现相同的智能逻辑。
