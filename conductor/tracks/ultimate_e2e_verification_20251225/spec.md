# Specification: Ultimate End-to-End (E2E) Verification Script

## 1. Overview
To address the gap between unit/integration tests and real-world user scenarios, this track will create a new, comprehensive E2E verification script named `scripts/verify-e2e.ts`. This script will serve as the "golden standard" for pre-release validation, covering the full user lifecycle from initial installation to daily use.

## 2. Core Goals
1.  **BVM Lifecycle Testing**: Verify the `install.sh` and `bvm upgrade` commands work as expected.
2.  **Multi-Version Installation**: Test the installation of multiple, distinct Bun versions in a clean sandbox environment.
3.  **Multi-Source Testing**: Explicitly test downloads from both the official NPM registry and the NPM China mirror.
4.  **Full Workflow Simulation**: Simulate a realistic user workflow, chaining commands like `install`, `ls`, `use`, `default`, and `uninstall` to verify state transitions.
5.  **Cross-Platform Static Analysis**: Statically analyze `install.ps1` against `install.sh` to ensure logical parity.

## 3. Script Requirements

### 3.1 `scripts/verify-e2e.ts`
*   **Sandbox**: Must create and tear down a temporary sandbox (`.sandbox-e2e`) for every run to ensure a clean state.
*   **Test Matrix**:
    *   **Versions**: `['1.0.29', '1.1.0', '1.0.0']` (or similar).
    *   **Registries**: `['https://registry.npmjs.org', 'https://registry.npmmirror.com']`.
*   **BVM Installation Test**:
    1. Run `install.sh` in the sandbox.
    2. Verify that `bvm` is correctly installed in `~/.bvm/bin`.
    3. Run `bvm --version` and check the output.
*   **BVM Upgrade Test**:
    1. Run `bvm upgrade`.
    2. Verify that the `~/.bvm/src/index.js` file is updated.
*   **Bun Version Workflow Test**:
    1.  Install Version A from Source 1.
    2.  Install Version B from Source 2.
    3.  Run `bvm ls` and verify output.
    4.  Run `bvm use <A>`, check `bvm current`.
    5.  Run `bvm default <B>`, verify `default` alias.
    6.  Run `bvm uninstall <A>`, verify it's gone.
    7.  Verify that `bvm current` now falls back to the default (`<B>`).
*   **Static Analysis (`install.ps1`)**:
    *   Read `install.sh` and `install.ps1`.
    *   Assert that the PowerShell script contains logic for `.tgz` and `tar`, and that its URL construction mirrors the shell script.

## 4. Acceptance Criteria
- [ ] A new script `scripts/verify-e2e.ts` is created.
- [ ] Running `bun scripts/verify-e2e.ts` executes all defined tests without error.
- [ ] The script validates the BVM installation and upgrade process.
- [ ] The script successfully installs multiple Bun versions from different NPM sources.
- [ ] The script validates a realistic user command flow.
- [ ] The script includes a static analysis check for `install.ps1` parity.