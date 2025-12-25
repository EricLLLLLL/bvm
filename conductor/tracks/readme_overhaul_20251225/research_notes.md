# BVM 1.x Research & Competitor Analysis

## 1. Core Architecture: The "Bunker" Philosophy
BVM differentiates itself through its "Bunker Architecture". Unlike other version managers that rely on the very runtime they manage or external dependencies (like Python/Rust), BVM bootstraps its own private, immutable Bun runtime (`~/.bvm/runtime`).

*   **Benefit**: "Unbreakable" Management. You can uninstall every visible Bun version, and BVM still works.
*   **Benefit**: Zero Dependency. Does not depend on system Node.js, Python, or Rust toolchains.

## 2. Performance: Hybrid Path Routing
BVM uses a hybrid approach to achieve maximum performance:
*   **Global Mode**: Uses physical OS symlinks (`~/.bvm/current`). This provides **0ms overhead** because the shell executes the binary directly.
*   **Project Mode**: Uses a high-performance Shim that recursively detects `.bvmrc`.
*   **Result**: Faster than NVM (no shell lag) and competitive with compiled managers (FNM/Voltan) in global mode.

## 3. Atomic Isolation
BVM explicitly manages the `BUN_INSTALL` environment variable for each version.
*   **Problem**: In other managers, global packages installed with `bun install -g` might end up in a shared location or the wrong version's folder.
*   **BVM Solution**: Each version gets a dedicated global package store. `bvm use 1.0.0` switches not just the binary, but the entire global package context.

## 4. Distribution: NPM-First Strategy (New in v1.x)
*   **Old Way**: GitHub Releases (Slow in China, unstable).
*   **New Way**: NPM Registry / Mirror.
    *   **Global**: Uses `registry.npmjs.org` via Cloudflare CDN.
    *   **China**: Automatically detects and switches to `registry.npmmirror.com` via Aliyun CDN.
    *   **Format**: Handles `.tgz` extraction and path flattening automatically.

## 5. Competitor Comparison

| Feature | BVM (Bun Version Manager) | NVM (Node Version Manager) | FNM / Bum / Voltan |
| :--- | :--- | :--- | :--- |
| **Language** | **TypeScript (Native Bun)** | Bash / POSIX Shell | Rust / Go |
| **Runtime Dependency** | **Self-contained (Bunker)** | System Shell | System Binary |
| **Global Overhead** | **0ms (Symlink)** | High (Shell Sourcing) | Low (Binary Proxy) |
| **Shell Startup** | **Instant** | Slow (Lazy loading helps) | Fast |
| **Project Switching** | Auto (`.bvmrc` support) | Manual / `.nvmrc` | Auto |
| **Isolation** | **Full (`BUN_INSTALL` injection)** | Partial (PATH manipulation) | Varies |
| **China Optimization**| **Native (NPM Mirror Auto-switch)**| Manual (Mirror env vars) | Manual configuration |

## 6. Key Selling Points for README
1.  **Fastest Start**: No shell sourcing lag.
2.  **Most Stable**: Bunker architecture prevents "breaking the tool used to fix the tool".
3.  **Best Isolation**: Global packages never leak between versions.
4.  **China Friendly**: Out-of-the-box speed for Chinese users.
