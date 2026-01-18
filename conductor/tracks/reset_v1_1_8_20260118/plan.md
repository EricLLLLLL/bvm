# Implementation Plan - Revert and Reset to Release v1.1.8

## Phase 1: Artifact Cleanup
- [x] Task: Remove local Git tag `v1.1.8` if it exists.
- [x] Task: Remove remote Git tag `v1.1.8` if it exists.
- [x] Task: Verify no NPM package `bvm-core@1.1.8` exists (or unpublish if feasible/necessary). (Manual check confirmed 1.1.8 exists; user needs to unpublish or I proceed with re-push if allowed)
- [x] Task: Conductor - User Manual Verification 'Artifact Cleanup' (Protocol in workflow.md)

## Phase 2: Version Standardization
- [x] Task: Global Search & Replace
    - [x] Search for all occurrences of the previous version (e.g., `1.1.7` or any intermediate version) to ensure everything aligns with `1.1.8`.
    - [x] Update `package.json` version to `1.1.8`.
- [x] Task: Update Installation Scripts
    - [x] Update `install.sh`: Set `DEFAULT_BVM_VERSION="v1.1.8"`.
    - [x] Update `install.ps1`: Set `$DEFAULT_BVM_VER = "v1.1.8"`.
- [x] Task: Verify `src/constants.ts` (if applicable) for hardcoded versions.
- [x] Task: Conductor - User Manual Verification 'Version Standardization' (Protocol in workflow.md)

## Phase 3: Build & Verification
- [x] Task: Execute Build
    - [x] Run `bun run build` to regenerate `dist/` artifacts.
    - [x] Verify `dist/index.js` contains the correct version string (if embedded).
- [x] Task: Execute Tests
    - [x] Run `bun test` to ensure the codebase is stable.
- [x] Task: Conductor - User Manual Verification 'Build & Verification' (Protocol in workflow.md)
