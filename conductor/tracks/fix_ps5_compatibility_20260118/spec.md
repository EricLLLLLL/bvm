# Track Specification: Legacy PowerShell (v5.1) Compatibility Fix

## 1. Overview
修复 `install.ps1` 在 **Windows PowerShell 5.1** 环境下的崩溃问题。该问题由用户反馈，报错为 `MethodArgumentConversionInvalidCastArgument`，原因是脚本尝试在不支持的 .NET Framework 环境中调用 `Runtime.InteropServices.RuntimeInformation`。

## 2. 功能要求

### 2.1 OS 检测兼容性 (核心修复)
- **问题**: 使用 `[Runtime.InteropServices.RuntimeInformation]::IsOSPlatform` 在 .NET Framework (PS 5.1) 中会导致类型转换错误或方法未找到错误。
- **解决方案**: 
  - **版本嗅探**: 检查 `$PSVersionTable.PSVersion.Major`。
  - **分支逻辑**:
    - 如果版本 >= 6 (Core): 使用现有的 `IsOSPlatform`。
    - 如果版本 < 6 (Legacy): 使用 `$env:OS` 或 `System.Environment`，或者直接默认为 Windows（并打印提示）。

### 2.2 依赖检查与提示 (UX 优化)
- **问题**: Win7/旧版 Win10 可能缺失 `tar.exe`，导致解压静默失败。
- **解决方案**: 
  - 在下载前检查 `tar` 命令是否存在。
  - 如果缺失，抛出 **中文友好提示**:
    > "未检测到 tar 命令。请升级 Windows 10 (1809+) 或安装 Git Bash / 7-Zip。"

### 2.3 网络协议加固 (TLS 1.2)
- **要求**: 显式设置 `[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12` 以防止下载失败。

## 3. 验收标准
- [ ] **必须复现/验证**: 确认修复后的脚本在模拟的 PS 5.1 环境下不会调用崩溃的 API。
- [ ] 脚本能够正确识别 Windows 环境。
- [ ] 在缺失 `tar` 的环境下能够优雅报错而不是崩溃。

## 4. 超出范围
- 支持 PowerShell 2.0。
- 实现纯 PowerShell 的 `.tgz` 解压器。
