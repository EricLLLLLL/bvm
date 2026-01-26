# Implementation Plan: Release BVM v1.1.31

## Phase 1: Preparation & Synchronization
- [ ] Task: Update Version
    - [ ] Bump `package.json` version to `1.1.31`.
- [ ] Task: Synchronize Runtime & Installer
    - [ ] Run `bun run scripts/sync-runtime.ts` to update `install.sh` and `install.ps1`.
    - [ ] Verify `install.sh` contains `DEFAULT_BVM_VERSION="v1.1.31"`.
    - [ ] Verify `install.ps1` contains `$DEFAULT_BVM_VER = "v1.1.31"`.
- [ ] Task: Conductor - User Manual Verification 'Phase 1'

## Phase 2: Build & Verify
- [ ] Task: Build Distribution
    - [ ] Run `npm run build` (This also runs sync-runtime, but explicit step above ensures correctness).
    - [ ] Run `bun run scripts/check-integrity.ts` to ensure consistency.
- [ ] Task: Conductor - User Manual Verification 'Phase 2'

## Phase 3: Commit & Finalize
- [ ] Task: Commit Release
    - [ ] Stage `package.json`, `install.sh`, `install.ps1`, `dist/`.
    - [ ] Commit message: `chore(release): v1.1.31`.
    - [ ] Create Git Tag `v1.1.31`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3'
