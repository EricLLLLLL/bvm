# Implementation Plan: Optimize Registry Selection

## Phase 1: Logic Implementation [checkpoint: 55892f4]
- [x] Task: 封装 `NetworkUtils` 模块，实现 `fetchWithTimeout` 和 `raceRequests` 基础方法。
- [x] Task: 实现 `getGeoLocation` 函数，使用 `https://1.1.1.1/cdn-cgi/trace` 并配置 500ms 超时。
- [x] Task: 实现 `getFastestRegistry` 主逻辑：
    - [x] 定义 Registry 列表 (Official, TaoBao, Tencent)。
    - [x] 结合 GeoInfo 和 Race 结果返回最佳 URL。
- [x] Task: TDD - 编写单元测试验证 IP 探测失败时的 Fallback 行为。
- [x] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: Integration [checkpoint: a42cdef]
- [x] Task: 修改 `src/api.ts`，用新的 `getFastestRegistry` 替换旧的 `isChina` 逻辑。
- [x] Task: 更新 `install` 和 `upgrade` 命令，应用新的下载源逻辑。
- [x] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)
