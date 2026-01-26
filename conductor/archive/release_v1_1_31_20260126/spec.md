# Specification: Release BVM v1.1.31

## 1. Overview
Release version 1.1.31 of BVM-Core. This is a patch release focusing on critical fixes for global package management on Windows and general usability improvements.

## 2. Changes
- **Fix (Windows):** Resolved `Module not found` errors for global packages by automatically injecting absolute paths into Bun-generated shims (overcoming Junction relative path limits).
- **Feat (UX):** Added automatic PATH verification in `bvm use`. Warns users if `~/.bvm/current/bin` is missing from their PATH.
- **Docs:** Updated installation scripts to explicitly mention global binary path requirements.

## 3. Protocol (Architectural)
- **Synchronization:** `install.sh` and `install.ps1` MUST be updated with `v1.1.31` using `sync-runtime.ts`.
- **Integrity:** `check-integrity.ts` must pass.
- **Build:** `dist/index.js` must be rebuilt.

## 4. Deliverables
- Updated `package.json` (v1.1.31).
- Updated `install.sh` (DEFAULT_BVM_VERSION="v1.1.31").
- Updated `install.ps1` ($DEFAULT_BVM_VER="v1.1.31").
- Git Tag `v1.1.31`.
