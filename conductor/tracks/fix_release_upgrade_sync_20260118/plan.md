# Implementation Plan - fix_release_upgrade_sync_20260118

## Phase 1: Logic Refactoring - Upgrade Command (TDD)
- [x] Task: Create/Update unit tests for `fetchLatestBvmReleaseInfo` in `test/api.test.ts` (or similar). b93af6c
- [x] Task: Refactor `src/api.ts` to use NPM Registry + Race Strategy. b93af6c
- [x] Task: Update `src/commands/upgrade.ts`. b93af6c
- [x] Task: Conductor - User Manual Verification 'Phase 1: Logic Refactoring - Upgrade Command (TDD)' (Protocol in workflow.md) b93af6c

## Phase 2: Release Pipeline Hardening
- [x] Task: Update `scripts/release.ts`. b93af6c
- [x] Task: Update `.github/workflows/auto-release.yml`. b93af6c
- [x] Task: Conductor - User Manual Verification 'Phase 2: Release Pipeline Hardening' (Protocol in workflow.md) b93af6c

## Phase 3: System Verification
- [x] Task: Manual E2E Simulation. b93af6c
- [x] Task: Conductor - User Manual Verification 'Phase 3: System Verification' (Protocol in workflow.md) b93af6c