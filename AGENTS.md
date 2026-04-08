# Repository Guidelines

## 项目结构与模块组织
CLI 核心和跨平台逻辑集中在 `src/`，其中 `src/commands/*` 以动词命名拆分每个子命令，`src/api.ts`、`src/constants.ts`、`src/utils.ts` 为共享依赖；`src/bvm-init.*` 和 `src/rc.ts` 负责 shell 初始化片段。安装脚本位于仓库根目录的 `install.sh`，用于一键引导。所有自动化测试存于 `test/`，按运行层级拆分为 `api.test.ts` 与 `integration.test.ts`。

## 构建、测试与开发命令
- `bun install`：同步依赖，保持 Bun 和 npm lockfile 一致。
- `bun run src/index.ts` 或 `npm run dev`：在本地直接使用 ts-node + Bun 执行 CLI，便于断点与输出调试。
- `bun build src/index.ts --compile --outfile bvm`：生成零依赖二进制，请确保在 macOS/Linux/Windows 上分别构建并上传，对应体系架构。
- `bun test test/*.ts` 或 `bun test --coverage`：运行快速单测及覆盖率，CI 入口保持一致。

## 编码风格与命名约定
整体采用 TypeScript 严格模式（`tsconfig.json` 中 `strict: true`）。保持两空格缩进、单引号字符串、顶层 `import` 排序为内建、第三方、本地模块。新命令必须在 `src/commands/<verb>.ts` 中实现并在 `src/index.ts` 注册，同时提供纯函数封装，便于单测替换。统一使用 `chalk` 与 `ora` 管理输出，避免直接 `console.log`。

## 测试指南
利用 Bun 内建测试框架，文件命名遵循 `<feature>.test.ts`。API 层 mocked I/O，集成层可通过 `BVM_DIR` 临时目录验证真实安装流程。新增功能需至少包含 happy-path 与错误支路，并在 PR 中粘贴 `bun test --coverage` 摘要，目标是保持主要命令覆盖率 >80%。

## 提交与 PR 规范
历史记录采用 `type: subject`（如 `feat: implement upgrade command`，`docs:`、`fix:` 等），提交信息要求祈使句。PR 需包含：动机背景、关键更改列表、测试输出、关联 issue/讨论、涉及终端截图（若 CLI 输出改动）。若触及安装脚本或 shell 片段，需说明已在 bash/zsh/fish 上验证。

## 安全与配置提示
命令行大量接触用户文件系统，务必复查路径拼接并尊重 `BVM_DIR` 等目录约束，不要写入未声明目录。网络请求统一通过 `src/api.ts` 的封装逻辑，确保按现有镜像策略执行。任何需要管理员权限的说明必须在文档与 CLI 提示中明确标注，遵循最小权限原则。

<!-- gitnexus:start -->
# GitNexus — Code Intelligence

This project is indexed by GitNexus as **bvm** (1768 symbols, 3108 relationships, 128 execution flows). Use the GitNexus MCP tools to understand code, assess impact, and navigate safely.

> If any GitNexus tool warns the index is stale, run `npx gitnexus analyze` in terminal first.

## Always Do

- **MUST run impact analysis before editing any symbol.** Before modifying a function, class, or method, run `gitnexus_impact({target: "symbolName", direction: "upstream"})` and report the blast radius (direct callers, affected processes, risk level) to the user.
- **MUST run `gitnexus_detect_changes()` before committing** to verify your changes only affect expected symbols and execution flows.
- **MUST warn the user** if impact analysis returns HIGH or CRITICAL risk before proceeding with edits.
- When exploring unfamiliar code, use `gitnexus_query({query: "concept"})` to find execution flows instead of grepping. It returns process-grouped results ranked by relevance.
- When you need full context on a specific symbol — callers, callees, which execution flows it participates in — use `gitnexus_context({name: "symbolName"})`.

## When Debugging

1. `gitnexus_query({query: "<error or symptom>"})` — find execution flows related to the issue
2. `gitnexus_context({name: "<suspect function>"})` — see all callers, callees, and process participation
3. `READ gitnexus://repo/bvm/process/{processName}` — trace the full execution flow step by step
4. For regressions: `gitnexus_detect_changes({scope: "compare", base_ref: "main"})` — see what your branch changed

## When Refactoring

- **Renaming**: MUST use `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` first. Review the preview — graph edits are safe, text_search edits need manual review. Then run with `dry_run: false`.
- **Extracting/Splitting**: MUST run `gitnexus_context({name: "target"})` to see all incoming/outgoing refs, then `gitnexus_impact({target: "target", direction: "upstream"})` to find all external callers before moving code.
- After any refactor: run `gitnexus_detect_changes({scope: "all"})` to verify only expected files changed.

## Never Do

- NEVER edit a function, class, or method without first running `gitnexus_impact` on it.
- NEVER ignore HIGH or CRITICAL risk warnings from impact analysis.
- NEVER rename symbols with find-and-replace — use `gitnexus_rename` which understands the call graph.
- NEVER commit changes without running `gitnexus_detect_changes()` to check affected scope.

## Tools Quick Reference

| Tool | When to use | Command |
|------|-------------|---------|
| `query` | Find code by concept | `gitnexus_query({query: "auth validation"})` |
| `context` | 360-degree view of one symbol | `gitnexus_context({name: "validateUser"})` |
| `impact` | Blast radius before editing | `gitnexus_impact({target: "X", direction: "upstream"})` |
| `detect_changes` | Pre-commit scope check | `gitnexus_detect_changes({scope: "staged"})` |
| `rename` | Safe multi-file rename | `gitnexus_rename({symbol_name: "old", new_name: "new", dry_run: true})` |
| `cypher` | Custom graph queries | `gitnexus_cypher({query: "MATCH ..."})` |

## Impact Risk Levels

| Depth | Meaning | Action |
|-------|---------|--------|
| d=1 | WILL BREAK — direct callers/importers | MUST update these |
| d=2 | LIKELY AFFECTED — indirect deps | Should test |
| d=3 | MAY NEED TESTING — transitive | Test if critical path |

## Resources

| Resource | Use for |
|----------|---------|
| `gitnexus://repo/bvm/context` | Codebase overview, check index freshness |
| `gitnexus://repo/bvm/clusters` | All functional areas |
| `gitnexus://repo/bvm/processes` | All execution flows |
| `gitnexus://repo/bvm/process/{name}` | Step-by-step execution trace |

## Self-Check Before Finishing

Before completing any code modification task, verify:
1. `gitnexus_impact` was run for all modified symbols
2. No HIGH/CRITICAL risk warnings were ignored
3. `gitnexus_detect_changes()` confirms changes match expected scope
4. All d=1 (WILL BREAK) dependents were updated

## Keeping the Index Fresh

After committing code changes, the GitNexus index becomes stale. Re-run analyze to update it:

```bash
npx gitnexus analyze
```

If the index previously included embeddings, preserve them by adding `--embeddings`:

```bash
npx gitnexus analyze --embeddings
```

To check whether embeddings exist, inspect `.gitnexus/meta.json` — the `stats.embeddings` field shows the count (0 means no embeddings). **Running analyze without `--embeddings` will delete any previously generated embeddings.**

> Claude Code users: A PostToolUse hook handles this automatically after `git commit` and `git merge`.

## CLI

| Task | Read this skill file |
|------|---------------------|
| Understand architecture / "How does X work?" | `.claude/skills/gitnexus/gitnexus-exploring/SKILL.md` |
| Blast radius / "What breaks if I change X?" | `.claude/skills/gitnexus/gitnexus-impact-analysis/SKILL.md` |
| Trace bugs / "Why is X failing?" | `.claude/skills/gitnexus/gitnexus-debugging/SKILL.md` |
| Rename / extract / split / refactor | `.claude/skills/gitnexus/gitnexus-refactoring/SKILL.md` |
| Tools, resources, schema reference | `.claude/skills/gitnexus/gitnexus-guide/SKILL.md` |
| Index, status, clean, wiki CLI commands | `.claude/skills/gitnexus/gitnexus-cli/SKILL.md` |

<!-- gitnexus:end -->
