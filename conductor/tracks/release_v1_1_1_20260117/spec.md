# Track Specification: Release v1.1.1 (Patch)

## 1. Overview
Execute and verify the formal release process for version v1.1.1. This track aims to validate that the previously applied fixes to the release pipeline (CI, NPM configuration, mirror sync logic) ensure successful distribution of the new version across multiple platforms and channels.

## 2. Objectives & Scope
- **Version**: Upgrade from v1.1.0 to v1.1.1 (Patch).
- **Channels**:
  - NPM (@bvm-cli/core)
  - GitHub Releases (with assets)
  - npmmirror (Taobao mirror)
  - jsDelivr (CDN)

## 3. Functional Requirements
- **Local Trigger**: Run `bun run release` and select the `patch` option.
- **Automated Workflow**:
  - Automatically update `package.json` version.
  - Update default version constants in `install.sh` and `install.ps1`.
  - Build and generate assets with fingerprint information.
  - Automatically publish to NPM via GitHub Actions.
  - Automatically trigger and verify mirror sync.

## 4. Acceptance Criteria
- [ ] **GitHub Release**: Confirm v1.1.1 page is created and contains `install.sh`, `install.ps1`, and `dist/` assets.
- [ ] **NPM Availability**: Execution of `npm view @bvm-cli/core version` returns `1.1.1`.
- [ ] **Mirror Sync**: The mirror URL `https://registry.npmmirror.com/@bvm-cli/core/1.1.1` is accessible.
- [ ] **Install Script**: When running the install script, the logs show resolution and installation of v1.1.1.

## 5. Out of Scope
- This release does not include any breaking changes or major feature updates.
