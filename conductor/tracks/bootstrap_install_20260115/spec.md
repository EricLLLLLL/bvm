# Specification: Bootstrap-mode for Install Scripts (Decoupled Logic)

## Overview
Refactor the installation process to use a "Downloaded Shim Logic" model. Installation scripts (`install.sh`, `install.ps1`) will be responsible only for environment setup and downloading independent shim-logic files from the `dist/` package.

## Functional Requirements
- **Independent Shim Logic Files**:
    - `bvm-shim.sh`: Contains the core version-switching logic for Unix (Bash).
    - `bvm-shim.js`: Contains the core version-switching logic for Windows (JS).
- **Bootstrap Installation**:
    - `install.sh` downloads `bvm-shim.sh` and creates 1-line wrapper scripts for `bun`, `bunx`, and `bvm`.
    - `install.ps1` downloads `bvm-shim.js` and creates `.cmd` wrapper scripts.
- **No `index.js` Dependency at Install Time**: The installation must complete and provide a working Bun environment without executing `index.js`.

## Acceptance Criteria
- [ ] `dist/` folder contains `index.js`, `bvm-shim.js`, and `bvm-shim.sh`.
- [ ] `install.sh` successfully sets up a working environment by downloading the `.sh` shim.
- [ ] `install.ps1` successfully sets up a working environment by downloading the `.js` shim.
- [ ] The total time for `bun` to resolve a version and start remains minimal.
- [ ] No `bun.ps1` files are found in the `shims` directory after installation.
