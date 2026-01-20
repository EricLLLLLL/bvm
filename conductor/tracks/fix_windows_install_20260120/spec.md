# Track Specification: Fix Windows Installation & Simplify Coexistence Logic (Unified)

## 1. 概述 (Overview)
用户在 Windows 上使用 BVM 安装 Bun 时遇到了由于“官方 Bun 已安装”导致的冲突和文件系统错误 (`EEXIST`)。目前的逻辑试图接管或迁移官方环境，导致复杂性过高。本 Track 旨在统一三端（Shell, PowerShell, NPM）的安装逻辑，**移除**所有针对官方 Bun 的侵入性操作，实现纯粹的 PATH 优先级共存。

## 2. 功能需求 (Functional Requirements)

### 2.1 移除侵入性逻辑 (Remove Invasive Logic)
- **目标**：彻底清理之前版本中试图“接管”官方 Bun 的代码。
- **具体操作**：
    - **删除**：检测到官方 Bun 时的“迁移”或“复制”全局包的逻辑。
    - **删除**：任何试图卸载、删除、重命名或移动官方 Bun 目录的操作。
    - **删除**：相关的交互式询问（例如“是否迁移旧版本？”）。

### 2.2 统一的共存策略 (Unified Coexistence Strategy)
- **策略**：严格隔离。
    - **禁止**：不再检测、警告、移动、重命名或删除官方 Bun 安装（`~/.bun`）。
    - **机制**：完全依赖 `PATH` 环境变量的优先级（BVM 路径必须置于官方路径之前）。

### 2.3 统一的幂等性与错误处理 (Unified Idempotency)
- **适用于**：`install.sh`, `install.ps1`, `postinstall.js`。
- **行为**：
    - **目录创建**：使用 `mkdir -p` / `New-Item -Force`，确保目录已存在时不报错。
    - **文件写入**：如果非关键文件已存在，静默覆盖或跳过，杜绝 `EEXIST` 崩溃。

### 2.4 统一的 PATH 配置 (Unified PATH Configuration)
- **自动化**：尽最大努力自动写入 Profile。
- **静默失败**：权限不足时不中断流程。

## 3. 非功能需求 (Non-Functional Requirements)
- **代码一致性**：三个入口的逻辑流程保持同步。

## 4. 验收标准 (Acceptance Criteria)
- [ ] **Windows (install.ps1)**: 重复运行不报错，不干扰官方 Bun。
- [ ] **Unix (install.sh)**: 重复运行不报错，不干扰官方 Bun。
- [ ] **NPM (postinstall.js)**: `npm install -g` 成功，不干扰官方 Bun。
- [ ] **路径验证**: `which bun` / `Get-Command bun` 必须指向 BVM 路径。
- [ ] **代码审计**: 确认代码库中不再包含任何针对 `.bun` 官方目录的写操作（Write/Move/Delete）。

## 5. 超出范围 (Out of Scope)
- 提供官方 Bun 卸载工具。
- 自动导入旧的全局包（此功能已被明确移除）。
