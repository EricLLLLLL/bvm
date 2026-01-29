### Implementation Plan: fix_windows_bunx_20260128

#### Phase 1: Core Shim & Template Optimization
*目标：在核心代码层面修复身份识别和路由逻辑。*

- [ ] Task: 更新 Windows JS Shim 模板 (`src/templates/win/bvm-shim.js`)，实现 `bunx` 到 `bun x` 的显式指令路由。 [x]
- [ ] Task: 更新 Windows CMD 模板 (`src/templates/win/bunx.cmd` & `bun.cmd`)，为快速通道添加 `x` 路由支持。 [x]
- [ ] Task: 优化 Unix Shim 模板 (`src/templates/unix/bvm-shim.sh`)，使用 `exec -a` 增强身份识别稳定性。 [x]
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Shim & Template Optimization' (Protocol in workflow.md)

#### Phase 2: Installer & Self-Repair Evolution
*目标：确保新安装及现有环境均能自动补全所需的物理文件。*

- [ ] Task: 改进 `install.ps1` (Windows)，增加 `bunx.exe` 副本生成逻辑及旧版本扫描修复。 [x]
- [ ] Task: 改进 `install.sh` (Unix)，完善运行时下载后的 `bunx` 软链接创建。 [x]
- [ ] Task: 更新 `src/commands/setup.ts`，确保运行 `bvm setup` 时能递归修复所有已安装版本的 `bunx` 文件。 [ ]
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Installer & Self-Repair Evolution' (Protocol in workflow.md)

#### Phase 3: Verification & TDD
*目标：通过测试验证修复效果，并确保发布版本同步。*

- [ ] Task: 编写或更新 `test/bunx_consistency.test.ts`，在模拟环境下验证 Windows 路由和文件补全。 [ ]
- [ ] Task: 执行 `bun run build` 同步所有安装脚本版本，并运行全量测试。 [x]
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification & TDD' (Protocol in workflow.md)
