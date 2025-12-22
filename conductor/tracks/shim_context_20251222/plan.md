# Plan: 增强 Shim 解析逻辑与项目上下文检测

## Phase 1: Context Detection Logic
- [ ] Task: Create reproduction test case for .bvmrc discovery
- [ ] Task: Implement recursive .bvmrc search function in Shim
- [ ] Task: Verify .bvmrc detection with unit tests

## Phase 2: Environment Isolation
- [ ] Task: Create test case for BUN_INSTALL injection
- [ ] Task: Modify Shim to inject BUN_INSTALL environment variable
- [ ] Task: Verify global install isolation via integration test

## Phase 3: Integration & Fallback
- [ ] Task: Implement fallback to global current version logic
- [ ] Task: End-to-end verification of Shim routing (Local -> Global -> Error)
