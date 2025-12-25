# Plan: 重构 Bun 下载机制 (NPM-First Strategy)

## Phase 1: 技术调研与包结构分析 (Technical Research) [checkpoint: 237a204]
- [x] Task: 深入分析 `node_modules/bun` 及其相关架构包。 c7e7706
    - [x] 检查 `package.json` 中的依赖关系，确认官方如何分发不同平台的二进制文件。
    - [x] 提取 NPM 包名与系统架构（OS/Arch）的映射规律。
- [x] Task: 验证 NPM 镜像站 URL 构造规则。 c7e7706
    - [x] 确认从 `registry.npmmirror.com` 下载特定版本 `.tgz` 包的路径格式。
    - [x] 手动尝试下载并解压，验证二进制文件的位置（例如是在 `package/bin/bun` 还是其他路径）。
- [x] Task: Conductor - User Manual Verification 'Phase 1: 技术调研与包结构分析' (Protocol in workflow.md) [checkpoint: 237a204]

## Phase 2: 基准测试与数据采集 (Benchmarking) [checkpoint: 91424af]
- [x] Task: 开发自动化基准测试脚本 `scripts/benchmark-download.ts`。 c7e7706
    - [x] 实现针对 GitHub Releases 的下载测速逻辑。
    - [x] 实现针对 NPM Registry 的下载测速逻辑。
    - [x] 实现针对 `npmmirror.com` 的下载测速逻辑。
    - [x] 脚本应支持指定 Bun 版本进行多轮测试以取平均值。
- [x] Task: 运行测试并收集数据。
    - [x] 在当前网络环境下执行脚本。
    - [x] 整理测速结果（下载耗时、成功率、稳定性）。
- [x] Task: Conductor - User Manual Verification 'Phase 2: 基准测试与数据采集' (Protocol in workflow.md) [checkpoint: 91424af]

## Phase 3: 汇总报告与决策支持 (Reporting & Decision)
- [x] Task: 编写最终调研报告。 2bd87d0
    - [x] 包含包名映射表。
    - [x] 包含详尽的测速对比图表。
    - [x] 评估 NPM 源的维护成本与风险。
- [x] Task: 向用户提交报告并获取最终决策。 2bd87d0
    - [x] 讨论是否将此功能集成进 `bvm` 以及采用何种交互方式。 (用户确认全面转向 NPM)

## Phase 4: 核心逻辑实现 (Implementation) [checkpoint: 69c8895]
- [x] Task: 扩展 `ArchiveUtils` 支持 `.tgz` 解压。
    - [x] 引入或实现 tar/gzip 解压能力 (使用 `bun` 内置或第三方库，优先复用现有工具)。
    - [x] 实现智能路径提取 (自动识别 `package/bin` 并提取到目标根目录)。
- [x] Task: 重构 `BunDownloader` 逻辑。
    - [x] 更新 `src/utils/npm-lookup.ts` 以作为生产代码使用。
    - [x] 修改 `src/api.ts` 中的下载 URL 获取逻辑，默认使用 NPM Registry。
    - [x] 增加环境变量 `BVM_REGISTRY` 支持，允许覆盖 Registry URL。
- [x] Task: 更新安装流程 (`src/commands/install.ts`)。
    - [x] 适配新的下载和解压接口。
    - [x] 确保安装后的目录结构与旧版一致。
- [x] Task: Conductor - User Manual Verification 'Phase 4: 核心逻辑实现' (Protocol in workflow.md)

## Phase 5: 验证与清理 (Verification & Cleanup)
- [ ] Task: 运行集成测试。
    - [ ] 验证在国内/国外模拟环境下的下载成功率。
    - [ ] 验证安装后的 `bun --version` 可用性。
- [ ] Task: 清理。
    - [ ] 移除旧的 GitHub 下载相关代码 (或标记为 Deprecated)。
    - [ ] 删除临时的基准测试脚本。
- [ ] Task: Conductor - User Manual Verification 'Phase 5: 验证与清理' (Protocol in workflow.md)