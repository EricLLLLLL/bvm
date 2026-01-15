# Implementation Plan: Project Architecture & Process Documentation

本计划旨在创建 `conductor/architecture.md`，为 BVM 项目提供深度架构文档，支持未来 Skill 的创建与 AI 自动化维护。

## Phase 1: 核心流程梳理与 Mermaid 建模
- [x] Task: 梳理安装脚本逻辑 (`install.sh` & `install.ps1`)
    - [x] 分析 `install.sh` 的环境检测、版本解析、下载、Shim 生成逻辑。
    - [x] 分析 `install.ps1` 的 Windows 特有逻辑（PowerShell Profile, `bvm.cmd`）。
    - [x] 编写对应的 Mermaid 流程图。
- [x] Task: 梳理命令实现流程 (CLI Router & Command logic)
    - [x] 分析 `src/index.ts` 的路由机制。
    - [x] 描绘从命令输入到执行的流转图（入口 -> Router -> 具体的 Command 类 -> Utils）。
- [x] Task: Conductor - User Manual Verification 'Phase 1: 核心流程梳理与 Mermaid 建模' (Protocol in workflow.md)

## Phase 2: 基础设施与方法论记录
- [x] Task: 整理测试策略与环境要求
    - [x] 文档化 Unit Tests 与 E2E Tests 的定位。
    - [x] 记录本地与 CI (`ci.yml`) 的运行命令、环境依赖（如 `pwsh`）。
- [x] Task: 整理发布流程与集成逻辑
    - [x] 分析 `auto-release.yml` 完整流水线。
    - [x] 使用 Mermaid 描绘从 Push/Tag 到 CDN 生效的闭环。
- [x] Task: 整理全球加速与镜像方法论
    - [x] 记录 BVM 的镜像源检测逻辑。
    - [x] 记录 jsDelivr 加速静态资源的路径规则。
- [x] Task: Conductor - User Manual Verification 'Phase 2: 基础设施与方法论记录' (Protocol in workflow.md)

## Phase 3: 文档集成与 Skill 准备
- [x] Task: 汇编 `conductor/architecture.md`
    - [x] 按照 Phase 1 & 2 的成果，使用中文编写完整的图文文档。
    - [x] 确保每个章节都有明确的文件路径引用，方便 AI 定位。
- [x] Task: 验证文档对 Skill 的适用性
    - [x] 模拟使用 `skill-creator` 工具，检查文档是否能作为有效的上下文。
- [x] Task: Conductor - User Manual Verification 'Phase 3: 文档集成与 Skill 准备' (Protocol in workflow.md)
