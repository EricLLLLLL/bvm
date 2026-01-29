### Track Specification: fix_windows_bunx_20260128

#### Overview
修复 BVM 在 Windows 环境下 `bunx` 命令失效的问题。

**当前问题证据（用户截图/日志）：**
```powershell
PS C:\Users\steph\OneDrive\Desktop> bunx
Bun is a fast JavaScript runtime... (输出了帮助信息，未识别为 bunx)
PS C:\Users\steph\OneDrive\Desktop> bunx skills add microsoft/PowerToys
error: Script not found "skills" (身份识别错误导致路由到了 bun run 逻辑)
```

#### Functional Requirements
1.  **显式路由逻辑**：修改 Windows 垫片（Shim）逻辑，将 `bunx <args>` 显式路由为 `bun x <args>`，确保 100% 触发 Bun 的扩展包运行逻辑。
2.  **物理文件补全**：在安装 Bun 运行时或执行 `bvm setup` 时，确保版本 bin 目录下存在 `bunx.exe`。
3.  **安装脚本自愈**：
    *   更新 `install.ps1`，在安装新版本或检测到系统 Bun 时，自动补全缺失的 `bunx.exe`。
    *   更新 `install.sh`，同步确保 Unix 环境下的 `bunx` 软链接正确。
4.  **环境一键修复**：通过 `npm i . -g` 或 `bvm setup` 即可自动修复所有已安装版本的 `bunx` 坏道。
5.  **版本切换支持**：`bunx` 必须严格遵循 `.bvmrc` 或全局默认版本的切换逻辑。

#### Acceptance Criteria
- [ ] **身份验证**：在 Windows 中运行 `bunx --version` 返回版本号，不再返回 Bun 的通用帮助信息。
- [ ] **功能验证**：运行 `bunx skills add ...` 能正确识别 `skills` 为包名并执行，不再报 "Script not found"。
- [ ] **物理验证**：重新运行 `bvm setup` 后，所有已安装版本的 `bin` 目录下均出现 `bunx` 文件。
- [ ] **安装验证**：运行 `install.sh` 或 `install.ps1` 完成后，新安装的版本自带可运行的 `bunx`。
