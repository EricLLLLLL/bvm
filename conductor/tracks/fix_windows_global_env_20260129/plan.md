# 任务计划：BVM 核心流程再造与 Windows 全局环境根治

## 阶段 1：根源修复 - 确保二进制完整性与路径确定性
本阶段重点解决安装流程中 `bunx` 缺失和 Windows 路径不稳定的“先天不足”。

- [ ] **Task: 增强安装流程，确保 `bunx` 物理存在**
    - [ ] 在 `src/commands/install.ts` 中增加强校验：版本解压后若缺失 `bunx`，立即补全软链接。
    - [ ] 在 `install.sh` 和 `install.ps1` 中同步此补全逻辑。
    - [ ] **TDD**: 编写测试用例验证新安装版本必须包含 `bunx`。
- [ ] **Task: 确立 Windows 绝对路径基准**
    - [ ] 修改 `src/commands/rehash.ts`，在生成 Shim 时动态注入探测到的绝对 `BVM_DIR`。
    - [ ] 移除对 `%USERPROFILE%` 的依赖，改用硬编码绝对路径以杜绝 OneDrive 干扰。
    - [ ] **TDD**: 验证生成的 `.cmd` 文件中包含正确的绝对路径。
- [ ] **Task: Conductor - User Manual Verification '阶段 1' (Protocol in workflow.md)**

## 阶段 2：流程闭环 - 全局包路径修复与自愈拦截
本阶段解决 `claude` 等包安装后的“路径漂移”，并通过拦截机制确保自愈逻辑被触发。

- [ ] **Task: 完善 `fixShims` 激进修复逻辑**
    - [ ] 在 `bvm-shim.js` 中实现基于正则的绝对路径强制替换（针对 `%~dp0\..` 链条）。
    - [ ] 将此逻辑同步至 `rehash.ts`，确保存量全局包也能被修复。
    - [ ] 修复 `bvm-shim.js` 中的正则语法错误。
- [ ] **Task: 实现安装指令拦截机制**
    - [ ] 修改 `bun.cmd` 模板，识别 `install/add/remove` 等指令，强制走慢路径触发 `fixShims`。
    - [ ] **TDD**: 模拟全局包安装后的 `.cmd` 修复过程，验证路径已指向 `install\global\node_modules`。
- [ ] **Task: Conductor - User Manual Verification '阶段 2' (Protocol in workflow.md)**

## 阶段 3：健壮性加固 - 安装竞速与智能降级
解决网络波动和镜像同步延迟导致的安装卡死或失败。

- [ ] **Task: 实现注册表竞速 (Racing) 逻辑**
    - [ ] 在 `scripts/postinstall.js` 中加入多源 `HEAD` 请求测速。
    - [ ] 自动切换至响应最快的 Registry 进行后续操作。
- [ ] **Task: 完善版本回退与超时处理**
    - [ ] 在 `postinstall.js` 中增加版本回退链（例如：1.3.7 失败则尝试 1.3.6）。
    - [ ] 优化 `curl` 参数，增加重试和连接超时。
    - [ ] **TDD**: 模拟网络超时场景，验证 BVM 是否能自动降级安装。
- [ ] **Task: Conductor - User Manual Verification '阶段 3' (Protocol in workflow.md)**

## 阶段 4：最后验证与质量把控
- [ ] **Task: 全平台集成测试**
    - [ ] 运行 `bun test` 确保所有核心功能正常。
    - [ ] 验证 macOS 上的 `bunx` 回退逻辑作为最后一道防线。
- [ ] **Task: 规范与清理**
    - [ ] 检查代码覆盖率 (>80%)。
    - [ ] 更新 `README.md` 和版本号至 `1.1.36`。
- [ ] **Task: Conductor - User Manual Verification '阶段 4' (Protocol in workflow.md)**
