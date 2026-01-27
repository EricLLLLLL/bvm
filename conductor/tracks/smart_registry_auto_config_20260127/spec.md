# Specification: Smart Registry Auto-Configuration (No-Magic Bun Install)

## 1. Background
Bun users in mainland China often face slow download speeds or connection timeouts when running `bun install` due to the official npm registry being blocked or throttled. "Magic" (VPNs/Proxies) is a high barrier to entry. BVM aims to lower this barrier by providing an out-of-the-box solution that automatically optimizes network settings based on the user's location.

## 2. Objectives
- **Zero Configuration**: Users should not need to manually edit `.npmrc` or `bunfig.toml` to get fast install speeds.
- **Smart Detection**: Automatically detect if the user is in a region that requires a mirror (e.g., Mainland China).
- **Non-Destructive**: Respect existing user configurations. Do not overwrite if a custom registry is already set.
- **Transparency**: Inform the user when auto-configuration is applied.

## 3. Implementation Details

### 3.1 Network Detection
- Implement a utility to detect network conditions.
- **Method**: Race specific URLs (e.g., `registry.npmjs.org` vs `registry.npmmirror.com`) or check public IP geolocation (via a lightweight API or DNS check).
- **Preference**: Use a race strategy (Head request latency) to determine the fastest registry, rather than strict IP geolocation, as this covers more edge cases (e.g., VPN users).

### 3.2 Configuration Management (`bunfig.toml`)
- **Target**: Global `bunfig.toml` (usually at `~/.bunfig.toml` or similar, depending on OS) or a per-version config if BVM isolates it.
- **Action**: If `registry.npmmirror.com` is significantly faster (> 2x) or the official registry is unreachable:
    1. Check if `bunfig.toml` exists.
    2. Read current config.
    3. If `install.registry` is not set, set it to the fast mirror.
    4. Write back the config.

### 3.3 Integration Points
- **Post-Install Hook**: After `bvm install <version>` succeeds, run the detection and auto-config logic.
- **Explicit Command**: Add `bvm doctor` or `bvm speed` to trigger this check manually.

### 3.4 User Experience
- **Output**:
  ```
  [BVM] Detected slow connection to official registry.
  [BVM] Auto-configured global bunfig.toml to use npmmirror.com for better performance.
  [BVM] (You can revert this by editing ~/.bunfig.toml)
  ```

## 4. Constraints
- Must function correctly on Windows, macOS, and Linux.
- Must not block the installation process for too long (set reasonable timeouts).
- Must handle read-only file system errors gracefully.
