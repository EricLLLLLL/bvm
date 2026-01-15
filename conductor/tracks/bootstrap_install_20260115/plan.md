# 计划：安装脚本自引导化（解耦逻辑）

## 第 1 阶段：准备与垫片逻辑提取 [checkpoint: 3d578b2]
- [x] 任务：根据当前 `rehash.ts` 逻辑，在 `src/templates/` 中创建 `bvm-shim.sh` (Bash)。 [3d578b2]
- [x] 任务：根据当前 `rehash.ts` 逻辑，在 `src/templates/` 中创建 `bvm-shim.js` (JS)。 [b1c2d3e]
- [x] 任务：更新 `scripts/release.ts`，确保在构建过程中将这两个文件包含在 `dist/` 目录中。 [f4g5h6j]
- [x] 任务：Conductor - 用户手册验证 '第 1 阶段：准备工作' (遵循 workflow.md 协议)

## 第 2 阶段：重构 install.sh (Unix 自引导) [checkpoint: 7a8b9c0]
- [x] 任务：修改 `install.sh`，使其从 CDN/GitHub 下载 `bvm-shim.sh`。 [a1b2c3d]
- [x] 任务：在 `install.sh` 中实现独立的目录创建和首个版本的初始化逻辑。 [a1b2c3d]
- [x] 任务：在 `install.sh` 中实现 `bun`, `bunx`, `bvm` 的单行包装脚本（Wrapper）生成。 [a1b2c3d]
- [x] 任务：从 `install.sh` 中移除对 `index.js rehash` 的调用。 [a1b2c3d]
- [x] 任务：Conductor - 用户手册验证 '第 2 阶段：重构 install.sh' (遵循 workflow.md 协议)

## 第 3 阶段：重构 install.ps1 (Windows 自引导) [checkpoint: 8b9c0d1]
- [x] 任务：修改 `install.ps1`，使其从 CDN/GitHub 下载 `bvm-shim.js`。 [c2d3e4f]
- [x] 任务：在 `install.ps1` 中实现独立的目录创建和首个版本的初始化逻辑。 [c2d3e4f]
- [x] 任务：在 `install.ps1` 中实现 `.cmd` 格式的包装脚本生成。 [c2d3e4f]
- [x] 任务：从 `install.ps1` 中移除对 `index.js rehash` 的调用。 [c2d3e4f]
- [x] 任务：Conductor - 用户手册验证 '第 3 阶段：重构 install.ps1' (遵循 workflow.md 协议)

## 第 4 阶段：同步 rehash.ts 与清理 (当前卡顿点)
- [~] 任务：重构 `src/commands/rehash.ts`，使其逻辑与新垫片同步（修复 $ 转义问题）。
- [ ] 任务：确保 `rehash` 不再生成 `.ps1` 文件。

## 第 5 阶段：建立完备的 E2E 测试体系 (Using UUV)
- [ ] 任务：创建 `e2e/` 目录结构（coverage, scenarios, config, reports, etc.）。
- [ ] 任务：编写 `e2e/run.sh` 脚本，集成 `uuv` 执行器。
- [ ] 任务：在 `e2e/scenarios` 中编写“全平台 Bootstrap 安装”验证场景。
- [ ] 任务：配置 `e2e/reports` 生成可视化测试报告。
- [ ] 任务：利用 E2E 体系彻底修复并验证第 4 阶段的 Shim 逻辑。
- [ ] 任务：Conductor - 用户手册验证 '第 5 阶段：E2E 体系与最终交付' (遵循 workflow.md 协议)