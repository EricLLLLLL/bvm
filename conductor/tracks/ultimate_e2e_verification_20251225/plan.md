# Plan: Ultimate End-to-End (E2E) Verification Script

## Phase 1: BVM Installation & Upgrade Verification
- [ ] Task: Create `scripts/verify-e2e.ts` with sandbox setup/teardown.
- [ ] Task: Implement `install.sh` Test.
    - [ ] Run `install.sh` within a sandboxed HOME directory.
    - [ ] Verify that `~/.bvm/bin/bvm` is created and executable.
- [ ] Task: Implement `bvm upgrade` Test.
    - [ ] Run the sandboxed `bvm upgrade` command.
    - [ ] Verify that the `~/.bvm/src/index.js` file's modification time changes.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: BVM Installation & Upgrade' (Protocol in workflow.md)

## Phase 2: Multi-Version/Multi-Source Installation Test
- [ ] Task: Implement Multi-Source Installation Logic.
    - [ ] Loop through a matrix of Bun versions and NPM registries.
    - [ ] For each combination, run the sandboxed `bvm install`.
    - [ ] Verify that the version's `bin/bun` file is created successfully.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Multi-Version/Multi-Source' (Protocol in workflow.md)

## Phase 3: Full Workflow Simulation
- [ ] Task: Implement a chained command sequence test.
    - [ ] `install` -> `ls` -> `use` -> `default` -> `uninstall` -> `ls`.
    - [ ] After each command, verify the output or the state of the sandbox file system.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Full Workflow Simulation' (Protocol in workflow.md)

## Phase 4: Static Analysis for PowerShell Parity
- [ ] Task: Implement `install.ps1` static analysis.
    - [ ] Read both `install.sh` and `install.ps1`.
    - [ ] Create assertions to check for keywords like `npmmirror.com`, `tar`, and `.tgz` in `install.ps1`.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Static Analysis' (Protocol in workflow.md)

## Phase 5: Finalization and CI Integration
- [ ] Task: Add the new script to `package.json` as `npm run test:e2e`.
- [ ] Task: Ensure all tests pass and clean up any temporary files.
- [ ] Task: Conductor - User Manual Verification 'Phase 5: Finalization' (Protocol in workflow.md)