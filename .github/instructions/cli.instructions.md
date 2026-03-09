---
applyTo: "**/*.ts"
---

# CLI Code Instructions (BVM)

- Keep behavior deterministic and cross-platform.
- Use existing command contracts and shared utilities.
- Prefer explicit error messages with actionable fixes.
- Preserve current semantics for:
  - version resolution
  - `bvm setup` shell integration
  - `bvm doctor` diagnostics
  - global package isolation per Bun version
- Avoid introducing new dependencies unless they are necessary.
