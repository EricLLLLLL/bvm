# BVM Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 修复 BVM 的路径安全、Windows shim、下载完整性、CLI 错误语义、类型检查、测试与发布门禁，并收口废弃站点和生成物。

**Architecture:** 保持 CLI 单 bundle 和现有安装布局，新增少量纯函数作为安全边界；跨语言安装器通过相同 SHA-512 SRI 契约和静态契约测试保持一致。发布流程拆成验证与发布两层，文档唯一 source of truth 保留 VitePress。

**Tech Stack:** TypeScript、Bun、Bun Test、Node crypto、Bash、PowerShell、GitHub Actions、VitePress、Cloudflare Pages Functions。

## Global Constraints

- 不改变 `~/.bvm` 目录布局、合法 alias 文件格式和已有命令名称。
- 不增加 CLI 运行时依赖。
- 保护当前工作区中用户已有的网站 SEO/GEO 改动。
- 不创建分支、commit、push 或 pull request。
- 每个行为修改先运行失败测试，再实现最小修复。
- 每个待修改 symbol 先通过 `rg` 审计直接调用点并记录风险范围。

---

### Task 1: 建立调用点与工作区基线

**Files:**
- Inspect: all files listed by current `git status --short`

**Interfaces:**
- Consumes: current repository and approved design.
- Produces: impact report for `createAlias`, `removeAlias`, `resolveLocalVersion`, `fixWindowsShims`, `downloadFileWithProgress`, `findBunDownloadUrl`, `App.run`, `cacheCommand`.

- [ ] **Step 1: 审计待修改 symbols 的直接调用点**

Run exact call-site searches:

```bash
rg -n "createAlias|removeAlias|resolveLocalVersion|fixWindowsShims|downloadFileWithProgress|findBunDownloadUrl|cacheCommand" src test
```

Expected: complete direct caller list and risk classification before edits.

- [ ] **Step 2: 保存工作区边界**

Run:

```bash
git status --short
git diff -- website
```

Expected: user website edits identified and excluded from destructive cleanup.

---

### Task 2: Alias 路径安全与 Windows shim

**Files:**
- Create: `src/utils/alias-name.ts`
- Create: `test/alias_name.test.ts`
- Modify: `src/commands/alias.ts`
- Modify: `src/commands/unalias.ts`
- Modify: `src/commands/version.ts`
- Modify: `src/commands/ls.ts`
- Modify: `src/commands/doctor.ts`
- Modify: `src/utils/windows-shim-fixer.ts`
- Modify: `test/windows_shim_fixer.test.ts`

**Interfaces:**
- Produces: `validateAliasName(name: string): string`; `resolveAliasPath(aliasDir: string, name: string): string`; `fixWindowsShims(binDir: string): Promise<ShimFixResult>`.
- `ShimFixResult` is `{ fixed: string[]; failed: Array<{ path: string; error: string }> }`.

- [ ] **Step 1: 写 alias 越界失败测试**

Test cases call `validateAliasName` and `resolveAliasPath` with `../escape`, `/tmp/escape`, `a/b`, `a\\b`, empty input, and valid `default`, `lts-1`, `team_runtime`.

- [ ] **Step 2: 验证 RED**

Run:

```bash
/Users/leiliao/.bun/bin/bun test test/alias_name.test.ts
```

Expected: FAIL because module/functions do not exist.

- [ ] **Step 3: 实现最小 alias validator**

Implementation contract:

```ts
const ALIAS_NAME_PATTERN = /^[A-Za-z0-9_-]+$/;
export function validateAliasName(name: string): string;
export function resolveAliasPath(aliasDir: string, name: string): string;
```

Invalid input throws `Invalid alias name '<name>'. Use only letters, numbers, '_' or '-'.` before filesystem access.

- [ ] **Step 4: 在所有 alias 文件入口复用 validator**

Replace raw `join(BVM_ALIAS_DIR, userValue)` in create, remove, resolve, list and doctor paths with `resolveAliasPath`. Directory scans validate entries and skip invalid legacy filenames with a diagnostic rather than traversing them.

- [ ] **Step 5: 写 PowerShell shim RED 测试**

Add `.ps1` fixture containing `$PSScriptRoot\..\node_modules\pkg\cli.js`; expect absolute node_modules path and result.fixed to contain file.

- [ ] **Step 6: 验证 RED 后修复实现**

Run the single test before and after implementation. Initialize `let newContent = content`, perform cumulative replacements, preserve original file on failure, and return structured result.

- [ ] **Step 7: 运行相关测试**

```bash
/Users/leiliao/.bun/bin/bun test test/alias_name.test.ts test/windows_shim_fixer.test.ts test/integration.test.ts test/doctor_checks.test.ts
```

Expected: all pass.

---

### Task 3: CLI 参数和退出码契约

**Files:**
- Create: `src/cli/app.ts`
- Create: `test/cli_router.test.ts`
- Modify: `src/index.ts`
- Modify: `src/commands/cache.ts`
- Modify: `test/integration.test.ts`

**Interfaces:**
- Produces: `CliApp` with `command()`, registered boolean options, `run(argv: string[]): Promise<number>` and help rendering.
- Command handlers keep `(args, flags)` behavior with `Record<string, boolean | string | undefined>`.

- [ ] **Step 1: 写 router RED 测试**

Cover unknown command exit 1, unknown option exit 1, `--help`/`--version` exit 0, registered `--fix-path` and `-y` parsed, and unknown cache action rejecting.

- [ ] **Step 2: 验证 RED**

```bash
/Users/leiliao/.bun/bin/bun test test/cli_router.test.ts test/integration.test.ts
```

Expected: existing unknown-command assertion fails because it currently expects zero; new module missing.

- [ ] **Step 3: 提取可测试 router 并返回 exit code**

`src/index.ts` only wires commands and calls `process.exit(await app.run(Bun.argv.slice(2)))`. The router throws or returns 1 for invalid input and does not call `process.exit` internally.

- [ ] **Step 4: 让 cache 未知 action 抛错**

Replace print-only branch with `throw new Error('Unknown cache command: ...')` so the top-level contract returns 1.

- [ ] **Step 5: 运行 router 与集成测试**

Expected: all pass and help text remains unchanged apart from error status.

---

### Task 4: SHA-512 SRI 下载校验

**Files:**
- Create: `src/utils/integrity.ts`
- Create: `test/integrity.test.ts`
- Modify: `src/api.ts`
- Modify: `src/commands/install.ts`
- Modify: `test/download_robustness.test.ts`
- Modify: `scripts/postinstall.js`
- Modify: `install.sh`
- Modify: `install.ps1`
- Create: `test/install_integrity_contract.test.ts`
- Modify: `scripts/fingerprint.ts`
- Modify: `test/fingerprint.test.ts`

**Interfaces:**
- Produces: `parseSri(integrity: string): { algorithm: 'sha512'; digest: string }`; `verifyFileIntegrity(path: string, integrity: string): Promise<void>`.
- `findBunDownloadUrl()` returns `{ url, mirrorUrl?, foundVersion, integrity }`.
- `downloadFileWithProgress()` accepts expected integrity and only returns after verification.

- [ ] **Step 1: 写 SRI RED 测试**

Cover valid sha512, malformed SRI, unsupported algorithm, matching file, mismatched file and missing integrity.

- [ ] **Step 2: 验证 RED 并实现纯函数**

Use `createHash('sha512')` and constant-time comparison via `timingSafeEqual`; reject unsupported or missing integrity.

- [ ] **Step 3: 扩展 npm 元数据获取**

For exact Bun platform package/version, fetch package metadata and return `dist.tarball` plus `dist.integrity`. Do not construct a URL without metadata when installing.

- [ ] **Step 4: 写 download RED 测试并接入校验**

The test serves known bytes, first supplies wrong SRI and expects temp cleanup, then correct SRI and expects success.

- [ ] **Step 5: 为三种安装器加入同一契约**

`postinstall.js` uses Node crypto; `install.ps1` uses SHA512 plus Base64; `install.sh` uses OpenSSL. Each installer fetches exact package metadata before tarball download and fails closed.

- [ ] **Step 6: 添加静态契约测试**

Assert all installers contain SHA-512 verification, metadata lookup, mismatch hard-failure and cleanup behavior.

- [ ] **Step 7: 将发布 fingerprint 改为 SHA-256**

Rename package field to `bvm_artifact_sha256`, generate 64-hex digests, and update tests. This manifest is audit metadata, not installer trust input.

- [ ] **Step 8: 运行完整性相关测试**

```bash
/Users/leiliao/.bun/bin/bun test test/integrity.test.ts test/download_robustness.test.ts test/install_integrity_contract.test.ts test/fingerprint.test.ts
```

Expected: all pass.

---

### Task 5: 不可变网站安装入口和 website 类型检查

**Files:**
- Modify: `website/functions/install.ts`
- Create or Modify: `website/test/install-function.test.ts`
- Modify: `website/tsconfig.json`
- Modify: `website/remotion-bvm/src/scenes/bvm-install-methods.tsx`
- Modify: `website/package.json`

**Interfaces:**
- Pages function resolves npm latest version, fetches `https://raw.githubusercontent.com/EricLLLLLL/bvm/v<version>/<script>`, and returns `X-BVM-Version`.

- [ ] **Step 1: 写 Pages function RED 测试**

Inject/mock fetch responses for npm dist-tags and tagged script; assert no `main` URL and no registry string replacement.

- [ ] **Step 2: 验证 RED 后实现 tagged fetch**

Use explicit local Pages context types if Cloudflare worker types are not installed; catch `unknown` safely and return 502 for upstream failures.

- [ ] **Step 3: 修复 website TypeScript boundaries**

Use type-only `TerminalTheme` import and scope tsconfig includes so VitePress, function and Remotion compile without leaking incompatible globals.

- [ ] **Step 4: 运行 website 测试、类型检查和主站构建**

```bash
cd website
/Users/leiliao/.bun/bin/bun test test/*.test.ts
/Users/leiliao/.bun/bin/bun x tsc --noEmit
./node_modules/.bin/vitepress build docs --outDir /tmp/bvm-vitepress-hardening
```

Expected: all exit 0 while preserving existing SEO/GEO content edits.

---

### Task 6: 类型系统、测试可重复性和 CI/Release 门禁

**Files:**
- Modify: `tsconfig.json`
- Delete: `src/APITester.tsx`, `src/App.tsx`, `src/frontend.tsx`, `src/index.css`, `src/index.html`, `src/react.svg`, `src/logo.svg`
- Modify: `src/utils/network-utils.ts`
- Modify: `src/templates/init-scripts.ts` if required for typed text imports
- Modify: `test/setup_npm.test.ts`
- Modify: `test/fingerprint.test.ts`
- Modify: `test/e2e/install-ps1.test.ts`
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/auto-release.yml`
- Modify: `scripts/check-integrity.ts`
- Modify: `scripts/release.ts`
- Modify: `package.json`

**Interfaces:**
- Root scripts produce `typecheck`, `test:unit`, `test:isolated`, `test:e2e`, `test:coverage`, `verify`.
- Release workflow calls the same `verify` contract and never force-updates a tag.

- [ ] **Step 1: 写/调整测试使子进程使用 `process.execPath`**

Replace `spawnSync('bun', ...)` and `execa('bun', ...)` in deterministic tests. Add platform guard to PowerShell E2E.

- [ ] **Step 2: 验证调整后的测试在当前 PATH 下通过**

Run tests with a PATH that intentionally lacks `bun`; child processes must still execute through `process.execPath`.

- [ ] **Step 3: 收窄 tsconfig 并修复类型错误**

Remove JSX configuration and dead frontend sources; use `RequestInit & { timeout?: number }`; type template imports explicitly without `@ts-ignore` where Bun supports text imports.

- [ ] **Step 4: 增加 CI matrix**

Pin Bun `1.3.11`; run root typecheck and applicable test tiers on `ubuntu-latest`, `macos-latest`, `windows-latest`. Ubuntu additionally runs coverage, build and pack dry-run.

- [ ] **Step 5: 加固 release workflow**

Run/require verification before publish, use non-forced annotated tag creation, fail if tag exists at another commit, and update actions to maintained major versions.

- [ ] **Step 6: 让本地 release 不再写 Git**

Remove `git add` and `git commit` calls. If generated files change, print exact paths and stop for user review; keep version preparation as filesystem-only behavior.

- [ ] **Step 7: 运行类型检查和测试层级**

Expected: root typecheck, unit, isolated and current-platform E2E pass.

---

### Task 7: 文档 source of truth、许可证和仓库卫生

**Files:**
- Preserve/verify: `LICENSE`
- Delete: `website-starlight/`
- Delete from Git: `website/docs/.vitepress/cache/`
- Delete from Git: `.playwright-mcp/`
- Modify: `.gitignore`
- Modify: `website/.gitignore`
- Modify: `README.md` and `README.zh-CN.md` only if license links need correction

**Interfaces:**
- VitePress under `website/docs` remains the only documentation build.

- [ ] **Step 1: 验证现有 LICENSE**

Expected: standard MIT text names the current copyright holder. Reuse without overwriting when valid.

- [ ] **Step 2: 确认 Starlight 无引用后删除**

Run `rg -n "website-starlight"` excluding its own directory, then remove the unused scaffold and dependency tree from version control.

- [ ] **Step 3: 清理 tracked caches/logs and add ignore rules**

Do not delete current user `output/`; add ignore rule so it remains local.

- [ ] **Step 4: 验证 VitePress build and links**

Expected: docs build succeeds and LICENSE URLs resolve to repository file path.

---

### Task 8: 覆盖率、构建、打包与范围审计

**Files:**
- Modify tests under `test/` only where uncovered core branches require deterministic cases.
- Modify `package.json` coverage command/exclusions without excluding executable business logic.

**Interfaces:**
- Produces fresh verification evidence and final risk report.

- [ ] **Step 1: 运行覆盖率并补齐核心分支测试**

Iterate RED/GREEN tests for alias, integrity, router, setup/use/install error paths until core executable TypeScript line coverage is at least 80%. Static template modules may be excluded; commands and utilities may not be excluded merely to raise the number.

- [ ] **Step 2: 运行完整验证命令**

```bash
/Users/leiliao/.bun/bin/bun x tsc --noEmit
/Users/leiliao/.bun/bin/bun test test/*.test.ts
/Users/leiliao/.bun/bin/bun test test/isolated/*.test.ts
/Users/leiliao/.bun/bin/bun test test/e2e/*.test.ts
/Users/leiliao/.bun/bin/bun test --coverage test/*.test.ts
/Users/leiliao/.bun/bin/bun run scripts/check-templates.ts
/Users/leiliao/.bun/bin/bun build src/index.ts --target=bun --outfile /tmp/bvm-hardening-dist.js --minify
npm pack --dry-run --json --ignore-scripts
```

- [ ] **Step 3: 运行 website 验证**

Run website tests, typecheck and VitePress build using an outDir under `/tmp`.

- [ ] **Step 4: 运行最终范围审计**

Use `git diff --check`, `git diff --stat`, exact caller searches, and compare changed paths against this plan.

- [ ] **Step 5: 最终工作区检查**

Ensure user pre-existing SEO/GEO edits and `output/` contents remain present, no temporary test directories remain, and no commit or push occurred.
