# Track Specification: Project Architecture & Process Documentation

## Overview
本任务旨在系统性地梳理和固化 BVM 项目的核心流程与架构信息，产出 `conductor/architecture.md`。
该文档不仅服务于人类开发者，更将作为后续创建 **BVM 维护 Skill (Gemini CLI Skill)** 的核心知识库素材。因此，文档需要采用“图文并茂”的形式，逻辑清晰、结构化强，便于 AI 解析和执行。

## Functional Requirements
创建并编写 `conductor/architecture.md`，文档需包含以下五个核心部分：

1.  **Installation Logic (`install.sh` & `install.ps1`)**
    *   **Mermaid 流程图**：详细描绘 Unix 和 Windows 安装脚本的执行决策树。
    *   **逻辑说明**：分步骤解释关键逻辑（环境检测、版本解析、下载、Shim 生成、Profile 修改），并注明对应的代码文件位置。

2.  **Command Implementation Flows**
    *   **架构图**：展示命令从 CLI 入口 -> Router -> 具体 Command -> Shim -> Runtime 的流转过程。
    *   **功能映射**：列出核心命令（`use`, `install` 等）与其实现逻辑的对应关系。

3.  **Testing Strategy & Environment**
    *   **测试金字塔**：说明 Unit vs E2E 的覆盖范围。
    *   **执行环境**：明确本地运行与 CI 环境（GitHub Actions）的配置差异及依赖（如 `pwsh`）。

4.  **Release Process & Integration**
    *   **CI/CD 流水线图**：展示 `auto-release.yml` 的触发条件、检查步骤、构建、发布及缓存清理流程。
    *   **耦合点说明**：明确 Release 生成的 Artifacts（dist 文件）如何被安装脚本消费。

5.  **Global CDN & Mirroring Methodology**
    *   **加速原理图**：展示用户请求如何被路由到最近的 CDN 或镜像源。
    *   **配置规则**：说明默认源与镜像源的切换逻辑。

## Non-Functional Requirements
*   **Skill-Ready Format**: 内容结构需清晰分块，适合作为 Skill 的 `<knowledge>` 或 `<instructions>` 素材。关键规则和路径应显式标出。
*   **Format**: Markdown，使用 Mermaid 绘制所有流程图。
*   **Language**: 中文。
*   **Consistency**: 必须基于当前代码库（`install.sh`, `src/`, `.github/` 等）的实际逻辑编写，确保准确性。

## Acceptance Criteria
*   `conductor/architecture.md` 文件已创建。
*   包含 5 个核心板块，每个板块均包含 Mermaid 图表和详细文本说明。
*   文档结构清晰，可直接作为上下文输入给 `skill-creator` 使用。
