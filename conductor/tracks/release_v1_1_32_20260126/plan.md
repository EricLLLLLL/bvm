# Implementation Plan: Release BVM v1.1.35

## Phase 1: Update Version
- [~] Task: Bump version to 1.1.35
    - [x] Update `package.json`.
    - [ ] Run `sync-runtime` to update install scripts.
    - [ ] Verify `install.sh` and `install.ps1` contain `DEFAULT_BVM_VERSION="v1.1.35"`.

## Phase 2: Build & Verify
- [ ] Task: Build
    - [ ] Run `npm run build`.
    - [ ] Run `check-integrity`.
- [ ] Task: Verification
    - [ ] Run `test:e2e:npm` (Simulate install from local build).
    - [ ] Verify `bin/bvm-npm.js` logic if changed (Shim logic).

## Phase 3: Release
- [ ] Task: Commit & Tag
    - [ ] Commit version bump.
    - [ ] Create tag `v1.1.35`.
    - [ ] Push to main.
- [ ] Task: NPM Publish
    - [ ] Ensure clean registry state.
    - [ ] Publish to NPM.