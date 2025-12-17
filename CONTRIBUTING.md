# Contributing to bvm

Thank you for your interest in contributing to bvm! We follow a standard Pull Request workflow.

## Prerequisites

*   [Bun](https://bun.sh/) (v1.0.0 or later) must be installed on your machine.

## Development Workflow

### 1. Fork & Clone
Fork this repository to your own GitHub account, then clone it locally:

```bash
git clone https://github.com/<your-username>/bvm.git
cd bvm
git remote add upstream https://github.com/bvm-cli/bvm.git
```

### 2. Setup
Install development dependencies:

```bash
bun install
```

### 3. Create a Branch
Create a new branch for your feature or fix. Please use a descriptive name:

```bash
git checkout -b feat/my-awesome-feature
# or
git checkout -b fix/issue-123
```

### 4. Develop & Test
Run the source code directly:

```bash
npx bun run src/index.ts <command>
```

**Run tests before committing:**
```bash
bun test
```

### 5. Commit & Push
We follow [Conventional Commits](https://www.conventionalcommits.org/).

```bash
git add .
git commit -m "feat: add support for xyz"
git push origin feat/my-awesome-feature
```

### 6. Submit Pull Request
Go to the GitHub repository and open a Pull Request against the `main` branch.
*   Describe your changes clearly.
*   Link to any related issues.
*   Wait for code review and CI checks.

---

## Project Architecture

*   `src/index.ts`: Entry point.
*   `src/cli-router.ts`: Lightweight CLI router (replaces `cac`).
*   `src/utils/semver-lite.ts`: Minimal semver implementation (replaces `semver`).
*   `install.sh` / `install.ps1`: Installation scripts.

## Release Process (Maintainers Only)

bvm uses a fully automated release pipeline powered by GitHub Actions.

1.  **Version Bump**:
    Update the `version` field in `package.json`.

2.  **Tag & Push**:
    ```bash
    git tag v1.2.1
    git push origin v1.2.1
    ```

3.  **CI Automation**:
    The workflow will automatically build, minify, sync runtime versions, and publish to GitHub Releases.

---

**Happy Coding!**
