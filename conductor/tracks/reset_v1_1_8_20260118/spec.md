# Track Specification: Revert and Reset to Release v1.1.8

## 1. Overview
This track focuses on cleaning up the artifacts of the previous `v1.1.8` release attempts and ensuring the codebase is perfectly aligned for a fresh `v1.1.8` release. This includes removing existing Git tags, handling NPM unpublish operations (if applicable), and globally enforcing the version string `1.1.8` across all project files.

## 2. Functional Requirements

### 2.1 Version Cleanup & Enforcement
- **Objective**: Ensure the version `1.1.8` is consistently applied across the codebase.
- **Scope**:
  - `package.json`: Confirm version is `1.1.8`.
  - `install.sh`: Confirm `DEFAULT_BVM_VERSION` is `v1.1.8`.
  - `install.ps1`: Confirm `$DEFAULT_BVM_VER` is `v1.1.8`.
  - `src/constants.ts` (if applicable): Check for hardcoded versions.
  - **Global Search**: Perform a global text search for any lingering old versions (e.g., `1.1.7`) and replace them with `1.1.8`.

### 2.2 Artifact Cleanup
- **Git Tags**:
  - Delete local tag `v1.1.8`.
  - Delete remote tag `v1.1.8` from origin.
- **NPM Registry**:
  - (Manual/Scripted) Unpublish `bvm-core@1.1.8` if it exists in the registry to allow a republish.

### 2.3 Build & Consistency
- **Rebuild**: Run `bun run build` to ensure `dist/` artifacts reflect the current code and version.
- **Verification**: Run `bun test` to ensure the codebase is stable before re-tagging.

## 3. Acceptance Criteria
- [ ] `package.json` version is strictly `1.1.8`.
- [ ] `install.sh` and `install.ps1` reference `v1.1.8` as the default version.
- [ ] No occurrences of previous versions (e.g., `1.1.7`) exist in documentation or comments where they should be `1.1.8`.
- [ ] Git tag `v1.1.8` is successfully removed from local and remote.
- [ ] Build artifacts in `dist/` are regenerated.
- [ ] Test suite passes.

## 4. Out of Scope
- Implementing new features.
- Major refactoring of the installation logic (beyond version updates).
