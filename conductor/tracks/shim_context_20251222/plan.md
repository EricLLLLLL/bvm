# Plan: 增强 Shim 解析逻辑与项目上下文检测

## Phase 1: Context Detection Logic [checkpoint: 18cdb0a]
- [x] Task: Create reproduction test case for .bvmrc discovery b06904d
- [x] Task: Implement recursive .bvmrc search function in Shim b06904d
- [x] Task: Verify .bvmrc detection with unit tests b06904d

## Phase 2: Environment Isolation
- [x] Task: Create test case for BUN_INSTALL injection 4e102a5
- [x] Task: Modify Shim to inject BUN_INSTALL environment variable 4e102a5
- [x] Task: Verify global install isolation via integration test 4e102a5

## Phase 3: Integration & Fallback
- [ ] Task: Implement fallback to global current version logic
- [ ] Task: End-to-end verification of Shim routing (Local -> Global -> Error)
