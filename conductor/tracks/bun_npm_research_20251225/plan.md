# Plan: Bun NPM 镜像源下载可行性调研与基准测试

## Phase 1: 技术调研与包结构分析 (Technical Research) [checkpoint: 237a204]
- [x] Task: 深入分析 `node_modules/bun` 及其相关架构包。 c7e7706
    - [x] 检查 `package.json` 中的依赖关系，确认官方如何分发不同平台的二进制文件。
    - [x] 提取 NPM 包名与系统架构（OS/Arch）的映射规律。
- [x] Task: 验证 NPM 镜像站 URL 构造规则。 c7e7706
    - [x] 确认从 `registry.npmmirror.com` 下载特定版本 `.tgz` 包的路径格式。
    - [x] 手动尝试下载并解压，验证二进制文件的位置（例如是在 `package/bin/bun` 还是其他路径）。
- [x] Task: Conductor - User Manual Verification 'Phase 1: 技术调研与包结构分析' (Protocol in workflow.md)

## Phase 2: 基准测试与数据采集 (Benchmarking)
- [x] Task: 开发自动化基准测试脚本 `scripts/benchmark-download.ts`。 c7e7706
    - [x] 实现针对 GitHub Releases 的下载测速逻辑。
    - [x] 实现针对 NPM Registry 的下载测速逻辑。
    - [x] 实现针对 `npmmirror.com` 的下载测速逻辑。
    - [x] 脚本应支持指定 Bun 版本进行多轮测试以取平均值。
- [x] Task: 运行测试并收集数据。
    - [x] 在当前网络环境下执行脚本。
    - [x] 整理测速结果（下载耗时、成功率、稳定性）。
- [ ] Task: Conductor - User Manual Verification 'Phase 2: 基准测试与数据采集' (Protocol in workflow.md)

## Phase 3: 汇总报告与决策支持 (Reporting & Decision)
- [ ] Task: 编写最终调研报告。
    - [ ] 包含包名映射表。
    - [ ] 包含详尽的测速对比图表。
    - [ ] 评估 NPM 源的维护成本与风险。
- [ ] Task: 向用户提交报告并获取最终决策。
    - [ ] 讨论是否将此功能集成进 `bvm` 以及采用何种交互方式。
- [ ] Task: Conductor - User Manual Verification 'Phase 3: 汇总报告与决策支持' (Protocol in workflow.md)
