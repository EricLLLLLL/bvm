# Troubleshooting

## 1) Global installs are not isolated (tools appear after switching versions)

If `bun install -g` creates or uses `~/.bun`, it usually means your shell is not picking up **BVM shims first**.

### Fix

1. Run:

```bash
bvm setup
```

2. Restart your terminal (or reload your shell config).

3. Verify:

```bash
which bun
```

Expected: it should point to `~/.bvm/shims/bun` (macOS/Linux).

## 2) On Windows, `which` is not available

Use PowerShell built-ins:

```powershell
Get-Command bun
Get-Command cowsay
where.exe bun
where.exe cowsay
```

Expected: `where.exe bun` should list `...\.bvm\shims\bun.cmd` before `...\.bvm\current\bin\bun.exe`.

## 3) I installed a global tool but it is not found

BVM isolates global tools **per Bun version**. After switching versions, a global tool may be missing by design.

### What to do

- Reinstall it under the active version:

```bash
bun install -g <pkg>
```

- If your shell caches commands, refresh it:
  - macOS/Linux: open a new terminal, or run `hash -r`
  - Windows PowerShell: open a new PowerShell

If needed, you can manually regenerate shims:

```bash
bvm rehash
```

## 4) PowerShell script execution is blocked

If `install.ps1` fails due to policy restrictions, run this in PowerShell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then retry the installer.

