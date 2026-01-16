# Track: Update BVM Architect Skill & Documentation

## Overview
Following recent feature implementations (Bootstrap Installation, Windows Fixes, Registry Race Strategy), the project's architectural documentation and the `bvm-architect` skill definitions are outdated. This track aims to synchronize these changes into the knowledge base to ensure future AI interactions are accurate.

## Scope
1.  **Architecture Documentation**: Update both `conductor/architecture.md` and `.gemini/skills/bvm-architect/references/architecture.md`.
2.  **Workflow**: Update `.gemini/skills/bvm-architect/references/workflow.md` if necessary.
3.  **Known Issues**: Document current limitations regarding Shim performance (JS vs Native) and the `upgrade` command's behavior.

## Key Updates
- **Registry Selection**: Add "Race Strategy + Geo-Location" logic description.
- **Installation**: Update flow to reflect the "Bootstrap" pattern (download runtime -> install bvm).
- **Windows Support**: Document the use of Junctions and $IsWindows compatibility logic.
- **Shim Architecture**: Explicitly document the current JS-based Shim approach and its trade-offs vs CMD/Native.

## Acceptance Criteria
- The `bvm-architect` skill, when activated, correctly explains the new installation and network logic.
- Documentation accurately reflects the current codebase state.
