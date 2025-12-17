# Contributing to bvm

Thank you for your interest in contributing to bvm! We are building the best version manager for Bun, powered by Bun.

## Prerequisites

*   [Bun](https://bun.sh/) (v1.0.0 or later) must be installed on your machine to develop bvm.

## Development Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/bvm-cli/bvm.git
    cd bvm
    ```

2.  **Install dependencies**
    ```bash
    bun install
    ```
    *Note: Dependencies are only for development (types, testing). The release artifact has zero runtime dependencies.*

3.  **Run bvm locally**
    You can run the source code directly using `bun`:
    ```bash
    npx bun run src/index.ts [command]
    ```
    
    Example:
    ```bash
    npx bun run src/index.ts install latest
    ```

## Testing

We use Bun's built-in test runner.

```bash
bun test
```

Please ensure all tests pass before submitting a Pull Request.

## Project Architecture

*   `src/index.ts`: Entry point.
*   `src/cli-router.ts`: Lightweight CLI router (replaces `cac`).
*   `src/utils/semver-lite.ts`: Minimal semver implementation (replaces `semver`).
*   `install.sh` / `install.ps1`: Installation scripts.

## Release Process (Maintainers)

bvm uses a fully automated release pipeline powered by GitHub Actions.

1.  **Update Version**:
    Update the `version` field in `package.json`.

2.  **Update Bun Runtime Dependency (Optional)**:
    If you want to update the Bun version that bvm runs on, update `devDependencies.bun` in `package.json`. The CI pipeline will automatically sync this version to `install.sh` and `install.ps1`.

3.  **Push Tag**:
    Create and push a new tag matching the version (e.g., `v1.2.1`).
    ```bash
    git tag v1.2.1
    git push origin v1.2.1
    ```

4.  **CI Automation**:
    GitHub Actions will:
    *   Run tests.
    *   Sync runtime versions (`scripts/sync-runtime.ts`).
    *   Build and minify the project (`bun run build`).
    *   Create a GitHub Release.
    *   Upload `dist/index.js`, `install.sh`, and `install.ps1` as assets.

---

**Happy Coding!**