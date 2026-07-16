---
name: bvm-architect
description: Review, explain, and safely evolve the BVM Bun version manager architecture. Use for BVM architecture audits, installation or upgrade changes, command design, shim/runtime isolation, cross-platform behavior, release design, project-structure reviews, and code-redundancy analysis in the BVM repository.
---

# BVM Architect

Treat the checked-out repository as the source of truth. The bundled references are orientation material, not authority for mutable facts such as commands, versions, workflows, release channels, or file locations.

## Start every task

1. Read the repository `AGENTS.md` and follow its safety and Git rules.
2. Inspect the current files related to the request before making claims.
3. Verify mutable facts in `package.json`, `.github/workflows/`, `src/`, `scripts/`, and the installer scripts.
4. Distinguish observed facts from recommendations and inferences.
5. For read-only reviews, do not modify files. For implementation requests, test the smallest safe change and do not commit or push unless the user explicitly asks.

Use `rg` and import/call-site inspection for impact analysis. Do not depend on GitNexus or any generated index.

## Stable architecture invariants

Preserve these unless the user explicitly requests an architectural change:

- BVM's private host runtime is separate from the user's active Bun version.
- `runtime/current` identifies the runtime used to execute BVM itself.
- `current` identifies the user's active Bun version.
- Installation and upgrade artifacts are resolved from npm-compatible registry metadata and verified before extraction.
- Installation surfaces must preserve equivalent safety behavior across `install.sh`, `install.ps1`, and `scripts/postinstall.js`; their implementations do not need to be textually identical.
- Never bootstrap from a path inside BVM's own shims or bin directories.
- Shell initialization blocks use `# >>> bvm initialize >>>` and `# <<< bvm initialize <<<`, and PATH precedence must remain deterministic.
- Windows PATH persistence uses the user environment/Registry path; PowerShell profile integration is secondary and non-fatal.
- A CLI command handler receives positional arguments and typed flags, while command implementation stays outside the router when practical.
- Errors already printed by a lower layer use the `reported` convention to avoid duplicate output.

## Review method

For architecture, redundancy, or structure reviews:

1. Map entry points, runtime state, filesystem state, network boundaries, and release artifacts.
2. Identify large mixed-responsibility modules, repeated cross-platform policy, dead exports, and documentation drift.
3. Validate suspected duplication by comparing behavior and callers, not only similar text.
4. Rank findings by correctness risk, release risk, maintainability, and implementation cost.
5. Prefer KISS and YAGNI. Recommend extraction only when it creates a clear ownership boundary or removes repeated policy.
6. Cite concrete files and line numbers. Avoid presenting aspirational architecture as implemented behavior.

## Change method

For code changes:

1. Define the behavior contract and affected platforms.
2. Add or update a failing regression test when behavior changes.
3. Implement the minimum coherent change.
4. Run focused tests, then the repository verification command appropriate to the risk.
5. For installers, shims, release logic, or filesystem state, include cross-platform and clean-checkout verification.
6. Report remaining uncertainty explicitly.

## Reference routing

- Read [references/architecture.md](references/architecture.md) for the current architectural map and known boundaries.
- Read [references/workflow.md](references/workflow.md) for review, implementation, verification, and release procedures.
- Re-verify any reference statement against the repository before relying on it for a code change.
