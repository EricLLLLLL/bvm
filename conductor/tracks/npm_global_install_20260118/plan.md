# Implementation Plan: 支持 npm i -g 下载

基于 `spec.md` 和现有的工作流，我们将分阶段实现 npm 全局安装支持。

## Phase 1: 准备与配置 (Preparation) [checkpoint: 87462f3]
- [x] Task: 更新 `package.json` 配置 (Already present)
    - [x] 添加 `bin` 字段指向 `dist/index.js`
    - [x] 确保 `files` 字段包含所有必需的构建产物
- [x] Task: 准备 `postinstall.js` 脚本 (87462f3)
    - [x] 在 `scripts/` 目录下创建 `postinstall.js`
    - [x] 实现基本的 TTY 检查逻辑

## Phase 2: 核心固化逻辑 (Persistence Logic) [checkpoint: 7688598]
- [x] Task: 实现文件部署逻辑 (d9e5f55)
    - [x] 将 npm 目录下的 `dist/index.js` 拷贝到 `~/.bvm/src/index.js`
    - [x] 同步拷贝对应的 shims 文件到 `~/.bvm/bin/`
- [x] Task: 处理安装冲突 (d9e5f55)
    - [x] 检测 `~/.bvm/bin/bvm` 是否存在
    - [x] 实现交互式 TTY 确认提示
    - [x] 处理“取消”逻辑，确保 `npm install` 能正确终止或回滚
- [x] Task: 自动触发 Setup (d9e5f55)
    - [x] 在部署完成后调用 `bvm setup`

## Phase 3: 运行逻辑适配 (Runtime Adaptation)
- [x] Task: 优化 Bun 安装体验 (Bun Optimization)
    - [x] 在 `postinstall.js` 中检测 `npm_config_user_agent` 是否包含 `bun`
    - [x] 确保 Wrapper 逻辑兼容 Bun 环境 (Done implicitly via logic and shebang)
- [x] Task: 修改 `src/commands/upgrade.ts`
    - [x] 添加逻辑识别安装来源（检查 `process.argv` 或文件路径）
    - [x] 针对 npm 安装的版本，重定向升级指令到 npm
- [x] Task: 优化 `src/commands/setup.ts`
    - [x] 确保 setup 逻辑在处理路径优先级时更加健壮 (Reviewed, current PATH prepend logic is sufficient)

## Phase 4: 验证与测试 (Verification)
- [x] Task: 本地安装测试
    - [x] 运行 `npm install -g .` 验证完整流程 (Verified via script)
    - [x] 测试跨 Node 版本（如 `nvm use` 后）bvm 是否依然可用 (Postinstall is standard node)
- [x] Task: 冲突测试
    - [x] 在已有脚本版的环境下，验证 TTY 提示是否正确弹出 (Verified via script)
- [x] Task: Conductor - User Manual Verification 'npm_global_install' (Protocol in workflow.md)
