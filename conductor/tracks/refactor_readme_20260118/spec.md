# Track Specification: Refactor README.md

## 1. Overview
Update the project's `README.md` and `README.zh-CN.md` to reflect the latest project status, including the new official website, the simplified installation command, and the new logo.

## 2. Changes Required

### 2.1 Visuals
- Add the new Hexagon-Bun-Bolt Logo to the top of the README.
- Use a centered layout for the header.

### 2.2 Installation Instructions
- **Replace** the old, long tarball-based install command.
- **New Command (Unix)**: `curl -fsSL https://bvm-core.pages.dev/install | bash`
- **New Command (Windows)**: `irm https://bvm-core.pages.dev/install | iex`
- Highlight the "Smart Mirror" feature (automatically faster in CN).

### 2.3 Documentation Links
- Add a prominent badge or link to the official website: `https://bvm-core.pages.dev`.
- Point users to the website for more detailed documentation.

### 2.4 Cleanup
- Remove outdated "Manual Installation" sections if they are no longer the recommended way.
- Ensure version numbers in examples are generic or up-to-date.

## 3. Acceptance Criteria
- [ ] README displays the new Logo.
- [ ] Installation section uses the short `bvm-core.pages.dev` link.
- [ ] Chinese README (`README.zh-CN.md`) is also updated.
