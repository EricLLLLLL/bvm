---
title: For AI Clients
description: Quick integration guide for Claude/Copilot/Cursor/Codex style AI clients
---

# For AI Clients

This page is the fastest path to let AI clients install and use BVM correctly with repeatable behavior.

## 1) Give AI the installer playbook

Pass this link directly to your AI client:

`https://raw.githubusercontent.com/EricLLLLLL/bvm/main/install.md`

That guide tells the AI to:

- install BVM
- run `bvm setup`
- verify with `bvm doctor`
- install and switch Bun version
- generate a reusable local skill file

## 2) Minimal command set AI should use

```bash
bvm install latest
bvm use latest
bvm default latest
bvm doctor
bvm current
```

## 3) Project-level pinning for reliable runs

Use `.bvmrc` in repo root:

```bash
echo "1.3.6" > .bvmrc
```

Then AI should execute:

```bash
bvm use "$(cat .bvmrc)"
```

## 4) Guardrails to avoid common AI mistakes

- Do not assume global packages are shared across Bun versions.
- If command resolution is wrong, run `bvm setup` first.
- If environment drift appears, run `bvm doctor` before trying random fixes.
- Prefer full version strings (for example `1.3.6`) when installing.

## 5) LLM context endpoints

- Index: `/llms.txt`
- Full context: `/llms-full.txt`
- Markdown mirrors: `/<page>/index.md` (for example `/guide/getting-started/index.md`)

