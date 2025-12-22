# Specification: 增强 Shim 解析逻辑与项目上下文检测

## 1. Context
Currently, BVM relies on basic shim logic. To meet the 'Advanced Architecture' goals (Hybrid Path Routing, Atomic Isolation), we need a robust mechanism to detect project context (.bvmrc) and inject environment variables (BUN_INSTALL).

## 2. Requirements

### 2.1 Recursive Context Search
- **Functionality**: The shim must search for `.bvmrc` starting from the current directory upwards to the root.
- **Performance**: The search should be efficient (limit file system calls).
- **Fallback**: If no `.bvmrc` is found, fall back to the global current version.

### 2.2 Environment Injection
- **Variable**: `BUN_INSTALL` must be set to the absolute path of the active Bun version.
- **Scope**: This variable must be present in the environment of the executed `bun` process and its child processes.
- **Isolation**: Ensure that global installs (`bun install -g`) land in the version-specific folder.

## 3. Acceptance Criteria
- [ ] `bvm use` creates/updates the global shim.
- [ ] Shim correctly executes `bun` from the version specified in `.bvmrc` when present.
- [ ] Shim falls back to global version when no `.bvmrc` is present.
- [ ] Executing `bun install -g <pkg>` installs to the specific version's bin directory, not a shared global one.
