# BVM Repository Instructions for Copilot

This repository builds and maintains BVM, a cross-platform Bun version manager.

## Core priorities

- Preserve cross-platform behavior on macOS, Linux, and Windows.
- Keep shell startup overhead minimal; avoid heavy runtime logic in init paths.
- Maintain per-version global package isolation semantics.
- Prefer small, targeted changes over broad refactors.

## Implementation rules

- Command logic belongs in `src/commands/*.ts`; keep router wiring in `src/index.ts`.
- Reuse existing utilities instead of introducing duplicate helpers.
- Never hardcode platform-specific paths without explicit branching.
- For shell/profile changes, preserve BVM managed markers and append-at-end precedence behavior.

## Validation rules

- For CLI behavior changes, run relevant tests and smoke checks.
- If changing docs for installation/setup, verify commands still match actual CLI behavior.
- Do not claim success without command output evidence.

## Safety rules

- Do not use destructive git commands (`git reset --hard`, force pushes) unless explicitly asked.
- Do not remove user files outside repository scope.
- Treat network-dependent behavior as potentially flaky and provide deterministic fallbacks.
