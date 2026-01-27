# Implementation Plan: Smart Registry Auto-Configuration

## Phase 1: Research & Core Logic
- [x] Task: Research `bunfig.toml`
    - [x] Verified: Bun looks for global config at `~/.bunfig.toml` (and `$XDG_CONFIG_HOME/.bunfig.toml`).
    - [x] Verified: Local config overrides global, and CLI flags override all.
- [x] Task: Implement Registry Speed Test (`src/utils/registry-check.ts`)
    - [x] Create `RegistrySpeedTester` class.
    - [x] Implement `raceRegistries()` using HEAD requests (timeout: 3s).
    - [x] Define default registries: Official (`registry.npmjs.org`) vs Mirror (`registry.npmmirror.com`).
- [x] Task: Implement Config Manager (`src/utils/bunfig.ts`)
    - [x] Implement `readGlobalBunfig()`.
    - [x] Implement `writeGlobalBunfig()`.
    - [x] Implement `setGlobalRegistry(url)`.

## Phase 2: Integration & CLI
- [x] Task: Integrate into `installBunVersion`
    - [x] In `src/commands/install.ts`, trigger registry check after installation.
    - [x] Logic: If `~/.bunfig.toml` doesn't exist or doesn't specify a registry -> Race -> Auto-write if Mirror wins.
    - [x] UX: Show a friendly message: "⚡ Auto-configured global bunfig.toml..."
- [x] Task: Add `bvm config` command
    - [x] `bvm config registry [url|auto]`
    - [x] `bvm config ls` (Show current config)
- [x] Task: Add to `bvm doctor`
    - [x] Update `src/commands/doctor.ts` to report current registry.

## Phase 3: Verification
- [x] Task: Unit Tests
    - [x] Mock network requests to test race logic.
    - [x] Mock file system to test TOML writing.
- [x] Task: Manual Verification
    - [x] Verified `bvm config registry auto` works.
    - [x] Verified `bvm doctor` shows config.
    - [x] Verified `bvm install` triggers auto-config.
