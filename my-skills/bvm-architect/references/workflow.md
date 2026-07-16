# BVM Engineering Workflow

This reference defines a safe working method. Repository instructions and current workflow files take precedence.

## Authority order

1. System, developer, and explicit user instructions.
2. The repository `AGENTS.md`.
3. Current source files, `package.json`, and `.github/workflows/`.
4. Active task documents under `conductor/`, only when the user or current task explicitly uses them.
5. This reference.

Do not assume a root `plan.md`, mandatory Git Notes, branch protection, or automatic commits. Do not commit, push, tag, publish, delete directories, or change global configuration without the authorization required by `AGENTS.md`.

## Read-only review

1. Confirm the repository and working-tree state.
2. Inventory relevant files with `rg --files`.
3. Trace imports, callers, filesystem writes, subprocesses, and network requests.
4. Compare documentation and skill claims with current implementation.
5. Report findings by severity with file and line evidence.
6. Do not turn a review request into an implementation task.

## Implementation

1. Read before writing and preserve unrelated user changes.
2. Define acceptance criteria and platform scope.
3. For behavioral fixes, demonstrate the failure with a focused regression test.
4. Apply the smallest complete change.
5. Run focused tests before the broader verification suite.
6. Update documentation only when public behavior or developer workflow changed.
7. Leave the working tree uncommitted unless the user explicitly requests Git operations.

## Verification levels

- Pure helper or parser: focused unit tests and typecheck.
- Command behavior: focused tests plus `bun run verify`.
- Installer, shim, runtime, or filesystem state: `bun run verify`, relevant E2E tests, PowerShell syntax checks when applicable, and clean-checkout validation.
- Release workflow: release contract tests, package dry-run, and inspection of the current workflow YAML.
- Website: website tests, typecheck, VitePress build, and deployment verification when publishing was requested.

Use the scripts currently defined in `package.json`; do not copy commands from this reference without checking them.

## Release preparation

The current repository prepares a version with:

```bash
bun run release patch
```

`minor` and `major` are also supported. The script requires a clean tree, verifies the candidate, updates versions and documentation, builds artifacts, and refreshes fingerprints. It does not commit, push, tag, or publish.

After explicit user authorization, reviewed release files may be committed and pushed. The current production workflow publishes an unpublished package version from `main`, creates an immutable tag and GitHub Release, triggers the npm mirror, and purges the npm jsDelivr asset path.

Always inspect `.github/workflows/auto-release.yml` before describing or executing the release process.

## Completion evidence

Report the exact verification performed, results, unverified platforms or assumptions, changed files, and Git/publication state. Do not claim success from stale local artifacts or an earlier workflow run.
