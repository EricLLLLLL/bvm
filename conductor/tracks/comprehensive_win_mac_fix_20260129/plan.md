# 实施计划: Windows 全局安装与环境兼容性全面修复 (含 macOS 同步)

## 阶段 1: 基础设施优化与警告清理 (Infrastructure & Warning Cleanup)
本阶段重点解决安装过程中的警告信息，并优化基础配置文件的生成逻辑。

- [x] Task: 修复 `postinstall.js` 中的 Node.js DEP0190 警告
    - [x] 编写测试：模拟 Windows 环境下的命令调用，捕获 stderr 警告。
    - [x] 实施：修改 `postinstall.js` 的 `run` 函数，避免在 Windows 上不必要地使用 `shell: true`。
- [x] Task: 优化 `install.ts` 的 `bunfig.toml` 生成逻辑
    - [x] 编写测试：验证在 Windows 路径下生成的 TOML 包含双反斜杠转义。
    - [x] 实施：修正 `generateBunfig` 函数，实现平台感知的路径转义。
    - [x] 实施：集成测速逻辑，将最优镜像源写入 `bunfig.toml`。
- [x] Task: 消除 `bun install` 的 PATH 警告 (全平台)
    - [x] 编写测试：模拟环境变量检测逻辑。
    - [x] 实施：修改 `setup.ts` 和安装脚本，统一将 `current/bin` 添加到 `PATH` 的末尾（仅用于满足 Bun 检查）。
- [x] Task: Conductor - User Manual Verification '阶段 1' (Protocol in workflow.md) [checkpoint: 5173e29]

## 阶段 2: 全平台命令拦截与自动刷新 (Cross-Platform Intercept & Auto-Rehash)
本阶段实现核心的拦截逻辑，确保全局安装的命令能即装即用，并保持多平台架构一致。

- [ ] Task: 重写 `bun.cmd` 拦截器模板 (Windows)
    - [ ] 编写测试：验证 `bun.cmd` 能正确识别 `install/add` 等关键词。
    - [ ] 实施：更新 `src/templates/win/bun.cmd`，加入 `EXIT_CODE` 检测和同步 `rehash` 调用。
- [ ] Task: 增强 `bvm-shim.sh` 拦截逻辑 (macOS/Linux)
    - [ ] 编写测试：验证 Unix shim 在执行安装命令后触发后台 rehash。
    - [ ] 实施：在 `src/templates/unix/bvm-shim.sh` 中添加对 `install/add` 等命令的检测，并在成功退出后后台运行 `bvm rehash --silent`。
- [ ] Task: 在 JS Shim 层集成自动 Rehash (通用兜底)
    - [ ] 编写测试：验证 `bvm-shim.js` 的退出钩子逻辑。
    - [ ] 实施：在 `bvm-shim.js` 中加入后台 `rehash` 触发逻辑，作为所有平台的通用兜底。
- [ ] Task: Conductor - User Manual Verification '阶段 2' (Protocol in workflow.md)

## 阶段 3: 稳定性增强与综合验证 (Stability & Final Verification)
本阶段解决下载完整性问题，并进行最终的跨平台功能验证。

- [ ] Task: 增强下载重试与完整性处理
    - [ ] 编写测试：模拟网络中断导致的损坏文件，验证 BVM 能自动清理并重试。
    - [ ] 实施：优化 `install.ts` 中的 `downloadFileWithProgress` 和缓存清理逻辑。
- [ ] Task: 综合冒烟测试
    - [ ] 任务：在 Windows 和 macOS 环境上分别运行 `bvm install` -> `bun i -g <pkg>` -> `<pkg>`。
    - [ ] 任务：确认全平台不再出现任何警告（DEP0190, PATH warn）。
- [ ] Task: Conductor - User Manual Verification '阶段 3' (Protocol in workflow.md)
