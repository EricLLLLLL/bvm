# Track Specification: Fix Installation Path Conflict (Robust Cleanup)

## 1. Overview
修复在 Windows (install.ps1) 和 Unix (install.sh) 安装/重装过程中，由于 `~/.bvm/runtime/current` 路径已存在非空冲突目录，导致无法创建 Junction/Symlink 的问题。同时明确 `upgrade` 逻辑不涉及运行时更新。

## 2. 目标与范围
- **目标**: 确保安装脚本在创建关键链接路径前，能够静默且强力地清理任何已存在的冲突路径。
- **范围**: 
  - 修改 `install.ps1` (Windows)：处理 `DirectoryNotEmpty` 报错。
  - 修改 `install.sh` (Unix)：增加等效的强力清理逻辑。
- **架构约束**: 
  - `bvm upgrade` 命令应仅升级 BVM 核心源码，不应改动或尝试重新创建运行时链接。

## 3. 功能要求
- **Windows (install.ps1) 逻辑优化**:
  - 在执行 `New-Item -ItemType Junction -Path $CURRENT_LINK` 之前，增加检查：
    - 如果该路径已存在，无论是文件夹、坏链还是文件，均执行 `Remove-Item -Recurse -Force`。
- **Unix (install.sh) 逻辑优化**:
  - 在执行 `ln -sf` 创建 `current` 链接前，显式执行 `rm -rf "${BVM_RUNTIME_DIR}/current"`。
- **原子化保障**: 
  - 确保清理操作是“先彻底删、再重新连”，不依赖系统的 `Force` 覆盖能力（因为 `Force` 在处理非空目录时会失败）。

## 4. 验收标准 (Acceptance Criteria)
- [ ] **冲突容错**: 手动在 `~/.bvm/runtime/current` 创建一个存放了文件的普通文件夹。运行安装脚本后，该文件夹应被成功替换为指向正确运行时的链接，且安装不报错。
- [ ] **幂等性**: 多次运行安装脚本，不会因为路径已存在而导致中断。
- [ ] **Upgrade 隔离**: 验证执行 `bvm upgrade` 时，`~/.bvm/runtime/current` 的修改时间（mtime）不应发生变化（即未被触动）。

## 5. 超出范围 (Out of Scope)
- 自动迁移旧的运行时数据。
- 修复第三方安全软件锁死目录导致的权限错误。
