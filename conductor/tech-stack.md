# Tech Stack

## Core Technologies
- **Language:** TypeScript (v5+)
- **Runtime:** Bun (Latest Stable)
- **Task Runner:** npm / npx (invoking Bun via `npx bun run ...`)

## Scripts & Installation
- **Unix:** Bash (`install.sh`)
- **Windows:** PowerShell (`install.ps1`)

## Dependencies
- **Production:** Zero-dependency (Utilizes native Bun APIs)
- **Dev:**
  - `@types/bun`
  - `@types/node` (Compatibility)
  - `bun` (Dev dependency)
  - `typescript`

## Testing
- **Framework:** `bun test`