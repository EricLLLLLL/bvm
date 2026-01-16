# Track Specification: Hotfix - Missing Shim Build Artifacts

## 概览 (Overview)
当前的发布工作流失败，错误为 `fatal: pathspec 'dist/bvm-shim.sh' did not match any files`。原因是在执行发布前的构建步骤中，缺少了生成静态 Shim 文件 (`bvm-shim.sh` 和 `bvm-shim.js`) 的环节。`bun build` 仅处理了 `index.ts`，导致 `dist/` 目录中缺失必要的 Shim 脚本，进而导致 git add 失败和安装脚本无法下载这些资源。本任务旨在修复构建脚本，确保所有发布工件都被正确生成。

## 功能要求 (Functional Requirements)

1.  **构建脚本修复 (Build Script Fix)**:
    -   创建或更新构建脚本（如 `scripts/build-shims.ts` 或集成到 `scripts/release.ts` 中）。
    -   该脚本必须从 `src/templates/` 中读取 Shim 模板 (`bvm-shim.sh`, `bvm-shim.js`)。
    -   将它们写入 `dist/` 目录。
    -   确保文件权限正确（如 `bvm-shim.sh` 需要可执行权限）。

2.  **发布流程集成 (Workflow Integration)**:
    -   确保在 GitHub Actions 的发布流程中，在 `git add` 之前调用此构建脚本。
    -   或者，更新 `package.json` 的 `build` 命令，使其包含 Shim 生成步骤（例如：`bun build ... && bun run scripts/build-shims.ts`）。

## 非功能性要求 (Non-Functional Requirements)
-   **一致性**: `dist/` 中的 Shim 内容必须与 `src/templates` 中的源码保持一致。
-   **零依赖**: 生成过程仅依赖 `bun` 或 `node` 标准库，不引入额外工具。

## 验收标准 (Acceptance Criteria)
-   [ ] 运行 `npm run build` 后，`dist/` 目录下必须存在 `bvm-shim.sh` 和 `bvm-shim.js`。
-   [ ] 本地运行发布脚本或 git add 操作不再报错。
-   [ ] 验证 `dist/bvm-shim.sh` 具有正确的内容。
