# Implementation Plan - Release v1.1.1

## Phase 1: Preparation & Trigger [checkpoint: ]
- [ ] Task: Ensure local workspace is clean (Clean Git Status).
- [ ] Task: Run `bun run release` script.
    - [ ] Sub-task: Interactively select "patch" (1).
    - [ ] Sub-task: Observe and confirm local tests pass.
    - [ ] Sub-task: Confirm version update and Git tag generation.
    - [ ] Sub-task: Confirm script automatically pushes to remote `main` branch.
- [ ] Task: Conductor - User Manual Verification 'Phase 1' (Protocol in workflow.md)

## Phase 2: CI/CD Execution Monitoring [checkpoint: ]
- [ ] Task: Monitor GitHub Actions "Auto Release Check" workflow.
    - [ ] Sub-task: Confirm "Build Project" step success.
    - [ ] Sub-task: Confirm "Calculate Fingerprints" step success.
    - [ ] Sub-task: Confirm "Publish to NPM" step success (Check Log).
    - [ ] Sub-task: Confirm "Trigger Mirror Sync" step request success.
    - [ ] Sub-task: Confirm "Verify Mirror Sync" polling success.
    - [ ] Sub-task: Confirm "Create GitHub Release" step success.
- [ ] Task: Conductor - User Manual Verification 'Phase 2' (Protocol in workflow.md)

## Phase 3: Final Acceptance [checkpoint: ]
- [ ] Task: Verify NPM package status.
    - [ ] Sub-task: Run `npm view @bvm-cli/core@1.1.1`.
- [ ] Task: Verify GitHub Release assets.
    - [ ] Sub-task: Check Release page download links.
- [ ] Task: Verify install script behavior.
    - [ ] Sub-task: Simulate fresh install using `curl` and check version resolution logs.
- [ ] Task: Conductor - User Manual Verification 'Phase 3' (Protocol in workflow.md)
