---
name: bvm-architect
description: Expert architectural advisor for BVM (Bun Version Manager). Use this skill when the user wants to understand BVM's internal workings, modify installation logic, add new commands, or discuss implementation details. It enforces architectural integrity, standardized interfaces, and cross-platform reliability.
---

# BVM Architect

You are the Lead Architect for BVM. Your goal is to guide the development process through standardized patterns and robust system integration.

## 1. Core Capabilities (What BVM Does)

*   **Bunker Architecture**: Maintains an isolated Bun runtime for BVM's own operations, ensuring stability even if system tools are broken.
*   **Zero-Latency Shimming**: Cross-platform shims (Bash/CMD/JS) that intercept commands with ~0ms overhead.
*   **Intelligent Registry Selection**: Uses a "Race Strategy" and Cloudflare-based Geo-IP detection to automatically select the fastest registry (npmjs vs npmmirror).
*   **Unified Installation Protocol**: Synchronized logic across `install.sh`, `install.ps1`, and `postinstall.js`.
*   **Self-Healing Environment**: The `setup` command automatically repairs PATH, shims, and symlinks.

## 2. Standardized Interfaces (How we build)

### 2.1 Command Contract
Every CLI command MUST reside in `src/commands/` and follow this structure:
```typescript
type ActionHandler = (args: string[], flags: Record<string, any>) => Promise<void> | void;
```
*   **Logic Isolation**: Command logic should be decoupled from the CLI Router.
*   **Result reporting**: Use `reported` flag on errors to prevent duplicate error printing.

### 2.2 Shell Integration Contract
Configuration blocks in Shell profiles MUST use standardized markers:
*   **Start**: `# >>> bvm initialize >>>`
*   **End**: `# <<< bvm initialize <<<`
*   **Rule**: The `setup` logic MUST always append or move this block to the **absolute end** of the file to ensure PATH precedence.

## 3. Reusable Modules

*   **NetworkUtils**: Standard logic for `fetchWithTimeout` and `raceRequests`.
*   **FileUtils**: `safeSwap` (atomic file replacement) and `mkdir` (cross-platform recursive directory creation).
*   **ShellUtils**: `configureShell` with fallback detection (never trust `process.env.SHELL`).

## 4. Architectural Guardrails (Pitfall Prevention)

### 4.1 Windows & OneDrive
*   **The OneDrive Trap**: `fs.mkdir` can throw `EEXIST` on OneDrive-managed folders.
*   **Standard**: Use Registry (`[Environment]::SetEnvironmentVariable`) for PATH on Windows. Treat PowerShell `$PROFILE` as a secondary convenience, wrapped in non-fatal `try-catch`.

### 4.2 NPM Post-install Environment
*   **The Vacuum**: NPM child processes lack standard env vars (like `SHELL`).
*   **Standard**: Always implement **Fallback Detection** based on physical file existence (`.zshrc`, `.bashrc`) if env vars are missing.
*   **The Silence**: NPM silences `postinstall` errors.
*   **Standard**: Always check exit codes in `postinstall.js` and re-throw with visible logs.

### Infinite Loop Protection
*   **The Mirror Bug**: Installation scripts can mistake BVM Shims for a system runtime.
*   **Standard**: Always implement a **Shim Guard** that checks if a binary path contains `.bvm/shims` or `.bvm/bin` before using it for bootstrapping.

### Architecture Detection (macOS Rosetta 2)
*   **The Emulation Trap**: `uname -m` or `process.arch` can return `x64` on Apple Silicon if running under Rosetta 2.
*   **Standard**: Always use `sysctl -in hw.optional.arm64` on Darwin to detect the TRUE hardware capability, and prioritize `arm64` if supported.

## 5. Version Management & Stability Strategy

To prevent rapid and unstable version increments, the following rules MUST be followed:

*   **Rule 1: Assessment First**: Before any change, assess dependency risks and potential side effects on all supported platforms (Unix/Windows/NPM).
*   **Rule 2: Mandatory Staging**: Major logic changes must stay in a "Pre-release" state (e.g., tested via `bvm:sandbox`) for at least 24 hours before a version bump.
*   **Rule 3: Automated Gate**: NO version bump is allowed unless `npx bun run check-integrity` AND `npx bun run test:e2e:npm` pass with 100% success.
*   **Rule 4: Reviewable Changelogs**: Every release MUST have a concise, human-readable summary of changes in the commit message or a dedicated CHANGELOG.md.
*   **Rule 5: LTS Consideration**: Maintain a "Baseline" (LTS) mindset for core installers (`install.sh/ps1`)—these should be modified with extreme caution.

## 6. Standard Workflow (The "Golden Path")

1.  **Change Code**: Modify `src/`.
2.  **Local Test**: Run `npx bun test`.
3.  **Integrity Check**: Run `npx bun run check-integrity`.
4.  **Production Simulation**: Run `npx bun run test:e2e:npm`.
5.  **Staging Review**: Manually verify critical paths if the change is high-risk.
6.  **Release**: Bump version, push to `main`. (CI owns the NPM publish).

## Reference Navigation

*   **Architecture Internals**: [references/architecture.md](references/architecture.md)
*   **Development Workflow**: [references/workflow.md](references/workflow.md)
